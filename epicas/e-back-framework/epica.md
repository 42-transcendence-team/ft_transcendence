# ÉPICA — Arquitectura base del backend

**Módulo del subject:**  
Use a backend framework

**Categoría:**  
WEB

---

## 🎯 Objetivo de la épica
El objetivo de esta épica es tener un backend estructurado, limpio y escalable desde el inicio, evitando un código caótico y facilitando el mantenimiento y la evolución del proyecto.

---

## 📍 ¿Dónde se ve en el producto?
No se ve directamente en el producto final, pero es una parte esencial del sistema, ya que permite que el backend procese las peticiones del frontend y devuelva respuestas estructuradas de forma ordenada y eficiente.

---

## 👤 Acción del usuario
Cada vez que el usuario realiza cualquier acción en la aplicación web, el frontend envía una petición al backend, que la procesa y devuelve una respuesta estructurada.

---

## 📦 ¿Forma parte del MVP?
Sí

**Justificación:**  
Forma parte del MVP porque sin una base de backend correctamente estructurada no es posible que el resto de funcionalidades del proyecto funcionen correctamente.

---

## 🔗 Dependencias
Esta épica no depende de ninguna otra, ya que establece la base sobre la que se construyen el resto de módulos y funcionalidades del backend.

---

## 🧩 Features incluidas

### Feature 1.1 — Project setup

**Objetivo**  
Preparar la estructura básica del backend para evitar un código caótico y poder arrancar el proyecto.

**Historias de usuario**
- Como desarrollador backend, quiero que el código esté ordenado por bloques de tareas para que sea más sencillo entenderlo, depurarlo y escalarlo.

**Requisitos funcionales**
- El proyecto debe poder compilar y arrancar correctamente.
- Debe existir un punto de entrada único del backend.
- La estructura del proyecto debe permitir identificar claramente las responsabilidades de cada parte del código.

**Requisitos no funcionales**
- El código debe estar organizado de forma coherente y legible.
- La estructura debe permitir añadir nuevas funcionalidades sin refactorizaciones grandes.
- El backend debe ser fácilmente entendible por cualquier miembro del equipo.

**Tareas técnicas**
- Definir una estructura de carpetas coherente.
- Configurar el archivo base del proyecto en Go y sus dependencias.
- Crear el punto de entrada (`main`) que levante el servidor y la API.

---

### Feature 1.2 — Configuration & env

**Objetivo**  
Gestionar la configuración del backend de forma centralizada mediante variables de entorno, evitando valores hardcodeados y permitiendo ejecutar la aplicación en distintos entornos sin modificar el código.

**Historias de usuario**
- Como desarrollador backend, quiero separar la configuración del código para que sea más fácil de modificar y mantener según el entorno de ejecución.
- Como equipo, queremos que valores sensibles (como credenciales) no estén visibles en el repositorio.

**Requisitos funcionales**
- El backend debe poder arrancar utilizando variables de entorno.
- Cambiar la configuración no debe requerir modificar el código.
- Si falta una variable de entorno crítica, el backend debe fallar al arrancar con un error claro.

**Requisitos no funcionales**
- No deben existir valores sensibles hardcodeados en el código.
- La configuración debe cargarse una sola vez al iniciar la aplicación.
- La configuración debe ser accesible desde cualquier parte del backend.
- La solución debe ser compatible con distintos entornos (local, docker, producción).

**Tareas técnicas**
- Definir variables de entorno necesarias (por ejemplo: puerto, IP/host, rutas y credenciales).
- Crear un módulo/carpeta `config` para centralizar la configuración.
- Implementar la carga de variables al arrancar la aplicación.
- Validar la configuración al inicio y fallar con un error claro si es incorrecta.
- Proporcionar `.env.example` como plantilla para el equipo.

---

### Feature 1.3 — Server & routing

**Objetivo**  
Permitir que el backend reciba peticiones HTTP y las dirija al bloque de código correspondiente en función de la ruta solicitada.

**Historias de usuario**
- Como desarrollador backend, quiero definir las rutas del backend para saber a qué parte del código dirigir cada petición entrante.

**Requisitos funcionales**
- El backend debe escuchar peticiones HTTP en una IP y un puerto definidos.
- Cuando se accede a una ruta existente, el backend debe responder con un status code adecuado que indique que la petición ha sido correctamente gestionada.
- Cuando se accede a una ruta inexistente, el backend debe responder con un status code de error.
- El backend no debe caerse ante peticiones inválidas o rutas no definidas.

