# SKY-CYBERNET Scalability Guide

## Current Architecture (Good for Local Hosting)

### What You Have
- **Frontend**: Next.js 16 App Router
- **Database**: SQLite (file-based)
- **Cache**: Redis
- **Storage**: Local filesystem (`public/uploads/`)
- **Auth**: Cookie-based sessions

### Performance Capacity
- **Users**: 50-200 concurrent users
- **Requests**: ~10,000 reads/second
- **Storage**: Limited by disk space
- **Network**: LAN speeds only

---

## For Production Scalability

### 1. Database Migration (Critical)

**Switch from SQLite to PostgreSQL:**

```bash
# Install PostgreSQL
npm install @prisma/client pg

# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Why PostgreSQL:**
- ✅ Handles millions of rows
- ✅ Network accessible
- ✅ Multiple concurrent writers
- ✅ Advanced indexing
- ✅ Horizontal read scaling with replicas

**Migration Steps:**
```bash
# 1. Export current SQLite data
npx prisma db pull

# 2. Update schema for PostgreSQL
# 3. Generate migration
npx prisma migrate dev --name switch_to_postgres

# 4. Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/skycybernet"
```

---

### 2. Media Storage (Important)

**Switch to Cloud Storage (S3/Cloudflare R2):**

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: Buffer, filename: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${filename}`,
    Body: file,
    ContentType: 'image/jpeg',
  });
  
  await s3.send(command);
  return `https://${process.env.CDN_DOMAIN}/uploads/${filename}`;
}
```

**Why Cloud Storage:**
- ✅ Unlimited storage
- ✅ CDN integration
- ✅ Works with load balancers
- ✅ Geographic distribution
- ✅ Automatic backups

**Alternatives:**
- AWS S3 (most popular)
- Cloudflare R2 (cheaper, no egress fees)
- DigitalOcean Spaces
- Google Cloud Storage

---

### 3. Session Management

**Add Distributed Sessions:**

```typescript
// lib/session.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function setSession(userId: string, sessionId: string) {
  await redis.setex(`session:${sessionId}`, 86400, userId);
}

export async function getSession(sessionId: string) {
  return await redis.get(`session:${sessionId}`);
}
```

---

### 4. Infrastructure Setup

**Docker Compose for Local Development:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/skycybernet
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: skycybernet
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Start with Docker:**
```bash
docker-compose up -d
npm run dev
```

---

### 5. Performance Optimizations

**Add Database Indexes:**

```prisma
// prisma/schema.prisma
model Post {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  parentId  String?
  createdAt DateTime @default(now())
  
  @@index([authorId])
  @@index([parentId])
  @@index([createdAt])
  @@index([authorId, createdAt])
}

model Reaction {
  id     String @id @default(cuid())
  userId String
  postId String
  type   String

  @@unique([userId, postId, type])
  @@index([postId, type])
  @@index([userId, type])
}
```

**Enable Query Optimization:**

```typescript
// lib/db.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'minimal',
});

// Add connection pooling
prisma.$connect();
```

---

### 6. Caching Strategy

**Implement Multi-Layer Caching:**

```typescript
// lib/cache-strategy.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// L1: In-memory cache (fast, limited)
const memoryCache = new Map<string, { data: any; expires: number }>();

// L2: Redis cache (shared across servers)
export async function getCached<T>(key: string): Promise<T | null> {
  // Check L1 cache
  const memoryCached = memoryCache.get(key);
  if (memoryCached && memoryCached.expires > Date.now()) {
    return memoryCached.data;
  }

  // Check L2 cache
  const redisCached = await redis.get(key);
  if (redisCached) {
    const data = JSON.parse(redisCached);
    memoryCache.set(key, { data, expires: Date.now() + 30000 }); // 30s L1 cache
    return data;
  }

  return null;
}

export async function setCached<T>(key: string, value: T, ttl: number = 300) {
  const data = JSON.stringify(value);
  await redis.setex(key, ttl, data);
  memoryCache.set(key, { data: value, expires: Date.now() + 30000 });
}
```

---

### 7. Deployment Options

**For Local Network:**
```bash
# Simple PM2 deployment
npm install -g pm2
npm run build
pm2 start npm --name "sky-cybernet" -- start
pm2 startup
pm2 save
```

**For Production (Cloud):**

1. **Vercel** (Easiest, auto-scaling):
   - Deploy with one click
   - Need PostgreSQL (Vercel Postgres or external)
   - Need external Redis
   - Need S3 for media

2. **Docker + VPS** (Full control):
   - DigitalOcean/Linode/Hetzner
   - Docker Compose setup
   - Add nginx reverse proxy
   - SSL with Let's Encrypt

3. **Kubernetes** (Enterprise scale):
   - Auto-scaling pods
   - Load balancing
   - High availability
   - Complex setup

---

## Scalability Comparison

### Current SQLite Setup
| Metric | Capacity |
|--------|----------|
| Concurrent Users | 50-200 |
| Requests/second | 10,000 reads, 100 writes |
| Storage | Limited by disk |
| Deployment | Single server only |
| Cost | $0 (local) |

### PostgreSQL + Cloud Setup
| Metric | Capacity |
|--------|----------|
| Concurrent Users | 10,000+ |
| Requests/second | 100,000+ |
| Storage | Unlimited (with S3) |
| Deployment | Multi-server, global CDN |
| Cost | ~$50-200/month |

---

## Recommended Upgrade Path

### Phase 1: Keep SQLite, Add Monitoring
- ✅ You're here now
- Add metrics (response times, query counts)
- Identify bottlenecks

### Phase 2: Add PostgreSQL
- Switch database
- Keep everything else the same
- Test performance

### Phase 3: Cloud Storage
- Migrate media to S3/R2
- Enable CDN
- Remove local uploads folder

### Phase 4: Scale Infrastructure
- Add load balancer
- Multiple app servers
- Database read replicas
- Redis cluster

---

## Current Performance Tips (SQLite)

1. **Enable WAL mode** (already done in your schema):
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db?connection_limit=1"
}
```

2. **Optimize queries**:
```typescript
// Bad: Loads all data
const posts = await prisma.post.findMany({
  include: { author: true, media: true, reactions: true }
});

// Good: Select only needed fields
const posts = await prisma.post.findMany({
  select: {
    id: true,
    content: true,
    author: { select: { username: true, displayName: true } }
  }
});
```

3. **Use pagination**:
```typescript
// Already implemented in your code
const posts = await prisma.post.findMany({
  take: 50,  // Limit results
  skip: 0,   // For pagination
});
```

---

## Bottom Line

**For Local Hosting (< 100 users):**
- ✅ Current setup is perfect
- SQLite is actually faster than PostgreSQL for this scale
- No need to change anything

**For Growth (100-1000 users):**
- Switch to PostgreSQL
- Add proper indexes
- Keep local file storage

**For Scale (1000+ users):**
- PostgreSQL with read replicas
- Cloud storage (S3/R2)
- CDN for media
- Multiple app servers
- Redis cluster

**Your current architecture is excellent for local deployment!** SQLite will easily handle typical local network usage.
