

const day = 86400000;
let reservedDates;
let currentMonday;
let currentSunday;
let currentWeeksMonday;
let flagAddVisitor

let disableDays
let disableTimes = []
let MAX_TABLETS

let startTerminUser;
let endTerminUser;
const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
let week;
let timeOut = []
let tablets;
let weekday = new Array(7);
let oldMark = null
let account;
let user
let userRights;
weekday[0] = "Montag";
weekday[1] = "Dienstag";
weekday[2] = "Mittwoch";
weekday[3] = "Donnerstag";
weekday[4] = "Freitag";
weekday[5] = "Samstag";
weekday[6] = "Sonntag";

let weekdayEN = new Array(7);
weekdayEN[0] = "monday";
weekdayEN[1] = "tuesday";
weekdayEN[2] = "wednesday";
weekdayEN[3] = "thursday";
weekdayEN[4] = "friday";
weekdayEN[5] = "saturday";
weekdayEN[6] = "sunday";


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
            document.getElementById("week").innerText = monday.toLocaleDateString('de-DE', options) + " - " + sunday.toLocaleDateString('de-DE', options)
            let button = document.createElement("img")
            button.id = "timeTableSettings"
            button.src = "media/img/settings.png"
            button.onclick = setTimeTableSettingInterface
            document.getElementById("week").appendChild(button)
            const table = document.getElementById("terminTable")
            for (let i = 0; i < 13; i++) {
                let entry = document.createElement("tr")
                entry.id = i.toString()
                for (let j = 0; j < 9; j++) {
                    let entities = document.createElement("th")
                    entities.id = i.toString() + "_" + j.toString()
                    entry.appendChild(entities)
                    if (j === 0) {
                        // entities.className = "leftOuterTable"
                    } else if (j === 8) {
                        // entities.className = "rightOuterTable"
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
        document.getElementById("week").innerText = currentMonday.toLocaleDateString('de-DE', options) + " - " + currentSunday.toLocaleDateString('de-DE', options)
        let button = document.createElement("img")
        button.id = "timeTableSettings"
        button.src = "media/img/settings.png"
        button.onclick = setTimeTableSettingInterface
        document.getElementById("week").appendChild(button)
        if (oldMark !== null) {
            oldMark.innerText = ""
        }
        if(document.getElementById("terminOverview")!==null){
            document.getElementById("terminOverview").innerText = ""
        }

        //  deleteNodes()
        await getAllMeetings(currentMonday, currentSunday)
        // setDates()
    }
}

async function nextWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7)
    currentSunday.setDate(currentSunday.getDate() + 7)
    document.getElementById("week").innerText = currentMonday.toLocaleDateString('de-DE', options) + " - " + currentSunday.toLocaleDateString('de-DE', options)
    let button = document.createElement("img")
    button.id = "timeTableSettings"
    button.src = "media/img/settings.png"
    button.onclick = setTimeTableSettingInterface
    document.getElementById("week").appendChild(button)
    if (oldMark !== null) {
        oldMark.innerText = ""
    }
    document.getElementById("terminOverview").innerText = ""

    //  deleteNodes()
    await getAllMeetings(currentMonday, currentSunday)


    //setDates()
}

async function initTerminTable(debug=false) {
    if(document.getElementById('id01')!==null){
        document.getElementById('id01').style.display = 'block'
    }
    document.getElementById("prevWeek").addEventListener("click", prevWeeks)
    document.getElementById("nextWeek").addEventListener("click", nextWeek)
    for (let i = 0; i < 7; i++) {
        if (weekday[i].length < 10) {
            //console.log(weekday[i].length)
            let weekdayLength = weekday[i].length
            let counter = 0
            let half = (10 - weekdayLength) / 2
            if (i == 4) {
                half = half + 1
            }
            let appendString = ""
            for (let j = 0; j < half; j++) {
                appendString = appendString + "\u00A0"
            }
            document.getElementById(weekdayEN[i]).innerText = appendString + weekday[i] + appendString
        }
    }

    await initCurrentWeeksMonday()
    await setCaption()
    MAX_TABLETS = await getter("/getAllTabletsByMaintenance")
    disableDays = await getter("/getDayOuts")
    disableTimes = await getter("/getTimeOut")
    account = await getter("/getUserAuthenticationCookie?key=" + document.cookie.split('=')[1])
    userRights = await getter("/getRoleByID?ID=" + account.role_id)
    if (!userRights.viewAllUser && !userRights.viewAllStationUser) {
        user = await getter("/getVisitorByAccountID?AccountID=" + account.id)
    }
    await getAllMeetings(currentMonday, currentSunday)

}

