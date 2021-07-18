let imgArray = []
let focusImage = 0
const buttonNames = ["Aktionsbar", "Navigationsbar", "Chat", "Benutzerliste", "Präsentation", "Zurücksetzen"]
const settingButtonNames = ["Maximiert", "Minimiert", "Deaktviert"]
const settingButton = ["Aktiviert", "Deaktiviert"]
const settingActionBar = ["Deaktiviert", "Default", "Medium", "Max"]
const functionNames = [settingViewActionBar, settingViewNavigationBar, settingViewChat, settingViewUserList, settingViewPresentation, resetView]

let currentView = 0
let flagChanged = false
const INFOCUS = "imgPreview inFocus"
const OFFFOCUS = "imgPreview outOfFocus"

let currentButton
let settings
let currentSettings

async function getAllSettings() {
    settings = await getter("/getKonfSettings")
    changePicture()
    generateUserDropMenu().then(() => {

    })

}

function setEventListenerUnload() {
    flagChanged = true
    window.onbeforeunload = function () {
        return "";
    };
}

function generateUserDropMenu() {
    return new Promise(((resolve, reject) => {
        const div = document.getElementById("dropBoxUser")
        let container = document.createElement("div")
        container.className = "container"
        let dropdown = document.createElement("select")
        dropdown.name = "User"
        dropdown.id = "user"
        for (let i = 0; i < settings.length; i++) {
            let option = document.createElement("option")
            option.value = i.toString()
            option.innerText = settings[i].user
            dropdown.appendChild(option)
            option.addEventListener("click", (e) => {
                if (currentSettings !== undefined) {
                    settings[currentView].value = currentSettings
                }
                currentView = e.target.value
                currentSettings = settings[e.target.value].value

                dropMenu()

                if (!flagChanged) {
                    generateLiveViewButton()
                } else {
                    generateSaveButton()
                }
            })
            if (i === 1) {
                option.click()
            }
        }
        container.appendChild(dropdown)
        div.appendChild(container)
        resolve(true)
    }))

}

function dropMenu() {
    const div = document.getElementById("settingDropbox")
    div.innerHTML = ""
    let container = document.createElement("div")
    container.className = "container"
    container.id = "buttonContainer"
    div.appendChild(container)
    for (let i = 0; i < buttonNames.length; i++) {
        let button = document.createElement("button")
        if (i === 0) {
            button.innerText = buttonNames[i] + ":" + settingActionBar[currentSettings[i]]
        } else if (i === 1) {
            button.innerText = buttonNames[i] + ":" + settingButton[currentSettings[i]]
        } else if (i === buttonNames.length - 1) {
            button.innerText = buttonNames[i]
        } else {
            button.innerText = buttonNames[i] + ":" + settingButtonNames[currentSettings[i]]
        }
        if(currentButton===i){
            button.className = "button selectedSetting"
        }else{
            button.className = "button"
        }

        button.addEventListener("click", functionNames[i])
        container.appendChild(button)
    }

}

function changePicture() {
    loadAllPictures()
}

function loadAllPictures() {
    initPreview()
    //settingViewActionBar()

}


function settingInit(e) {
    const view = document.getElementById("settingView")
    view.innerHTML = ""
    let container = document.createElement("div")
    container.id = "imgContainer"
    container.className = "container"
    view.appendChild(container)

    if (currentButton !== undefined) {
        document.getElementById("buttonContainer").children[currentButton].className = "button"
    }
    currentButton = e
    document.getElementById("buttonContainer").children[currentButton].className = "button selectedSetting"

    return container
}


function settingViewActionBar() {
    let container = settingInit(0)
    if (currentSettings[0] === 1) {
        toggle(1, focusImage)
    } else if (currentSettings[0] === 0) {
        toggle(2, focusImage)
    } else if (currentSettings[0] === 2) {
        toggle(3, focusImage)
    } else {
        toggle(4, focusImage)
    }

    imageGenerator("actionNone", container, () => {
        togglePreview(focusImage, 2, 0, 0, "imgContainer", "Actionsbar:Deaktviert", 0)
    }, 0, 0)
    imageGenerator("actiondefault", container, () => {
        togglePreview(focusImage, 1, 0, 1, "imgContainer", "Actionsbar:Default", 0)
    }, 1, 0)
    imageGenerator("actionMedium", container, () => {

        togglePreview(focusImage, 3, 0, 2, "imgContainer", "Actionsbar:Medium", 0)
    }, 2, 0)
    imageGenerator("actionMax", container, () => {
        togglePreview(focusImage, 4, 0, 3, "imgContainer", "Actionsbar:Max", 0)
    }, 3, 0)
}


function settingViewNavigationBar() {
    toggler(5, 1)
    let container = settingInit(1)
    buttonGenerator(container, settingButton, 5, 1)
}


function settingViewChat() {
    let container = settingInit(2)
    toggler(7, 2)
    buttonGenerator(container, settingButtonNames, 7, 2)

}

