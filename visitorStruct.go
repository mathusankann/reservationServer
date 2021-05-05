package main

type Visitor struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Mail      string `json:"mail"`
	AccountID int    `json:"account_id"`
}

func (v Visitor) Verify() bool {
	if v.Mail != "" && v.Name != "" {
		return true
	}
	return false
}

type ResidentHasVisitor struct {
	ID         int `json:"id"`
	BewohnerId int `json:"bewohner_id"`
	BesucherID int `json:"besucher_id"`
}