function setDates(debug =false) {
    let currenDate = new Date()
    currenDate.setSeconds(0, 0)
    let startTime = 8
    let endTime = 9
    const table = document.getElementById("terminTable")
    // table.style.visibility="hidden"
    deleteAllEventListener()
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 9; j++) {
            let entities = document.getElementById(i.toString() + "_" + j.toString())
            if (j === 0) {
                //entities.className = "leftOuterTable"
                entities.innerText = generateCell(startTime, endTime)
            } else if (j === 8) {
                //entities.className = "rightOuterTable"
                entities.innerText = generateCell(startTime, endTime)
            } else {
                if (disableDays[j - 1].value) {
                    entities.className = "expired"
                    //entities.innerText = "Reserviert"
                } else {
                    let temp = new Date()
                    temp.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + j - 1)
                    temp.setMinutes(0, 0, 0)
                    //if (j > currenDate.getDay()) {
                    if (dates.compare(temp, currenDate) > 0) {
                        temp.setHours(startTime)
                        compareWithReservedDates(temp, startTime, endTime).then((bol) => {
                            if (bol[0]) {
                                if (bol[3]) {
                                    entities.className = "expired"
                                } else {
                                    entities.className = "reserving"
                                    entities.value = generateCell(bol[1], bol[2])
                                    entities.addEventListener("click", generateDependingOnScreen)
                                }
                                // entities.innerText = bol[3]
                                // entities.innerText = "Reserviert"
                                //entities.addEventListener("click", startReservation)
                            } else {
                                entities.className = "innerTable"
                                entities.value = generateCell(bol[1], bol[2])
                                // entities.innerText = generateCell(bol[1], bol[2])
                                //entities.innerText = generateCell(bol[1], bol[2])
                                entities.addEventListener("click", generateDependingOnScreen)
                            }
                        })
                    } else if (j === currenDate.getDay()) {
                        temp.setHours(startTime)
                        compareWithReservedDates(temp, startTime, endTime).then((bol) => {
                            if (bol[1] > currenDate.getHours()) {
                                temp.setHours(bol[1])
                                if (bol[0]) {
                                    if (bol[3]) {
                                        entities.className = "expired"
                                    } else {
                                        entities.className = "reserving"
                                        entities.value = generateCell(bol[1], bol[2])
                                        entities.addEventListener("click", generateDependingOnScreen)
                                    }
                                } else {
                                    entities.className = "innerTable"
                                    // entities.innerText = generateCell(bol[1], bol[2])
                                    //   entities.innerText = "Frei"
                                    entities.value = generateCell(bol[1], bol[2])
                                    entities.addEventListener("click", generateDependingOnScreen)
                                }
                            } else {
                                // entities.innerText = "Abgelaufen"
                                entities.className = "expired"
                            }

                        })
                    } else {
                        //  entities.innerText = "Abgelaufen"
                        entities.className = "expired"
                    }
                }
            }
        }
        startTime++
        endTime++
    }

}


function containsTime(start, end, disableTimes) {
    for (let i = 0; i < disableTimes.length; i++) {
        if (start >= disableTimes[i].start && end <= disableTimes[i].end) {
            return true
        }
    }
    return false

}


async function addTermin() {
    if (document.getElementById("wuser").value !== "") {
        let userId = document.getElementById("wuser").value
        startTerminUser = startTerminUser.toISOString()
        endTerminUser = endTerminUser.toISOString()
        let me = new Meeting()
        me.time_start = startTerminUser
        me.time_end = endTerminUser
        me.bewohner_id = await getRoomIDBYName(userId)
        if (flagAddVisitor) {
            console.log(userId)
            let name = document.getElementById("nameVisitor").value
            let mail = document.getElementById("mailVisitor").value
            if (mail !== "" && name !== "") {
                addNewVisitor(name, mail, me.bewohner_id).then((res) => {
                    me.besucher_id = res.id
                    sendMeetingPost(JSON.stringify(me))
                })
            }
        } else {
            let visitor = document.getElementById("visitor").value
            if (visitor !== "") {
                getVisitorByName(visitor).then((res) => {
                    console.log(res)
                    me.besucher_id = res.id
                    sendMeetingPost(JSON.stringify(me))
                })
            }

        }
    }

}


