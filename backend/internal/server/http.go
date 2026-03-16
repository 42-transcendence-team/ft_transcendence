package server

import (
	"backend/config"
	"backend/internal/middlewares"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Conf   *config.Config
	Engine *gin.Engine
	Db     *gorm.DB
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
	r.Use(middlewares.CORS())            // CORS para permitir peticiones desde el frontend

	_ = r.SetTrustedProxies(nil)

	srv := &HTTPServer{
		Conf:   conf,
		Engine: r,
		Db:     db,
	}

	srv.Router()

	return srv
}
