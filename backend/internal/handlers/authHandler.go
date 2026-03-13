package handlers

import (
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
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
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

type RegisterRequest struct {
	Login           string `json:"login" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" binding:"required,eqfield=Password"`
	Name            string `json:"name" binding:"required"`
	Surname         string `json:"surname" binding:"required"`
	Birthday        string `json:"birthday" binding:"required"` // en el front poner que la fecha tiene que ser yyyy-mm-dd esto no se si habria que cambiarlo para q sea dd-mm-aaaa
}

func (h *AuthHandler) Register(c *gin.Context) {

	var req RegisterRequest

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

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" biding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {

	var req LoginRequest

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

	setCookie(c, strToken, expTime)

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

func setCookie(c *gin.Context, strToken string, exp time.Time) {

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    strToken,
		Expires:  exp,  // Expiración
		HttpOnly: true, // Previene acceso por JS (seguridad)
		// Secure:   true,              	// Solo enviar por HTTPS, para produccion
		Secure:   false,                // para desarrollo, asi si haces http://localhost:8080 para pruebas funciona
		SameSite: http.SameSiteLaxMode, // Protección CSRF
		Path:     "/",
	}

	http.SetCookie(c.Writer, cookie)

}

/*End of login*/

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
