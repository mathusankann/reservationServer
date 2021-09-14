function openAlert(inhale,color) {
    const alert = document.getElementById('alert');
    const text = document.getElementById('alert-text');
    text.innerHTML = inhale;
    alert.style.bottom = "94%";
    alert.style.height = "6%";
    alert.style.backgroundColor =color
    setTimeout(closeAlert,3000);
}


//Fährt das Hinweisfenster wieder ein.
function closeAlert() {
    const alert = document.getElementById("alert");
    alert.style.bottom = "100%";
    alert.style.height = "0%";
}

function checkNameSpelling(stringName) {
    let letters = /^[a-zA-Z\s]*$/;
    return  stringName.match(letters)
}

function checkMailPattern(stringMail) {
    let re = /\S+@\S+\.\S+/;
    return re.test(stringMail);

}

function checkAllowedChars(wholeString) {

}