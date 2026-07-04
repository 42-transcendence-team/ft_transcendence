FROM docker.io/library/golang:1.25.7-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o api ./cmd/api

EXPOSE 8080
CMD ["./api"]
