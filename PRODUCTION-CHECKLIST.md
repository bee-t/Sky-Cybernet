# Production Deployment Checklist

Use this checklist to ensure your Sky-Cybernet deployment is production-ready.

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] `NODE_ENV` set to `production`
- [ ] `NEXT_PUBLIC_APP_URL` configured with production domain
- [ ] `COOKIE_SECRET` generated with `openssl rand -base64 32` (min 32 chars)
- [ ] `DATABASE_URL` configured for PostgreSQL (not SQLite)
- [ ] `DATABASE_DIRECT_URL` configured for migrations
- [ ] `REDIS_URL` configured for production Redis instance
- [ ] `CORS_ORIGIN` set to allowed domains only
- [ ] All `.env` variables match `.env.example` requirements
- [ ] No sensitive data in `.env.example` or version control

### ✅ Database Setup

- [ ] PostgreSQL 14+ installed and running
- [ ] Database created with UTF-8 encoding
- [ ] Database user created with appropriate permissions
- [ ] Connection pooling configured (max 10-20 connections)
- [ ] SSL/TLS enabled for database connections
- [ ] Migrations run successfully (`npm run db:migrate`)
- [ ] Database backups configured and tested
- [ ] Restore procedure documented and tested

### ✅ Redis Setup

- [ ] Redis 7+ installed and running
- [ ] Password authentication enabled
- [ ] `requirepass` configured in redis.conf
- [ ] Persistence enabled (AOF or RDB)
- [ ] Memory limits configured (maxmemory)
- [ ] Eviction policy set (allkeys-lru recommended)
- [ ] Redis backups configured

### ✅ Security

- [ ] HTTPS/SSL certificates installed and valid
- [ ] SSL certificates auto-renewal configured
- [ ] Security headers configured in middleware
- [ ] HSTS header enabled
- [ ] CSP (Content Security Policy) configured
- [ ] Rate limiting enabled and tested
- [ ] Firewall rules configured
- [ ] Database credentials rotated from defaults
- [ ] Redis password set and secured
- [ ] File upload validation working
- [ ] Input sanitization tested
- [ ] Session security reviewed (HttpOnly, Secure, SameSite)
- [ ] CORS properly configured (not using *)
- [ ] Social engineering/phishing protection in place

### ✅ Application Build

- [ ] Dependencies installed (`npm ci --only=production`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Application built successfully (`npm run build`)
- [ ] Build artifacts checked for errors
- [ ] Type checking passed (`npm run type-check`)
- [ ] Linting passed (`npm run lint`)
- [ ] No console.logs in production code (except errors/warnings)
- [ ] Source maps disabled or secured (`productionBrowserSourceMaps: false`)

### ✅ Performance

- [ ] Next.js compression enabled
- [ ] Image optimization configured
- [ ] Database queries optimized
- [ ] Proper indexes added in Prisma schema
- [ ] Redis caching strategy implemented
- [ ] CDN configured for static assets (optional)
- [ ] Response time targets met (<500ms for API)
- [ ] Load testing completed

### ✅ Monitoring & Logging

- [ ] Health check endpoint working (`/api/health`)
- [ ] Structured logging configured
- [ ] Log aggregation service configured (optional: LogDNA, Logtail)
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)
- [ ] Performance monitoring configured (optional: New Relic, DataDog)
- [ ] Alerts configured for critical issues
- [ ] Dashboard created for key metrics
- [ ] On-call rotation established (if applicable)

### ✅ Docker (If Using)

- [ ] Dockerfile tested and builds successfully
- [ ] Multi-stage build working correctly
- [ ] Image size optimized (<500MB recommended)
- [ ] Running as non-root user
- [ ] Health check configured in Dockerfile
- [ ] Docker Compose tested
- [ ] Volumes configured for persistent data
- [ ] Network isolation configured
- [ ] Container resource limits set
- [ ] Image vulnerability scanning completed

### ✅ Infrastructure

- [ ] Server/hosting platform selected and provisioned
- [ ] Server resources adequate (CPU, RAM, Disk)
- [ ] Server OS updated and secured
- [ ] Nginx/reverse proxy configured (if applicable)
- [ ] Load balancer configured (if scaling horizontally)
- [ ] Auto-scaling configured (if using cloud platform)
- [ ] DNS records configured and propagated
- [ ] Email service configured (if sending emails)
- [ ] Object storage configured for uploads (S3, etc.) (optional)

### ✅ Backup & Recovery

- [ ] Database backup strategy implemented
- [ ] Backup retention policy defined
- [ ] Backup restoration tested successfully
- [ ] File upload backups configured
- [ ] Disaster recovery plan documented
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Backup encryption enabled

