# AGENTS.md — ft_transcendence

> Guía para que cualquier sesión de IA (o persona nueva) pueda navegar, entender
> y extender este proyecto sin romper nada.  No es un changelog, es un mapa.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Go 1.25, Gin, GORM (Postgres), go-redis, gorilla/websocket, JWT |
| Frontend | React 19, TypeScript, Rsbuild, SCSS, pnpm |
| Infra (dev) | Docker Compose, Nginx, Postgres, Redis, Elastic Stack, Prometheus+Grafana, Vault, Portainer, Docusaurus |
| Infra (prod) | Docker Compose, backend, frontend, postgres, pgadmin, redis |
| Tests | pytest (integración), `go test` (backend unit — solo `storage/` tiene tests) |

---

## Comandos rápidos

```bash
# Docker
make dev             # entorno dev con hot‑reload (docker‑compose.dev.yml)
make dev-stop        # parar dev
make daemon          # producción
make logs s=backend  # logs de un servicio
make shell s=backend # shell dentro del contenedor

# Backend (desde backend/)
go build -o api ./cmd/api   # compilar binario
go test ./...               # tests unitarios
go test -race ./...         # tests con race detector

# Frontend (desde frontend/)
pnpm dev      # Rsbuild dev server (:3000)
pnpm build    # build de producción
pnpm lint     # eslint
pnpm check    # biome check --write
pnpm format   # biome format --write

# Integración (desde tests/)
make          # crea venv, instala deps, ejecuta pytest (necesita backend corriendo)
```

---

## Cómo leer el código

### Backend — entry point y flujo

```
cmd/api/main.go
  ├─ config.Load()            # carga .env, valida ENV ∈ {"local","prod"}
  ├─ db.Connect(dsn)          # abre conexión GORM a Postgres
  ├─ db.Migrate(db)           # AutoMigrate (NO hay migraciones SQL — los modelos SON la migración)
  └─ server.NewHTTPServer     # crea gin.Engine + configura rutas
       └─ Router()            # toda la inyección de dependencias y registro de rutas
```

### Backend — estructura de paquetes

```
internal/
  config/        → carga de variables de entorno
  db/            → conexión GORM + AutoMigrate
  dto/           → structs compartidos para JSON (in/out)
  errors/        → AppError con helpers (NewBadRequest, NewForbidden…)
  handlers/      → funciones que reciben *gin.Context → invocan servicios → devuelven JSON
  health/        → health check
  middlewares/   → RecoveryJSON, ErrorMiddleware, CORS, AuthMiddleware, 2FA
  models/        → structs GORM (tablas de BD)
  repository/    → capa de acceso a datos (queries GORM)
  routes/        → registro de rutas agrupadas por dominio
  server/        → configuración de gin.Engine (MaxMultipartMemory, Static, Router)
  services/      → lógica de negocio (orquesta repositorios)
  storage/       → guardado de imágenes en disco
  store/         → Redis helpers
  utils/         → timezone, validación
  websocket/     → hub, room, client (goroutines del chat)
```

### Frontend — entry point y flujo

```
src/
  index.tsx       → ReactDOM.createRoot → App
  App.tsx          → router (react-router-dom) → layouts y páginas
  layouts/         → PrivateLayout, PublicLayout
  pages/           → páginas (Home, Profile, Chat…)
  components/      → componentes reutilizables (ChatPanel, ChatModal, Notification…)
  context/         → React contexts (WebSocketProvider, ChatProvider, NotificationProvider)
  api/             → wrappers de llamadas HTTP a la API
  router/          → definición de rutas del frontend
  styles/          → SCSS (variables, componentes, layouts)
  assets/          → imágenes, iconos, fuentes
  hooks/           → hooks personalizados
  utils/           → helpers
```

### Frontend — alias de imports

Rsbuild tiene `src/` como baseUrl.  Conviven dos estilos (ambos válidos):
- Alias con `@`: `@components/ChatModal`, `@pages/Profile`
- Bare imports desde `src/`: `api/ApiRequest`, `assets/icons/skull_logo.png`

---

## Modelos de BD (GORM)

No hay migraciones SQL manuales.  GORM hace AutoMigrate en cada arranque (lee los structs y crea/altera tablas).  
**Añadir un campo a un modelo = añadirlo al struct → reiniciar backend.**

### Modelos principales

