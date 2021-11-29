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
var SomeUser  = mongoose.model('users', userSchema);

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
wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);
  console.log("Connection au serveur depuis un client - Serveur");

  //Un socket console.log(connection); 
  
  //A la réception d'un message
  connection.on('message', function (message) {

    //Envoi d'un accusé de récéption au client
    console.log("Message reçu du client : " + message.utf8Data + " - Serveur");
    connection.send("Message bien reçu - Serveur");

    //Gestion du message si c'est un JSON ou non
    let messageIsJSON = true;
    try {
      var parsedJson = JSON.parse(message.utf8Data);
    }
    catch (err) {
      messageIsJSON = false;
    }


    if (messageIsJSON) {
      //Récupération des données JSON envoyées par le client
      let login = parsedJson.login;
      let mdp = parsedJson.mdp;
      connectUser(login,mdp, connection);
      //addUserIfUnique(login,mdp, connection);
    }
  });

  //A la fermeture d'une connection
  connection.on('close', function (reasonCode, description) {
    console.log("Connection fermée par un client - Serveur");
  });
});

let usersConnectedList = []; //List socket pseudo
let userWaitingList = []; // COntient les logins utilisateur attendant partie
let userInGameList =[]; //COntient les logins des utilisateurs en partie

//Connection d'un utilisateur
//Récupération 
function connectUser(login,mdp, connection){
   SomeUser.findOne({ pseudo:login, mdp: mdp}, function (err, user) {
    if (err) return handleError(err);
    if(user !=null){
      console.log("PRESENT");
      let userInformations =[login,connexion];
      usersConnectedList.push(userInformations); 
    }
    else {
      console.log("EXISTE PAS");
    }
  });;
}

//Ajout d'un utilisateur si unique
function addUserIfUnique(login,mdp, connection){
  SomeUser.countDocuments({ pseudo: login }, function (err, count) {
    if(count==0){
      console.log("UNIQUE");
      addUser(login, mdp, connection);
    }
    else {
      console.log("NON UNIQUE");
      console.log(login + " non sauvegardé en BDD. Pseudo non unique.");
      connection.send("Erreur lors de la sauvegarde en BDD, pseudo déjà utilisé - Serveur");
    }
  });
}

//Ajout d'un utilisateur
function addUser(login, mdp, connection){
  let instance =  new SomeUser({ pseudo: login, mdp:mdp, nbPartiesJouees: 0, nbPartiesGagnees: 0});
  instance.save(function (err) {
    if (err) return handleError(err);
    console.log(login + " sauvegardé en BDD.");
    connection.send("Sauvegarde en BDD - Serveur");
  });
}

function pickTwoUsers(userWaitingList){
    let index1 = Math.floor(Math.random() * userWaitingList.length);
    let player1 = userWaitingList[index1];

    let index2 = Math.floor(Math.random() * userWaitingList.length);
    let player2 = userWaitingList[index2];
    return {player1, player2};
}

function startGame(player1, player2){
}

function removeUserInWaitingList(index){
  userWaitingList.splice(index, 1);
}


function handleUserDisconnected(){

}