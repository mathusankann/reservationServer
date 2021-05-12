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
		log.Println("Url Param 'Name' is missing")
		return
	}
	room2 := getRoom(keys[0])

	if !room2.Verify() {
		http.Error(w, "Username not found", http.StatusNotFound)
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

func GetRoomByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	room2 := getRoomByID(int(id))

	if !room2.Verify() {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(room2)
	w.Write(jsonFile)

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
		log.Panic(dberr)
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
		http.Error(w, "faulty Account", http.StatusBadRequest)
		return
	}
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select name From bewohner Where name= '%s'", croom.Name)
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

	sqlStmt := fmt.Sprintf(`INSERT INTO bewohner(name,station_id,inviteLink,createLink,joinLink,meetingRunningLink,room)VALUES(?,?,?,?,?,?,?)`)

	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(croom.Name, croom.StationId, croom.Join, croom.Create, croom.Invite, &croom.MeetingRunningLink, &croom.Room)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()

	w.Write([]byte("ok"))

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

func getAllVistorNamesByResidentID(w http.ResponseWriter, r *http.Request) {
	var visitorNames []string
	var index []int
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}

	//id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select besucher_id From bewohner_hat_besucher Where bewohner_id=%s", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
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
			log.Panic(dberr)
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
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select name From bewohner Where station_id= %d", getStationIDByAccountID(int(id)))
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

func getRoomIDByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["Name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	jsonFile, _ := json.Marshal(getRoom(keys[0]).Id)
	w.Write(jsonFile)
}

func deleteResident(w http.ResponseWriter, r *http.Request) {
	deleteID, errs := r.URL.Query()["residentID"]
	if !errs || len(deleteID[0]) < 1 {
		log.Println("Url Param 'residentID' is missing")
		return
	}
	stmt, err := db.Prepare("delete from bewohner_hat_besucher where bewohner_id=?")
	if err != nil {
		log.Panic(err)
	}
	res, err := stmt.Exec(deleteID[0])
	if err != nil {
		log.Panic(err)
	}
	affect, err := res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	stmt, err = db.Prepare("delete from meeting where bewohner_id=?")
	if err != nil {
		log.Panic(err)
	}
	res, err = stmt.Exec(deleteID[0])
	if err != nil {
		log.Panic(err)
	}
	affect, err = res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	stmt, err = db.Prepare("delete from bewohner where id=?")
	if err != nil {
		log.Panic(err)
	}
	res, err = stmt.Exec(deleteID[0])
	if err != nil {
		log.Panic(err)
	}
	affect, err = res.RowsAffected()
	fmt.Println(affect)
	stmt.Close()

	w.Write([]byte("Ihr Bewohner wurde erfolgreich stoniert"))
}

func getAllResidentNamesByVisitorID(w http.ResponseWriter, r *http.Request) {
	var visitorNames []string
	var index []int
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	//id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select bewohner_id From bewohner_hat_besucher Where besucher_id=%s", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var ind int

	for rows.Next() {
		dberr = rows.Scan(&ind)
		index = append(index, ind)
	}
	rows.Close()

	for i := 0; i < len(index); i++ {
		queryStmt := fmt.Sprintf("Select name From bewohner Where id= %d", index[i])
		rows, dberr := db.Query(queryStmt)
		if dberr != nil {
			log.Panic(dberr)
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
