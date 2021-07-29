let settings
let currentSettings

window.addEventListener('DOMContentLoaded', function () {
    setTimeout(async function () {
        settings = await getter("")
        if (true) ;//todo depending on role
        getContent().then((content) => {
            currentSettings = settings[2].value
            console.log(settings)
            changeButtonSize(currentSettings[0], content)
            settingsNavBar(currentSettings[1], content)
            disableChat(currentSettings[2],content)
            disableUserList(currentSettings[3], content)
            togglePresentation(currentSettings[4], content)
        })
    }, 2000);
}, false)


function getContent() {
    return new Promise(((resolve, reject) => {
        let content
        while (content === undefined || content === null) {
            content = document.getElementById("app").children[0].childNodes[1].childNodes[0]
        }
        console.log(content)
        resolve(content)
    }))
}

function settingsNavBar(value, content) {
    //settings
    //content.childNodes[0].childNodes[0].childNodes[0].childNodes[2].style.display = "none"
    if (value === 1) {
        content.childNodes[0].style.display = "none"
    }
}


function togglePresentation(value, content) {
    let test = setInterval(function () {
        let temp = content.childNodes[1].childNodes[0].childNodes[0].childNodes[0]
        if (temp !== undefined) {
            clearInterval(test)
            let presentation = content.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[1]
            switch (value) {
                case 1:
                    presentation.click()
                    break;
                case 2:
                    presentation.click()
                    content.childNodes[2].childNodes[0].childNodes[2].style.display = "none"
                    break;
            }
        }
    }, 100)

}

function changeButtonSize(value, content) {
    let rule = document.styleSheets[4].cssRules[22]
    console.log(value)
    switch (value) {
        case 0:
            disableActionBar()
            break;
        case 2:
            rule.style.fontSize = "300%";
            break;
        case 3:
            rule.style.fontSize = "400%";
            break;

    }
}

function disableActionBar() {
    document.styleSheets[91 - 52].cssRules[41].style.display = "none"

}

function disableUserList(value, content) {
    switch (value) {
        case 1:
            content.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].click()
            break;
        case 2:
            content.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.display = "none"
            content.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].click()
            break;
    }
}

function disableChat(value,content) {
    switch (value) {
        case 1:
            document.getElementById("app").children[0].childNodes[1].childNodes[3].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].click()
            break;
        case 2:
            document.getElementById("app").children[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].remove()
            document.getElementById("app").children[0].childNodes[1].childNodes[3].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].click()
            break;
    }
}


function createAjaxRequest() {
    let request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return request;
}

function getter(path) {
    return new Promise(((resolve, reject) => {
        const request = createAjaxRequest();
        request.onreadystatechange = function () {
            if (4 === this.readyState) {
                if (200 === this.status) {
                    let val = JSON.parse(this.responseText)
                    //console.log(this.responseText)
                    resolve(val)
                } else {
                    console.log(this.responseText)
                    resolve(null)
                }
            }
        }
        request.open("GET", "https://reservation.jitsi-mathu.de/getKonfSettings", true);
        request.send();
    }))
}