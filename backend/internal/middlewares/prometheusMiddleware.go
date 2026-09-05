package middlewares

import (
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
)

var HttpRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "back_http_requests_total",
		Help: "Total number of HTTP requests",
	},
	[]string{"method", "path", "status"},
)
var HttpDuration = prometheus.NewHistogramVec(
	prometheus.HistogramOpts{
		Name: "back_http_request_duration_seconds",
		Help: "HTTP request duration in seconds",
	},
	[]string{"path"},
)

var registerOnce sync.Once

func Register() {
	// Idempotente: en producción solo se llama una vez al arrancar, pero
	// permite que server.NewHTTPServer se reutilice en tests sin panic por
	// registro duplicado de los mismos collectors.
	registerOnce.Do(func() {
		prometheus.MustRegister(HttpRequests)
		prometheus.MustRegister(HttpDuration)
		// TODO- Revisar porque si esta en WSL funciona con esto descomentado, en Linux comentado
		// prometheus.MustRegister(
		// 	collectors.NewGoCollector(),
		// 	collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
		// )
	})
}

func PrometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		duration := time.Since(start).Seconds()

		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		if strings.Contains(path, "/api/v1/users/") {
			path = "/api/v1/users/:id"
		}
		// TODO - Agregar paths dinamicos como Posts/:id

		HttpRequests.WithLabelValues(
			c.Request.Method,
			path,
			strconv.Itoa(c.Writer.Status()),
		).Inc()

		HttpDuration.WithLabelValues(
			path,
		).Observe(duration)
	}
}
