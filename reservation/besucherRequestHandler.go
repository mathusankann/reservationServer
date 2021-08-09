package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func getVisitorByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(getVisitor(int(id), "id"))
	w.Write(jsonFile)

}

func getVisitorByAccountID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["AccountID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(getVisitor(int(id), "account_id"))
	w.Write(jsonFile)
}

func getVisitor(id int, column string) Visitor {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From besucher Where %s= %d", column, id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var visitor Visitor
	var cache sql.NullInt32
	if rows.Next() {
		dberr = rows.Scan(&visitor.ID, &visitor.Name, &visitor.Mail, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
		visitor.AccountID = int(cache.Int32)
	}
	rows.Close()
	return visitor
}

func getVisitorbyname(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'Name' is missing")
		return
	}
	visitor := getVistorByNamesorMail("name", keys[0])

	if !visitor.Verify() {
		http.Error(w, "Benutzername nicht vorhanden", http.StatusNotFound)
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
	var cache sql.NullInt32
	if rows.Next() {
		dberr = rows.Scan(&visitor.ID, &visitor.Name, &visitor.Mail, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
		visitor.AccountID = int(cache.Int32)
	}
	rows.Close()
	return visitor
}
func getVisitorByMail(w http.ResponseWriter, r *http.Request) {
	var incVisitor Visitor
	err := json.NewDecoder(r.Body).Decode(&incVisitor)
	if err != nil {
		log.Println(err)
	}
	visitor := getVistorByNamesorMail("mail", incVisitor.Mail)
	if !visitor.Verify() {
		http.Error(w, "Besucher nicht vorhanden", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(visitor)
	w.Write(jsonFile)
}

func addVisitorToResident(visitor int, resident int) {
	sqlStmt := fmt.Sprintf(`INSERT INTO bewohner_hat_besucher(bewohner_id,besucher_id)VALUES(?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Panic(err.Error())
	}
	_, err = statement.Exec(resident, visitor)
	if err != nil {
		log.Panic(err.Error())
	}
	statement.Close()
}

func addNewVisitor(w http.ResponseWriter, r *http.Request) {
	keys, qerr := r.URL.Query()["ID"]
	if !qerr || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
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
		http.Error(w, "Besucher entspricht nicht den vorgaben", http.StatusBadRequest)
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
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	_, err = statement.Exec(incvisitor.Name, incvisitor.Mail)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	statement.Close()
	visitor = getVistorByNamesorMail("mail", incvisitor.Mail)

	addVisitorToResident(visitor.ID, int(id))
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(visitor)
	w.Write(jsonFile)

}

func registerVisitor(w http.ResponseWriter, r *http.Request) {
	var incVisitor Visitor
	err := json.NewDecoder(r.Body).Decode(&incVisitor)
	if err != nil {
		log.Println(err)
	}

	visitor := getVistorByNamesorMail("mail", incVisitor.Mail)
	if !visitor.Verify() {
		http.Error(w, "This Mail has no rights to make an account", http.StatusBadRequest)
		return
	}
	if visitor.AccountID == 0 {
		account := getUser(incVisitor.Name)
		sqlStmt := fmt.Sprintf("UPDATE besucher SET account_id = ? WHERE Id = ?")
		statement, err := db.Prepare(sqlStmt)
		if err != nil {
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			log.Panic(err.Error())
			return
		}
		_, err = statement.Exec(account.ID, visitor.ID)
		if err != nil {
			http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
			log.Panic(err.Error())
			return
		}
		statement.Close()
		w.Header().Set("Content-Type", "application/json")
		com := "Account wurde erfolgreich erstellt"
		jsonFile, _ := json.Marshal(com)
		w.Write(jsonFile)
	} else {
		http.Error(w, "Für diese Mail existiert bereits ein Account", http.StatusBadRequest)
		return
	}

}

func getAllResidentNamesByVisitorID(w http.ResponseWriter, r *http.Request) {
	var visitorNames []string
	var index []int
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	//id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select bewohner_id From bewohner_hat_besucher Where besucher_id=%s", keys[0])
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
		queryStmt := fmt.Sprintf("Select name From bewohner Where id= %d", index[i])
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
