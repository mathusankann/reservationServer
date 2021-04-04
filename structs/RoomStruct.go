package structs

type Room struct {
	Name   string `json:"name"`
	Roomid int    `json:"roomid"`
	Join   string `json:"join"`
	Create string `json:"create"`
	Invite string `json:"invite"`
}

func (r Room) Verify() bool {
	check := (r.Name != "") || (r.Join != "") || (r.Create != "") || (r.Roomid != 0)
	return check
}

func (r *Room) SetInvitationLink(invite string) {
	r.Invite = invite
}
