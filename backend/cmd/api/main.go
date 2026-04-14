package main

import (
	"backend/config"
	"backend/internal/db"
	"backend/internal/server"
	"fmt"
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

	redisClient, err := db.ConnectRedis(conf)
	if err != nil {
		log.Fatalf("[BOOT][DB] redis init failed: %v", err)
	}
	log.Println("[BOOT][DB] connect to Redis")

	err = db.Migrate(gormDB)
	if err != nil {
		log.Fatalf("[BOOT][DB] Migrate failed: %v", err)
	}

	srv := server.NewHTTPServer(conf, gormDB, redisClient)
	log.Printf("[BOOT] starting server on %s:%d", srv.Conf.GoServiceHost, srv.Conf.GoServicePort)
	addr := fmt.Sprintf("%s:%d", srv.Conf.GoServiceHost, srv.Conf.GoServicePort)
	if err := srv.Engine.Run(addr); err != nil {
		log.Fatalf("[BOOT] server stopped with error: %v", err)
	}


}
