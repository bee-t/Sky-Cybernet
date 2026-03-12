# Production Deployment Guide

## 🚀 Quick Start

This guide will help you deploy Sky-Cybernet to production.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional but recommended)

## Environment Configuration

### 1. Create Production Environment File

```bash
cp .env.example .env
```

### 2. Configure Required Variables

**Critical Variables (Must Set):**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Generate with: openssl rand -base64 32
COOKIE_SECRET=your-strong-random-secret-here

# PostgreSQL connection
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
DATABASE_DIRECT_URL=postgresql://user:password@host:5432/dbname?schema=public

# Redis connection
REDIS_URL=redis://your-redis-host:6379

# CORS (comma-separated)
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### Production Deployment with Docker

1. **Build the application:**
   ```bash
   docker compose build
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

4. **Check health status:**
   ```bash
   curl http://localhost:3000/api/health
   ```

5. **View logs:**
   ```bash
   docker compose logs -f app
   ```

#### With Nginx Reverse Proxy

```bash
docker compose --profile production up -d
```

This includes Nginx for SSL termination and load balancing.

### Option 2: Manual Deployment

#### 1. Install Dependencies

```bash
npm ci --only=production
```

#### 2. Generate Prisma Client

```bash
npm run db:generate
```

#### 3. Build Application

```bash
npm run build
```

#### 4. Run Database Migrations

```bash
npm run db:migrate
```

#### 5. Start Production Server

```bash
npm run start:prod
```

## Database Setup

### PostgreSQL Configuration

1. **Create Database:**
   ```sql
   CREATE DATABASE skycybernet;
   CREATE USER skyuser WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE skycybernet TO skyuser;
   ```

2. **Run Migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed Data (Optional):**
   ```bash
   npm run db:seed
   ```

### Setting up Connection Pooling

For production, use connection pooling with PgBouncer or similar:

```env
DATABASE_URL=postgresql://user:password@pgbouncer:6432/skycybernet?schema=public
DATABASE_DIRECT_URL=postgresql://user:password@postgres:5432/skycybernet?schema=public
```

## Redis Setup

### Configuration for Production

```bash
# In redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
appendonly yes
```

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `COOKIE_SECRET` (min 32 chars)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set secure `POSTGRES_PASSWORD`
- [ ] Configure `CORS_ORIGIN` whitelist
- [ ] Review and adjust rate limits
- [ ] Enable firewall rules
- [ ] Set up fail2ban (if using VPS)
- [ ] Regular security audits
- [ ] Keep dependencies updated

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot:**
   ```bash
   apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate:**
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   certbot renew --dry-run
   ```

## Monitoring and Logging

### Health Check Endpoint

```bash
curl https://your-domain.com/api/health
```

**Healthy Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-12T10:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": { "status": "up", "responseTime": 5 },
    "redis": { "status": "up", "responseTime": 2 }
  }
}
```

### Viewing Logs

**Docker:**
```bash
docker compose logs -f app
```

**PM2:**
```bash
pm2 logs sky-cybernet
```

### Metrics Endpoint

Monitor application metrics at `/api/metrics`

## Performance Optimization

### 1. Enable Compression

Already enabled in `next.config.ts`:
```typescript
compress: true
```

### 2. Database Optimization

- Connection pooling (max 10-20 connections)
- Regular VACUUM operations
- Proper indexes (already configured)
- Query optimization

### 3. Redis Caching

- Cache frequently accessed data
- Set appropriate TTL values
- Monitor memory usage

### 4. CDN Configuration

Use a CDN for static assets:
- Images in `/public`
- Next.js static files (`_next/static`)

## Backup Strategy

### Database Backups

**Automated Daily Backup:**
```bash
# Add to crontab
0 2 * * * pg_dump -U postgres skycybernet | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

**Restore from Backup:**
```bash
gunzip < backup.sql.gz | psql -U postgres -d skycybernet
```

### File Uploads Backup

```bash
# Sync uploads directory
rsync -avz /app/public/uploads/ /backups/uploads/
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer:** Use Nginx or cloud load balancer
2. **Session Storage:** Redis for shared sessions
3. **File Storage:** S3 or similar for uploads
4. **Database:** Read replicas for scaling reads

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database configuration
- Increase Redis memory limit

## Troubleshooting

### Application Won't Start

1. Check environment variables:
   ```bash
   npm run start:prod 2>&1 | grep "Configuration"
   ```

2. Verify database connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. Check Redis connection:
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

### Database Migration Issues

```bash
# Reset migrations (CAUTION: Data loss)
npm run db:reset

# Or apply pending migrations
npm run db:migrate
```

### Performance Issues

1. Check health endpoint
2. Monitor database queries
3. Review Redis cache hit rate
4. Check server resources (CPU, RAM, Disk)

## Hosting Platforms

### Recommended Platforms

1. **Vercel** - Easiest for Next.js (add PostgreSQL + Redis)
2. **Railway** - Full-stack deployment with databases
3. **Render** - Docker support + managed databases
4. **DigitalOcean App Platform** - Docker + managed services
5. **AWS ECS/Fargate** - Enterprise-grade scaling

### Platform-Specific Notes

**Vercel:**
- Add Vercel Postgres and Vercel KV (Redis)
- Set environment variables in dashboard
- Automatic deployments from Git

**Railway:**
- Use provided PostgreSQL and Redis plugins
- Configure environment from `.env.example`
- Deploy from GitHub repository

**Render:**
- Use Blueprint for infrastructure as code
- Background workers for async tasks
- Built-in SSL certificates

## Maintenance

### Regular Tasks

- **Daily:** Monitor health checks and logs
- **Weekly:** Review error logs and metrics
- **Monthly:** Update dependencies, security patches
- **Quarterly:** Database optimization, cleanup

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run db:migrate

# Build
npm run build

# Restart (Docker)
docker compose restart app

# Or (PM2)
pm2 restart sky-cybernet
```

## Support

For issues or questions:
- Check [SETUP.md](./SETUP.md) for local development
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [SCALABILITY.md](./SCALABILITY.md) for scaling strategies

## Security Disclosure

If you discover a security vulnerability, please email security@your-domain.com instead of using the issue tracker.
