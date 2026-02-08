# (David):
# Nombre de imagen con ruta completa para garantizar la
# compatibilidad con WSL (usado por mí), ya que WSL usa Podman.
# Podman no resuelve imágenes sin "registry" por defecto,
# así se evitan errores durante el build en entornos WSL.
FROM docker.io/library/golang:1.23-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o api ./cmd/api

EXPOSE 8080
CMD ["./api"]