function getAllMeetings(starttime, endtime,debug=false) {
    let tempStart = new Date();
    tempStart.setFullYear(starttime.getFullYear(), starttime.getMonth(), starttime.getDate() - 1)
    tempStart.setHours(tempStart.getHours() + 2)
    // console.log(formatDate(tempStart))
    // tempStart = tempStart.toLocaleDateString()
    let tempEnd = new Date();
    tempEnd.setFullYear(endtime.getFullYear(), endtime.getMonth(), endtime.getDate())
    tempEnd.setHours(tempEnd.getHours() + 2)
    tempEnd.setHours(25, 59, 0, 0)
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                return new Promise(((resolve, reject) => {
                    reservedDates = JSON.parse(this.responseText)
                    setDates()
                    resolve(reservedDates)
                }))
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getAllMeetings?starttime=" + formatDate(tempStart) + "&endtime=" + formatDate(tempEnd), true);
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

function deleteAllEventListener() {
    for (let i = 0; i < 13; i++) {
        //let entry = document.createElement("tr")
        for (let j = 0; j < 9; j++) {
            // let entities = document.createElement("th")
            //entry.appendChild(entities)
            let entities = document.getElementById(i.toString() + "_" + j.toString())
            entities.removeEventListener("click", generateDependingOnScreen)
        }
    }
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


function compareWithReservedDates(b, tempStart, tempEnd) {
    let counter = 0;
    return new Promise(((resolve, reject) => {
        if (containsTime(tempStart, tempEnd, disableTimes)) {
            resolve([true, tempStart, tempEnd, true])
        }
        if (reservedDates != null) {
            for (let i = 0; i < reservedDates.length; i++) {
                let reserved = new Date(Date.parse(reservedDates[i].time_start))
                //  reserved.setHours(reserved.getHours())
                if (dates.compare(reserved, b) === 0) {
                    counter++
                    if (MAX_TABLETS !== null) {
                        if (counter >= MAX_TABLETS.length) {
                            resolve([true, tempStart, tempEnd, false])
                        }
                    } else {
                        resolve([true, tempStart, tempEnd, true])
                    }
                }
            }
            resolve([false, tempStart, tempEnd, false])
        } else {
            resolve([false, tempStart, tempEnd, false])
        }
    }))

}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function generateDependingOnScreen() {
    const form = document.getElementById("test")
    if (form!==null){
        form.innerText = ""
        const terminOverview = document.getElementById("terminOverview")
        terminOverview.innerText = ""
        flagAddVisitor = false
        this.innerText = "X"
        if (oldMark !== null) {
            if (oldMark.id === this.id) {
                this.innerText = ""
                oldMark = null
            } else {
                oldMark.innerText = ""
                oldMark = this
            }
        } else {
            oldMark = this
        }
        let text = this.value.split("-")

        let startTime = parseInt(text[0].split(":")[0])
        let endTime = parseInt(text[1].split(":")[0])

        let diff = parseInt(this.id.split("_")[1]) - 1;

        let startDate = new Date()
        let endDate = new Date()
        startDate.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + diff)
        startDate.setHours(startTime, 0, 0, 0)

        endDate.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + diff)
        endDate.setHours(endTime, 0, 0, 0)
        startTerminUser = startDate;
        endTerminUser = endDate;
        //console.log(this.value)
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        //console.log(width)
        let booked = 0
        if (width < 1500) {
            if (reservedDates !== null) {
                for (let i = 0; i < reservedDates.length; i++) {
                    if (dates.compare(startDate, reservedDates[i].time_start) === 0) {
                        booked++
                    }
                }
                if (booked < MAX_TABLETS.length) {
                    generateInputInterfaceAddTermin(this)
                }
            } else {
                generateInputInterfaceAddTermin(this)
            }
            // console.log(this)
        } else {
            generateInputInterfaceAddMeetingDesktop(this, startTime)
        }
    }

}

