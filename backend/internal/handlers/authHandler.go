package handlers

import (
	appErr "backend/internal/errors"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

/* JSON q manda el fronted
Si algun campo no cumple als regals de la struct de abajo manda error con especificacioens
de q ha fallado segun la estructura d ela funcon apperr NewValidation()
{
  "login": "angie",
  "email": "angie@test.com",
  "password": "12345678",
  "confirm-password": "12345678"
}
*/

type RegisterRequest struct {
	Login           string `json:"login" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm-password" binding:"required,min=8,eqfield=Password"`
}

func Register(c *gin.Context) {

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

	c.JSON(200, gin.H{
		"message": "register endpoint works",
		"login":   req.Login,
		"email":   req.Email,
	})
}

// tal vez esto haya que quitarlo de aqui
func ValidationErrorsToMap(validationErr validator.ValidationErrors) map[string]string {

	fields := make(map[string]string)

	for _, err := range validationErr {

		field := err.Field()
		rule := err.Tag()

		fields[field] = rule
	}

	return fields
}
