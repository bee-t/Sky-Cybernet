# SKY-CYBERNET - Production Deployment Script
# Strategic Cyber Network - Advanced Digital Operations

Write-Host "🚀 Starting SKY-CYBERNET Production Environment..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL and Redis
Write-Host "`n📦 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check PostgreSQL
$pgReady = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        docker exec vellum_postgres pg_isready -U postgres | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $pgReady = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

if ($pgReady) {
    Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

# Check Redis
$redisReady = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        docker exec vellum_redis redis-cli ping | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $redisReady = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

if ($redisReady) {
    Write-Host "✅ Redis is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Redis failed to start" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Yellow
npm run db:migrate

# Build the application
Write-Host "`n🔨 Building application..." -ForegroundColor Yellow
npm run build

# Display connection info
Write-Host "`n✅ Environment ready!" -ForegroundColor Green
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   Redis:      localhost:6379" -ForegroundColor White
Write-Host "`n🌐 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start the app:     npm start" -ForegroundColor White
Write-Host "   2. View logs:         docker-compose logs -f" -ForegroundColor White
Write-Host "   3. Stop services:     docker-compose down" -ForegroundColor White
Write-Host "`n📝 Configure nginx:" -ForegroundColor Cyan
Write-Host "   See nginx.conf for production web server setup" -ForegroundColor White
