package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func GetAllRoomNamesByStationID(ID int) []string {
	var listNames []string
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select name From bewohner where station_id=%d", ID)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}

	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			log.Println(err)
		}
		listNames = append(listNames, name)
	}
	return listNames

}

func getAllRoomNamesByStation(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	bewohner := GetAllRoomNamesByStationID(int(id))
	jsonFile, _ := json.Marshal(bewohner)
	w.Write(jsonFile)
}

func addNewMinder(w http.ResponseWriter, r *http.Request) {
	var betreuer Betreuer
	err := json.NewDecoder(r.Body).Decode(&betreuer)
	if err != nil {
		log.Println(err)
	}
	if !betreuer.Verify() {
		http.Error(w, "faulty Account", http.StatusBadRequest)
		return
	}
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select name From betreuer Where name= '%s'", betreuer.Name)
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

	sqlStmt := fmt.Sprintf(`INSERT INTO betreuer(name,station_id,account_id)VALUES(?,?,?)`)

	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(betreuer.Name, betreuer.StationID, betreuer.AccountID)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()

	w.Write([]byte("ok"))

}
