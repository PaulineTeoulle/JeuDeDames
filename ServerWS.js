//Connection a mongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/JeuDeDames');
//Appel aux modèles
var userModel = require('UsersModel');
var currentGameModel = require('CurrentGamesModel');
var finishedGameModel = require('FinishedGamesModel');
var topScoreModel = require('TopScoresModel');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connection BDD Ouverte!");
});

//Creation du serveur
const http = require('http');
const server = http.createServer();
server.listen(9898);

// Création du server WebSocket qui utilise le serveur 
const WebSocketServer = require('websocket').server;
const wsServer = new WebSocketServer({
    httpServer: server
});
console.log("Serveur ouvert");

// Mise en place des événements WebSockets
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    console.log("Connection d'un client");


    //Un socket 
    //console.log(connection); 
    let loginInfo;
    //A la réception d'un message
    connection.on('message', function(message) {


        //Envoi d'un accusé de réception au client
        let json = JSON.stringify({ "action": "Message bien reçu - Serveur" });
        connection.send(json);

        console.log(message);
        //Gestion du message si c'est un JSON ou non
        let messageIsJSON = true;
        try {
            parsedJson = JSON.parse(message.utf8Data);

        } catch (err) {
            messageIsJSON = false;
        }

        if (messageIsJSON) {
            //Récupération des données JSON envoyées par le client

            let action = parsedJson.action;
            let login = parsedJson.data.login;
            loginInfo = parsedJson.data.login;
            let password = parsedJson.data.password;

            if (action == "User Authentication") {
                addUserIfUnique(login, password, connection);

            }
            if (action == "Score Update") {
                updateTopScore(login);
            }

            if (action == "Waiting for a game") {
                addUserInWaitingList(login, connection);
                console.log(usersWaitingList);
                if (usersWaitingList.length >= 2) {
                    let player1 = pickRandomUser(usersWaitingList);
                    //let player2 = pickRandomUser(usersWaitingList);
                    console.log(player1);
                    let player2 = pickRandomUser(usersWaitingList);
                    console.log(player2);
                    addCurrentgame(player1, player2);
                }
            }
            if (action == "Update GameBoard") {
                let gameBoard = JSON.stringify(parsedJson.data.gameBoard);
                let duo = getDuoFromLogin(login);
                updateBoardInCurrentGame(duo, gameBoard);
            }
            if (action == "Update TurnOfPlayer") {
                let turnOfPlayer = parsedJson.data.turnOfPlayer;
                let duo = getDuoFromLogin(login);
                sendTurnOfPlayerToDuo(duo, turnOfPlayer);
            }

            if (action == "Get Score") {
                getScore(login);
            }

            if (action == "End Game") {
                console.log(parsedJson);
                let player1 = parsedJson.data.player1;
                let player2 = parsedJson.data.player2;
                let winner = parsedJson.data.winner;
                addFinishedGame(player1, player2, winner);
                removeCurrentGame(player1, player2);
                updateScores(player1, player2, winner);
                sendWinnerToclient(player1, winner);
                sendWinnerToclient(player2, winner);
            }

            if (action == "Set TurnOf") {
                console.log(parsedJson.data.turnOfPlayer);
                let turnOfPlayer = parsedJson.data.turnOfPlayer;
                let duo = getDuoFromLogin(login);
                console.log(turnOfPlayer);
                setTurnOf(duo, turnOfPlayer);
            }
        }
    });

    //A la fermeture d'une connection
    connection.on('close', function(reasonCode, description) {

        removeUserInGameList(loginInfo);
        removeUserInWaitingList(loginInfo);
        removeUserInConnectedList(loginInfo);
        removeCurrentGame(loginInfo);
        console.log("Déconnection d'un client - Serveur");
    });
});


function sendWinnerToclient(login, winner) {
    let socket = getConnexionFromLogin(login);
    let json = JSON.stringify({ "action": "End Game", "data": { "winner": winner } });
    socket.send(json);
}

