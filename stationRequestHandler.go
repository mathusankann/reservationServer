package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Station struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func (r Station) Verify() bool {
	check := r.Name != ""
	return check
}

type Tablet struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Maintenance bool   `json:"maintenance"`
	StationID   int    `json:"station_id"`
}

func getAllStation(w http.ResponseWriter, r *http.Request) {
	queryStmt := fmt.Sprintf("Select name From station ")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var listNames []string
	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			log.Println(err)
		}
		listNames = append(listNames, name)
	}
	rows.Close()
	jsonFile, _ := json.Marshal(listNames)
	w.Write(jsonFile)

}

func getAllStationByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(getStation(keys[0]).Id)
	w.Write(jsonFile)
}

func getStation(name string) Station {
	queryStmt := fmt.Sprintf("Select * From station Where name= '%s'", name)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var station Station
	rows.Next()
	dberr = rows.Scan(&station.Id, &station.Name)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return station
}

func createNewStation(w http.ResponseWriter, r *http.Request) {
	var incStation Station
	err := json.NewDecoder(r.Body).Decode(&incStation)
	if err != nil {
		log.Println(err)
	}
	if !incStation.Verify() {
		http.Error(w, "Name required", http.StatusBadRequest)
		return
	}

	if getStation(incStation.Name).Verify() {
		http.Error(w, "Station already exists", http.StatusBadRequest)
		return
	}
	//transaction
	//	db, err := sql.Open("sqlite3", "Account.sqlite")
	sqlStmt := fmt.Sprintf(`INSERT INTO station(name)VALUES(?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incStation.Name)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	w.Write([]byte("ok"))
}

func getAllTablets(w http.ResponseWriter, r *http.Request) {
	var listTablets []Tablet
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From tablets")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}

	w.Header().Set("Content-Type", "application/json")
	for rows.Next() {
		var tablet Tablet
		err := rows.Scan(&tablet.Id, &tablet.Name, &tablet.Maintenance, &tablet.StationID)
		if err != nil {
			log.Println(err)
		}
		listTablets = append(listTablets, tablet)
	}
	jsonFile, _ := json.Marshal(listTablets)
	w.Write(jsonFile)
}

func addTablet(w http.ResponseWriter, r *http.Request) {

}

func disableTablet(w http.ResponseWriter, r *http.Request) {

}

func setTimeOuts(w http.ResponseWriter, r *http.Request) {

}

func getTimeOut(w http.ResponseWriter, r *http.Request) {

}

func setDayOuts(w http.ResponseWriter, r *http.Request) {

}
func getDayOuts(w http.ResponseWriter, r *http.Request) {

}
