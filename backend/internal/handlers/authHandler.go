package handlers

import (
	appErr "backend/internal/errors"
	"backend/internal/services"
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

/*
	type X struct {
		dep *Y
	}

	func NewX(dep *Y) *X {
		return &X{dep: dep}
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
	ConfirmPassword string `json:"confirm-password" binding:"required,eqfield=Password"`
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

	user, err := h.AuthService.Register(c, services.RegisterImput{
		Login:    req.Login,
		Email:    req.Email,
		Password: req.Password, // esto hay que enviarlo ya hasheado o como se diga
	})
	if err != nil {
		// revisar si queremos que se devuelva asi este tipo de errores o hay que manejar los errores devuletos por la db
		// por si mandamos demasiada info al cliente message: 2much? y no se si el codigo de que ya hay una cuenta
		// con ese loging o email es el codigo http 409 de conflict
		/*
			{
				"error": {
					"code": "CONFLICT",
					"message": "ERROR: duplicate key value violates unique constraint \"idx_users_login\" (SQLSTATE 23505)"
				}
			}*/
		c.Error(appErr.NewConflict(err.Error()))
		c.Abort()
		return
	}

	//respuesta mal de moemnto
	c.JSON(200, gin.H{
		"message": "register endpoint works",
		"login":   user.Login,
		"email":   user.Email,
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
