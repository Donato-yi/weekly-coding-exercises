package main

import (
	"log"
	"net/http"

	"github.com/donato-yi/weekly-coding-exercises/2026-W13/htmx-habits/src"
)

func main() {
	server, err := habits.NewServer()
	if err != nil {
		log.Fatal(err)
	}

	addr := ":8080"
	log.Printf("HTMX habits server running on %s", addr)
	log.Fatal(http.ListenAndServe(addr, server.Routes()))
}
