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

.PHONY: all up build down stop start restart ps logs logs-frontend logs-backend logs-db db clean fclean re
