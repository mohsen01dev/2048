// Define variables and DOM elements
const gameBoardContainer = document.getElementById("game-board-container");
const popUpContainer = document.getElementsByClassName("pop-up-container")[0];
const newGameButton = document.getElementById("new-game-btn");
const scoreDisplay = document.getElementById("score");

let gameBoard = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
let currentKey = null;
let isGameWon = false;
let isPopUpVisible = false;
let currentScore = 0;

// Set up game when window loads
window.onload = function () {
  setGame();
  loadGame();

  // Check if game board is empty and generate two initial random tiles if so
  const isGameBoardEmpty = gameBoard.every((row) =>
    row.every((tile) => tile == 0)
  );
  if (isGameBoardEmpty) {
    generateRandomTile();
    generateRandomTile();
  }
};

// Set up initial game state
function setGame() {
  // Add and style tiles with IDs to game board
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();

      let num = gameBoard[r][c];

      updateTile(tile, num);
      gameBoardContainer.append(tile);
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
  // Prevent action if pop-up is visible or key is pressed
  if (isPopUpVisible || currentKey !== null) {
    return;
  }

  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
    currentKey = e.code;

    if (e.code == "ArrowLeft") {
      slideLeft();
    } else if (e.code == "ArrowRight") {
      slideRight();
    } else if (e.code == "ArrowUp") {
      slideUp();
    } else if (e.code == "ArrowDown") {
      slideDown();
    }

    scoreDisplay.innerHTML = `Score: ${currentScore}`;

    checkWin();
    checkLose();
    generateRandomTile();
  }
});

// Reset key state on key release
document.addEventListener("keyup", (e) => {
  if (e.code === currentKey) {
    currentKey = null;
  }
});

// Execute corresponding code if the pressed key is "left"
function slideLeft() {
  for (let r = 0; r < 4; r++) {
    let row = gameBoard[r];
    row = slide(row);
    gameBoard[r] = row;

    updateDOMHorizontalSlide(r);
  }
}

// Update DOM for horizontal slide
function updateDOMHorizontalSlide(r) {
  for (let c = 0; c < 4; c++) {
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    let num = gameBoard[r][c];
    updateTile(tile, num);
  }
}

// Slide and merge left-matching tiles, then update row
function slide(row) {
  row = removeZero(row);

  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] == row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;

      currentScore += row[i];
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

// Execute corresponding code if the pressed key is "right"
function slideRight() {
  for (let r = 0; r < 4; r++) {
    let row = gameBoard[r];
    row.reverse(); // Reverse row to simulate sliding right
    row = slide(row);
    row.reverse(); // Restore original order
    gameBoard[r] = row;

    updateDOMHorizontalSlide(r);
  }
}

// Execute corresponding code if the pressed key is "up"
function slideUp() {
  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      gameBoard[0][c],
      gameBoard[1][c],
      gameBoard[2][c],
      gameBoard[3][c],
    ];
    row = slide(row);

    updateDOMVerticalSlide(c, row);
  }
}

// Update game board and DOM for vertical slide
function updateDOMVerticalSlide(c, row) {
  for (let r = 0; r < 4; r++) {
    gameBoard[r][c] = row[r]; // Convert row array back to column
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    let num = gameBoard[r][c];
    updateTile(tile, num);
  }
}

// Execute corresponding code if the pressed key is "down"
function slideDown() {
  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      gameBoard[0][c],
      gameBoard[1][c],
      gameBoard[2][c],
      gameBoard[3][c],
    ];
    row.reverse(); // Reverse row to simulate sliding down
    row = slide(row);
    row.reverse(); // Restore original order

    updateDOMVerticalSlide(c, row);
  }
}

// Randomly place 2 (90%) or 4 (10%) on an empty tile, if available
function generateRandomTile() {
  let foundEmptyTile = hasEmptyTile();

  while (foundEmptyTile) {
    let r = Math.floor(Math.random() * 4);
    let c = Math.floor(Math.random() * 4);

    if (gameBoard[r][c] == 0) {
      // Generate random number between 1 and 10
      let randomNumber = Math.floor(Math.random() * 10) + 1;

      // Decide if tile is 2 (90%) or 4 (10%) based on random number
      if (randomNumber <= 9) {
        gameBoard[r][c] = 2;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.innerHTML = "2";
        tile.classList.add("t2");
      } else {
        gameBoard[r][c] = 4;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.innerHTML = "4";
        tile.classList.add("t4");
      }

      foundEmptyTile = false;
    }
  }
}

// Check for any empty tile on the board
function hasEmptyTile() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) if (gameBoard[r][c] == 0) return true;
  }

  return false;
}