function setTurnOf(duo, turnOfPlayer) {
    let player1 = duo[0];
    let player2 = duo[1];

    currentGameModel.CurrentGames.findOne({
            $or: [{ pseudo1: player1 }, { pseudo1: player2 }]
        },
        function(err, currentGame) {
            if (err) return handleError(err);
            currentGame.turnOfPlayer = turnOfPlayer;
            sendTurnOfPlayerToOneClient(player1, currentGame.turnOfPlayer);
            sendTurnOfPlayerToOneClient(player2, currentGame.turnOfPlayer);
        });
}

function updateScores(player1, player2, winner) {
    updatenumberOfGamePlayed(player1);
    updatenumberOfGamePlayed(player2);
    updatenumberOfGameWon(winner);
}

let usersConnectedList = []; //List login socket
let usersWaitingList = []; // Contient les logins utilisateur attendant partie
let usersInGameList = []; //Contient les logins des utilisateurs en partie

//Connection d'un utilisateur
//Récupération 
function connectUser(login, password, connection) {
    let userInformations = { "pseudo": login, "socket": connection };
    usersConnectedList.push(userInformations);
    let json = JSON.stringify({ "action": "User connected" });
    connection.send(json);
}

function addUserInWaitingList(login) {
    usersWaitingList.push(login);
}

function pickRandomUser(usersWaitingList) {
    let index1 = Math.floor(Math.random() * usersWaitingList.length);
    let user = usersWaitingList[index1];
    removeUserInWaitingList(index1);
    return (user);
}

function removeUserInWaitingList(login) {
    let socket;
    socket = getConnexionFromLogin(login);
    if (usersWaitingList.length != 0) {
        let userInformations = [login, socket];
        let indexOfUser = usersWaitingList.indexOf(userInformations);
        usersWaitingList.splice(indexOfUser, 1);
    }
}

function removeUserInGameList(login) {
    usersInGameList.forEach(element => {
        element.duo.forEach(player => {
            if (player == login) {
                let indexOfUser = usersInGameList.indexOf(element);
                usersInGameList.splice(indexOfUser, 1);
            }
        })
    });
}

function removeUserInConnectedList(login) {
    let socket;
    socket = getConnexionFromLogin(login);
    let userInformations = [login, socket];
    if (usersConnectedList.length != 0) {
        let indexOfUser = usersConnectedList.indexOf(userInformations);
        usersConnectedList.splice(indexOfUser, 1);
    }
}

function addUserIfUnique(login, password, connection) {
    let instance = new userModel.Users({ pseudo: login, password: password, numberOfGamePlayed: 0, numberOfGameWon: 0 });
    userModel.Users.find({ pseudo: login, password: password }, function(err, user) {
        if (err) return handleError(err);
        if (user.length != 0) {
            connectUser(login, password, connection);
        } else if (user.length == 0) {
            instance.save(function(err) {
                if (err) return handleError(err);
                createTopScore(login);
            });
            connectUser(login, password, connection);
        }
    });
}

function createTopScore(login) {
    let instanceTopScore = new topScoreModel.TopScores({ pseudo: login, score: 0 });
    instanceTopScore.save(function(err) {
        if (err) return handleError(err);
    });
}

function updateTopScore(login) {
    let score = 0;

    userModel.Users.findOne({ pseudo: login }, 'numberOfGamePlayed numberOfGameWon', function(err, user) {

        if (err) return handleError(err);
        if (user.numberOfGamePlayed != 0) {
            score = user.numberOfGameWon / user.numberOfGamePlayed * 100;
        }
    });


    topScoreModel.TopScores.findOneAndReplace({ pseudo: login }, function(err, user) {

        if (err) return handleError(err);
        user.score = score;
    });
}

function updatenumberOfGamePlayed(login) {
    userModel.Users.findOne({ pseudo: login }, 'numberOfGamePlayed', function(err, user) {
        if (err) return handleError(err);
        user.numberOfGamePlayed += 1;
    });
}

function updatenumberOfGameWon(login) {
    userModel.Users.findOne({ pseudo: login }, 'numberOfGameWon', function(err, user) {

        if (err) return handleError(err);
        user.numberOfGameWon += 1;
    });

}

