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

		requests := friends.Group("requests")
		{
			// Mandar peticion de amistad
			requests.POST("/", friendHandler.SendFriendRequest)
			// Lista de peticiones
			requests.GET("/incoming", friendHandler.ListIncomingRequests)
			requests.GET("/outgoing", friendHandler.ListOutgoingRequests)
			// Aceptar peticion de amistad
			requests.PATCH("/:requestId/accept", friendHandler.AcceptFriendRequest)
			// Rechazar peticion de amistad
			requests.PATCH("/:requestId/reject", friendHandler.RejectFriendRequest)

		}

		// Borrar amigo
		// TODO: cuando me borrro a mi mismo me d aun 404 arreglar
		friends.DELETE("/:userId", friendHandler.DeleteFriend)

		// Bloquear usuario
		// friends.POST("/blocks", friendHandler.BlockUser)
		// Desbloquear usuario
		// friends.DELETE("/blocks/:userId", friendHandler.UnblockUser)
		// Lista de usuarios bloqueados
		//
	}
}
