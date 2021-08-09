let reservFuntions = [terminPlanerSettings, userConfigInterface]
let reservButtons = ["Terminplaner Konfigurator", "Benutzer Verwaltung"]
let terminButtons = ["Zeiten", "Tage"]
let terminFunctions = [disableTimes2, disableDays2]
let dbFunctions =[generateViewSqlContainer,generateViewSqlContainer,generateViewSqlContainer,generateViewSqlContainer]
let requestName =["/getAllAccounts","/getAllRoomNames","/getAllTabletsNames"]
let db = ["Accounts/Station", "Bewohner","Tablets"]
let station=[]

let disabledTimesArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let disabledDaysArray = [0, 0, 0, 0, 0, 0, 0]

let timeOutArray = []
let dayOutArray = []

let currentButton

let currentSql
let toBeEditedEntity

function userConfigInterface() {
    document.getElementById("terminContainer").style.display = "none"
    document.getElementById("saveButton").style.display = "none"
    document.getElementById("sqlContainer").style.display = "block"
    document.getElementById("sqlInterface").style.display = "block"
    let container = settingInit(1)
    buttonGeneratorPlain(db, dbFunctions, container)
}

function generateTimeOutValues() {
    timeOutArray = []
    for (let i = 1; i < disabledTimesArray.length; i++) {
        let start
        let end
        if (disabledTimesArray[i - 1] === 1) {
            start = 8 + i - 1
            console.log(start)
            end = 8 + i
        }
        while (disabledTimesArray[i - 1] + disabledTimesArray[i] === 2) {
            i++
            end = 8 + i
        }
        if (start !== undefined && end !== undefined) {
            timeOutArray.push(new TimeOut(start, end))
        }
        if (disabledTimesArray[disabledTimesArray.length - 1] === 1 && disabledTimesArray.length - 1 === i) {
            timeOutArray.push(new TimeOut(20, 21))
        }
    }
    return setOuts("/setTimeOuts", timeOutArray)
}

function generateDayOUtValues() {
    for (let i = 0; i < disabledDaysArray.length; i++) {
        dayOutArray[i].value = disabledDaysArray[i] === 1;
    }
    return setOuts("/setDayOuts", dayOutArray)
}

function saveValues() {
    Promise.all([generateTimeOutValues(), generateDayOUtValues()]).then(() => {
        openAlert("Erfolgreich gespeichert", SUCCESS)
        document.getElementById("saveButton").innerHTML = ""
    })

}

function setTimeOutArrayWithInc() {
    for (let i = 0; i < timeOutArray.length; i++) {
        let counter = timeOutArray[i].start
        while (counter < timeOutArray[i].end) {
            disabledTimesArray[timeOutArray[i].start + counter - timeOutArray[i].start - 8] = 1
            disableTimeEntity(null, true, timeOutArray[i].start + counter - timeOutArray[i].start - 8)
            console.log(timeOutArray[i].start + counter - timeOutArray[i].start - 8)
            counter++
        }
    }


}

function generateDayOut() {
    for (let i = 0; i < dayOutArray.length; i++) {
        if (dayOutArray[i].value) {
            disabledDaysArray[i] = 1
            disableDaysEntity(null, true, i + 1)
        }
    }

}


function disableTimes2(resetFlag = 1) {
    for (let i = 0; i < 13; i++) {
        let entity = document.getElementById(i.toString() + "_0")
        let entity2 = document.getElementById(i.toString() + "_8")
        entity.value = i
        entity2.value = i
        if (resetFlag === 0) {
            entity.removeEventListener("click", disableTimeEntity)
            entity2.removeEventListener("click", disableTimeEntity)
            entity.className = ""
            entity2.className = ""
        } else {
            disableDays2(0)
            entity.addEventListener("click", disableTimeEntity)
            entity2.addEventListener("click", disableTimeEntity)
            entity.className = "selected"
            entity2.className = "selected"

        }
    }
}

