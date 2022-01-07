function doesFieldExists(row, col) {
    if (row < 8 && col < 8 && row >= 0 && col >= 0) return true;
    else return false;
}

// obtenir le numéro de ligne du nom du champ
function getRow(field) {
    return parseInt(field.charAt(5));
}

//obtenir le numéro de col à partir du nom du champ
function getCol(field) {
    return parseInt(field.charAt(6));
}



//Récupère le plateau et l'update
function updateBoard(newGameBoard) {
    gameBoardParsed = JSON.parse(newGameBoard);
    gameBoard = gameBoardParsed;
    drawFields();
}

//verifier si on peut jouer le carreau selectionne
function canChooseField(field) {
    if (turnOfPlayer == player1 && isClientTurnOf() &&
        (gameBoard[getRow(field)][getCol(field)] == 2 ||
            gameBoard[getRow(field)][getCol(field)] == 3)) {
        return true;
    } else if (turnOfPlayer == player2 && isClientTurnOf() &&
        (gameBoard[getRow(field)][getCol(field)] == 6 ||
            gameBoard[getRow(field)][getCol(field)] == 7)) {
        return true;
    }
}

function changePlayer() {
    if (win == false) {
        let newTurnOf;
        if (turnOfPlayer == login && player1 == login) {
            newTurnOf = player2;
        }
        if (turnOfPlayer == login && player2 == login) {
            newTurnOf = player1;
        }
        let json = JSON.stringify({ "action": "Set TurnOf", "data": { "login": login, "turnOfPlayer": newTurnOf } });
        ws.send(json);
    }
}


//changer la couleur d'element selectionner
function chooseField(field) {
    if (isClientTurnOf()) {
        if (isNextJump == false) {
            if (chosenField == field) {
                document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";
                chosenField = "none";
            } else {
                if (chosenField != "none") {
                    document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";
                }
                chosenField = field;
                document.querySelector('#' + chosenField).style.backgroundColor = "#25F400";
            }
        }
    }
}

//fonction qui retourne un vrai si on peut deplacer la piece en question
function canMove(field) {
    var row = getRow(field);
    var col = getCol(field);
    var chosenRow = getRow(chosenField);
    var chosenCol = getCol(chosenField);

    //console.log("[" + (row + 1) + ", " + (col + 1) + "]");

    if (chosenField != "none" && turnOfPlayer == player1 && gameBoard[chosenRow][chosenCol] == 3 &&
        (Math.abs(row - chosenRow) == Math.abs(col - chosenCol)) && gameBoard[row][col] == 1 && isClientTurnOf()) {
        return true;
    } else
    if (chosenField != "none" && turnOfPlayer == player2 && gameBoard[chosenRow][chosenCol] == 7 &&
        (Math.abs(row - chosenRow) == Math.abs(col - chosenCol)) && gameBoard[row][col] == 1 && isClientTurnOf()) {

        return true;
    }
    if (chosenField != "none" && turnOfPlayer == player1 && gameBoard[chosenRow][chosenCol] == 2 &&
        (row - chosenRow == -1) && Math.abs(col - chosenCol) == 1 && gameBoard[row][col] == 1 && isClientTurnOf()) {

        return true;
    } else
    if (chosenField != "none" && turnOfPlayer == player2 && gameBoard[chosenRow][chosenCol] == 6 &&
        (row - chosenRow == 1) && Math.abs(col - chosenCol) == 1 && gameBoard[row][col] == 1 && isClientTurnOf()) {

        return true;
    }
}

//verifier si on peut manger une piece 
function canJump() {
    console.log("Canjump");
    var isJumpPossible = false;

    let field = { row: 0, col: 0, value: 0 };
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (turnOfPlayer == player1 && gameBoard[row][col] == 2 || gameBoard[row][col] == 3) {
                field.col = col;
                field.row = row;
                field.value = gameBoard[row][col];

                if (doesFieldExists(field.row + 2, field.col + 2) && gameBoard[row + 2][col + 2] == 1 &&
                    (gameBoard[row + 1][col + 1] == 6 || gameBoard[row + 1][col + 1] == 7)) {
                    isJumpPossible = true;

                }
                if (doesFieldExists(field.row - 2, field.col + 2) && gameBoard[row - 2][col + 2] == 1 &&
                    (gameBoard[row - 1][col + 1] == 6 || gameBoard[row - 1][col + 1] == 7)) {
                    isJumpPossible = true;

                }
                if (doesFieldExists(field.row + 2, field.col - 2) && gameBoard[row + 2][col - 2] == 1 &&
                    (gameBoard[row + 1][col - 1] == 6 || gameBoard[row + 1][col - 1] == 7)) {
                    isJumpPossible = true;
                }
                if (doesFieldExists(field.row - 2, field.col - 2) && gameBoard[row - 2][col - 2] == 1 &&
                    (gameBoard[row - 1][col - 1] == 6 || gameBoard[row - 1][col - 1] == 7)) {
                    isJumpPossible = true;
                }
            }
            if (turnOfPlayer == player2 && gameBoard[row][col] == 6 || gameBoard[row][col] == 7) {
                if (doesFieldExists(field.row + 2, field.col + 2) && gameBoard[row + 2][col + 2] == 1 &&
                    (gameBoard[row + 1][col + 1] == 2 || gameBoard[row + 1][col + 1] == 3)) {
                    isJumpPossible = true;

                }
                if (doesFieldExists(field.row - 2, field.col + 2) && gameBoard[row - 2][col + 2] == 1 &&
                    (gameBoard[row - 1][col + 1] == 2 || gameBoard[row - 1][col + 1] == 3)) {
                    isJumpPossible = true;
                }
                if (doesFieldExists(field.row + 2, field.col - 2) && gameBoard[row + 2][col - 2] == 1 &&
                    (gameBoard[row + 1][col - 1] == 2 || gameBoard[row + 1][col - 1] == 3)) {
                    isJumpPossible = true;
                }
                if (doesFieldExists(field.row - 2, field.col - 2) && gameBoard[row - 2][col - 2] == 1 &&
                    (gameBoard[row - 1][col - 1] == 2 || gameBoard[row - 1][col - 1] == 3)) {
                    isJumpPossible = true;
                }
            }
        }
    }
    return isJumpPossible;
}

