package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	_ "os"
	"strconv"
	"strings"
	"time"
	_ "time"
)

/**
Hostname
*/
type Host struct {
	Name string `json:"name"`
}

/**
Wird benötigt für die rollenbasierte Ansicht
*/
type meetingIdentification struct {
	Running bool `json:"running"`
	Visitor bool `json:"visitor"`
}

/**
Struct mit allen Informationen für das Frontend
*/

type settings struct {
	Traefik       string `json:"Traefik"`
	BigBlueButton string `json:"BigBlueButton"`
	Reservation   string `json:"Reservation"`
	SharedKey     string `json:"SharedKey"`
	OnlyOrigin    string `json:"OnlyOrigin"`
}

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

//Datenbank
var db = initDbConnection()

//aktive Anmeldungen
var UserMap map[string]string

//aktive Meetings
var ActiveMeetings map[string]bool

//für die live-ansicht in der Admin-Ansicht
var CurrentAdminView int
var host Host
var setting settings

/**
Legt die bearbeite Ansicht fest
*/
func setCurrentAdminView(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["viewID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Parameter viewID fehlt", http.StatusFailedDependency)
		return
	}
	incAdminview, stErr := strconv.Atoi(keys[0])
	if stErr != nil {
		http.Error(w, "Url Parameter viewID fehlerhaft", http.StatusFailedDependency)
		return
	}
	if incAdminview > 2 {
		http.Error(w, "Url Parameter viewID fehlerhaft", http.StatusFailedDependency)
		return
	}
	CurrentAdminView = incAdminview
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	jsonData, _ := json.Marshal(CurrentAdminView)
	w.Write(jsonData)
}

/**
Holt die aktuell bearbeite Ansicht
*/