function generateViewSqlContainer(e) {
    const overview = document.getElementById("sqlContainer");
    overview.innerHTML=""
    if(e.target===undefined){
       currentSql=e
    }else {

        currentSql = parseInt(e.target.value)
    }
    let labelElement = document.createElement("div")
    labelElement.innerText=db[currentSql]
    labelElement.style.fontSize="30px"
    overview.appendChild(labelElement)

    switch (currentSql) {
        case 0:
            commonInterface(["Account/Station hinzufügen...","Station","Benutzername","Passwort"],createStationWithAccount)
            break;
        case 1:
            commonInterface(["Bewohner hinzufügen...","Station","Name","Raum"],createResident)
            break;
        /*case 2:
           // commonInterface(["Besucher hinzufügen...","Name","Mail","Bewohner"],createVisitor)
            break;*/
        case 2:
            commonInterface(["Tablet hinzufügen...","Name"],createTablet)
            break;
    }
    getter(requestName[currentSql]).then((accounts)=>{
        let container = document.createElement("div")
        container.style.height="700px"
        container.style.overflowY="scroll"
        overview.appendChild(container)
        if (accounts !== null) {
            for (let i = 0; i < accounts.length; i++) {
              //  let rs = Grooms[i].split(" ");
                const roomdiv = document.createElement("div")
                roomdiv.id = ("structs" + i);
                roomdiv.appendChild(document.createElement("br"))
                roomdiv.className = "dContainer"
                roomdiv.value = accounts[i]
                if (accounts[i].split(" ").length>1){
                    roomdiv.innerText = accounts[i].split(" ")[0]+"\n" +accounts[i].split(" ")[1];
                }else{
                    roomdiv.innerText = accounts[i].split(" ")[0]+"\n"+"°"
                }
                const a = document.createElement("div")
                a.className = "img"
                const img = document.createElement("img")
                img.src = "/static/media/img/profil.png"
                a.appendChild(document.createElement("br"))
                a.appendChild(img)
                img.className = "konfImg"
                roomdiv.addEventListener("click",dependingInterface)
                roomdiv.appendChild(a);
                container.appendChild(roomdiv)
              //  roomdiv.addEventListener("click", generateInterfaceRoom)
            }
        }
    })

}

function disableTimeEntity(e, flag = false, value = 0) {
    for (let i = 1; i < 8; i++) {
        if (flag) {
            document.getElementById(value + "_" + i.toString()).style.backgroundColor = "gray"
        } else {
            generateSaveButton(saveValues)
            if (document.getElementById(e.target.value.toString() + "_" + i.toString()).style.backgroundColor === "gray") {
                if (disabledDaysArray[i - 1] === 0) {
                    disabledTimesArray[e.target.value] = 0
                    document.getElementById(e.target.value.toString() + "_" + i.toString()).style.backgroundColor = "#7ff581"
                }
            } else {
                disabledTimesArray[e.target.value] = 1
                document.getElementById(e.target.value.toString() + "_" + i.toString()).style.backgroundColor = "gray"
            }
        }
    }
}


function disableDaysEntity(e, flag = false, value = 0) {
    for (let i = 0; i < 13; i++) {
        if (flag) {
            document.getElementById(i.toString() + "_" + value.toString()).style.backgroundColor = "gray"
        } else {
            generateSaveButton(saveValues)
            if (document.getElementById(i.toString() + "_" + e.target.cellIndex.toString()).style.backgroundColor === "gray") {
                if (disabledTimesArray[i] === 0) {
                    disabledDaysArray[e.target.cellIndex - 1] = 0
                    document.getElementById(i.toString() + "_" + e.target.cellIndex.toString()).style.backgroundColor = "#7ff581"
                }
            } else {
                disabledDaysArray[e.target.cellIndex - 1] = 1
                document.getElementById(i.toString() + "_" + e.target.cellIndex.toString()).style.backgroundColor = "gray"
            }
        }

    }
}


function disableDays2(resetFlag = 1) {
    for (let i = 0; i < 7; i++) {
        let entity = document.getElementById(weekdayEN[i])
        if (resetFlag === 0) {
            entity.removeEventListener("click", disableDaysEntity)
            entity.className = ""
        } else {
            disableTimes2(0)
            entity.addEventListener("click", disableDaysEntity)
            entity.className = "selected"
        }
    }
}


