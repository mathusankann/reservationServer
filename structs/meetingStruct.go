package structs

import (
	"time"
)

type Meeting struct {
	Id               int       `json:"id"`
	MeetingDateStart time.Time `json:"time_start"`
	MeetingDateEnd   time.Time `json:"time_end"`
	Roomid           int       `json:"roomid"`
	Reminder         int       `json:"reminder"`
	Mail             string    `json:"mail"`
}
