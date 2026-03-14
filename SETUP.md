# Setup Guide

This guide covers setting up the project on different platforms.

## Fedora Linux Setup

### Prerequisites

**1. Node.js (v20 or higher)**

```bash
# Option 1: Install from Fedora repos
sudo dnf install nodejs npm

# Option 2: Use nvm for version management (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart your terminal or source your profile
source ~/.bashrc  # or ~/.zshrc if using zsh
nvm install 20
nvm use 20
nvm alias default 20
```

**2. Docker & Docker Compose Plugin**

```bash
# Install Docker (includes Compose V2 plugin)
sudo dnf install docker docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable --now docker

# Add your user to the docker group
sudo usermod -aG docker $USER

# IMPORTANT: Log out and back in for group changes to take effect
```

**Alternative: Podman (Recommended for Fedora/RHEL)**

Podman is a rootless, daemonless container engine preferred in enterprise environments:

```bash
# Install Podman and podman-compose
sudo dnf install podman podman-compose podman-docker

# Optional: Docker CLI compatibility layer
# This allows 'docker' commands to work with Podman
sudo dnf install podman-docker

# Verify installation
podman --version
podman-compose --version

# No daemon needed - Podman is ready to use!
# For detailed Podman setup, see PODMAN.md
```

**Why Podman?**
- ✅ Rootless by default (better security)
- ✅ No daemon (reduced attack surface)
- ✅ Better SELinux integration
- ✅ Drop-in Docker replacement
- ✅ Preferred for strict security environments

See [PODMAN.md](PODMAN.md) for complete Podman setup and configuration.

**3. Git**

```bash
sudo dnf install git
```

**4. Build Tools & Dependencies**

Required for native modules (sharp, ffmpeg, etc.):

```bash
# Install development tools
sudo dnf groupinstall "Development Tools"

# Install required libraries for image processing (sharp)
sudo dnf install gcc-c++ make python3 vips vips-devel

# Install FFmpeg for video processing
sudo dnf install ffmpeg
```

**5. SELinux Configuration (Optional but Recommended)**

If you encounter permission issues with Docker volumes:

```bash
# Check SELinux status
getenforce

# If SELinux is enforcing, allow Docker to access host volumes
sudo setsebool -P container_manage_cgroup on

# Or, for development, you can temporarily set to permissive mode:
# sudo setenforce 0
# Note: This resets on reboot. To make permanent, edit /etc/selinux/config
```

### Quick Install (All at once)

```bash
# Update system and install all prerequisites
sudo dnf update -y
sudo dnf install -y nodejs npm docker docker-compose-plugin git gcc-c++ make python3 vips vips-devel ffmpeg

# Enable and start Docker
sudo systemctl enable --now docker

# Add user to docker group
sudo usermod -aG docker $USER

# Configure SELinux for Docker (optional)
sudo setsebool -P container_manage_cgroup on 2>/dev/null || true

echo "✅ Installation complete! Please log out and back in for Docker permissions to take effect."
```

**Note:** After running the above, **log out and back in** (or run `newgrp docker`) for Docker group permissions to take effect.

---

## Project Setup

Once you have the prerequisites installed:

### 1. Clone and Navigate

```bash
git clone <repository-url> sky-cybernet
cd sky-cybernet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and configure your settings
# For development, you can use the default values
nano .env  # or use your preferred editor
```

**Important environment variables to configure:**
- `COOKIE_SECRET` - Generate with: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Set a secure password
- `DATABASE_URL` - Will use Docker PostgreSQL by default
- `REDIS_URL` - Will use Docker Redis by default

### 4. Start Database Services

```bash
# Start PostgreSQL and Redis containers
docker compose up -d
# Note: Modern Docker uses 'docker compose' (with space), not 'docker-compose' (hyphenated)
# If using Podman: podman-compose up -d

# Verify containers are running
docker compose ps

# Check container health
docker compose logs postgres
docker compose logs redis
```

**For Strict Security/Firewall Environments:**

Use the security-hardened compose file that binds all services to localhost only:

```bash
# Use secure configuration (localhost binding only)
docker compose -f docker-compose.secure.yml up -d
# or with Podman:
# podman-compose -f docker-compose.secure.yml up -d

# Access application through nginx reverse proxy
# See FIREWALL.md for complete security hardening guide
```

The secure configuration:
- ✅ Binds all ports to 127.0.0.1 (localhost only)
- ✅ Adds SELinux labels (:Z) for proper context
- ✅ Drops unnecessary capabilities
- ✅ Adds resource limits
- ✅ Uses no-new-privileges security option

See [FIREWALL.md](FIREWALL.md) for strict firewall configurations.

### 5. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

---

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:prod` - Start production server (alternative)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:dev` - Run migrations in development
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs
- `npm run docker:clean` - Stop containers and remove volumes
- `npm run health` - Check application health endpoint

---

## Database Options

### Development (SQLite)

For simple local development without Docker:
```env
DATABASE_URL="file:./prisma/dev.db"
```

Then run:
```bash
npm run db:push
npm run dev
```

### Production (PostgreSQL with Docker)

