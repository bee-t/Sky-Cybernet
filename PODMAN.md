# Podman Configuration for Sky-Cybernet

This guide covers running Sky-Cybernet with Podman instead of Docker, which is preferred in many enterprise and strict security environments, especially on Fedora/RHEL systems.

## Why Podman?

- **Rootless by default** - Enhanced security
- **No daemon** - Reduced attack surface
- **SELinux-friendly** - Better integration with security policies
- **Drop-in Docker replacement** - Compatible with docker-compose
- **Enterprise-supported** - Red Hat backing

## Installation on Fedora

```bash
# Install Podman and podman-compose
sudo dnf install -y podman podman-compose podman-docker

# Optional: Install docker-compose compatibility
sudo dnf install -y podman-compose

# Verify installation
podman --version
podman-compose --version

# Enable podman socket (if you need docker.sock compatibility)
systemctl --user enable --now podman.socket
```

## Rootless Setup (Recommended)

Rootless Podman runs without elevated privileges, enhancing security:

```bash
# Configure subuid and subgid (usually automatic)
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER

# Verify configuration
podman system migrate
podman info | grep rootless

# Configure ports for rootless (allows binding to ports < 1024)
echo "net.ipv4.ip_unprivileged_port_start=80" | sudo tee /etc/sysctl.d/podman-privileged-ports.conf
sudo sysctl --system
```

## Using Podman with Sky-Cybernet

### Method 1: Alias Docker Commands (Simplest)

Podman provides Docker CLI compatibility:

```bash
# Create alias (add to ~/.bashrc for persistence)
alias docker=podman
alias docker-compose=podman-compose

# Or use podman-docker package (system-wide alias)
sudo dnf install podman-docker

# Now all docker commands work with podman
docker ps
docker-compose up -d
```

### Method 2: Use Podman Commands Directly

```bash
# Start services
podman-compose up -d

# Or using podman directly
podman pod create --name skycybernet -p 3000:3000 -p 5432:5432 -p 6379:6379

# List containers
podman ps

# View logs
podman-compose logs -f
```

## Modified docker-compose.yml for Podman

