package main

import (
	"fmt"
	"backend/config"
	"backend/internal/db"
	"backend/internal/models"
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

	err = gormDB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("[BOOT][DB] AutoMigrate failed: %v", err)
	}

	srv := server.NewHTTPServer(conf, gormDB)
	log.Printf("[BOOT] starting server on %s:%d", srv.Conf.GoServiceHost, srv.Conf.GoServicePort)
	addr := fmt.Sprintf("%s:%d", srv.Conf.GoServiceHost, srv.Conf.GoServicePort)
	if err := srv.Engine.Run(addr); err != nil {
			log.Fatalf("[BOOT] server stopped with error: %v", err)
	}
}
