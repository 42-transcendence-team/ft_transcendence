package middlewares

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// ELKLoggerMiddleware genera logs en JSON estructurado listos para Filebeat/Logstash
func ELKLoggerMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// 1. Gestionar o generar el Request ID
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID) // Lo guardamos en el contexto por si otros handlers lo necesitan

		// 2. Procesar la petición (ejecuta el resto de middlewares y el endpoint)
		c.Next()

		// 3. Recolectar datos tras la ejecución
		duration := time.Since(start)
		statusCode := c.Writer.Status()
		path := c.Request.URL.Path

		// Intentar obtener el ID de usuario si tu middleware de auth ya lo guardó en el contexto
		userID := "anonymous"
		if val, exists := c.Get("user_id"); exists {
			if idStr, ok := val.(string); ok {
				userID = idStr
			}
		}

		// Estructura de campos para Elasticsearch
		fields := []zap.Field{
			zap.String("request_id", requestID),
			zap.String("http.request.method", c.Request.Method),
			zap.String("http.request.path", path),
			zap.String("http.request.remote_address", c.ClientIP()),
			zap.Int("http.request.status_code", statusCode),
			zap.Int64("http.request.duration_ms", duration.Milliseconds()),
			zap.String("user.id", userID),
			zap.String("log.source", "golang-api"),
		}

		// 4. Clasificar el log según el código de estado HTTP
		if statusCode >= 500 {
			// Si hay errores internos guardados por c.Error(), los añadimos al log
			if len(c.Errors) > 0 {
				fields = append(fields, zap.String("error.message", c.Errors.String()))
			}
			logger.Error("HTTP Request Error", fields...)
		} else if statusCode >= 400 {
			logger.Warn("HTTP Request Client Warning", fields...)
		} else {
			logger.Info("HTTP Request Success", fields...)
		}
	}
}
