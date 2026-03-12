# Application Monitoring Guide

## Overview

This guide covers monitoring, observability, and error tracking for Sky-Cybernet in production.

## Health Monitoring

### Built-in Health Check

**Endpoint:** `GET /api/health`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-12T10:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "redis": {
      "status": "up",
      "responseTime": 2
    }
  },
  "version": "1.0.0"
}
```

**Status Codes:**
- `200` - All services healthy
- `207` - Degraded (some services down)
- `503` - Unhealthy (critical services down)

### Uptime Monitoring

Use services like:
- **UptimeRobot** - Free tier available
- **Pingdom** - Comprehensive monitoring
- **StatusCake** - Multiple check locations
- **Better Uptime** - Modern interface

**Configuration Example:**
```
Monitor Type: HTTP(s)
URL: https://your-domain.com/api/health
Interval: 5 minutes
Alert Via: Email, Slack, SMS
```

## Application Performance Monitoring (APM)

### Recommended APM Tools

#### 1. Sentry (Error Tracking)

**Setup:**
```bash
npm install @sentry/nextjs
```

**Configuration (`sentry.client.config.ts`):**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

**Environment Variable:**
```env
SENTRY_DSN=https://your-sentry-dsn
```

#### 2. New Relic

**Setup:**
```bash
npm install newrelic
```

**Configuration:**
```javascript
// newrelic.js
exports.config = {
  app_name: ['Sky-Cybernet'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
}
```

#### 3. DataDog

**Setup:**
```bash
npm install dd-trace
```

**Initialization:**
```javascript
// At the very top of server.js
require('dd-trace').init({
  service: 'sky-cybernet',
  env: process.env.NODE_ENV
});
```

## Metrics Collection

### Built-in Metrics Endpoint

**Endpoint:** `GET /api/metrics`

Monitor:
- Request counts by endpoint
- Response times (p50, p95, p99)
- Error rates
- Active connections
- Cache hit/miss ratios

### Prometheus Integration

**Add to `package.json`:**
```bash
npm install prom-client
```

**Metrics Configuration (`app/lib/metrics.ts`):**
```typescript
import client from 'prom-client';

const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  registers: [register],
});

export { register };
```

## Log Aggregation

### Structured Logging

Already implemented in [`app/lib/logger.ts`](app/lib/logger.ts)

**Production Output (JSON):**
```json
{
  "timestamp": "2026-03-12T10:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": "user_123",
  "ip": "192.168.1.1"
}
```

### Log Management Services

#### 1. LogDNA / Mezmo

**Docker Setup:**
```yaml
services:
  app:
    logging:
      driver: syslog
      options:
        syslog-address: "tcp+tls://syslog.logdna.com:6514"
        tag: "{{.Name}}/{{.ID}}"
```

#### 2. Logtail (Better Stack)

**Setup:**
```bash
npm install @logtail/node @logtail/winston
```

**Integration:**
```typescript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

// Use with existing logger
export function log(level: string, message: string, context?: any) {
  logtail[level](message, context);
}
```

#### 3. ELK Stack (Self-Hosted)

**Docker Compose Addition:**
```yaml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
```

## Database Monitoring

### PostgreSQL Monitoring

#### 1. pg_stat_statements Extension

```sql
-- Enable extension
CREATE EXTENSION pg_stat_statements;

-- View slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### 2. Connection Pooling Stats

Monitor PgBouncer metrics:
```bash
psql -h pgbouncer -p 6432 -U postgres pgbouncer -c "SHOW STATS;"
```

### Database Monitoring Tools

- **pganalyze** - Query performance insights
- **Datadog Database Monitoring** - Full-stack visibility
- **CloudWatch RDS** - AWS managed PostgreSQL monitoring

## Redis Monitoring

### Redis CLI Commands

```bash
# Memory usage
redis-cli INFO memory

# Keyspace stats
redis-cli INFO keyspace

# Monitor commands in real-time
redis-cli MONITOR

# Get slow log
redis-cli SLOWLOG GET 10
```

### Redis Monitoring Tools

- **RedisInsight** - Free official GUI
- **Redis Cloud Console** - Managed Redis monitoring
- **Datadog Redis Integration** - APM integration

## Alerts Configuration

### Critical Alerts

Set up alerts for:

1. **Application Down**
   - Health check fails for 2 consecutive checks
   - HTTP 5xx errors > 1% for 5 minutes

2. **Database Issues**
   - Connection pool exhausted
   - Query response time > 1s
   - Disk usage > 80%

3. **Memory/CPU**
   - Memory usage > 85%
   - CPU usage > 90% for 5 minutes

4. **Security**
   - Failed login attempts > 10/minute
   - Unusual traffic patterns

### Alert Channels

Configure notifications via:
- Email
- Slack
- PagerDuty
- Discord webhooks
- SMS (Twilio)

## Performance Metrics Dashboard

### Key Metrics to Track

**Application:**
- Requests per second (RPS)
- Average response time
- Error rate (%)
- Active users
- Cache hit ratio

**Database:**
- Query execution time
- Active connections
- Transaction rate
- Deadlocks
- Table bloat

**Redis:**
- Memory usage
- Evicted keys
- Hit rate
- Connected clients

**System:**
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth

## Grafana Dashboard Example

```json
{
  "dashboard": {
    "title": "Sky-Cybernet Production",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

## Incident Response

### Runbook Template

**Scenario: Application Down**

1. Check health endpoint
2. Review recent deployments
3. Check database connectivity
4. Review error logs
5. Check resource utilization
6. Restart application if needed
7. Post-mortem documentation

### On-Call Rotation

Set up on-call schedule with:
- PagerDuty
- OpsGenie
- VictorOps

## Cost Optimization

### Monitoring Cost Tips

1. Sample traces (10-20% instead of 100%)
2. Set log retention policies
3. Filter noisy logs
4. Use alert aggregation
5. Review monitoring ROI quarterly

## Implementation Checklist

- [ ] Set up health check monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Implement structured logging
- [ ] Set up log aggregation
- [ ] Configure database monitoring
- [ ] Monitor Redis performance
- [ ] Create alerts for critical issues
- [ ] Build performance dashboard
- [ ] Document runbooks
- [ ] Test alert notifications
- [ ] Set up on-call rotation
- [ ] Regular review of metrics

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)
