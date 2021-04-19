package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
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
		var admin User
		admin.Name = "admin"
		admin.Password = "admin"
		admin.HashAndSalt([]byte(admin.Password))
		admin.Role = "Admin"
		sqlStmt = fmt.Sprintf(`INSERT INTO user("name","password","role")VALUES(?,?,?)`)
		statement, err := db.Prepare(sqlStmt)
		if err != nil {
			log.Fatalln(err.Error())
		}
		_, err = statement.Exec(admin.Name, admin.Password, admin.Role)
		if err != nil {
			log.Fatalln(err.Error())
		}
		statement.Close()
	}
	db.Close()
}

func reminder() {
	queryStmt := fmt.Sprintf("Select * From meeting where meeting_date_start >= date('now','+1 day') and meeting_date_start  <date('now','+2 day') and reminder =1")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	for rows.Next() {
		var dates Meeting
		err := rows.Scan(&dates.Id, &dates.MeetingDateStart, &dates.MeetingDateEnd, &dates.Roomid, &dates.Mail, &dates.Reminder)
		if err != nil {
			log.Println(err)
		}
		//go sendInvitation(dates)
		sqlStmt := fmt.Sprintf("Update meeting set reminder = 0 where id = %d", dates.Id)
		statement, err := db.Prepare(sqlStmt)
		if err != nil {
			log.Fatalln(err.Error())
		}
		_, err = statement.Exec()
		if err != nil {
			log.Fatalln(err.Error())
		}
		statement.Close()
	}
	//db.Close()
}

func main() {
	/*ticker := time.NewTicker(6 * time.Second)
	done := make(chan bool)
	go func() {
		for {
			select {
			case <-done:
				return
			case  <-ticker.C:
				reminder()
				log.Println("check starting")
			}
		}
	}()
	done <-true*/

	serverInit()
	fileServer := http.FileServer(http.Dir("./static")) // New code
	http.Handle("/", fileServer)
	http.HandleFunc("/getRoom", GetRoom)
	http.HandleFunc("/createRoom", CreateRoom)
	http.HandleFunc("/startRoom", startConf)
	http.HandleFunc("/getAllRoomNames", GetAllRoomNames)
	http.HandleFunc("/addUser", addUser)
	http.HandleFunc("/getUserAuthentication", getUserAuthentication)
	http.HandleFunc("/setMeeting", setMeeting)
	http.HandleFunc("/getAllMeetings", getAllMeetings)
	http.HandleFunc("/getRoomByID", GetRoomByID)
	http.HandleFunc("/deleteMeeting", deleteMeeting)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":80", nil); err != nil {
		log.Fatal(err)
	}

}
