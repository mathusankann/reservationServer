package main

import (
	"crypto/tls"
	_ "database/sql"
	"encoding/json"
	"fmt"
	gomail "gopkg.in/mail.v2"
	"log"
	"net/http"
	"strconv"

	"strings"
)

func setMeeting(w http.ResponseWriter, r *http.Request) {
	var incMeeting Meeting
	err := json.NewDecoder(r.Body).Decode(&incMeeting)
	if err != nil {
		log.Println(err)
	}
	if !getRoomByID(incMeeting.BewohnerId).Verify() {
		http.Error(w, "Bewohner existiert nicht", http.StatusBadRequest)
		return
	}
	//transaction
	//db, err := sql.Open("sqlite3", "Account.sqlite")
	//sqlStmt := fmt.Sprintf(`INSERT INTO meeting(start_date,end_date,bewohner_id,tablets_id)VALUES(?,?,?,?,?)`)
	sqlStmt := fmt.Sprintf(`INSERT INTO meeting(start_date,end_date,bewohner_id,besucher_id,pending,request_bewohner)VALUES(?,?,?,?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	//_, err = statement.Exec(incMeeting.MeetingDateStart, incMeeting.MeetingDateEnd, incMeeting.BewohnerId, incMeeting.BesucherId, incMeeting.TabletId)
	_, err = statement.Exec(incMeeting.MeetingDateStart, incMeeting.MeetingDateEnd, incMeeting.BewohnerId, incMeeting.BesucherId, incMeeting.Pending, incMeeting.RequestBewohner)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	statement.Close()
	timeString := incMeeting.MeetingDateStart.String()
	timeArray := strings.Split(timeString, " ")
	timeString = timeArray[0] + " " + timeArray[1] + "+00:00"
	incMeeting.Id = getMeetingByTimestamp(timeString)

	room := getRoomByID(incMeeting.BewohnerId)
	dateString := incMeeting.MeetingDateStart.String()
	dateString = strings.Split(dateString, "+")[0]
	dateArray := strings.Split(dateString, " ")
	timeArray = strings.Split(dateArray[1], ":")

	hour, err := strconv.Atoi(timeArray[0])
	if err != nil {
		log.Println(err)
	}
	hour = hour + 2
	wholeString := dateArray[0] + " um " + strconv.Itoa(hour) + ":" + timeArray[1]

	//body := fmt.Sprintf("Ihr Konferenzlink: %s \n Die Konferenz findet am %s \n Sie haben "+
	//	"die Möglichkeit den Termin zu stonieren, falls etwas dazwischen kommt: http://%s/deleteMeeting?meetingID=%d", room.Invite, wholeString, host.Name, incMeeting.Id)
	visitor := getVisitor(incMeeting.BesucherId, "id")
	acceptLink := fmt.Sprintf("https://localhost/updateMeetingWithMail?meetingID=%d", host.Name, incMeeting.Id)
	body := fmt.Sprintf("Hallo %s \n\n"+
		"%s würde gerne am %s mit Ihnen ein Videogespräch führen."+
		"Falls es Ihnen zeitlich passt, können Sie mit folgendem Link zusagen:\n%s. \nBitte beachten Sie, dass diese Anfrage nur 24 Stunden gültig ist. \n\n", visitor.Name, room.Name, wholeString, acceptLink)
	go sendInvitation(incMeeting, body)
	w.Write([]byte("ok"))

}

func updateMeetingWithMail(w http.ResponseWriter, r *http.Request) {
	mID, derr := r.URL.Query()["meetingID"]

	if !derr || len(mID[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		return
	}
	meetingID, _ := strconv.ParseInt(mID[0], 10, 32)
	incMeeting := localGetMeetingByID(int(meetingID))
	if incMeeting.Pending {
		sqlStmt := fmt.Sprintf(`UPDATE meeting Set pending =? Where id=?`)
		statement, err := db.Prepare(sqlStmt)
		if err != nil {
			log.Println(err)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			return
		}
		_, err = statement.Exec(false, meetingID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			return
		}
		statement.Close()
		timeString := incMeeting.MeetingDateStart.String()
		timeArray := strings.Split(timeString, " ")
		timeString = timeArray[0] + " " + timeArray[1] + "+00:00"
		incMeeting.Id = getMeetingByTimestamp(timeString)
		room := getRoomByID(incMeeting.BewohnerId)
		dateString := incMeeting.MeetingDateStart.String()
		dateString = strings.Split(dateString, "+")[0]
		dateArray := strings.Split(dateString, " ")
		timeArray = strings.Split(dateArray[1], ":")
		hour, err := strconv.Atoi(timeArray[0])
		if err != nil {
			log.Println(err)
		}
		hour = hour + 2
		wholeString := dateArray[0] + " um " + strconv.Itoa(hour) + ":" + timeArray[1] + " statt"
		visitor := getVisitor(incMeeting.BesucherId, "id")
		body := fmt.Sprintf("Hallo %s\n\n Schön das Sie Zeit gefunden haben.Ihr Konferenzlink: %s \n Die Konferenz findet am %s \n\n", visitor.Name, room.Invite, wholeString)
		go sendInvitation(incMeeting, body)
		w.Write([]byte("Meeting erfolgreich bestätigt"))
	} else {
		w.Write([]byte("Meeting wurde bereits beantwortet"))
	}
}

func localGetMeetingByID(id int) Meeting {
	queryStmt := fmt.Sprintf("Select * From meeting Where id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var meeting Meeting
	if rows.Next() {
		dberr = rows.Scan(&meeting.Id, &meeting.MeetingDateStart, &meeting.MeetingDateEnd, &meeting.BewohnerId, &meeting.BesucherId, &meeting.TabletId, &meeting.Pending, &meeting.RequestBewohner)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	rows.Close()
	return meeting

}

func deleteMeeting(w http.ResponseWriter, r *http.Request) {
	deleteID, errs := r.URL.Query()["meetingID"]
	if !errs || len(deleteID[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'Name' is missing")
		return
	}
	//db, dberr := sql.Open("sqlite3", "Account.sqlite")
	/*if dberr != nil {
		log.Panic(dberr)
	}*/
	id, _ := strconv.ParseInt(deleteID[0], 10, 32)
	localDeleteMeeting(int(id))

	com := "Ihr Meeting wurde erfolgreich stoniert"
	jsonFile, _ := json.Marshal(com)
	w.Write(jsonFile)
}

func localDeleteMeeting(deleteID int) {
	stmt, err := db.Prepare("delete from meeting where id=?")
	if err != nil {
		log.Panic(err)
		return
	}
	res, err := stmt.Exec(deleteID)
	if err != nil {
		log.Panic(err)
		return
	}
	affect, err := res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()
}

func getAllMeetings(w http.ResponseWriter, r *http.Request) {
	var reservedDates []Meeting
	startTime, err := r.URL.Query()["starttime"]
	//	s := strings.Split(startTime[0], "T")[0]
	endTime, err := r.URL.Query()["endtime"]
	//	e := strings.Split(endTime[0], "T")[0]
	if !err || len(startTime[0]) < 1 || len(endTime[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
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
		log.Println(dberr)
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		return
	}
	for rows.Next() {
		var cachedates CacheMeeting
		var dates Meeting
		err := rows.Scan(&cachedates.Id, &cachedates.MeetingDateStart, &cachedates.MeetingDateEnd, &cachedates.BewohnerId, &cachedates.BesucherId, &cachedates.TabletId, &cachedates.Pending, &cachedates.RequestBewohner)
		if err != nil {
			log.Println(err)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			return
		}
		dates.Copy(cachedates)
		reservedDates = append(reservedDates, dates)

	}
	jsonFile, _ := json.Marshal(reservedDates)
	w.Write(jsonFile)

}

func sendInvitation(incMeeting Meeting, body string) {
	//incoming
	//Timestamp of the meeting and Email
	//ro := getRoom(incMessage.Account)
	m := gomail.NewMessage()
	// Set E-Mail sender
	m.SetHeader("From", "TerminMa3@outlook.de")
	//Set E-Mail receivers
	visitor := getVisitor(incMeeting.BesucherId, "id")
	m.SetHeader("To", visitor.Mail)
	// Set E-Mail subject
	m.SetHeader("Subject", "Konferenzlink")
	// Set E-Mail body. You can set plain text or html with text/html

	m.SetBody("text/plain", body)
	// Settings for SMTP server
	d := gomail.NewDialer("smtp.office365.com", 587, "Terminma3@outlook.de", "Spartan17")
	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		log.Println(err.Error())
	}
	return
}

func getMeetingByTimestamp(startTime string) int {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select id From meeting Where start_date= '%s'", startTime)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var meeting2 Meeting
	if rows.Next() {
		dberr = rows.Scan(&meeting2.Id)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	rows.Close()
	return meeting2.Id
}

func updateMeeting(w http.ResponseWriter, r *http.Request) {
	keys, derr := r.URL.Query()["accept"]

	mID, derr := r.URL.Query()["meetingID"]

	if !derr || len(keys[0]) < 1 || len(mID[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'accept' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	meetingID, _ := strconv.ParseInt(mID[0], 10, 32)
	if id == 0 {
		sqlStmt := fmt.Sprintf(`UPDATE meeting Set pending =? Where id=?`)
		statement, err := db.Prepare(sqlStmt)
		if err != nil {
			log.Println(err)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			return
		}
		_, err = statement.Exec(false, meetingID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			return
		}
		statement.Close()
	} else {
		localDeleteMeeting(int(meetingID))
		w.Header().Set("Content-Type", "application/json")
		com := "Meeting erfolgreich storniert"
		jsonFile, _ := json.Marshal(com)
		w.Write(jsonFile)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	com := "Meeting erfolreich zugesagt"
	jsonFile, _ := json.Marshal(com)
	w.Write(jsonFile)

}

func sendInvitationMail(w http.ResponseWriter, r *http.Request) {
	var incMeeting Meeting
	err := json.NewDecoder(r.Body).Decode(&incMeeting)
	if err != nil {
		log.Println(err)
	}
	log.Println(incMeeting)
	if !getRoomByID(incMeeting.BewohnerId).Verify() {
		http.Error(w, "Bewohner existiert nicht", http.StatusBadRequest)
		return
	}
	room := getRoomByID(incMeeting.BewohnerId)
	body := fmt.Sprintf("Ihr Konferenzlink: %s \n Für die Konferenz mit %s", room.Invite, room.Name)
	println(body)
	go sendInvitation(incMeeting, body)
	w.Write([]byte("ok"))
}
