package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func	HealthRoutes(incomingRoutes *gin.Engine) {
	// Anuncia el estado del servidor (Sano -> 200, o caido-> 503) en formato JSON
	incomingRoutes.GET("/health", handlers.RegisterHealth)
}