package handlers

import (
	"backend/internal/health"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Funcion manejadora para el endpoint de healthcheck.
// Se encarga de llamar al servicio de salud (health/checker.go) y devolver la respuesta en formato JSON.

func RegisterHealthHandler(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		data := health.Check()
		if data.Status != "ok" {
			c.JSON(http.StatusServiceUnavailable, data)
			return
		}
		c.JSON(http.StatusOK, data)
	})
}
