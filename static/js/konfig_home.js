


function generateHome() {
    checkAuthentication()
    createDivs()
    generateDie()
    generateMeetingsView()
}

function createDivs() {
    const main = document.getElementById("main")
    let div = document.createElement("div")
    div.innerText = "Admin-Übersicht"
    div.id = "title"
    main.appendChild(div)

    let maindiv = document.createElement("div")
    maindiv.id = "mainAdmin"
    main.appendChild(maindiv)


    div = document.createElement("div")
    div.id = "piechart"
    maindiv.appendChild(div)
    let canvas = document.createElement("canvas")
    canvas.id = "doughnut-chart"

    div.appendChild(canvas)
    div = document.createElement("div")
    div.id = "runningMeetings"
    maindiv.appendChild(div)

    div = document.createElement("div")
    div.id = "activConnections"
    maindiv.appendChild(div)
    createLogOutButton()
}




async function generateDie() {
    let docker = await getter("/getAllDockerContainer")
    console.log(docker)
    let running =0
    for(let i =1;i<docker.length-1;i++){
        console.log(docker[i][4])
        if(docker[i][4].includes("Up")){
            running++
        }
    }
    new Chart(document.getElementById("doughnut-chart"), {
        type: 'doughnut',
        data: {
            labels: ["Running", "Fail-State"],
            datasets: [
                {
                    label: "Population (millions)",
                    backgroundColor: ["#3e95cd", "red"],
                    data: [running, docker.length-running-2]
                }
            ]
        },
        options: {
            plugins:{
                title: {
                    display: true,
                    text: 'Running Docker Containers',
                    font:{
                        size:20
                    }
                }
            }
        }
    });
}

function generateMeetingsView() {
    let indexArray =[1,0,3,16]
    const meetings = document.getElementById("runningMeetings")
    let table = document.createElement("table")
    table.style.width="100%"
    let caption = document.createElement("caption")
    caption.innerText="Aktive Meetings"
    meetings.appendChild(table)
    table.appendChild(caption)
    let tr = document.createElement("tr")
    let th = document.createElement("th")
    th.id = "id"
    th.innerText="ID"
    tr.appendChild(th)
    th = document.createElement("th")
    th.id = "meetingName"
    th.innerText="meetingName"
    tr.appendChild(th)
    th = document.createElement("th")
    th.id = "startTime"
    th.innerText="Startzeitpunkt"
    tr.appendChild(th)
    th = document.createElement("th")
    th.id = "participant"
    th.innerText="Teilnehmer"
    tr.appendChild(th)
    table.appendChild(tr)
    getRunningCon().then((val)=>{
        getterPOst("/sendGetRequest",val.url).then((prom)=>{
            let text, parser, xmlDoc;
            parser = new DOMParser();
            xmlDoc= parser.parseFromString(prom, "application/xml");
            let incMeetings =xmlDoc.children[0].children[1].children
            for(let i=0;i<incMeetings.length;i++){
                tr = document.createElement("tr")
                for(let j=0;j<indexArray.length;j++){
                    th = document.createElement("th")
                    th.innerText=incMeetings[i].children[indexArray[j]].textContent
                    tr.appendChild(th)
                }
             table.appendChild(tr)
            }
            //console.log(incMeetings)
        })
    })
}

