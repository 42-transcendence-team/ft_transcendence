package handlers

import (
	"backend/config"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService *services.AuthService
	cfg         *config.Config
}

func NewAuthHandler(authService *services.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
		cfg:         cfg,
	}
}

/* Register */

/* JSON que manda el fronted
Si algun campo no cumple las reglas de la struct de abajo manda error con especificacioens
de que ha fallado segun la estructura d ela funcon apperr NewValidation()
{
  "login": "prueba",
  "email": "prueba@test.com",
  "password": "angelaKk12132%",
  "confirmPassword": "angelaKk12132%",
  "name": "angela",
  "surname": "barrio",
  "birthday": "2000-10-23" , // tiene que ser este formato "aaaa-mm-dd"
  "termsAndConditions": true,
  "privacyPolicy": true
}
*/

func (h *AuthHandler) Register(c *gin.Context) {

	var req dto.RegisterRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	birthday, err := time.Parse("2006-01-02", req.Birthday)
	if err != nil {
		c.Error(appErr.NewValidation(map[string]string{
			"birthday": "invalid_format",
		}))
		c.Abort()
		return
	}

	user, err := h.AuthService.Register(dto.RegisterInput{
		Login:    req.Login,
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Surname:  req.Surname,
		Birthday: birthday,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// TODO: Hay que ver como damos la respuesta al front
	c.JSON(201, gin.H{
		"message": "user created",
		"user": gin.H{
			"login":    user.Login,
			"email":    user.Email,
			"name":     user.Name,
			"surname":  user.Surname,
			"birthday": user.Birthday,
		},
	})
}

/* End of register */

/* Login */

/*
peticion que manda el front
{
	"identifier": "login-or-email"
	"password":	"Uwu&password&strong42"
}
*/

func (h *AuthHandler) Login(c *gin.Context) {

	var req dto.LoginRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	result, err := h.AuthService.Login(dto.LoginInput{
		Identifier: req.Identifier,
		Password:   req.Password,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// En el caso de "FA activa, se genera un Roken temporal para poder comprobar el código TOTP
	// Retorna para poder llamar al endpoint/handler de login 2FA
	if result.Requires2FA {
		h.SetTempToken(c, result.TempToken, result.ExpTime)
		c.JSON(200, gin.H{
			"message":     "2FA required",
			"requires2fa": true,
			"user": gin.H{
				"id":        result.User.ID,
				"login":     result.User.Login,
				"email":     result.User.Email,
				"tempToken": result.TempToken,
			},
		})
		return
	}

	strToken := result.Token
	expTime := result.ExpTime
	user := result.User

	h.setCookie(c, strToken, expTime)

	// TODO: hay q ver como se mandan los msg al front y que necesita
	c.JSON(200, gin.H{
		"message":     "user login success",
		"requires2fa": false,
		"user": gin.H{
			"id":    user.ID,
			"login": user.Login,
			"email": user.Email,
		},
	})
}

/*End of login*/

/*Logout*/

func (h *AuthHandler) Logout(c *gin.Context) {

	expTime := time.Unix(0, 0)

	h.setCookie(c, "", expTime)

	// TODO: hay q ver como se mandan los msg al front y que necesita
	c.JSON(200, gin.H{
		"message": "user logout success",
	})
}

/*End of logout*/

/*Whoami*/

func (h *AuthHandler) Whoami(c *gin.Context) {

	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("Unauthorized user"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewInternal(errors.New("invalid userID type in context")))
		c.Abort()
		return
	}

	user, err := h.AuthService.GetUserById(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// TODO: hay q ver como se mandan los msg al front y que necesita saber
	c.JSON(200, gin.H{
		"authenticated": true,
		"user": gin.H{
			"id":    user.ID,
			"login": user.Login,
			"email": user.Email,
		},
	})
}

/*End of whoami*/

func (h *AuthHandler) setCookie(c *gin.Context, strToken string, exp time.Time) {

	var secure bool

	if h.cfg.Env == "prod" {
		secure = true // Solo enviar por HTTPS, para produccion
	} else {
		secure = false // para desarrollo, asi si haces http://localhost:8080 para pruebas funciona
	}

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    strToken,
		Expires:  exp,  // Expiración
		HttpOnly: true, // Previene acceso por JS (seguridad)
		Secure:   secure,
		SameSite: http.SameSiteLaxMode, // Protección CSRF
		Path:     "/",
	}

	if strToken == "" {
		cookie.MaxAge = -1
	}

	http.SetCookie(c.Writer, cookie)

}

// Se genera un Token temporal para la validacion 2FA. Tiene menos timpo de vida y es mas simple que el bueno
// Solo sirve para ir a la ruta de validacion para login 2FA
func (h *AuthHandler) SetTempToken(c *gin.Context, tempToken string, exp time.Time) {
	var secure bool

	if h.cfg.Env == "prod" {
		secure = true // Solo enviar por HTTPS, para produccion
	} else {
		secure = false // para desarrollo, asi si haces http://localhost:8080 para pruebas funciona
	}

	cookie := &http.Cookie{
		Name:     "tempToken",
		Value:    tempToken,
		Expires:  exp,  // Expiración
		HttpOnly: true, // Previene acceso por JS (seguridad)
		Secure:   secure,
		SameSite: http.SameSiteLaxMode, // Protección CSRF
		Path:     "/",
	}

	if tempToken == "" {
		cookie.MaxAge = -1
	}

	http.SetCookie(c.Writer, cookie)
}

// Un llamador a la funcion de arriba para borrar el Token temporal de las Cookies del usuario
func (h *AuthHandler) ClearTempToken(c *gin.Context) {
	h.SetTempToken(c, "", time.Unix(0, 0))
}