Create `docker-compose.podman.yml` for Podman-specific optimizations:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: skycybernet_postgres
    # Podman uses 'always' or 'on-failure' for restart policies
    restart: on-failure:5
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-skycybernet}
    # Bind to localhost only for strict security
    ports:
      - "127.0.0.1:${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data:Z  # :Z for SELinux
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    # Podman-specific security options
    security_opt:
      - label=type:container_runtime_t

  redis:
    image: redis:7-alpine
    container_name: skycybernet_redis
    restart: on-failure:5
    ports:
      - "127.0.0.1:${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data:Z
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    security_opt:
      - label=type:container_runtime_t

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: skycybernet_app
    restart: on-failure:5
    ports:
      - "127.0.0.1:${PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-skycybernet}?schema=public
      DATABASE_DIRECT_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-skycybernet}?schema=public
      REDIS_URL: redis://redis:6379
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      COOKIE_SECRET: ${COOKIE_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
    volumes:
      - uploads_data:/app/public/uploads:Z
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - app-network
    security_opt:
      - label=type:container_runtime_t

volumes:
  postgres_data:
  redis_data:
  uploads_data:

networks:
  app-network:
```

## Podman-Compatible Deployment Script

The `deploy.sh` script has been updated to auto-detect Podman:

```bash
#!/bin/bash
# Automatically detects and uses Podman or Docker

# Check for container runtime
if command -v podman &> /dev/null; then
    CONTAINER_RUNTIME="podman"
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        echo "podman-compose not found. Install with: sudo dnf install podman-compose"
        exit 1
    fi
elif command -v docker &> /dev/null; then
    CONTAINER_RUNTIME="docker"
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    fi
fi

echo "Using container runtime: $CONTAINER_RUNTIME"
echo "Using compose command: $COMPOSE_CMD"

$COMPOSE_CMD up -d
```

## Systemd Integration (Rootless)

Generate systemd units for rootless Podman:

```bash
# Generate systemd unit files from running containers
cd ~/sky-cybernet
podman-compose up -d

# Generate user systemd units
podman generate systemd --new --files --name skycybernet_postgres
podman generate systemd --new --files --name skycybernet_redis
podman generate systemd --new --files --name skycybernet_app

# Move to user systemd directory
mkdir -p ~/.config/systemd/user/
mv container-*.service ~/.config/systemd/user/

# Enable and start
systemctl --user daemon-reload
systemctl --user enable --now container-skycybernet_postgres
systemctl --user enable --now container-skycybernet_redis
systemctl --user enable --now container-skycybernet_app

# Enable linger (services start on boot without login)
loginctl enable-linger $USER
```

## SELinux Configuration for Podman

```bash
# Allow Podman containers to access required resources
sudo setsebool -P container_manage_cgroup on
sudo setsebool -P virt_use_nfs on  # If using NFS volumes
sudo setsebool -P virt_use_samba on  # If using SMB volumes

# For custom port access
sudo semanage port -a -t http_port_t -p tcp 3000

# Verify SELinux labels on volumes
ls -Z ~/sky-cybernet/public/uploads

# Fix labels if needed
podman unshare chown -R 0:0 ~/sky-cybernet/public/uploads
```

## Networking Considerations

### Rootless Network Restrictions

Rootless Podman has network limitations:

```bash
# Option 1: Use slirp4netns (default, slower)
# Already enabled by default

# Option 2: Use pasta (faster, Fedora 38+)
# Automatically used on newer systems

# Option 3: Use host network (loses isolation)
podman run --network host ...

# Check network mode
podman info | grep -A5 "Network Backend"
```

### Port Binding for Rootless

```bash
# Allow binding to privileged ports (< 1024) without root
echo "net.ipv4.ip_unprivileged_port_start=80" | sudo tee /etc/sysctl.d/podman-ports.conf
sudo sysctl --system

# Or use port forwarding via firewall
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=3000
sudo firewall-cmd --reload
```

## Troubleshooting Podman

### Permission Issues

```bash
# Reset Podman storage
podman system reset

# Check subuid/subgid
cat /etc/subuid
cat /etc/subgid

# Reconfigure if needed
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER
podman system migrate
```

### SELinux Denials

```bash
# Check for denials
sudo ausearch -m avc -ts recent | grep podman

# Generate and apply policy (if needed)
sudo ausearch -m avc -ts recent | audit2allow -M mypodman
sudo semodule -i mypodman.pp
```

### Volume Mount Issues

```bash
# Volumes need :Z or :z suffix for SELinux
podman run -v /path:/path:Z  # Private label
podman run -v /path:/path:z  # Shared label

# Or disable SELinux labeling (not recommended)
podman run --security-opt label=disable ...
```

### Performance

```bash
# Use overlay storage driver
# Already default, verify with:
podman info | grep -i "storage driver"

# Optimize for performance
cat > ~/.config/containers/storage.conf <<EOF
[storage]
driver = "overlay"
[storage.options.overlay]
mount_program = "/usr/bin/fuse-overlayfs"
EOF
```

## Comparison: Docker vs Podman

| Feature | Docker | Podman |
|---------|--------|--------|
| Daemon | Required | Daemonless |
| Root Access | Usually needs root | Rootless by default |
| SystemD | Separate service | Native integration |
| SELinux | Basic support | Full integration |
| Docker CLI | Native | Compatible |
| docker-compose | Native | podman-compose |
| Security | Good | Better (rootless) |
| Container Registry | Docker Hub | Any OCI registry |

## Migration Checklist

Migrating from Docker to Podman:

- [ ] Install Podman and podman-compose
- [ ] Test `podman run hello-world`
- [ ] Verify rootless setup: `podman info | grep rootless`
- [ ] Configure subuid/subgid mappings
- [ ] Update deploy scripts to detect Podman
- [ ] Add :Z labels to volume mounts for SELinux
- [ ] Change restart policies to `on-failure`
- [ ] Configure privileged port access if needed
- [ ] Test with podman-compose
- [ ] Generate systemd units
- [ ] Enable lingering for auto-start
- [ ] Test SELinux in enforcing mode
- [ ] Verify firewall rules
- [ ] Update backup scripts
- [ ] Document any custom configurations

## Production Recommendations

For production Podman deployments:

1. **Use rootless mode** for enhanced security
2. **Enable SELinux** in enforcing mode
3. **Use systemd units** for service management
4. **Configure lingering** for auto-start
5. **Bind to 127.0.0.1** and proxy through nginx
6. **Use :Z labels** on all volumes
7. **Monitor with journalctl** --user
8. **Set up pod restart** policies
9. **Configure resource limits** with systemd
10. **Use podman auto-update** for container images

## Resources

- [Podman Documentation](https://docs.podman.io/)
- [Rootless Containers](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md)
- [Podman Compose](https://github.com/containers/podman-compose)
- [Fedora Podman Guide](https://docs.fedoraproject.org/en-US/fedora-silverblue/toolbox/)

## Quick Commands Reference

```bash
# Installation
sudo dnf install podman podman-compose podman-docker

# Basic operations
podman ps
podman images
podman volume ls
podman network ls

# Compose operations
podman-compose up -d
podman-compose down
podman-compose logs -f

# Systemd
systemctl --user status container-skycybernet_app
journalctl --user -u container-skycybernet_app -f

# Maintenance
podman system prune -a
podman volume prune
podman system df

# Info and debugging
podman info
podman version
podman inspect <container>
```
