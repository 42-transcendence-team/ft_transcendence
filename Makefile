DC		= docker compose

.PHONY: all start stop logs logs-all daemon remove full-remove shell restart re

all: daemon

build: 
	$(DC) build

start: build
	$(DC) up

stop:
	$(DC) down

status:
	$(DC) ps

daemon: build
	$(DC) up -d

logs-all:
	$(DC) logs -f

# Para usar esta regla se debe ejecutar el comando con la variable s, por ejemplo: make logs s=backend
logs:
	$(DC) logs -f $(s)

remove:
	$(DC) down --rmi local --volumes --remove-orphans

full-remove:
	$(DC) down --rmi all --volumes --remove-orphans

build-%: FORCE
	$(DC) build $*
	$(DC) up -d --no-deps $*

build-pgadmin: build-postgres

# Para usar esta regla se debe ejecutar el comando con la variable s, por ejemplo: make shell s=backend
shell:
	$(DC) exec $(s) sh -c "bash || sh"

restart:
	$(DC) restart $(s)

re: remove start

FORCE:
