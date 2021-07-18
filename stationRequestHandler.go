package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

type Day struct {
	Day   string `json:"day"`
	Value bool   `json:"value"`
}

type configUser struct {
	User  string `json:"user"`
	Value []int  `json:"value"`
}

func (tablets Tablet) Verify() bool {
	return tablets.Name != ""
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
	if rows.Next() {
		dberr = rows.Scan(&station.Id, &station.Name)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	rows.Close()
	return station
}

func getTablet(name string) Tablet {
	queryStmt := fmt.Sprintf("Select * From tablets Where name= '%s'", name)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var cache sql.NullInt32
	var tablet Tablet
	if rows.Next() {
		dberr = rows.Scan(&tablet.Id, &tablet.Name, &tablet.Maintenance, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	rows.Close()
	tablet.StationID = int(cache.Int32)
	return tablet
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
	var cache sql.NullInt32
	var tablet Tablet
	for rows.Next() {
		err := rows.Scan(&tablet.Id, &tablet.Name, &tablet.Maintenance, &cache)
		if err != nil {
			log.Println(err)
		}
		tablet.StationID = int(cache.Int32)
		listTablets = append(listTablets, tablet)
	}
	jsonFile, _ := json.Marshal(listTablets)
	w.Write(jsonFile)
}

func getAllTabletsByMaintenance(w http.ResponseWriter, r *http.Request) {
	var listTablets []Tablet
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From tablets where maintenance=0 ")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}

	w.Header().Set("Content-Type", "application/json")
	var cache sql.NullInt32
	var tablet Tablet
	for rows.Next() {
		err := rows.Scan(&tablet.Id, &tablet.Name, &tablet.Maintenance, &cache)
		if err != nil {
			log.Println(err)
		}
		tablet.StationID = int(cache.Int32)
		listTablets = append(listTablets, tablet)
	}
	jsonFile, _ := json.Marshal(listTablets)
	w.Write(jsonFile)

}

func addTablet(w http.ResponseWriter, r *http.Request) {
	var incTablet Tablet
	err := json.NewDecoder(r.Body).Decode(&incTablet)
	if err != nil {
		log.Println(err)
	}
	if !incTablet.Verify() {
		http.Error(w, "Name required", http.StatusBadRequest)
		return
	}

	if getTablet(incTablet.Name).Verify() {
		http.Error(w, "Tablet already exists", http.StatusBadRequest)
		return
	}
	//transaction
	sqlStmt := fmt.Sprintf(`INSERT INTO tablets(name,maintenance)VALUES(?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incTablet.Name, incTablet.Maintenance)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	w.Write([]byte("ok"))

}

func disableTablet(w http.ResponseWriter, r *http.Request) {
	var incTablet Tablet
	err := json.NewDecoder(r.Body).Decode(&incTablet)
	if err != nil {
		log.Println(err)
	}
	sqlStmt := fmt.Sprintf("UPDATE tablets SET maintenance = ? WHERE Id = ?")
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incTablet.Maintenance, incTablet.Id)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	w.Write([]byte("ok"))

}

type Times struct {
	Start int `json:"start"`
	End   int `json:"end"`
}

func setTimeOuts(w http.ResponseWriter, r *http.Request) {
	var timeOuts []Times
	err := json.NewDecoder(r.Body).Decode(&timeOuts)
	if err != nil {
		log.Println(err)
	}
	file, _ := json.MarshalIndent(timeOuts, "", " ")
	_ = ioutil.WriteFile("timeOuts.json", file, 0644)
	w.Write([]byte("done"))
}

func getTimeOut(w http.ResponseWriter, r *http.Request) {
	jsonFile, err := os.Open("./timeOuts.json")
	if err != nil {
		log.Println(err)
		http.Error(w, "no timeouts set", http.StatusNotFound)
		return
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	w.Header().Set("Content-Type", "application/json")
	w.Write(byteValue)

}

func setDayOuts(w http.ResponseWriter, r *http.Request) {
	var days []Day
	err := json.NewDecoder(r.Body).Decode(&days)
	if err != nil {
		log.Println(err)
	}

	file, _ := json.MarshalIndent(days, "", " ")
	_ = ioutil.WriteFile("week.json", file, 0644)
	w.Write([]byte("done"))

}
func getDayOuts(w http.ResponseWriter, r *http.Request) {
	jsonFile, err := os.Open("./week.json")
	if err != nil {
		log.Println(err)
		http.Error(w, "week.json does not exist", http.StatusNotFound)
		return
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	w.Header().Set("Content-Type", "application/json")
	w.Write(byteValue)
}

func setKonfSettings(w http.ResponseWriter, r *http.Request) {
	var settings []configUser
	err := json.NewDecoder(r.Body).Decode(&settings)
	if err != nil {
		log.Println(err)
	}

	file, _ := json.MarshalIndent(settings, "", " ")
	_ = ioutil.WriteFile("konfSetting.json", file, 0644)
	w.Write([]byte("done"))

}
func getKonfSettings(w http.ResponseWriter, r *http.Request) {
	jsonFile, err := os.Open("./konfSetting.json")
	if err != nil {
		log.Println(err)
		http.Error(w, "week.json does not exist", http.StatusNotFound)
		return
	}
	byteValue, _ := ioutil.ReadAll(jsonFile)
	w.Header().Set("Content-Type", "application/json")
	w.Write(byteValue)
}