```go
// User — tabla users
type User struct {
    gorm.Model
    Login      string
    Email      *string
    Password   string
    Active2FA  bool
    Secret2FA  *string
    Role       string
    Name       string
    Surname    string
    Birthday   time.Time
    AvatarPath *string   `json:"avatarPath,omitempty"`   // nil = skull por defecto
    BannerPath *string   `json:"bannerPath,omitempty"`
    State      string    // estado del perfil
    Status     uint
}

// ChatRoom — tabla chat_rooms
type ChatRoom struct {
    gorm.Model
    Name     string
    Private  bool
    Members  []*User       `gorm:"many2many:room_users;"`
    Messages []ChatMessage `gorm:"foreignKey:RoomID"`
}

// ChatMessage — tabla chat_messages
type ChatMessage struct {
    gorm.Model
    RoomID    uint
    UserID    uint
    Username  string
    Content   string
    Timestamp *time.Time
}

// RoomUser — tabla room_users (join table)
type RoomUser struct {
    ChatRoomID uint `gorm:"primaryKey"`
    UserID     uint `gorm:"primaryKey"`
    LastReadAt *time.Time
}

// Friendship — tabla friendships (user1_id < user2_id SIEMPRE)
type Friendship struct {
    ID        uint
    User1ID   uint   // el menor de los dos IDs
    User2ID   uint   // el mayor de los dos IDs
    CreatedAt time.Time
}

// Block — tabla blocks
type Block struct {
    ID        uint
    BlockerID uint
    BlockedID uint
    CreatedAt time.Time
}

// FriendRequest — tabla friend_requests
type FriendRequest struct {
    ID         uint
    SenderID   uint
    ReceiverID uint
    Status     RelationStatus   // "pending" | "accepted" | "rejected"
}
```

### JSON tags en modelos vs DTOs

- Los **modelos** no suelen tener `json` tags (usan el nombre del campo Go tal cual → "ID", "Login", "Members"…).
- Los **DTOs** (`dto/`) siempre llevan `json` tags y definen la forma exacta del JSON que viaja al frontend.
- **Ojo con mayúsculas/minúsculas**: un modelo sin `json` tag serializa `AvatarPath` como `"AvatarPath"`; un DTO con `json:"avatarPath"` serializa `"avatarPath"`.  Ambos casos existen en el código.

---

## WebSocket — arquitectura de goroutines

### Modelo de concurrencia

```
Hub.Run()        (1 goroutine)
  ├─ Register   chan *Client        → añade a Clients y ClientsConnected
  ├─ Unregister chan *Client        → borra de mapas, avisa a las rooms (no bloqueante, fuera del lock)
  └─ Mu sync.RWMutex                → protege Clients, ClientsConnected y Rooms

Room.Run()       (1 goroutine por sala)
  ├─ Clients     map[*Client]bool
  ├─ Join/Leave  chan *Client        (buffer 1)
  ├─ Broadcast   chan []byte         (unbuffered — bloquea al emisor hasta que se procesa)
  ├─ destroy     chan struct{}       (buffer 1)
  ├─ mu          sync.RWMutex
  └─ hub         *Hub

Client           (2 goroutines por cliente: ReadPump + WritePump)
  ├─ Conn        *websocket.Conn
  ├─ SendChan    chan []byte         (buffer 256)
  ├─ Rooms       map[uint]*Room      (protegido por client.Mu)
  └─ Mu          sync.RWMutex
```

### Lock ordering (siempre respetar este orden para no hacer deadlock)

```
r.mu  →  client.Mu         (room.go: Join, Leave, broadcast default)
```

`hub.Mu` **nunca** se coge mientras se envía a canales de room (`Join`, `Leave`).  
`SendMessagesToUser(s)` cogen `hub.Mu.RLock()` y hacen envíos **no bloqueantes** (`select`/`default`) a `client.SendChan`.

### Ciclo de vida de un cliente

1. `ReadPump` lee mensajes del WebSocket → llama a `HandleMessage`.
2. Cuando la conexión se cae: `defer` envía `hub.Unregister <- c` y luego `c.Conn.Close()`.
3. `Hub.Run` recibe Unregister → borra de mapas (bajo `Lock`) → avisa a las rooms **fuera del lock** con `select`/`default` (no bloqueante).
4. `Room.Run` procesa Leave → borra cliente de `r.Clients` y de `client.Rooms`.
5. `WritePump` intenta escribir/ping → la conexión está cerrada → el write falla → `WritePump` retorna.
6. **`SendChan` no se cierra nunca.**  WritePump muere solo por fallo de escritura.  Así se evita el panic de "send on closed channel".

