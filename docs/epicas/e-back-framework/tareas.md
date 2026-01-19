# 📘 Explicación de las tareas técnicas — ÉPICA Arquitectura base del backend

Este documento explica, en lenguaje claro y no técnico, qué significa cada tarea técnica definida en la épica **Arquitectura base del backend**, y por qué existe dentro del proyecto.

---

## 🔹 Feature 1.1 — Project setup

### 🛠️ Definir una estructura de carpetas coherente

**Qué significa**  
Decidir cómo se organizan las carpetas del backend (por ejemplo: rutas, controladores, servicios, etc.) para que cada cosa tenga su sitio.

**Qué problema resuelve**  
Evita que el proyecto se convierta en un caos a medida que crece. Si todos saben dónde poner cada cosa, el equipo trabaja más rápido y con menos errores.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Configurar el archivo base del proyecto en Go y sus dependencias

**Qué significa**  
Inicializar el proyecto Go correctamente y dejar listo el sistema de dependencias (lo que el backend necesita para funcionar).

**Qué problema resuelve**  
Permite que el proyecto compile y que el equipo pueda añadir librerías de forma controlada y reproducible.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Crear el punto de entrada (`main`) que levante el servidor y la API

**Qué significa**  
Crear el archivo principal que arranca el backend: carga configuración, inicializa el servidor y empieza a escuchar peticiones.

**Qué problema resuelve**  
Sin un punto de entrada único, cada miembro del equipo puede arrancar el backend de una forma distinta, y eso genera inconsistencias y bugs.

**Responsabilidad principal**  
Backend.

---

## 🔹 Feature 1.2 — Configuration & env

### 🛠️ Definir variables de entorno necesarias (por ejemplo: puerto, IP/host, rutas y credenciales)

**Qué significa**  
Decidir qué valores se van a configurar desde fuera del código (puerto, modo, rutas, credenciales…).

**Qué problema resuelve**  
Evita “hardcodear” cosas en el código y permite ejecutar el proyecto en local, docker o producción sin cambiar archivos.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Crear un módulo/carpeta `config` para centralizar la configuración

**Qué significa**  
Tener un lugar único donde se carga y se guarda la configuración del backend.

**Qué problema resuelve**  
Evita que cada parte del código lea variables de entorno por su cuenta (eso suele acabar en duplicación y errores).

**Responsabilidad principal**  
Backend.

---

### 🛠️ Implementar la carga de variables al arrancar la aplicación

**Qué significa**  
Hacer que al iniciar el backend se lean las variables de entorno y se construya un objeto “config” con todo lo necesario.

**Qué problema resuelve**  
Asegura que el backend sabe desde el principio cómo debe ejecutarse y con qué parámetros.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Validar la configuración al inicio y fallar con un error claro si es incorrecta

**Qué significa**  
Si falta una variable importante o tiene un valor inválido, el backend no sigue arrancando y muestra un error útil.

**Qué problema resuelve**  
Evita que el backend arranque “medio roto” y falle más tarde de formas difíciles de depurar.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Proporcionar `.env.example` como plantilla para el equipo

**Qué significa**  
Dar un archivo de ejemplo con todas las variables necesarias para que cualquier persona pueda configurar el proyecto.

**Qué problema resuelve**  
Hace que el onboarding del equipo sea rápido y evita “¿qué variables faltan?” cada vez que alguien arranca el repo.

**Responsabilidad principal**  
Arquitectura / Equipo.

---

## 🔹 Feature 1.3 — Server & routing

### 🛠️ Inicializar el servidor HTTP utilizando el framework seleccionado

**Qué significa**  
Crear el servidor web con Gin (u otro framework ya decidido) para poder recibir peticiones.

**Qué problema resuelve**  
Sin servidor, no hay API. Esto es la base de todo lo demás.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Definir el punto de escucha del servidor (IP y puerto)

**Qué significa**  
Configurar en qué IP/puerto escucha el backend (por ejemplo `0.0.0.0:8080`), normalmente usando variables de entorno.

**Qué problema resuelve**  
Permite ejecutar el backend en distintos entornos sin tocar código, y evita conflictos de puertos.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Crear un sistema de routing que dirija cada petición al bloque de código correspondiente

**Qué significa**  
Decidir cómo se registran rutas (por ejemplo `/api/v1/users`, `/health`) y a qué función se llama cuando llegan.

