package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"io/ioutil"
	"log"
	"net/http"
	_ "os"
	"path/filepath"
	_ "time"
)

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var db = initDbConnection()
var userMap map[string]string

/*func serverInit() {
	if _, err := os.Stat("./Account.sqlite"); err == nil {

	} else if os.IsNotExist(err) {

		db, err := sql.Open("sqlite3", "Account.sqlite")
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
		var admin Account
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

}*/
/*
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
*/

func serverInit() {
	path := filepath.Join("./createReservationDB.sql")

	c, ioErr := ioutil.ReadFile(path)
	if ioErr != nil {
		// handle error.
	}
	sqlString := string(c)
	_, err := db.Exec(sqlString)
	if err != nil {
		// handle error.
	}

}

func insertAdminAccount() {
	var admin Account
	admin.Username = "admin"
	admin.Password = "admin"
	admin.RoleId = 1
	admin.HashAndSalt([]byte(admin.Password))
	sqlStmt := fmt.Sprintf(`INSERT INTO account(username,password,role_id)VALUES(?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(admin.Username, admin.Password, admin.RoleId)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
}

func initDbConnection() *sql.DB {
	//var db, err = sql.Open("sqlite3", "Account.sqlite")
	var db, err = sql.Open("mysql", "root:Spartan17@tcp(127.0.0.1:3306)/reservationdb?parseTime=true")
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

func main() {

	//serverInit()

	//insertAdminAccount()
	userMap = make(map[string]string)
	fileServer := http.FileServer(http.Dir("./static")) // New code
	http.Handle("/", fileServer)
	//ResidentHandler
	http.HandleFunc("/getRoom", GetRoom)
	http.HandleFunc("/createRoom", CreateRoom)
	http.HandleFunc("/startRoom", startConf)
	http.HandleFunc("/getAllRoomNames", GetAllRoomNames)
	http.HandleFunc("/getRoomByID", GetRoomByID)
	http.HandleFunc("/getAllRoomByStationID", getAllRoomByStationID)
	http.HandleFunc("/getRoomIDByName", getRoomIDByName)
	http.HandleFunc("/deleteResident", deleteResident)

	//StationHandler
	http.HandleFunc("/getAllStation", getAllStation)
	http.HandleFunc("/getAllStationByName", getAllStationByName)
	http.HandleFunc("/getAllTablets", getAllTablets)
	http.HandleFunc("/getTimeOut", getTimeOut)
	http.HandleFunc("/setTimeOuts", setTimeOuts)
	http.HandleFunc("/disableTablet", disableTablet)
	http.HandleFunc("/addTablet", addTablet)
	http.HandleFunc("/getAllTabletsByMaintenance", getAllTabletsByMaintenance)

	http.HandleFunc("/getDayOuts", getDayOuts)
	http.HandleFunc("/setDayOuts", setDayOuts)

	//AccountHandler
	http.HandleFunc("/addUser", addUser)
	http.HandleFunc("/getUserAuthentication", getUserAuthentication)
	http.HandleFunc("/getUserAuthenticationCookie", getUserAuthenticationCookie)
	http.HandleFunc("/createNewStation", createNewStation)
	http.HandleFunc("/getAccountByName", getAccountByName)

	//MeetingHandler
	http.HandleFunc("/setMeeting", setMeeting)
	http.HandleFunc("/getAllMeetings", getAllMeetings)
	http.HandleFunc("/deleteMeeting", deleteMeeting)
	http.HandleFunc("/sendInvitationMail", sendInvitationMail)

	//VisitorHandler
	http.HandleFunc("/getVisitorByID", getVisitorByID)
	http.HandleFunc("/getAllResidentNamesByVisitorID", getAllResidentNamesByVisitorID)
	http.HandleFunc("/getVisitorbyname", getVisitorbyname)
	http.HandleFunc("/getAllVistorNamesByResidentID", getAllVistorNamesByResidentID)
	http.HandleFunc("/addNewVisitor", addNewVisitor)
	//http.HandleFunc("/addVisitorToResident", addVisitorToResident)

	//BetreuerHandler
	http.HandleFunc("/getAllRoomNamesByStation", getAllRoomNamesByStation)
	http.HandleFunc("/addNewMinder", addNewMinder)
	//RoleHandler
	http.HandleFunc("/getAllRole", getAllRoles)
	http.HandleFunc("/getRoleByName", getRoleByName)
	http.HandleFunc("/getRoleByID", getRoleByID)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":80", nil); err != nil {
		log.Fatal(err)
	}

}
