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

/*
Para enviar solicitud

	comprobar que el receptor existe
	comprobar que no sois amigos
	comprobar que no hay bloqueo
	comprobar que no hay solicitud pendiente

Para aceptar solicitud

	cambiar FriendRequest.status = accepted
	crear Friendship
	Para borrar amigo
	borrar la fila de Friendship

Para bloquear

	crear Block
	borrar Friendship si existe
	borrar o invalidar solicitudes pendientes entre ambos
*/
func FriendsRoutes(api *gin.RouterGroup, friendHandler *handlers.FriendHandler) {

	// Mandar peticion de amistad
	api.POST("friend/request", friendHandler.SendFriendRequest)
	// Aceptar peticion de amistad
	// Rechazar peticion de amistad
	// Borrar amigo
	// Bloquear usuario
	// Desbloquear usuario
	// Lista de usuarios bloqueados
	// Lista de amigos
	// Lista de peticiones
}
