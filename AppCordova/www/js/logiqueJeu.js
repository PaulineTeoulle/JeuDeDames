  /*
                 0: videClair
                 1: videSombre
                 2: Joueur1 pieceBlanche
                 3: reineBlanche
                 6: joueur2 pieceNoire
                 7: reineNoire */
  /* var gameBoard = [
       [0, 1, 0, 1, 0, 1, 0, 1],
       [1, 0, 1, 0, 1, 0, 1, 0],
       [0, 1, 0, 6, 0, 1, 0, 1],
       [1, 0, 2, 0, 1, 0, 1, 0],
       [0, 1, 0, 1, 0, 1, 0, 1],
       [1, 0, 1, 0, 1, 0, 1, 0],
       [0, 1, 0, 1, 0, 1, 0, 1],
       [1, 0, 1, 0, 1, 0, 1, 0]
   ];*/

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

  var boardCode = "";
  var chosenField = "none";
  var turnOfPlayer;
  var win = false;
  var isNextJump = false;


  //Se déplacer
  function move(field) {
      gameBoard[getRow(field)][getCol(field)] = gameBoard[getRow(chosenField)][getCol(chosenField)];
      gameBoard[getRow(chosenField)][getCol(chosenField)] = 1;
      document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";
      chosenField = "none";
      changePlayer();
      draw();
  }


  //manger un piece d'adversaire
  function jump(field) {
      if (chosenField != "none") {
          var mediumRow = (getRow(field) + getRow(chosenField)) / 2;
          var mediumCol = (getCol(field) + getCol(chosenField)) / 2;
          gameBoard[getRow(field)][getCol(field)] = gameBoard[getRow(chosenField)][getCol(chosenField)];
          gameBoard[getRow(chosenField)][getCol(chosenField)] = 1;
          gameBoard[mediumRow][mediumCol] = 1;

          console.log("Joueur: " + turnOfPlayer + " a mange piece d'adversaire");
          document.querySelector('#' + chosenField).style.backgroundColor = "#A67D5D";
          if (canJumpTwoShots(field) == false) {
              isNextJump = false;
              chosenField = "none";
              mediumRow = "none";
              mediumCol = "none";
              winner();
              changePlayer();
              draw();
          } else {
              isNextJump = true;
              chosenField = field;
              document.querySelector('#' + chosenField).style.backgroundColor = "#25F400";
              mediumRow = "none";
              mediumCol = "none";
              draw();
          }
      }
  }


  //crée le plateau de jeu et les pieces
  function createFields() {
      drawEmptyBoard();
      drawFields();
  }