package middlewares

import (
	appErr "backend/internal/errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorMiddleware centraliza la conversión de errores a respuestas JSON estándar.
//
// RESPONSABILIDADES:
// - Interceptar errores añadidos con c.Error(err).
// - Convertir AppError en el formato público definido en internal/errors.
// - Garantizar que siempre se devuelve una respuesta consistente.
// - Nunca exponer errores internos (Err).
//
// IMPORTANTE!!!!!!!!!!!:
// Los handlers deben usar: para errores REST normales
//     if err != nil {
//   		c.Error(err)  // lo “reportas”
//   		c.Abort()     // cortas la request aquí
//    		return
//		}
// y NO deben construir manualmente respuestas de error. no se debe hacer esto c.JSON(400, ...)

func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		if c.Writer.Written() {
			return
		}

		err := c.Errors.Last().Err

		// msg generico
		status := http.StatusInternalServerError
		resp := appErr.ErrorResponse{
			Error: appErr.ErrorBody{
				Code:    "INTERNAL_ERROR",
				Message: "Ha ocurrido un error inesperado",
			},
		}

		// Si es AppError, usamos lo que ya viene definido
		if ae, ok := err.(*appErr.AppError); ok {
			status = ae.HTTPStatus
			resp.Error.Code = ae.Code
			resp.Error.Message = ae.Message
			resp.Error.Details = ae.Details
		}

		c.JSON(status, resp)
	}
}
