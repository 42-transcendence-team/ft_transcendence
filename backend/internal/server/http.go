package server

import (
	"backend/config"
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Conf   config.Config
	Engine *gin.Engine
	Db     *gorm.DB
}

func NewHTTPServer(conf config.Config, db *gorm.DB) *HTTPServer {

	r := gin.New()

	// Escribe en consola cada peticion a la pagina
	r.Use(gin.Logger())
	// Hace catch a todos los handlers del server para que los panics no tiren el servidor
	r.Use(gin.Recovery())

	_ = r.SetTrustedProxies(nil)

	srv := &HTTPServer{
		Conf:   conf,
		Engine: r,
		Db:     db,
	}
	srv.Router()

	return srv
}

// El enroutador es una retaila de: Metodo -> ruta -> handler
// Para añadir un endpoint hay que confeccionar la funcion en internals/handlers y
// añadir el enpoint con un comantario encima describiendo lo que hace para el swagger
func (srv *HTTPServer) Router() {

	// Anuncia el estado del servidor (Sano -> 200, o caido-> 503) en formato JSON
	srv.Engine.GET("/health", handlers.RegisterHealth)

	// usaremos este grupo para definir las funciones del proyecto y aplicar middlewares comunes
	// api := srv.Engine.Group("api/v1")
	// ejemplo:
	// api.GET("/login", log42Aouth2)

	srv.Engine.NoMethod(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "method not allowed"})
	})
	srv.Engine.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})
}
