package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

/*
Request POST /api/v1/auth/register
Validar input (email/login/password)
Comprobar si ya existe (email o login únicos)
Hashear password (NUNCA guardar plano)
Crear usuario (ORM)
Responder 201 Created con usuario “safe” (sin password)
*/

func AuthRoutes(api *gin.RouterGroup) {
	// comentario que habra q poner para el suager ese crear usuario de momento es de prueba luego ira en register
	api.POST("auth/register", handlers.Register)

}
