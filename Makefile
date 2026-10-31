NAME = transcendence

COMPOSE = docker compose

all: up

up:
	$(COMPOSE) up -d --build

build:
	$(COMPOSE) build

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

start:
	$(COMPOSE) start

restart: down up

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-backend:
	$(COMPOSE) logs -f backend

logs-db:
	$(COMPOSE) logs -f db

# Start only PostgreSQL, useful for local Prisma commands.
db:
	$(COMPOSE) up -d db

clean:
	$(COMPOSE) down --remove-orphans

# Full reset including Docker images and the PostgreSQL volume.
fclean:
	$(COMPOSE) down -v --rmi all --remove-orphans

re: fclean all

# On Windows, install cloudflared if missing, then start a temporary public tunnel.
tunnel:
	powershell -NoProfile -Command "if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) { winget install --exact --id Cloudflare.cloudflared; if ($$LASTEXITCODE -ne 0) { exit $$LASTEXITCODE }; $$env:Path += ';' + [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine'); }; cloudflared tunnel --url https://localhost:8443 --http-host-header localhost --no-tls-verify"

.PHONY: all up build down stop start restart ps logs logs-frontend logs-backend logs-db db clean fclean re tunnel
