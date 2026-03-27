package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

/*
Agregar amigo
Borrar amigo
Bloquear / desbloquear usuario
Botón que lleve a la lista de amigos
Desde la lista, poder ir al perfil del amigo
*/
// pensar en mandar notificacion de amistad

func FriendsRoutes(api *gin.RouterGroup, friendHandler *handlers.FriendHandler) {

	// Mandar peticion de amistad
	// Aceptar peticion de amistad
	// Rechazar peticion de amistad
	// Borrar amigo
	// Bloquear usuario
	// Lista de amigos
	// Lista de peticiones
}
