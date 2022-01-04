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

function askForClassement() {
    let json = JSON.stringify({ "message": "Classement" });
    ws.send(json);
}

/*
Listener des messages entrants
Selon le message du serveur que l'on vient de recevoir, on fait un affichage
*/
ws.onmessage = function(e) {
    //console.log(e.data);
    var object = JSON.parse(e.data);
    console.log(object["message"]);
    //Cas où l'authentification est validée par le serveur
    if (object["message"] == "Authentification valide - Serveur") {
        document.getElementById("messageServeur").style.color = "green";
        document.getElementById("messageServeur").innerHTML = e.data;
    } else if (object["message"] == "Utilisateur Connecté") {
        displayChoix();
    } else if (object["message"] == "Classement chargé") {
        displayClassement(object["scores"]);
    } else if (object["message"] == "Changement de matrice") {
        updateBoard(object["gameBoard"]);
        //TODO : ajouter méthode qui récupère l'object et qui draw le board
    } else if (object["message"] == "Starter") {
        setStarter(object["starter"]);
    }
};

let login;
let mdp;
let starter;
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

function saveScore() {
    let json = JSON.stringify({ "message": "Score Update", "login": login });
    if (login != "") {
        ws.send(json);
    }
}

function setStarter(starterFromServer) {
    starter = starterFromServer;
}