package main

import (
	"backend/config"
	"backend/internal/db"
	"backend/internal/models"
	"backend/internal/server"
	"log"
)

func main() {
	conf := config.Load()

	gormDB, err := db.ConnectPostgres(conf)
	if err != nil {
		log.Fatalf("[BOOT][DB] init failed: %v", err)
	}

	err = gormDB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("[BOOT][DB] AutoMigrate failed: %v", err)
	}

	srv := server.NewHTTPServer(conf, gormDB)
	if err := srv.Run(); err != nil {
		log.Fatal(err)
	}

}
