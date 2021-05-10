package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

func getSharedSecret(w http.ResponseWriter, r *http.Request) {

}

func getAccountByName(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["name"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Name' is missing")
		return
	}
	queryStmt := fmt.Sprintf("Select id From account Where username= '%s'", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var accountId int
	rows.Next()

	dberr = rows.Scan(&accountId)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(accountId)
	w.Write(jsonFile)
}

func getUserAuthentication(w http.ResponseWriter, r *http.Request) {
	var incUser Account
	var dbUser Account
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}

	dbUser = getUser(incUser.Username)
	if !dbUser.Check() {
		http.Error(w, "Account does not exists", http.StatusBadRequest)
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
		userMap[ck.Value] = dbUser.Username

		// write the cookie to response
		http.SetCookie(w, &ck)
		jsonFile, _ := json.Marshal(dbUser)
		w.Write(jsonFile)
	} else {
		http.Error(w, "Username or password incorrect  ", http.StatusBadRequest)
		return
	}
}

func addUser(w http.ResponseWriter, r *http.Request) {
	var incUser Account
	err := json.NewDecoder(r.Body).Decode(&incUser)
	if err != nil {
		log.Println(err)
	}
	if getUser(incUser.Username).Check() {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}
	incUser.HashAndSalt([]byte(incUser.Password))
	//transaction
	//	db, err := sql.Open("sqlite3", "Account.sqlite")
	sqlStmt := fmt.Sprintf(`INSERT INTO account(username,password,role_id)VALUES(?,?,?)`)
	statement, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Fatalln(err.Error())
	}
	_, err = statement.Exec(incUser.Username, incUser.Password, incUser.RoleId)
	if err != nil {
		log.Fatalln(err.Error())
	}
	statement.Close()

	w.Write([]byte("ok"))
}

func getUserAuthenticationCookie(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["key"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'Key' is missing")
		return
	}
	var dbUser Account
	dbUser = getUser(userMap[keys[0]])
	if !dbUser.Check() {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	jsonFile, _ := json.Marshal(dbUser)
	w.Write(jsonFile)
}

func getUser(name string) Account {
	/*db, dberr := sql.Open("sqlite3", "Account.sqlite")
	if dberr != nil {
		log.Panic(dberr)
	}*/
	queryStmt := fmt.Sprintf("Select * From account Where username= '%s'", name)

	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var user2 Account
	rows.Next()
	dberr = rows.Scan(&user2.ID, &user2.Username, &user2.Password, &user2.RoleId)
	if dberr != nil {
		log.Println(dberr)
	}
	rows.Close()
	return user2
}

func getAllRoles(w http.ResponseWriter, r *http.Request) {
	var rolesNames []string
	queryStmt := fmt.Sprintf("Select name From rolle ")
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
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
		log.Println("Url Param 'Name' is missing")
		return
	}
	print(keys[0])
	queryStmt := fmt.Sprintf("Select * From rolle Where name ='%s'", keys[0])
	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var role Role
	rows.Next()
	dberr = rows.Scan(&role.ID, &role.Name, &role.ViewTermin, &role.EditUser, &role.ViewAllStationUser, &role.ViewAllUser)
	if dberr != nil {
		log.Println(dberr)
	}
	w.Header().Set("Content-Type", "application/json")
	jsonFile, _ := json.Marshal(role)
	w.Write(jsonFile)
}

func getRoleByID(w http.ResponseWriter, r *http.Request) {
	keys, err := r.URL.Query()["ID"]
	if !err || len(keys[0]) < 1 {
		log.Println("Url Param 'ID' is missing")
		return
	}
	id, _ := strconv.ParseInt(keys[0], 10, 32)

	queryStmt := fmt.Sprintf("Select * From rolle Where id =%d", id)

	rows, dberr := db.Query(queryStmt)
	if dberr != nil {
		log.Panic(dberr)
	}
	var role Role
	w.Header().Set("Content-Type", "application/json")
	rows.Next()
	dberr = rows.Scan(&role.ID, &role.Name, &role.ViewTermin, &role.EditUser, &role.ViewAllStationUser, &role.ViewAllUser)
	if dberr != nil {
		log.Println(dberr)
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
