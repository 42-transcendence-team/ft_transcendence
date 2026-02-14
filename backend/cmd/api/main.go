package main

import (
	"backend/config"
	"backend/internal/server"
	"log"
)

func main() {

	conf := config.Load()

	srv := server.NewHTTPServer(conf)

	log.Printf("[BOOT] starting server on %s:%s", conf.Host, conf.Port)

	if err := srv.Run(); err != nil {
		log.Fatalf("[BOOT] server stopped with error: %v", err)
	}

}