async function terminPlanerSettings() {
    document.getElementById("terminContainer").style.display = "block"
    document.getElementById("saveButton").style.display = "block"
    document.getElementById("sqlContainer").style.display = "none"
    document.getElementById("sqlInterface").style.display = "none"
    timeOutArray = await getter("/getTimeOut")
    dayOutArray = await getter("/getDayOuts")
    station = await getter("/getAllStation")
    setTimeOutArrayWithInc()
    generateDayOut()
    let container = settingInit(0)
    buttonGeneratorPlain(terminButtons, terminFunctions, container)
}

function getAllSettingsReservation(e) {
    //setPlaceHolderBackground(e.target.value)
    checkAuthentication()
    createDivsReservation().then(() => {
        createLogOutButton()
        initTerminTable().then(() => {
            deleteAllEventListener()
            document.getElementById("prevWeek").removeEventListener("click", prevWeeks)
            document.getElementById("nextWeek").removeEventListener("click", nextWeek)
            document.styleSheets[2].rules[11].style.backgroundColor = "#7ff581"
            document.styleSheets[2].rules[9].style.opacity = "1"
            document.styleSheets[2].rules[9].style.cursor = "default"
            document.getElementById("week").remove()
            dropMenuReservation(reservButtons, reservFuntions)
            terminPlanerSettings()
        })
    })

}


function createDivsReservation() {
    return new Promise(((resolve, reject) => {
        let main = document.getElementById("main")
        main.innerHTML = ""
        let div = document.createElement("div")
        div.id = "title"
        setStyleWithOutFloat(div)
        div.innerText = "Verwaltung-Terminplaner"
        main.appendChild(div)
        let configureContainer = document.createElement("div")
        configureContainer.id="configureContainer"
        main.appendChild(configureContainer)
        div = document.createElement("div")
        div.id = "settingDropbox"
        div.style.width="90%"
        setStyleWithOutFloat(div)
        configureContainer.appendChild(div)
        div = document.createElement("div")
        div.id = "settingView"
        div.style.width="90%"
        setStyleWithOutFloat(div)
        configureContainer.appendChild(div)
        div = document.createElement("div")
        div.id = "saveButton"
        div.style.width="90%"
        setStyleWithOutFloat(div)
        configureContainer.appendChild(div)
        div = document.createElement("div")
        div.id = "sqlContainer"
        document.getElementById("main").appendChild(div)
        div = document.createElement("div")
        div.id = "sqlInterface"
        document.getElementById("main").appendChild(div)
        let temp = document.createElement("div")
        temp.id = "terminContainer"
        main.appendChild(temp)
        main = temp
        temp = document.createElement("div")
        temp.id = "termin"
        temp.style.float = "unset"
        temp.style.clear = "unset"
        main.appendChild(temp)
        let table = document.createElement("table")
        table.id = "terminTable"
        temp.appendChild(table)
        let caption = document.createElement("caption")
        caption.id = "week"
        table.appendChild(caption)

        let tr = document.createElement("tr")
        let tbody = document.createElement("tbody")
        table.appendChild(tbody)
        tbody.appendChild(tr)
        let th = document.createElement("th")
        th.id = "prevWeek"
        th.value = -1
        th.innerText = "<"
        tr.appendChild(th)
        for (let i = 0; i < weekdayEN.length + 1; i++) {
            th = document.createElement("th")
            th.id = weekdayEN[i]
            th.className = "days"
            th.innerText = weekday[i]
            tr.appendChild(th)
        }
        th.id = "nextWeek"
        th.value = 1
        th.innerText = ">"
        tr.appendChild(th)
        resolve(true)
    }))

}



