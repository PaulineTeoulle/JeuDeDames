function displayClassement(object) {
    document.getElementById("choix").style.display = "none";
    document.getElementById('classement').style.display = "block";
    getDataClassement(object);
}

function displayBoard() {
    document.getElementById("choix").style.display = "none";
    document.getElementById('board').style.display = "block";
    document.getElementById('classement').style.display = "none";
    document.getElementById('checkeredLoading').style.display = "none";
}

function displayWaitingRoom() {
    document.getElementById("choix").style.display = "none";
    document.getElementById('board').style.display = "none";
    document.getElementById('classement').style.display = "none";
    document.getElementById('checkeredLoading').style.display = "block";
}

function displayChoix() {
    document.getElementById("log").style.display = "none";
    document.getElementById("choix").style.display = "block";
}

function getDataClassement(object) {
    console.log(object);
    var classement = document.getElementById("scoreBoard");
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");

    var titleRow = document.createElement("tr");
    var titleUser = document.createElement("th");
    var titleUserText = document.createTextNode("Utilisateur");
    var titleScore = document.createElement("th");
    var titleScoreText = document.createTextNode("Score");

    titleUser.appendChild(titleUserText);
    titleRow.appendChild(titleUser);
    titleScore.appendChild(titleScoreText);
    titleRow.appendChild(titleScore);
    tblBody.appendChild(titleRow);

    object.forEach(element => {
        var row = document.createElement("tr");
        var cellPseudo = document.createElement("td");
        var cellTextPseudo = document.createTextNode(element["pseudo"]);
        var cellScore = document.createElement("td");
        var cellTextScore = document.createTextNode(element["score"]);

        cellPseudo.appendChild(cellTextPseudo);
        row.appendChild(cellPseudo);
        cellScore.appendChild(cellTextScore);
        row.appendChild(cellTextScore);
        tblBody.appendChild(row);
    });

    tbl.appendChild(tblBody);
    classement.appendChild(tbl);
}