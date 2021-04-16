const path= "35.241.245.32/"
const pathl= "localhost/"
let rooms;

class Room {
    constructor(name, roomid, join, create, invite) {
        this.name = name;
        this.roomid = roomid;
        this.join = join;
        this.create = create;
        this.invite = invite
    }
}

class User {
    constructor(name, passwort, role) {
        this.name = name;
        this.password = passwort;
        this.role = role;
    }

}

class Meeting {
    constructor(time_start, time_end, roomid, reminder, mail) {
        this.time_start = time_start;
        this.time_end = time_end;
        this.roomid = roomid;
        this.reminder = reminder;
        this.mail = mail;
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
    request.open("POST", "http://"+path+":8080/createRoom", true);
    request.send(data);
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
    request.open("POST", "http://"+path+":8080/setMeeting", true);
    request.send(data);
}


async function getUserAuthentication() {
    if (document.cookie === "") {
        await getAllRoom()
        let user = new User(document.getElementById("uname").value, document.getElementById("psw").value)
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let inc = this.responseText.split(" ")
                    setCookie(inc[1], inc[0], 1)
                    document.getElementById("id01").style.display = "none";
                    document.getElementById("login_btn").style.display = "none";
                    document.getElementById("logout_btn").style.display = "block";
                    addButtons(rooms)

                } else {
                    console.log(this.status + ":" + this.responseText);
                }
            }
        }
        request.open("POST", "http://"+path+"/getUserAuthentication", true);
        request.send(JSON.stringify(user));
    } else {
        console.log(true)
        document.getElementById("id01").style.visibility = "hidden";
        document.getElementById("login_btn").style.display = "none";
        document.getElementById("logout_btn").style.display = "block";
        addButtons(rooms)
    }
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
    request.open("POST", "http://"+path+":8080/addUser", true);
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
    request.open("POST", "http://"+path+":8080/startRoom", true);
    request.send(JSON.stringify(createRoom.create));
}

function getRoom() {
    console.log(this)
    const room = this.innerText.toString();
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
    request.open("GET", "http://"+path+":8080/getRoom?name=" + room, true);
    request.send();
}

function getRoomForOverview() {

    let innerText = this.innerText.split(" ")
    const room = innerText[0] + " " + innerText[1].split("2")[0]
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
    request.open("GET", "http://"+path+":8080/getRoom?name=" + room, true);
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
                    getUserAuthentication();
                    //init(rooms)
                } else {
                    init(null)
                }
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "http://"+path+":8080/getAllRoomNames", true);
    request.send();
}

function getRoomByID(Id, child, roverview, timestart, timeend) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if (4 === this.readyState) {
            if (200 === this.status) {
                return new Promise(((resolve, reject) => {
                    let r = JSON.parse(this.responseText)
                    let temp = new Date()
                    temp.setHours(temp.getHours() - 1)
                    if (dates.compare(timestart, temp) >= 0) {
                        let start = timestart.split("T")
                        let startm = start[1].split("Z")
                        let end = timeend.split("T")
                        let endM = end[1].split("Z")
                        child.innerText = r.name + "\n" + start[0] + " " + startm[0] + " - " + endM[0]
                        roverview.appendChild(child)
                    }
                    resolve(1)
                }))
            } else {
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET", "http://"+path+":8080/getRoomByID?ID=" + Id, true);
    request.send();
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
                reject(this.responseText)
            }
        }))
    }

    request.open("GET", "http://"+path+":8080/getAllRoomNames", true);
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
                let temp = new Date()
                temp.setHours(temp.getHours() - 1)
                let counter = 0;
                for (let i = 0; i < reservedDates.length; i++) {
                    if (dates.compare(reservedDates[i].time_start, temp) >= 0) {
                        if (counter === 0) {
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
    request.open("GET", "http://"+path+":8080/getAllMeetings?starttime=" + starttime + "&endtime=" + endtime, true);
    request.send();
}