function commonInterface(array,callback) {
    document.styleSheets[3].cssRules[10].style.visibility="hidden"
    const contianer = document.getElementById("sqlInterface")
    contianer.innerHTML=""
    let captionElement = document.createElement("caption")
    if(array!==null){
        captionElement.innerText=array[0]
        contianer.appendChild(captionElement)
        let exitButton = document.createElement("button")
        exitButton.innerText ="❌"
        exitButton.id="exitButton"
        exitButton.addEventListener("click",resetView)
        captionElement.appendChild(exitButton)
        let labelElement
        let input
        for(let i=1;i<array.length;i++){
            labelElement = document.createElement("div")
            labelElement.innerText=array[i]
            labelElement.className="labelReserv"
            input = document.createElement("input")
            input.type="text"
            input.id=array[i]
            if(array[i]==="Station"){
                let autoDiv = document.createElement("div")
                autoDiv.className="autocomplete"
                input.autocomplete="on"
                input.id="myInput"
                autocomplete(input,station)
                autoDiv.appendChild(input)
                contianer.appendChild(labelElement)
                contianer.appendChild(autoDiv)
                let editButton = document.createElement("img")
                editButton.src="/static/media/img/pen.png"
                editButton.className ="editButton"
                editButton.addEventListener("click",editDiv)
                autoDiv.appendChild(editButton)

            }else{
                contianer.appendChild(labelElement)
                contianer.appendChild(input)
                let editButton = document.createElement("img")
                editButton.src="/static/media/img/pen.png"
                editButton.className ="editButton"
                editButton.addEventListener("click",editDiv)
                contianer.appendChild(editButton)
            }
            if(i===array.length-1){
                let tabletDiv = document.createElement("div")
                tabletDiv.id ="tabletMaintenance"
                contianer.appendChild(tabletDiv)

                let divElement=document.createElement("div")
                let button =document.createElement("button")
                divElement.appendChild(button)
                contianer.appendChild(divElement)
                button.className="logOutAdmin"
                button.innerText="Hinzufügen"
                button.id ="sqlExecuteAdd"
                button.addEventListener("click",callback)

                button =document.createElement("button")
                button.className="logOutAdmin"
                button.innerText="Speichern"
                button.id ="sqlExecuteUpdate"
                button.addEventListener("click",executeUpdate)
                divElement.appendChild(button)
            }
        }
    }


}

function setStyleWithOutFloat(divElement) {
    divElement.style.float="unset"
    divElement.style.clear="unset"

}

function createTablet() {
    let name = document.getElementById("Name").value
    if(name!==""){
        let tablet = new Tablet(0,name,false)
        let tabletPromise = setOuts("/addTablet", tablet)
        tabletPromise.then(() => {
            openAlert("Tabletname fehlt", SUCCESS)
            setTimeout(function () {
                resetView()
            },1000)

        })
    }else{
        openAlert("Tabletname fehlt", FAIL)
    }
}

function createStationWithAccount() {
    let stationValue,name,passwort
    stationValue=document.getElementById("myInput").value
    name = document.getElementById("Benutzername").value
    passwort = document.getElementById("Passwort").value
    if(name===""||passwort===""||stationValue===""){
        openAlert("Bitte alle Felder ausfüllen",FAIL)
        return;
    }
    getter("/getAccountByName?name="+name).then((val)=>{
        if (val!==0){
            console.log(val)
            openAlert("Benutzername bereits vergeben",FAIL)
        }
        else{
            if(station!==null){
                for(let i=0;i<station.length;i++){
                    if(stationValue===station[i]){
                        openAlert("Station exisitiert bereits",FAIL)
                        return
                    }
                }
            }
            createStation(stationValue).then(()=>{
                getStationByName(stationValue).then((id)=>{
                    createUser(0,name,passwort,2,parseInt(id)).then(()=>{
                        openAlert("Account und Station hingefügt",SUCCESS)
                        setTimeout(function () {
                            resetView()
                        },1000)
                    })
                })
            })
        }
    })

}

function createResident() {
    let stationValue,name,raum
    stationValue=document.getElementById("myInput").value
    name = document.getElementById("Name").value
    raum = document.getElementById("Raum").value
    if(stationValue===""||name===""||raum===""){
        openAlert("Bitte alle Felder ausfüllen",FAIL)
        return;
    }
    for(let i=0;i<station.length;i++) {
        if (stationValue !== station[i]) {
           if(i===station.length-1){
               openAlert("Station exisitiert nicht", FAIL)
               return
           }
        }else {
            break;
        }

    }
    createRoom(name,stationValue,raum).then(()=>{
        openAlert("Erfolgreich hingefügt",SUCCESS)
        setTimeout(function () {
            resetView()
        },1000)
    })

}


