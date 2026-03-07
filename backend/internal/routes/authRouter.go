package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

/*
cosas q hacer ->
Request POST /api/v1/auth/register ok
Validar input (email/login/password) ok
Comprobar si ya existe (email o login únicos) ok
Hashear password (NUNCA guardar plano)
Crear usuario (ORM) ver como integrarlo con lo de sara
Responder 201 Created con usuario “safe” (sin password)
*/

func AuthRoutes(api *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	// comentario que habra q poner para el suager ese para registro de usuario
	api.POST("auth/register", authHandler.Register)

}
