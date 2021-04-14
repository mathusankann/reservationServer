

function openRoom(room) {
    startRoomPost(room);
}


function init(rooms){
    const overview = document.getElementById("overview");
    if(rooms!==null) {
        for (let i = 0; i < rooms.length; i++) {
            const roomdiv = document.createElement("div")
            roomdiv.id = ("structs" + i);
            roomdiv.appendChild(document.createElement("br"))
            roomdiv.className = "rooms"
            let rs = rooms[i].replace(" ","\n");
            roomdiv.innerText = rooms[i];
            const a = document.createElement("div")
            a.className = "img"
            const img = document.createElement("img")
            img.src = "media/img/conference.png"
            a.appendChild(document.createElement("br"))
            a.appendChild(img)
            img.className = "konfImg"
            roomdiv.appendChild(a);
            //roomdiv.appendChild(img);
            overview.appendChild(roomdiv)
            roomdiv.addEventListener("click", getRoom)
            const activ = document.createElement("img")
            activ.src = "media/img/redpoint.gif"
            activ.className = "activind"
            roomdiv.appendChild(activ)
        }
    }
    const roomdiv = document.createElement("div")
    roomdiv.id = ("addRoom");
    roomdiv.className = "rooms"
    const input = document.createElement("input")
    input.id = "name"
    roomdiv.appendChild(input)
    const a = document.createElement("div")
    roomdiv.appendChild(document.createElement("br"))
    a.className="img"
    const img = document.createElement("img")
    img.src ="media/img/add.svg"
    img.className = "konfImg"
    img.addEventListener("click",createRoom)

    a.appendChild(document.createElement("br"))
    a.appendChild(img)
    roomdiv.appendChild(a);
    overview.appendChild(roomdiv)





}



function addButton() {

    
}



function createRoom() {
    console.log(localStorage.getItem('sharedSecret')!==null)
    console.log(localStorage.getItem('sharedSecret')!=="")
    if(localStorage.getItem('sharedSecret')!==null) {
        console.log(localStorage.getItem('sharedSecret'))
        let api, i, len, method, params, ref, urls;
        api = new BigBlueButtonApi("https://kon.jitsi-mathu.de/bigbluebutton/api", localStorage.getItem('sharedSecret'));
        //todo shared secret request

        const username = document.getElementById("name").value
        // A hash of parameters.
        // The parameter names are the same names BigBlueButton expects to receive in the API calls.
        // The lib will make sure that, for each API call, only the parameters supported will be used.
        params = {
            name: username,
            meetingID: "2", //todo request MeetingID
            moderatorPW: "mp",
            attendeePW: "ap",
            password: "ap", // usually equals "moderatorPW"
            welcome: "<br>Welcome to <b>%%CONFNAME%%</b>!",
            fullName: username,
            publish: false,
            // random: "416074726",
            record: false,
            // recordID: "random-9998650",
            //voiceBridge: "75858", //todo request videoBridgeID
            meta_anything: "My Meta Parameter",
            custom_customParameter: "Will be passed as 'customParameter' to all calls"
        };
        urls = [];
        ref = api.availableApiCalls();
        console.log(ref)
        for (i = 0, len = ref.length; i < len; i++) {
            method = ref[i];
            urls.push({
                name: method,
                url: api.urlFor(method, params)
            });
        }
        params.password = "ap"
        params.fullName = "Besucher"
        let vistor = api.urlFor('join', params)
        let room = new Room(username, parseInt(params.meetingID), urls[2].url, urls[1].url, vistor.toString())
        sendRoomPost(JSON.stringify(room))
    }
}

function initTermin() {


}

function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("wuser");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}