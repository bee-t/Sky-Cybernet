# Strict Firewall Configuration Guide

This guide covers configuring Sky-Cybernet for environments with strict firewall policies, including zero-trust networks, DMZ deployments, and high-security requirements.

## Security Architecture

```
Internet → Firewall → Nginx (80/443) → App Server (127.0.0.1:3000) → PostgreSQL (127.0.0.1:5432)
                                                                      → Redis (127.0.0.1:6379)
```

## Firewall Policies

### Minimal Port Exposure (Recommended)

**Only expose what's absolutely necessary:**

```bash
# Allow ONLY nginx ports from external
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https

# Block direct access to application and database ports
sudo firewall-cmd --permanent --zone=public --remove-port=3000/tcp
sudo firewall-cmd --permanent --zone=public --remove-port=5432/tcp
sudo firewall-cmd --permanent --zone=public --remove-port=6379/tcp

sudo firewall-cmd --reload
```

### Localhost-Only Binding

Configure all services to bind only to localhost:

**1. Update `.env` file:**
```env
# Application binds to localhost only
HOSTNAME=127.0.0.1
PORT=3000

# Database - localhost only
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432

# Redis - localhost only
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**2. Use `docker-compose.secure.yml`:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: skycybernet_postgres
    restart: on-failure:5
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-skycybernet}
    # Bind to localhost ONLY - not accessible externally
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data:Z
    networks:
      - app-network
    # Disable external access
    security_opt:
      - no-new-privileges:true
      - seccomp=unconfined

  redis:
    image: redis:7-alpine
    container_name: skycybernet_redis
    restart: on-failure:5
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data:Z
    command:
      - "redis-server"
      - "--bind"
      - "127.0.0.1"  # Listen on localhost only
      - "--maxmemory"
      - "512mb"
      - "--maxmemory-policy"
      - "allkeys-lru"
    networks:
      - app-network
    security_opt:
      - no-new-privileges:true

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: skycybernet_app
    restart: on-failure:5
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      HOSTNAME: "127.0.0.1"  # Bind to localhost only
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-skycybernet}?schema=public
      REDIS_URL: redis://redis:6379
    networks:
      - app-network
    security_opt:
      - no-new-privileges:true
    # Minimal capabilities
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

networks:
  app-network:
    driver: bridge
    internal: false  # Set to true for complete isolation
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Firewalld Rich Rules

For more granular control:

### Allow Only Specific IPs

```bash
# Allow HTTP/HTTPS only from specific IPs or subnets
sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  source address="10.0.0.0/8"
  port protocol="tcp" port="80" accept'

sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  source address="10.0.0.0/8"
  port protocol="tcp" port="443" accept'

# Deny all other HTTP/HTTPS
sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  port protocol="tcp" port="80" drop'

sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  port protocol="tcp" port="443" drop'

sudo firewall-cmd --reload
```

### Rate Limiting with Firewalld

```bash
# Limit connections per IP
sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  port port="80" protocol="tcp"
  accept limit value="100/m"'

sudo firewall-cmd --permanent --zone=public --add-rich-rule='
  rule family="ipv4"
  port port="443" protocol="tcp"
  accept limit value="100/m"'

sudo firewall-cmd --reload
```

### Block Specific Countries (GeoIP)

```bash
# Install GeoIP tools
sudo dnf install geoipupdate firewalld-geoip

# Configure ipset for country blocking
sudo firewall-cmd --permanent --new-ipset=cn-ips --type=hash:net
sudo firewall-cmd --permanent --ipset=cn-ips --add-entries-from-file=/path/to/cn-ips.txt

# Block China (example)
sudo firewall-cmd --permanent --zone=drop --add-source=ipset:cn-ips
sudo firewall-cmd --reload
```

## SELinux Strict Mode

### Enable SELinux Enforcing

```bash
# Check current mode
getenforce

# Set to enforcing
sudo setenforce 1