// Check win condition (2048 tile) and show win pop-up
function checkWin() {
  if (!isGameWon) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (gameBoard[r][c] == 2048) {
          isGameWon = true;
          isPopUpVisible = true;

          popUpContainer.innerHTML = `
          <div class="pop-up-content-container">
            <h1>You Won!</h1>
            <p>Congratulations! You've reached the 2048 tile.</p>
  
            <div class="pop-up-btn-container">
              <button type="button" id="pop-up-new-game-btn">New Game</button>
              <button type="button" id="pop-up-continue-playing-btn">Continue Playing</button>
            </div>
          </div>
          `;

          popUpContainer.classList.remove("deactive");

          // Handle "New Game" button click to restart the game
          const popUpNewGameButton = document.getElementById(
            "pop-up-new-game-btn"
          );
          popUpNewGameButton.addEventListener("click", () => {
            newGame();

            popUpContainer.classList.add("deactive");
            isPopUpVisible = false;
          });

          // Process "Continue Playing" button click to resume game
          const popUpContinuePlayingButton = document.getElementById(
            "pop-up-continue-playing-btn"
          );
          popUpContinuePlayingButton.addEventListener("click", () => {
            popUpContainer.classList.add("deactive");
            isPopUpVisible = false;
          });
        }
      }
    }
  }
}

// Check lose condition (no empty tiles and valid moves) and show lose pop-up
function checkLose() {
  // Deep copy game board to preserve original
  const copyGameBoard = JSON.parse(JSON.stringify(gameBoard));

  let foundEmptyTile = hasEmptyTile();
  let canSlideLeft = simulateSlideLeft(copyGameBoard);
  let canSlideRight = simulateSlideRight(copyGameBoard);
  let canSlideUp = simulateSlideUp(copyGameBoard);
  let canSlideDown = simulateSlideDown(copyGameBoard);

  if (
    !foundEmptyTile &&
    !canSlideLeft &&
    !canSlideRight &&
    !canSlideUp &&
    !canSlideDown
  ) {
    isPopUpVisible = true;

    popUpContainer.innerHTML = `
      <div class="pop-up-content-container">
        <h1>You Lost!</h1>
        <p>Sorry! You've run out of moves.</p>
    
        <div class="pop-up-btn-container">
          <button type="button" id="pop-up-new-game-btn">New Game</button>
        </div>
      </div>
    `;

    popUpContainer.classList.remove("deactive");

    // Handle "New Game" button click to restart the game
    const popUpNewGameButton = document.getElementById("pop-up-new-game-btn");
    popUpNewGameButton.addEventListener("click", () => {
      newGame();

      popUpContainer.classList.add("deactive");
      isPopUpVisible = false;
    });
  }
}

// Simulate left slide operation without updating DOM
function simulateSlideLeft(copyGameBoard) {
  const initialGameBoardState = JSON.stringify(copyGameBoard);

  for (let r = 0; r < 4; r++) {
    let row = copyGameBoard[r];
    row = simulateSlide(row);
    copyGameBoard[r] = row;
  }

  return JSON.stringify(copyGameBoard) !== initialGameBoardState;
}

// Simulate slide() to use in simulate functions
function simulateSlide(row) {
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

// Simulate right slide operation without updating DOM
function simulateSlideRight(copyGameBoard) {
  const initialGameBoardState = JSON.stringify(copyGameBoard);

  for (let r = 0; r < 4; r++) {
    let row = copyGameBoard[r];
    row.reverse(); // Reverse row to simulate sliding right
    row = simulateSlide(row);
    row.reverse(); // Restore original order
    copyGameBoard[r] = row;
  }

  return JSON.stringify(copyGameBoard) !== initialGameBoardState;
}

// Simulate up slide operation without updating DOM
function simulateSlideUp(copyGameBoard) {
  const initialGameBoardState = JSON.stringify(copyGameBoard);

  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      copyGameBoard[0][c],
      copyGameBoard[1][c],
      copyGameBoard[2][c],
      copyGameBoard[3][c],
    ];
    row = simulateSlide(row);

    // Update copy board
    for (let r = 0; r < 4; r++) {
      copyGameBoard[r][c] = row[r]; // Convert row array back to column
    }
  }

  return JSON.stringify(copyGameBoard) !== initialGameBoardState;
}

// Simulate down slide operation without updating DOM
function simulateSlideDown(copyGameBoard) {
  const initialGameBoardState = JSON.stringify(copyGameBoard);

  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      copyGameBoard[0][c],
      copyGameBoard[1][c],
      copyGameBoard[2][c],
      copyGameBoard[3][c],
    ];
    row.reverse(); // Reverse row to simulate sliding down
    row = simulateSlide(row);
    row.reverse(); // Restore original order

    // Update copy board
    for (let r = 0; r < 4; r++) {
      copyGameBoard[r][c] = row[r]; // Convert row array back to column
    }
  }

  return JSON.stringify(copyGameBoard) !== initialGameBoardState;
}

function newGame() {
  gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  updateDOM();

  currentScore = 0;
  scoreDisplay.innerHTML = "Score: 0";

  isGameWon = false;

  generateRandomTile();
  generateRandomTile();
}

// Run saveGame() before unloading page
window.addEventListener("beforeunload", (event) => {
  saveGame();
});

// Save game state to local storage
function saveGame() {
  localStorage.setItem("gameBoard", JSON.stringify(gameBoard));
}

// Load game state from local storage
function loadGame() {
  const savedBoard = localStorage.getItem("gameBoard");

  if (savedBoard) {
    gameBoard = JSON.parse(savedBoard);

    updateDOM();
  }
}

// Update DOM
function updateDOM() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
  }
}

// Handle "New Game" button click to restart the game
newGameButton.addEventListener("click", () => {
  newGame();
});
