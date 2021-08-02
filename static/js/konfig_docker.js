let docker


async function getSettingsDocker() {
    checkAuthentication()
    docker = await getter("/getAllDockerContainer")
    createDivs()

}

function createDivs() {
    const main = document.getElementById("main")
    main.innerHTML = ""
    let div = document.createElement("div")
    div.id = "title"
    div.innerText = "Konfigurator-Docker"
    main.appendChild(div)
    div = document.createElement("div")
    div.id = "dockerContainer"
    main.appendChild(div)
    div = document.createElement("div")
    div.id = "dockerSetter"
    main.appendChild(div)
    setDockerContainer()
    createLogOutButton()
}

function setDockerContainer() {
    const dContainer = document.getElementById("dockerContainer")
    if(docker!==null) {
        for (let i = 1; i < docker.length - 1; i++) {
            let container = document.createElement("div")
            container.id = "structs" + i
            container.appendChild(document.createElement("br"))
            container.className = "dContainer"
            container.value = i
            container.innerText = docker[i][0]
            container.addEventListener("click", setDockerSettingView)
            const a = document.createElement("div")
            a.className = "img"
            const img = document.createElement("img")
            img.src = "/static/media/img/docker_icon.png"
            a.appendChild(document.createElement("br"))
            a.appendChild(img)
            img.className = "konfImg"
            container.appendChild(a);
            dContainer.appendChild(container)
            const activ = document.createElement("img")
            if (docker[i][4].includes("Up")) {
                activ.src = "/static/media/img/Green_Point.gif"
            } else {
                activ.src = "/static/media/img/redpoint.gif"
            }
            activ.className = "activind"
            container.appendChild(activ)
        }
    }

}

function setDockerSettingView() {
    const setter = document.getElementById("dockerSetter")
    setter.innerHTML=""
    setter.appendChild(document.createElement("br"))
    let div = document.createElement("div")
    div.className="setterContainer"
    let counter =0;
    for (let i=0;i<docker[0].length;i++){
        let labelDiv = document.createElement("div")
        labelDiv.innerText=docker[0][i].toString('utf-8')
        labelDiv.className="containerLabel"
        div.appendChild(labelDiv)
        let dockerDiv = document.createElement("div")
        dockerDiv.className="containerContent"
        if(docker[this.value].length<=6&&(i===5||i===6)){
            if (counter===0){
                dockerDiv.innerText=""
                counter++
            }else{
                dockerDiv.innerText=decodeURIComponent( docker[this.value][i-counter])
                counter =0
            }
        }else{
            dockerDiv.innerText= decodeURIComponent( docker[this.value][i])
            console.log(docker[this.value][i])
        }

        div.appendChild(dockerDiv)
    }
    setter.appendChild(div)
    let button = document.createElement("button")
    button.className="dockerButtons"
    button.innerText="Starten"
    button.addEventListener("click",()=>{
       let array =["docker","start",this.firstChild.data.replace(/\s/g, '')]
        setterDockerContainer(array)
    })
    div.appendChild(button)

    button = document.createElement("button")
    button.innerText="Neustarten"
    button.className="dockerButtons"
    button.addEventListener("click",()=>{
        let array =["docker","restart", this.firstChild.data.replace(/\s/g, '')]
        setterDockerContainer(array)
    })
    div.appendChild(button)
    button = document.createElement("button")
    button.innerText="Beenden"
    button.className="dockerButtons"
    button.addEventListener("click",()=>{
        let array =["docker","stop",this.firstChild.data.replace(/\s/g, '')]
        setterDockerContainer(array)
    })
    div.appendChild(button)
}

function setterDockerContainer(array) {
    console.log(array)
    getterPOst("/postRunCommand",array).then((val)=>{
        console.log(val)
        location.reload()
    })
}