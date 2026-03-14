#!/bin/bash
# SKY-CYBERNET - Production Deployment Script
# Strategic Cyber Network - Advanced Digital Operations
# Supports both Docker and Podman container runtimes

set -e  # Exit on error

# Color codes for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting SKY-CYBERNET Production Environment...${NC}"

# Auto-detect container runtime (Podman preferred, Docker fallback)
CONTAINER_RUNTIME=""
COMPOSE_CMD=""

echo -e "\n${YELLOW}📦 Detecting container runtime...${NC}"

# Check for Podman first (preferred on Fedora/RHEL)
if command -v podman > /dev/null 2>&1; then
    if podman info > /dev/null 2>&1; then
        CONTAINER_RUNTIME="podman"
        echo -e "${GREEN}✅ Podman detected${NC}"
        
        # Check for podman-compose
        if command -v podman-compose > /dev/null 2>&1; then
            COMPOSE_CMD="podman-compose"
            echo -e "${GREEN}✅ Using podman-compose${NC}"
        else
            echo -e "${RED}❌ podman-compose not found.${NC}"
            echo -e "${YELLOW}Install with: sudo dnf install podman-compose${NC}"
            exit 1
        fi
    fi
# Fallback to Docker
elif command -v docker > /dev/null 2>&1; then
    if docker info > /dev/null 2>&1; then
        CONTAINER_RUNTIME="docker"
        echo -e "${GREEN}✅ Docker detected${NC}"
        
        # Check for docker compose plugin (v2)
        if docker compose version > /dev/null 2>&1; then
            COMPOSE_CMD="docker compose"
            echo -e "${GREEN}✅ Using Docker Compose V2${NC}"
        # Check for legacy docker-compose
        elif command -v docker-compose > /dev/null 2>&1; then
            COMPOSE_CMD="docker-compose"
            echo -e "${YELLOW}⚠️  Using legacy docker-compose. Consider upgrading to Docker Compose V2.${NC}"
        else
            echo -e "${RED}❌ Docker Compose not found.${NC}"
            echo -e "${YELLOW}Install with: sudo dnf install docker-compose-plugin${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Docker daemon is not running.${NC}"
        echo -e "${YELLOW}Start with: sudo systemctl start docker${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No container runtime found (neither Podman nor Docker).${NC}"
    echo -e "${YELLOW}Install Podman: sudo dnf install podman podman-compose${NC}"
    echo -e "${YELLOW}Or Docker: sudo dnf install docker docker-compose-plugin${NC}"
    exit 1
fi

echo -e "${CYAN}Using: ${CONTAINER_RUNTIME} with ${COMPOSE_CMD}${NC}"

# Start PostgreSQL and Redis
echo -e "\n${YELLOW}📦 Starting PostgreSQL and Redis...${NC}"
$COMPOSE_CMD up -d postgres redis

# Wait for services to be ready
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
PG_READY=false
for ((i=1; i<=30; i++)); do
    if docker exec skycybernet_postgres pg_isready -U postgres > /dev/null 2>&1; then
        PG_READY=true
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

if [ "$PG_READY" = true ]; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    echo -e "${YELLOW}Check logs with: $COMPOSE_CMD logs postgres${NC}"
    exit 1
fi

# Check Redis
echo -e "${YELLOW}Checking Redis...${NC}"
REDIS_READY=false
for ((i=1; i<=30; i++)); do
    if docker exec skycybernet_redis redis-cli ping > /dev/null 2>&1; then
        REDIS_READY=true
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

if [ "$REDIS_READY" = true ]; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    echo -e "${YELLOW}Check logs with: $COMPOSE_CMD logs redis${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file. Please review and update it with your settings.${NC}"
        echo -e "${YELLOW}⚠️  Don't forget to set COOKIE_SECRET and secure passwords!${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Cannot create .env file.${NC}"
        exit 1
    fi
fi

# Generate Prisma Client
echo -e "\n${YELLOW}🔄 Generating Prisma Client...${NC}"
npm run db:generate

# Run database migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
npm run db:push

# Build the application
echo -e "\n${YELLOW}🔨 Building application...${NC}"
npm run build

# Display connection info
echo -e "\n${GREEN}✅ Environment ready!${NC}"
echo -e "\n${CYAN}📊 Service Status:${NC}"
echo -e "   ${WHITE}PostgreSQL: localhost:5432${NC}"
echo -e "   ${WHITE}Redis:      localhost:6379${NC}"

echo -e "\n${CYAN}🌐 Next Steps:${NC}"
echo -e "   ${WHITE}1. Start the app:     npm start${NC}"
echo -e "   ${WHITE}2. View logs:         $COMPOSE_CMD logs -f${NC}"
echo -e "   ${WHITE}3. Stop services:     $COMPOSE_CMD down${NC}"
echo -e "   ${WHITE}4. Database GUI:      npm run db:studio${NC}"

echo -e "\n${CYAN}📝 Production Setup:${NC}"
echo -e "   ${WHITE}• Configure nginx (see nginx.conf)${NC}"
echo -e "   ${WHITE}• Set up SSL/TLS certificates${NC}"
echo -e "   ${WHITE}• Configure firewall rules${NC}"
echo -e "   ${WHITE}• Review PRODUCTION.md for full checklist${NC}"

echo -e "\n${GREEN}🎉 Deployment preparation complete!${NC}\n"
