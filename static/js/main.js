let Grooms
let flagAddStation;
let userId;
let residentName;


let functionsArray=[()=>{
    console.log("placeholder")
},openHomePage,showStationResidents,showRequests]





function openRoom(room) {
    startRoomPost(room);
}

function openHomePage(){
    location.reload()
}
function showStationResidents(){
    console.log("test")
    document.getElementById("termin").style.display="none"
    document.getElementById("terminOverview").style.display="none"
    document.getElementById("reservedDates").style.display="none"
    document.getElementById("buttonHolder").style.display="block"
    document.getElementById("userButton").style.display="block"

}

function showRequests(){
    document.getElementById("termin").style.display="none"

    document.getElementById("terminOverview").style.display="none"
    document.getElementById("buttonHolder").style.display="none"
    document.getElementById("userButton").style.display="none"
    document.getElementById("reservedDates").style.display="block"
}


let test = setInterval(function () {
    clearInterval(test)
},100)

function init(rooms) {
    Grooms = rooms
    getAllMeetingsDate(currentWeeksMonday, currentSunday)
    document.getElementById("buttonHolder").innerText = "\n Bewohner"
    document.getElementById("userButton").innerText = ""
    const overview = document.getElementById("userButton");
    if (Grooms !== null) {
        for (let i = 0; i < Grooms.length; i++) {
            let rs = Grooms[i].split(" ");
            const roomdiv = document.createElement("div")
            roomdiv.id = ("structs" + i);
            roomdiv.appendChild(document.createElement("br"))
            roomdiv.className = "rooms"
            roomdiv.value = Grooms[i];
            roomdiv.innerText = rs[0] + "\n" + rs[1]
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
            roomdiv.addEventListener("click", generateInterfaceRoom)
        }
    }
}


function generateIconOverViewUser(){
    generateIconOverview("icon.json",functionsArray)
}


/*async function initReservedDatesOverview(reservedDate, counter) {
  const roverview = document.getElementById("reservedDates")
   let divElement = document.createElement("div")
   divElement.innerText = "Terminanfragen"
   roverview.appendChild(divElement)
   let divElement2 = document.createElement("div")
   roverview.appendChild(divElement)
   divElement2.innerText = "Anstehende Termine"
   const innerReserver = document.createElement("div")
   innerReserver.className = "innerReserver"
   let len
   let diff
   let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
   if (width < 1500) {
       diff = 3
   } else {
       diff = 7
   }
   if (counter + diff > reservedDate.length) {
       len = reservedDate.length
   } else {
       len = counter + diff
   }
   if (counter === -1) {
       counter = 0
   }
   for(let i=0;i<reservedDate.length;i++){
       let child = document.createElement("div")
       child.className = "reserved"
   }

   for (let i = counter; i < len; i++) {
       let child = document.createElement("div")
       child.className = "reserved"
       let x = await getRoomByID(reservedDate[i].bewohner_id, child, innerReserver, reservedDate[i].time_start, reservedDate[i].time_end)
       child.addEventListener("click", getRoomForOverview)
   }
   divElement.appendChild(innerReserver)
}*/
async function initReservedDatesOverview(reservedDate, counter){
    const roverview = document.getElementById("reservedDates")
    let divElement = document.createElement("div")
    divElement.innerText = "Terminanfragen"
    divElement.className ="requestChild"
    if(roverview!==null){
        roverview.appendChild(divElement)
    }
    let innerReserver = document.createElement("div")
    innerReserver.className = "innerReserver"
    for(let i=0;i<reservedDate.length;i++) {
        if (reservedDate[i].pending && !reservedDate[i].request_bewohner) {
            getter("/getVisitorByID?ID=" + reservedDate[i].besucher_id).then((visitor) => {
                getter("/getRoomByID?ID=" + reservedDate[i].bewohner_id).then((resident) => {
                    let requester = document.createElement("div")
                    let child = document.createElement("div")
                    requester.className = "requestText"
                    let divText = document.createElement("div")
                    divText.innerText = "Name: " + visitor.name + "\n" + "Mail: " + visitor.mail
                    child.appendChild(requester)
                    requester.appendChild(divText)
                    let date = new Date(reservedDate[i].time_start).toLocaleDateString('de-DE', options)
                    let starter = new Date(reservedDate[i].time_start).toLocaleTimeString()
                    let ender = new Date(reservedDate[i].time_end).toLocaleTimeString()
                    divText = document.createElement("div")
                    divText.innerText = "Name: " + resident.name + "\n" + "Zeit: " + date + " " + starter + " - " + ender
                    requester.appendChild(divText)
                    let button = document.createElement("button")
                    button.innerText = "Zusagen"
                    button.style.backgroundColor = SUCCESS
                    button.value = reservedDate[i].id
                    button.addEventListener("click", updateMeeting)
                    let button2 = document.createElement("button")
                    button2.innerText = "Absagen"
                    button.className = "requestButtons"
                    button2.className = "requestButtons"
                    button2.value = reservedDate[i].id
                    button2.addEventListener("click",cancelMeeting)
                    button2.style.backgroundColor = FAIL
                    requester.appendChild(button)
                    requester.appendChild(button2)
                    innerReserver.appendChild(requester)
                })
            })
        }
    }
    divElement.appendChild(innerReserver)
    let divElement2 = document.createElement("div")
    divElement2.className ="requestChild"
    if(roverview!==null){
        roverview.appendChild(divElement2)
    }

    divElement2.innerText = "Anstehende Termine"
    let innerReserver2 = document.createElement("div")
    innerReserver2.className = "innerReserver"
    for (let i = 0; i < reservedDate.length; i++) {
        if (!reservedDate[i].pending){
            let child = document.createElement("div")
            child.className = "reserved"
            let x = await getRoomByID(reservedDate[i].bewohner_id, child, innerReserver2, reservedDate[i].time_start, reservedDate[i].time_end)
            child.addEventListener("click", getRoomForOverview)
        }
    }
    divElement2.appendChild(innerReserver2)
}

