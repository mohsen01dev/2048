// Define variables and DOM elements
const gameBoardDiv = document.getElementById("game-board");
let gameBoard;

// Set up game when window loads
window.onload = function () {
  setGame();
};

// Set up initial game state
function setGame() {
  // Add initial game board with empty tiles
  gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  // Add and style tiles with IDs from game board
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();

      let num = gameBoard[r][c];

      updateTile(tile, num);
      gameBoardDiv.append(tile);
    }
  }
}

// Update tile content and style based on number
function updateTile(tile, num) {
  tile.innerText = "";
  tile.classList.value = "";

  tile.classList.add("tile");

  if (num > 0) {
    tile.innerText = num;

    if (num <= 2048) tile.classList.add("t" + num.toString());
    else tile.classList.add("t-greater");
  }
}
