package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
)

func serverInit() {
	if _, err := os.Stat("./User.sqlite"); err == nil {

	} else if os.IsNotExist(err) {
		db, err := sql.Open("sqlite3", "User.sqlite")
		if err != nil {
			log.Panic(err)
		}

		sqlStmt := "CREATE TABLE room ('id' integer not null primary key AUTOINCREMENT, 'name' TEXT not null, 'join' TEXT not null,'create' Text not null, 'invite' Text not null);"
		_, err = db.Exec(sqlStmt)
		if err != nil {
			log.Panic(err)
		}
		sqlStmt = "CREATE TABLE meeting ('id' integer not null primary key AUTOINCREMENT,'meeting_date_start' DATETIME,'meeting_date_end' DATETIME  ,'roomid' integer not NULL ,'mail' Text,'reminder' integer );"
		_, err = db.Exec(sqlStmt)
		if err != nil {
			log.Panic(err)
		}
		sqlStmt = "CREATE TABLE user ('id' integer not null primary key AUTOINCREMENT,'name' Text not null ,'password' integer not null,'role' Text);"
		_, err = db.Exec(sqlStmt)
		if err != nil {
			log.Panic(err)
		}
	}
}

func main() {
	serverInit()
	fileServer := http.FileServer(http.Dir("./static")) // New code
	http.Handle("/", fileServer)
	http.HandleFunc("/getRoom", GetRoom)
	http.HandleFunc("/createRoom", CreateRoom)
	http.HandleFunc("/startRoom", startConf)
	http.HandleFunc("/getAllRoomNames", GetAllRoomNames)
	http.HandleFunc("/sendInvitationLink", sendInvitation)
	http.HandleFunc("/addUser", addUser)
	http.HandleFunc("/getUserAuthentication", getUserAuthentication)
	http.HandleFunc("/setMeeting", setMeeting)
	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}

}
