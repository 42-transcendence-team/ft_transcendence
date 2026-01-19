# 📘 Explicación de las tareas técnicas — ÉPICA File Upload and Management System

Este documento explica, en lenguaje claro y no técnico, qué significa cada tarea técnica definida en la épica **File Upload and Management System**, y por qué existe dentro del proyecto.

---

## 🔹 Feature 1 — Validación de imágenes

### 🛠️ Validar formato MIME

**Qué significa**  
Comprobar que el archivo que se sube es realmente una imagen y no otro tipo de archivo camuflado.

**Qué problema resuelve**  
Evita que se suban archivos peligrosos o no esperados (por ejemplo, un ejecutable renombrado como `.jpg`).

**Responsabilidad principal**  
Backend.

---

### 🛠️ Validar tamaño en bytes según contexto

**Qué significa**  
Comprobar que el archivo no supera el tamaño máximo permitido (≈1 MB), teniendo en cuenta si es avatar, post o chat.

**Qué problema resuelve**  
Protege al servidor de cargas excesivas y evita saturar almacenamiento y red.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Validar dimensiones de la imagen según contexto

**Qué significa**  
Leer el ancho y alto reales de la imagen y comprobar que no exceden los límites definidos para avatar, post o chat.

**Qué problema resuelve**  
Evita imágenes enormes que degraden el rendimiento o rompan el diseño del frontend.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Definir mensajes de error claros y consistentes

**Qué significa**  
Establecer mensajes comprensibles que expliquen exactamente qué requisito falla (formato, tamaño o dimensiones).

**Qué problema resuelve**  
Reduce frustración del usuario y facilita el trabajo de QA al validar errores.

**Responsabilidad principal**  
Backend / UX.

---

## 🔹 Feature 2 — Integración con frontend (UX de subida)

### 🛠️ Definir contrato de respuesta del endpoint de upload

**Qué significa**  
Acordar qué devuelve el backend tras una subida correcta o fallida (por ejemplo, `file_id` y URL de acceso).

**Qué problema resuelve**  
Evita malentendidos entre frontend y backend y hace el sistema más mantenible.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Coordinar validaciones frontend/backend por contexto

**Qué significa**  
Asegurar que el frontend aplica las mismas reglas que el backend según si la imagen es para perfil, post o chat.

**Qué problema resuelve**  
Evita inconsistencias (por ejemplo, que el frontend acepte algo que el backend rechaza).

**Responsabilidad principal**  
Frontend / Backend.

---

### 🛠️ Documentar estados esperados para QA

**Qué significa**  
Dejar claro qué estados puede ver el usuario: “subiendo”, éxito, error y tipo de error.

**Qué problema resuelve**  
Permite a QA validar el comportamiento sin necesidad de leer código.

**Responsabilidad principal**  
Arquitectura / QA.

---

## 🔹 Feature 3 — Upload endpoint

### 🛠️ Definir endpoint de upload

**Qué significa**  
Crear el endpoint REST que recibe imágenes desde el cliente.

**Qué problema resuelve**  
Es el punto único y controlado de entrada de archivos al sistema.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Asociar imagen a propietario y contexto

**Qué significa**  
Guardar quién ha subido la imagen y para qué se usa (avatar, post o chat).

**Qué problema resuelve**  
Permite aplicar correctamente permisos y reglas de visibilidad.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Persistir metadata en base de datos

**Qué significa**  
Guardar información sobre el archivo (no el archivo en sí): tamaño, formato, ruta, propietario, contexto.

**Qué problema resuelve**  
Permite gestionar archivos sin sobrecargar la base de datos con binarios.

**Responsabilidad principal**  
Backend / Base de datos.

---

## 🔹 Feature 4 — Storage y metadata de archivos

### 🛠️ Definir estructura de carpetas por contexto

**Qué significa**  
Organizar los archivos en el filesystem según su uso (avatars, posts, chats).

**Qué problema resuelve**  
Facilita mantenimiento, limpieza y futuras migraciones de storage.

**Responsabilidad principal**  
Backend / Infraestructura.

---

### 🛠️ Crear modelo de metadata

**Qué significa**  
Definir el modelo que representa un archivo dentro de la base de datos.

**Qué problema resuelve**  
Centraliza la información necesaria para servir, borrar y validar archivos.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Gestionar persistencia y referencias

**Qué significa**  
Asegurar que el archivo físico y su registro en base de datos estén siempre sincronizados.

**Qué problema resuelve**  
Evita archivos huérfanos o referencias rotas.

**Responsabilidad principal**  
Backend.

---

## 🔹 Feature 5 — Retrieval y control de acceso

### 🛠️ Verificar permisos según contexto antes de servir

**Qué significa**  
Comprobar que el usuario tiene derecho a ver la imagen según si pertenece a un perfil, post o chat.

**Qué problema resuelve**  
Protege la privacidad y evita accesos no autorizados.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Generar URLs temporales

**Qué significa**  
Crear enlaces de acceso a imágenes que solo son válidos durante un tiempo limitado.

**Qué problema resuelve**  
Reduce riesgos de compartición indebida de enlaces.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Definir expiración

**Qué significa**  
Decidir cuánto tiempo dura una URL antes de dejar de ser válida.

**Qué problema resuelve**  
Equilibra seguridad y experiencia de usuario.

**Responsabilidad principal**  
Arquitectura.

---

## 🔹 Feature 6 — Deletion y cleanup

### 🛠️ Añadir estado “marcado para borrado”

**Qué significa**  
Indicar en la base de datos que una imagen ya no debe usarse, pero aún no se borra físicamente.

**Qué problema resuelve**  
Permite un borrado seguro y controlado.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Marcar imágenes asociadas a mensajes de chat eliminados

**Qué significa**  
Cuando se borra un mensaje de chat con imagen, marcar esa imagen para borrado.

**Qué problema resuelve**  
Evita acumular archivos que ya no se usan.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Implementar proceso periódico de cleanup

**Qué significa**  
Crear un proceso que, cada cierto tiempo, elimina físicamente los archivos marcados.

**Qué problema resuelve**  
Mantiene el sistema limpio sin afectar a la experiencia del usuario.

**Responsabilidad principal**  
Backend / DevOps.

---

### 🛠️ Eliminar archivo y metadata asociada

**Qué significa**  
Borrar tanto el archivo del disco como su registro en la base de datos.

**Qué problema resuelve**  
Libera espacio y mantiene consistencia del sistema.

**Responsabilidad principal**  
Backend.
