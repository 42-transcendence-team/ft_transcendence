package main

import (
	"backend/config"
	"backend/internal/db"
	"backend/internal/server"
	"log"
)

func main() {
	conf := config.Load()

	gormDB, err := db.ConnectPostgres(conf)
	if err != nil {
		log.Fatalf("[BOOT][DB] init failed: %v", err)
	}

	srv := server.NewHTTPServer(conf, gormDB)
	if err := srv.Engine.Run(); err != nil {
		log.Fatal(err)
	}

}
