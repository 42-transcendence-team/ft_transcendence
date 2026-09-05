package middlewares

import (
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Log *zap.Logger

func InitLogger() {
	logPath := os.Getenv("API_LOG_PATH")
	if logPath == "" {
		logPath = "/var/log/api/go-app.log"
	}

	dir := filepath.Dir(logPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		panic("No se pudo crear el directorio de logs: " + err.Error())
	}

	fileWriter := zapcore.AddSync(&lumberjack.Logger{
		Filename:   logPath,
		MaxSize:    10,
		MaxBackups: 3,
		MaxAge:     7,
		Compress:   true,
	})

	consoleWriter := zapcore.AddSync(os.Stdout)

	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		fileWriter,
		zap.DebugLevel,
	)
	consoleCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderConfig),
		consoleWriter,
		zap.DebugLevel,
	)

	core = zapcore.NewTee(core, consoleCore)

	Log = zap.New(core, zap.AddCaller())
}

func GinZapLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		if path == "/metrics" {
			c.Next()
			return
		}

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		fields := []zap.Field{
			zap.Int("status", status),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("query", query),
			zap.String("ip", c.ClientIP()),
			zap.String("user-agent", c.Request.UserAgent()),
			zap.Duration("latency", latency),
			zap.String("errors", c.Errors.ByType(gin.ErrorTypePrivate).String()),
		}

		if status >= 500 {
			Log.Error("Error interno del servidor", fields...)
		} else if status >= 400 {
			Log.Warn("Petición cliente errónea", fields...)
		} else {
			Log.Info("Petición HTTP procesada", fields...)
		}
	}
}