**Qué problema resuelve**  
Sin routing claro, el backend se vuelve difícil de mantener. Con un routing bien estructurado, añadir endpoints nuevos es trivial.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Organizar las rutas siguiendo una estructura clara y coherente

**Qué significa**  
Agrupar rutas por recursos (por ejemplo: auth, users, posts, chat) y evitar que estén todas mezcladas.

**Qué problema resuelve**  
Evita duplicaciones, facilita la navegación en el código y hace más sencilla la colaboración del equipo.

**Responsabilidad principal**  
Backend / Arquitectura.

---

## 🔹 Feature 1.4 — Middleware

### 🛠️ Definir middlewares comunes para el backend

**Qué significa**  
Decidir qué reglas se aplican “antes” de llegar a cada handler (por ejemplo: validar JSON, logging, límites de request…).

**Qué problema resuelve**  
Evita repetir las mismas comprobaciones en todas las rutas y garantiza consistencia.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Implementar validaciones generales sobre las peticiones entrantes (formato, tamaño, etc.)

**Qué significa**  
Aplicar reglas de protección básicas (por ejemplo: rechazar JSON inválido, limitar tamaño de body, etc.).

**Qué problema resuelve**  
Protege el servidor de peticiones mal formadas o abusivas, y mejora seguridad.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Asegurar que las peticiones que no cumplan las reglas sean rechazadas antes de llegar al handler

**Qué significa**  
Si algo está mal, el middleware corta el flujo y devuelve error, sin ejecutar lógica de negocio.

**Qué problema resuelve**  
Evita trabajo innecesario y reduce bugs en el código real de negocio.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Integrar los middlewares en el flujo de peticiones del servidor

**Qué significa**  
Activar esos middlewares en Gin y decidir qué rutas los usan.

**Qué problema resuelve**  
Si el middleware está implementado pero no se integra bien, no sirve de nada.

**Responsabilidad principal**  
Backend.

---

## 🔹 Feature 1.5 — Error handling

### 🛠️ Definir una estructura estándar para las respuestas de error

**Qué significa**  
Decidir un formato fijo para errores (por ejemplo `{ "message": "...", "error": "...", "code": ... }`).

**Qué problema resuelve**  
El frontend puede manejar errores de forma consistente y QA puede validarlos fácilmente.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Implementar un mecanismo centralizado de captura y gestión de errores

**Qué significa**  
Tener una forma única de crear y devolver errores, en vez de que cada endpoint lo haga a su manera.

**Qué problema resuelve**  
Evita inconsistencias, reduce duplicación y minimiza fugas de información sensible.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Mapear tipos de error a status codes HTTP coherentes

**Qué significa**  
Decidir qué errores devuelven 400, 401, 403, 404, 409, 500, etc., y usarlo siempre igual.

**Qué problema resuelve**  
Evita que el frontend reciba códigos contradictorios y simplifica el comportamiento del sistema.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Asegurar que los errores no controlados no provocan la caída del servidor

**Qué significa**  
Evitar que un “panic” o error inesperado mate el servidor.

**Qué problema resuelve**  
Un backend en producción no puede caerse por una petición mala. Esto mejora estabilidad y resiliencia.

**Responsabilidad principal**  
Backend.

---

## 🔹 Feature 1.6 — API structure & conventions

### 🛠️ Definir la estructura base de la API (por ejemplo, `/api/v1`)

**Qué significa**  
Decidir un prefijo común para todas las rutas, incluyendo versión.

**Qué problema resuelve**  
Permite evolucionar la API sin romper a los clientes y mantiene orden.

**Responsabilidad principal**  
Arquitectura.

---

### 🛠️ Establecer convenciones de naming para rutas y recursos

**Qué significa**  
Acordar reglas para nombres de rutas y recursos (plural, kebab-case, etc.).

**Qué problema resuelve**  
Evita que cada endpoint “se invente” su estilo y el backend quede inconsistente.

**Responsabilidad principal**  
Arquitectura / Backend.

---

### 🛠️ Definir el formato estándar de las respuestas JSON

**Qué significa**  
Acordar cómo responde el backend en éxito (por ejemplo: `message` + `data`).

**Qué problema resuelve**  
El frontend integra más rápido y QA valida más fácil.

**Responsabilidad principal**  
Backend / Arquitectura.

---

### 🛠️ Alinear los status codes HTTP con las respuestas devueltas por la API

