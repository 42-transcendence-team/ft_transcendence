# ÉPICA — Progressive Web App (PWA) with offline support and installability

**Módulo del subject:**  
WEB — Progressive Web App (PWA) with offline support and installability

**Categoría:**  
WEB

---

## 🎯 Objetivo de la épica
Mejorar la experiencia de usuario de la aplicación web convirtiéndola en una Progressive Web App instalable, capaz de ofrecer un funcionamiento básico y coherente en situaciones de conectividad limitada u offline, sin romper el comportamiento estándar de la web.

---

## 📍 ¿Dónde se ve en el producto?
- En la posibilidad de instalar la aplicación como app en desktop y mobile.
- En la navegación del feed y del chat cuando el usuario pierde la conexión.
- En el feedback visual que indica el estado offline/online de la aplicación.
- En el envío diferido de mensajes de chat cuando se recupera la conexión.

---

## 👤 Acción del usuario
- El usuario accede a la aplicación desde el navegador o como app instalada.
- El usuario pierde la conexión a internet.
- El usuario puede seguir viendo contenido previamente cargado.
- El usuario puede escribir mensajes de chat que quedan pendientes y se envían al recuperar conexión.
- El usuario recibe feedback claro cuando intenta acciones no disponibles offline.

---

## 📦 ¿Forma parte del MVP?
**Sí**

**Justificación:**  
La PWA con soporte offline básico e instalabilidad aporta una mejora clara de UX, es demostrable en evaluación y no introduce complejidad excesiva para un equipo pequeño. El alcance se limita conscientemente a funcionalidades esenciales.

---

## 🔗 Dependencias
- Frontend con gestión de estado y navegación.
- Backend con API REST estable y respuestas idempotentes para envío de mensajes.
- Módulo de chat básico funcional.
- Sistema de autenticación de usuarios.
- Infraestructura web compatible con HTTPS.

---

# 🧩 Features

## Feature 1 — Instalabilidad de la aplicación (PWA)

### Objetivo
Permitir que la aplicación web pueda instalarse como una app en desktop y mobile, manteniendo el mismo comportamiento funcional que la versión web.

### Historias
- Historia técnica: Como sistema, quiero cumplir los requisitos de una PWA para que la aplicación sea instalable desde el navegador.

### Requisitos funcionales
- La aplicación puede instalarse desde navegadores compatibles.
- La app instalada abre la misma interfaz y funcionalidades que la web.
- La app funciona tanto en desktop como en dispositivos móviles.

### Requisitos no funcionales
- No duplicar lógica entre versión web y versión instalada.
- Mantener compatibilidad con navegadores modernos.

### Tareas técnicas
- Configurar los elementos necesarios para habilitar la instalabilidad.
- Validar el comportamiento en desktop y mobile.
- Documentar el comportamiento esperado de la app instalada.

---

## Feature 2 — Soporte offline de lectura (Feed y Chat)

### Objetivo
Permitir que el usuario acceda a contenido previamente cargado cuando no hay conexión a internet.

### Historias
- Como usuario, quiero poder ver el feed ya cargado aunque no tenga conexión.
- Como usuario, quiero poder acceder a mis chats recientes y leer mensajes anteriores sin conexión.

### Requisitos funcionales
- El feed muestra hasta las últimas **5 publicaciones** previamente cargadas.
- La lista de chats muestra los **últimos 10 chats recientes**.
- Cada chat muestra hasta **10 mensajes** previamente cargados.
- No se permite cargar contenido nuevo sin conexión.

### Requisitos no funcionales
- Limitar el almacenamiento local para evitar consumo excesivo.
- Comportamiento predecible y consistente entre sesiones.

### Tareas técnicas
- Definir qué datos se consideran cacheables para offline.
- Garantizar la reconstrucción de vistas sin conexión.
- Coordinar con frontend el comportamiento de navegación offline.

---

## Feature 3 — Envío de mensajes de chat en modo offline (cola)

### Objetivo
Permitir al usuario escribir mensajes de chat sin conexión y enviarlos automáticamente cuando se recupere la conectividad.

### Historias
- Como usuario, quiero escribir mensajes aunque esté offline.
- Como sistema, quiero enviar los mensajes pendientes cuando vuelva la conexión sin duplicarlos.

### Requisitos funcionales
- El usuario puede escribir mensajes en chats existentes.
- Los mensajes se marcan visualmente como “pendientes”.
- Los mensajes se envían automáticamente al recuperar conexión.
- Los mensajes se envían en orden.
- Máximo **5 mensajes pendientes** por usuario.
- No se crean nuevos chats en modo offline.

### Requisitos no funcionales
- Garantizar idempotencia y evitar duplicados.
- Manejo claro de errores sin pérdida silenciosa de mensajes.

### Tareas técnicas
- Definir identificación única de mensajes generados en cliente.
- Acordar contrato backend para deduplicación.
- Definir estados de mensaje (pendiente / enviado).

---

## Feature 4 — Gestión de acciones no disponibles offline

### Objetivo
Ofrecer feedback claro al usuario cuando intenta realizar acciones que requieren conexión.

### Historias
- Como usuario, quiero saber claramente qué acciones no están disponibles offline.

### Requisitos funcionales
- Las acciones no soportadas offline se bloquean.
- Se muestra un mensaje claro indicando que la acción requiere conexión.
- No se permite que la acción falle de forma silenciosa.

### Requisitos no funcionales
- UX coherente y no frustrante.
- Evitar comportamientos ambiguos o inconsistentes.

### Tareas técnicas
- Identificar acciones no soportadas offline.
- Definir mensajes de feedback estándar.
- Coordinar comportamiento entre frontend y backend.
