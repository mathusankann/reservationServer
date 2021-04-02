package main

import (
	"../room"
	"database/sql"
	"encoding/json"
	_ "github.com/mattn/go-sqlite3"
	_ "go/ast"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type Rooms struct {
	Roompath string `json:"roompath"`
}

const PATHSTOROOM = "./UserJsons/"

func GetRoomID() {

}

func GetVideoBridge() {

}

func deleteRoom() {

}

func editRoom() {

}

func sendInvitation() {

}

func getSharedSecret() {

}

func GetRoom(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	path := "./UserJsons/" + keys[0] + ".json"
	jsonFile, _ := os.Open(path)
	byteValue, _ := ioutil.ReadAll(jsonFile)
	defer jsonFile.Close()
	w.Header().Set("Content-Type", "application/json")
	w.Write(byteValue)
}

func GetAllRoomNames(w http.ResponseWriter, r *http.Request) {
	jsonFile, _ := os.Open("./UserJsons/allRooms.json")
	byteValue, _ := ioutil.ReadAll(jsonFile)
	defer jsonFile.Close()
	w.Header().Set("Content-Type", "application/json")
	_, err := w.Write(byteValue)
	if err != nil {
		log.Println(err)
	}

}

func startConf(w http.ResponseWriter, r *http.Request) {
	var test string
	_ = json.NewDecoder(r.Body).Decode(&test)
	//fmt.Println(test)
	resp, err := http.Get(test)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(resp.Status))
}

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	var croom room.Room
	err := json.NewDecoder(r.Body).Decode(&croom)
	path := "./UserJsons/" + croom.Name + ".json"
	jsonFile, openerr := os.Open(path)
	defer jsonFile.Close()
	if openerr == nil {
		http.Error(w, "Username existing already", http.StatusFailedDependency)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !croom.Verify() {
		http.Error(w, "Missing data ", http.StatusFailedDependency)
		return
	}
	//log.Println(croom)
	path = "./UserJsons/" + croom.Name + ".json"
	roomJson, _ := json.Marshal(croom)
	err = ioutil.WriteFile(path, roomJson, 0644)
	appendRoom(croom.Name)
}

func appendRoom(path string) {
	if _, err := os.Stat("./UserJsons/allRooms.json"); err == nil {
		log.Println("true")
		var rooms []Rooms
		jsonFile, _ := os.Open("./UserJsons/allRooms.json")
		byteValue, _ := ioutil.ReadAll(jsonFile)
		err := json.Unmarshal(byteValue, &rooms)
		if err != nil {
			log.Println(err)
		}
		defer jsonFile.Close()
		var newRoom Rooms
		newRoom.Roompath = path
		rooms = append(rooms, newRoom)
		roomJson, _ := json.Marshal(rooms)
		err = ioutil.WriteFile("./UserJsons/allRooms.json", roomJson, 0644)
	} else if os.IsNotExist(err) {
		log.Println("false")
		var rooms []Rooms
		var newRoom Rooms
		newRoom.Roompath = path
		rooms = append(rooms, newRoom)
		roomJson, _ := json.Marshal(rooms)
		err = ioutil.WriteFile("./UserJsons/allRooms.json", roomJson, 0644)

	}

}
func testFunction() {
	db, err := sql.Open("sqlite3", "simple.sqlite")
	if err != nil {
		log.Panic(err)
	}

	sqlStmt := "CREATE TABLE data (id TEXT not null primary key, content TEXT);"
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Panic(err)
	}

}
