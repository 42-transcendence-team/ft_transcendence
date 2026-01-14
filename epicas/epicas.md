### Épica 1: Infraestructura y base técnica

**Objetivo**
Establecer la base técnica del proyecto para permitir el desarrollo estable del resto
de funcionalidades.

**Incluye**
- Framework frontend (React + TypeScript)
- Framework backend (Go + Gin)
- Estructura del repositorio
- Configuración Docker y docker-compose
- Nginx como reverse proxy
- Configuración de variables de entorno (.env)

**Módulos relacionados**
- WEB — Use a framework for both frontend and backend (Major)

**Criterio de finalización**
- El proyecto se levanta con un solo comando
- Frontend y backend se comunican correctamente
- Estructura clara y documentada


### Épica 2: Gestión de usuarios y autenticación

**Objetivo**
Permitir que los usuarios se registren, inicien sesión y gestionen su perfil
de forma segura.

**Incluye**
- Registro y login
- Autenticación segura
- Protección de rutas
- Perfil de usuario
- Avatar por defecto y personalizado
- Sistema básico de amigos

**Módulos relacionados**
- USER MANAGEMENT — Standard user management and authentication (Major)
- WEB — Use an ORM for the database (Minor)

**Criterio de finalización**
- Usuarios pueden registrarse y autenticarse
- Acceso protegido a zonas privadas
- Persistencia correcta en base de datos


### Épica 3: Interacción social y chat en tiempo real

**Objetivo**
Permitir la interacción directa entre usuarios en tiempo real.

**Incluye**
- Sistema de amigos
- Chat básico 1 a 1
- Mensajes persistentes
- Comunicación en tiempo real mediante WebSockets

**Módulos relacionados**
- WEB — Allow users to interact with other users (Major)
- WEB — WebSockets (Major)
- USER EXPERIENCE — Advanced chat features (Minor)

**Criterio de finalización**
- Dos usuarios pueden comunicarse en tiempo real
- Los mensajes se guardan y se recuperan
- Reconexión básica gestionada


### Épica 4: Gestión de archivos y contenido

**Objetivo**
Permitir a los usuarios subir y gestionar archivos dentro de la plataforma.

**Incluye**
- Subida de avatar
- Validación de tipo y tamaño
- Almacenamiento seguro
- Eliminación de archivos

**Módulos relacionados**
- WEB — File upload and management system (Minor)

**Criterio de finalización**
- Los usuarios pueden subir y eliminar archivos
- Los archivos se validan correctamente
- Acceso seguro a los archivos


### Épica 5: Organizaciones y control de acceso

**Objetivo**
Permitir la creación de organizaciones y la gestión de usuarios dentro de ellas.

**Incluye**
- Crear organizaciones
- Añadir y eliminar usuarios
- Roles básicos
- Acciones permitidas según rol

**Módulos relacionados**
- USER MANAGEMENT — An organization system (Major)
- USER MANAGEMENT — OAuth 2.0 (Minor)
- USER MANAGEMENT — 2FA (Minor)

**Criterio de finalización**
- Organizaciones funcionales
- Usuarios con roles diferenciados
- Control de acceso coherente

### Épica 6: Experiencia de usuario y diseño

**Objetivo**
Mejorar la usabilidad y coherencia visual del producto.

**Incluye**
- Design system reutilizable
- Componentes base
- Búsqueda con filtros y paginación

**Módulos relacionados**
- WEB — Custom-made design system (Minor)
- WEB — Advanced search functionality (Minor)

**Criterio de finalización**
- Interfaz coherente
- Componentes reutilizables
- Búsqueda funcional y usable


### Épica 7: Monitorización y logs

**Objetivo**
Garantizar la observabilidad del sistema y facilitar la detección de errores.

**Incluye**
- Centralización de logs
- Métricas del sistema
- Dashboards de monitorización

**Módulos relacionados**
- DEVOPS — ELK stack (Major)
- DEVOPS — Prometheus & Grafana (Major)

**Criterio de finalización**
- Logs accesibles y filtrables
- Métricas visibles en dashboards
- Sistema monitorizado en tiempo real
