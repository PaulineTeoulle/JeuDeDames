//Connection a mongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/JeuDeDames');

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

//Definition du schéma utilisateur
var SomeUser = mongoose.model('users', userSchema);

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
        connection.send("Message bien reçu - Serveur");

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

            if (messageJSON == "En attente d'une partie") {
                addUserInWaitingList(login, connection);
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

//Connection d'un utilisateur
//Récupération 
function connectUser(login, mdp, connection) {
    let userInformations = [login, connection];
    usersConnectedList.push(userInformations);
    console.log("Ajout de " + login + " dans la connected list");
    connection.send("Utilisateur Connecté");
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


function searchDuo() {

}

function startGame(player1, player2) {}

function removeUserInWaitingList(index) {
    userWaitingList.splice(index, 1);
}


function handleUserDisconnected() {

}


function addUserIfUnique(login, mdp, connection) {
    SomeUser.countDocuments({ pseudo: login }, function(err, count) {
        if (count == 0) {
            //console.log("UNIQUE");
            addUser(login, mdp, connection);
            connectUser(login, mdp, connection);
        } else {
            //console.log("NON UNIQUE");
            console.log(login + " non sauvegardé en BDD. Pseudo non unique.");
            connection.send("Erreur lors de la sauvegarde en BDD, pseudo déjà utilisé - Serveur");
            connectUser(login, mdp, connection);
        }
    });
}

//Ajout d'un utilisateur
function addUser(login, mdp, connection) {
    let instance = new SomeUser({ pseudo: login, mdp: mdp, nbPartiesJouees: 0, nbPartiesGagnees: 0 });
    instance.save(function(err) {
        if (err) return handleError(err);
        //console.log(login + " sauvegardé en BDD.");
        connection.send("Sauvegarde en BDD - Serveur");
    });
}