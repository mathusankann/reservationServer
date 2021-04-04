package main

import (
	"../room"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	_ "go/ast"
	gomail "gopkg.in/mail.v2"
	"log"
	"net/http"
)

func GetVideoBridge() {

}

func deleteRoom() {

}

func editRoom() {

}

func sendInvitation(w http.ResponseWriter, r *http.Request) {

	m := gomail.NewMessage()

	// Set E-Mail sender
	m.SetHeader("From", "mathusan13@live.de")

	// Set E-Mail receivers
	m.SetHeader("To", "mathusankannathasan@gmail.de")

	// Set E-Mail subject
	m.SetHeader("Subject", "Gomail test subject")

	// Set E-Mail body. You can set plain text or html with text/html
	m.SetBody("text/plain", "This is Gomail test body")

	// Settings for SMTP server
	d := gomail.NewDialer("smtp.office365.com", 587, "mathusan13@live.de", "")

	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		fmt.Println(err)
		panic(err)
	}

	return

}

func getSharedSecret() {

}

func GetRoom(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}
	queryStmt := fmt.Sprintf("Select * From room Where name= '%s'", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var room2 room.Room
	rows.Next()
	dberr = rows.Scan(&room2.Roomid, &room2.Name, &room2.Join, &room2.Create, &room2.Invite)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	fmt.Println(room2)
	if !room2.Verify() {
		http.Error(w, "Username not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(room2)
	w.Write(jsonFile)

}

func GetAllRoomNames(w http.ResponseWriter, r *http.Request) {
	var listNames []string
	db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}
	queryStmt := fmt.Sprintf("Select name From room")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}

	w.Header().Set("Content-Type", "application/json")
	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			log.Println(err)
		}
		listNames = append(listNames, name)
	}
	jsonFile, _ := json.Marshal(listNames)
	w.Write(jsonFile)
}

func startConf(w http.ResponseWriter, r *http.Request) {
	var link string
	_ = json.NewDecoder(r.Body).Decode(&link)
	//fmt.Println(test)
	resp, err := http.Get(link)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(resp.Status))
}

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	var croom room.Room
	err := json.NewDecoder(r.Body).Decode(&croom)
	log.Println(croom)
	if err != nil {
		log.Println(err)
	}
	db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}
	queryStmt := fmt.Sprintf("Select name From room Where name= '%s'", croom.Name)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)

	}
	rows.Close()
	if rows.Next() {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}
	//transaction
	sqlStmt := fmt.Sprintf(`INSERT INTO room(name,"join","create","invite")VALUES(?,?,?,?)`)

	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(croom.Name, croom.Join, croom.Create, croom.Invite)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	w.Write([]byte("ok"))

}
