package server

import (
	"fmt"
	"net/http"

	"backend/config"
	"github.com/gin-gonic/gin"
)

type HTTPServer struct {
	conf   config.Config
	engine *gin.Engine
}

func NewHTTPServer(conf config.Config) *HTTPServer {

	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	_ = r.SetTrustedProxies(nil)

	// Temporary health endpoint to verify HTTP server startup.
	// Will be moved to a dedicated health handler when implementing healthcheck epic.
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return &HTTPServer{
		conf:   conf,
		engine: r,
	}
}

func (srv *HTTPServer) Run() error {

	addr := fmt.Sprintf("%s:%s", srv.conf.Host, srv.conf.Port)
	return (srv.engine.Run(addr))
}
