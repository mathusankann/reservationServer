package main

type Betreuer struct {
	Id        int    `json:"id"`
	StationID int    `json:"station_id"`
	Name      string `json:"name"`
	AccountID int    `json:"account_id"`
}

func (r Betreuer) Verify() bool {
	check := (r.Name != "") && ((r.StationID != 0) || (r.Name != ""))
	return check
}
