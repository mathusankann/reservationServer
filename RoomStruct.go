package main

type Resident struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Join      string `json:"join"`
	Create    string `json:"create"`
	Invite    string `json:"invite"`
	StationId int    `json:"station_id"`
	AccountId int    `json:"account_id"`
}

func (r Resident) Verify() bool {
	check := (r.Name != "") && ((r.Join != "") || (r.Create != ""))
	return check
}

func (r *Resident) SetInvitationLink(invite string) {
	r.Invite = invite
}