function createVisitor(){

}

async function createRoom(name, stationName, roomNumber) {
    //if (document.cookie !== "") {
   let val= await getter("/getAllRoomNames")
   let valLength=0;
    let api, i, len, method, params, ref, urls;
    api = new BigBlueButtonApi(sessionStorage.getItem("BigBlueButton")+
        "/bigbluebutton/api", sessionStorage.getItem("SharedKey"));

    //const username = document.getElementById("name").value
    // A hash of parameters.
    // The parameter names are the same names BigBlueButton expects to receive in the API calls.
    // The lib will make sure that, for each API call, only the parameters supported will be used.

    if(val!==null){
     valLength=val.length
    }

    params = {
        name: name,
        meetingID: valLength,
        moderatorPW: "mp",
        attendeePW: "ap",
        password: "ap", // usually equals "moderatorPW"
        welcome: "<br>Welcome to <b>%%CONFNAME%%</b>!",
        fullName: name,
        publish: false,
        // random: "416074726",
        record: false,
        // recordID: "random-9998650",

        meta_anything: "My Meta Parameter",
        custom_customParameter: "Will be passed as 'customParameter' to all calls"
    };
    urls = [];
    ref = api.availableApiCalls();
    //console.log(ref)
    for (i = 0, len = ref.length; i < len; i++) {
        method = ref[i];
        urls.push({
            name: method,
            url: api.urlFor(method, params)
        });
    }
    console.log(urls)
    params.password = "ap"
    params.fullName = "Besucher"
    let vistor = api.urlFor('join', params)
    let room = new Room(name, 1, urls[2].url, urls[1].url, vistor.toString());
    room.meetingRunningLink = urls[3].url
    //console.log(urls[3].url)
    room.room = roomNumber
    room.station_id = await getStationByName(stationName)
    await sendRoomPost(JSON.stringify(room))
    //}
}

function dependingInterface(e) {
    document.styleSheets[3].cssRules[10].style.visibility="visible"
    let executeButtonAdd = document.getElementById("sqlExecuteAdd")
    executeButtonAdd.style.display ="none"
    let executeButtonUpdate =  document.getElementById("sqlExecuteUpdate")
    executeButtonUpdate.style.display ="block"
    switch (currentSql) {
        case 0:
            editAccount(this.value)
            break;
        case 1:
            editResident(this.value)
            break;
        case 2:
            editTablet(this.value)
            break;

    }
}

function editAccount(value) {
    let divStation,divName,divPassword
    divStation = document.getElementById("myInput")
    divName = document.getElementById("Benutzername")
    divPassword = document.getElementById("Passwort")
    getter("/getAccountByName?name="+value).then(
        (id)=>{
            toBeEditedEntity = id
            getter("/getUserByID?id="+id).then((account)=>{
                divStation.value = account.station_id
                divStation.readOnly ="true"
                divStation.style.backgroundColor="#f1f1f1"
                let editButtons = document.getElementsByClassName("editButton")
                editButtons[0].style.visibility="hidden"
                divName.value = account.username
                divName.readOnly ="true"
                divName.style.backgroundColor="#f1f1f1"
                divPassword.value=account.password
                divPassword.readOnly ="true"
                divPassword.style.backgroundColor="#f1f1f1"
            })
    })
}


 function editResident(value) {
    let divStation,divName,divRaum
    divStation = document.getElementById("myInput")
    divName = document.getElementById("Name")
    divRaum = document.getElementById("Raum")

    getter("/getRoomIDByName?Name="+value).then((residentID)=> {
        toBeEditedEntity = residentID
       getter("/getRoomByID?ID="+residentID).then((resident)=>{
           getter("/getStationByID?ID="+resident.station_id).then((incStation)=>{
               divStation.value = incStation.name
               divStation.readOnly ="true"
               divStation.style.backgroundColor="#f1f1f1"
               divName.value = resident.name
               divName.readOnly ="true"
               divName.style.backgroundColor="#f1f1f1"
               divRaum.value=resident.room
               divRaum.readOnly ="true"
               divRaum.style.backgroundColor="#f1f1f1"
           })
        })
    })
}



