let reservFuntions = [terminPlanerSettings ]
let reservButtons = ["Terminplaner Konfigurator"]
let terminButtons = ["Zeiten", "Tage"]
let terminFunctions = [disableTimes2, disableDays2]

let disabledTimesArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let disabledDaysArray = [0, 0, 0, 0, 0, 0, 0]

let timeOutArray = []
let dayOutArray = []



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
    Promise.all( [generateTimeOutValues(), generateDayOUtValues()]).then(()=>{
        openAlert("Erfolgreich gespeichert",SUCCESS)
        document.getElementById("saveButton").innerHTML=""
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
            disableDaysEntity(null, true, i)
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

    timeOutArray = await getter("/getTimeOut")
    dayOutArray = await getter("/getDayOuts")
    setTimeOutArrayWithInc()
    generateDayOut()


    let container = settingInit(0)
    buttonGeneratorPlain(terminButtons, terminFunctions, container)
}

function getAllSettingsReservation(e) {
    currentButton=undefined
    setPlaceHolderBackground(e.target.value)
    createDivsReservation().then(() => {
        initTerminTable().then(() => {
            deleteAllEventListener()
            document.getElementById("prevWeek").removeEventListener("click", prevWeeks)
            document.getElementById("nextWeek").removeEventListener("click", nextWeek)
            document.styleSheets[2].rules[11].style.backgroundColor = "#7ff581"
            document.styleSheets[2].rules[9].style.opacity = "1"
            document.styleSheets[2].rules[9].style.cursor = "default"
            document.getElementById("week").remove()
            dropMenuReservation(reservButtons, reservFuntions)
        })
    })

}


function createDivsReservation() {
    return new Promise(((resolve, reject) => {
        let main = document.getElementById("main")
        main.innerHTML = ""
        let div = document.createElement("div")
        div.id = "title"
        div.innerText = "Verwaltung-Terminplaner"
        main.appendChild(div)

        div = document.createElement("div")
        div.id = "settingDropbox"
        main.appendChild(div)

        div = document.createElement("div")
        div.id = "settingView"
        main.appendChild(div)

        div = document.createElement("div")
        div.id = "saveButton"
        main.appendChild(div)

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