func getCurrentAdminView(w http.ResponseWriter, r *http.Request) {
	jsonData, _ := json.Marshal(CurrentAdminView)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

/**
Rollenbasierte Ansicht
Die Fallunterscheidung
-----Bewohner wenn Konf nicht läuft und name in der Bewohnertablle enthalten ist
----Besucher wenn Konf läuft und angefragte Konf in aktivMeetings Map enthalten
---Admin wenn beide nicht zu treffen
*/

func getActiveMeetings(w http.ResponseWriter, r *http.Request) {
	var meetingIdentification meetingIdentification
	keys, err := r.URL.Query()["meetingID"]
	name, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 || len(name[0]) < 1 {
		http.Error(w, "Url Parameter meetingID oder Name fehlen", http.StatusFailedDependency)
		log.Println("Url Param 'meetingID or Name' is missing")
		return
	}
	meetingID := ActiveMeetings[keys[0]]
	if meetingID == false {
		meetingIdentification.Running = false
		if getRoom(name[0]).Name != "" {
			ActiveMeetings[keys[0]] = true
			meetingIdentification.Visitor = true
		} else {
			meetingIdentification.Visitor = false
		}
	} else {
		meetingIdentification.Running = true
		meetingIdentification.Visitor = true
	}
	jsonData, _ := json.Marshal(meetingIdentification)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

/**
leeren der activeMeeting Map nach abschluss des Meetings
*/
func deleteActiveMeeting(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["meetingID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Parameter meetingID fehlt", http.StatusFailedDependency)
		return
	}
	go localDeleteActiveMeeting(keys[0])
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	jsonData, _ := json.Marshal(ActiveMeetings[keys[0]])
	w.Write(jsonData)
}

/**
Goroutine für das löschen von inaktiven Meetings
*/
func localDeleteActiveMeeting(meetingID string) {
	time.Sleep(2 * time.Hour)
	delete(ActiveMeetings, meetingID)
}

/**
Bei erst Installation wird der Admin-Account der Db hinzugefügt
*/

func insertAdminAccount() {
	var check = getUser("admin")
	if check.Check() {
		return
	}
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

/**
Datenbankverbindung wird initsiert
*/

func initDbConnection() *sql.DB {
	//var db, err = sql.Open("sqlite3", "Account.sqlite")
	var db, err = sql.Open("mysql", "root:Spartan17@tcp(192.168.124.110:3306)/reservationDB?parseTime=true")
	//var db, err = sql.Open("mysql", "root:Spartan17@tcp(127.0.0.1:3306)/reservationDB?parseTime=true")
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

/**
Austausch zwischen Dockerserver
*/
func sendGetRequest(w http.ResponseWriter, r *http.Request) {
	var requestString string
	_ = json.NewDecoder(r.Body).Decode(&requestString)
	resp, err := http.Get(requestString)
	if err != nil {
		http.Error(w, "Dockerservice ist nicht erreichbar", http.StatusInternalServerError)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	sb := string(body)
	//log.Println(sb)
	if err != nil {
		http.Error(w, "Fehler beim Lesen des Response", http.StatusNotFound)
		return
	}
	jsonData, _ := json.Marshal(sb)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

/**
Austausch zwischen Dockerserver
*/
func getAllDockerContainer(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get(setting.Traefik + ":7777/getAllDockerContainer")

	if err != nil {
		http.Error(w, "Dockerservice ist nicht erreichbar", http.StatusInternalServerError)
		return
	}
	//We Read the response body on the line below.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Fehler beim Lesen des Response", http.StatusNotFound)
		return
	}
	//Convert the body to type string
	sb := string(body)
	docker := strings.Split(sb, `\n`)
	var dockerArray [][]string
	var tempArray []string
	var tempWord string
	var tempCutArray []string
	for i := 0; i < len(docker); i++ {
		tempArray = strings.Split(docker[i], " ")
		for j := 0; j < len(tempArray); j++ {
			if tempArray[j] != "" {
				tempWord = tempWord + " " + tempArray[j]
			}
			if tempArray[j] == "" && tempWord != "" {
				tempCutArray = append(tempCutArray, tempWord)
				tempWord = ""
			}
		}
		if tempWord != "" {
			tempCutArray = append(tempCutArray, tempWord)
			tempWord = ""
			dockerArray = append(dockerArray, tempCutArray)
			tempCutArray = nil
		}

	}
	jsonData, _ := json.Marshal(dockerArray)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

/**
Austausch zwischen Dockerserver
*/
func postRunCommand(w http.ResponseWriter, r *http.Request) {
	var cmds []string
	_ = json.NewDecoder(r.Body).Decode(&cmds)
	jsonData, err := json.Marshal(cmds)
	if err != nil {
		http.Error(w, "unbekannter Befehl", http.StatusFailedDependency)
		return
	}

	resp, err := http.Post(setting.Traefik+":7777/runCommands", "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		http.Error(w, "Dockerservice ist nicht erreichbar", http.StatusInternalServerError)
		return
	}
	//We Read the response body on the line below.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Fehler beim Lesen des Respons", http.StatusNotFound)
		return
	}
	//Convert the body to type string
	//	sb := string(body)
	//	log.Printf(sb)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(body)
}

func testSiteReturn(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./static/htmls/weiterleitung.html")
	if err != nil {
		http.Error(w, "Couldn't read file", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(data)

}

/**
rollenbasierte Ansicht JavaScript
*/
func settingsFile(w http.ResponseWriter, r *http.Request) {
	//resp, err := http.Get("http://192.168.178.72/settingsFile")
	//data, err := ioutil.ReadAll(resp.Body)

	data, err := ioutil.ReadFile("./static/js/test.js")
	if err != nil {
		http.Error(w, "Setting.js ist nicht vorhanden", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(data)
}

/**
Requesthandler für setting.Json
*/
func getSettingJson(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(localGetSettingJson())
}

/**
lokale methode für settings.json
*/
func localGetSettingJson() []byte {
	jsonFile, err := os.Open("./settings.json")
	if err != nil {
		log.Panic(err)
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	return byteValue
}

/**
Main Methode
mit allen Requesthandlern
*/
func main() {
	insertAdminAccount()
	go deleteTimedOutMeetings()
	jsonFile, err := os.Open("settings.json")
	if err != nil {
		log.Panic("something went wrong --> settings.json")
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &host)
	json.Unmarshal(localGetSettingJson(), &setting)

	//insertAdminAccount()
	UserMap = make(map[string]string)
	ActiveMeetings = make(map[string]bool)
	fileServer := http.FileServer(http.Dir("./static")) // New code

	http.Handle("/", fileServer)

	http.Handle("/static/", http.StripPrefix("/static/", fileServer))

	http.HandleFunc("/settingsFile", settingsFile)
	http.HandleFunc("/getAllDockerContainer", getAllDockerContainer)
	http.HandleFunc("/postRunCommand", postRunCommand)
	http.HandleFunc("/sendGetRequest", sendGetRequest)
	http.HandleFunc("/removeAuthenticateUser", removeAuthenticateUser)
	http.HandleFunc("/getActiveMeetings", getActiveMeetings)
	http.HandleFunc("/testSiteReturn", testSiteReturn)
	http.HandleFunc("/deleteActiveMeeting", deleteActiveMeeting)
	http.HandleFunc("/getSettingJson", getSettingJson)
	http.HandleFunc("/getCurrentAdminView", getCurrentAdminView)
	http.HandleFunc("/setCurrentAdminView", setCurrentAdminView)

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
	http.HandleFunc("/updateResident", updateResident)

	//StationHandler
	http.HandleFunc("/getAllStation", getAllStation)
	http.HandleFunc("/getAllStationByName", getAllStationByName)
	http.HandleFunc("/getStationByID", getStationByID)
	http.HandleFunc("/getAllTablets", getAllTablets)
	http.HandleFunc("/getAllTabletsNames", getAllTabletsNames)
	http.HandleFunc("/getTimeOut", getTimeOut)
	http.HandleFunc("/setTimeOuts", setTimeOuts)
	http.HandleFunc("/updateTablet", updateTablet)
	http.HandleFunc("/addTablet", addTablet)
	http.HandleFunc("/getAllTabletsByMaintenance", getAllTabletsByMaintenance)
	http.HandleFunc("/getTabletByName", getTabletByName)
	http.HandleFunc("/getTabletByID", getTabletByID)

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
	http.HandleFunc("/getAllAccounts", getAllAccounts)
	http.HandleFunc("/getUserByID", getUserByID)
	http.HandleFunc("/updateAccount", updateAccount)

	//MeetingHandler
	http.HandleFunc("/setMeeting", setMeeting)
	http.HandleFunc("/getAllMeetings", getAllMeetings)
	http.HandleFunc("/deleteMeeting", deleteMeeting)
	http.HandleFunc("/sendInvitationMail", sendInvitationMail)
	http.HandleFunc("/updateMeeting", updateMeeting)
	http.HandleFunc("/updateMeetingWithMail", updateMeetingWithMail)
	http.HandleFunc("/getAllValidMeetings", getAllValidMeetings)

	//VisitorHandler
	http.HandleFunc("/getVisitorByID", getVisitorByID)
	http.HandleFunc("/getVisitorbyname", getVisitorbyname)
	http.HandleFunc("/getAllVistorNamesByResidentID", getAllVistorNamesByResidentID)
	http.HandleFunc("/addNewVisitor", addNewVisitor)
	http.HandleFunc("/registerVisitor", registerVisitor)
	http.HandleFunc("/getVisitorByAccountID", getVisitorByAccountID)
	http.HandleFunc("/getVisitorByMail", getVisitorByMail)
	http.HandleFunc("/getAllVisitors", getAllVisitors)

	//http.HandleFunc("/addVisitorToResident", addVisitorToResident)

	//BetreuerHandler
	http.HandleFunc("/getAllRoomNamesByStation", getAllRoomNamesByStation)
	//http.HandleFunc("/addNewMinder", addNewMinder)
	//RoleHandler
	http.HandleFunc("/getAllRole", getAllRoles)
	http.HandleFunc("/getRoleByName", getRoleByName)
	http.HandleFunc("/getRoleByID", getRoleByID)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":80", nil); err != nil {
		log.Fatal(err)
	}

}
