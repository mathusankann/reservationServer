let rooms;


class Room {
    constructor(name, roomid, join, create, invite, accountid, stationid,meetingRunningLink,room) {
        this.name = name;
        this.id = roomid;
        this.join = join;
        this.create = create;
        this.invite = invite
        this.station_id = stationid
        this.account_id = accountid
        this.meetingRunningLink = meetingRunningLink
        this.room = room

    }
}


class User {
    constructor(id, name, passwort, role) {
        this.Id = id;
        this.username = name;
        this.password = passwort;
        this.role_id = role;
    }

}

class Meeting {
    constructor(id, time_start, time_end, bewohnerid,besucherid, tabletid) {
        this.id = id
        this.time_start = time_start;
        this.time_end = time_end;
        this.bewohner_id = bewohnerid;
        this.besucher_id = besucherid;
        this.tablets_id = tabletid;
    }
}

class Betreuer {
    constructor(id, stationId, name, accountid) {
        this.id = id;
        this.station_id = stationId;
        this.name = name
        this.account_id = accountid
    }
}

class Visitor {
    constructor(id = 0, name, mail, accountid = 0) {
        this.id = id;
        this.name = name;
        this.mail = mail;
        this.account_id = accountid
    }
}

class dayOut {
    constructor(day,value) {
        this.day=day;
        this.value = value
    }

}

class TimeOut {
    constructor(start,end) {
        this.start=start;
        this.end = end;
    }

}



class ResidentHasVisitor {
    constructor(id = 0, visitorID, residentID) {
        this.id = id;
        this.visitorID = visitorID;
        this.residentID = residentID;

    }
}

class Station {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Tablet {
    constructor(id, name,maintenance,stationID) {
        this.id = id;
        this.name = name;
        this.maintenance=maintenance
        this.station_id = stationID
    }
}

function createAjaxRequest() {
    let request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return request;
}

function sendRoomPost(data) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    //location.reload();
                    resolve(true)
                } else {
                    console.log(this.status + ":" + this.responseText);
                    resolve(false)
                }
            }
        }
        request.open("POST", "/createRoom", true);
        request.send(data);
    }))
}

function sendMeetingPost(data) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                location.reload();
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST", "/setMeeting", true);
    request.send(data);
}


async function getUserAuthentication() {
    if (document.cookie === "") {
        document.getElementById("uname").innerText = ""
        document.getElementById("psw").innerText = ""

        await getAllRoom()
        let user = new User(0, document.getElementById("uname").value, document.getElementById("psw").value, 0)
        const request = createAjaxRequest();
        request.onreadystatechange = async function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    document.getElementById("id01").style.display = "none";
                    // document.getElementById("login_btn").style.display = "none";
                    document.getElementById("logout_btn").style.display = "block";
                    document.getElementById("v_blocker").style.display = "none"
                    let user = JSON.parse(this.responseText)
                    await getAllRoomNamesByStationID(user.id)
                    getRoleByID(user.role_id)

                } else {
                    console.log(this.status + ":" + this.responseText);
                }
            }
        }
        request.open("POST", "/getUserAuthentication", true);
        request.send(JSON.stringify(user));
    } else {
        getUserAuthenticationCookie()
    }
}


function getUserAuthenticationCookie() {
    const request = createAjaxRequest();
    request.onreadystatechange = async function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                document.getElementById("uname").innerText = ""
                document.getElementById("psw").innerText = ""
                document.getElementById("id01").style.display = "none";
                // document.getElementById("login_btn").style.display = "none";
                document.getElementById("logout_btn").style.display = "block";
                document.getElementById("v_blocker").style.display = "none"
                let user = JSON.parse(this.responseText)
                await getAllRoomNamesByStationID(user.id)
                getRoleByID(user.role_id)

            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }

    }
    request.open("GET", "/getUserAuthenticationCookie?key=" + document.cookie.split('=')[1], true);
    request.send();
}

function getRoleByID(id) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                let role = JSON.parse(this.responseText)
                if (role.viewTermin) {
                    // addButtons(rooms)
                    init(rooms)
                }
                if (role.viewAllStationUser) {

                }
                if (role.viewAllUser) {
                    document.getElementById("timeTableSettings").style.visibility="visible"
                    showEditorPanel()
                    //
                }

            }

        }

    }
    request.open("GET", "/getRoleByID?ID=" + id, true);
    request.send();
}

