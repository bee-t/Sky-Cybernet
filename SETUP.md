# Setup Guide

This guide covers setting up the project on different platforms.

## Fedora Linux Setup

### Prerequisites

**1. Node.js (v20 or higher)**

```bash
# Option 1: Install from Fedora repos
sudo dnf install nodejs npm

# Option 2: Use nvm for version management (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Restart your terminal
nvm install 20
nvm use 20
```

**2. Docker & Docker Compose**

```bash
# Install Docker and Docker Compose
sudo dnf install docker docker-compose

# Enable and start Docker service
sudo systemctl enable --now docker

# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

**3. Git**

```bash
sudo dnf install git
```

**4. Build Tools** (required for native modules like sharp)

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install gcc-c++ make python3
```

### Quick Install (All at once)

```bash
sudo dnf update -y
sudo dnf install -y nodejs npm docker docker-compose git gcc-c++ make python3
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

**Note:** After running the above, log out and back in for Docker group permissions to take effect.

---

## Project Setup

Once you have the prerequisites installed:

### 1. Clone and Navigate

```bash
cd vellum-local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env if needed (default values work for development)
```

### 4. Start Database Services

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 5. Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
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
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs

---

## Database Options

### Development (SQLite)

Default configuration in `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Production (PostgreSQL)

Update `.env` for PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/skycybernet?schema=public&connection_limit=10&pool_timeout=20"
DATABASE_DIRECT_URL="postgresql://postgres:password@localhost:5432/skycybernet?schema=public"
```

---

## Production Deployment

### Optional: Install Nginx (for reverse proxy)

```bash
sudo dnf install nginx
sudo systemctl enable --now nginx
```

### Build and Start

```bash
npm run build
npm run start:prod
```

---

## Troubleshooting

### Docker Permission Denied

If you get permission errors with Docker:
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### Port Already in Use

If port 3000 is already in use:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

Ensure Docker containers are running:
```bash
docker-compose ps
docker-compose logs postgres
docker-compose logs redis
```

### Native Module Build Errors

Install build tools:
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install gcc-c++ make python3
```

---

## Windows Setup

On Windows, you'll need:
- Node.js (v20+) from https://nodejs.org
- Docker Desktop from https://www.docker.com/products/docker-desktop
- Git from https://git-scm.com

Use PowerShell or Command Prompt for commands:
```powershell
npm install
npm run docker:up
npm run db:push
npm run db:seed
npm run dev
```

---

## macOS Setup

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Follow the Project Setup steps above
```
