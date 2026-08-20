package utils

import (
	"log"
	"time"
)

var Madrid *time.Location

func init() {
	var err error
	Madrid, err = time.LoadLocation("Europe/Madrid")
	if err != nil {
		log.Fatal(err)
	}
}