**Qué significa**  
Asegurar que cada respuesta usa códigos HTTP correctos y coherentes con el formato.

**Qué problema resuelve**  
Evita ambigüedades: el frontend sabe cuándo algo salió bien o mal sin “interpretar” mensajes.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Documentar las convenciones de la API para el equipo

**Qué significa**  
Dejar escrito el “contrato” y reglas básicas de la API para que todos lo sigan.

**Qué problema resuelve**  
Reduce discusiones repetidas y mantiene consistencia a lo largo del tiempo.

**Responsabilidad principal**  
Arquitectura / Documentación.

---

## 🔹 Feature 1.7 — Dev tooling

### 🛠️ Crear un `docker-compose.yml` para el backend monolítico

**Qué significa**  
Definir cómo se levantan los servicios del backend (API y dependencias) con Docker.

**Qué problema resuelve**  
Permite que todos ejecuten el mismo entorno sin instalar cosas a mano.

**Responsabilidad principal**  
DevOps / Backend.

---

### 🛠️ Definir servicios necesarios (API y dependencias)

**Qué significa**  
Declarar qué contenedores se necesitan para que el backend funcione (por ejemplo: API + DB).

**Qué problema resuelve**  
Evita “en mi máquina va” y hace reproducible el proyecto.

**Responsabilidad principal**  
Backend / DevOps.

---

### 🛠️ Definir redes y volúmenes

**Qué significa**  
Configurar comunicación entre contenedores y persistencia de datos.

**Qué problema resuelve**  
Sin volúmenes, la BD se pierde al reiniciar. Sin redes, los servicios no se ven entre ellos.

**Responsabilidad principal**  
DevOps.

---

### 🛠️ Crear un `.env.example` y añadir `.env` al `.gitignore`

**Qué significa**  
Dar plantilla de variables y evitar subir secretos al repo.

**Qué problema resuelve**  
Protege credenciales y hace onboarding rápido.

**Responsabilidad principal**  
Equipo / Seguridad.

---

### 🛠️ Crear un `Makefile` como punto de entrada único del proyecto

**Qué significa**  
Tener comandos simples tipo `make up`, `make down`, etc.

**Qué problema resuelve**  
Evita memorizar comandos largos y asegura que todos usan el mismo flujo.

**Responsabilidad principal**  
DevOps / Equipo.

---

### 🛠️ Definir comandos claros (`up`, `up-back`, `down`, `clean`, `logs`)

**Qué significa**  
Establecer qué hace cada comando y que sean fáciles de recordar.

**Qué problema resuelve**  
Reduce fricción diaria y errores al levantar/limpiar entorno.

**Responsabilidad principal**  
DevOps / Equipo.

---

### 🛠️ Añadir scripts auxiliares si es necesario (espera de dependencias)

**Qué significa**  
Por ejemplo, esperar a que la base de datos esté lista antes de arrancar la API.

**Qué problema resuelve**  
Evita fallos de arranque por “la BD aún no responde”.

**Responsabilidad principal**  
DevOps / Backend.

---

### 🛠️ Establecer una convención clara para separar backend y frontend

**Qué significa**  
Decidir estructura de carpetas y comandos para que no se mezclen, aunque el front no se implemente aún en esta épica.

**Qué problema resuelve**  
Facilita integrar el frontend después sin rehacer el repo.

**Responsabilidad principal**  
Arquitectura / Equipo.

---

## 🔹 Feature 1.8 — Healthcheck

### 🛠️ Definir una ruta específica para el healthcheck (por ejemplo, `/health`)

**Qué significa**  
Crear un endpoint que solo sirve para comprobar si el servidor está vivo.

**Qué problema resuelve**  
Permite a Docker, QA o cualquier sistema externo saber si el backend responde.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Implementar una respuesta simple que indique que el servidor está funcionando

**Qué significa**  
Responder algo básico (por ejemplo un JSON simple) sin lógica compleja.

**Qué problema resuelve**  
Evita depender de base de datos u otros sistemas y hace el check rápido y fiable.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Asegurar que la ruta devuelve el status code adecuado

**Qué significa**  
Devolver un código claro (normalmente 200 OK) si está vivo.

**Qué problema resuelve**  
Hace que herramientas automáticas puedan interpretar el estado sin analizar texto.

**Responsabilidad principal**  
Backend / QA.

---
