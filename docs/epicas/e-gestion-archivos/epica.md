# ÉPICA — File Upload and Management System

**Módulo del subject:**  
WEB — File upload and management system

**Categoría:**  
WEB

---

## 🎯 Objetivo de la épica
Permitir a los usuarios subir, visualizar y gestionar imágenes de forma segura y controlada dentro de la red social, garantizando una buena experiencia de usuario y protegiendo la estabilidad del sistema.

---

## 📍 ¿Dónde se ve en el producto?
- Imagen de perfil del usuario.
- Imágenes asociadas a publicaciones.
- Imágenes enviadas dentro de chats (1-a-1 y de grupo).
- Visualización de imágenes en perfiles, feed y conversaciones.

---

## 👤 Acción del usuario
- El usuario selecciona una imagen desde su dispositivo.
- Visualiza una previsualización antes de enviarla.
- Ajusta o recorta la imagen según el contexto (perfil, post o chat).
- Sube la imagen y la asocia a su perfil, publicación o mensaje de chat.
- Visualiza imágenes propias y de otros usuarios según permisos.

---

## 📦 ¿Forma parte del MVP?
**Sí**

**Justificación:**  
Las imágenes de perfil, publicaciones y chats son funcionalidades básicas de una red social. Sin un sistema de subida y gestión de archivos, la experiencia del producto quedaría incompleta.

---

## 🔗 Dependencias
- User Management (identidad del propietario).
- Sistema de relaciones (amigos / organización).
- Sistema de chats (1-a-1 y de grupo).
- Backend base operativo (API REST).
- Sistema de autenticación existente (para control de acceso).

---

# 🧩 Features

---

## Feature 1 — Validación de imágenes

### Objetivo
Evitar cargas excesivas en el servidor y asegurar que solo se suban imágenes válidas y seguras.

### Historias (técnicas / UX)
- Como sistema, quiero validar imágenes antes de almacenarlas.
- Como usuario, quiero saber claramente por qué una imagen no es válida.

### Requisitos funcionales
- Solo se permiten imágenes para:
  - Avatar
  - Imagen de post
  - Imagen en chat
- Formatos permitidos:
  - JPG / JPEG
  - PNG
  - (WEBP opcional)
- Tamaño máximo por imagen: **~1 MB**
- Dimensiones máximas:
  - Avatar: **1024 × 1024**
  - Post: **1920 × 1080**
  - Chat: **1024 × 1024**
- Si una imagen no cumple los requisitos, el sistema devuelve un error claro indicando el motivo.

### Requisitos no funcionales
- Validación obligatoria en backend.
- El backend rechaza cualquier imagen que no cumpla los límites, aunque el frontend falle.

### Tareas técnicas
- Validar formato MIME.
- Validar tamaño en bytes según contexto.
- Validar dimensiones de la imagen según contexto.
- Definir mensajes de error claros y consistentes.

---

## Feature 2 — Integración con frontend (UX de subida)

### Objetivo
Ofrecer una experiencia de usuario clara y sin frustración durante la subida de imágenes.

### Historias
- Como usuario, quiero previsualizar la imagen antes de enviarla.
- Como usuario, quiero ver el progreso de subida.
- Como usuario, quiero recibir mensajes claros si algo falla.

### Requisitos funcionales
- Botón de selección de imagen en:
  - Perfil
  - Creación de post
  - Chat
- Previsualización de la imagen antes de enviar.
- Ajuste/recorte en frontend según el contexto.
- Mensaje claro indicando qué requisito falla si la imagen no es válida.
- Feedback visual de estado: “subiendo…”, éxito o error.

### Requisitos no funcionales
- El frontend no expone detalles internos del backend.
- El backend no depende del frontend para garantizar seguridad.

### Tareas técnicas
- Definir contrato de respuesta del endpoint de upload.
- Coordinar validaciones frontend/backend por contexto.
- Documentar estados esperados para QA.

---

## Feature 3 — Upload endpoint

### Objetivo
Permitir subir imágenes de forma segura y controlada.

### Historias
- Como sistema, quiero almacenar imágenes válidas y asociarlas a su propietario.
- Como frontend, necesito una referencia para usar la imagen tras subirla.

### Requisitos funcionales
- Endpoint de subida autenticado.
- La subida incluye el **contexto de uso** (avatar / post / chat).
- En caso de éxito, devuelve:
  - `file_id`
  - Endpoint o URL para obtener la imagen
- No devuelve rutas internas ni información sensible.

### Requisitos no funcionales
- El endpoint no expone la estructura del filesystem.
- Manejo correcto de errores HTTP.

### Tareas técnicas
- Definir endpoint de upload.
- Asociar imagen a propietario y contexto (avatar / post / chat).
- Persistir metadata en base de datos.

---

## Feature 4 — Storage y metadata de archivos

### Objetivo
Separar correctamente binarios y datos para mantener la salud del sistema.

### Historias
- Como sistema, quiero almacenar imágenes sin sobrecargar la base de datos.

### Requisitos funcionales
- El binario se almacena en el filesystem local.
- La base de datos guarda únicamente metadata:
  - ID del archivo
  - ID del propietario
  - Tipo (avatar / post / chat)
  - Formato
  - Tamaño
  - Ruta en filesystem

### Requisitos no funcionales
- El almacenamiento es persistente mediante volumen Docker.
- El diseño permite migrar a otro tipo de storage en el futuro.

### Tareas técnicas
- Definir estructura de carpetas por contexto.
- Crear modelo de metadata.
- Gestionar persistencia y referencias.

---

## Feature 5 — Retrieval y control de acceso

### Objetivo
Servir imágenes respetando las reglas de visibilidad de la red social.

### Historias
- Como usuario, solo quiero ver imágenes a las que tengo acceso.
- Como sistema, no quiero revelar información sobre recursos protegidos.

### Requisitos funcionales
- El acceso a imágenes es **heredado** del recurso:
  - Perfil → reglas de amistad
  - Post → reglas del post
  - Chat → solo participantes del chat
  - Organización → reglas de la organización
- El endpoint de retrieval devuelve una **URL temporal**.
- La URL tiene una duración fija de **horas**.
- Si el usuario no tiene permiso:
  - Respuesta HTTP: **404 Not Found**

### Requisitos no funcionales
- No se revela la existencia del archivo a usuarios no autorizados.
- El control de acceso se valida antes de generar la URL.

### Tareas técnicas
- Verificar permisos según contexto antes de servir.
- Generar URLs temporales.
- Definir expiración.

---

## Feature 6 — Deletion y cleanup

### Objetivo
Eliminar imágenes sin romper referencias ni afectar al rendimiento.

### Historias
- Como sistema, quiero eliminar imágenes antiguas de forma segura.

### Requisitos funcionales
- Las imágenes se **marcan para borrado** cuando:
  - Se cambia el avatar
  - Se elimina un post
  - Se elimina un mensaje de chat
  - Se elimina un usuario
  - Se elimina una organización
- Las imágenes marcadas no se sirven.
- El borrado físico se realiza mediante un **proceso periódico**.

### Requisitos no funcionales
- El cleanup no impacta en la experiencia del usuario.
- El proceso es seguro y repetible.

### Tareas técnicas
- Añadir estado “marcado para borrado”.
- Marcar imágenes asociadas a mensajes de chat eliminados.
- Implementar proceso periódico de cleanup.
- Eliminar archivo y metadata asociada.
