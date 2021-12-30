//Ouverture d'une websocket
const ws = new WebSocket('ws://127.0.0.1:9898/');
//Listener d'ouverture de websocket
ws.onopen = function() {
    console.log("Websocket ouvert - Client");

};

function handleNewGame() {
    let json = JSON.stringify({ "message": "En attente d'une partie", "login": login, "mdp": mdp });
    ws.send(json);
    displayBoard();
}

/*
Listener des messages entrants
Selon le message du serveur que l'on vient de recevoir, on fait un affichage
*/
ws.onmessage = function(e) {
    document.getElementById("messageServeur").innerHTML = e.data;
    //Cas où l'authentification est validée par le serveur
    if (e.data == "Authentification valide - Serveur") {
        document.getElementById("messageServeur").style.color = "green";
        document.getElementById("messageServeur").innerHTML = e.data;
        console.log("Auth réussie");
    } else if (e.data == "Utilisateur Connecté") {
        displayChoix();
    }
};

let login;
let mdp;

/*
Récupération des inputs du client, formattage en JSON et envoi vers le serveur
*/
function authentification() {
    login = document.getElementById("login").value;
    mdp = document.getElementById("mdp").value;
    let json = JSON.stringify({ "message": "Auth", "login": login, "mdp": mdp });
    if (login != "" && mdp != "") {
        ws.send(json);
    }
}