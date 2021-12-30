//Connection a mongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/JeuDeDames');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connection BDD Ouverte!");
});

var Schema = mongoose.Schema;

const userSchema = new Schema({
    pseudo: String,
    mdp: String,
    nbPartiesJouees: Number,
    nbPartiesGagnees: Number
});

//schéma partie en cours
const currentGameSchema = new Schema({
    pseudo1: String,
    pseudo2: String,
    matrice: [
        [Number]
    ]
});

const finishedGameSchema = new Schema({
    pseudo1: String,
    pseudo2: String,
    winner: String
});

const topScoreSchema = new Schema({
    pseudo: String,
    score: Number
});

//Definition du schéma utilisateur
var SomeUser = mongoose.model('users', userSchema);
var topScore = mongoose.model('topscores', topScoreSchema);
//Definition du schéma partie
var currentGame = mongoose.model('partiesencours', currentGameSchema);
var finishedGame = mongoose.model('partiesterminees', finishedGameSchema);

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
    console.log("Connection d'un client - Serveur");

    //Un socket console.log(connection); 

    //A la réception d'un message
    connection.on('message', function(message) {

        //Envoi d'un accusé de récéption au client
        // console.log("Message reçu du client : " + message.utf8Data + " - Serveur");
        let json = JSON.stringify({ "message": "Message bien reçu - Serveur" });
        connection.send(json);

        //Gestion du message si c'est un JSON ou non
        let messageIsJSON = true;
        //let messageJSON;
        /* let login;
         let mdp;
         var parsedJson*/
        try {
            parsedJson = JSON.parse(message.utf8Data);
            // console.log(parsedJson);

        } catch (err) {
            messageIsJSON = false;
        }

        if (messageIsJSON) {
            //Récupération des données JSON envoyées par le client
            let messageJSON = parsedJson.message;
            let login = parsedJson.login;
            connectionInfo = connection;
            loginInfo = login;
            let mdp = parsedJson.mdp;
            if (messageJSON == "Auth") {
                addUserIfUnique(login, mdp, connection);

            }
            if (messageJSON == "Score Update") {
                updateTopScore(login);

            }

            if (messageJSON == "En attente d'une partie") {
                addUserInWaitingList(login, connection);
                searchForDuo(userWaitingList, connection);
            }

            if (messageJSON == "Création d'une nouvelle partie") {
                //creer une nouvelle partie
                // newParty(login, login);
            }

            if (messageJSON == "Classement") {
                getClassement(connection);
            }

        }
    });

    //A la fermeture d'une connection
    connection.on('close', function(reasonCode, description) {
        removeUserInConnectedList(loginInfo, connectionInfo);
        removeUserInWaitingList(loginInfo, connectionInfo);
        console.log("Déconnection d'un client - Serveur");
    });
});

let loginInfo;
let connectionInfo;
let usersConnectedList = []; //List socket pseudo
let userWaitingList = []; // Contient les logins utilisateur attendant partie
let userInGameList = []; //Contient les logins des utilisateurs en partie
let jsonMessageToClient;

//Connection d'un utilisateur
//Récupération 
function connectUser(login, mdp, connection) {
    let userInformations = [login, connection];
    usersConnectedList.push(userInformations);
    let json = JSON.stringify({ "message": "Utilisateur Connecté" });
    connection.send(json);
}

function addUserInWaitingList(login, connection) {
    console.log("Ajout de " + login + " dans la waiting list");
    let userInformations = [login, connection];
    userWaitingList.push(userInformations);
}


function searchForDuo(userWaitingList, connection) {
    if (userWaitingList.length >= 2) {
        console.log("searchForDuo");
        let duo = pickTwoUsers(userWaitingList);
        let pseudo1 = duo["pseudo1"][0];
        let pseudo2 = duo["pseudo2"][0];
        removeUserInWaitingList(pseudo1, connectionInfo);
        removeUserInWaitingList(pseudo2, connectionInfo);

        let json = JSON.stringify({ "message": "Duo trouvé" });
        connection.send(json);
    }
}

function pickTwoUsers(userWaitingList) {
    let index1 = Math.floor(Math.random() * userWaitingList.length);
    let pseudo1 = userWaitingList[index1];
    let index2 = Math.floor(Math.random() * userWaitingList.length);
    let pseudo2 = userWaitingList[index2];
    var duo = { "pseudo1": pseudo1, "pseudo2": pseudo2 }
    return duo;
}

function startGame(player1, player2) {}

function removeUserInWaitingList(login, connection) {
    console.log(userWaitingList);
    console.log("removeUserWaitingList");
    console.log(login);

    let userInformations = [login, connection];
    let indexOfUser = userWaitingList.indexOf(userInformations);
    userWaitingList.splice(indexOfUser, 1);
    console.log(userWaitingList);
}


function removeUserInConnectedList(login, connection) {
    console.log(usersConnectedList);
    console.log("usersConnectedList");
    console.log(login);

    let userInformations = [login, connection];
    let indexOfUser = usersConnectedList.indexOf(userInformations);
    usersConnectedList.splice(indexOfUser, 1);
    console.log(usersConnectedList);
}


function handleUserDisconnected() {

}




function addUserIfUnique(login, mdp, connection) {
    SomeUser.countDocuments({ pseudo: login }, function(err, count) {
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
    let instance = new SomeUser({ pseudo: login, mdp: mdp, nbPartiesJouees: 0, nbPartiesGagnees: 0 });
    instance.save(function(err) {
        if (err) return handleError(err);
        //console.log("addUser");
        createTopScore(login);
    });
}

function createTopScore(login) {
    let instanceTopScore = new topScore({ pseudo: login, score: 0 });
    instanceTopScore.save(function(err) {
        if (err) return handleError(err);
        //console.log("createTopScore")
    });
}

function updateTopScore(login) {
    let score = 0;
    SomeUser.findOne({ pseudo: login }, 'nbPartiesJouees nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        if (user.nbPartiesJouees != 0) {
            score = user.nbPartiesGagnees / user.nbPartiesJouees * 100;
        }
    });

    topScore.findOneAndReplace({ pseudo: login }, { pseudo: login, score: score }, function(err, user) {
        if (err) return handleError(err);
    });

    //console.log("updateTopScore")
}

function updateNbPartiesJouees(login) {
    SomeUser.findOne({ pseudo: login }, 'nbPartiesJouees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesJouees += 1;
    });
    //console.log("updateNbPartiesJouees")
}


function updateNbPartiesGagnees(login) {
    SomeUser.findOne({ pseudo: login }, 'nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesGagnees += 1;
    });
    //console.log("updateNbPartiesGagnees")
}

function getClassement(connection) {
    topScore.find(function(err, scores) {
        if (err) return handleError(err);
        //console.log(scores);
        let json = JSON.stringify({ "message": "Classement chargé", "scores": scores });
        connection.send(json);
    });
}


//Creer une nouvelle partie
function newParty(player1, player2) {
    let newParty = new currentGame({
        p1: player1,
        p2: player2,
        winner: "",
        loser: ""
    });

    //Stocker la parti en base de données
    try {
        newParty.save();
        //console.log("\nPartie sauvgarder en BDD\n");
    } catch (e) {
        console.error(e)
    };
}

//Ajout d'une partie
function addFinishGame(p1, p2, winner) {
    let instance = new finishedGame({ pseudo1: p1, pseudo2: p2, winner: winner })
}