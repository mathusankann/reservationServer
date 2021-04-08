const day = 86400000;
let reservedDates;
let currentMonday;
let currentSunday;

function getMonday() {
    return new Promise(((resolve, reject) => {
        let today = new Date()
        today = new Date(today - (7 - today.getDay()) * day)
        resolve(today)
    }))

}

function setCaption() {
    return new Promise(((resolve, reject) => {
        let monday = getMonday()
        monday.then((monday) => {
            currentMonday = monday
            let sunday = new Date()
            sunday.setDate(monday.getDate() + 6)
            currentSunday = sunday
            let captions = monday.toDateString() + " - " + sunday.toDateString()
            console.log(captions)
            document.getElementById("week").innerText = captions
        })
        resolve(true)
    }))
}

//await = wert  // aufrufende Methode muss asnyc
//promise = callback

function nextWeek() {
    currentMonday.setDate(currentMonday.getDate() - 7)
    currentSunday.setDate(currentSunday.getDate() - 7)
    document.getElementById("week").innerText = currentMonday.toDateString() + " - " + currentSunday.toDateString()
}

function prevWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7)
    currentSunday.setDate(currentSunday.getDate() + 7)
    document.getElementById("week").innerText = currentMonday.toDateString() + " - " + currentSunday.toDateString()

}

async function initTerminTable() {
    console.log("running")
    await setCaption()
    document.getElementById("prevWeek").addEventListener("click", nextWeek)
    document.getElementById("nextWeek").addEventListener("click", prevWeek)
    reservedDates = await getAllMeetings(currentMonday, currentSunday)
    console.log(reservedDates)
    let startTime = 8
    let endTime = 9
    const table = document.getElementById("terminTable")
    for (let i = 0; i < 13; i++) {
        let entry = document.createElement("tr")
        for (let j = 0; j < 9; j++) {
            let entities = document.createElement("th")
            entry.appendChild(entities)
            if (j === 0) {
                entities.className = "leftOuterTable"
            } else if (j === 8) {
                entities.className = "rightOuterTable"
            } else {
                entities.className = "innerTable"
                let text;
                if (startTime < 10) {
                    text = "0" + startTime + ":00 - "
                }
                if (endTime < 10) {
                    text = text + "0" + endTime + ":00"
                }
                if (startTime >= 10) {
                    text = startTime + ":00 - "
                }
                if (endTime >= 10) {
                    text = text + endTime + ":00"
                }
                entities.innerText = text
                entities.addEventListener("click", startReservation)
            }
        }
        table.appendChild(entry)
        startTime++
        endTime++
    }
}

function startReservation() {
    let text = this.innerText.split("-")
    let startTime = parseInt(text[0].split(":")[0])
    let endTime = parseInt(text[1].split(":")[0])
    let diff = this.cellIndex -1;
    let startDate = new Date()
    let endDate = new Date()
    startDate.setFullYear(currentMonday.getFullYear(),currentMonday.getMonth(),currentMonday.getDate()+diff)
    startDate.setHours(startTime,0,0,0)
    endDate.setFullYear(currentMonday.getFullYear(),currentMonday.getMonth(),currentMonday.getDate()+diff)
    endDate.setHours(endTime,0,0,0)
    addTermin(startDate,endDate)
}

function addTermin(startTime, endTime){
    startTime = startTime.toISOString()
    endTime = endTime.toISOString()
    let me = new Meeting()
    me.time_start = startTime
    console.log(me.time_start)
    me.time_end = endTime
    me.reminder=0
    me.roomid=1
    me.mail="mathusan13@live.de"
    sendMeetingPost(JSON.stringify(me))
}
