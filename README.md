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

```txt
frontend/
├── public/                         # Archivos públicos servidos tal cual (sin import)
│                                   # Ej: favicon, manifest, robots.txt (según setup)
│
├── src/
│   ├── App.tsx                     # Componente raíz (layout global + rutas)
│
│   ├── assets/                     # Recursos estáticos importables desde TS/React
│   │   ├── data/                   # JSON/constantes de configuración (si aplica)
│   │   │                           # Ej: listas, mocks temporales, settings locales
│   │   ├── fonts/                  # Fuentes (si no van por CDN)
│   │   ├── icons/                  # Iconos (SVG/React components/sets)
│   │   └── img/                    # Imágenes usadas por la UI (logos, backgrounds, etc.)
│   │
│   ├── components/                 # Componentes reutilizables (UI)
│   │                               # Ej: Button, Input, Card, Modal, Avatar, etc.
│   │                               # Ideal para el design system del proyecto
│   │
│   ├── hooks/                      # Hooks reutilizables
│   │                               # Ej: useAuth, useDebounce, useFetch, useWebSocket
│   │
│   ├── pages/                      # Páginas/rutas (pantallas completas)
│   │                               # Ej: Login, Profile, Feed, Chat, Settings
│   │
│   ├── styles/                     # Estilos SCSS globales del proyecto
│   │   ├── abstracts/              # Herramientas SCSS (no generan CSS por sí solas)
│   │   │   ├── _functions.scss     # Funciones SCSS (helpers)
│   │   │   ├── _mixins.scss        # Mixins reutilizables
│   │   │   └── _variables.scss     # Variables (colores, spacing, breakpoints)
│   │   │
│   │   ├── base/                   # Estilos base globales
│   │   │   ├── _fonts.scss         # Declaración/import de fuentes
│   │   │   └── _reset.scss         # Reset/normalización de estilos
│   │   │
│   │   ├── App.scss                # Punto de entrada de estilos globales
│   │                               # Importa abstracts + base + estilos globales
│   │
│   │   ├── components/             # Estilos por componente (si no se usa CSS-in-JS)
│   │                               # Ej: button.scss, modal.scss, etc.
│   │
│   │   └── pages/                  # Estilos por página (opcional)
│   │                               # Útil si cada pantalla tiene layout propio
│   │
│   ├── utils/                      # Funciones puras (sin React)
│   │                               # Ej: formatDate, validators, parsers, mappers
│   │
│   └── index.tsx                   # Entry point de React (monta <App /> en el DOM)
│                                   # Normalmente no se toca salvo cambios globales
│
└── package.json                    # Dependencias y scripts del frontend            

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

