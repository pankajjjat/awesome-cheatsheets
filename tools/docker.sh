##############################################################################
# DOCKER — MODERN CHEATSHEET (Docker Engine 24+ / Compose V2)
# All commands use the modern `docker compose` (v2) subcommand.
##############################################################################

##############################################################################
# INSTALLATION & SETUP
##############################################################################

docker version                       # Show Docker version info
docker info                          # System-wide info
docker system df                     # Disk usage

# BuildKit — enabled by default in Docker 23+, but verify:
docker buildx version                # BuildKit builder version
docker buildx ls                     # List builders
docker buildx create --name mybuilder --use   # Create custom builder
docker buildx inspect --bootstrap    # Initialize builder

# Environment variables
# DOCKER_BUILDKIT=1          # Force BuildKit (legacy opt-in)
# COMPOSE_FILE=docker-compose.yml
# DOCKER_HOST=tcp://...
# DOCKER_CONTEXT=mycontext

##############################################################################
# IMAGES
##############################################################################

docker images -a                     # List all images
docker pull ubuntu:24.04             # Pull image from registry
docker push user/repo:tag            # Push image to registry
docker rmi <image>                   # Remove image
docker rmi $(docker images -q)       # Remove all images
docker rmi $(docker images -f "dangling=true" -q)  # Remove dangling images

docker tag <image> user/repo:tag     # Tag image for registry
docker save -o image.tar <image>     # Save image to tarball
docker load -i image.tar             # Load image from tarball

docker image prune                   # Remove unused images
docker image prune -a                # Remove all unused images (not just dangling)
docker system prune                  # Clean up containers, networks, images
docker system prune -a --volumes     # Full cleanup

# Image history & inspection
docker history <image>               # Show image layers
docker inspect <image>               # Detailed JSON metadata
docker image ls --filter "label=maintainer=..."  # Filter by label

##############################################################################
# BUILDING (Dockerfile & BuildKit)
##############################################################################

docker build -t myapp:latest .        # Build image from Dockerfile (cwd)
docker build -t myapp:latest -f Dockerfile.prod .   # Custom Dockerfile
docker build --no-cache -t myapp .    # Build without cache
docker build --target builder -t myapp:build .  # Build specific stage

# Multi-stage build: use with --target
# Dockerfile:
#   FROM node:20-alpine AS builder
#   COPY . .
#   RUN npm ci && npm run build
#
#   FROM nginx:alpine
#   COPY --from=builder /app/dist /usr/share/nginx/html

# Build arguments
docker build --build-arg VERSION=1.2.3 -t myapp .
# Dockerfile: ARG VERSION

# BuildKit-specific features
docker build --secret id=mysecret,src=./secret.txt -t myapp .
# Dockerfile: RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret

docker build --ssh default -t myapp .
# Dockerfile: RUN --mount=type=ssh git clone git@github.com:org/repo.git

# Cache mounts (speeds up package installs)
# RUN --mount=type=cache,target=/root/.npm npm ci

# Export/import with BuildKit
docker buildx build --platform linux/amd64,linux/arm64 -t user/app --push .
# Cross-platform build & push (requires builders with multi-arch support)

##############################################################################
# CONTAINERS (Run / Exec / Logs)
##############################################################################

docker run -d --name myapp -p 8080:80 myimage:tag    # Detached, port mapping
docker run -it --rm ubuntu:24.04 bash                  # Interactive, auto-remove
docker run --env-file .env myapp                        # Env file
docker run -e DB_HOST=localhost -e DB_PORT=5432 myapp  # Env variables
docker run -v /host/path:/container/path myapp         # Bind mount
docker run -v myvolume:/data myapp                     # Named volume
docker run --network my-network myapp                  # Attach network
docker run --restart unless-stopped myapp              # Restart policy
docker run --pull always myapp                         # Always pull latest
docker run --init myapp                                # Init process (zombie reaping)
docker run --read-only --tmpfs /tmp myapp              # Read-only root fs

docker ps                                # Running containers
docker ps -a                             # All containers
docker ps -q                             # Quiet (IDs only)
docker ps --filter "name=myapp"          # Filter
docker ps --format "table {{.Names}}\t{{.Status}}"  # Custom format

