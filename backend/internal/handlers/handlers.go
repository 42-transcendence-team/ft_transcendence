package handlers

import (
	"backend/internal/health"
	"net/http"
	"github.com/gin-gonic/gin"
)
// en este archivo se exponen los handlers de cada uno de los paquetes que contienen logica de negocio
// asi que para añadir más handlers hay que crear una carpeta con el paquete heath, login...
// importarlo en handlers, y confeccionar una funcion para exponer toda esa logica como hanfler de endpoint

// Funcion manejadora para el endpoint de healthcheck.
// Se encarga de llamar al servicio de salud (health/checker.go) y devolver la respuesta en formato JSON.
func RegisterHealth(c *gin.Context) {
		data := health.Check()
		if data.Status != "ok" {
			c.JSON(http.StatusServiceUnavailable, data)
			return
		}
		c.JSON(http.StatusOK, data)
}
