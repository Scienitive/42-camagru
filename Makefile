YML_FILE		= ./tools/docker-compose.yml
ENV_FILE		= ./tools/.env

all:
	docker-compose -f $(YML_FILE) --env-file $(ENV_FILE) up -d --build

tail:
	docker-compose -f $(YML_FILE) --env-file $(ENV_FILE) up --build

down:
	docker-compose -f $(YML_FILE) down

.PHONY: all dev down devdown