function sendUserPost(data) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                console.log(this.responseText)
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST", "/addUser", true);
    request.send(JSON.stringify(data));
}


function startRoomPost(createRoom) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                console.log(this.responseText);
                location.href = createRoom.join;

            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST", "/startRoom", true);
    request.send(JSON.stringify(createRoom.create));
}


function getRoom(name) {
    const room = name
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                let r = JSON.parse(this.responseText)
                openRoom(r)
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getRoom?name=" + room, true);
    request.send();
}

function getRoomForOverview() {
    let innerText = this.innerText.split(" ")
    const room = innerText[0] + " " + innerText[1].split("-")[0]
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                let r = JSON.parse(this.responseText)
                openRoom(r)
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getRoom?name=" + room, true);
    request.send();
}


function getAllRoomNames() {
    //let rooms
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                if (this.responseText !== "") {
                    rooms = JSON.parse(this.responseText);
                    //getUserAuthentication();
                    //init(rooms)
                } else {
                    init(null)
                }
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getAllRoomNames", true);
    request.send();
}

function getAllRoomNamesByStationID(ID) {
    //let rooms
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    if (this.responseText !== "") {
                        rooms = JSON.parse(this.responseText);
                        //getUserAuthentication();
                        //init(rooms)
                        resolve(true)

                    } else {
                        init(null)
                        resolve(true)
                    }
                } else {
                    console.log(this.status + ":" + this.responseText);
                    resolve(true)
                }
            }
        }
        request.open("GET", "/getAllRoomByStationID?ID=" + ID, true);
        request.send();
    }))
}


function getRoomByID(Id, child, roverview, timestart, timeend) {
    return new Promise(((resolve, reject) => {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                    let r = JSON.parse(this.responseText)
                    let temp = new Date()
                    temp.setHours(temp.getHours() - 1)
                    if (dates.compare(new Date(timestart), temp) >= 0) {
                        /* let test = new Date(timestart)
                         console.log(test)
                         let start = timestart.split("T")
                         let startm = start[1].split("Z")
                         let end = timeend.split("T")
                         let endM = end[1].split("Z")*/
                        let date = new Date(timestart).toLocaleDateString('de-DE', options)
                        let starter = new Date(timestart).toLocaleTimeString()
                        let ender = new Date(timeend).toLocaleTimeString()
                        child.innerText = r.name + "-" + "\n" + date + " " + starter + " - " + ender
                        roverview.appendChild(child)
                    }
                    resolve(1)

            } else {
                resolve(0)
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getRoomByID?ID=" + Id, true);
    request.send();
    }))
}

function getAllRoom() {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        return new Promise(((resolve, reject) => {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    rooms = JSON.parse(this.responseText)
                    resolve(true)
                }
            } else {
                //reject("this.responseText")
            }
        }))
    }

    request.open("GET", "/getAllRoomNames", true);
    request.send();
}

function getAllMeetingsDate(starttime, endtime) {
    starttime.setHours(0, 0, 0)
    starttime = starttime.toISOString()
    endtime.setDate(endtime.getDate() + 1)
    endtime = endtime.toISOString()
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                reservedDates = JSON.parse(this.responseText)
                if (reservedDates == null) {
                    document.getElementById("reservedDates").style.display="none"
                    document.getElementById("buttonHolder").style.float="left"
                    document.getElementById("userButton").style.float="left"

                    //document.getElementById("")
                    return
                }
                let temp = new Date()
                temp.setHours(temp.getHours() - 1)
                let counter = -1;
                for (let i = 0; i < reservedDates.length; i++) {
                    if (dates.compare(reservedDates[i].time_start, temp) >= 0) {
                        if (counter === -1) {
                            counter = i
                        }
                    }
                }
                initReservedDatesOverview(reservedDates, counter)
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "/getAllMeetings?starttime=" + starttime + "&endtime=" + endtime, true);
    request.send();
}

