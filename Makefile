YML_FILE		= ./docker-compose.yml
DEV_YML_FILE	= ./docker-compose-dev.yml

all:
	docker-compose -f $(YML_FILE) up --build

dev:
	docker-compose -f $(DEV_YML_FILE) up -d --build

down:
	docker-compose -f $(YML_FILE) down

devdown:
	docker-compose -f $(DEV_YML_FILE) down

.PHONY: all dev down devdown