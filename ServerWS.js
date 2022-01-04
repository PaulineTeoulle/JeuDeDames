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
        let json = JSON.stringify({ "message": "Message bien reçu - Serveur" });
        connection.send(json);

        //Gestion du message si c'est un JSON ou non
        let messageIsJSON = true;
        try {
            parsedJson = JSON.parse(message.utf8Data);

        } catch (err) {
            messageIsJSON = false;
        }

        if (messageIsJSON) {
            //Récupération des données JSON envoyées par le client
            let messageJSON = parsedJson.message;
            let login = parsedJson.login;
            let mdp = parsedJson.mdp;

            let gameBoard = JSON.stringify(parsedJson.gameBoard);
            if (messageJSON == "Auth") {
                addUserIfUnique(login, mdp, connection);
            }
            if (messageJSON == "Score Update") {
                updateTopScore(login);
            }

            if (messageJSON == "En attente d'une partie") {
                addUserInWaitingList(login, connection);

                if (usersWaitingList.length >= 2) {
                    let player1 = pickRandomUser(usersWaitingList);
                    let player2 = pickRandomUser(usersWaitingList);
                    addCurrentgame(player1, player2);
                }
            }
            if (messageJSON == "DESSIN") {

                let duo = getDuoFromLogin(login);
                updateBoardInCurrentGame(duo, gameBoard);

                //TODO : envoyer la nouvelle matrice aux 2 clients
            }

            if (messageJSON == "Classement") {
                getClassement(connection);
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

let usersConnectedList = []; //List socket pseudo
let usersWaitingList = []; // Contient les logins utilisateur attendant partie
let usersInGameList = []; //Contient les logins des utilisateurs en partie

//Connection d'un utilisateur
//Récupération 
function connectUser(login, mdp, connection) {
    let userInformations = { "pseudo": login, "socket": connection };
    usersConnectedList.push(userInformations);
    console.log(usersConnectedList);
    getConnexionFromLogin(login);
    let json = JSON.stringify({ "message": "Utilisateur Connecté" });
    connection.send(json);
}

function addUserInWaitingList(login) {
    console.log("Ajout de " + login + " dans la waiting list");
    usersWaitingList.push(login);
    console.log(usersWaitingList);
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
    userModel.Users.countDocuments({ pseudo: login }, function(err, count) {
        if (count == 0) {
            addUser(login, mdp, connection);
            connectUser(login, mdp, connection);
        } else {
            connectUser(login, mdp, connection);
        }
    });
}

//Ajout d'un utilisateur
function addUser(login, mdp, connection) {

    let instance = new userModel.Users({ pseudo: login, mdp: mdp, nbPartiesJouees: 0, nbPartiesGagnees: 0 });
    instance.save(function(err) {
        if (err) return handleError(err);
        //console.log("addUser");
        createTopScore(login);
    });
}

function createTopScore(login) {
    let instanceTopScore = new topScoreModel.TopScores({ pseudo: login, score: 0 });
    instanceTopScore.save(function(err) {
        if (err) return handleError(err);
        //console.log("createTopScore")
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

    topScoreModel.TopScores.findOneAndReplace({ pseudo: login }, { pseudo: login, score: score }, function(err, user) {
        if (err) return handleError(err);
    });

    //console.log("updateTopScore")
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
            console.log(currentGame.gameBoard);
            sendGameBoardToClient(player1, gameBoard);
            sendGameBoardToClient(player2, gameBoard);
        });
}

function sendGameBoardToClient(login, gameBoard) {
    let socket = getConnexionFromLogin(login);
    //console.log(socket);
    let json = JSON.stringify({ "message": "Changement de matrice", "gameBoard": gameBoard });
    socket.send(json);
}

function sendStarterToClient(login, starter) {
    let socket = getConnexionFromLogin(login);
    let json = JSON.stringify({ "message": "Starter", "starter": starter });
    //socket.send(json);
}

function getClassement(connection) {
    topScoreModel.TopScores.find(function(err, scores) {
        if (err) return handleError(err);
        let json = JSON.stringify({ "message": "Classement chargé", "scores": scores });
        connection.send(json);
    });
}

//Creer une nouvelle partie
function addCurrentgame(player1, player2) {
    var randomStarter;
    let randomStarterInt = Math.floor(Math.random() * 2);

    if (randomStarterInt == 1) {
        randomStarter = player1;
    } else {
        randomStarter = player2;
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
        starter: randomStarter
    });

    currentGame.save(function(err) {
        let userInformations = {
            "duo": [
                player1,
                player2
            ]
        };
        usersInGameList.push(userInformations);
        sendStarterToClient(player1, randomStarter);
        sendStarterToClient(player2, randomStarter);
        if (err) return handleError(err);
    });


}

function removeCurrentGame(duo) {
    let pseudo1 = duo["pseudo1"][0];
    let pseudo2 = duo["pseudo2"][0];

    currentGameModel.CurrentGames.findOneAndRemove({ pseudo1: pseudo1, pseudo2: pseudo2 }, 'matrice', function(err, gameBoard) {
        if (err) return handleError(err);
        console.log("REMOVE CURRENT GAME");
    });
}

//Ajout d'une partie
function addFinishedGame(p1, p2, winner) {
    let finishedGame = new finishedGameModel.FinishedGames({
        pseudo1: p1,
        pseudo2: p2,
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

    currentGameModel.CurrentGames.findOne({ pseudo1: pseudo1, pseudo2: pseudo2 }, 'gameBoard', function(err, gameBoard) {
        if (err) return handleError(err);
        //console.log(gameBoard);
        let json = JSON.stringify({ "message": "Changement de matrice", "gameBoard": gameBoard });
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