package server

import (
	"fmt"
	"net/http"

	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/middlewares"

	"github.com/gin-gonic/gin"
)

type HTTPServer struct {
	conf   config.Config
	engine *gin.Engine
}

func NewHTTPServer(conf config.Config) *HTTPServer {

	r := gin.New()

	r.Use(gin.Logger())
	r.Use(middlewares.RecoveryJSON())    // captura panic y devuelve JSON
	r.Use(middlewares.ErrorMiddleware()) // convierte c.Errors a JSON estándar

	_ = r.SetTrustedProxies(nil)

	// DEBUG endpoints (temporal): borrar al finalizar la validación de la feature.
	r.GET("/debug/error", func(c *gin.Context) {
		c.Error(appErr.NewNotFound("Para tu informacion, esto que usted esta haciendo no existe"))
		c.Abort()
	})

	r.GET("/debug/panic", func(c *gin.Context) {
		panic("boom!!!!")
	})
	// hasta aqui

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