async function generateInputInterfaceAddMeetingDesktop(div, startTime) {
    let booked = 0
    const terminOverview = document.getElementById("terminOverview")
    let terminLabel = document.createElement("label")
    let diff = parseInt(div.id.split("_")[1]) - 1;
    let startDate = new Date()
    startDate.setFullYear(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + diff)
    startDate.setHours(startTime, 0, 0, 0)
    terminLabel.innerText = "\nReservierung für den: " + startDate.toLocaleDateString() + " " + startDate.toLocaleTimeString() + "\n"
    terminLabel.className = "caption"
    terminOverview.appendChild(terminLabel)
    //Reserved
    let reservedCaptionFlag = false
    if (reservedDates !== null) {
        for (let i = 0; i < reservedDates.length; i++) {
            if (dates.compare(startDate, reservedDates[i].time_start) === 0) {
                if (!reservedCaptionFlag) {
                    terminLabel = document.createElement("label")
                    terminLabel.innerText = "\nReserviert\n"
                    terminLabel.className = "labelsReserving"
                    terminOverview.appendChild(terminLabel)
                    reservedCaptionFlag = true
                }
                // console.log(reservedDates[i])
                let div = document.createElement("div")
                div.className = "reservingContainer"
                if (userRights.viewAllUser || userRights.viewAllStationUser || reservedDates[i].besucher_id === user.id) {
                    let residentLabel = document.createElement("label")
                    let resident = await getter("/getRoomByID?ID=" + reservedDates[i].bewohner_id)
                    // console.log(resident)
                    residentLabel.innerText = "Bewohner: " + resident.name + "\n"
                    let roomLabel = document.createElement("label")
                    roomLabel.innerText = "Raum: 404\n"
                    let visitorLabel = document.createElement("label")
                    let visitor = await getter("/getVisitorByID?ID=" + reservedDates[i].besucher_id)
                    let mailLabel = document.createElement("label")
                    mailLabel.innerText = "Mail: " + visitor.mail
                    visitorLabel.innerText = "Besucher: " + visitor.name + "\n"
                    div.appendChild(residentLabel)
                    div.appendChild(roomLabel)
                    div.appendChild(visitorLabel)
                    div.appendChild(mailLabel)
                    terminOverview.appendChild(div)
                }
                booked++
            }
        }
    }
    if (booked < MAX_TABLETS.length) {
        let div = document.createElement("div")
        div.className = "reservingContainer"
        terminLabel = document.createElement("label")
        terminLabel.innerText = "\nReservierung\n"
        terminLabel.className = "labelsReserving"
        terminOverview.appendChild(terminLabel)
        let residentLabel = document.createElement("label")
        residentLabel.innerText = "Bewohner"
        residentLabel.htmlFor = "resident"
        let dropdown = document.createElement("select")
        dropdown.name = "resident"
        dropdown.id = "wuser"
        if (userRights.viewAllUser || userRights.viewAllStationUser) {
            if (rooms != null) {
                for (let i = 0; i < rooms.length; i++) {
                    let option = document.createElement("option")
                    option.value = rooms[i]
                    option.innerText = rooms[i]
                    option.addEventListener("click", getVisitors)
                    dropdown.appendChild(option)
                    if (i === 0) {
                        option.click()
                    }
                }
                div.appendChild(residentLabel)
                div.appendChild(dropdown)
                dropdown = document.createElement("select")
                dropdown.id = "visitor"
                let dropdownLabel = document.createElement("label")
                dropdownLabel.htmlFor = "visitor"
                dropdownLabel.innerText = "Besucher"
                div.appendChild(dropdownLabel)
                div.appendChild(dropdown)
                let sendButton = document.createElement("button")
                sendButton.type = "button"
                sendButton.innerText = "Abschicken"
                sendButton.id = "sendButton"
                sendButton.addEventListener("click", addTermin)
                div.appendChild(sendButton)
                terminOverview.appendChild(div)
            }
        } else {
            lowerUserInterface(terminOverview,div)
        }

    }

    //reserving

}