function updateBoardInCurrentGame(duo, gameBoard) {
    let player1 = duo[0];
    let player2 = duo[1];

    currentGameModel.CurrentGames.findOne({
            $or: [{ pseudo1: player1 }, { pseudo1: player2 }]
        },
        function(err, currentGame) {
            if (err) return handleError(err);
            currentGame.gameBoard = gameBoard;
            sendGameBoardToClient(player1, gameBoard);
            sendGameBoardToClient(player2, gameBoard);
        });
}


function sendGameBoardToClient(login, gameBoard) {
    let socket = getConnexionFromLogin(login);
    let json = JSON.stringify({ "action": "Update GameBoard", "data": { "gameBoard": gameBoard } });
    socket.send(json);
}

function sendInfoGameToClient(login, starter, player1, player2) {
    let socket = getConnexionFromLogin(login);
    let json = JSON.stringify({ "action": "Get Info Init Game", "data": { "starter": starter, "player1": player1, "player2": player2 } });
    socket.send(json);
}

function getScore(login) {
    let socket = getConnexionFromLogin(login);
    topScoreModel.TopScores.find(function(err, scores) {

        if (err) return handleError(err);
        let json = JSON.stringify({ "action": "Get Score", "data": { "scores": scores } });
        socket.send(json);
    });

}

function sendTurnOfPlayerToDuo(duo, turnOfPlayer) {
    let player1 = duo[0];
    let player2 = duo[1];
    sendTurnOfPlayerToOneClient(player1, turnOfPlayer);
    sendTurnOfPlayerToOneClient(player2, turnOfPlayer);

}

function sendTurnOfPlayerToOneClient(login, turnOfPlayer) {
    console.log(turnOfPlayer);
    let socket = getConnexionFromLogin(login);
    let json = JSON.stringify({ "action": "Update Turn", "data": { "turnOfPlayer": turnOfPlayer } });
    console.log(json);
    socket.send(json);
}

function addCurrentgame(player1, player2) {
    let currentGame = new currentGameModel.CurrentGames({
        pseudo1: player1,
        pseudo2: player2,
        gameBoard: [
            [0, 6, 0, 6, 0, 6, 0, 6],
            [6, 0, 6, 0, 6, 0, 6, 0],
            [0, 6, 0, 6, 0, 6, 0, 6],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0]
        ],
        starter: player1,
        turnOfPlayer: player1
    });

    currentGame.save(function(err) {
        if (err) return handleError(err);
        let test = createDuoInfo(player1, player2);
        console.log(test);
        sendInfoGameToClient(player1, player1, player1, player2);
        sendInfoGameToClient(player2, player1, player1, player2);
    });
}

function createDuoInfo(player1, player2) {
    let userInformations = {
        "duo": [
            player1,
            player2
        ]
    };
    usersInGameList.push(userInformations);
    return userInformations;
}

function removeCurrentGame(player1) {
    currentGameModel.CurrentGames.findOneAndRemove({
            $or: [{ pseudo1: player1 }, { pseudo2: player1 }]
        },
        function(err, currentGame) {
            if (err) return handleError(err);
            console.log("Suppression du la currentGame");
        });
}

function addFinishedGame(player1, player2, winner) {
    let finishedGame = new finishedGameModel.FinishedGames({
        pseudo1: player1,
        pseudo2: player2,
        winner: winner
    })

    finishedGame.save(function(err) {
        console.log("Ajout de la finishedGame");
        if (err) return handleError(err);
    });
}

function getConnexionFromLogin(login) {
    let connexion = null;
    usersConnectedList.forEach(element => {
        if (element.pseudo == login) {
            connexion = element.socket;
        }
    });
    return connexion;
}

function getDuoFromLogin(login) {
    let newDuo = null;
    usersInGameList.forEach(duo => {
        duo["duo"].forEach(player => {
            if (player == login) {
                newDuo = duo["duo"];
            }
        });
    });
    return newDuo;
}