# Make permanent
sudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
```

### Configure SELinux Contexts

```bash
# Allow containers to manage network
sudo setsebool -P container_manage_cgroup on

# Allow Nginx to connect to application
sudo setsebool -P httpd_can_network_connect on

# If using NFS for shared storage
sudo setsebool -P virt_use_nfs on

# Allow Nginx to relay
sudo setsebool -P httpd_can_network_relay on

# Check for denials
sudo ausearch -m avc -ts recent | grep denied

# If needed, generate custom policy
sudo ausearch -m avc -ts recent | audit2allow -M skycybernet_custom
sudo semodule -i skycybernet_custom.pp
```

### Container SELinux Labels

```bash
# Verify volume labels
ls -Z /path/to/sky-cybernet/public/uploads

# Set proper labels for Docker/Podman volumes
sudo chcon -R -t container_file_t /path/to/sky-cybernet/public/uploads

# Or use :Z in docker-compose (automatic labeling)
volumes:
  - ./uploads:/app/public/uploads:Z
```

## IPTables Rules (Alternative to firewalld)

If using iptables directly:

```bash
# Flush existing rules (careful!)
sudo iptables -F

# Default policies
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow established and related
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (change port if non-standard)
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT

# Allow HTTP/HTTPS from specific subnet only
sudo iptables -A INPUT -p tcp -s 10.0.0.0/8 --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp -s 10.0.0.0/8 --dport 443 -j ACCEPT

# Drop everything else
sudo iptables -A INPUT -j DROP

# Save rules
sudo iptables-save | sudo tee /etc/sysconfig/iptables

# Enable on boot
sudo systemctl enable iptables
```

## Network Isolation

### Docker Network Isolation

```yaml
# docker-compose.secure.yml
networks:
  app-network:
    driver: bridge
    internal: true  # No external network access
    driver_opts:
      com.docker.network.bridge.enable_icc: "false"  # Disable inter-container communication
      com.docker.network.bridge.enable_ip_masquerade: "false"
```

### Podman Network Policies

```bash
# Create isolated network
podman network create --internal skycybernet-internal

# Run containers on isolated network
podman-compose -f docker-compose.secure.yml up -d
```

## Nginx as Security Gateway

### Rate Limiting

In `nginx.conf`:

```nginx
# Rate limiting zones (already in nginx.conf)
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    # Apply rate limits
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        limit_conn addr 10;
        proxy_pass http://127.0.0.1:3000;
    }
    
    location /uploads/ {
        limit_req zone=upload burst=5 nodelay;
        limit_conn addr 5;
        # ... rest of config
    }
}
```

### IP Whitelisting in Nginx

```nginx
# In nginx.conf
geo $whitelist {
    default 0;
    10.0.0.0/8 1;
    192.168.0.0/16 1;
    # Add your trusted IPs/subnets
}

