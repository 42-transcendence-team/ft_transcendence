package handlers

import (
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

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

type AuthHandler struct {
	AuthService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

/* Register */
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

	err := c.ShouldBindJSON(&req)
	if err != nil {
		var validationErr validator.ValidationErrors

		if errors.As(err, &validationErr) {
			fields := ValidationErrorsToMap(validationErr)
			c.Error(appErr.NewValidation(fields))
		} else {
			c.Error(appErr.NewBadRequest("invalid_request_body"))
		}
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

// tal vez esto haya que quitarlo de aqui, pero tampoco se dodne iria
func ValidationErrorsToMap(validationErr validator.ValidationErrors) map[string]string {

	fields := make(map[string]string)

	for _, err := range validationErr {

		field := err.Field()
		rule := err.Tag()

		fields[field] = rule
	}

	return fields
}

/* End of register */
