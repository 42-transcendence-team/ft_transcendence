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

	friends := api.Group("/friends")
	{
		// Lista de amigos
		friends.GET("", friendHandler.ListFriends)

		// Mandar peticion de amistad
		friends.POST("/requests", friendHandler.SendFriendRequest)
		// Lista de peticiones
		friends.GET("/requests/incoming", friendHandler.ListIncomingRequests)
		friends.GET("/requests/outgoing", friendHandler.ListOutgoingRequests)
		// Aceptar peticion de amistad
		friends.PATCH("/requests/:requestId/accept", friendHandler.AcceptFriendRequest)
		// Rechazar peticion de amistad
		friends.PATCH("/requests/:requestId/reject", friendHandler.RejectFriendRequest)

		// Borrar amigo
		/*
			friends.DELETE("/:userId", friendHandler.DeleteFriend)
			friends.POST("/blocks", friendHandler.BlockUser)
			friends.DELETE("/blocks/:userId", friendHandler.UnblockUser)*/
		// Bloquear usuario
		// Desbloquear usuario
		// Lista de usuarios bloqueados
	}
}