docker stop <container>                  # Graceful stop (SIGTERM)
docker kill <container>                  # Force kill (SIGKILL)
docker restart <container>               # Restart
docker pause <container>                 # Pause all processes
docker unpause <container>

docker rm <container>                    # Remove container
docker rm -f <container>                 # Force remove (running)
docker rm $(docker ps -a -q)             # Remove all containers
docker container prune                   # Remove stopped containers

docker exec -it <container> bash         # Interactive shell
docker exec <container> ls -la           # Run command in container
docker cp <container>:/path ./local      # Copy from container
docker cp ./local <container>:/path      # Copy to container

# Logs
docker logs <container>                  # Show logs
docker logs -f <container>               # Follow (tail -f)
docker logs --tail 100 <container>       # Last N lines
docker logs --since 5m <container>       # Since time
docker logs --until 2m <container>       # Until time
docker logs -t <container>               # With timestamps

docker stats                              # Live container resource usage
docker stats --no-stream <container>      # One-shot stats
docker top <container>                    # Processes in container
docker inspect <container>                # Detailed JSON metadata
docker diff <container>                   # Changed files

##############################################################################
# DOCKER COMPOSE V2 (modern `docker compose` — no hyphen)
##############################################################################

docker compose up                        # Create and start containers
docker compose up -d                     # Detached mode
docker compose down                      # Stop and remove containers, networks
docker compose down -v                   # Also remove volumes
docker compose down --rmi all            # Also remove images
docker compose restart                   # Restart all services
docker compose ps                        # List containers for this compose
docker compose ls                        # List running compose projects

docker compose logs -f                   # Follow logs from all services
docker compose logs <service>            # Logs for specific service
docker compose exec <service> bash       # Exec into service container
docker compose run --rm <service> cmd    # Run one-off command

docker compose build                     # Build or rebuild all services
docker compose build --no-cache          # Build without cache
docker compose build <service>           # Build specific service
docker compose pull                      # Pull all service images
docker compose push                      # Push all service images

docker compose config                    # Validate and view compose file
docker compose config --services         # List service names
docker compose config --volumes          # List volume names
docker compose images                    # List images used by services
docker compose top                       # Show running processes
docker compose version                   # Show Compose version

# Scaling
docker compose up -d --scale web=3       # Scale web service to 3 replicas

# Watch mode (Docker Compose 2.23+)
docker compose watch                     # Auto-rebuild/reload on file changes

docker-compose.yml example:
# version: '3'  # No longer needed — Compose V2 infers
# services:
#   web:
#     build: .
#     ports:
#       - "8080:80"
#     volumes:
#       - .:/app
#     environment:
#       - NODE_ENV=development
#     depends_on:
#       - db
#     healthcheck:
#       test: ["CMD", "curl", "-f", "http://localhost/health"]
#       interval: 30s
#       timeout: 5s
#       retries: 3
#       start_period: 10s
#
#   db:
#     image: postgres:16-alpine
#     volumes:
#       - pgdata:/var/lib/postgresql/data
#     environment:
#       POSTGRES_PASSWORD_FILE: /run/secrets/db_pass
#     secrets:
#       - db_pass
#
# volumes:
#   pgdata:
#
# secrets:
#   db_pass:
#     file: ./secrets/db_password.txt

# Include mode (Compose 2.20+)
# include:
#   - path: ./base.yml
#   - path: ./override.yml

##############################################################################
# VOLUMES & NETWORKS
##############################################################################

docker volume ls                        # List volumes
docker volume create myvolume           # Create volume
docker volume inspect myvolume          # Volume details
docker volume prune                     # Remove unused volumes
docker volume rm myvolume               # Remove specific volume

docker network ls                       # List networks
docker network create mynetwork         # Create network
docker network create --driver bridge mynetwork
docker network create --driver overlay mynetwork  # Swarm overlay
docker network inspect mynetwork        # Network details
docker network connect mynetwork <container>     # Connect container
docker network disconnect mynetwork <container>  # Disconnect container
docker network prune                    # Remove unused networks

##############################################################################
# HEALTHCHECKS
##############################################################################

# In Dockerfile:
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost/health || exit 1

