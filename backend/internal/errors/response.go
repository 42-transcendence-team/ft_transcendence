package errors

// ErrorResponse define el formato estándar de errores de la API.
//
// CONTRATO PÚBLICO con el frontend:
// - Siempre devolvemos {"error": {...}} para errores.
// - No exponer información interna (errores de BD, stack traces, etc).
// - Details se usa para validaciones por campo (ej: username/email).
// - RequestID se añadirá desde middleware de trazabilidad para correlacionar errores con logs.

type ErrorBody struct {
	Code      string            `json:"code"`
	Message   string            `json:"message"`
	Details   map[string]string `json:"details,omitempty"`
	RequestID string            `json:"request_id,omitempty"`
}

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}
