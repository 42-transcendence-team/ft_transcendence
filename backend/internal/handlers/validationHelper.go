package handlers

import (
	appErr "backend/internal/errors"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

/*Request validation*/
// tal vez esto haya que quitarlo de aqui, pero tampoco se dodne iria
func ValidationBindRequest(c *gin.Context, req interface{}) error {

	err := c.ShouldBindJSON(req)

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
