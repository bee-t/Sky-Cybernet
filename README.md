<div align="center">
  <img src="public/logo-full.svg" alt="Sky-Cybernet Logo" width="500">
  <br><br>
</div>

# SKY-CYBERNET

**Strategic Cyber Network - Advanced Digital Operations**

A production-ready social platform with a military-tactical cyber aesthetic, built with Next.js and optimized for mass-scale deployment.

[![CI/CD](https://github.com/yourusername/sky-cybernet/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/yourusername/sky-cybernet/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎨 Features

- **Military-Tactical UI**: Terminal-style interface with tactical green/orange themes
- **Dual Theme System**: Switchable green/orange color schemes with CSS variables
- **Production-Ready**: Enterprise-grade security, monitoring, and scalability
- **Near-Lossless Compression**: AVIF + WebP image optimization with client-side pre-compression
- **Admin Dashboard**: Complete analytics, user management, and system monitoring
- **High Performance**: Built for scale with PostgreSQL and Redis caching
- **Modern Stack**: Next.js 16, React 19, Prisma ORM, TypeScript
- **Real-time**: WebSocket support for live updates
- **Secure**: HTTPS, CSP headers, rate limiting, authentication
- **Containerized**: Docker support with multi-stage builds
- **Observable**: Health checks, structured logging, error tracking

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Local development setup and configuration
- **[PRODUCTION.md](PRODUCTION.md)** - Production deployment guide
- **[ADMIN.md](ADMIN.md)** - Admin dashboard guide and user management
- **[BRANDING.md](BRANDING.md)** - Brand identity, logo usage, and design guidelines
- **[COMPRESSION.md](COMPRESSION.md)** - Image/video compression system documentation
- **[SECURITY.md](SECURITY.md)** - Security best practices and guidelines
- **[MONITORING.md](MONITORING.md)** - Monitoring, logging, and observability
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[SCALABILITY.md](SCALABILITY.md)** - Scaling strategies and performance
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment procedures and strategies

### Logo & Brand Assets

- **[Logo Showcase](public/logo-showcase.html)** - Visual preview of all logo variants
- **[Logo Guide](public/LOGO-GUIDE.md)** - Quick reference for logo files and usage

## 🚀 Quick Start

### Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sky-cybernet.git
   cd sky-cybernet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services with Docker:**
   ```bash
   npm run docker:up
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

See [PRODUCTION.md](PRODUCTION.md) for comprehensive deployment instructions.

**Quick Docker deployment:**
```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f app

# Check health
curl http://localhost:3000/api/health
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Socket.IO Client

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL 16
- Redis 7
- Socket.IO Server

**Infrastructure:**
- Docker & Docker Compose
- Nginx (optional reverse proxy)
- GitHub Actions (CI/CD)

## 📦 Project Structure

```
sky-cybernet/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities and configurations
│   └── [features]/      # Feature-based pages
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── .github/             # GitHub Actions workflows
└── [configs]/           # Configuration files
```

## 🔐 Security

This project implements security best practices:
- ✅ HTTPS/SSL encryption
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ bcrypt password hashing
- ✅ Secure session management
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM)

See [SECURITY.md](SECURITY.md) for details.

## 📊 Monitoring

Built-in monitoring features:
- Health check endpoint: `/api/health`
- Metrics endpoint: `/api/metrics`
- Structured JSON logging
- Error tracking ready (Sentry integration)

See [MONITORING.md](MONITORING.md) for setup instructions.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npm run db:studio       # Open Prisma Studio
npm run db:migrate:dev  # Create migration
npm run db:seed         # Seed database
```

## 📝 Environment Variables

Key environment variables (see `.env.example` for all):

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
COOKIE_SECRET=your-secret-32-chars-min
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sky-cybernet/issues)
- **Security**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities
- **Documentation**: Check the docs in this repository

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Direct messaging
- [ ] Video calls
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Elasticsearch integration
- [ ] S3 file storage

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment tools
- The open-source community

---

**Built with ❤️ and ⚡ by the Sky-Cybernet Team**
