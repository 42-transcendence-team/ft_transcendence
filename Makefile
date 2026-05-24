DC		= docker compose
DEV 	= docker-compose.dev.yml

.PHONY: all start stop logs logs-all daemon remove full-remove shell restart re dev dev-demon dev-stop dev-remove dev-logs-all dev-logs

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

dev:
	$(DC) -f $(DEV) up --build --no-attach grafana --no-attach elasticsearch --no-attach kibana --no-attach metricbeat

dev-demon:
	$(DC) -f $(DEV) up --build -d

dev-stop:
	$(DC) -f $(DEV) down

dev-remove:
	$(DC) -f $(DEV) down -v

dev-logs-all:
	$(DC) -f $(DEV) logs -f

dev-logs:
	$(DC) -f $(DEV) logs -f $(s)

build-%: FORCE
	$(DC) build $*
	$(DC) up -d --no-deps $*

build-pgadmin: build-postgres

back:
	$(DC) up -d --build backend postgres

# Para usar esta regla se debe ejecutar el comando con la variable s, por ejemplo: make shell s=backend
shell:
	$(DC) exec $(s) sh -c "bash || sh"

restart:
	$(DC) restart $(s)

re: remove start

FORCE:

help:
	@echo "Available commands for ft_transcendence:"
	@echo ""
	@echo "Docker Management:"
	@echo "  make start         - Build and start containers in foreground"
	@echo "  make daemon        - Build and start containers in background (detached)"
	@echo "  make stop          - Stop and remove containers"
	@echo "  make restart       - Restart a service (use s=<name>)"
	@echo "  make status        - Show running containers status"
	@echo ""
	@echo "Logs & Debugging:"
	@echo "  make logs-all      - Tail logs from all services"
	@echo "  make logs          - Tail logs from a specific service (use s=<name>)"
	@echo "  make shell         - Open shell in a service (use s=<name>)"
	@echo ""
	@echo "Cleanup & Rebuild:"
	@echo "  make remove        - Remove containers, volumes, and local images"
	@echo "  make full-remove   - Deep clean: remove EVERYTHING including all images"
	@echo "  make re            - Full reset: remove and start again"
	@echo ""
	@echo "Service Specific:"
	@echo "  make build         - Build all images"
	@echo "  make build-<svc>   - Build and restart a specific service"
	@echo "  make back          - Start backend + postgres only"
	@echo "  make build-pgadmin - Build pgAdmin service (depends on postgres)"
	@echo ""
	@echo "Development Environment:"
	@echo "  make dev           - Start development environment"
	@echo "  make dev-demon     - Start development environment in detached mode"
	@echo "  make dev-stop      - Stop development environment"
	@echo "  make dev-remove    - Stop and remove development environment"
	@echo "  make dev-logs      - Tail logs from a dev service (use s=<name>)"
	@echo "  make dev-logs-all  - Tail logs from all dev services"
