# Security Best Practices

## Overview

This document outlines security best practices for deploying and maintaining Sky-Cybernet in production.

## Environment Security

### 1. Environment Variables

**Never commit sensitive data:**
- ✅ Use `.env` files (gitignored)
- ✅ Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- ❌ Don't hardcode credentials in code
- ❌ Don't commit `.env` files to version control

**Strong Secrets Generation:**
```bash
# Generate strong cookie secret
openssl rand -base64 32

# Generate strong password
openssl rand -base64 24
```

### 2. Database Security

**Connection Security:**
- Use SSL/TLS for database connections
- Implement connection pooling limits
- Use read-only credentials where possible
- Regular password rotation (every 90 days)

**PostgreSQL Security Checklist:**
```sql
-- Create dedicated user with limited permissions
CREATE USER app_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE skycybernet TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Revoke public schema access
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
```

**Best Practices:**
- Enable `pg_hba.conf` to restrict connections
- Use SSL certificates for authentication
- Regular backups with encryption
- Monitor for unusual query patterns

### 3. Redis Security

**Configuration (`redis.conf`):**
```conf
# Require authentication
requirepass your-strong-redis-password

# Bind to specific interface
bind 127.0.0.1

# Rename dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG-SECRET-NAME"

# Enable protected mode
protected-mode yes

# Disable dangerous commands
rename-command KEYS ""
```

## Application Security

### 1. Authentication & Authorization

**Password Security:**
- ✅ Use bcrypt for password hashing (already implemented)
- ✅ Minimum 8 characters, complexity requirements
- ✅ Rate limit login attempts
- ❌ Never store plaintext passwords
- ❌ Never log passwords

**Session Management:**
- Secure session cookies with HttpOnly, Secure, SameSite flags
- Implement session timeout (30 minutes inactivity)
- Use secure random session IDs
- Regular session cleanup

**Example (already in app/lib/auth.ts):**
```typescript
cookies().set('session', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### 2. Input Validation

**Prevent Injection Attacks:**
- ✅ Use Prisma ORM (parameterized queries)
- ✅ Validate all user inputs
- ✅ Sanitize HTML content
- ❌ Never construct SQL queries with string concatenation

**Validation Example:**
```typescript
// Validate username
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
if (!usernameRegex.test(username)) {
  throw new Error('Invalid username format');
}

// Sanitize content
import { sanitize } from 'isomorphic-dompurify';
const cleanContent = sanitize(userContent);
```

### 3. Cross-Site Scripting (XSS) Prevention

**Already Implemented:**
- Content Security Policy (CSP) headers in middleware
- React auto-escapes by default
- Sanitize user-generated content before rendering

**CSP Headers (in middleware.ts):**
```typescript
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
].join('; ');
```

### 4. Cross-Site Request Forgery (CSRF)

**Protection Measures:**
- SameSite cookie attribute (already implemented)
- Verify origin and referer headers
- Use anti-CSRF tokens for sensitive operations

**Implementation:**
```typescript
// In middleware or API routes
const origin = request.headers.get('origin');
const allowedOrigins = config.corsOrigin;

if (origin && !allowedOrigins.includes(origin)) {
  return new Response('Forbidden', { status: 403 });
}
```

### 5. Rate Limiting

**Already Implemented in `app/lib/ratelimit.ts`**

**Recommendations:**
- Login attempts: 5 per 15 minutes per IP
- API requests: 100 per minute per user
- File uploads: 10 per hour per user
- Stricter limits for unauthenticated users

**Enhanced Rate Limiting:**
```typescript
// Different limits for different endpoints
const limits = {
  '/api/auth/login': { max: 5, window: 15 * 60 * 1000 },
  '/api/posts': { max: 100, window: 60 * 1000 },
  '/api/upload': { max: 10, window: 60 * 60 * 1000 },
};
```

## Infrastructure Security

### 1. HTTPS/SSL Configuration

**Always use HTTPS in production:**
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers (already implemented)
- Regular certificate renewal
- Use TLS 1.2 or higher

**Nginx SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

### 2. Firewall Configuration

**Recommended Rules:**
```bash
# UFW (Ubuntu)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 443/tcp  # HTTPS
ufw allow 80/tcp   # HTTP (for Let's Encrypt)
ufw enable

# Deny direct access to database
ufw deny 5432/tcp from any
ufw allow 5432/tcp from 10.0.0.0/8  # Internal network only
```

### 3. Docker Security

**Best Practices:**
- Run containers as non-root user (already implemented)
- Use official base images
- Regular image updates
- Scan images for vulnerabilities
- Minimize image layers

**Security Scanning:**
```bash
# Scan Docker image for vulnerabilities
docker scan sky-cybernet:latest

