package main

import (
	"backend/config"
	"backend/internal/db"
	"backend/internal/server"
	"log"
)

func main() {

	conf, err := config.Load()
	if err != nil {
		log.Fatalf("[BOOT][CONFIG] invalid config: %v", err)
	}

	gormDB, err := db.ConnectPostgres(conf)
	if err != nil {
		log.Fatalf("[BOOT][DB] init failed: %v", err)
	}

	srv := server.NewHTTPServer(conf, gormDB)
	log.Printf("[BOOT] starting server on %s:%s", conf.GoServiceHost, conf.GoServicePort)

	if err := srv.Run(); err != nil {
		log.Fatalf("[BOOT] server stopped with error: %v", err)
	}
}
