//const mainFunctions=[expandMenu,()=>{ location.reload()},getAllSettingsBBB,getSettingsDocker,getAllSettingsReservation,setTraefikInSite]

const mainFunctions=[
    expandMenu,
    ()=>{location.href="/static/htmls/configHome.html"},
    ()=>{location.href="/static/htmls/configBBB.html"},
    ()=>{location.href="/static/htmls/configDocker.html"},
    ()=>{location.href="/static/htmls/configReserv.html"},
    ()=>{location.href="/static/htmls/configTraefik.html"}
]




function generateIconOverview() {
    const div= document.getElementById("iconBox")
    const request = createAjaxRequest();
    request.onreadystatechange = function () {
        if ((4 === this.readyState) && (200 === this.status)) {
            let imageList = JSON.parse(this.responseText)
            for (let i = 0; i < imageList.length; i++) {
                let image = document.createElement("img")
                image.src = '/static/media/img/' + imageList[i].name
                image.className="icon"
                image.value = i
                let container = document.createElement("div")
                container.className="placeHolder"
                container.appendChild(image)
                container.addEventListener("click",mainFunctions[i])
                div.appendChild(container)

            }
        }
    }
    request.open("GET", "icon.json", true);
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


function setPlaceHolderBackground(value=2) {
    const icons = document.getElementById("iconBox")
    for(let i =0;i<icons.childNodes.length;i++){
        icons.childNodes[i].className="placeHolder"
        console.log(value)
        if(value === i){
            icons.childNodes[i].className="placeHolder placeHolder-selected"
        }
    }
}

function setTraefikInSite(e) {
    setPlaceHolderBackground(e.target.value)
    const main= document.getElementById("main")
    main.innerHTML=""
    let div = document.createElement("div")
    div.id="title"
    div.innerText="Traefik"
    main.appendChild(div)
    let iframe = document.createElement("iframe")
    iframe.src="http://docker.jitsi-mathu.de/"
    iframe.id="traefik"
    main.appendChild(iframe)
}

function logOut() {
    location.href="localhost/"
}

function dropMenuReservation(buttons,callbacks) {
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

function buttonGeneratorPlain(array,functionStringCallback,container) {
    for (let i = 0; i < array.length; i++) {
        let button = document.createElement("button")
        button.innerText = array[i]
        button.className = "button"
        button.addEventListener("click",functionStringCallback[i])
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