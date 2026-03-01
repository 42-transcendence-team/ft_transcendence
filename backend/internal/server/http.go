package server

import (
	"fmt"

	"backend/config"
	"backend/internal/handlers"
	"backend/internal/middlewares"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTTPServer struct {
	conf   *config.Config
	engine *gin.Engine
	db     *gorm.DB
}

func NewHTTPServer(conf *config.Config, db *gorm.DB) *HTTPServer {

	if conf.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// esto se deja asi si luego en prod metemos algun otro logger , sino en prod tbn se puede usar r.Use(gin.Logger())
	if conf.Env == "local" {
		r.Use(gin.Logger())
	}
	
	r.Use(middlewares.RecoveryJSON())    // captura panic y devuelve JSON
	r.Use(middlewares.ErrorMiddleware()) // convierte c.Errors a JSON estándar

	_ = r.SetTrustedProxies(nil)

	handlers.RegisterHealthHandler(r)
	
	return &HTTPServer{
		conf:   conf,
		engine: r,
		db:     db,
	}
}

func (srv *HTTPServer) Run() error {

	addr := fmt.Sprintf("%s:%d", srv.conf.GoServiceHost, srv.conf.GoServicePort)
	return (srv.engine.Run(addr))
}
