package handlers

import (
	"fmt"
	"net/http"

	"backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func ServeWS(Hub *services.Hub, Db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
		
        userID := uint(1)  // user id hardcodeado deberia extraerse del jwt
				//userID := (uintValue)c.GET("userId") casteat a uint

        conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
        if err != nil {
            fmt.Println("Error en Upgrade:", err)
            return
        }
				client := &services.Client{
						Hub:      Hub,
						Conn:     conn,
						Send:     make(chan []byte, 256),
						UserID:   userID,
						Channels: []string{"1"},
				}

				client.Hub.Register <- client

        go client.WritePump()
        go client.ReadPump()
    }
}
