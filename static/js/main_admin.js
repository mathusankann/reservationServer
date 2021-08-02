//const mainFunctions=[expandMenu,()=>{ location.reload()},getAllSettingsBBB,getSettingsDocker,getAllSettingsReservation,setTraefikInSite] ()=>{location.href="/static/htmls/configHome.html"}


let test2 = setInterval(function () {
    clearInterval(test2)
}, 100)


const mainFunctions = [
    expandMenu,
    () => {
        location.href = "/static/htmls/configBBB.html"
    },
    () => {
        location.href = "/static/htmls/configDocker.html"
    },
    () => {
        location.href = "/static/htmls/configReserv.html"
    },
    () => {
        location.href = "/static/htmls/configTraefik.html"
    }
]


function checkAuthentication() {
    if (document.cookie === "" || (!document.cookie.includes("admin"))) {
        console.log(document.cookie.includes("admin"))
        location.href = "/"
        return "user"
    } else {
        return "admin"
    }
}

function generateIconOverviewAdmin() {
    checkAuthentication()
    generateIconOverview("/static/htmls/icon.json",mainFunctions)

}

function generateIconOverview(path,array) {
    const div = document.getElementById("iconBox")
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if ((4 === this.readyState) && (200 === this.status)) {
            let imageList = JSON.parse(this.responseText)
            for (let i = 0; i < imageList.length; i++) {
                let image = document.createElement("img")
                image.src = '/static/media/img/' + imageList[i].name
                image.className = "icon"
                image.value = i
                let container = document.createElement("div")
                container.className = "placeHolder"
                container.appendChild(image)
                container.addEventListener("click", array[i])
                if (i === 0) {
                    container.style.visibility = "hidden"
                }
                div.appendChild(container)
            }
        }
    }
    request.open("GET", path, true);
    request.send();
}


function expandMenu() {
    const icons = document.getElementById("iconBox")
    openNav()

}

/* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}


function setPlaceHolderBackground(value = 2) {
    const icons = document.getElementById("iconBox")
    for (let i = 0; i < icons.childNodes.length; i++) {
        icons.childNodes[i].className = "placeHolder"
        console.log(value)
        if (value === i) {
            icons.childNodes[i].className = "placeHolder placeHolder-selected"
        }
    }
}

function setTraefikInSite() {
    checkAuthentication()
    const main = document.getElementById("main")
    main.innerHTML = ""
    let div = document.createElement("div")
    div.id = "title"
    div.innerText = "Traefik"
    main.appendChild(div)
    let iframe = document.createElement("iframe")
    iframe.src = "http://docker.jitsi-mathu.de/"
    iframe.id = "traefik"
    main.appendChild(iframe)
    createLogOutButton()
}

function createLogOutButton() {
    let title = document.getElementById("title")
    let button = document.createElement("button")
    button.className = "logOutAdmin"
    button.innerText = "Logout"
    button.style.float = "right"
    button.addEventListener("click", logOut)
    title.appendChild(button)
}

function logOut() {
    getter("/removeAuthenticateUser?key=" + document.cookie.split('=')[1]).then(() => {
        location.href = "/"
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    })
}

function dropMenuReservation(buttons, callbacks) {
    const div = document.getElementById("settingDropbox")
    div.innerHTML = ""
    let container = document.createElement("div")
    container.className = "container"
    container.id = "buttonContainer"
    div.appendChild(container)
    for (let i = 0; i < buttons.length; i++) {
        let button = document.createElement("button")
        button.innerText = buttons[i]
        button.addEventListener("click", callbacks[i])
        container.appendChild(button)
        button.className = "button"
    }
}

function buttonGeneratorPlain(array, functionStringCallback, container) {
    for (let i = 0; i < array.length; i++) {
        let button = document.createElement("button")
        button.innerText = array[i]
        button.value = i
        button.className = "button"
        button.addEventListener("click", functionStringCallback[i])
        container.appendChild(button)
    }
}

function generateSaveButton(callback) {
    const saveButton = document.getElementById("saveButton")
    saveButton.innerHTML = ""
    let container = document.createElement("div")
    saveButton.appendChild(container)
    container.className = "container"
    let button = document.createElement("button")
    button.innerText = "Speichern"
    button.className = "imgSetting"
    button.onclick = callback
    container.appendChild(button)
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


function getRunningCon() {
    getter("/getAllRoomNames").then((val)=>{
        return new Promise(((resolve, reject) => {
            let api, i, len, method, params, ref, urls;
            api = new BigBlueButtonApi("https://mathu.jitsi-mathu.de/bigbluebutton/api/", "Eh7iAAkg9cib4wObQv5gADIE2OlNeo9gKEnyYitl");
            //todo shared secret request
            //const username = document.getElementById("name").value
            // A hash of parameters.
            // The parameter names are the same names BigBlueButton expects to receive in the API calls.
            // The lib will make sure that, for each API call, only the parameters supported will be used.
            params = {
                name: name,
                meetingID: val.length.toString(),
                moderatorPW: "mp",
                attendeePW: "admin",
                password: "admin", // usually equals "moderatorPW"
                welcome: "<br>Welcome to <b>%%CONFNAME%%</b>!",
                fullName: "Admin",
                publish: false,
                // random: "416074726",
                record: false,
                // recordID: "random-9998650",
                //voiceBridge: "75858",
                meta_anything: "My Meta Parameter",
                custom_customParameter: "Will be passed as 'customParameter' to all calls"
            };
            urls = [];
            ref = api.availableApiCalls();
            for (i = 0, len = ref.length; i < len; i++) {
                method = ref[i];
                urls.push({
                    name: method,
                    url: api.urlFor(method, params)
                });
            }
            console.log(urls)
            resolve(urls[6])
        }))
    })

}