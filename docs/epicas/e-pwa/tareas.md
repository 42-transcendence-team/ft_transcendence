# 📘 Explicación de las tareas técnicas — ÉPICA PWA

Este documento explica, en lenguaje claro y no técnico, qué significa cada tarea técnica definida en la épica **Progressive Web App (PWA) with offline support and installability**, y por qué existe dentro del proyecto.

---

## 🔹 Feature 1 — Instalabilidad de la aplicación (PWA)

### 🛠️ Configurar los elementos necesarios para habilitar la instalabilidad

**Qué significa**  
Asegurar que la aplicación web cumple los requisitos necesarios para que el navegador permita instalarla como una app.

**Qué problema resuelve**  
Permite que el usuario pueda “instalar” la web en su dispositivo y usarla como una app, con icono propio y acceso directo.

**Responsabilidad principal**  
Frontend.

---

### 🛠️ Validar el comportamiento en desktop y mobile

**Qué significa**  
Comprobar que la aplicación se puede instalar y usar correctamente tanto en ordenador como en móvil.

**Qué problema resuelve**  
Evita errores o comportamientos extraños que solo aparezcan en la versión instalada o en un tipo de dispositivo.

**Responsabilidad principal**  
Frontend / QA.

---

### 🛠️ Documentar el comportamiento esperado de la app instalada

**Qué significa**  
Dejar claro por escrito qué hace y qué no hace la app instalada respecto a la versión web.

**Qué problema resuelve**  
Evita confusión en el equipo y permite defender correctamente el alcance en evaluación.

**Responsabilidad principal**  
Arquitectura / documentación.

---

## 🔹 Feature 2 — Soporte offline de lectura (Feed y Chat)

### 🛠️ Definir qué datos se consideran cacheables para offline

**Qué significa**  
Decidir qué información se guarda localmente para que esté disponible sin conexión.

**Qué problema resuelve**  
Evita intentar cargar datos que no existen offline y limita el uso de almacenamiento del dispositivo.

**Responsabilidad principal**  
Arquitectura + Frontend.

---

### 🛠️ Garantizar la reconstrucción de vistas sin conexión

**Qué significa**  
Asegurar que las pantallas (feed y chat) se pueden mostrar correctamente usando solo datos ya guardados cuando no hay red.

**Qué problema resuelve**  
Evita pantallas rotas, errores o loaders infinitos en modo offline.

**Responsabilidad principal**  
Frontend.

---

### 🛠️ Coordinar con frontend el comportamiento de navegación offline

**Qué significa**  
Acordar qué pantallas se pueden visitar offline y qué pasa si el usuario intenta navegar a algo no disponible.

**Qué problema resuelve**  
Mantiene una experiencia de usuario coherente y predecible.

**Responsabilidad principal**  
Arquitectura + Frontend.

---

## 🔹 Feature 3 — Envío de mensajes de chat en modo offline (cola)

### 🛠️ Definir identificación única de mensajes generados en cliente

**Qué significa**  
Decidir que cada mensaje tenga un identificador único creado en el cliente antes de enviarse.

**Qué problema resuelve**  
Permite evitar mensajes duplicados cuando se reintentan envíos al volver la conexión.

**Responsabilidad principal**  
Arquitectura + Frontend.

---

### 🛠️ Acordar contrato backend para deduplicación

**Qué significa**  
Definir cómo responde el backend cuando recibe un mensaje que ya fue procesado anteriormente.

**Qué problema resuelve**  
Garantiza idempotencia y evita inconsistencias en el chat.

**Responsabilidad principal**  
Backend + Arquitectura.

---

### 🛠️ Definir estados de mensaje (pendiente / enviado)

**Qué significa**  
Decidir los distintos estados por los que puede pasar un mensaje y cómo se reflejan en la interfaz.

**Qué problema resuelve**  
El usuario entiende si un mensaje está pendiente, enviado o ha fallado.

**Responsabilidad principal**  
Frontend + UX.

---

## 🔹 Feature 4 — Gestión de acciones no disponibles offline

### 🛠️ Identificar acciones no soportadas offline

**Qué significa**  
Hacer una lista clara de acciones que requieren conexión a internet.

**Qué problema resuelve**  
Evita comportamientos ambiguos y errores innecesarios.

**Responsabilidad principal**  
Arquitectura + Producto.

---

### 🛠️ Definir mensajes de feedback estándar

**Qué significa**  
Unificar los mensajes que se muestran cuando una acción no está disponible offline.

**Qué problema resuelve**  
Mejora la experiencia de usuario y evita mensajes técnicos confusos.

**Responsabilidad principal**  
UX + Frontend.

---

### 🛠️ Coordinar comportamiento entre frontend y backend

**Qué significa**  
Asegurar que frontend y backend están alineados sobre qué acciones se bloquean offline y cuáles no llegan al servidor.

**Qué problema resuelve**  
Evita errores innecesarios y flujos rotos.

**Responsabilidad principal**  
Arquitectura + Frontend + Backend.

---

## 🧠 Nota final

Muchas de estas tareas no son código, sino:
- Decisiones de arquitectura
- Definición de límites
- Coordinación entre equipo
- UX clara y defendible

Eso es totalmente correcto y esperado en una épica técnica de PWA.
