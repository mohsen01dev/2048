// Define variables and DOM elements
const gameBoardDiv = document.getElementById("game-board");
let gameBoard;
let isKeyDown = false;

// Set up game when window loads
window.onload = function () {
  setGame();
};

// Set up initial game state
function setGame() {
  // Add initial game board with empty tiles
  gameBoard = [
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [4, 4, 8, 8],
    [4, 4, 8, 8],
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

// Process key press actions (once per key press)
document.addEventListener("keydown", (e) => {
  if (e.code == "ArrowLeft" && !isKeyDown) {
    isKeyDown = true;
    slideLeft();
  }
});

// Reset key state on key release
document.addEventListener("keyup", () => {
  isKeyDown = false;
});

// Execute corresponding code if the pressed key is "left"
function slideLeft() {
  for (let r = 0; r < 4; r++) {
    let row = gameBoard[r];
    row = slide(row);
    gameBoard[r] = row;

    // Update DOM tiles
    for (let c = 0; c < 4; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
  }
}

// Slide and merge left-matching tiles, then update row
function slide(row) {
  row = removeZero(row);

  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] == row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
    }
  }

  row = removeZero(row);
  while (row.length < 4) row.push(0); // Add zeros to end of array

  return row;
}

// Create a new array without zeros
function removeZero(row) {
  return row.filter((num) => num != 0);
}
