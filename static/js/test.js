let content
let settings

window.addEventListener('DOMContentLoaded', function () {

    setTimeout( async function() {
        settings = await getter("nothing")
        content = document.getElementById("app").children[0].childNodes[1].childNodes[0]
        settingsNavBar()
        togglePresentation()
        changeButtonSize("300%")
        disableActionBar()
        disableUserList()

    }, 1000);

}, false)

function settingsNavBar() {
    //settings
    content.childNodes[0].childNodes[0].childNodes[0].childNodes[2].style.display="none"
    console.log( )
    //UserList


}
function disableNavBar() {

}

function togglePresentation() {
    content.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[1].click()
    content.childNodes[2].childNodes[0].childNodes[2].style.display="none"

}

function changeButtonSize(value) {
    let rule= document.styleSheets[4].cssRules[22]
    rule.style.fontSize=value
}
function disableActionBar() {
    document.styleSheets[91-52].cssRules[41].style.display="none"

}

function disableUserList() {
    content.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.display = "none"
    content.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].click()
}

function disableChat() {


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
        request.open("GET", "/getKonfSettings", true);
        request.send();
    }))
}