function settingViewUserList() {
    let container = settingInit(3)
    toggler(10, 3)
    buttonGenerator(container, settingButtonNames, 10, 3)
}

function settingViewPresentation() {
    let container = settingInit(4)
    toggler(13, 4)
    buttonGenerator(container, settingButtonNames, 13, 4)
}

function resetView() {
    currentSettings = [1, 0, 0, 0, 0]
    const div = document.getElementById("settingDropbox")
    div.innerHTML = ""
    setEventListenerUnload()
    dropMenu()
    document.getElementById("saveButton").innerHTML = ""
    generateSaveButton()

}

function initPreview() {
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if ((4 === this.readyState) && (200 === this.status)) {
            let imageList = JSON.parse(this.responseText)
            const div = document.getElementById("preview")
            div.innerHTML = ""
            //console.log(imageList)
            for (let i = 0; i < imageList.length; i++) {
                let image = document.createElement("img")
                image.src = '../bbb-views/' + imageList[i].name + ".png"
                image.className = INFOCUS
                imgArray.push(image)
                div.appendChild(image)
                if (i > 0) {
                    image.className = OFFFOCUS
                }
            }
        }
    }
    request.open("GET", "name.json", true);
    request.send();
}

function imageGenerator(name, container, callback, place, arrayPlace) {
    let image = document.createElement("img")
    image.src = '../bbb-views/' + name + ".png"
    image.className = "imgSetting"
    image.addEventListener("click", callback)
    container.appendChild(image)
    if (place === currentSettings[arrayPlace]) {
        image.className = "imgSetting selected"
    }
}

function buttonGenerator(container, array, offset, settingPlace) {
    for (let i = 0; i < array.length; i++) {
        let button = document.createElement("button")
        button.innerText = array[i]
        button.className = "imgSetting"
        button.addEventListener("click", () => {
            if (settingPlace === 1) {
                if (i === 0) {
                    togglePreview(focusImage, i + offset, settingPlace, i, "imgContainer", "Navigationbar:Aktiviert", settingPlace)
                } else {
                    togglePreview(focusImage, i + offset, settingPlace, i, "imgContainer", "Navigationbar:Deaktiviert", settingPlace)
                }
            } else {
                togglePreview(focusImage, i + offset, settingPlace, i, "imgContainer", buttonNames[settingPlace] + ":" + settingButtonNames[i], settingPlace)

            }
        })
        container.appendChild(button)
        if (i === currentSettings[settingPlace]) {
            button.className = "imgSetting selected"
        }
    }
}


function togglePreview(oldImage, newImage, settingPlace, setplace, divID, name, child) {
    document.getElementById(divID).children[currentSettings[settingPlace]].className = "imgSetting"
    currentSettings[settingPlace] = setplace
    document.getElementById(divID).children[setplace].className = "imgSetting selected"
    document.getElementById("buttonContainer").children[child].textContent = name
    if (newImage !== oldImage) {
        setEventListenerUnload()
        document.getElementById("saveButton").innerHTML = ""
        imgArray[newImage].className = INFOCUS
        imgArray[oldImage].className = OFFFOCUS
        focusImage = newImage
        generateSaveButton()
    }

}


function toggle(newImage, oldImage) {
    if (newImage !== oldImage) {
        imgArray[newImage].className = INFOCUS
        imgArray[oldImage].className = OFFFOCUS
        focusImage = newImage
    }
}

function toggler(start, settingsPlace) {
    if (currentSettings[settingsPlace] === 0) {
        toggle(start, focusImage)
    } else if (currentSettings[settingsPlace] === 1) {
        toggle(start + 1, focusImage)

    } else if (currentSettings[settingsPlace] === 2) {
        toggle(start + 2, focusImage)
    } else {
        toggle(start + 3, focusImage)
    }
}

function generateLiveViewButton() {
    const saveButton = document.getElementById("saveButton")
    saveButton.innerHTML = ""
    let container = document.createElement("div")
    saveButton.appendChild(container)
    container.className = "container"
    let button = document.createElement("button")
    button.innerText = "Live-Ansicht"
    button.className = "imgSetting"
    container.appendChild(button)
}

function generateSaveButton() {
    const saveButton = document.getElementById("saveButton")
    saveButton.innerHTML = ""
    let container = document.createElement("div")
    saveButton.appendChild(container)
    container.className = "container"
    let button = document.createElement("button")
    button.innerText = "Speichern"
    button.className = "imgSetting"
    button.onclick = setSettings
    container.appendChild(button)
}

function setSettings() {
    window.onbeforeunload = function () {
        // blank function do nothing
    }
    document.getElementById("saveButton").innerHTML = ""
    generateLiveViewButton()
    const div = document.getElementById("dropBoxUser")
    settings[div.children[0].value].value = currentSettings
    flagChanged = false
    setOuts("/setKonfSettings", settings)
}

