package routes

import (
		"github.com/gin-gonic/gin"
		"backend/internal/handlers"
)

func NotificationRoutes(api *gin.RouterGroup, notiHandler *handlers.NotificationsHandler) {
		api.GET("/notifications", notiHandler.GetNotifications)
}
