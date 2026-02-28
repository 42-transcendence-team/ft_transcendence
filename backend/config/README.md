# Configuración y Entornos — ft_transcendence

## Visión general

La aplicación utiliza variables de entorno centralizadas en un archivo `.env`, gestionadas por:

- `config.Load()` → carga y parseo  
- `Config.Validate()` → validación obligatoria antes del arranque  
- `docker-compose` → inyección de variables en contenedores  

> ⚠️ El backend no arranca si la configuración es inválida.


## Entornos disponibles

```env
ENV=local
# o
ENV=prod
```

## local

Pensado para desarrollo.

- Permite `DB_SSLMODE=disable`.  
- Activa `gin.Logger()`.  
- Puede cargar `.env` automáticamente al ejecutar `go run`.  


## prod

Pensado para despliegue.

- Fuerza `gin.ReleaseMode`.  
- No permite `DB_SSLMODE=disable`.  
- Falla en arranque si hay configuración insegura o inválida.  


## Archivo `.env`

El archivo `.env` debe estar en la raíz del proyecto.

- ❌ Nunca subir un `.env` real con secretos al repositorio.
- ✅ Se proporciona un `.env.example` como plantilla. 
- Variables que actualmente no se usen estaran comentadas, ir descomentando y dandoles un valor por en el .env.example segun se vayan necesitando


## Docker y variables de entorno

En `docker-compose.yml`:

```yaml
env_file: .env
```
Docker inyecta automáticamente todas las variables dentro del contenedor.

- El backend no depende de `godotenv` en Docker.


## Cómo funciona la configuración en el backend

### 1. `config.Load()`

Responsable de:

- Leer variables de entorno  
- Aplicar *defaults* a variables no críticas  
- Validar `ENV`  
- Construir el struct `Config`  
- Llamar a `Validate()`  


### 2. `Config.Validate()`

Garantiza que la aplicación no arranque en un estado inconsistente.

Se valida:

- Variables obligatorias (`DB_HOST`, `DB_USER`, etc.)  
- Puertos dentro de rango  
- `SSL mode` válido  
- Coherencia del pool  
- Reglas adicionales en `prod`  

Si falla → `[BOOT][CONFIG]` y la aplicación termina.


## Cómo añadir una nueva variable de configuración

Cuando se añade una nueva variable:


### Paso 1 — Añadir al `.env.example`

- Documentarla claramente.

**Ejemplo:**

```env
JWT_SECRET=CHANGE_ME
```


### Paso 2 — Añadir al struct `Config`

**Ejemplo:**

```go
JWTSecret string
```


### Paso 3 — Leerla en `Load()`

**Ejemplo:**

```go
c.JWTSecret = strings.TrimSpace(os.Getenv("JWT_SECRET"))
```

Si no es crítica, puedes usar:

```go
envIntOrDefault(...)
```


### Paso 4 — Validarla en `Validate()` si es necesario

Solo validar si la variable:

- Es obligatoria  
- Es sensible (secret, SSL, etc.)  
- Puede romper el sistema si es incorrecta  


## Ejecución del proyecto

### Desarrollo con Docker

```bash
docker compose up --build
```

### Desarrollo sin Docker (backend)

- cambiar la variable del .env: DB_HOST=postgres a -> DB_HOST=localhost

```bash
export ENV=local
docker compose up -d postgres
go run ./cmd/api
```

## Errores de arranque (BOOT)

Si la configuración es inválida:

```bash
[BOOT][CONFIG] invalid config: ...
[BOOT][DB] init failed: ...
[BOOT] server stopped with error: ...
```
- El proceso termina inmediatamente.

Esto es intencionado.