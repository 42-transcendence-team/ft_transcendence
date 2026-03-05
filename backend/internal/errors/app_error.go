package errors

import "net/http"

// AppError representa un error "controlado" de la aplicación.
// - HTTPStatus: el status HTTP que se devolverá (404, 409, 422...)
// - Code: código estable para que el frontend pueda reaccionar (string)
// - Message: mensaje público (seguro) para mostrar al usuario
// - Details: información opcional (por ejemplo, errores de validación por campo)
// - Err: error interno original (NO se envía al cliente; útil para logs)
type AppError struct {
	Code       string
	HTTPStatus int
	Message    string
	Details    map[string]string `json:"details"`
	Err        error             // interno no exponer
}

// Error hace que *AppError implemente la interfaz error de Go.
// Esto permite tratar AppError como un "error" normal (por ejemplo: c.Error(err), log.Println(err), return err...).
//
// La string que genera esta funcion es para uso interno (logs).
// No define lo que se devuelve al cliente en JSON.
func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Code + ": " + e.Err.Error()
	}
	return e.Code + ": " + e.Message
}

// Codes genéricos.
// Si en el futuro necesitamos que sean mas concretos (por ejemplo, "AUTH_TOKEN_EXPIRED"),
// se pueden añadir nuevos codes manteniendo el mismo HTTPStatus.
// El middleware de errores no necesita cambios para soportarlos.
const (
	CodeBadRequest   = "BAD_REQUEST"
	CodeUnauthorized = "UNAUTHORIZED"
	CodeForbidden    = "FORBIDDEN"
	CodeNotFound     = "NOT_FOUND"
	CodeConflict     = "CONFLICT"
	CodeValidation   = "VALIDATION_ERROR"
	CodeInternal     = "INTERNAL_ERROR"
)

// Helpers para crear errores consistentes.
// Mensajes: específicos y claros.
// Codes: genéricos (por el momento)
func NewBadRequest(msg string) *AppError {
	return &AppError{
		Code:       CodeBadRequest,
		HTTPStatus: http.StatusBadRequest,
		Message:    msg,
	}
}

func NewUnauthorized(msg string) *AppError {
	return &AppError{
		Code:       CodeUnauthorized,
		HTTPStatus: http.StatusUnauthorized,
		Message:    msg,
	}
}

func NewForbidden(msg string) *AppError {
	return &AppError{
		Code:       CodeForbidden,
		HTTPStatus: http.StatusForbidden,
		Message:    msg,
	}
}

func NewNotFound(msg string) *AppError {
	return &AppError{
		Code:       CodeNotFound,
		HTTPStatus: http.StatusNotFound,
		Message:    msg,
	}
}

func NewConflict(msg string) *AppError {
	return &AppError{
		Code:       CodeConflict,
		HTTPStatus: http.StatusConflict,
		Message:    msg,
	}
}

// NewValidation se usa cuando el cliente envía datos que no pasan validación.
// details suele ser un map con "campo" -> "motivo".
func NewValidation(details map[string]string) *AppError {
	return &AppError{
		Code:       CodeValidation,
		HTTPStatus: http.StatusUnprocessableEntity, // 422
		Message:    "Some fields are invalid",
		Details:    details,
	}
}

// NewInternal envuelve un error inesperado.
// Al cliente se le enviará un mensaje genérico, pero en logs se vera el detalle real (Err).
func NewInternal(err error) *AppError {
	return &AppError{
		Code:       CodeInternal,
		HTTPStatus: http.StatusInternalServerError,
		Message:    "An unexpected error has occurred",
		Err:        err,
	}
}