**Requisitos no funcionales**
- Las rutas deben tener nombres claros y descriptivos que permitan entender su propósito.
- No deben existir rutas duplicadas o ambiguas.
- Las rutas deben estar organizadas de forma coherente para facilitar su localización y mantenimiento.
- La estructura de routing debe permitir añadir nuevas rutas sin afectar a las existentes.

**Tareas técnicas**
- Inicializar el servidor HTTP utilizando el framework seleccionado.
- Definir el punto de escucha del servidor (IP y puerto).
- Crear un sistema de routing que dirija cada petición al bloque de código correspondiente.
- Organizar las rutas siguiendo una estructura clara y coherente.

---

### Feature 1.4 — Middleware

**Objetivo**  
Preparar y filtrar las peticiones entrantes aplicando reglas comunes antes de ejecutar la lógica de cada ruta, garantizando que las peticiones sean válidas y seguras.

**Historias de usuario**
- Como desarrollador backend, quiero estandarizar las peticiones aplicando reglas comunes para preparar las peticiones de forma segura y ordenada.

**Requisitos funcionales**
- Si una petición no cumple las reglas definidas por el middleware, el backend debe responder con un status code de error.
- Si el formato de la petición no es el esperado (por ejemplo, no es JSON cuando se requiere), el backend debe rechazarla con un error claro.
- Las peticiones inválidas no deben llegar al handler correspondiente.
- Las peticiones válidas deben continuar su flujo normal hacia la lógica de la ruta.

**Requisitos no funcionales**
- Las reglas aplicadas por middleware deben ser comunes a todas las rutas que lo requieran.
- No debe existir duplicación de validaciones básicas en los handlers.
- El middleware debe ser fácilmente extensible para añadir nuevas comprobaciones en el futuro.
- El uso de middleware no debe acoplarse a la lógica de negocio ni a la base de datos.

**Tareas técnicas**
- Definir middlewares comunes para el backend.
- Implementar validaciones generales sobre las peticiones entrantes (formato, tamaño, etc.).
- Asegurar que las peticiones que no cumplan las reglas sean rechazadas antes de llegar al handler.
- Integrar los middlewares en el flujo de peticiones del servidor.

---

### Feature 1.5 — Error handling

**Objetivo**  
Capturar y gestionar todos los errores de forma centralizada para devolver respuestas estandarizadas y seguras, evitando comportamientos inesperados y caídas del servidor, y permitiendo que el frontend pueda reaccionar correctamente.

**Historias de usuario**
- Como desarrollador backend, quiero tener todos los errores controlados para evitar comportamientos inesperados en la aplicación.

**Requisitos funcionales**
- Cuando ocurre cualquier error, el backend debe devolver siempre una respuesta al frontend.
- Las respuestas de error deben incluir siempre un status code HTTP adecuado.
- Las respuestas de error deben seguir un formato consistente (JSON).
- El mismo tipo de error debe devolver siempre el mismo status code, independientemente de la ruta donde ocurra.
- El backend no debe caerse ante errores inesperados durante la ejecución.

**Requisitos no funcionales**
- Los errores deben gestionarse de forma centralizada, evitando que cada ruta implemente su propio formato de error.
- No debe exponerse información sensible o interna del sistema en las respuestas de error.
- El sistema de gestión de errores debe ser extensible para añadir nuevos tipos de error.
- Los status codes utilizados deben seguir el estándar HTTP.

**Tareas técnicas**
- Definir una estructura estándar para las respuestas de error.
- Implementar un mecanismo centralizado de captura y gestión de errores.
- Mapear tipos de error a status codes HTTP coherentes.
- Asegurar que los errores no controlados no provocan la caída del servidor.

---

### Feature 1.6 — API structure & conventions

**Objetivo**  
Definir una estructura y un conjunto de convenciones claras para la API que permitan mantener consistencia en las rutas, en los métodos HTTP y en el formato de las respuestas, facilitando su uso y mantenimiento por parte del frontend y del equipo backend.

**Historias de usuario**
- Como desarrollador backend, quiero definir convenciones claras para la API para evitar inconsistencias y facilitar la integración con el frontend.

