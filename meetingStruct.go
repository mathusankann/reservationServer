package main

import (
	"database/sql"
	"time"
)

type Meeting struct {
	Id               int       `json:"id"`
	MeetingDateStart time.Time `json:"time_start"`
	MeetingDateEnd   time.Time `json:"time_end"`
	BewohnerId       int       `json:"bewohner_id"`
	BesucherId       int       `json:"besucher_id"`
	TabletId         int       `json:"tablets_id"`
	TempMail         string    `json:"mail"`
}

type CacheMeeting struct {
	Id               int           `json:"id"`
	MeetingDateStart time.Time     `json:"time_start"`
	MeetingDateEnd   time.Time     `json:"time_end"`
	BewohnerId       int           `json:"bewohner_id"`
	BesucherId       sql.NullInt32 `json:"besucher_id"`
	TabletId         sql.NullInt32 `json:"tablets_id"`
}

func (meeting *Meeting) Copy(cache CacheMeeting) {
	meeting.Id = cache.Id
	meeting.BesucherId = int(cache.BesucherId.Int32)
	meeting.BewohnerId = cache.BewohnerId
	meeting.MeetingDateEnd = cache.MeetingDateEnd
	meeting.MeetingDateStart = cache.MeetingDateStart
	meeting.TabletId = int(cache.TabletId.Int32)
}
