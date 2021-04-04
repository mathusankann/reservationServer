

class Room {
    constructor(name, roomid,join,create) {
        this.name = name;
        this.roomid = roomid;
        this.join = join;
        this.create = create;
    }
}

class User {
    constructor(name,passwort,role) {
        this.name=name;
        this.password=passwort;
        this.role =role;
    }

}

class Meeting {
    constructor(time_start,time_end,roomid,reminder,mail) {
        this.time_start=time_start;
        this.time_end=time_end;
        this.roomid = roomid;
        this.reminder = reminder;
        this.mail= mail;
    }

}

let user = new User("mathusan","","admin")
let meeting = new Meeting("2007-01-01 10:00:00","2007-01-01 10:00:00",1,0,"mathusan13@live,de")

function createAjaxRequest(){
    let request;
    if(window.XMLHttpRequest){
        request = new XMLHttpRequest();
    }else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return request;
}

function sendRoomPost(data){
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if(4 === this.readyState){
            if(200 === this.status){
                location.reload();
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST","http://localhost:8080/createRoom",true);
    request.send(data);
}

function sendMeetingPost(data){
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if(4 === this.readyState){
            if(200 === this.status){
                location.reload();
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST","http://localhost:8080/setMeeting",true);
    request.send(JSON.stringify(meeting));
}

function getUserAuthentication(data){
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if(4 === this.readyState){
            if(200 === this.status){
                console.log(this.responseText)
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST","http://localhost:8080/getUserAuthentication",true);
    request.send(data);
}

function sendUserPost(data){
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if(4 === this.readyState){
            if(200 === this.status){
                console.log(this.responseText)
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST","http://localhost:8080/addUser",true);
    request.send(data);
}


function startRoomPost(createRoom) {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if(4 === this.readyState){
            if(200 === this.status){
                console.log(this.responseText);
                location.href = createRoom.join;

            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("POST","http://localhost:8080/startRoom",true);
    request.send(JSON.stringify(createRoom.create));
}

function getRoom() {
    console.log(this)
    const room = this.innerText.toString();
    const request = createAjaxRequest();
    request.onreadystatechange =function () {
        if(4 === this.readyState){
            if(200 === this.status){
                let r=JSON.parse(this.responseText)
                openRoom(r)
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET","http://localhost:8080/getRoom?name=" +room,true);
    request.send();
}



function getAllRoomNames() {
    let rooms
    const request = createAjaxRequest();
    request.onreadystatechange =function () {
        if(4 === this.readyState){
            if(200 === this.status){
                console.log(this.responseText)
                if(this.responseText!==""){
                    rooms = JSON.parse(this.responseText);
                    init(rooms)
                }
            else {
                    init(null)
                }
            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET","http://localhost:8080/getAllRoomNames",true);
    request.send();
}