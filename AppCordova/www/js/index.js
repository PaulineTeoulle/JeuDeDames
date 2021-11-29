
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//Ouverture d'une websocket
const ws = new WebSocket('ws://127.0.0.1:9898/');
//Listener d'ouverture de websocket
ws.onopen = function () {
 console.log("Websocket ouvert - Client");
 console.log(ws.id); // ojIckSD2jqNzOqIrAGzL
};

/*
Listener des messages entrants
Selon le message du serveur que l'on vient de recevoir, on fait un affichage
*/
ws.onmessage = function (e) {
    document.getElementById("messageServeur").innerHTML = e.data;
    //Cas où l'authentification est validée par le serveur
    if(e.data == "Authentification valide - Serveur"){
         document.getElementById("messageServeur").style.color = "green";
    }
    //Cas où l'authentification est invalidée par le serveur
    else if(e.data == "Authentification invalide - Serveur"){
         document.getElementById("messageServeur").style.color = "red";
    }
    //Cas pour remettre le style par défault pour un message simple
    else if(e.data == "Message bien reçu - Serveur"){
             document.getElementById("messageServeur").style.color = "white";
    }
};


/*
Récupération des inputs du client, formattage en JSON et envoi vers le serveur
*/
function authentification(){
    let login = document.getElementById("login").value;
    let mdp = document.getElementById("mdp").value;
    let json = JSON.stringify({ "login": login, "mdp": mdp });
    ws.send(json);
}
=======
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

document.getElementById("btn").addEventListener("click", send);

function send() {
    var log = document.getElementById("login").value;
    var mdp = document.getElementById("mdp").value;
    document.getElementById("user").innerHTML = log;
    if(log!=="" && mdp!==""){
    document.getElementById('log').style.display = "none";
    document.getElementById('choix').style.display = "block";
    }
    //send(login, mdp) envoie variables au serveur
 }

 document.getElementById("nGame").addEventListener("click", displayGame);

 function displayGame() {
    document.getElementById('choix').style.display = "none";
    document.getElementById('board').style.display = "block";
 }

 document.getElementById("class").addEventListener("click", displayClass);

 function displayClass() {
    document.getElementById('choix').style.display = "none";
    document.getElementById('classement').style.display = "block";
 }