**Requisitos funcionales**
- Todas las rutas de la API deben seguir una estructura coherente y legible basada en recursos.
- Las acciones sobre los recursos deben definirse mediante métodos HTTP estándar (GET, POST, PUT, DELETE).
- Todas las respuestas exitosas deben devolver datos en formato JSON con una estructura consistente.
- Todas las respuestas deben incluir un mensaje descriptivo que indique el resultado de la operación.
- Las respuestas de error deben seguir el mismo formato general que las respuestas exitosas, pero sin incluir el campo de datos.
- La API debe estar versionada (por ejemplo, `/api/v1`) para permitir la evolución sin romper compatibilidad.

**Requisitos no funcionales**
- El formato de las respuestas debe ser consistente en toda la API.
- Las convenciones deben estar documentadas y ser fáciles de entender por cualquier miembro del equipo.
- La estructura de la API debe permitir añadir nuevas versiones sin afectar a las existentes.
- No deben existir rutas ambiguas ni nombres inconsistentes.

**Tareas técnicas**
- Definir la estructura base de la API (por ejemplo, `/api/v1`).
- Establecer convenciones de naming para rutas y recursos.
- Definir el formato estándar de las respuestas JSON.
- Alinear los status codes HTTP con las respuestas devueltas por la API.
- Documentar las convenciones de la API para el equipo.

---

### Feature 1.7 — Dev tooling

**Objetivo**  
Facilitar la inicialización y puesta en marcha del proyecto proporcionando herramientas que permitan levantar, detener y trabajar con el backend de forma sencilla, consistente y reproducible para todo el equipo.

Esta feature se centra en un **backend monolítico**.  
El **frontend no forma parte de esta épica**, pero la estructura quedará preparada para integrarlo más adelante sin romper el flujo de trabajo.

**Historias de usuario**
- Como miembro del equipo, quiero poder levantar el backend con un solo comando.
- Como desarrollador, quiero poder detener y limpiar el entorno fácilmente.
- Como equipo, queremos diferenciar claramente el arranque del backend del frontend.

**Requisitos funcionales**
- El proyecto debe poder arrancarse mediante un único comando.
- Debe ser posible levantar únicamente el backend.
- Debe existir un comando para detener el entorno.
- Debe existir un comando para limpiar contenedores y volúmenes.
- El arranque debe construir imágenes y levantar servicios en el orden correcto.
- El backend debe mostrar logs básicos al arrancar.

**Requisitos no funcionales**
- El entorno debe ser reproducible para todo el equipo.
- No debe ser necesaria configuración manual en cada máquina.
- Las herramientas deben ser simples y claras.
- La estructura debe permitir añadir el frontend en el futuro sin reestructuraciones grandes.

**Tareas técnicas**
- Crear un `docker-compose.yml` para el backend monolítico.
- Definir servicios necesarios (API y dependencias).
- Definir redes y volúmenes.
- Crear un `.env.example` y añadir `.env` al `.gitignore`.
- Crear un `Makefile` como punto de entrada único del proyecto.
- Definir comandos claros (`up`, `up-back`, `down`, `clean`, `logs`).
- Añadir scripts auxiliares si es necesario (espera de dependencias).
- Establecer una convención clara para separar backend y frontend.

---

### Feature 1.8 — Healthcheck

**Objetivo**  
Proporcionar un mecanismo simple y fiable para comprobar que el backend está vivo y respondiendo a peticiones HTTP desde fuera del sistema.

**Historias de usuario**
- Como miembro del equipo o sistema externo, quiero poder comprobar fácilmente si el backend está funcionando para saber si el servicio está disponible.

**Requisitos funcionales**
- El backend debe exponer una ruta simple (por ejemplo, `/health`) accesible mediante una petición HTTP.
- Al acceder a la ruta de healthcheck, el backend debe responder si el servidor está activo y puede atender peticiones.
- La ruta de healthcheck debe devolver un status code HTTP que indique claramente el estado del servicio.
- La respuesta del healthcheck debe ser rápida y no depender de lógica compleja.

**Requisitos no funcionales**
- El healthcheck debe ser independiente de la base de datos y de la lógica de negocio.
- La implementación debe ser ligera y no afectar al rendimiento del backend.
- La ruta de healthcheck debe ser estable y consistente para su uso por Docker, frontend u otros sistemas externos.

**Tareas técnicas**
- Definir una ruta específica para el healthcheck (por ejemplo, `/health`).
- Implementar una respuesta simple que indique que el servidor está funcionando.
- Asegurar que la ruta devuelve el status code adecuado.



## 📝 Notas adicionales
Docu de gin -> https://gin-gonic.com/es/docs/
Docu de go -> https://go.dev/doc/

