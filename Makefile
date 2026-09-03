DC      = docker compose

COMPOSE = docker-compose.yml
DEV     = docker-compose.dev.yml
DEV_MIN = docker-compose.dev.min.yml

.PHONY: all start stop status logs logs-all daemon remove full-remove \
        shell restart re build build-% build-pgadmin back \
        dev dev-demon dev-stop dev-remove dev-logs-all dev-logs \
        dev-min dev-min-demon dev-min-stop dev-min-remove \
        dev-min-logs-all dev-min-logs detect help FORCE

# DEFAULT / NORMAL

all: daemon

start: detect
	$(DC) -f $(COMPOSE) up --build

daemon: detect
	$(DC) -f $(COMPOSE) up --build -d

build: detect
	$(DC) -f $(COMPOSE) build

stop:
	$(DC) -f $(COMPOSE) down

status:
	$(DC) -f $(COMPOSE) ps

logs-all:
	$(DC) -f $(COMPOSE) logs -f

# Uso:
#   make logs s=backend
logs:
	$(DC) -f $(COMPOSE) logs -f $(s)

# CLEANUP

remove:
	$(DC) -f $(COMPOSE) down --rmi local --volumes --remove-orphans

full-remove:
	$(DC) -f $(COMPOSE) down --rmi all --volumes --remove-orphans

# DEVELOPMENT

dev: detect
	$(DC) -f $(DEV) up --build

dev-demon: detect
	$(DC) -f $(DEV) up --build -d

dev-stop:
	$(DC) -f $(DEV) down

dev-remove:
	$(DC) -f $(DEV) down --volumes --remove-orphans

dev-logs-all:
	$(DC) -f $(DEV) logs -f

# Uso:
#   make dev-logs s=backend
dev-logs:
	$(DC) -f $(DEV) logs -f $(s)

# DEVELOPMENT MINIMAL
# backend + frontend + postgres + redis + nginx

dev-min: detect
	$(DC) -f $(DEV_MIN) up --build

dev-min-demon: detect
	$(DC) -f $(DEV_MIN) up --build -d

dev-min-stop:
	$(DC) -f $(DEV_MIN) down

dev-min-remove:
	$(DC) -f $(DEV_MIN) down --volumes --remove-orphans

dev-min-logs-all:
	$(DC) -f $(DEV_MIN) logs -f

# Uso:
#   make dev-min-logs s=backend
dev-min-logs:
	$(DC) -f $(DEV_MIN) logs -f $(s)

# INDIVIDUAL SERVICES

# Uso:
#   make build-backend
#   make build-frontend
#   make build-postgres
build-%: FORCE
	$(DC) -f $(COMPOSE) build $*
	$(DC) -f $(COMPOSE) up -d --no-deps $*

build-pgadmin: FORCE
	$(DC) -f $(COMPOSE) build pgadmin
	$(DC) -f $(COMPOSE) up -d postgres pgadmin

back: detect
	$(DC) -f $(COMPOSE) up -d --build postgres redis backend


# SHELL / RESTART

# Uso:
#   make shell s=backend
#   make shell s=postgres
shell:
	$(DC) -f $(COMPOSE) exec $(s) sh -c "bash || sh"

# Uso:
#   make restart s=backend
restart:
	$(DC) -f $(COMPOSE) restart $(s)

# RESET

re: remove start

# DOCKER PATH DETECTION

detect:
	./scripts/detect-docker-paths.sh

# FORCE

FORCE:

# HELP

help:
	@echo ""
	@echo "ft_transcendence - Docker commands"
	@echo ""
	@echo "NORMAL:"
	@echo "  make start              Build + start normal environment"
	@echo "  make daemon             Build + start normal environment detached"
	@echo "  make build              Build all normal images"
	@echo "  make stop               Stop normal environment"
	@echo "  make status             Show normal containers"
	@echo ""
	@echo "LOGS:"
	@echo "  make logs-all           Logs from all normal services"
	@echo "  make logs s=backend     Logs from one normal service"
	@echo ""
	@echo "CLEANUP:"
	@echo "  make remove             Remove containers, volumes and local images"
	@echo "  make full-remove        Remove containers, volumes and project images"
	@echo "  make re                 Remove everything and start again"
	@echo ""
	@echo "SERVICES:"
	@echo "  make build-backend      Rebuild backend"
	@echo "  make build-frontend     Rebuild frontend"
	@echo "  make build-postgres     Rebuild/start postgres"
	@echo "  make build-pgadmin      Build/start pgAdmin"
	@echo "  make back               Start postgres + redis + backend"
	@echo "  make shell s=backend    Open shell in a service"
	@echo "  make restart s=backend  Restart a service"
	@echo ""
	@echo "DEVELOPMENT:"
	@echo "  make dev                Start full development environment"
	@echo "  make dev-demon          Start full development environment detached"
	@echo "  make dev-stop           Stop development environment"
	@echo "  make dev-remove         Stop + remove development volumes"
	@echo "  make dev-logs-all       Logs from all development services"
	@echo "  make dev-logs s=backend Logs from one development service"
	@echo ""
	@echo "LIGHT DEVELOPMENT:"
	@echo "  make dev-min              Start lightweight development environment"
	@echo "  make dev-min-demon        Start lightweight environment detached"
	@echo "  make dev-min-stop         Stop lightweight environment"
	@echo "  make dev-min-remove       Stop + remove lightweight volumes"
	@echo "  make dev-min-logs-all     Logs from all lightweight services"
	@echo "  make dev-min-logs s=backend"
	@echo "                           Logs from one lightweight service"
	@echo ""