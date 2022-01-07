document.addEventListener('deviceready', onDeviceReady, false);

let isAndroid;

function onDeviceReady() {
    isAndroid = device.isVirtual;
}
let ws;
if (!isAndroid) {
    ws = new WebSocket('ws://127.0.0.1:9898/');
} else {
    ws = new WebSocket('ws://10.0.2.2:9898/');
}

console.log(ws);

//Listener d'ouverture de websocket
ws.onopen = function() {
    console.log("Websocket ouvert - Client");
};

function handleNewGame() {
    let json = JSON.stringify({ "action": "Waiting for a game", "data": { "login": login } });
    ws.send(json);
    displayWaitingRoom();
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
    console.log(object["data"]);
    if (object["action"] == "User connected") {
        displayChoice();
    } else if (object["action"] == "Get Score") {
        displayScore(object["data"].scores);
    } else if (object["action"] == "Update GameBoard") {
        updateBoard(object["data"].gameBoard);
    } else if (object["action"] == "Get Info Init Game") {
        setStarter(object["data"].starter);
        setPlayer("player1", object["data"].player1);
        setPlayer("player2", object["data"].player2);
        console.log(isClientTurnOf());
        displayBoard();
        createFields();
    } else if (object["action"] == "Update Turn") {
        updateTurn(object["data"].turnOfPlayer);
        console.log(isClientTurnOf());
    }
};

function updateTurn(newTurnOfPlayer) {
    turnOfPlayer = newTurnOfPlayer;
}

let login;
let password;
let player1;
let player2;

function authentification() {
    login = document.getElementById("login").value;
    password = document.getElementById("mdp").value;
    let json = JSON.stringify({ "action": "User Authentication", "data": { "login": login, "password": password } });
    if (login != "" && password != "") {
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
    console.log("le starter ests et : " + turnOfPlayer);
}

function setPlayer(player, pseudo) {
    if (player == "player1") {
        player1 = pseudo;
    } else if (player == "player2") {
        player2 = pseudo;
    }
}