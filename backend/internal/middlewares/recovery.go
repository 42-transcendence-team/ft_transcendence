package middlewares

import (
	appErr "backend/internal/errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RecoveryJSON captura panics y devuelve siempre el formato estándar de error.
// No expone información interna del panic al cliente.
// En el futuro, recovered debe loguearse (con stacktrace) para debug interno.

func RecoveryJSON() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {

		if c.Writer.Written() {
			c.Abort()
			return
		}

		c.AbortWithStatusJSON(http.StatusInternalServerError, appErr.ErrorResponse{
			Error: appErr.ErrorBody{
				Code:    appErr.CodeInternal,
				Message: "An unexpected error has occurred",
			},
		})
	})
}
