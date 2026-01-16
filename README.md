# ft_transcendence

# Estructura del repo

## Raíz del repositorio

```txt
.
├── frontend/                  # App web
├── backend/                   # API REST (Gin) + WebSockets + lógica de negocio
├── devops/                    # Infra: nginx, WAF/ModSecurity, Prometheus, Grafana, Vault, etc.
├── docs/                      # Documentación: arquitectura, ADRs, guías de dev, decisiones técnicas
├── docker-compose.yml         # Orquestación local
├── Makefile                   # Atajos: up/down/logs/migrate/test
├── .env.example               # Variables de entorno de ejemplo (sin secretos)
├── .gitignore                 # Ignorar .env, binarios, builds, node_modules, etc.
└── README.md                  # Cómo levantar el proyecto y visión general
```

### Estructura del backend

```txt
backend/
├── main.go                    # Punto de entrada del backend (arranque del servidor)
│
├── config/                    # Carga y validación de variables de entorno
│
├── api/
│   ├── router.go              # Definición de rutas HTTP
│   ├── middleware/            # Middlewares HTTP (auth, logs, CORS, etc.)
│   └── handlers/              # Controladores HTTP (request → response)
│
├── service/                   # Lógica de negocio de la aplicación
│
├── db/                        # Acceso a datos (Postgres + ORM)
│
├── data-types/                # Tipos de datos principales (structs)
│
├── ws/                        # WebSockets (chat en tiempo real)
│
├── utils/                     # Funciones auxiliares reutilizables
│
├── schema-sql/                # Esquema de la base de datos en SQL
│
├── go.mod
└── go.sum
```

### Estructura de devops

```txt
devops/
├── docker/                      # Dockerfiles de los servicios
│   ├── backend.Dockerfile       # Imagen del backend
│   └── frontend.Dockerfile      # Imagen del frontend
│
├── nginx/                       # Reverse proxy
│
├── prometheus/                  # Configuración de Prometheus
│
├── grafana/                     # Configuración y dashboards de Grafana
│
├── waf/                         # Configuración del WAF / ModSecurity
│
├── vault/                       # Configuración de HashiCorp Vault
│
└── README.md                    # Documentación general de DevOps
```

### Estructura del frontend

```txt
/* TODO: */
```