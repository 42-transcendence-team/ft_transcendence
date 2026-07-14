package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"log"

	"github.com/gin-gonic/gin"
)

type TwoFAHandler struct {
	TwoFAService *services.TwoFAService
	AuthHandler  *AuthHandler
}

func New2FAHandler(twoFAService *services.TwoFAService, authHandler *AuthHandler) *TwoFAHandler {
	return &TwoFAHandler{TwoFAService: twoFAService, AuthHandler: authHandler}
}

// Se hace la peticion para generar una nueva clave TOTP.
// Se devuelve un QR generado automaticamente
func (h *TwoFAHandler) Enable2FA(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	var request dto.TwoFAEnable
	request.Id = userIDValue.(uint)

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
// Si el codigo es correcto se guarda el secreto TOTP en la base de datos y se marca la 2FA como activa
func (h *TwoFAHandler) Verify2FA(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID in context"))
		c.Abort()
		return
	}

	var request dto.TwoFAVerify
	request.Id = userID

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
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID in context"))
		c.Abort()
		return
	}

	var request dto.TwoFADisable
	request.Id = userID

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
func (h *TwoFAHandler) Login2FA(c *gin.Context) {
	var request dto.TwoFALogin

	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID in context"))
		c.Abort()
		return
	}

	// Se obtiene el token temporal generado en el proceso de login
	tempToken, err := c.Cookie("tempToken")
	if err != nil {
		c.Error(appErr.NewUnauthorized("Temp token not found in context"))
		c.Abort()
		return
	}

	err = c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	request.Id = userID
	request.TempToken = tempToken

	token, life, err := h.TwoFAService.Login2FA(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	log.Printf("token: %s life: %v", token, life)
	// Se guarda el token definitivo y se elimina el temporal de las cookies del navegador
	h.AuthHandler.setCookie(c, token, life)
	h.AuthHandler.ClearTempToken(c)

	log.Printf("Login2FA: User ID %d successfully logged in with 2FA, JWT token set in cookie", request.Id)
	c.JSON(200, gin.H{"message": "2FA verified successfully", "token": token})
}
