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


function updateTurn(newTurnOfPlayer) {
    turnOfPlayer = newTurnOfPlayer;
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


function handleNewGame() {
    let json = JSON.stringify({ "action": "Waiting for a game", "data": { "login": login } });
    ws.send(json);
    displayWaitingRoom();
}

function askForScore() {
    let json = JSON.stringify({ "action": "Get Score", "data": { "login": login } });
    ws.send(json);
}