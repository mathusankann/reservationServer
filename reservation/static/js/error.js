function openAlert(inhale,color) {
    const alert = document.getElementById('alert');
    const text = document.getElementById('alert-text');
    text.innerHTML = inhale;
    alert.style.bottom = "95%";
    alert.style.height = "5%";
    alert.style.backgroundColor =color
    setTimeout(closeAlert,3000);
}


//Fährt das Hinweisfenster wieder ein.
function closeAlert() {
    const alert = document.getElementById("alert");
    alert.style.bottom = "100%";
    alert.style.height = "0%";
}