package main

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	_ "go/ast"
	gomail "gopkg.in/mail.v2"
	"log"
	"net/http"
	"strconv"
	"strings"
	_ "time"
)

var db = initDbConnection()

func GetVideoBridge() {

}

func deleteRoom() {

}

func editRoom() {

}

func initDbConnection() *sql.DB {
	var db, err = sql.Open("sqlite3", "User.sqlite")
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

func setMeeting(w http.ResponseWriter, r *http.Request) {
	var incMeeting Meeting
	err := json.NewDecoder(r.Body).Decode(&incMeeting)
	if err != nil {
		log.Println(err)
	}
	log.Println(incMeeting)
	if !getRoomByID(incMeeting.Roomid).Verify() {
		http.Error(w, "Room does not exists", http.StatusBadRequest)
		return
	}
	//transaction
	//db, err := sql.Open("sqlite3", "User.sqlite")
	sqlStmt := fmt.Sprintf(`INSERT INTO meeting("meeting_date_start","meeting_date_end","roomid","mail","reminder")VALUES(?,?,?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incMeeting.MeetingDateStart, incMeeting.MeetingDateEnd, incMeeting.Roomid, incMeeting.Mail, incMeeting.Reminder)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	timeString := incMeeting.MeetingDateStart.String()
	timeArray := strings.Split(timeString, " ")
	timeString = timeArray[0] + " " + timeArray[1] + "+00:00"
	incMeeting.Id = getMeetingByTimestamp(timeString)
	sendInvitation(incMeeting)
	w.Write([]byte("ok"))

}

func deleteMeeting(w http.ResponseWriter, r *http.Request) {
	deleteID, errs := r.URL.Query()["UserID"]
	if !errs || len(deleteID[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	//db, dberr := sql.Open("sqlite3", "User.sqlite")
	/*if dberr != nil {
		log.Panic(dberr)
	}*/
	stmt, err := db.Prepare("delete from meeting where id=?")
	if err != nil {
		log.Panic(err)
	}
	res, err := stmt.Exec(deleteID[0])
	if err != nil {
		log.Panic(err)
	}
	affect, err := res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	w.Write([]byte("Ihr Meeting wurde erfolgreich stoniert"))
}

func getAllMeetings(w http.ResponseWriter, r *http.Request) {
	var reservedDates []Meeting
	startTime, err := r.URL.Query()["starttime"]
	//	s := strings.Split(startTime[0], "T")[0]
	endTime, err := r.URL.Query()["endtime"]
	//	e := strings.Split(endTime[0], "T")[0]
	if !err || len(startTime[0]) < 1 || len(endTime[0]) < 1 {
		log.Println("Url Param 'startime' or 'endtime' is missing")
		return
	}
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From meeting where meeting_date_start >= '%s' and meeting_date_end <= '%s' ORDER BY meeting_date_start", startTime[0], endTime[0])
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
		reservedDates = append(reservedDates, dates)
	}
	jsonFile, _ := json.Marshal(reservedDates)
	w.Write(jsonFile)

}

func getSharedSecret() {

}

func getUserAuthentication(w http.ResponseWriter, r *http.Request) {
	var incUser User
	var dbUser User
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}
	log.Println(incUser.Password)
	dbUser = getUser(incUser.Name)
	if !dbUser.Check() {
		http.Error(w, "User does not exists", http.StatusBadRequest)
		return
	}

	if dbUser.ComparePasswords(incUser.Password) {
		w.Write([]byte("zLY4hvAAQTrBpMVNhGCM84ZlQl03A14sGjVHJPKT " + dbUser.Role))
	} else {
		http.Error(w, "Username or password incorrect  ", http.StatusBadRequest)
		return
	}
}

func addUser(w http.ResponseWriter, r *http.Request) {
	var incUser User
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}
	if getUser(incUser.Name).Check() {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}
	incUser.HashAndSalt([]byte(incUser.Password))
	//transaction
	//	db, err := sql.Open("sqlite3", "User.sqlite")
	sqlStmt := fmt.Sprintf(`INSERT INTO user(name,"password","role")VALUES(?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incUser.Name, incUser.Password, incUser.Role)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	w.Write([]byte("ok"))
}

func sendInvitation(incMeeting Meeting) {
	//incoming
	//Timestamp of the meeting and Email
	room := getRoomByID(incMeeting.Roomid)
	//ro := getRoom(incMessage.User)
	m := gomail.NewMessage()
	// Set E-Mail sender
	m.SetHeader("From", "TerminMa3@outlook.de")
	//Set E-Mail receivers
	m.SetHeader("To", incMeeting.Mail)
	// Set E-Mail subject
	m.SetHeader("Subject", "Konferenzlink")
	// Set E-Mail body. You can set plain text or html with text/html
	body := fmt.Sprintf("Ihr Konferenzlink: %s \n Die Konferenz findet am %s \n Sie haben "+
		"die Möglichkeit den Termin zu stonieren, falls etwas dazwischen kommt: http://localhost:8080/deleteMeeting?UserID=%d", room.Invite, incMeeting.MeetingDateStart, incMeeting.Id)
	m.SetBody("text/plain", body)
	// Settings for SMTP server
	d := gomail.NewDialer("smtp.office365.com", 587, "Terminma3@outlook.de", "")
	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		log.Fatalln(err)
	}
	return
}

func GetRoom(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	room2 := getRoom(keys[0])

	fmt.Println(room2)
	if !room2.Verify() {
		http.Error(w, "Username not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(room2)
	w.Write(jsonFile)

}

func GetRoomByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	room2 := getRoomByID(int(id))

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
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
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
	var croom Room
	err := json.NewDecoder(r.Body).Decode(&croom)
	log.Println(croom)
	if err != nil {
		log.Println(err)
	}
	if !croom.Verify() {
		http.Error(w, "faulty User", http.StatusBadRequest)
		return
	}
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
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

func getRoom(key string) Room {
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From room Where name= '%s'", key)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var room2 Room
	rows.Next()
	dberr = rows.Scan(&room2.Roomid, &room2.Name, &room2.Join, &room2.Create, &room2.Invite)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return room2
}

func getUser(name string) User {
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From user Where name= '%s'", name)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var user2 User
	rows.Next()
	dberr = rows.Scan(&user2.ID, &user2.Name, &user2.Password, &user2.Role)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return user2
}

func getRoomByID(id int) Room {
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From room Where id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var room2 Room
	rows.Next()
	dberr = rows.Scan(&room2.Roomid, &room2.Name, &room2.Join, &room2.Create, &room2.Invite)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return room2
}

func getMeetingByTimestamp(startTime string) int {
	/*db, dberr := sql.Open("sqlite3", "User.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select id From meeting Where meeting_date_start= '%s'", startTime)
	log.Println(queryStmt)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var meeting2 Meeting
	rows.Next()
	dberr = rows.Scan(&meeting2.Id)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return meeting2.Id

}

func getMeetingRunning(w http.ResponseWriter, r *http.Request) {

}
