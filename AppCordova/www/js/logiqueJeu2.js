  /*
                                                                      0: videClair
                                                                      1: videSombre
                                                                      2: Joueur1 pieceBlanche
                                                                      3: reineBlanche
                                                                      6: joueur2 pieceNoire
                                                                      7: reineNoire */
  var gameBoard = [
      [0, 6, 0, 6, 0, 6, 0, 6],
      [6, 0, 6, 0, 6, 0, 6, 0],
      [0, 6, 0, 6, 0, 6, 0, 6],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0]
  ];
  var field = [];
  var boardCode = "";
  var chosenField = "none";
  var player = 1;
  var win = false;
  var isNextJump = false;
  var nbCoup = 0;

  class Field {
      constructor(row, col) {
          this.row = row;
          this.col = col;
          this.value = gameBoard[row][col];
      }

      draw(row, col) {
          var value = gameBoard[row][col];
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

  }


  document.addEventListener("DOMContentLoaded", function() {
      createFields();
  })

  //verifier si le champ selectionne existe
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

  //verifier si on peut jouer le carreau selectionne
  function canChooseField(field) {
      if (player == 1 &&
          (gameBoard[getRow(field)][getCol(field)] == 2 ||
              gameBoard[getRow(field)][getCol(field)] == 3)) {
          return true;
      } else if (player == 2 &&
          (gameBoard[getRow(field)][getCol(field)] == 6 ||
              gameBoard[getRow(field)][getCol(field)] == 7)) {
          return true;
      }
  }

  //changer de joueur aprés son tour
  function changePlayer() {
      if (player == 1) {
          player = 2;
      } else {
          player = 1;
      }

      if (win == false)
          console.log("Tour du joueur " + player);
  }

  //changer la couleur d'element selectionner
  function chooseField(field) {
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

  function chooseField(field) {
      if (isNextJump == false) {
          if (chosenField == field) {
              chosenField = "none";
          } else {
              if (chosenField != "none") {}
              chosenField = field;
          }
      }
  }

  //fonction qui retourne un vrai si on peut deplacer la piece en question
  function canMove(field) {
      var row = getRow(field);
      var col = getCol(field);
      var chosenRow = getRow(chosenField);
      var chosenCol = getCol(chosenField);

      console.log("[" + (row + 1) + ", " + (col + 1) + "]");
      console.log(gameBoard);

      if (chosenField != "none" && player == 1 && gameBoard[chosenRow][chosenCol] == 3 &&
          (Math.abs(row - chosenRow) == Math.abs(col - chosenCol)) && gameBoard[row][col] == 1) {
          return true;
      } else
      if (chosenField != "none" && player == 2 && gameBoard[chosenRow][chosenCol] == 7 &&
          (Math.abs(row - chosenRow) == Math.abs(col - chosenCol)) && gameBoard[row][col] == 1) {
          return true;
      }
      if (chosenField != "none" && player == 1 && gameBoard[chosenRow][chosenCol] == 2 &&
          (row - chosenRow == -1) && Math.abs(col - chosenCol) == 1 && gameBoard[row][col] == 1) {
          return true;
      } else
      if (chosenField != "none" && player == 2 && gameBoard[chosenRow][chosenCol] == 6 &&
          (row - chosenRow == 1) && Math.abs(col - chosenCol) == 1 && gameBoard[row][col] == 1) {
          return true;
      }
  }

  //Se déplacer
  function move(field) {
      gameBoard[getRow(field)][getCol(field)] = gameBoard[getRow(chosenField)][getCol(chosenField)];
      gameBoard[getRow(chosenField)][getCol(chosenField)] = 1;

      document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";

      chosenField = "none";

      //TODO : Envoyer la matrice au serveur
      changePlayer();
      draw();
  }

  //verifier si on peut manger une piece 
  function canJump() {
      var isJumpPossible = false;
      for (var row = 0; row < 8; row++) {
          for (var col = 0; col < 8; col++) {
              if (player == 1 && gameBoard[row][col] == 2 || gameBoard[row][col] == 3) {
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
              if (player == 2 && gameBoard[row][col] == 6 || gameBoard[row][col] == 7) {
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
          }
      }
      return isJumpPossible;
  }

  function canJumpParticular(field, field2) {
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
      console.log("[" + (row + 1) + ", " + (col + 1) + "]");

      if (player == 1 && gameBoard[row][col] == 2 || gameBoard[row][col] == 3) {
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
      if (player == 2 && gameBoard[row][col] == 6 || gameBoard[row][col] == 7) {
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


  //manger un piece d'adversaire
  function jump(field) {
      if (chosenField != "none") {
          var mediumRow = (getRow(field) + getRow(chosenField)) / 2;
          var mediumCol = (getCol(field) + getCol(chosenField)) / 2;
          gameBoard[getRow(field)][getCol(field)] = gameBoard[getRow(chosenField)][getCol(chosenField)];
          gameBoard[getRow(chosenField)][getCol(chosenField)] = 1;
          gameBoard[mediumRow][mediumCol] = 1;

          console.log("Joueur: " + player + " a mange piece d'adversaire");
          document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";


          if (canJumpTwoShots(field) == false) {
              isNextJump = false;
              chosenField = "none";
              mediumRow = "none";
              mediumCol = "none";

              //TODO : Envoyer la matrice au serveur
              winner();
              changePlayer();
              draw();
          } else {
              isNextJump = true;
              chosenField = field;

              document.querySelector('#' + chosenField).style.backgroundColor = "#25F400";

              mediumRow = "none";
              mediumCol = "none";
              //TODO : Envoyer la matrice au serveur
              draw();
          }
      }
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
          alert("Le joueur " + player + " à gagner !!");

          //TODO : Envoyer le winner au serveur
      }
  }

  //dessiner les pieces
  function draw() {
      nbCoup++;
      console.log("Matrice : " + gameBoard);
      console.log("NbCoup : " + nbCoup);
      for (var row = 0; row < 8; row++) {
          for (var col = 0; col < 8; col++) {
              field[row][col].draw(row, col);
          }
      }

      let json = JSON.stringify({ "message": "DESSIN", "login": login, "gameBoard": gameBoard });
      ws.send(json);
      //TODO : Envoyer matrice
  }

  //crée le plateau de jeu et les piece
  function createFields() {

      console.log("Tour du joueur " + player)
      for (var row = 0; row < 8; row++) {
          field[row] = [];
          for (var col = 0; col < 8; col++) {
              field[row][col] = new Field(row, col);
              console.log(field[row][col]);
              if ((row % 2 == 0 && col % 2 == 1) || (row % 2 == 1 && col % 2 == 0)) {
                  boardCode += "<div class=\"dark\" id=field" + row + col + "></div>";
              } else {
                  boardCode += "<div class=\"light\" id=field" + row + col + "></div>";
              }
          }
      }
      document.getElementById("board").innerHTML = boardCode;
      for (var row = 0; row < 8; row++) {
          for (var col = 0; col < 8; col++) {
              field[row][col].draw(row, col);
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

  function updateBoard(newGameBoard) {
      console.log(gameBoard + "gameBOARD");
      gameBoard = newGameBoard;
      draw();
  }