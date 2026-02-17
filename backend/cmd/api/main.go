package main

import (
	"backend/config"
	"backend/internal/server"
	"log"
)

func main() {

	conf := config.Load()

	srv := server.NewHTTPServer(conf)

	if err := srv.Run(); err != nil {
		log.Fatal(err)
	}

}
