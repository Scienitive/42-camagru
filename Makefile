YML_FILE		= ./tools/docker-compose.yml
DEV_YML_FILE	= ./tools/docker-compose-dev.yml
ENV_FILE		= ./tools/.env

all:
	docker-compose -f $(YML_FILE) --env-file $(ENV_FILE) up --build

dev:
	docker-compose -f $(DEV_YML_FILE) --env-file $(ENV_FILE) up -d --build

down:
	docker-compose -f $(YML_FILE) down

devdown:
	docker-compose -f $(DEV_YML_FILE) down

.PHONY: all dev down devdown