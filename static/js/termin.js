const day = 86400000;
let reservedDates;
let currentMonday;
let currentSunday;
let currentWeeksMonday;

let startTerminUser;
let endTerminUser;


function initCurrentWeeksMonday() {
    return new Promise(((resolve, reject) => {
        currentWeeksMonday = new Date()
        currentWeeksMonday.setDate(currentWeeksMonday.getDate() - (currentWeeksMonday.getDay() - 1))
        resolve(currentWeeksMonday)
    }))
}

function getMonday() {
    return new Promise(((resolve, reject) => {
        let today = new Date()
        today.setDate(today.getDate() - (today.getDay() - 1))
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
            const table = document.getElementById("terminTable")
            for(let i = 0;i<13;i++){
                let entry = document.createElement("tr")
                entry.id = i.toString()
                for(let j = 0;j<9;j++){
                    let entities = document.createElement("th")
                    entities.id=i.toString()+"_"+j.toString()
                    entry.appendChild(entities)
                    if (j === 0) {
                        entities.className = "leftOuterTable"
                    } else if (j === 8) {
                        entities.className = "rightOuterTable"
                    }
                }
                table.appendChild(entry)
            }
        })
        resolve(true)
    }))
}

//await = wert  // aufrufende Methode muss asnyc
//promise = callback

async function prevWeeks() {
    let temp = new Date()
    temp.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() - 7)
    if (dates.compare(temp, currentWeeksMonday) > 0) {
        currentMonday.setDate(currentMonday.getDate() - 7)
        currentSunday.setDate(currentSunday.getDate() - 7)
        document.getElementById("week").innerText = currentMonday.toDateString() + " - " + currentSunday.toDateString()
      //  deleteNodes()
        await getAllMeetings(currentMonday, currentSunday)
       // setDates()
    }
}

async function nextWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7)
    currentSunday.setDate(currentSunday.getDate() + 7)
    document.getElementById("week").innerText = currentMonday.toDateString() + " - " + currentSunday.toDateString()
  //  deleteNodes()
    await getAllMeetings(currentMonday, currentSunday)
    //setDates()
}

async function initTerminTable() {
    console.log("running")
    await initCurrentWeeksMonday()
    await setCaption()
    document.getElementById("prevWeek").addEventListener("click", prevWeeks)
    document.getElementById("nextWeek").addEventListener("click", nextWeek)
    await getAllMeetings(currentMonday, currentSunday)

}

async function setDates() {
    let currenDate = new Date()
    currenDate.setSeconds(0, 0)
    let startTime = 8
    let endTime = 9
    const table = document.getElementById("terminTable")
    for (let i = 0; i < 13; i++) {
        //let entry = document.createElement("tr")
        for (let j = 0; j < 9; j++) {
           // let entities = document.createElement("th")
            //entry.appendChild(entities)
            let entities = document.getElementById(i.toString()+"_"+j.toString())
            if (j === 0) {
                entities.className = "leftOuterTable"
            } else if (j === 8) {
                entities.className = "rightOuterTable"
            } else {
                let temp = new Date()
                temp.setFullYear(currentMonday.getFullYear(),currentMonday.getMonth(),currentMonday.getDate()+j-1)
                temp.setMinutes(0, 0, 0)
                //if (j > currenDate.getDay()) {
                if (dates.compare(temp, currenDate) > 0) {
                    // console.log(temp)
                    temp.setHours(startTime)
                    let bol = await compareWithReservedDates(temp)
                    if(bol){
                        entities.className = "expired"
                        entities.innerText = "Reserviert"
                        //entities.addEventListener("click", startReservation)
                    }else {
                        entities.className = "innerTable"
                        entities.innerText = generateCell(startTime, endTime)
                        entities.addEventListener("click", startReservation)
                    }
                } else if (j === currenDate.getDay()) {
                    if (startTime > currenDate.getHours()) {
                        temp.setHours(startTime)
                        let bol = await compareWithReservedDates(temp)
                        if(bol){
                            entities.className = "expired"
                            entities.innerText = "Reserviert"
                        }else{
                            entities.className = "innerTable"
                            entities.innerText = generateCell(startTime, endTime)
                            entities.addEventListener("click", startReservation)
                        }
                    }
                    else {
                        entities.innerText = "Abgelaufen"
                        entities.className = "expired"
                    }
                } else {
                    entities.innerText = "Abgelaufen"
                    entities.className = "expired"
                }
            }
        }
       // table.appendChild(entry)
        startTime++
        endTime++
    }
    const dropdown = document.getElementById("wuser")
    for(let i =0;i<rooms.length; i++){
        let option= document.createElement("option")
        option.value=i+1
        option.innerText=rooms[i]
        dropdown.appendChild(option)
    }

}


