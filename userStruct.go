package main

import (
	"golang.org/x/crypto/bcrypt"
	"log"
)

type Account struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	RoleId   int    `json:"role_id"`
}

func (u *Account) HashAndSalt(pwd []byte) string {

	// Use GenerateFromPassword to hash & salt pwd
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
	if err != nil {
		log.Println(err)
	}
	// GenerateFromPassword returns a byte slice so we need to
	// convert the bytes to a string and return it
	u.Password = string(hash)
	return string(hash)
}
func (u Account) ComparePasswords(plainPwd string) bool {
	// Since we'll be getting the hashed password from the DB it
	// will be a string so we'll need to convert it to a byte slice
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(plainPwd))
	if err != nil {
		log.Println(err)
		return false
	}

	return true
}

func (u Account) Check() bool {
	return u.RoleId != 0 || u.Password != "" || u.Username != ""
}

type Role struct {
	ID                 int    `json:"id"`
	Name               string `json:"name"`
	ViewTermin         bool   `json:"viewTermin"`
	ViewAllUser        bool   `json:"viewAllUser"`
	ViewAllStationUser bool   `json:"viewAllStationUser"`
	EditUser           bool   `json:"editUser"`
}
