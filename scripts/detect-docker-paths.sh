#!/usr/bin/env bash
# Detecta las rutas de Docker (socket y data-root) y las escribe en .env.
# No necesita root: usa `docker context inspect` y `docker info`.
#
#   DOCKER_SOCKET  -> docker context inspect --format '{{.Endpoints.docker.Host}}' (sin prefijo unix://)
#   DOCKER_ROOT    -> docker info --format '{{.DockerRootDir}}'
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

# Crear .env desde .env.example si no existe
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo "Creado $ENV_FILE a partir de .env.example"
    else
        touch "$ENV_FILE"
        echo "Creado $ENV_FILE (vacío)"
    fi
fi

# Detectar socket de Docker
SOCKET="$(docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null || true)"
SOCKET="${SOCKET#unix://}"
SOCKET="$(echo "$SOCKET" | tr -d '[:space:]')"
[ -n "$SOCKET" ] || SOCKET="/var/run/docker.sock"

# Detectar data-root de Docker
DOCKER_ROOT="$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)"
DOCKER_ROOT="$(echo "$DOCKER_ROOT" | tr -d '[:space:]')"
[ -n "$DOCKER_ROOT" ] || DOCKER_ROOT="/var/lib/docker"

update_env() {
    local key="$1" value="$2"
    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
}

update_env "DOCKER_SOCKET" "$SOCKET"
update_env "DOCKER_ROOT" "$DOCKER_ROOT"

echo "DOCKER_SOCKET=${SOCKET}"
echo "DOCKER_ROOT=${DOCKER_ROOT}"
