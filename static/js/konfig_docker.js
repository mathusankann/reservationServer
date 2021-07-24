let docker

function getSettingsDocker() {
    createDivs()

}

async function createDivs() {
    const main = document.getElementById("main")
    main.innerHTML =""
    let div = document.createElement("div")
    div.id="title"
    div.innerText="Konfigurator-Docker"
    main.appendChild(div)
    docker = await getter("http://192.168.178.72/getAllDockerContainer")
}