---

## Sistema de chat

### Estados en el frontend (ChatProvider)

```
lastActivity       Record<number, number>    // timestamp del último mensaje por sala
messagesByRoom     Record<number, ChatMessage[]>
rooms              number[]                  // todas las salas del usuario (menos las bloqueadas)
roomMembers        Record<number, RoomMember[]>  // miembros de cada sala
blockedRoomIdsRef  Set<number> (ref)         // salas bloqueadas (sobrevive entre renders)
```

### Contratos WebSocket (copiar exactamente estos JSON)

**Cliente → Servidor**
```json
{"type":"join_room",  "room_id":1}
{"type":"leave_room", "room_id":1}
{"type":"message",    "room_id":1, "content":"hola", "username":"user", "user_id":1}
```

**Servidor → Cliente**
```json
{"type":"join",               "room_id":1, "messages":[{message_id,content,username,timestamp}]}
{"type":"message",            "message_id":42, "room_id":1, "user_id":1, "username":"user", "content":"hola", "timestamp":"2026-07-22 18:30:00"}
{"type":"CREATE_ROOM",        "payload":{"room_id":1}}
{"type":"FRIEND_REQUEST",     "payload":{"sender_id":1,"receiver_id":2}}
{"type":"FRIEND_REQUEST_ACCEPTED","payload":{"sender_id":2,"receiver_id":1}}
{"type":"ROOM_BLOCKED",       "payload":{"room_id":1}}
{"type":"message_rejected",   "room_id":1, "content":"...", "reason":"no puedes enviar mensajes a un usuario bloqueado"}
```

### Inserción optimista de mensajes

`sendMessage` añade un mensaje a `messagesByRoom` inmediatamente con:
- `message_id`: `"temp_<Date.now()>_<random>"`  
- `_pending: true` (marca interna, no viaja al servidor)  
- `content` y `username` reales

Cuando el servidor devuelve el eco:
- Busca en `messagesByRoom[roomId]` un mensaje con `_pending && content === eco.content && username === eco.username`
- Lo **reemplaza** por el mensaje real.
- Si el servidor rechaza (`message_rejected`), elimina el mensaje pendiente.

### Panel de chat (ChatPanel)

- `displayRooms`: array de ≤6 IDs de sala.  
  - El **chat activo** siempre en posición 0.  
  - El resto ordenado por `lastActivity` descendente.  
  - Las salas sin actividad no se muestran (salvo que sean el chat activo).
- Botón `+`: abre `AddChatModal` → busca amigos con `searchUsers({relations:["friends"]})` → crea o reutiliza sala.
- Botón `⌕`: abre búsqueda de salas existentes por ID.

### Salas bloqueadas (fin de amistad / bloqueo)

1. Backend (`friendHandler`): al hacer `DeleteFriend` o `BlockUser`, busca la sala compartida con `GetSharedRoom` y envía WS `ROOM_BLOCKED {room_id}` a ambos.
2. Frontend: `blockedRoomIdsRef` añade el ID → se filtra de `fetchRooms` y se borra de `rooms` + `lastActivity`.
3. Si intentan enviar mensaje a esa sala: backend llama `CanSendToRoom` → rechaza con `message_rejected`.
4. Si vuelven a ser amigos y reabren con `+`: `addChat` desbloquea la sala y los mensajes antiguos reaparecen (nunca se borraron de BD).

---

## Sistema de amigos y bloqueos

### Métodos clave del repositorio

| Método | Qué hace |
|--------|---------|
| `AreFriends(a,b)` | Busca en `friendships` con IDs normalizados (min,max) |
| `AreBlock(a,b)` | Bidireccional: `(A bloqueó a B) OR (B bloqueó a A)` |
| `GetBlock(a,b)` | Como `AreBlock` pero devuelve el registro (para saber quién bloqueó a quién) |
| `HasPendingRequestBetweenUsers(a,b)` | Petición pendiente en cualquier dirección |
| `GetSharedRoom(a,b)` | Doble JOIN sobre `room_users` — encuentra la sala común |

### Efectos colaterales

- `BlockUser(blocker, blocked)`: crea el bloqueo, **borra la amistad** y **borra todas las peticiones pendientes** entre ambos.  Luego envía `ROOM_BLOCKED` WS.
- `DeleteFriend(a, b)`: borra la amistad y envía `ROOM_BLOCKED` WS si existe sala compartida.
- `AcceptFriendRequest`: comprueba que no estén bloqueados antes de aceptar.

