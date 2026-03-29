package handlers

import (
	"backend/config"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"time"
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

/* JSON q manda el fronted
Si algun campo no cumple als regals de la struct de abajo manda error con especificacioens
de q ha fallado segun la estructura d ela funcon apperr NewValidation()
{
  "login": "prueba",
  "email": "prueba@test.com",
  "password": "angelaKk12132%",
  "confirmPassword": "angelaKk12132%",
  "name": "angela",
  "Surname": "barrio",
  "birthday": "2000-10-23" // tiene que ser este formato "aaaa-mm-dd"
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

	user, err := h.AuthService.Register(services.RegisterInput{
		Login:    req.Login,
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Surname:  req.Surname,
		Birtday:  birthday,
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

	strToken, user, expTime, err := h.AuthService.Login(services.LoginInput{
		Identifier: req.Identifier,
		Password:   req.Password,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	h.setCookie(c, strToken, expTime)

	// TODO: hay q ver como se mandan los msg al front y que necesita
	c.JSON(200, gin.H{
		"message": "user login success",
		"user": gin.H{
			"id":    user.ID,
			"login": user.Login,
			"email": user.Email,
			"token": strToken, // QUITAR ESTO DE AQUI SOLO ES PA PROBAR !!!!!!!!!!!!!!!
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

/*Request validation*/
// tal vez esto haya que quitarlo de aqui, pero tampoco se dodne iria
func ValidationBindRequest(c *gin.Context, req interface{}) error {

	err := c.ShouldBindJSON(&req)

	if err != nil {
		var validationErr validator.ValidationErrors
		if errors.As(err, &validationErr) {
			fields := ValidationErrorsToMap(validationErr)
			return appErr.NewValidation(fields)
		}
		return appErr.NewBadRequest("invalid_request_body")
	}

	return nil
}

func ValidationErrorsToMap(validationErr validator.ValidationErrors) map[string]string {

	fields := make(map[string]string)

	for _, err := range validationErr {

		field := err.Field()
		rule := err.Tag()

		fields[field] = rule
	}

	return fields
}

/*End of request validation*/
