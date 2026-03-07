package handlers

import (
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
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

type AuthHandler struct {
	AuthService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

/* Register */
// que pasa si falla algo , un panic por ejemplo , se creea el usuario o se borra?
// ahor amismo se crea , o por lo menos me da conflict si intento crear uno igual, por q el panic se generaba despues de meterlo en la db,
// y al no llegar al msg de exito se manda un CodeInternal, nose si eso hay que controlarlo
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

	if !IsStrongPassword(req.Password) {
		c.Error(appErr.NewValidation(map[string]string{
			"password": "weak_password",
		}))
		c.Abort()
		return
	}

	// https://gowebexamples.com/password-hashing/
	// no se si es demasiado simple
	HashedPassword, err := hashPasword(req.Password)
	// que error puede devolver al fallar el hasheo de la pasword?
	if err != nil {
		c.Error(appErr.NewConflict(err.Error()))
		c.Abort()
		return
	}

	user, err := h.AuthService.Register(c, services.RegisterImput{
		Login:    req.Login,
		Email:    req.Email,
		Password: HashedPassword,
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

	//Hay que ver como damos la respuesta al front
	c.JSON(201, gin.H{
		"message": "user created",
		"user": gin.H{
			"login": user.Login,
			"email": user.Email,
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

func IsStrongPassword(password string) bool {

	var hasUpper bool
	var hasLower bool
	var hasNumber bool
	var hasSymbol bool

	for _, c := range password {

		switch {
		case 'A' <= c && c <= 'Z':
			hasUpper = true
		case 'a' <= c && c <= 'z':
			hasLower = true
		case '0' <= c && c <= '9':
			hasNumber = true
		default:
			hasSymbol = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSymbol
}

// esto lo pille de ahi -> https://gowebexamples.com/password-hashing/
func hashPasword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

/* End of register */
