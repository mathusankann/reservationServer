package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	gomail "gopkg.in/mail.v2"
	"log"
	"net/http"
	"strings"
)

func setMeeting(w http.ResponseWriter, r *http.Request) {
	var incMeeting Meeting
	err := json.NewDecoder(r.Body).Decode(&incMeeting)
	if err != nil {
		log.Println(err)
	}
	log.Println(incMeeting)
	if !getRoomByID(incMeeting.BewohnerId).Verify() {
		http.Error(w, "Room does not exists", http.StatusBadRequest)
		return
	}
	//transaction
	//db, err := sql.Open("sqlite3", "Account.sqlite")
	//sqlStmt := fmt.Sprintf(`INSERT INTO meeting(start_date,end_date,bewohner_id,tablets_id)VALUES(?,?,?,?,?)`)
	sqlStmt := fmt.Sprintf(`INSERT INTO meeting(start_date,end_date,bewohner_id)VALUES(?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	//_, err = statement.Exec(incMeeting.MeetingDateStart, incMeeting.MeetingDateEnd, incMeeting.BewohnerId, incMeeting.BesucherId, incMeeting.TabletId)
	_, err = statement.Exec(incMeeting.MeetingDateStart, incMeeting.MeetingDateEnd, incMeeting.BewohnerId)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	timeString := incMeeting.MeetingDateStart.String()
	timeArray := strings.Split(timeString, " ")
	timeString = timeArray[0] + " " + timeArray[1] + "+00:00"
	incMeeting.Id = getMeetingByTimestamp(timeString)
	//sendInvitation(incMeeting)
	w.Write([]byte("ok"))

}

func deleteMeeting(w http.ResponseWriter, r *http.Request) {
	deleteID, errs := r.URL.Query()["UserID"]
	if !errs || len(deleteID[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	//db, dberr := sql.Open("sqlite3", "Account.sqlite")
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
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From meeting where start_date >= '%s' and end_date  <= '%s' ORDER BY end_date ", startTime[0], endTime[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	for rows.Next() {
		var cachedates CacheMeeting
		var dates Meeting
		err := rows.Scan(&cachedates.Id, &cachedates.MeetingDateStart, &cachedates.MeetingDateEnd, &cachedates.BewohnerId, &cachedates.BesucherId, &cachedates.TabletId)
		if err != nil {
			log.Print("GetAllMeetings: ")
			log.Println(err)
		}
		dates.Copy(cachedates)
		reservedDates = append(reservedDates, dates)

	}
	jsonFile, _ := json.Marshal(reservedDates)
	w.Write(jsonFile)

}

func sendInvitation(incMeeting Meeting) {
	//incoming
	//Timestamp of the meeting and Email
	room := getRoomByID(incMeeting.BewohnerId)
	//ro := getRoom(incMessage.Account)
	m := gomail.NewMessage()
	// Set E-Mail sender
	m.SetHeader("From", "TerminMa3@outlook.de")
	//Set E-Mail receivers
	visitor := getVisitor(incMeeting.BesucherId)
	m.SetHeader("To", visitor.Mail)
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

func getMeetingByTimestamp(startTime string) int {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select id From meeting Where start_date= '%s'", startTime)
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