function updateMeeting(e){
    getter("/updateMeeting?accept=0&meetingID="+e.target.value).then(()=>{
        openAlert("Meeting wurde erfolgreich angenommen",SUCCESS)
        setTimeout(function () {
            location.reload()
        },1500)
    })
}

function cancelMeeting(e){
    getter("/updateMeeting?accept=1&meetingID="+e.target.value).then(()=>{
        openAlert("Meeting wurde erfolgreich abgelehnt",SUCCESS)
        setTimeout(function () {
            location.reload()
        },1500)
    })
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
    const roverview = document.getElementById("reservedDates")
    roverview.innerText = "Anstehende Termine"
    getAllMeetingsDate(currentWeeksMonday, currentSunday)
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

function something() {

}

function userLogout() {
    getter("/removeAuthenticateUser?key="+ document.cookie.split('=')[1]).then(()=>{
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        location.reload();

    })
}

async function generateInputInterfaceAddRoom() {
    flagAddStation = false
    const form = document.getElementById("test")
    form.innerText = ""
    let dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "station"
    dropdownLabel.innerText = "Station"
    dropdownLabel.className = "labels"
    let dropdown = document.createElement("select")
    dropdown.name = "Station"
    dropdown.id = "station"
    let stations = await getAllStation()
    if (stations != null) {
        for (let i = 0; i < stations.length; i++) {
            let option = document.createElement("option")
            option.value = stations[i]
            option.innerText = stations[i]
            dropdown.appendChild(option)
        }
    }
    let addNewStationButton = document.createElement("button")
    addNewStationButton.innerText = "+"
    addNewStationButton.id = "addVisitor"
    addNewStationButton.type = "button"
    addNewStationButton.onclick = setNewStation
    let vContainer = document.createElement("div")
    vContainer.id = "vContainer"
    vContainer.appendChild(dropdown)
    vContainer.appendChild(addNewStationButton)
    form.appendChild(dropdownLabel)
    form.appendChild(vContainer)
    dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "name"
    dropdownLabel.innerText = "Bewohner"
    dropdownLabel.className = "labels"
    let nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Name"
    nameInput.id = "nameVisitor"
    form.appendChild(dropdownLabel)
    form.appendChild(nameInput)
    nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Raumnummer"
    nameInput.id = "roomNumber"
    form.appendChild(nameInput)
    let sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.innerText = "Erstellen"
    sendButton.id = "createButton"
    sendButton.onclick = setResident
    form.appendChild(sendButton)
    document.getElementById('formReservation').style.display = 'block'

}

function setNewStation() {
    flagAddStation = true
    const form = document.getElementById("test")
    form.innerText = ""
    let dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "station"
    dropdownLabel.innerText = "Station"
    dropdownLabel.className = "labels"
    form.appendChild(dropdownLabel)
    let nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Stationsname"
    nameInput.id = "stationsnameInput"
    form.appendChild(nameInput)
    nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Benutzername"
    nameInput.id = "userInput"
    form.appendChild(nameInput)
    nameInput = document.createElement("input")
    nameInput.type = "password"
    nameInput.placeholder = "Passwort"
    nameInput.id = "passwordInput"
    form.appendChild(nameInput)
    dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "name"
    dropdownLabel.innerText = "Bewohner"
    dropdownLabel.className = "labels"
    nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Name"
    nameInput.id = "nameVisitor"
    form.appendChild(dropdownLabel)
    form.appendChild(nameInput)
    nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.placeholder = "Raumnummer"
    nameInput.id = "roomNumber"
    form.appendChild(nameInput)

    let sendButton = document.createElement("button")
    sendButton.type = "button"
    sendButton.innerText = "Erstellen"
    sendButton.id = "createButton"
    sendButton.onclick = setResident
    form.appendChild(sendButton)
    document.getElementById("formReservation").style.display = "block"
}

async function setResident() {
    if (flagAddStation) {
        let stationName = document.getElementById("stationsnameInput").value
        let userName = document.getElementById("userInput").value
        let password = document.getElementById("passwordInput").value
        let residentName = document.getElementById("nameVisitor").value
        let roomNumber = document.getElementById("roomNumber").value
        let stationID;
        /* createStation(stationName).then(() => {
                 getStationByName(stationName).then((res) => {
                     stationID = res
                     createRoom(residentName, stationName)
                     createUser(0, userName, password, 2).then(() => {
                         getAccountIDByName(userName).then((id) => {
                             createMinder(0, stationID, userName, id).then(()=>{
                                 console.log("done")
                             })
                         })
                     })
                 })

             }
         )*/
        await createStation(stationName)
        stationID = await getStationByName(stationName)
        console.log(stationID)
        createRoom(residentName, stationName, roomNumber)
        await createUser(0, userName, password, 2,stationID)
        getAccountIDByName(userName).then((userID) => {

        })

    } else {
        let stationName = document.getElementById("station").value
        let residentName = document.getElementById("nameVisitor").value
        let roomNumber = document.getElementById("roomNumber").value
        await createRoom(residentName, stationName, roomNumber)
        location.reload();
    }

}

function tester() {
    // createMinder(0,3,"Auto Fahrere",3)

}

function showEditorPanel() {
    const overview = document.getElementById("userButton");
    const roomdiv = document.createElement("div")
    roomdiv.id = ("addRoom");
    roomdiv.className = "rooms"
    //const input = document.createElement("input")
    //input.id = "name"
    //roomdiv.appendChild(input)
    const a = document.createElement("div")
    roomdiv.appendChild(document.createElement("br"))
    a.className = "img"
    const img = document.createElement("img")
    img.src = "media/img/add.svg"
    img.className = "konfImg"
    img.addEventListener("click", generateInputInterfaceAddRoom)
    a.appendChild(document.createElement("br"))
    a.appendChild(img)
    roomdiv.appendChild(a);
    overview.appendChild(roomdiv)
}


function generateInterfaceRoom() {
    const form = document.getElementById("test")
    form.innerText = ""
    let dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "besucher"
    dropdownLabel.innerText = "Besucher"
    dropdownLabel.className = "labels"
    form.appendChild(dropdownLabel)
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
    let div = document.createElement("div")
    div.style.width = "100%"
    let button = document.createElement("button")
    button.innerText = "Hinzufügen"
    button.type = "button"
    button.onclick = addVisitorRoomInterface
    div.appendChild(button)
    form.appendChild(div)
    dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "room"
    dropdownLabel.innerText = "Raum öffnen mit ..."
    dropdownLabel.className = "labels"
    let dropdown = document.createElement("select")
    dropdown.id = "visitor"
    form.appendChild(dropdownLabel)
    form.appendChild(dropdown)
    //console.log(this.innerText)
    getVisitorsRoomInterface(this.value)

    dropdownLabel = document.createElement("label")
    dropdownLabel.htmlFor = "room"
    dropdownLabel.innerText = "Löschen"
    dropdownLabel.className = "labels"
    form.appendChild(dropdownLabel)
    button = document.createElement("button")
    button.innerText = "Löschen"
    button.type = "type"
    button.style.background = "red"
    button.onclick = () => {
        deleteResident(userId).then(() => {
            location.reload()
        })
    }

    div = document.createElement("div")
    div.style.width = "100%"
    div.appendChild(button)
    form.appendChild(div)


    document.getElementById("formReservation").style.display = "block"

}

async function getVisitorsRoomInterface(name) {
    // console.log(this.value)
    residentName = name
    userId = await getRoomIDBYName(name)
    await getAllVistorNamesByResidentID(userId, true)
}

function addVisitorRoomInterface() {
    let name = document.getElementById("nameVisitor").value
    let mail = document.getElementById("mailVisitor").value
    addNewVisitor(name, mail, userId)
    document.getElementById("formReservation").style.display = "none"

}

function startConfWithVisitor() {
    getVisitorByName(this.innerText.toString()).then((res) => {
        let meeting = new Meeting(0, null, null, userId, res.id, 0)
        console.log(meeting)
        sendInviteMail(meeting).then((res) => {
            console.log("hier")
            if (res) {
                getRoom(residentName)
            } else {
                console.log("something went wrong ...")
            }
        })

    })
}

function setEventListener() {

}




function openTab(evt, tabName) {
    // Declare all variables
    evt.preventDefault()
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if(evt.currentTarget.innerText ==="Anmelden"){
        document.getElementById("psw").addEventListener("keydown",f)
        document.getElementById("pswRegister").removeEventListener("keydown",f1)
    }else{
        document.getElementById("pswRegister").addEventListener("keydown",f1)
        document.getElementById("psw").removeEventListener("keydown",f)
    }
}

function showPasswordToggle() {
    let x = document.getElementById("pswRegister");

    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}
function f(e) {
    if(e.code==="Enter"){
        getUserAuthentication()
    }
}

function f1(e) {
    if(e.code==="Enter"){
        addVisitorAccount()
    }
}

function clearAllInputs() {
    document.getElementById("uname").innerText = ""
    document.getElementById("uname").value = ""
    document.getElementById("psw").innerText = ""
    document.getElementById("psw").value = ""
    document.getElementById("unameRegister").innerText = ""
    document.getElementById("unameRegister").value = ""
    document.getElementById("mailRegister").innerText = ""
    document.getElementById("mailRegister").value = ""
    document.getElementById("pswRegister").innerText = ""
    document.getElementById("pswRegister").value = ""
    document.getElementById("showPassword").checked = false
}

function addVisitorAccount() {
    let visitorName = document.getElementById("unameRegister").value
    let visitorMail = document.getElementById("mailRegister").value
    let password = document.getElementById("pswRegister").value
    let visitor = new Visitor(0, visitorName, visitorMail, 0)
    getterPOst("/getVisitorByMail", visitor, true).then((res) => {
        if (res !== null) {
            (visitorName !== "" && visitorMail !== "" && password !== "")
            {
                createUser(0, visitorName, password, 3).then(() => {
                    let visitorStruct = new Visitor(0, visitorName, visitorMail, 0)
                    setOuts("/registerVisitor", visitorStruct).then(() => {
                        location.reload()
                    })
                })
            }
        }
    })

}

function forwordingConv(){
    localStorage.setItem('keyBBB',"3")
}