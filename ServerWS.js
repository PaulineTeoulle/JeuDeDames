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
            let mdp = parsedJson.data.mdp;

            if (action == "User Authentication") {
                addUserIfUnique(login, mdp, connection);
            }
            if (action == "Score Update") {
                updateTopScore(login);
            }

            if (action == "Waiting for a game") {
                addUserInWaitingList(login, connection);
                console.log(usersWaitingList);
                if (usersWaitingList.length >= 2) {
                    let player1 = pickRandomUser(usersWaitingList);
                    let player2 = pickRandomUser(usersWaitingList);
                    addCurrentgame(player1, player2);
                }
            }
            if (action == "Update GameBoard") {
                let gameBoard = JSON.stringify(parsedJson.data.gameBoard);
                let duo = getDuoFromLogin(login);
                updateBoardInCurrentGame(duo, gameBoard);
            }
            if (action == "Update TurnOfPlayer") {
                //console.log(login);
                let turnOfPlayer = parsedJson.data.turnOfPlayer;
                //console.log(turnOfPlayer);
                let duo = getDuoFromLogin(login);
                //console.log(duo);
                sendTurnOfPlayerToDuo(duo, turnOfPlayer);
            }

            if (action == "Get Score") {
                getScore(login);
            }

            if (action == "End Game") {
                let player1 = parsedJson.player1;
                let player2 = parsedJson.player2;
                let winner = parsedJson.winner;
                addFinishedGame(player1, player2, winner);
                removeCurrentGame(player1, player2);
                updateScores(player1, player2, winner);
            }

            if (action == "Get TurnOf") {
                let duo = getDuoFromLogin(login);
                getTurnOf(duo);
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
        //removeUserInConnectedList(loginInfo, connectionInfo);
        //removeUserInWaitingList(loginInfo, connectionInfo);
        console.log("Déconnection d'un client - Serveur");
    });
});


function setTurnOf(duo, turnOfPlayer) {
    //console.log(turnOfPlayer);
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
            console.log("SET TURN ; Tour de :" + currentGame.turnOfPlayer);
        });
}


function getTurnOf(duo) {
    let player1 = duo[0];
    let player2 = duo[1];

    currentGameModel.CurrentGames.findOne({
            $or: [{ pseudo1: player1 }, { pseudo1: player2 }]
        },
        function(err, currentGame) {
            if (err) return handleError(err);
            console.log(currentGame.turnOfPlayer);
        });
}

function updateScores(player1, player2, winner) {
    updateNbPartiesJouees(player1);
    updateNbPartiesJouees(player2);
    updateNbPartiesGagnees(winner);
}

let usersConnectedList = []; //List socket pseudo
let usersWaitingList = []; // Contient les logins utilisateur attendant partie
let usersInGameList = []; //Contient les logins des utilisateurs en partie

//Connection d'un utilisateur
//Récupération 
function connectUser(login, mdp, connection) {
    let userInformations = { "pseudo": login, "socket": connection };
    usersConnectedList.push(userInformations);
    //updateConnectedUser(login);
    //getConnectedUser(login);
    getConnexionFromLogin(login);
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

function removeUserInWaitingList(index) {
    usersWaitingList.splice(index, 1);
}

/*function removeUserInWaitingList(login, connection) {
    if (usersWaitingList.length != 0) {
        console.log(usersWaitingList);
        console.log("removeusersWaitingList");
        console.log(login);

        let userInformations = [login, connection];
        let indexOfUser = usersWaitingList.indexOf(userInformations);
        usersWaitingList.splice(indexOfUser, 1);
        console.log(usersWaitingList);
    }
}*/

/*function removeUserInConnectedList(login, connection) {
    if (usersConnectedList.length != 0) {
        console.log(usersConnectedList);
        console.log("usersConnectedList");
        console.log(login);


        let indexOfUser = usersConnectedList.indexOf(userInformations);
        usersConnectedList.splice(indexOfUser, 1);
        console.log(usersConnectedList);
    }
}*/

function addUserIfUnique(login, mdp, connection) {
    userModel.Users.countDocuments({ pseudo: login, mdp: mdp }, function(err, count) {
        if (count == 0) {
            addUser(login, mdp, connection);
            //getConnectedUser(login);
            connectUser(login, mdp, connection);
        } else {
            connectUser(login, mdp, connection);
        }
    });
}

//Ajout d'un utilisateur
function addUser(login, mdp, connection) {
    let instance = new userModel.Users({ pseudo: login, mdp: mdp, nbPartiesJouees: 0, nbPartiesGagnees: 0, estConnecte: false });
    instance.save(function(err) {
        if (err) return handleError(err);
        createTopScore(login);
    });
}

function updateConnectedUser(login) {
    userModel.Users.findOne({ pseudo: login }, 'nbPartiesJouees nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        user.estConnecte = true;
    });
}

