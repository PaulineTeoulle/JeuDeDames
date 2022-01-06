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
    } else if (object["action"] == "Get GameInfo") {
        //setStarter(object["starter"]);
        //setPlayer("player1", object["player1"]);
        //setPlayer("player2", object["player2"]);
    }
};

let login;
let mdp;
let whitePlayer;
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
    whitePlayer = starter;
}

function setPlayer(player, pseudo) {
    if (player == "player1") {
        player1 = { "pseudo": pseudo, "number": 1 };
    } else if (player == "player2") {
        player2 = { "pseudo": pseudo, "number": 2 };;
    }
}