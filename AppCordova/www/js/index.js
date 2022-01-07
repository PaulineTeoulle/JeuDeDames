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

/*
Listener des messages entrants
Selon le message du serveur que l'on vient de recevoir, on fait un affichage ou on appelle une fonction
*/
ws.onmessage = function(e) {
    var object = JSON.parse(e.data);
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
        displayBoard();
        createFields();
    } else if (object["action"] == "Update Turn") {
        updateTurn(object["data"].turnOfPlayer);
    } else if (object["action"] == "End Game") {
        alert("Le gagnant est : " + object["data"].winner);
    }
};