package health

type HealthResponse struct {
	Status  string            `json:"status"`
	Details map[string]string `json:"details,omitempty"`
}

func Check() HealthResponse {
	return HealthResponse{
		Status: "ok",
		Details: map[string]string{
			"version": "1.0.0",
		},
	}
}

// En esta carpeta iran los servicios relacionados con la salud de la aplicación, como por ejemplo:
// - Verificar la conexión a la base de datos
// - Verificar la conexión a servicios externos (APIs, caches, etc.)

// 1.- Request HTTP llega a /health.
// 2.- El Handler (internal/handlers/health.go) recibe la petición.
// 3.- El Handler llama al Health Service (internal/health/checker.go).
// 4.- El Health Service (Check()) pregunta a cada archivo (postgres.go, redis.go...) su estado.
// 5.- El Health Service (Check()) junta todas las respuestas y se las devuelve al Handler.
// 6.- El Handler genera el JSON final y lo envía.
