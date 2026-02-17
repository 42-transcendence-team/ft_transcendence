package server

import (
	"fmt"

	"backend/config"
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTTPServer struct {
	conf   config.Config
	engine *gin.Engine
	db     *gorm.DB
}

func NewHTTPServer(conf config.Config, db *gorm.DB) *HTTPServer {

	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	_ = r.SetTrustedProxies(nil)

	handlers.RegisterHealthHandler(r)

	return &HTTPServer{
		conf:   conf,
		engine: r,
		db:     db,
	}
}

func (srv *HTTPServer) Run() error {

	addr := fmt.Sprintf("%s:%s", srv.conf.Host, srv.conf.Port)
	return (srv.engine.Run(addr))
}
