### 1. BOOT (errores de arranque)

Incluyen errores como:

- Conexión a base de datos
- Inicialización del ORM
- Configuración inválida
- Fallo al levantar el servidor HTTP

Estos errores ocurren antes de que el servidor empiece a aceptar requests.

## Convención

- No usar `AppError`.
- Propagar errores con `fmt.Errorf(... %w ...)`.
- Log claro con prefijo `[BOOT]`.
- Finalizar el proceso con `log.Fatalf`.

## Ejemplo

```go
gormDB, err := db.ConnectPostgres(conf)
if err != nil {
    log.Fatalf("[BOOT][DB] connection failed: %v", err)
}
```
[BOOT] para arranque [BD] identifica en este caso que el error esta en la base de datos, y si estan los dos mezclados se ponen las dos etiquetas, no se si para un futuro se añadiran mas cosas antes de que el server empieze a aceptar request, pero en el futuro se pueden añadir mas etiquetas como esas

- [BOOT][DB] connection failed
- [DB] unique constraint violation
- [DB] query timeout

---

### 2.AppError (tipo de error a nivel de dominio)

Se creó una estructura personalizada `AppError` con:

- `Code`
- `HTTPStatus`
- `Message`
- `Details`
- `Err` interno (no expuesto al cliente)

Constructores helper:

- `NewNotFound`
- `NewConflict`
- `NewValidation`
- `NewInternal`
- etc.

Esto permite que los servicios devuelvan errores de dominio estructurados e independientes de HTTP.

---

### 3.Contrato JSON estándar para errores

Todos los errores ahora siguen el siguiente formato:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "details": {}
  }
}
```

Esto actúa como un contrato público con el frontend.

---

### 4.ErrorMiddleware

- Intercepta errores añadidos mediante `c.Error(err)`
- Convierte `AppError` en una respuesta JSON estandarizada
- Proporciona un fallback seguro para errores inesperados
- Previene dobles escrituras (`c.Writer.Written()`)

Los handlers deben seguir este patrón:
⚠️ **IMPORTANTE**

```go
if err != nil {
    c.Error(err)
    c.Abort()
    return
}
```

---

### 5.RecoveryJSON (manejo de pánicos)

Reemplaza `gin.Recovery()`.

- Captura pánicos
- Devuelve una respuesta estandarizada `INTERNAL_ERROR`
- Evita filtrar información interna del panic
- Preparado para soportar logging de stacktrace.
