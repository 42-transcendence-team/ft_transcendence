package server

import (
	"backend/config"
	"backend/internal/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Conf   *config.Config
	Engine *gin.Engine
	Db     *gorm.DB
	Redis  *redis.Client
}

func NewHTTPServer(conf *config.Config, db *gorm.DB, rdb *redis.Client) *HTTPServer {

	if conf.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	middlewares.Register()   // registra los contadores y histogramas de prometheus
	middlewares.InitLogger() // inicializa el logger de zap

	r := gin.New()

	// esto se deja asi si luego en prod metemos algun otro logger , sino en prod tbn se puede usar r.Use(gin.Logger())
	// if conf.Env == "local" {
	// 	r.Use(gin.Logger())
	// }
	r.Use(middlewares.PrometheusMiddleware()) // middleware para métricas de prometheus
	r.Use(middlewares.GinZapLogger())

	r.Use(middlewares.RecoveryJSON())           // captura panic y devuelve JSON
	r.Use(middlewares.ErrorMiddleware())        // convierte c.Errors a JSON estándar
	r.Use(middlewares.CORS(conf.GoAllowedURLs)) // CORS para permitir peticiones desde el frontend

	_ = r.SetTrustedProxies(nil)

	srv := &HTTPServer{
		Conf:   conf,
		Engine: r,
		Db:     db,
		Redis:  rdb,
	}

	srv.Router()
	return srv
}