server {
    location / {
        if ($whitelist = 0) {
            return 403;
        }
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### ModSecurity WAF Integration

```bash
# Install ModSecurity
sudo dnf install nginx-mod-modsecurity

# Enable in nginx.conf
load_module modules/ngx_http_modsecurity_module.so;

http {
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/modsecurity.conf;
}
```

## VPN/Bastion Access

For administrative access:

### WireGuard VPN Setup

```bash
# Install WireGuard
sudo dnf install wireguard-tools

# Generate keys
wg genkey | tee privatekey | wg pubkey > publickey

# Configure /etc/wireguard/wg0.conf
[Interface]
PrivateKey = <server-private-key>
Address = 10.10.10.1/24
ListenPort = 51820

[Peer]
PublicKey = <client-public-key>
AllowedIPs = 10.10.10.2/32

# Start WireGuard
sudo systemctl enable --now wg-quick@wg0

# Allow WireGuard through firewall
sudo firewall-cmd --permanent --add-port=51820/udp
sudo firewall-cmd --reload
```

### SSH Bastion/Jump Host

```bash
# Configure SSH jump host
# On client ~/.ssh/config:
Host bastion
    HostName bastion.example.com
    User admin
    IdentityFile ~/.ssh/bastion_key

Host app-server
    HostName 10.0.0.10
    User admin
    ProxyJump bastion
    IdentityFile ~/.ssh/app_key
```

## Monitoring and Auditing

### Audit Failed Connection Attempts

```bash
# Enable auditd
sudo systemctl enable --now auditd

# Add rule to monitor port access
sudo auditctl -a always,exit -F arch=b64 -S connect -k network_connect

# View audit logs
sudo ausearch -k network_connect -ts recent
```

### Monitor Firewall Logs

```bash
# Enable firewalld logging
sudo firewall-cmd --set-log-denied=all

# View logs
sudo journalctl -u firewalld -f

# Or check iptables logs
sudo tail -f /var/log/messages | grep iptables
```

### OSSEC/Fail2Ban Integration

```bash
# Install Fail2Ban
sudo dnf install fail2ban

# Configure /etc/fail2ban/jail.local
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600

# Start Fail2Ban
sudo systemctl enable --now fail2ban
```

## Zero Trust Architecture

### mTLS (Mutual TLS) for Service-to-Service

```nginx
server {
    listen 443 ssl http2;
    
    # Server certificate
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    
    # Client certificate verification
    ssl_client_certificate /etc/nginx/ssl/ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;
    
    location / {
        if ($ssl_client_verify != SUCCESS) {
            return 403;
        }
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### Application-Level Authentication

Ensure all endpoints require authentication:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Additional checks: IP whitelist, rate limiting, etc.
}
```

## Security Checklist

- [ ] All services bind to 127.0.0.1 only
- [ ] Nginx reverse proxy is the only external endpoint
- [ ] Firewall allows only HTTP/HTTPS (or custom ports)
- [ ] Database ports (5432, 6379) not exposed externally
- [ ] SELinux in enforcing mode
- [ ] Proper SELinux contexts on all volumes
- [ ] Rate limiting enabled in nginx
- [ ] IP whitelisting configured (if applicable)
- [ ] SSL/TLS with strong ciphers
- [ ] Client certificates for admin access (optional)
- [ ] VPN or bastion for administrative access
- [ ] Fail2Ban or similar IDS/IPS enabled
- [ ] Audit logging enabled
- [ ] Regular security updates automated
- [ ] Backup encryption enabled
- [ ] DDoS protection (CloudFlare, etc.)
- [ ] Container security scanning in CI/CD
- [ ] Secrets not in version control
- [ ] Minimal container capabilities
- [ ] Read-only root filesystems where possible

## Quick Deployment (Strict Mode)

```bash
# 1. Install with minimal exposure
sudo dnf install -y nginx podman podman-compose

# 2. Configure firewall (ONLY HTTP/HTTPS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 3. Use secure compose file (localhost bindings)
cp docker-compose.yml docker-compose.secure.yml
# Edit to bind all ports to 127.0.0.1

# 4. Deploy with Podman (rootless)
podman-compose -f docker-compose.secure.yml up -d

# 5. Configure Nginx reverse proxy
sudo cp nginx.conf /etc/nginx/conf.d/skycybernet.conf
sudo nginx -t
sudo systemctl restart nginx

# 6. Verify no direct access to app/db
curl http://localhost:3000  # Should fail or be empty
curl http://localhost:5432  # Should fail

# 7. Verify access through Nginx works
curl http://localhost/  # Should work
```

## Resources

- [Fedora Security Guide](https://docs.fedoraproject.org/en-US/security-guide/)
- [SELinux User's Guide](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/using_selinux/)
- [Firewalld Documentation](https://firewalld.org/documentation/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)

## Support

For strict firewall deployments, additional considerations may be needed based on your specific security requirements. Consult with your security team for compliance with organizational policies.
