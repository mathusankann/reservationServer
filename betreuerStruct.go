package main

import "database/sql"

type Betreuer struct {
	Id        int    `json:"id"`
	StationID int    `json:"station_id"`
	Name      string `json:"name"`
	AccountID int    `json:"account_id"`
}

type CacheBetreuer struct {
	Id        int           `json:"id"`
	StationID int           `json:"station_id"`
	Name      string        `json:"name"`
	AccountID sql.NullInt32 `json:"account_id"`
}

func (betreuer *Betreuer) Copy(cache CacheBetreuer) {
	betreuer.Id = cache.Id
	betreuer.StationID = cache.StationID
	betreuer.Name = cache.Name
	betreuer.AccountID = int(cache.AccountID.Int32)

}

func (betreuer Betreuer) Verify() bool {
	check := (betreuer.Name != "") && ((betreuer.StationID != 0) || (betreuer.Name != ""))
	return check
}