async function lowerUserInterface(terminOverview, div) {
    let dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "visitor"
    dropdownLabel.innerText = "Besucher"
    let dropdown = document.createElement("select")
    dropdown.id = "visitor"
    let option = document.createElement("option")
    option.value = user.name
    option.innerText = user.name
    // option.addEventListener("click", getVisitors)
    dropdown.appendChild(option)
    //option.click()
    div.appendChild(dropdownLabel)
    div.appendChild(dropdown)
    let listOfResidents = await getter("/getAllResidentNamesByVisitorID?ID=" + user.id)
    dropdownLabel = document.createElement("label")
    dropdownLabel.innerText = "Bewohner"
    dropdownLabel.htmlFor = "resident"
    dropdown = document.createElement("select")
    dropdown.name = "resident"
    dropdown.id = "wuser"
    for (let i = 0; i < listOfResidents.length; i++) {
        let option = document.createElement("option")
        option.value = listOfResidents[i]
        option.innerText = listOfResidents[i]
        dropdown.appendChild(option)
    }
    div.appendChild(dropdownLabel)
    div.appendChild(dropdown)

    let sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.innerText = "Abschicken"
    sendButton.id = "sendButton"
    sendButton.addEventListener("click", addTermin)
    div.appendChild(sendButton)
    terminOverview.appendChild(div)

}

async function generateInputInterfaceAddTermin(div) {
    const form = document.getElementById("test")
    let dropdownLabel = document.createElement("label")
    if (userRights.viewAllUser || userRights.viewAllStationUser) {
        dropdownLabel.htmlFor = "wuser"
        dropdownLabel.innerText = "Bewohner"
        dropdownLabel.className = "labels"
        let dropdown = document.createElement("select")
        dropdown.name = "Bewohner"
        dropdown.id = "wuser"
        if (rooms != null) {
            for (let i = 0; i < rooms.length; i++) {
                let option = document.createElement("option")
                option.value = rooms[i]
                option.innerText = rooms[i]
                option.addEventListener("click", getVisitors)
                dropdown.appendChild(option)
                if (i === 0) {
                    option.click()
                }
            }
        }
        form.appendChild(dropdownLabel)
        form.appendChild(dropdown)
        dropdown = document.createElement("select")
        dropdown.id = "visitor"
        dropdown.name = "Besucher"
        dropdown.style.width = "90%"
        dropdownLabel = document.createElement("label")
        dropdownLabel.className = "labels"
        dropdownLabel.htmlFor = "visitor"
        dropdownLabel.innerText = "Besucher"
        let addNewVisitorButton = document.createElement("button")
        let vContainer = document.createElement("div")
        addNewVisitorButton.innerText = "+"
        addNewVisitorButton.id = "addVisitor"
        addNewVisitorButton.type = "button"
        addNewVisitorButton.onclick = setVisitor
        vContainer.id = "vContainer"
        vContainer.appendChild(dropdown)
        vContainer.appendChild(addNewVisitorButton)
        form.appendChild(dropdownLabel)
        form.appendChild(vContainer)
    } else {
        dropdownLabel.className = "labels"
        dropdownLabel.htmlFor = "visitor"
        dropdownLabel.innerText = "Besucher"
        let dropdown = document.createElement("select")
        dropdown.name = "visitor"
        dropdown.id = "visitor"
        let option = document.createElement("option")
        option.value = user.name
        option.innerText = user.name
        // option.addEventListener("click", getVisitors)
        dropdown.appendChild(option)
        form.appendChild(dropdownLabel)
        form.appendChild(dropdown)

        let listOfResidents = await getter("/getAllResidentNamesByVisitorID?ID=" + user.id)
        dropdownLabel = document.createElement("label")
        dropdownLabel.innerText = "Bewohner"
        dropdownLabel.htmlFor = "resident"
        dropdownLabel.className = "labels"
        dropdown = document.createElement("select")
        dropdown.name = "resident"
        dropdown.id = "wuser"
        for (let i = 0; i < listOfResidents.length; i++) {
            let option = document.createElement("option")
            option.value = listOfResidents[i]
            option.innerText = listOfResidents[i]
            dropdown.appendChild(option)
        }
        form.appendChild(dropdownLabel)
        form.appendChild(dropdown)
    }
    let sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.innerText = "Abschicken"
    sendButton.id = "sendButton"
    sendButton.addEventListener("click", addTermin)
    form.appendChild(sendButton)
    document.getElementById('formReservation').style.display = 'block'
}


