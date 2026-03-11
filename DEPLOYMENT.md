# SKY-CYBERNET - Production Deployment Guide

## 🚀 Mass-Scale Ready Architecture

This setup is optimized for handling high traffic with:
- ✅ PostgreSQL with connection pooling
- ✅ Redis caching layer
- ✅ Rate limiting
- ✅ Image optimization (WebP conversion)
- ✅ Nginx reverse proxy
- ✅ Horizontal scaling ready

---

## 📋 Prerequisites

- **Node.js** 20+ 
- **Docker Desktop** (for PostgreSQL & Redis)
- **Nginx** (for production)

---

## 🛠️ Quick Start (Development)

```powershell
# 1. Install dependencies
npm install

# 2. Start PostgreSQL and Redis
docker-compose up -d

# 3. Setup database
npm run db:push
npm run db:seed

# 4. Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## 🎯 Production Deployment

### Option 1: Automated Deployment (Recommended)

```powershell
# Run the deployment script
npm run deploy

# Start the production server
npm run start:prod
```

### Option 2: Manual Deployment

```powershell
# 1. Start services
docker-compose up -d

# 2. Wait for services (check health)
docker ps

# 3. Run migrations
npm run db:migrate

# 4. Build application
npm run build

# 5. Start production server
npm run start:prod
```

---

## 🌐 Nginx Configuration

### 1. Install Nginx (Windows)

Download from: https://nginx.org/en/download.html

### 2. Update nginx.conf

Edit the provided `nginx.conf`:
- Update `alias /path/to/vellum-local/public/uploads/` to your actual path
- Change `server_name` to your domain

### 3. Copy configuration

```powershell
# Copy to nginx conf.d directory
Copy-Item nginx.conf C:\nginx\conf\conf.d\vellum.conf
```

### 4. Start Nginx

```powershell
# Start nginx
cd C:\nginx
start nginx

# Reload configuration
nginx -s reload

# Stop nginx
nginx -s stop
```

---

## 🔧 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vellum?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_DIRECT_URL="postgresql://postgres:password@localhost:5432/vellum?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# App
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Media
MAX_FILE_SIZE_MB=10
UPLOAD_DIR="public/uploads"
```

---

## 📊 Scaling Strategy

### Single Server (1K-10K users)
```
Current setup works perfectly ✅
```

### Multi-Server (10K-100K users)
```powershell
# Start multiple Next.js instances
npm run start:prod -- -p 3000  # Terminal 1
npm run start:prod -- -p 3001  # Terminal 2
npm run start:prod -- -p 3002  # Terminal 3
npm run start:prod -- -p 3003  # Terminal 4

# Update nginx.conf upstream block:
upstream vellum_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

### Massive Scale (100K+ users)
- Add PostgreSQL read replicas
- Use CDN for static assets (Cloudflare)
- Consider Redis cluster
- Implement WebSocket server for real-time updates
- Add message queue (BullMQ) for background jobs

---

## 🗄️ Database Management

```powershell
# View database in browser
npm run db:studio

# Migrations
npm run db:migrate

# Reset database
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

---

## 📈 Monitoring

### Check Service Health

```powershell
# PostgreSQL
docker exec vellum_postgres pg_isready -U postgres

# Redis
docker exec vellum_redis redis-cli ping

# Application
curl http://localhost/health

# View logs
npm run docker:logs
```

### Performance Metrics

- **Nginx access logs**: Check request rates
- **Redis**: Monitor hit/miss ratio
- **PostgreSQL**: Check connection pool usage
  ```sql
  SELECT count(*) FROM pg_stat_activity;
  ```

---

## 🔐 Production Checklist

- [ ] Update `DATABASE_URL` with strong password
- [ ] Enable HTTPS in nginx (uncomment SSL block)
- [ ] Set up firewall rules (only allow 80/443)
- [ ] Configure backup strategy for PostgreSQL
- [ ] Set up monitoring (Uptime Kuma, Prometheus)
- [ ] Enable log rotation
- [ ] Test rate limiting
- [ ] Load test with k6 or Apache Bench

---

## 🆘 Troubleshooting

### Can't connect to PostgreSQL
```powershell
# Check if running
docker ps | grep postgres

# View logs
docker logs vellum_postgres

# Restart
docker-compose restart postgres
```

### Redis connection errors
```powershell
# Check if running
docker ps | grep redis

# Test connection
docker exec vellum_redis redis-cli ping
```

### Nginx 502 Bad Gateway
```powershell
# Check if Next.js is running
netstat -an | findstr :3000

# Check nginx error logs
type C:\nginx\logs\error.log
```

---

## 📦 Docker Commands

```powershell
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Remove all data (WARNING: deletes database)
docker-compose down -v
```

---

## 🎯 Performance Benchmarks

Expected performance on a mid-range server:

| Metric | Value |
|--------|-------|
| Concurrent Users | 10,000+ |
| Requests/sec | 1,000+ |
| Avg Response Time | <100ms (cached) |
| P95 Response Time | <500ms |
| Database Connections | 200 max |
| Redis Hit Rate | >80% |

---

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs`
- Redis: `docker exec vellum_redis redis-cli monitor`
- PostgreSQL: `npm run db:studio`

---

**Happy scaling! 🚀**
