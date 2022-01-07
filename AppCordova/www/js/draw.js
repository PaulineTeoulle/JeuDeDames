function drawEmptyBoard() {
    console.log("Tour du joueur :  " + turnOfPlayer)
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if ((row % 2 == 0 && col % 2 == 1) || (row % 2 == 1 && col % 2 == 0)) {
                boardCode += "<div class=\"dark\" id=field" + row + col + "></div>";
            } else {
                boardCode += "<div class=\"light\" id=field" + row + col + "></div>";
            }
        }
    }
}

function drawFields() {
    document.getElementById("board").innerHTML = boardCode;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            let valeur = gameBoard[row][col];
            let field = { row: row, col: col, value: valeur };
            drawField(field);
            if (gameBoard[row][col] != 0) {
                document.querySelector('#field' + row + col).addEventListener('click', function() {
                    if (canChooseField(this.id)) {
                        chooseField(this.id);
                    } else if (chosenField != "none" &&
                        canJump() &&
                        canJumpParticular(chosenField, this.id)) {
                        jump(this.id);

                    } else if (chosenField != "none" &&
                        canJump() == false &&
                        canMove(this.id)) {
                        move(this.id);
                    }
                });
            }
        }
    }
}


function drawField(field) {
    let row = field.row;
    let col = field.col;
    let value = field.value;
    if (isNextJump == false) {
        if (row == 0 && value == 2) {
            value = 3;
            gameBoard[row][col] = 3;
        }
        if (row == 7 && value == 6) {
            value = 7;
            gameBoard[row][col] = 7;
        }
    }
    if (value == 1) {
        document.querySelector("#field" + row + col).innerHTML = "";
    } else if (value == 2) {
        document.querySelector("#field" + row + col).innerHTML = "<svg width=\"80\" height=\"80\" xmlns=\"http://www.w3.org/2000/svg\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <style type=\"text/css\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                #pieceBlanche {cx:40px; cy:40px; r:32px; fill:white;}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                @media screen and (max-width: 500px){\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    #pieceBlanche {cx:20px; cy:20px; r:16px; fill:white;}}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            </style>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <circle id=\"pieceBlanche\"/>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </svg>";
    } else if (value == 3) {
        document.querySelector("#field" + row + col).innerHTML = "<svg width=\"80\" height=\"80\" xmlns=\"http://www.w3.org/2000/svg\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <style type=\"text/css\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                #reineBlanche {cx:40px; cy:40px; r:32px; fill:white;}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                @media screen and (max-width: 500px){\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    #reineBlanche {cx:20px; cy:20px; r:16px; fill:white;}}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            </style>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <circle id=\"reineBlanche\" />\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </svg>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        <img src=\"../img/queenNoir.png\" class=\"crown\">";
    } else if (value == 6) {
        document.querySelector("#field" + row + col).innerHTML = "<svg width=\"80\" height=\"80\" xmlns=\"http://www.w3.org/2000/svg\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <style type=\"text/css\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                #pieceNoire {cx:40px; cy:40px; r:32px; fill:black;}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                @media screen and (max-width: 500px){\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    #pieceNoire {cx:20px; cy:20px; r:16px; fill:black;}}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            </style>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <circle id=\"pieceNoire\"/>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </svg>";
    } else if (value == 7) {
        document.querySelector("#field" + row + col).innerHTML = "<svg width=\"80\" height=\"80\" xmlns=\"http://www.w3.org/2000/svg\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <style type=\"text/css\">\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                #reineNoire {cx:40px; cy:40px; r:32px; fill:black;}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    @media screen and (max-width: 500px){\
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        #reineNoire {cx:20px; cy:20px; r:16px; fill:black;}}\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            </style>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <circle id=\"reineNoire\"/>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </svg>\
                                                                                                                                                                                                                                                                                                                                                                                                                                                        <img src=\"../img/queenBlanche.png\" class=\"crown\">";
    }
}


//Dessiner les pièces
function draw() {
    let field = { row: 0, col: 0, value: 0 };
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            field.col = col;
            field.row = row;
            field.value = gameBoard[row][col];
            drawField(field);
        }
    }
    if (win == false) {

        let json = JSON.stringify({ "action": "Update GameBoard", "data": { "login": login, "gameBoard": gameBoard } });
        ws.send(json);
    }
}