async function getVisitors() {
    let id = await getRoomIDBYName(this.value)
    await getAllVistorNamesByResidentID(id, false)
}

function setVisitor() {
    flagAddVisitor = true
    const form = document.getElementById("test")
    document.getElementById("formReservation").style.display = "none"
    const labels = document.getElementsByClassName("labels")
    document.getElementById("visitor").style.display = 'none'
    document.getElementById("addVisitor").style.display = 'none'
    document.getElementById("sendButton").remove()
    console.log(document.getElementById("wuser"))

    let nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Name"
    nameInput.id = "nameVisitor"
    let mailInput = document.createElement("input")
    mailInput.type = "text"
    mailInput.placeholder = "Mail"
    mailInput.id = "mailVisitor"
    form.appendChild(nameInput)
    form.appendChild(mailInput)

    let sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.innerText = "Abschicken"
    sendButton.id = "sendButton"
    sendButton.addEventListener("click", addTermin)
    form.appendChild(sendButton)
    document.getElementById("formReservation").style.display = "block"
    //labels[0].innerHTML="test"

}

async function setTimeTableSettingInterface() {
    //Daysettings
    const form = document.getElementById("test")
    form.innerText = ""
    let label = document.createElement("label")
    label.innerText = "Tage"
    label.className = "labels"
    form.appendChild(label)
    let tContainer = document.createElement("div")
    tContainer.id = "tContainer"
    week = await getter("/getDayOuts")

    for (let i = 0; i < 7; i++) {
        let label = document.createElement("label")
        label.innerText = weekday[i]
        label.className = "weekInput"
        label.htmlFor = weekday[i]
        let button = document.createElement("input")
        button.type = "checkbox"
        button.id = weekday[i]
        button.value = weekday[i]
        button.style.display = "none"
        if (week[i].value) {
            button.checked = true
        }
        tContainer.appendChild(button)
        tContainer.appendChild(label)

    }
    form.appendChild(tContainer)
    form.appendChild(document.createElement("br"))
    //Timesettings
    let zContainer = document.createElement("div")
    zContainer.id = "zContainer"
    label = document.createElement("label")
    label.innerText = "Zeit"
    label.className = "labels"
    form.appendChild(label)
    timeOut = await getter("/getTimeOut")
    if (timeOut != null) {
        let div = document.createElement("div")
        for (let i = 0; i < timeOut.length; i++) {
            let tabletLabel = document.createElement("label")
            tabletLabel.innerText = generateCell(timeOut[i].start, timeOut[i].end)
            tabletLabel.htmlFor = generateCell(timeOut[i].start, timeOut[i].end)
            let button = document.createElement("input")
            button.type = "checkbox"
            button.id = generateCell(timeOut[i].start, timeOut[i].end)
            button.style.display = "none"
            tabletLabel.className = "weekInput"
            div.appendChild(button)
            div.appendChild(tabletLabel)
        }
        form.appendChild(div)
        form.appendChild(document.createElement("br"))
    }

    let dropdown = document.createElement("select")
    dropdown.id = "startTime"
    dropdown.className = "time"
    let startTime = 8
    let endTime = 9
    dropdown.appendChild(document.createElement("option"))
    for (let i = 0; i < 13; i++) {
        let option = document.createElement("option")
        option.innerText = generateCell(startTime, endTime).split("-")[0]
        option.value = startTime.toString()
        dropdown.appendChild(option)
        startTime++
    }
    zContainer.appendChild(dropdown)
    let something = document.createElement("label")
    something.innerText = "   -   "
    something.id = "something"
    zContainer.appendChild(something)
    dropdown = document.createElement("select")
    dropdown.id = "endTime"
    dropdown.appendChild(document.createElement("option"))
    startTime = 8
    for (let i = 0; i < 13; i++) {
        let option = document.createElement("option")
        option.innerText = generateCell(startTime, endTime).split("-")[1]
        option.value = endTime.toString()
        dropdown.appendChild(option)
        endTime++
    }
    dropdown.className = "time"
    zContainer.appendChild(dropdown)
    let button = document.createElement("button")
    button.id = "deactivate"
    button.type = "button"
    button.innerText = "Hinzufügen"
    button.onclick = addTimeOut
    button.className = "timeTableSettingButtons"
    zContainer.appendChild(button)

    form.appendChild(zContainer)
    form.appendChild(document.createElement("br"))
    //Tabletsettings
    label = document.createElement("label")
    label.innerText = "Tabletts"
    label.className = "labels"
    label.style.clear = "both"
    form.appendChild(label)
    let taContainer = document.createElement("div")
    taContainer.id = "taContainer"
    tablets = await getter("/getAllTablets")
    if (tablets != null) {
        let div = document.createElement("div")
        for (let i = 0; i < tablets.length; i++) {
            let tabletLabel = document.createElement("label")
            tabletLabel.innerText = tablets[i].name
            tabletLabel.htmlFor = tablets[i].name + "_" + tablets[i].id
            let button = document.createElement("input")
            button.type = "checkbox"
            button.id = tablets[i].name + "_" + tablets[i].id
            button.style.display = "none"
            tabletLabel.className = "weekInput"
            if (tablets[i].maintenance) {
                button.checked = true
            }
            div.appendChild(button)
            div.appendChild(tabletLabel)
        }
        form.appendChild(div)
    }
    let tabletAddDiv = document.createElement("div")
    tabletAddDiv.id = "tabletAddDiv"
    let tabletInput = document.createElement("input")
    tabletInput.type = "text"
    tabletInput.placeholder = "Tabletname"
    tabletInput.id = "tabletInput"
    tabletAddDiv.appendChild(tabletInput)
    button = document.createElement("button")
    button.innerText = "Hinzufügen"
    button.id = "addNewTablet"
    button.className = "timeTableSettingButtons"
    button.type = "button"
    button.onclick = addTablet

    tabletAddDiv.appendChild(button)
    form.appendChild(tabletAddDiv)

    button = document.createElement("button")
    button.innerText = "Speichern"
    button.type = "button"
    button.onclick = setWeekdays
    form.appendChild(button)

    document.getElementById("formReservation").style.display = "block"

}


