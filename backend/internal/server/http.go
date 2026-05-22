package server

import (
	"backend/config"
	"backend/internal/middlewares"
	"backend/internal/store"
	"github.com/redis/go-redis/v9"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Conf   *config.Config
	Engine *gin.Engine
	Db     *gorm.DB
	Redis	*redis.Client
}

func NewHTTPServer(conf *config.Config, db *gorm.DB, rdb *redis.Client) *HTTPServer {

	if conf.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// esto se deja asi si luego en prod metemos algun otro logger , sino en prod tbn se puede usar r.Use(gin.Logger())
	if conf.Env == "local" {
		r.Use(gin.Logger())
	}

	r.Use(middlewares.RecoveryJSON())           // captura panic y devuelve JSON
	r.Use(middlewares.ErrorMiddleware())        // convierte c.Errors a JSON estándar
	r.Use(middlewares.CORS(conf.GoAllowedURLs)) // CORS para permitir peticiones desde el frontend

	_ = r.SetTrustedProxies(nil)

	srv := &HTTPServer{
		Conf:   conf,
		Engine: r,
		Db:     db,
		Redis:	rdb,
	}

	// Inicializa el TempStore global para la gestión de tokens temporales (en este caso para 2FA)
	store.InitGlobalTempStore()
	srv.Router()
	return srv
}