# Or use Trivy
trivy image sky-cybernet:latest
```

### 4. Network Security

**Docker Network Isolation:**
```yaml
# Already implemented in docker-compose.yml
networks:
  app-network:
    driver: bridge
```

**Restrict Service Access:**
- Database and Redis should only be accessible from app container
- Use internal networks for service-to-service communication
- Expose only necessary ports

## File Upload Security

### 1. Upload Validation

**Already Implemented:**
- File type validation (MIME type checking)
- File size limits (10MB default)
- File count limits (4 per post)

**Enhanced Security:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

// Verify actual file type, not just extension
const buffer = await file.arrayBuffer();
const fileType = await fileTypeFromBuffer(Buffer.from(buffer));

if (!allowedTypes.includes(fileType?.mime)) {
  throw new Error('Invalid file type');
}
```

### 2. File Storage

**Best Practices:**
- Store uploads outside web root when possible
- Use object storage (S3) for production
- Generate unique filenames (prevent overwrites)
- Scan files for malware (ClamAV)

**S3 Security Configuration:**
```typescript
// Example S3 upload with security
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload with encryption
await s3.send(new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: uniqueFilename,
  Body: buffer,
  ContentType: fileType,
  ServerSideEncryption: 'AES256',
  ACL: 'private',
}));
```

## Dependency Security

### 1. Regular Updates

**Check for vulnerabilities:**
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### 2. Supply Chain Security

**Best Practices:**
- Use `package-lock.json` (committed)
- Regular dependency updates
- Review security advisories
- Use GitHub Dependabot

**GitHub Actions Security Check:**
```yaml
# Already in .github/workflows/ci-cd.yml
- name: Security audit
  run: npm audit --audit-level=moderate
```

## Monitoring & Incident Response

### 1. Security Monitoring

**Monitor for:**
- Failed login attempts (brute force)
- Unusual API usage patterns
- Large file uploads
- SQL injection attempts
- XSS attempts
- Privilege escalation attempts

**Alerting:**
```typescript
// In logger.ts, add security event logging
logger.security = (event: string, context: any) => {
  logger.warn(`SECURITY: ${event}`, context);
  
  // Send to security monitoring service
  if (isCriticalSecurityEvent(event)) {
    notifySecurityTeam(event, context);
  }
};
```

### 2. Incident Response Plan

**Steps:**
1. Detect and alert
2. Contain the incident
3. Investigate and document
4. Eradicate the threat
5. Recover and monitor
6. Post-incident review

### 3. Security Logging

**What to Log:**
- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures
- Security errors
- Configuration changes

**What NOT to Log:**
- Passwords (even hashed)
- Session tokens
- Credit card numbers
- Personal identifiable information (PII)

## Compliance & Privacy

### 1. Data Protection

**GDPR Requirements:**
- User consent for data collection
- Right to access data
- Right to delete data
- Data portability
- Breach notification (72 hours)

**Implementation:**
```typescript
// User data export
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      reactions: true,
      notifications: true,
    },
  });
  
  return sanitizeForExport(user);
}

// User data deletion
export async function deleteUserData(userId: string) {
  // Cascade delete already configured in Prisma schema
  await prisma.user.delete({ where: { id: userId } });
}
```

### 2. Data Encryption

**At Rest:**
- Database encryption (PostgreSQL TDE)
- Encrypted backups
- Encrypted file storage (S3 SSE)

**In Transit:**
- HTTPS/TLS for all connections
- SSL for database connections
- Encrypted Redis connections

## Security Checklist

### Pre-Deployment
- [ ] All environment variables set securely
- [ ] Strong passwords and secrets generated
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] File upload validation in place
- [ ] Database user has minimal required permissions
- [ ] Redis authentication enabled

### Post-Deployment
- [ ] Security monitoring active
- [ ] Error tracking configured (Sentry)
- [ ] Backup strategy tested
- [ ] Incident response plan documented
- [ ] Security logging reviewed
- [ ] Vulnerability scanning scheduled
- [ ] Regular update schedule established
- [ ] Security awareness training completed

### Ongoing
- [ ] Weekly: Review security logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing
- [ ] Continuous: Monitor security advisories

## Security Tools

### Recommended Tools
- **OWASP ZAP** - Web app security scanner
- **Snyk** - Dependency vulnerability scanning
- **Trivy** - Container security scanning
- **ClamAV** - Anti-virus for file uploads
- **fail2ban** - Intrusion prevention
- **ModSecurity** - Web application firewall

### Testing Commands
```bash
# Scan for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Scan Docker image
trivy image sky-cybernet:latest

# Test SSL configuration
nmap --script ssl-enum-ciphers -p 443 your-domain.com
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@your-domain.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge within 24 hours and provide updates every 72 hours.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Redis Security](https://redis.io/docs/manual/security/)