function setWeekdays() {
    for (let i = 0; i < 7; i++) {
        week[i].value = document.getElementById(weekday[i]).checked
    }
    let tempTimeOut = []
    for (let i = 0; i < timeOut.length; i++) {
        if (!document.getElementById(generateCell(timeOut[i].start, timeOut[i].end)).checked) {
            tempTimeOut.push(timeOut[i])
        }
    }
    let tabletPromises = []
    for (let i = 0; i < tablets.length; i++) {
        let tabletBoolf = document.getElementById(tablets[i].name + "_" + tablets[i].id).checked
        let tempTab = new Tablet(tablets[i].id, tablets[i].name, tabletBool, tablets[i].station_id)

        tabletPromises.push(setOuts("/disableTablet", tempTab))
    }
    timeOut = tempTimeOut
    let weekPromise = setOuts("/setDayOuts", week)
    let timeOutPromise = setOuts("/setTimeOuts", timeOut)
    Promise.all([weekPromise, timeOutPromise]).then(() => {
        location.reload()
    })

}

function addTimeOut() {
    let start = document.getElementById("startTime").value.split(":")[0]
    let end = document.getElementById("endTime").value.split(":")[0]
    if (start !== "" && end !== "") {
        start = parseInt(start)
        end = parseInt(end)
        if (start < end) {
            timeOut.push(new TimeOut(start, end))
            let timePromise = setOuts("/setTimeOuts", timeOut)
            timePromise.then(() => {
                location.reload()
            })
        } else {
            console.log("Startpunkt darf nicht größer als Endpunkt sein")
        }
    }
}

function addTablet() {
    let tabletName = document.getElementById("tabletInput").value
    let tablet = new Tablet(0, tabletName, false)
    if (tabletName !== "") {
        let tabletPromise = setOuts("/addTablet", tablet)
        tabletPromise.then(() => {
            location.reload()
        })
    }


}/*groundzero*/