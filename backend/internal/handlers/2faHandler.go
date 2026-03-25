package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

type TwoFAHandler struct {
	TwoFAService *services.TwoFAService
}

func New2FAHandler(twoFAService *services.TwoFAService) *TwoFAHandler {
	return &TwoFAHandler{TwoFAService: twoFAService}
}

// Se hace la peticion para generar una nueva clave TOTP.
// Se devuelve un QR generado automaticamente
func (h *TwoFAHandler) Enable2FA(c *gin.Context) {
	var request dto.TwoFAEnable

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	key, err := h.TwoFAService.Enable2FA(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{"message": "2FA enabled successfully", "QR": key.QR})
}

// Se hace la peticion para verificar el codigo TOTP generado en la app de autenticacion
// Se devuelve un booleano indicando si el codigo es correcto o no
func (h *TwoFAHandler) Verify2FA(c *gin.Context) {
	var request dto.TwoFAVerify

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	isValid, err := h.TwoFAService.Verify2FA(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{"message": "2FA verified successfully", "isValid": isValid})
}

// Se hace la peticion para deshabilitar la 2FA
// eliminando el secreto TOTP del usuario y marcando la 2FA como inactiva
func (h *TwoFAHandler) Disable2FA(c *gin.Context) {
	var request dto.TwoFADisable

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	del, err := h.TwoFAService.Disable2FA(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{"message": "2FA disabled successfully", "rowsAffected": del})
}

// Este handler creo que se llamaria en el proceso de auth despues de verificar la contraseña
// para verificar el codigo TOTP si el usuario tiene 2FA habilitado.
// Hablar con Angie para ver como añadirlo en el login
func (h *TwoFAHandler) Login2FA(c *gin.Context) {}