function getConnectedUser(login) {
    userModel.Users.findOne({ pseudo: login }, function(err, user) {
        if (err) return handleError(err);
        console.log(user);
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
    userModel.Users.findOne({ pseudo: login }, 'nbPartiesJouees nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        if (user.nbPartiesJouees != 0) {
            score = user.nbPartiesGagnees / user.nbPartiesJouees * 100;
        }
    });

    topScoreModel.TopScores.findOneAndReplace({ pseudo: login }, function(err, user) {
        if (err) return handleError(err);
        user.score = score;
    });
}

function updateNbPartiesJouees(login) {
    userModel.Users.findOne({ pseudo: login }, 'nbPartiesJouees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesJouees += 1;
    });
    //console.log("updateNbPartiesJouees")
}


function updateNbPartiesGagnees(login) {
    userModel.Users.findOne({ pseudo: login }, 'nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesGagnees += 1;
    });
    //console.log("updateNbPartiesGagnees")
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
            //console.log(currentGame.gameBoard);
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
    let randomStarterInt = Math.floor(Math.random() * 2);


    let randomStarterPseudo;
    if (randomStarterInt == 1) {
        randomStarterPseudo = player1;
    } else {
        randomStarterPseudo = player2;
    }


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
        starter: randomStarterPseudo,
        turnOfPlayer: randomStarterPseudo
    });

    currentGame.save(function(err) {
        let userInformations = {
            "duo": [
                player1,
                player2
            ]
        };
        usersInGameList.push(userInformations);

        console.log("Ajout game : Tour de " + randomStarterPseudo);
        sendInfoGameToClient(player1, randomStarterPseudo, player1, player2);
        sendInfoGameToClient(player2, randomStarterPseudo, player1, player2);
        if (err) return handleError(err);
    });


}

function removeCurrentGame(player1, player2) {
    currentGameModel.CurrentGames.findOneAndRemove({
            $or: [{ pseudo1: player1 }, { pseudo1: player2 }]
        },
        function(err, currentGame) {
            if (err) return handleError(err);
            console.log("REMOVE CURRENT GAME");
        });
}

function addFinishedGame(player1, player2, winner) {
    let finishedGame = new finishedGameModel.FinishedGames({
        pseudo1: player1,
        pseudo2: player2,
        winner: winner
    })

    finishedGame.save(function(err) {
        console.log("ADD FINISHED GAME");
        if (err) return handleError(err);
    });
}

function getGameBoard(duo) {
    let pseudo1 = duo["pseudo1"][0];
    let pseudo2 = duo["pseudo2"][0];

    currentGameModel.CurrentGames.findOne({ pseudo1: pseudo1, pseudo2: pseudo2 }, function(err, currentGame) {
        if (err) return handleError(err);
        //console.log(gameBoard);
        let json = JSON.stringify({ "action": "Update GameBoard", "data": { "gameBoard": currentGame.gameBoard, "turnOf": turnOfPlayer } });
        connection.send(json);
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