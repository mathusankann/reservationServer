package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func GetRoom(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'Name' is missing")
		return
	}
	room2 := getRoom(keys[0])

	if !room2.Verify() {
		http.Error(w, "Benutzername nicht gefunden", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(room2)
	w.Write(jsonFile)

}

func getStationIDByAccountID(id int) int {
	var stationID int
	var array []string
	array = append(array, "bewohner")
	array = append(array, "betreuer")

	queryStmt := fmt.Sprintf("Select station_id From %s where account_id=%d", "betreuer", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	if rows.Next() {
		err := rows.Scan(&stationID)
		if err != nil {
			log.Println(err)
		}
	}

	return stationID

}

func localGetRoomMeetingID(meetingID string) Resident {
	var room2 Resident
	var cache sql.NullInt32
	queryStmt := fmt.Sprintf("Select * From bewohner Where joinLink like '%%s%'", meetingID)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	if rows.Next() {
		dberr = rows.Scan(&room2.Id, &room2.Name, &room2.StationId, &room2.Join, &room2.Create, &room2.Invite, &room2.MeetingRunningLink, &room2.Room, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	room2.AccountId = int(cache.Int32)
	rows.Close()
	return room2
}

func GetRoomByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	room2 := getRoomByID(int(id))

	if !room2.Verify() {
		http.Error(w, "Benutzername nicht gefunden", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(room2)
	w.Write(jsonFile)

}

func updateResident(w http.ResponseWriter, r *http.Request) {
	var incResident Resident
	err := json.NewDecoder(r.Body).Decode(&incResident)
	if err != nil {
		log.Println(err)
	}
	if localGetStationByID(incResident.StationId).Name == "" {
		http.Error(w, "Station existiert nicht", http.StatusBadRequest)
		return
	}
	sqlStmt := fmt.Sprintf(`UPDATE bewohner Set station_id =?,name=?,room=? Where id=?`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	_, err = statement.Exec(incResident.StationId, incResident.Name, incResident.Room, incResident.Id)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	statement.Close()
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("ok"))
}

func GetAllRoomNames(w http.ResponseWriter, r *http.Request) {
	var listNames []string
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select name From bewohner")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	for rows.Next() {
		var name string
		err := rows.Scan(&name)
		if err != nil {
			log.Println(err)
		}
		listNames = append(listNames, name)
	}
	jsonFile, _ := json.Marshal(listNames)
	w.Write(jsonFile)
}

func startConf(w http.ResponseWriter, r *http.Request) {
	var link string
	_ = json.NewDecoder(r.Body).Decode(&link)
	//fmt.Println(test)

	resp, err := http.Get(link)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(resp.Status))
}

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	var croom Resident
	err := json.NewDecoder(r.Body).Decode(&croom)
	if err != nil {
		log.Println(err)
	}
	if !croom.Verify() {
		http.Error(w, "Bewohner entspricht den Anforderungen", http.StatusBadRequest)
		return
	}
	if getRoom(croom.Name).Name != "" {
		http.Error(w, "Bewohnername ist schon vergeben", http.StatusBadRequest)
		return
	}

	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	//transaction

	sqlStmt := fmt.Sprintf(`INSERT INTO bewohner(name,station_id,inviteLink,createLink,joinLink,meetingRunningLink,room)VALUES(?,?,?,?,?,?,?)`)

	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	_, err = statement.Exec(croom.Name, croom.StationId, croom.Join, croom.Create, croom.Invite, &croom.MeetingRunningLink, &croom.Room)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	statement.Close()
	com := "Bewohner erfolgreich hinzugefügt"
	jsonFile, _ := json.Marshal(com)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonFile)

}

func getRoom(key string) Resident {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From bewohner Where name= '%s'", key)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var cache sql.NullInt32
	var room2 Resident
	if rows.Next() {
		dberr = rows.Scan(&room2.Id, &room2.Name, &room2.StationId, &room2.Join, &room2.Create, &room2.Invite, &room2.MeetingRunningLink, &room2.Room, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
		room2.AccountId = int(cache.Int32)
	}
	rows.Close()
	return room2
}

func getRoomByID(id int) Resident {
	queryStmt := fmt.Sprintf("Select * From bewohner Where id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var room2 Resident
	var cacheAccount sql.NullInt32
	if rows.Next() {
		dberr = rows.Scan(&room2.Id, &room2.Name, &room2.StationId, &room2.Invite, &room2.Create, &room2.Join, &room2.MeetingRunningLink, &room2.Room, &cacheAccount)
		if dberr != nil {
			log.Println(dberr)
		}
		room2.AccountId = int(cacheAccount.Int32)
	}
	rows.Close()
	return room2
}

func getAllVisitors(w http.ResponseWriter, r *http.Request) {
	var visitorNames []string
	queryStmt := fmt.Sprintf("Select name From besucher")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var name string
	for rows.Next() {
		dberr = rows.Scan(&name)
		visitorNames = append(visitorNames, name)
	}

	rows.Close()
	jsonFile, _ := json.Marshal(visitorNames)
	w.Write(jsonFile)
}

func getAllVistorNamesByResidentID(w http.ResponseWriter, r *http.Request) {
	var visitorNames []string
	var index []int
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}

	//id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select besucher_id From bewohner_hat_besucher Where bewohner_id=%s", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var ind int
	for rows.Next() {
		dberr = rows.Scan(&ind)
		index = append(index, ind)
	}
	rows.Close()

	for i := 0; i < len(index); i++ {
		queryStmt := fmt.Sprintf("Select name From besucher Where id= %d", index[i])
		rows, dberr := db.Query(queryStmt)
		if dberr != nil {
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			log.Panic(dberr)
			return
		}
		var name string

		rows.Next()
		dberr = rows.Scan(&name)
		if dberr != nil {
			log.Println(dberr)
		}
		visitorNames = append(visitorNames, name)
	}

	rows.Close()
	jsonFile, _ := json.Marshal(visitorNames)
	w.Write(jsonFile)
}

func getAllRoomByStationID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select name From bewohner Where station_id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(dberr)
		return
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

func getRoomIDByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["Name"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'Name' is missing")
		return
	}
	jsonFile, _ := json.Marshal(getRoom(keys[0]).Id)
	w.Write(jsonFile)
}

func deleteResident(w http.ResponseWriter, r *http.Request) {
	deleteID, errs := r.URL.Query()["residentID"]
	if !errs || len(deleteID[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'residentID' is missing")
		return
	}
	stmt, err := db.Prepare("delete from bewohner_hat_besucher where bewohner_id=?")
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	res, err := stmt.Exec(deleteID[0])
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	affect, err := res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	stmt, err = db.Prepare("delete from meeting where bewohner_id=?")
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	res, err = stmt.Exec(deleteID[0])
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	affect, err = res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	stmt, err = db.Prepare("delete from bewohner where id=?")
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	res, err = stmt.Exec(deleteID[0])
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err)
		return
	}
	affect, err = res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()
	com := "Ihr Bewohner wurde erfolgreich gelöscht"
	jsonFile, _ := json.Marshal(com)
	w.Write(jsonFile)
}
