

class Room {
    constructor(name, roomid,join,create,invite) {
        this.name = name;
        this.roomid = roomid;
        this.join = join;
        this.create = create;
        this.invite = invite
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
    request.send(data);
}

function userLogout() {
    localStorage.clear()
    document.getElementById("id01").style.visibility = "block";
    document.getElementById("login_btn").style.visibility="block";
    document.getElementById("logout_btn").style.visibility="hidden";

}

function getUserAuthentication(){
    if (localStorage.getItem('sharedSecre')==null) {
        let user = new User(document.getElementById("uname").value, document.getElementById("psw").value)
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let inc = this.responseText.split(" ")
                    localStorage.clear()
                    localStorage.setItem('Role', inc[1].toString());
                    localStorage.setItem('sharedSecret', inc[0].toString());
                    document.getElementById("id01").style.visibility = "hidden";
                    document.getElementById("login_btn").style.visibility="hidden";
                    document.getElementById("logout_btn").style.visibility="block";

                } else {
                    console.log(this.status + ":" + this.responseText);
                }
            }
        }
        request.open("POST", "http://localhost:8080/getUserAuthentication", true);
        request.send(JSON.stringify(user));
    }
    else{
        document.getElementById("id01").style.visibility = "hidden";
        document.getElementById("id01").innerText = "Logout"
        document.getElementById("id01").addEventListener("click", userLogout)
    }
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
    request.send(JSON.stringify(data));
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

 function getAllMeetings(starttime,endtime) {
    let example = new Date()
    console.log(example)
    starttime =starttime.toISOString()
    endtime= endtime.toISOString()
    const request = createAjaxRequest();
    request.onreadystatechange =function () {
        if(4 === this.readyState){
            if(200 === this.status){
                return new Promise(((resolve, reject) => {
                    resolve(this.responseText)
                }))

            }else{
                console.log(this.status + ":" + this.responseText);
            }
        }
    }
    request.open("GET","http://localhost:8080/getAllMeetings?starttime=" +starttime+"&endtime="+endtime,true);
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

