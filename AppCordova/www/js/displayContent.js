function displayClassement(object) {
    document.getElementById("choix").style.display = "none";
    document.getElementById('classement').style.display = "block";
    console.log(object);
}

function displayBoard() {
    document.getElementById("choix").style.display = "none";
    document.getElementById('board').style.display = "block";
}

function displayChoix() {
    document.getElementById("log").style.display = "none";
    document.getElementById("choix").style.display = "block";
}