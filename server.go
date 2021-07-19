package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	_ "os"
	_ "time"
)

type Host struct {
	Name string `json:"name"`
}

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var db = initDbConnection()
var userMap map[string]string
var host Host

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
	//var db, err = sql.Open("mysql", "root:Spartan17@tcp(192.168.124.110:3306)/reservationDB?parseTime=true")
	var db, err = sql.Open("mysql", "root:Spartan17@tcp(127.0.0.1:3306)/reservationDB?parseTime=true")
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

func settingsFile(w http.ResponseWriter, r *http.Request) {
	/*resp, err := http.Get("http://192.168.178.72/settingsFile")
	data, err := ioutil.ReadAll(resp.Body)*/

	data, err := ioutil.ReadFile("./static/js/test.js")
	if err != nil {
		http.Error(w, "Couldn't read file", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(data)
}

func main() {
	insertAdminAccount()
	jsonFile, err := os.Open("settings.json")
	if err != nil {
		log.Panic("something went wrong --> settings.json")
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &host)
	//insertAdminAccount()
	userMap = make(map[string]string)
	fileServer := http.FileServer(http.Dir("./static")) // New code

	http.Handle("/", fileServer)

	http.Handle("/static/", http.StripPrefix("/static/", fileServer))

	http.HandleFunc("/settingsFile", settingsFile)

	//ResidentHandler
	http.HandleFunc("/getRoom", GetRoom)
	http.HandleFunc("/createRoom", CreateRoom)
	http.HandleFunc("/startRoom", startConf)
	http.HandleFunc("/getAllRoomNames", GetAllRoomNames)
	http.HandleFunc("/getRoomByID", GetRoomByID)
	http.HandleFunc("/getAllRoomByStationID", getAllRoomByStationID)
	http.HandleFunc("/getRoomIDByName", getRoomIDByName)
	http.HandleFunc("/deleteResident", deleteResident)
	http.HandleFunc("/getAllResidentNamesByVisitorID", getAllResidentNamesByVisitorID)
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
	http.HandleFunc("/getKonfSettings", getKonfSettings)
	http.HandleFunc("/setKonfSettings", setKonfSettings)

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
	http.HandleFunc("/getVisitorbyname", getVisitorbyname)
	http.HandleFunc("/getAllVistorNamesByResidentID", getAllVistorNamesByResidentID)
	http.HandleFunc("/addNewVisitor", addNewVisitor)
	http.HandleFunc("/registerVisitor", registerVisitor)
	http.HandleFunc("/getVisitorByAccountID", getVisitorByAccountID)
	http.HandleFunc("/getVisitorByMail", getVisitorByMail)

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