### Dónde se comprueban las relaciones

| Contexto | Comprobación |
|----------|-------------|
| Buscar amigos para chatear | `searchUsers({relations:["friends"]})` — solo amigos |
| Enviar mensaje (backend) | `CanSendToRoom`: para cada otro miembro: `AreFriends && !AreBlock` |
| Enviar solicitud de amistad | `AreFriends → AreBlock → HasPendingRequestBetweenUsers` |
| Aceptar solicitud | `AreBlock` (si están bloqueados, forbidden) |
| Eliminar amigo / bloquear | Envía `ROOM_BLOCKED` si hay sala compartida |

---

## Frontend — arquitectura de componentes

### Árbol del layout privado

```
PrivateLayout
├─ WebSocketProvider          ← conexión WS + reconexión automática
│  └─ NotificationProvider    ← poll HTTP + push WS de notificaciones
│     └─ ChatProvider         ← salas, mensajes, actividad, miembros, addChat
│        ├─ PrivHeader
│        ├─ PrivateLeftPanel
│        │  ├─ Notification
│        │  └─ SearchFilters
│        ├─ PrivateMainContent
│        │  ├─ AdvancedSearchPanel (si hay búsqueda activa)
│        │  ├─ ChatModal (si activeChat !== null)
│        │  └─ Outlet (contenido de la página)
│        ├─ ChatPanel         ← burbujas de chat (máx 6) + ⌕ + +
│        └─ Footer
```

**El orden de los providers importa**: `ChatProvider` va dentro de `WebSocketProvider` para compartir la misma conexión WS. `NotificationProvider` va dentro también porque necesita `subscribe` del WS.

### Contextos y sus datos

| Contexto | Expone | Depende de |
|----------|--------|-----------|
| `useWebSocket` | `send`, `subscribe`, `isConnected` | `user` (prop del provider) |
| `useNotification` | `notifications`, `markAsRead`, `clearRoomNotifications` | `user`, `activeChat`, `subscribe` (WS) |
| `useChat` | `messagesByRoom`, `sendMessage`, `rooms`, `roomMembers`, `lastActivity`, `addChat`, `user` | `user`, `send`/`subscribe` (WS) |

---

## Convenciones y cosas que rompen si no las respetas

1. **`gin.Context.Error(nil)` hace panic.**  Siempre comprueba que el error no sea nil antes de pasarlo a `c.Error()`.  Si tienes dos variables de error (`perr`, `merr`), asegúrate de usar la correcta.

2. **`hub.Mu` nunca se coge mientras se envía a un canal de room.**  Si necesitas enviar a `room.Leave` o `room.Join`, hazlo fuera del lock o usa `select`/`default`.  Un bloqueo aquí + `room.Run` queriendo `hub.Mu` = deadlock.

3. **No cierres `client.SendChan`.**  El WritePump se muere solo cuando la conexión TCP está rota y los writes fallan.  Cerrar `SendChan` provoca panics cuando otras goroutines intentan enviar a un canal cerrado.

4. **`GetRoomByID` siempre debe hacer `Preload("Members")`.**  Si no, `IsUserInRoom` (y cualquier código que itere `room.Members`) devuelve `false` aunque el usuario esté en la sala.

5. **`client.Rooms` se toca desde varias goroutines.**  Siempre usa `client.Mu` al leerlo (hub) o escribirlo (room).

6. **Los `Records` de `lastActivity` tienen claves string.**  `Object.entries(record)` devuelve claves `string`, no `number`.  Siempre convierte con `Number(id)` antes de comparar con `rooms.includes()`.

7. **Los campos JSON de los modelos Go sin `json` tag van con mayúscula inicial.**  `ChatRoom.Members` → `"Members"` en JSON.  Los DTOs usan `json` tags (normalmente minúsculas).  En el frontend hay que ser flexible: `r.Members ?? r.members`.

8. **Las notificaciones del fetch HTTP no tienen `id` top-level.**  Hay que generarlo con `normalizeNotifications` o el `key` de React será `undefined` y `markAsRead` borrará todas.

9. **El payload WS de `FRIEND_REQUEST` no tiene campo `id`.**  Usa `sender_id` o `user_id` para deduplicar, nunca `id`.

10. **`searchUsers` con `relations: ["friends"]` es la forma canónica de buscar solo amigos.**
