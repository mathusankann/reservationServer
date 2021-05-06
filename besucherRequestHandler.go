package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func getVisitorByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(getVisitor(int(id)))
	w.Write(jsonFile)

}

func getVisitor(id int) Visitor {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From besucher Where id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var visitor Visitor
	rows.Next()
	dberr = rows.Scan(&visitor.ID, &visitor.Name, &visitor.Mail, &visitor.AccountID)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return visitor
}

func getAllResidentNamesByVisitorID(w http.ResponseWriter, r *http.Request) {
	var residentNames []string
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select 'name' From bewohner_hat_besucher Where besucher_id= %d", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var resident string
	for rows.Next() {
		dberr = rows.Scan(&resident)
		residentNames = append(residentNames, resident)
	}
	rows.Close()
	jsonFile, _ := json.Marshal(residentNames)
	w.Write(jsonFile)
}

func getVisitorbyname(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	visitor := getVistorByNamesorMail("name", keys[0])

	if !visitor.Verify() {
		http.Error(w, "Username not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(visitor)
	w.Write(jsonFile)

}

func getVistorByNamesorMail(attribute string, key string) Visitor {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From besucher Where %s= '%s'", attribute, key)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var visitor Visitor
	rows.Next()
	dberr = rows.Scan(&visitor.ID, &visitor.Name, &visitor.Mail, &visitor.AccountID)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return visitor
}

func addVisitorToResident(visitor int, resident int) {
	sqlStmt := fmt.Sprintf(`INSERT INTO bewohner_hat_besucher(bewohner_id,besucher_id)VALUES(?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(resident, visitor)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
}

func addNewVisitor(w http.ResponseWriter, r *http.Request) {
	keys, qerr := r.URL.Query()["ID"]
	if !qerr || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	print("starting Adding")
	var incvisitor Visitor
	err := json.NewDecoder(r.Body).Decode(&incvisitor)
	if err != nil {
		log.Println(err)
	}
	if !incvisitor.Verify() {
		http.Error(w, "faulty Visitor", http.StatusBadRequest)
		return
	}
	visitor := getVistorByNamesorMail("mail", incvisitor.Mail)
	if visitor.Verify() {
		addVisitorToResident(visitor.ID, int(id))
		w.Header().Set("Content-Type", "application/json")
		jsonFile, _ := json.Marshal(visitor)
		w.Write(jsonFile)
		return
	}

	sqlStmt := fmt.Sprintf(`INSERT INTO besucher(name,mail)VALUES(?,?)`)

	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incvisitor.Name, incvisitor.Mail)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	visitor = getVistorByNamesorMail("mail", incvisitor.Mail)

	addVisitorToResident(visitor.ID, int(id))
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(visitor)
	w.Write(jsonFile)

}