### ✅ Testing

- [ ] All critical user flows tested manually
- [ ] Load testing completed (artillery, k6, etc.)
- [ ] Security scanning completed (OWASP ZAP, etc.)
- [ ] Database migration tested on staging
- [ ] Rollback procedure tested
- [ ] Health checks responding correctly
- [ ] Error handling tested (500 errors, database down, etc.)
- [ ] Rate limiting tested

### ✅ Documentation

- [ ] README.md updated with production info
- [ ] API documentation updated (if applicable)
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Runbooks created for common incidents
- [ ] Architecture diagrams updated
- [ ] Team trained on deployment process
- [ ] Change log maintained

### ✅ Compliance & Legal

- [ ] Privacy policy created and accessible
- [ ] Terms of service created and accessible
- [ ] Cookie policy created (if applicable)
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data retention policy defined
- [ ] User data export functionality working
- [ ] User data deletion functionality working
- [ ] Security disclosure policy published

## Deployment Day Checklist

### Before Deployment

- [ ] Announce maintenance window to users (if applicable)
- [ ] Create database backup
- [ ] Tag release in Git (`git tag v1.0.0`)
- [ ] Notify team of deployment
- [ ] Have rollback plan ready

### During Deployment

**Manual Deployment:**
1. [ ] Pull latest code
2. [ ] Install dependencies
3. [ ] Run database migrations
4. [ ] Build application
5. [ ] Stop old instance
6. [ ] Start new instance
7. [ ] Verify health check

**Docker Deployment:**
1. [ ] Build Docker image
2. [ ] Tag image with version
3. [ ] Push to registry (if using)
4. [ ] Pull image on server
5. [ ] Run database migrations
6. [ ] Start containers
7. [ ] Verify health check

### After Deployment

- [ ] Verify application is operational
- [ ] Check health endpoint (`/api/health`)
- [ ] Test critical user flows (login, post creation, etc.)
- [ ] Monitor error tracking dashboard
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Review application logs for errors
- [ ] Check database connection pool
- [ ] Verify Redis connectivity
- [ ] Test file upload functionality
- [ ] Verify SSL certificate is working
- [ ] Monitor response times
- [ ] Update status page (if applicable)
- [ ] Announce successful deployment

## Post-Deployment Monitoring (First 24 Hours)

- [ ] Hour 1: Continuous monitoring
- [ ] Hour 2-4: Check every 30 minutes
- [ ] Hour 4-24: Check every 2 hours
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Monitor user complaints
- [ ] Review logs for warnings
- [ ] Check memory usage trends
- [ ] Monitor database performance
- [ ] Review backup completion

## Rollback Procedure

If critical issues are discovered:

1. [ ] Assess severity and impact
2. [ ] Notify team of rollback decision
3. [ ] Stop new application instance
4. [ ] Restore previous version
5. [ ] Rollback database migrations (if needed)
6. [ ] Verify functionality
7. [ ] Communicate with users
8. [ ] Document what went wrong
9. [ ] Plan fix for next deployment

## Ongoing Maintenance Checklist

### Daily
- [ ] Review error logs
- [ ] Check health endpoint
- [ ] Monitor uptime alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Review security logs
- [ ] Verify backup completion

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Security audit (`npm audit`)
- [ ] Review and optimize database
- [ ] Review rate limit effectiveness
- [ ] Test backup restoration
- [ ] Rotate credentials

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Review and update documentation

### Annually
- [ ] Penetration testing (if budget allows)
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Technology stack review

## Emergency Contacts

```
Primary On-Call: [Name] - [Phone] - [Email]
Secondary On-Call: [Name] - [Phone] - [Email]
Database Admin: [Name] - [Phone] - [Email]
DevOps Lead: [Name] - [Phone] - [Email]
Security Team: [Email]
```

## Useful Commands

```bash
# Check application health
curl https://your-domain.com/api/health

# View Docker logs
docker compose logs -f app

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connection
redis-cli -u $REDIS_URL ping

# View running processes
docker compose ps

# Restart application
docker compose restart app

# Check disk space
df -h

# Check memory usage
free -h

# View recent logs
tail -f /var/log/app.log
```

## Sign-Off

**Deployment completed by:** ___________________  
**Date:** ___________________  
**Version deployed:** ___________________  
**Reviewed by:** ___________________  
**Production URL:** ___________________  

---

**Notes:**
- Keep this checklist updated as your deployment process evolves
- Add platform-specific items as needed
- Customize for your team's workflow
- Review after each deployment for improvements
