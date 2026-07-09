NAME = transcendence

all: up

up:
	docker compose up -d --build

build:
	docker compose build

down:
	docker compose down

stop:
	docker compose stop

restart: down up

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-db:
	docker compose logs -f db

db:
	docker compose up -d db

clean:
	docker compose down --remove-orphans

fclean:
	docker compose down -v --rmi all --remove-orphans

re: fclean all

.PHONY: all up build down stop restart ps logs logs-backend logs-db db migrate migrate-status migrate-deploy clean fclean re
