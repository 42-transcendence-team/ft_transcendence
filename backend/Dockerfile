FROM golang:1.23-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o api ./cmd/api

# quitar variables de aqui cuando se haga el docker compose
ENV GO_SERVICE_HOST=0.0.0.0
ENV GO_SERVICE_PORT=8080

EXPOSE 8080

CMD ["./api"]
