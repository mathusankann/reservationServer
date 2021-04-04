package structs

type Message struct {
	User string `json:"from"`
	To   string `json:"to"`
	Time string `json:"time"`
}
