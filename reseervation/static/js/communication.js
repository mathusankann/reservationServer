

class Room {
    constructor(name, roomid,join,create) {
        this.name = name;
        this.roomid = roomid;
        this.join = join;
        this.create = create;
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