function editTablet(value) {
    let divTablet = document.getElementById("tabletMaintenance")
    divTablet.style.display="block"
    divTablet.innerHTML=""
    let divElement = document.createElement("div")
    divElement.innerText ="in Wartung..."
    divElement.className ="labelReserv"
    divElement.id ="maintenanceLabel"
    let button = document.createElement("button")
    button.innerText ="✔"
    button.style.color = SUCCESS
    button.value = 0
    button.addEventListener("click",toggleMaintenance)
    let button2 =document.createElement("button")
    button.className="maintenanceButton"
    button2.className="maintenanceButton"
    button2.innerText ="✖"
    button2.value = 1
    button2.style.color = FAIL
    button2.addEventListener("click",toggleMaintenance)
    divTablet.appendChild(divElement)
    divTablet.appendChild(button)
    divTablet.appendChild(button2)
    let div = document.getElementById("Name")
    getter("/getTabletByName?name="+value).then((tablet)=>{
        toBeEditedEntity = tablet.id
        div.value = tablet.name
        div.readOnly ="true"
        div.style.backgroundColor="#f1f1f1"
        let buttons = document.getElementsByClassName("maintenanceButton")
        if(tablet.maintenance){
            buttons[0].className  ="maintenanceButton-Aktiv maintenanceButton"
        }else{
            buttons[1].className  ="maintenanceButton-Aktiv maintenanceButton"
        }
    })

}


function resetView() {
    generateViewSqlContainer(currentSql)
}

function editDiv(e){
    let editDiv = e.target.previousSibling
    editDiv.readOnly=false
    editDiv.style.backgroundColor="white"
}

function toggleMaintenance() {
    let buttons = document.getElementsByClassName("maintenanceButton")
    for(let i =0;i<buttons.length;i++){
        if(i===parseInt(this.value)){
            buttons[i].className="maintenanceButton-Aktiv maintenanceButton"
            console.log(this.value)
        }else{
            buttons[i].className="maintenanceButton"
        }
    }

}

function executeUpdate() {
    let divStation,divName,divPass,maintenance,divRoom
    switch (currentSql) {
        case 0:
            divStation = document.getElementById("myInput")
            divName = document.getElementById("Benutzername")
            divPass = document.getElementById("Passwort")
            getter("/getUserByID?id="+toBeEditedEntity).then((acc)=>{
                if(acc.username !==divName.value||acc.password!==divPass.value){
                    if(acc.username !==divName.value){
                        acc.username = divName.value
                    }else{
                        acc.password=divPass.value
                    }
                    getterPOst("/updateAccount",acc,true)
                }else{
                    openAlert("Erfolgreich gespeichert",SUCCESS)
                }
            })
            break;
        case 1:
            divStation = document.getElementById("myInput")
            divName = document.getElementById("Name")
            divRoom = document.getElementById("Raum")
            getter("/getRoomByID?ID="+toBeEditedEntity).then((resident)=>{
                getter("/getAllStationByName?name="+divStation.value).then((stations)=>{
                    if(resident.name !==divName.value||resident.station_id!==stations||divRoom.value!==resident.room){
                        resident.name =divName.value
                        resident.station_id=stations
                        resident.room =divRoom.value
                        getterPOst("/updateResident",resident,true)
                    }else{
                        openAlert("Erfolgreich gespeichert",SUCCESS)
                    }
                })
            })

            break;
        case 2:
            divName = document.getElementById("Name")
            maintenance = document.getElementsByClassName("maintenanceButton-Aktiv")[0].value
            maintenance = parseInt(maintenance) === 0;
            getter("/getTabletByID?id="+toBeEditedEntity).then((tablet)=>{
                if(tablet.name !== divName.value||tablet.maintenance!==maintenance){
                    tablet.name = divName.value
                    tablet.maintenance = maintenance
                    getterPOst("/updateTablet",tablet,true)
                }else{
                    openAlert("Erfolgreich gespeichert",SUCCESS)
                }

            })
            break;
    }

    setTimeout(function () {
        resetView()
    },1000)
    toBeEditedEntity = undefined

}
