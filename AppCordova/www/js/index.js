
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

document.getElementById("btn").addEventListener("click", send);

function send() {
    var log = document.getElementById("login").value;
    var mdp = document.getElementById("mdp").value;
    document.getElementById("user").innerHTML = log;
    if(log!=="" && mdp!==""){
    document.getElementById('log').style.display = "none";
    document.getElementById('choix').style.display = "block";
    }
    //send(login, mdp) envoie variables au serveur
 }

 document.getElementById("nGame").addEventListener("click", displayGame);

 function displayGame() {
    document.getElementById('choix').style.display = "none";
    document.getElementById('board').style.display = "block";
 }

 document.getElementById("class").addEventListener("click", displayClass);

 function displayClass() {
    document.getElementById('choix').style.display = "none";
    document.getElementById('classement').style.display = "block";
 }
