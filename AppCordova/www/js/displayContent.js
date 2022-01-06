function displayScore(object) {
    document.getElementById("choice").style.display = "none";
    document.getElementById('score').style.display = "block";
    createScoreTable(object);
}

function displayBoard() {
    document.getElementById("choice").style.display = "none";
    document.getElementById('board').style.display = "block";
    document.getElementById('score').style.display = "none";
}

function displayChoice() {
    document.getElementById("auth").style.display = "none";
    document.getElementById("choice").style.display = "block";
}

function createScoreTable(object) {
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