# In docker compose:
# healthcheck:
#   test: ["CMD-SHELL", "pg_isready -U postgres"]
#   interval: 10s
#   timeout: 5s
#   retries: 5
#   start_period: 30s

docker inspect --format='{{json .State.Health}}' <container>  # Check health

##############################################################################
# DOCKER SCOUT (Supply Chain — Docker 24+)
##############################################################################

docker scout quickview <image>          # Quick vulnerability overview
docker scout cves <image>               # Full CVE list
docker scout compare <image1> <image2>  # Compare two images
docker scout recommendations <image>    # Base image recommendations
docker scout sbom <image>               # Software Bill of Materials
docker scout cache                      # Manage cache

# Enable in CI:
# docker scout cves --only-severity critical,high --exit-code <image>

##############################################################################
# REGISTRY & AUTH
##############################################################################

docker login                            # Login to Docker Hub
docker login myregistry.com             # Login to private registry
docker logout                           # Logout

# Docker Hub rate limits — use Docker Scout or mirror registry

##############################################################################
# DOCKERFILE BEST PRACTICES
##############################################################################

# .dockerignore (always use one):
#   node_modules/
#   .git/
#   .env
#   *.md
#   Dockerfile
#   .dockerignore

# Multi-stage build pattern:
#   # Stage 1: Build
#   FROM node:20-alpine AS builder
#   WORKDIR /app
#   COPY package*.json ./
#   RUN npm ci --only=production
#   COPY . .
#   RUN npm run build
#
#   # Stage 2: Runtime
#   FROM node:20-alpine
#   RUN addgroup -S app && adduser -S app -G app
#   WORKDIR /app
#   COPY --from=builder --chown=app:app /app/dist ./dist
#   COPY --from=builder /app/package.json ./
#   COPY --from=builder /app/node_modules ./node_modules
#   USER app
#   EXPOSE 3000
#   HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
#   CMD ["node", "dist/server.js"]

# Dockerfile tips:
#   - Order layers from least to most frequently changing
#   - Use specific tags (node:20-alpine NOT node:latest)
#   - Prefer COPY over ADD (unless extracting tar.gz or using URLs)
#   - Combine RUN commands to reduce layers
#   - Set WORKDIR, not cd
#   - Use LABEL for metadata
#   - Use ARG for build-time, ENV for runtime
#   - EXPOSE is documentation only
#   - Use --no-cache for apt/apk to reduce image size

##############################################################################
# DOCKER SWARM (Orchestration)
##############################################################################

docker swarm init                       # Initialize swarm
docker swarm join --token <token> <ip>:2377  # Join as worker
docker swarm leave                      # Leave swarm
docker swarm leave --force              # Force leave (manager)
docker node ls                          # List nodes
docker node inspect <node>              # Inspect node
docker node update --availability drain <node>  # Drain node

docker service create --name web -p 80:80 --replicas 3 nginx  # Create service
docker service ls                                               # List services
docker service ps <service>                                     # List service tasks
docker service scale web=5                                       # Scale service
docker service update --image nginx:alpine web                  # Update service
docker service logs <service>                                    # Service logs
docker service rm <service>                                      # Remove service

docker stack deploy -c docker-compose.yml mystack    # Deploy stack
docker stack ls                                        # List stacks
docker stack services mystack                          # Stack services
docker stack ps mystack                                # Stack tasks
docker stack rm mystack                                # Remove stack

##############################################################################
# DOCKER BUILDX (Multi-platform builds)
##############################################################################

docker buildx create --name multiarch --driver docker-container --use
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t user/app .
docker buildx build --platform linux/amd64,linux/arm64 -t user/app --push .
docker buildx rm multiarch

# Bake (HCL-based build definition)
# docker buildx bake -f docker-bake.hcl

##############################################################################
# TROUBLESHOOTING & DEBUG
##############################################################################

docker logs <container> -f              # Tail logs
docker inspect <container>              # Full container details
docker exec -it <container> sh          # Shell into running container
docker stats <container>                # Resource usage
docker events                           # Real-time events from daemon
docker system events --since 1h         # Events from last hour
docker system prune                     # Full cleanup
docker system df                        # Disk usage
docker container ls --filter "status=exited"  # Find exited containers
docker restart $(docker ps -q)          # Restart all running containers
