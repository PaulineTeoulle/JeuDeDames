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

//schéma utilisateur
const currentGameSchema = new Schema({
    pseudo1: String,
    pseudo2: String,
    matrice: [
        [Number]
    ]
});

const finishedGameSchema = new Schema({
    p1: userSchema.pseudo,
    p2: userSchema.pseudo,
    winner: userSchema.pseudo
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
    console.log("Connection au serveur depuis un client - Serveur");

    //Un socket console.log(connection); 

    //A la réception d'un message
    connection.on('message', function(message) {

        //Envoi d'un accusé de récéption au client
        console.log("Message reçu du client : " + message.utf8Data + " - Serveur");
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
            console.log(parsedJson);

        } catch (err) {
            messageIsJSON = false;
        }

        if (messageIsJSON) {
            //Récupération des données JSON envoyées par le client
            let messageJSON = parsedJson.message;
            let login = parsedJson.login;
            let mdp = parsedJson.mdp;
            if (messageJSON == "Auth") {
                addUserIfUnique(login, mdp, connection);

            }
            if (messageJSON == "Score Update") {
                updateTopScore(login);

            }

            if (messageJSON == "En attente d'une partie") {
                addUserInWaitingList(login, connection);
            }

            if (messageJSON == "Création d'une nouvelle partie") {

                //creer une nouvelle partie
                newParty(login, login);
            }

            if (messageJSON == "Classement") {
                getClassement(connection);
            }
        }
    });

    //A la fermeture d'une connection
    connection.on('close', function(reasonCode, description) {
        console.log("Connection fermée par un client - Serveur");
    });
});

let usersConnectedList = []; //List socket pseudo
let userWaitingList = []; // Contient les logins utilisateur attendant partie
let userInGameList = []; //Contient les logins des utilisateurs en partie
let jsonMessageToClient;
//Connection d'un utilisateur
//Récupération 
function connectUser(login, mdp, connection) {
    let userInformations = [login, connection];
    usersConnectedList.push(userInformations);
    console.log("Ajout de " + login + " dans la connected list");
    let json = JSON.stringify({ "message": "Utilisateur Connecté" });
    connection.send(json);
}

function addUserInWaitingList(login, connection) {
    console.log("Ajout de " + login + " dans la waiting list");
    let userInformations = [login, connection];
    userWaitingList.push(userInformations);
    console.log(userWaitingList);
}


function pickTwoUsers(userWaitingList) {
    let index1 = Math.floor(Math.random() * userWaitingList.length);
    let player1 = userWaitingList[index1];

    let index2 = Math.floor(Math.random() * userWaitingList.length);
    let player2 = userWaitingList[index2];
    return { player1, player2 };
}


function searchDuo() {}

function startGame(player1, player2) {}

function removeUserInWaitingList(index) {
    userWaitingList.splice(index, 1);
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
        console.log("addUser");
        createTopScore(login);
    });
}

function createTopScore(login) {
    let instanceTopScore = new topScore({ pseudo: login, score: 0 });
    instanceTopScore.save(function(err) {
        if (err) return handleError(err);
        console.log("createTopScore")
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

    console.log("updateTopScore")
}

function updateNbPartiesJouees(login) {
    SomeUser.findOne({ pseudo: login }, 'nbPartiesJouees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesJouees += 1;
    });
    console.log("updateNbPartiesJouees")
}


function updateNbPartiesGagnees(login) {
    SomeUser.findOne({ pseudo: login }, 'nbPartiesGagnees', function(err, user) {
        if (err) return handleError(err);
        user.nbPartiesGagnees += 1;
    });
    console.log("updateNbPartiesGagnees")
}

function getClassement(connection) {
    topScore.find(function(err, scores) {
        if (err) return handleError(err);
        console.log(scores);
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
        console.log("\nPartie sauvgarder en BDD\n");
    } catch (e) {
        console.error(e)
    };
}

//Ajout d'une partie
function addFinishGame(p1, p2, winner) {
    let instance = new finishedGame({ p1: userSchema.pseudo, p2: userSchema.pseudo, winner: none })
}