function startReservation() {
    document.getElementById('formReservation').style.display='block'
    let text = this.innerText.split("-")
    let startTime = parseInt(text[0].split(":")[0])
    let endTime = parseInt(text[1].split(":")[0])

    let diff = this.cellIndex - 1;
    let startDate = new Date()
    let endDate = new Date()
    startDate.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + diff)
    startDate.setHours(startTime, 0, 0, 0)

    endDate.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + diff)
    endDate.setHours(endTime, 0, 0, 0)
    startTerminUser = startDate;
    endTerminUser =endDate;
   // addTermin(startDate, endDate)
}

function addTermin() {
    let mail = document.getElementById("umail").value
    let userId = document.getElementById("wuser").value
    let checked = document.getElementById("reminder").checked
    console.log(userId + mail)
    startTerminUser = startTerminUser.toISOString()
    endTerminUser = endTerminUser.toISOString()
    let me = new Meeting()
    me.time_start = startTerminUser
    console.log(me.time_start)
    me.time_end = endTerminUser
    if(checked){
        me.reminder = 1
    }else{
        me.reminder = 0
    }

    me.roomid = parseInt(userId)
    me.mail = mail
    console.log(me.reminder)
    sendMeetingPost(JSON.stringify(me))
}


function getAllMeetings(starttime, endtime) {
    starttime.setHours(0,0,0)
    console.log(starttime)
    starttime = starttime.toISOString()
    endtime.setDate(endtime.getDate()+1)
    endtime = endtime.toISOString()
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                return new Promise(((resolve, reject) => {
                    reservedDates = JSON.parse(this.responseText)
                    console.log(reservedDates)
                    setTimeout(setDates, 100);
                    resolve(reservedDates)
                }))
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "http://"+path+"/getAllMeetings?starttime=" + starttime + "&endtime=" + endtime, true);
    request.send();
}

function generateCell(startTime, endTime) {
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
    return text
}

function deleteNodes() {
    document.querySelectorAll('.innerTable').forEach(e => e.remove());
    document.querySelectorAll('.leftOuterTable').forEach(e => e.remove());
    document.querySelectorAll('.rightOuterTable').forEach(e => e.remove());
    document.querySelectorAll('.expired').forEach(e => e.remove());
}

let dates = {
    convert: function (d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                    d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                            typeof d === "object" ? new Date(d.year, d.month, d.date) :
                                NaN
        );
    },
    compare: function (a, b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).

        return (
            isFinite(a = this.convert(a).valueOf()) &&
            isFinite(b = this.convert(b).valueOf()) ?
                (a > b) - (a < b) :
                NaN
        );
    },
    inRange: function (d, start, end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(d = this.convert(d).valueOf()) &&
            isFinite(start = this.convert(start).valueOf()) &&
            isFinite(end = this.convert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
        );
    }
}


function compareWithReservedDates(b) {
    return new Promise(((resolve, reject) => {
        if (reservedDates!=null){
            for (let i = 0; i < reservedDates.length; i++) {
                let reserved = new Date(Date.parse(reservedDates[i].time_start))

              //  reserved.setHours(reserved.getHours())

                if (dates.compare(reserved, b) === 0) {
                    resolve(true)
                }
            }
            resolve(false)
        }
        else {
            resolve(false)
        }
    }))

}

function testReservered() {
    if (reservedDates!=null){
        for(let i =0;i<reservedDates.length;i++){
            console.log(new Date(Date.parse(reservedDates[i].time_start)))
        }

    }

}