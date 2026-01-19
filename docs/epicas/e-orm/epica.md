# ÉPICA — Use an ORM for the database

**Módulo del subject:**  
WEB — Use an ORM for the database

**Categoría:**  
WEB

---

## 🎯 Objetivo de la épica
Facilitar y estandarizar la interacción entre el backend y la base de datos, permitiendo trabajar con los datos de forma más limpia, mantenible y segura, sin depender de SQL manual repetitivo.

---

## 📍 ¿Dónde se ve en el producto?
No es visible directamente para el usuario final, pero es una pieza clave del backend que permite que las funcionalidades del producto interactúen correctamente con la base de datos.

---

## 👤 Acción del usuario
El usuario no interactúa directamente con esta épica.  
Su impacto se refleja en que las acciones del usuario (crear, consultar o actualizar información) se procesan correctamente y se almacenan de forma consistente.

---

## 📦 ¿Forma parte del MVP?
**Sí**

**Justificación:**  
Sin una forma estructurada de interactuar con la base de datos, el backend no puede funcionar ni escalar correctamente. El ORM permite que el MVP tenga una base de datos operativa y mantenible desde el inicio.

---

## 🔗 Dependencias
- Backend framework configurado (Gin)
- Base de datos PostgreSQL disponible
- Conexión básica a la base de datos

---

# 🧩 Features de la épica

## Feature 1 — Selección y justificación del ORM

### 🎯 Objetivo
Elegir un ORM compatible con Go y PostgreSQL que permita realizar operaciones básicas con la base de datos de forma fiable y documentada.

### 📖 Historias técnicas
- Como desarrolladora, quiero usar un ORM compatible con Go y PostgreSQL para evitar soluciones improvisadas o dependientes de SQL manual.
- Como equipo, queremos una herramienta documentada para poder usarla de forma consistente.

### ✅ Requisitos funcionales
- El ORM permite conectarse a PostgreSQL desde Go.
- Permite realizar operaciones básicas sin escribir SQL manual complejo.

### 🛡️ Requisitos no funcionales
- Compatibilidad técnica demostrable con Go y PostgreSQL.
- Documentación suficiente para su uso por el equipo.

### 🛠️ Tareas técnicas
- Analizar opciones de ORM compatibles con Go + PostgreSQL.
- Seleccionar un ORM y documentar brevemente la decisión.

---

## Feature 2 — Definición de convenciones de modelos

### 🎯 Objetivo
Establecer una forma estándar de definir modelos de datos en el backend usando el ORM.

### 📖 Historias técnicas
- Como desarrolladora, quiero definir modelos desde código para que la estructura de datos sea clara y coherente.

### ✅ Requisitos funcionales
- Existe al menos un modelo definido mediante el ORM.
- El modelo refleja correctamente la estructura de la tabla asociada.

### 🛡️ Requisitos no funcionales
- Código legible y coherente para todo el equipo.
- Evitar lógica de negocio en los modelos.

### 🛠️ Tareas técnicas
- Definir el modelo `User` con campos mínimos (`id`, `username`, `email`).
- Documentar brevemente las convenciones usadas.

---

## Feature 3 — Conexión del ORM a la base de datos

### 🎯 Objetivo
Permitir que el backend se conecte a PostgreSQL usando el ORM.

### 📖 Historias técnicas
- Como sistema, necesito una conexión estable a la base de datos para ejecutar operaciones de persistencia.

### ✅ Requisitos funcionales
- El backend se conecta correctamente a la base de datos mediante el ORM.
- La conexión se reutiliza para las operaciones de datos.

### 🛡️ Requisitos no funcionales
- Configuración clara y centralizada.
- Compatible con ejecución en entorno Docker.

### 🛠️ Tareas técnicas
- Configurar la conexión a PostgreSQL usando el ORM.
- Integrar la conexión en la inicialización del backend.

---

## Feature 4 — Ejemplo mínimo funcional con entidad User

### 🎯 Objetivo
Demostrar el uso real del ORM mediante operaciones básicas sobre una entidad simple.

### 📖 Historias técnicas
- Como desarrolladora, quiero crear, leer y actualizar un usuario usando el ORM para validar su integración.

### ✅ Requisitos funcionales
- Se puede crear un usuario en la base de datos.
- Se puede leer un usuario existente.
- Se puede actualizar un usuario existente.

### 🛡️ Requisitos no funcionales
- No incluir lógica de autenticación ni gestión de usuarios avanzada.
- Evitar sobreingeniería.

### 🛠️ Tareas técnicas
- Implementar operaciones create/read/update sobre `User` usando el ORM.
- Verificar que los datos se guardan y recuperan correctamente.

---

## 🚫 Fuera de alcance de la épica
- Autenticación y autorización
- User management completo
- File upload y gestión de archivos
- Creación de todas las tablas del sistema


