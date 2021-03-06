package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

/**
Get-Request
für alle Accounts
*/
func getAllAccounts(w http.ResponseWriter, r *http.Request) {
	var listNames []string
	queryStmt := fmt.Sprintf("Select username From account")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Datenbank nicht erreichbar", http.StatusNotFound)
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

/**
Get-Request
für alle Accounts mit dem übergebenen Namen
*/

func getAccountByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Name des Benutzers fehlt", http.StatusBadRequest)
		return
	}
	queryStmt := fmt.Sprintf("Select id From account Where username= '%s'", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		return
	}
	var accountId int
	if rows.Next() {
		dberr = rows.Scan(&accountId)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	rows.Close()
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(accountId)
	w.Write(jsonFile)
}

/**
Post-Request
für die Anmeldung und generierung des Anmeldungscookies
*/

func getUserAuthentication(w http.ResponseWriter, r *http.Request) {
	var incUser Account
	var dbUser Account
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}

	dbUser = getUser(incUser.Username)
	if !dbUser.Check() {
		http.Error(w, "Account nicht vorhanden", http.StatusBadRequest)
		return
	}

	if dbUser.ComparePasswords(incUser.Password) {
		expires := time.Now().AddDate(0, 0, 1)
		ck := http.Cookie{
			Name:    dbUser.Username,
			Path:    "/",
			Expires: expires,
		}

		// value of cookie
		ck.Value = String(25)
		UserMap[ck.Value] = dbUser.Username

		// write the cookie to response
		http.SetCookie(w, &ck)
		log.Println(len(UserMap))
		jsonFile, _ := json.Marshal(dbUser)
		w.Write(jsonFile)

	} else {
		http.Error(w, "Benutzername oder passwort inkorrect  ", http.StatusBadRequest)
		return
	}
}

/**
Get-Request
löschen von abgemeldeten Usern
*/
func removeAuthenticateUser(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["key"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "URl Parameter fehlt", http.StatusFailedDependency)
		log.Println("Url Param 'Key' is missing")
		return
	}
	user := UserMap[keys[0]]
	delete(UserMap, keys[0])
	log.Println(len(UserMap))
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(user)
	w.Write(jsonFile)
}

/**
Post-Request
Hinzufügen eines neuen Accounts
*/
func addUser(w http.ResponseWriter, r *http.Request) {
	var incUser Account
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}
	if getUser(incUser.Username).Check() {
		http.Error(w, "Benutzername ist bereits vergeben", http.StatusBadRequest)
		return
	}
	incUser.HashAndSalt([]byte(incUser.Password))
	//transaction
	//	db, err := sql.Open("sqlite3", "Account.sqlite")
	sqlStmt := fmt.Sprintf(`INSERT INTO account(username,password,role_id,station_id)VALUES(?,?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		http.Error(w, "Datenbank fehler", http.StatusNotFound)
	}
	_, err = statement.Exec(incUser.Username, incUser.Password, incUser.RoleId, incUser.StationID)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()
	var com string
	com = "Erfolgreich angelegt ✓"
	jsonFile, _ := json.Marshal(com)
	w.Write(jsonFile)
}

/**
get-Request
Cookie-Authentifizierung
*/
func getUserAuthenticationCookie(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["key"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt ⊗", http.StatusNotFound)
		log.Println("Url Param 'Key' is missing")
		return
	}
	var dbUser Account
	dbUser = getUser(UserMap[keys[0]])
	if !dbUser.Check() {
		http.Error(w, "Benutzer nicht gefunden ⊗", http.StatusNotFound)
		return
	}
	jsonFile, _ := json.Marshal(dbUser)
	w.Write(jsonFile)
}

/**
lokale Methode
Returned Account mit dem übergeben Usernamen
*/
func getUser(name string) Account {
	queryStmt := fmt.Sprintf("Select * From account Where username= '%s'", name)

	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var user2 Account
	var cache sql.NullInt32
	if rows.Next() {
		dberr = rows.Scan(&user2.ID, &user2.Username, &user2.Password, &user2.RoleId, &cache)
		if dberr != nil {
			log.Println(dberr)
		}
		user2.StationID = int(cache.Int32)
	}
	rows.Close()
	return user2
}

func getUserByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["id"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt ⊗", http.StatusNotFound)
		log.Println("Url Param 'Name' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)
	queryStmt := fmt.Sprintf("Select * From account Where id= '%d'", id)
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var account Account
	var cache sql.NullInt32
	if rows.Next() {
		dberr = rows.Scan(&account.ID, &account.Username, &account.Password, &account.RoleId, &cache)
		if dberr != nil {
			log.Println(dberr)
			http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
			return
		}
	}
	account.StationID = int(cache.Int32)
	rows.Close()
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(account)
	w.Write(jsonFile)
}

func updateAccount(w http.ResponseWriter, r *http.Request) {
	var incUser Account
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}
	if getUser(incUser.Username).Check() && getUser(incUser.Username).Password == incUser.Password {
		http.Error(w, "Benutzer ist bereits vergeben ⊗", http.StatusBadRequest)
		return
	}
	if getUser(incUser.Username).Password != incUser.Password {
		incUser.HashAndSalt([]byte(incUser.Password))
	}
	//transaction
	//	db, err := sql.Open("sqlite3", "Account.sqlite")
	sqlStmt := fmt.Sprintf(`UPDATE account Set username =?,password=? Where id=?`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	_, err = statement.Exec(incUser.Username, incUser.Password, incUser.ID)
	if err != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
		log.Panic(err.Error())
		return
	}
	statement.Close()
	w.Header().Set("Content-Type", "application/json")
	com := "Erfolgreich aktualisiert"
	jsonFile, _ := json.Marshal(com)
	w.Write(jsonFile)
}

func getAllRoles(w http.ResponseWriter, r *http.Request) {
	var rolesNames []string
	queryStmt := fmt.Sprintf("Select name From rolle ")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var role string
	for rows.Next() {
		rows.Scan(&role)
		rolesNames = append(rolesNames, role)
	}
	jsonFile, _ := json.Marshal(rolesNames)
	w.Write(jsonFile)
}

func getRoleByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Benutzer ist bereits vergeben ⊗", http.StatusBadRequest)
		log.Println("Url Param 'Name' is missing")
		return
	}
	print(keys[0])
	queryStmt := fmt.Sprintf("Select * From rolle Where name ='%s'", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var role Role
	if rows.Next() {
		dberr = rows.Scan(&role.ID, &role.Name, &role.ViewTermin, &role.EditUser, &role.ViewAllStationUser, &role.ViewAllUser)
		if dberr != nil {
			http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
			log.Println(dberr)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(role)
	w.Write(jsonFile)
}

func getRoleByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		http.Error(w, "Url Paramter fehlt ⊗", http.StatusNotFound)
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)

	queryStmt := fmt.Sprintf("Select * From rolle Where id =%d", id)

	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		http.Error(w, "Ein Datenbank fehler ist aufgetretten ⊗", http.StatusBadGateway)
		log.Panic(dberr)
		return
	}
	var role Role
	w.Header().Set("Content-Type", "application/json")
	if rows.Next() {
		dberr = rows.Scan(&role.ID, &role.Name, &role.ViewTermin, &role.EditUser, &role.ViewAllStationUser, &role.ViewAllUser)
		if dberr != nil {
			log.Println(dberr)
		}
	}
	jsonFile, _ := json.Marshal(role)
	w.Write(jsonFile)
}

var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

func StringWithCharset(length int, charset string) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func String(length int) string {
	return StringWithCharset(length, charset)
}
