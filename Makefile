NAME			= camagru
YML_FILE		= ./tools/docker-compose.yml
ENV_FILE		= ./tools/.env

all:
	npx babel ./src/public/js/main.js --out-file ./src/public/js/script.js

run:
	docker-compose -p $(NAME) -f $(YML_FILE) --env-file $(ENV_FILE) up -d --build

tail:
	docker-compose -p $(NAME) -f $(YML_FILE) --env-file $(ENV_FILE) up --build

down:
	docker-compose -p $(NAME) -f $(YML_FILE) down

.PHONY: all dev down devdown