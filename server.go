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
	"strings"
	_ "time"
)

type Host struct {
	Name string `json:"name"`
}

type meetingIdentification struct {
	Running bool `json:"running"`
	Visitor bool `json:"visitor"`
}

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var db = initDbConnection()
var UserMap map[string]string
var ActiveMeetings map[string]bool
var host Host

func getActiveMeetings(w http.ResponseWriter, r *http.Request) {
	var meetingIdentification meetingIdentification
	keys, err := r.URL.Query()["meetingID"]
	name, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 || len(name[0]) < 1 {
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
	}
	jsonData, _ := json.Marshal(meetingIdentification)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

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

func initDbConnection() *sql.DB {
	//var db, err = sql.Open("sqlite3", "Account.sqlite")
	var db, err = sql.Open("mysql", "root:Spartan17@tcp(192.168.124.110:3306)/reservationDB?parseTime=true")
	//var db, err = sql.Open("mysql", "root:Spartan17@tcp(127.0.0.1:3306)/reservationDB?parseTime=true")
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

func sendGetRequest(w http.ResponseWriter, r *http.Request) {
	var requestString string
	_ = json.NewDecoder(r.Body).Decode(&requestString)
	resp, err := http.Get(requestString)
	if err != nil {
		http.Error(w, "Couldn't reach local server", http.StatusInternalServerError)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	sb := string(body)
	//log.Println(sb)
	if err != nil {
		http.Error(w, "Couldn't read incoming message", http.StatusNotFound)
		return
	}
	jsonData, _ := json.Marshal(sb)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(jsonData)
}

func getAllDockerContainer(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("http://192.168.178.102:7777/getAllDockerContainer")
	if err != nil {
		http.Error(w, "Couldn't reach local server", http.StatusInternalServerError)
		return
	}
	//We Read the response body on the line below.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Couldn't read incoming message", http.StatusNotFound)
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

func postRunCommand(w http.ResponseWriter, r *http.Request) {
	var cmds []string
	_ = json.NewDecoder(r.Body).Decode(&cmds)
	jsonData, err := json.Marshal(cmds)
	if err != nil {
		http.Error(w, "Faulty string", http.StatusFailedDependency)
		return
	}

	resp, err := http.Post("http://192.168.178.102:7777/runCommands", "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		http.Error(w, "Couldn't reach local server", http.StatusInternalServerError)
		return
	}
	//We Read the response body on the line below.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Couldn't read incoming message", http.StatusNotFound)
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

/*func getAllMeetingsRunning(w http.ResponseWriter, r *http.Request) {

	resp, err := http.Get("https://jitsi.jitsi-mathu.de/bigbluebutton/api/getMeetings?checksum=bf1fff0cc4ae42bda9322c62f3c359bd1a463726")
	if err != nil {
		http.Error(w, "Couldn't reach local server", http.StatusInternalServerError)
		return
	}
}*/

func settingsFile(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("http://192.168.178.72/settingsFile")
	data, err := ioutil.ReadAll(resp.Body)

	//data, err := ioutil.ReadFile("./static/js/test.js")
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
	UserMap = make(map[string]string)
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
