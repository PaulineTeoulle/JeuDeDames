//Ouverture d'une websocket
const ws = new WebSocket('ws://127.0.0.1:9898/');
//Listener d'ouverture de websocket
ws.onopen = function() {
    console.log("Websocket ouvert - Client");
};

function handleNewGame() {
    let json = JSON.stringify({ "action": "Waiting for a game", "data": { "login": login } });
    ws.send(json);
    displayBoard();
}

function askForScore() {
    let json = JSON.stringify({ "action": "Get Score", "data": { "login": login } });
    ws.send(json);
}

/*
Listener des messages entrants
Selon le message du serveur que l'on vient de recevoir, on fait un affichage
*/
ws.onmessage = function(e) {
    var object = JSON.parse(e.data);
    console.log(object["action"]);
    if (object["action"] == "User connected") {
        displayChoice();
    } else if (object["action"] == "Get Score") {
        console.log(object["data"].scores);
        displayScore(object["data"].scores);
    } else if (object["action"] == "Update GameBoard") {
        updateBoard(object["data"].gameBoard);
    } else if (object["action"] == "Get Info Init Game") {
        setStarter(object["data"].starter);
        console.log(object["data"]);
        setPlayer("player1", object["data"].player1);
        setPlayer("player2", object["data"].player2);
        console.log(isClientTurnOf());
        createFields();
    } else if (object["action"] == "Update Turn") {

        updateTurn(object["data"].turnOfPlayer);
    }
};

function setTurnOfPlayer(player) {
    console.log("Mon login est : " + login);
    console.log("Fin du tour de " + turnOfPlayer.pseudo);
    turnOfPlayer = player;
    console.log("Début du tour de " + turnOfPlayer);
}

function updateTurn(object) {
    turnOfPlayer = object;
}


let login;
let mdp;
let player1;
let player2;

function authentification() {
    login = document.getElementById("login").value;
    mdp = document.getElementById("mdp").value;
    let json = JSON.stringify({ "action": "User Authentication", "data": { "login": login, "mdp": mdp } });
    if (login != "" && mdp != "") {
        ws.send(json);
    }
}

function saveScore() {
    let json = JSON.stringify({ "action": "Score Update", "data": { "login": login } });
    if (login != "") {
        ws.send(json);
    }
}

function setStarter(starter) {
    turnOfPlayer = starter;
}

function setPlayer(player, pseudo) {
    if (player == "player1") {
        player1 = { "pseudo": pseudo, "number": 1 };

        console.log(player1);
    } else if (player == "player2") {
        player2 = { "pseudo": pseudo, "number": 2 };

        console.log(player2);
    }
}