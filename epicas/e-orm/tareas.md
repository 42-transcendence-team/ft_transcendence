# 📘 Explicación de las tareas técnicas — ÉPICA Use an ORM for the database

Este documento explica, en lenguaje claro y no técnico, qué significa cada tarea técnica definida en la épica **Use an ORM for the database**, y por qué existe dentro del proyecto.

---

## 🔹 Feature 1 — Selección y justificación del ORM

### 🛠️ Analizar opciones de ORM compatibles con Go + PostgreSQL

**Qué significa**  
Investigar qué ORMs existen en Go que funcionen bien con PostgreSQL y entender qué ofrecen (cómo se definen modelos, cómo se hacen consultas, cómo se gestionan migraciones, etc.).

**Qué problema resuelve**  
Evita elegir una herramienta al azar que luego se vuelva un freno para el equipo (por ejemplo: poca documentación, mala compatibilidad, o patrones raros).

**Responsabilidad principal**  
Arquitectura / Backend.

---

### 🛠️ Seleccionar un ORM y documentar brevemente la decisión

**Qué significa**  
Elegir una opción concreta y dejar por escrito por qué se eligió, aunque sea en un README corto (por ejemplo: “lo elegimos por compatibilidad, documentación y uso común”).

**Qué problema resuelve**  
Evita discusiones repetidas y hace que la elección sea defendible en evaluación: “no fue capricho, fue decisión técnica razonada”.

**Responsabilidad principal**  
Arquitectura / Backend.

---

## 🔹 Feature 2 — Definición de convenciones de modelos

### 🛠️ Definir el modelo `User` con campos mínimos (`id`, `username`, `email`)

**Qué significa**  
Crear una estructura en Go (un “modelo”) que representa una tabla en la base de datos, con los campos mínimos.

**Qué problema resuelve**  
Sirve como ejemplo real de cómo se van a definir los modelos en el proyecto, y es la base para que otros modelos se creen de forma consistente.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Documentar brevemente las convenciones usadas

**Qué significa**  
Escribir reglas simples para el equipo, por ejemplo:
- cómo se nombran los modelos
- qué tipos se usan
- qué se permite o no dentro del modelo
- cómo se mapean campos y claves

**Qué problema resuelve**  
Evita que cada persona defina modelos “a su manera”, lo cual genera inconsistencia y dificultad de mantenimiento.

**Responsabilidad principal**  
Arquitectura / Backend.

---

## 🔹 Feature 3 — Conexión del ORM a la base de datos

### 🛠️ Configurar la conexión a PostgreSQL usando el ORM

**Qué significa**  
Hacer que el backend pueda abrir una conexión real a PostgreSQL a través del ORM (usando host, puerto, user, password, dbname).

**Qué problema resuelve**  
Sin conexión no hay ORM. Esto valida que el ORM funciona en vuestro entorno (local/Docker).

**Responsabilidad principal**  
Backend.

---

### 🛠️ Integrar la conexión en la inicialización del backend

**Qué significa**  
Asegurar que la conexión se crea al arrancar el backend y queda accesible para el resto del código (rutas, servicios, repositorios…).

**Qué problema resuelve**  
Evita crear conexiones nuevas “por cada request” (mala práctica) y garantiza que el sistema usa la base de datos de forma estable y centralizada.

**Responsabilidad principal**  
Backend / Arquitectura.

---

## 🔹 Feature 4 — Ejemplo mínimo funcional con entidad User

### 🛠️ Implementar operaciones create/read/update sobre `User` usando el ORM

**Qué significa**  
Crear funciones que permitan:
- insertar un usuario nuevo (create)
- consultar un usuario existente (read)
- modificar un usuario (update)

Todo usando el ORM.

**Qué problema resuelve**  
Demuestra que el ORM está realmente integrado y sirve para el uso real del proyecto. También sirve de “plantilla” para futuras entidades.

**Responsabilidad principal**  
Backend.

---

### 🛠️ Verificar que los datos se guardan y recuperan correctamente

**Qué significa**  
Comprobar que lo que insertas se ve en la base de datos, y que lo que lees/actualizas se refleja correctamente.

**Qué problema resuelve**  
Evita que el ORM “parezca integrado” pero esté mal configurado, o que los modelos no coincidan con la tabla, o que haya errores silenciosos.

**Responsabilidad principal**  
Backend / QA.

---