function canJumpParticular(field, field2) {

    console.log("Can jump");
    var row = getRow(field);
    var col = getCol(field);
    var row2 = getRow(field2);
    var col2 = getCol(field2);
    var isJumpPossible = false;
    if (gameBoard[row][col] == 2 || gameBoard[row][col] == 3) {
        if (doesFieldExists(row + 2, col + 2) && gameBoard[row + 2][col + 2] == 1 &&
            row + 2 == row2 && col + 2 == col2 && (gameBoard[row + 1][col + 1] == 6 || gameBoard[row + 1][col + 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col + 2) && gameBoard[row - 2][col + 2] == 1 &&
            row - 2 == row2 && col + 2 == col2 && (gameBoard[row - 1][col + 1] == 6 || gameBoard[row - 1][col + 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row + 2, col - 2) && gameBoard[row + 2][col - 2] == 1 &&
            row + 2 == row2 && col - 2 == col2 && (gameBoard[row + 1][col - 1] == 6 || gameBoard[row + 1][col - 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col - 2) && gameBoard[row - 2][col - 2] == 1 &&
            row - 2 == row2 && col - 2 == col2 && (gameBoard[row - 1][col - 1] == 6 || gameBoard[row - 1][col - 1] == 7)) {
            isJumpPossible = true;
        }
    }
    if (gameBoard[row][col] == 6 || gameBoard[row][col] == 7) {
        if (doesFieldExists(row + 2, col + 2) && gameBoard[row + 2][col + 2] == 1 &&
            row + 2 == row2 && col + 2 == col2 && (gameBoard[row + 1][col + 1] == 2 || gameBoard[row + 1][col + 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col + 2) && gameBoard[row - 2][col + 2] == 1 &&
            row - 2 == row2 && col + 2 == col2 && (gameBoard[row - 1][col + 1] == 2 || gameBoard[row - 1][col + 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row + 2, col - 2) && gameBoard[row + 2][col - 2] == 1 &&
            row + 2 == row2 && col - 2 == col2 && (gameBoard[row + 1][col - 1] == 2 || gameBoard[row + 1][col - 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col - 2) && gameBoard[row - 2][col - 2] == 1 &&
            row - 2 == row2 && col - 2 == col2 && (gameBoard[row - 1][col - 1] == 2 || gameBoard[row - 1][col - 1] == 3)) {
            isJumpPossible = true;
        }
    }
    return isJumpPossible;
}

//verifier si on peut faire un deuxieme coup
function canJumpTwoShots(field) {
    var isJumpPossible = false;
    var row = getRow(field);
    var col = getCol(field);

    if (turnOfPlayer == player1 && gameBoard[row][col] == 2 || gameBoard[row][col] == 3) {
        if (doesFieldExists(row + 2, col + 2) && gameBoard[row + 2][col + 2] == 1 &&
            (gameBoard[row + 1][col + 1] == 6 || gameBoard[row + 1][col + 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col + 2) && gameBoard[row - 2][col + 2] == 1 &&
            (gameBoard[row - 1][col + 1] == 6 || gameBoard[row - 1][col + 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row + 2, col - 2) && gameBoard[row + 2][col - 2] == 1 &&
            (gameBoard[row + 1][col - 1] == 6 || gameBoard[row + 1][col - 1] == 7)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col - 2) && gameBoard[row - 2][col - 2] == 1 &&
            (gameBoard[row - 1][col - 1] == 6 || gameBoard[row - 1][col - 1] == 7)) {
            isJumpPossible = true;
        }
    }
    if (turnOfPlayer == player2 && gameBoard[row][col] == 6 || gameBoard[row][col] == 7) {
        if (doesFieldExists(row + 2, col + 2) && gameBoard[row + 2][col + 2] == 1 &&
            (gameBoard[row + 1][col + 1] == 2 || gameBoard[row + 1][col + 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col + 2) && gameBoard[row - 2][col + 2] == 1 &&
            (gameBoard[row - 1][col + 1] == 2 || gameBoard[row - 1][col + 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row + 2, col - 2) && gameBoard[row + 2][col - 2] == 1 &&
            (gameBoard[row + 1][col - 1] == 2 || gameBoard[row + 1][col - 1] == 3)) {
            isJumpPossible = true;
        }
        if (doesFieldExists(row - 2, col - 2) && gameBoard[row - 2][col - 2] == 1 &&
            (gameBoard[row - 1][col - 1] == 2 || gameBoard[row - 1][col - 1] == 3)) {
            isJumpPossible = true;
        }
    }
    return isJumpPossible;
}


//déterminer le gagnant
function winner() {
    var i = 0;
    var j = 0;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (gameBoard[row][col] == 2)
                i++;
            if (gameBoard[row][col] == 6)
                j++;
        }
    }
    if (i == 0 || j == 0) {
        win = true;
        let json = JSON.stringify({ "action": "End Game", "data": { "login": login, "winner": turnOfPlayer, "player1": player1, "player2": player2 } });
        ws.send(json);
    }
}

function isClientTurnOf() {
    return login == turnOfPlayer;
}