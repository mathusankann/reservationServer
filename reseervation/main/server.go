package main

import (
	"fmt"
	"log"
	"net/http"
)


func main() {


	fileServer := http.FileServer(http.Dir("./static")) // New code
	http.Handle("/", fileServer)
	http.HandleFunc("/getRoom", GetRoom)
	http.HandleFunc("/createRoom",CreateRoom)
	http.HandleFunc("/startRoom",startConf)
	http.HandleFunc("/getAllRoomNames",GetAllRoomNames)
	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}


}