Default configuration in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/skycybernet?schema=public&connection_limit=10&pool_timeout=20"
DATABASE_DIRECT_URL="postgresql://postgres:password@localhost:5432/skycybernet?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_DB="skycybernet"
```

Then run:
```bash
docker compose up -d
npm run db:push
```

---

## Production Deployment on Fedora

### Setup Nginx (Reverse Proxy - Recommended)

```bash
# Install Nginx
sudo dnf install nginx

# Enable and start
sudo systemctl enable --now nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start with Docker (recommended)
docker compose --profile production up -d

# Or run directly
npm run start:prod
```

### Setup as Systemd Service (Optional)

Create `/etc/systemd/system/skycybernet.service`:
```ini
[Unit]
Description=Sky-Cybernet Application
After=network.target postgresql.service redis.service

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

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable skycybernet
sudo systemctl start skycybernet
sudo systemctl status skycybernet
```

---

## Troubleshooting

### Docker Permission Denied

If you get permission errors with Docker:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply changes immediately (or log out and back in)
newgrp docker

# Verify
docker ps
```

### SELinux Permission Issues (Fedora/RHEL)

If containers can't access volumes:
```bash
# Check SELinux status
getenforce

# Allow Docker container management
sudo setsebool -P container_manage_cgroup on

# For persistent development, consider permissive mode:
sudo setenforce 0
# To make permanent: edit /etc/selinux/config and set SELINUX=permissive
```

### Port Already in Use

If port 3000, 5432, or 6379 is already in use:
```bash
# Find process using the port (e.g., 3000)
sudo lsof -ti:3000
# or
sudo ss -tlnp | grep :3000

# Kill the process
sudo kill -9 $(sudo lsof -ti:3000)

# Or change port in .env file:
# PORT=3001
```

### Database Connection Issues

Ensure Docker containers are running and healthy:
```bash
# Check container status
docker compose ps

# View logs
docker compose logs postgres
docker compose logs redis

# Restart containers
docker compose restart

# Full reset (warning: destroys data)
docker compose down -v
docker compose up -d
```

### Native Module Build Errors (sharp, ffmpeg)

If npm install fails with native module errors:
```bash
# Fedora/RHEL - Install all required dependencies
sudo dnf install -y gcc-c++ make python3 vips vips-devel ffmpeg

# Ubuntu/Debian
sudo apt-get install -y build-essential python3 libvips-dev ffmpeg

# Then reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Generation Issues

If Prisma Client fails to generate:
```bash
# Manually generate
npx prisma generate

# If schema has errors
npx prisma validate

# Force regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

### Container Name Conflicts

If you see "container name already in use":
```bash
# Remove old containers
docker compose down
docker rm -f skycybernet_postgres skycybernet_redis skycybernet_app

# Restart
docker compose up -d
```

### Firewall Issues (Fedora)

If you can't access the application from other devices:
```bash
# Allow ports through firewall
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload

# Or add service
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Windows Setup

### Prerequisites

1. **Node.js** (v20+) - Download from https://nodejs.org
2. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop
3. **Git** - Download from https://git-scm.com

### Setup Steps

Open PowerShell or Command Prompt as Administrator:

```powershell
# Clone repository
git clone <repository-url> sky-cybernet
cd sky-cybernet

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your settings (use notepad or your preferred editor)
notepad .env

# Start Docker containers (make sure Docker Desktop is running)
npm run docker:up

# Initialize database
npm run db:push
npm run db:seed

# Run development server
npm run dev
```

### Using the Deployment Script

```powershell
# Automated deployment (starts containers, waits for health checks)
npm run deploy
```

---

## macOS Setup

### Prerequisites

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Git (usually pre-installed)
brew install git
```

### Docker Desktop

Download and install from https://www.docker.com/products/docker-desktop

### Setup Steps

```bash
# Clone repository
git clone <repository-url> sky-cybernet
cd sky-cybernet

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use VS Code: code .env

# Start Docker containers
docker compose up -d

# Initialize database
npm run db:push
npm run db:seed

# Run development server
npm run dev
```

---

## Additional Platform Notes

### Ubuntu/Debian Linux

Similar to Fedora, but use `apt` instead of `dnf`:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y nodejs npm docker.io docker-compose-plugin git build-essential libvips-dev ffmpeg

# Enable Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Log out and back in, then follow Project Setup steps
```

### Arch Linux

```bash
# Install prerequisites
sudo pacman -Syu nodejs npm docker docker-compose git base-devel libvips ffmpeg

# Enable Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Log out and back in, then follow Project Setup steps
```

---

## Quick Reference Commands

### Development
```bash
docker compose up -d        # Start services
npm run dev                 # Start dev server
npm run db:studio           # Open database GUI
```

### Production
```bash
npm run build               # Build application
npm run start:prod          # Start production server
docker compose --profile production up -d  # Full production stack
```

### Database
```bash
npm run db:push             # Update database schema
npm run db:seed             # Add sample data
npm run db:migrate          # Run migrations
```

### Docker Management
```bash
docker compose ps           # List containers
docker compose logs -f      # Follow logs
docker compose restart      # Restart all
docker compose down         # Stop all
docker compose down -v      # Stop and remove volumes (DELETES DATA)
```
