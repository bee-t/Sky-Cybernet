# Fedora Linux Quick Reference

Quick command reference for running Sky-Cybernet on Fedora Linux.

## Initial Setup (First Time Only)

```bash
# Install all prerequisites
sudo dnf update -y
sudo dnf install -y nodejs npm docker docker-compose-plugin git gcc-c++ make python3 vips vips-devel ffmpeg

# Enable Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Configure SELinux (optional but recommended)
sudo setsebool -P container_manage_cgroup on

# Log out and back in for Docker group to take effect
# Or run: newgrp docker
```

## Project Setup

```bash
# Clone repository
git clone <repository-url> sky-cybernet
cd sky-cybernet

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env  # Edit configuration

# Generate secure cookie secret
openssl rand -base64 32

# Make deploy script executable
chmod +x deploy.sh
```

## Quick Start Development

```bash
# Start services
docker compose up -d

# Initialize database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## Production Deployment

```bash
# Automated deployment
./deploy.sh
# or: npm run deploy:linux

# Manual deployment
docker compose up -d postgres redis
npm run build
npm run start:prod
```

## Common Commands

### Docker Management
```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs postgres
docker compose logs redis

# Restart services
docker compose restart

# Stop all containers
docker compose down

# Remove containers and volumes (deletes data!)
docker compose down -v

# Check Docker status
sudo systemctl status docker
docker info
```

### Database Operations
```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (warning: deletes data)
npm run db:reset
```

### Application Management
```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod

# Check types
npm run type-check

# Lint code
npm run lint

# Health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Docker Permission Denied
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### SELinux Issues
```bash
# Check status
getenforce

# Allow container management
sudo setsebool -P container_manage_cgroup on

# Temporary permissive mode (debugging)
sudo setenforce 0
```

### Port Already in Use
```bash
# Find process on port 3000
sudo ss -tlnp | grep :3000

# Kill process
sudo kill -9 $(sudo lsof -ti:3000)
```

### Container Won't Start
```bash
# View detailed logs
docker compose logs postgres
docker compose logs redis

# Remove and recreate
docker compose down
docker compose up -d

# Check for port conflicts
sudo ss -tlnp | grep -E ':(3000|5432|6379)'
```

### Native Module Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Ensure build tools are installed
sudo dnf install -y gcc-c++ make python3 vips vips-devel
```

### Firewall Configuration
```bash
# Open required ports
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload

# Check open ports
sudo firewall-cmd --list-ports
```

## Systemd Service (Production)

Create `/etc/systemd/system/skycybernet.service`:

```ini
[Unit]
Description=Sky-Cybernet Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/sky-cybernet
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Manage service:
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable skycybernet
sudo systemctl start skycybernet

# Check status
sudo systemctl status skycybernet

# View logs
sudo journalctl -u skycybernet -f
```

## Production Checklist

- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure nginx reverse proxy
- [ ] Set strong COOKIE_SECRET in .env
- [ ] Configure secure database passwords
- [ ] Enable automatic backups
- [ ] Set up monitoring and alerts
- [ ] Configure SELinux policies
- [ ] Test disaster recovery
- [ ] Review PRODUCTION.md

## Performance Optimization

### PostgreSQL Tuning
```bash
# Edit docker-compose.yml PostgreSQL settings for your hardware
# Recommended for 8GB RAM:
# shared_buffers=2GB
# effective_cache_size=6GB
# maintenance_work_mem=512MB
```

### Redis Tuning
```bash
# Edit docker-compose.yml Redis settings
# Set maxmemory based on available RAM
# maxmemory=1gb
```

### Monitoring
```bash
# Check application health
curl http://localhost:3000/api/health

# Check metrics
curl http://localhost:3000/api/metrics

# View resource usage
docker stats

# Check system resources
htop
df -h
free -h
```

## Useful Links

- [Main Setup Guide](SETUP.md)
- [Production Deployment](PRODUCTION.md)
- [Security Guide](SECURITY.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Monitoring Guide](MONITORING.md)

## Quick Diagnosis

```bash
# Check everything
echo "=== Docker Status ===" && docker info > /dev/null 2>&1 && echo "✅ Docker is running" || echo "❌ Docker is not running"
echo "=== Containers ===" && docker compose ps
echo "=== Disk Space ===" && df -h | grep -E '(Filesystem|/$)'
echo "=== Memory ===" && free -h
echo "=== Application Health ===" && curl -s http://localhost:3000/api/health | jq . || echo "App not responding"
```

## Getting Help

1. Check the [SETUP.md](SETUP.md) for detailed instructions
2. Review [Troubleshooting section](#troubleshooting) above
3. Check container logs: `docker compose logs -f`
4. Verify environment: `cat .env | grep -v PASSWORD`
5. Check application health: `curl http://localhost:3000/api/health`