function getAllVistorNamesByResidentID(Id, addEvent) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    /* return new Promise(((resolve, reject) => {
                         let listVisitor = JSON.parse(this.responseText)
                         resolve(listVisitor)
                     }))*/
                    let listVisitor = JSON.parse(this.responseText)
                    let dropdown = document.getElementById("visitor")
                    dropdown.innerText = ""
                    if (listVisitor !== null) {
                        for (let i = 0; i < listVisitor.length; i++) {
                            let option = document.createElement("option")
                            option.value = listVisitor[i]
                            option.innerText = listVisitor[i]
                            dropdown.appendChild(option)
                            resolve(true)
                            if (addEvent) {
                                option.onclick = startConfWithVisitor
                            }
                        }
                    }
                }
                resolve(true)
            }
            resolve(true)

        }
        request.open("GET", "/getAllVistorNamesByResidentID?ID=" + Id, true);
        request.send();
    }))

}

function getVisitorByName(name) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getVisitorbyname?name=" + name, true);
        request.send();
    }))

}

function addNewVisitor(name, mail, id) {
    return new Promise(((resolve, reject) => {
        let visitor = new Visitor(0, name, mail, 0)
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("POST", "/addNewVisitor?ID=" + id, true);
        request.send(JSON.stringify(visitor));
    }))
}


function addVisitorToResident(visitor, resident) {
    return new Promise(((resolve, reject) => {
        let rhv = new ResidentHasVisitor(0, visitor, resident)
        let path = "/addVisitorToResident"

        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    resolve(this.responseText)
                }
            }
            request.open("POST", path, true);
            request.send(JSON.stringify(rhv));
        }
    }))
}

function getAllStation() {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getAllStation", true);
        request.send();
    }))
}


function getStationByName(name) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getAllStationByName?name=" + name, true);
        request.send();
    }))
}

function createStation(name) {
    return new Promise(((resolve, reject) => {
        let station = new Station(0, name)
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    // let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve("done")
                }
            }
        }
        request.open("POST", "/createNewStation", true);
        request.send(JSON.stringify(station));
    }))
}

function createUser(id, name, password, roleID) {
    let user = new User(id, name, password, roleID)
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    // let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve("done")
                }
            }
        }
        request.open("POST", "/addUser", true);
        request.send(JSON.stringify(user));
    }))
}

function createMinder(id, station, name, accountID) {
    let minder = new Betreuer(id, station, name, accountID)
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    // let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    console.log("created")
                    resolve("done")
                }
            }
        }
        request.open("POST", "/addNewMinder", true);
        request.send(JSON.stringify(minder));
    }))
}

function getAccountIDByName(name) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getAccountByName?name=" + name, true);
        request.send();
    }))

}

function getRoomIDBYName(name) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getRoomIDByName?Name=" + name, true);
        request.send();
    }))

}

function getAllTablets() {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }
            }
        }
        request.open("GET", "/getAllTablets", true);
        request.send();
    }))

}

/*
function getAllTimeouts(){
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                }else{
                    console.log(this.responseText)
                    resolve(null)
                }
            }
        }
        request.open("GET", "/getTimeOut", true);
        request.send();
    }))
}
*/

function getter(path) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                } else {
                    console.log(this.responseText)
                    resolve(null)
                }
            }
        }
        request.open("GET", path, true);
        request.send();
    }))
}

function sendInviteMail(meeting) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    //console.log(this.responseText)
                    resolve(true)
                } else {
                    console.log(this.responseText)
                    resolve(null)
                }
            }
        }
        request.open("POST", "/sendInvitationMail", true);
        request.send(JSON.stringify(meeting));
    }))
}

function deleteResident(id) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    console.log(this.responseText)
                    resolve(true)
                }
                else{
                    console.log(this.responseText)
                    resolve(false)
                }
            }
        }
        request.open("GET", "/deleteResident?residentID=" + id, true);
        request.send();
    }))

}

function setOuts(path,parameter) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    console.log(this.responseText)
                    resolve(true)
                } else {
                    console.log(this.responseText)
                    resolve(null)
                }
            }
        }
        request.open("POST", path, true);
        request.send(JSON.stringify(parameter));
    }))
}

