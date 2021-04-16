let Grooms


function openRoom(room) {
    startRoomPost(room);
}


function init() {
    document.getElementById("userButton").innerText = ""
    const overview = document.getElementById("userButton");
    if (Grooms !== null) {
        for (let i = 0; i < Grooms.length; i++) {
            let rs = Grooms[i].split(" ");
            if (rs[1][0] === this.innerText) {
                const roomdiv = document.createElement("div")
                roomdiv.id = ("structs" + i);
                roomdiv.appendChild(document.createElement("br"))
                roomdiv.className = "rooms"

                roomdiv.innerText = Grooms[i];
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
    }
    const roomdiv = document.createElement("div")
    roomdiv.id = ("addRoom");
    roomdiv.className = "rooms"
    const input = document.createElement("input")
    input.id = "name"
    roomdiv.appendChild(input)
    const a = document.createElement("div")
    roomdiv.appendChild(document.createElement("br"))
    a.className = "img"
    const img = document.createElement("img")
    img.src = "media/img/add.svg"
    img.className = "konfImg"
    img.addEventListener("click", createRoom)
    a.appendChild(document.createElement("br"))
    a.appendChild(img)
    roomdiv.appendChild(a);
    overview.appendChild(roomdiv)
}

async function initReservedDatesOverview(reservedDate,counter) {
    const roverview = document.getElementById("reservedDates")
    roverview.innerText = "Anstehende Termine"
    const innerReserver = document.createElement("div")
    innerReserver.id = "innerReserver"
    console.log(counter)
    let len
    if (counter+7>reservedDate.length){
        len = reservedDate.length
    }else {
        len = counter+7
    }
    for (let i = counter; i <len; i++) {
        let child = document.createElement("div")
        child.className = "reserved"
        await getRoomByID(reservedDate[i].roomid, child, innerReserver, reservedDate[i].time_start, reservedDate[i].time_end)
        child.addEventListener("click",getRoomForOverview)
    }
    roverview.appendChild(innerReserver)
}


function addButtons(rooms) {
    Grooms = rooms
    const overview = document.getElementById("buttonHolder")
    for (let i = 0; i < 26; i++) {
        let button = document.createElement("button")
        button.className = "sortBtn"
        button.innerText = String.fromCharCode(65 + i)
        overview.appendChild(button)
        button.addEventListener("click", init)
        if (i === 0) {
            button.click()
            button.focus()
        }
    }
    let currentWeeksMonday = new Date()
    currentWeeksMonday.setDate(currentWeeksMonday.getDate() - (currentWeeksMonday.getDay() - 1))
    let currentSunday = new Date()
    currentSunday.setDate(currentWeeksMonday.getDate() + 6)
    getAllMeetingsDate(currentWeeksMonday, currentSunday)
}


function createRoom() {
    if (document.cookie !== "") {
        let api, i, len, method, params, ref, urls;
        api = new BigBlueButtonApi("https://kon.jitsi-mathu.de/bigbluebutton/api", document.cookie.split('=')[1]);
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

function setCookie(c_name, value, exdays) {
    let exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    let c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}


function userLogout() {
    document.cookie = "Admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    console.log(document.cookie)
    document.getElementById("id01").style.display = "none";
    document.getElementById("login_btn").style.display = "block";
    document.getElementById("logout_btn").style.display = "none";
    document.getElementById("reservedDates").innerText ="";
    document.getElementById("buttonHolder").innerText= "";
    document.getElementById("userButton").innerText= "";


}

