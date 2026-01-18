# ft_transcendence

# Estructura del repo

## Raíz del repositorio

```txt

.
├── frontend/                    # App web (cliente)
├── backend/                     # API REST (Gin) + WebSockets + lógica de negocio
├── nginx/                       # Reverse proxy y punto de entrada (incluye WAF)
├── vault/                       # Gestión de secretos (HashiCorp Vault)
├── prometheus/                  # Monitorización (Prometheus)
├── grafana/                     # Visualización de métricas (Grafana)
│
├── docs/                        # Documentación del proyecto
├── docker-compose.yml           # Orquestación local de servicios
├── Makefile                     # Atajos para desarrollo y operaciones
├── .env.example                 # Variables de entorno de ejemplo (sin secretos)
├── .gitignore                   # Archivos y carpetas ignoradas por Git
└── README.md                    # Guía principal del proyecto

```
### Estructura del frontend

```txt

```

### Estructura del backend

```txt

backend/
├── Dockerfile                   # Construcción de la imagen del backend
│
├── cmd/
│   └── api/
│       └── main.go              # Punto de entrada del servidor
│                               # - Carga configuración
│                               # - Inicializa base de datos
│                               # - Configura router HTTP y WebSockets
│                               # - Arranca el servidor
│
├── config/                      # Configuración de la aplicación
│   └── config.go                # Lectura de variables de entorno
│
├── internal/                    # Código interno del backend
│   ├── handlers/                # Capa HTTP (Gin)
│   ├── services/                # Lógica de negocio
│   ├── repository/              # Acceso a datos (ORM)
│   ├── websocket/               # Comunicación en tiempo real (WebSockets)
│   └── models/                  # Modelos de dominio (mapeo con DB)
│
├── pkg/                         # Código genérico y reutilizable
│
├── migrations/                  # Migraciones SQL incrementales
│
├── go.mod
└── go.sum

```

### Estructura de nginx

```txt

nginx/
├── Dockerfile                   # Construcción de la imagen de Nginx
├── nginx.conf                   # Configuración principal
├── conf.d/                      # Configuraciones modulares (API, WS, frontend)
└── modsecurity/                 # Configuración del WAF (ModSecurity)

```

### Estructura de vault

```txt

vault/
├── Dockerfile                   # Imagen/configuración de Vault
└── vault.hcl                    # Configuración principal de Vault

```

### Estructura de prometheus

```txt

prometheus/
├── Dockerfile                   # Imagen/configuración de Prometheus
└── prometheus.yml               # Definición de targets y reglas

```

### Estructura de grafana

```txt

grafana/
├── Dockerfile                   # Imagen/configuración de Grafana
├── grafana.ini                  # Configuración general
└── dashboards/                  # Dashboards versionados

```

