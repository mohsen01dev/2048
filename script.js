// Define variables and DOM elements
const gameBoardContainer = document.getElementById("game-board-container");
const popUpContainer = document.getElementsByClassName("pop-up-container")[0];
const newGameButton = document.getElementById("new-game-btn");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const bestScoreDisplay = document.getElementById("best-score");
const bestTimeDisplay = document.getElementById("best-time");
const resetButton = document.getElementById("reset-btn");

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
let timerInterval;
let initialTime = Date.now();
let isFirstMove = true;
let elapsedTime = 0;
let lastElapsedTime;
let bestScore = 0;
let bestTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isGameOver = false;

// Set up game when window loads
window.onload = function () {
  checkScreenSize();

  setGame();
  loadGame();

  const isGameBoardEmpty = gameBoard.every((row) =>
    row.every((tile) => tile == 0)
  );
  if (isGameBoardEmpty) {
    generateRandomTile();
    generateRandomTile();
  } else updateDOMGameBoard();

  if (currentScore) scoreDisplay.innerHTML = `Score: ${currentScore}`;

  if (lastElapsedTime) updateDOMTimer();

  if (bestScore) bestScoreDisplay.innerHTML = bestScore;

  if (bestTime) {
    const [hours, minutes, seconds] = formatTime(bestTime);
    bestTimeDisplay.innerHTML = `${hours}:${minutes}:${seconds}`;
  }

  if (isPopUpVisible) {
    if (isGameOver) {
      popUpContainer.innerHTML = `
      <div class="pop-up-content-container">
        <h1>Game Over!</h1>
        <p>Congratulations! You've already won, but now you're out of moves.</p>

        <div class="pop-up-btn-container">
          <button type="button" id="pop-up-new-game-btn">New Game</button>
        </div>
      </div>
      `;

      handleLoseGameOverPopUp();
    } else if (isGameWon) {
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

      handleWinPopUp();
    } else {
      popUpContainer.innerHTML = `
      <div class="pop-up-content-container">
        <h1>You Lost!</h1>
        <p>Sorry! You've run out of moves.</p>

        <div class="pop-up-btn-container">
          <button type="button" id="pop-up-new-game-btn">New Game</button>
        </div>
      </div>
      `;

      handleLoseGameOverPopUp();
    }
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

    // Start timer on first move
    if (isFirstMove && !isGameWon) {
      startTimer();
      isFirstMove = false;
    }

    // Handle arrow key presses for corresponding slide
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
    updateBestScore();

    checkWin();
    checkLose();
    generateRandomTile();

    saveGame();
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

    updateDOMGameBoardHorizontalSlide(r);
  }
}

// Update DOM for horizontal slide
function updateDOMGameBoardHorizontalSlide(r) {
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

    updateDOMGameBoardHorizontalSlide(r);
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

    updateDOMGameBoardVerticalSlide(c, row);
  }
}

// Update game board and DOM for vertical slide
function updateDOMGameBoardVerticalSlide(c, row) {
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

    updateDOMGameBoardVerticalSlide(c, row);
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
          stopTimer();
          updateBestTime();
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

          handleWinPopUp();
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
    stopTimer();
    isPopUpVisible = true;

    if (isGameWon) {
      isGameOver = true;

      popUpContainer.innerHTML = `
      <div class="pop-up-content-container">
        <h1>Game Over!</h1>
        <p>Congratulations! You've already won, but now you're out of moves.</p>

        <div class="pop-up-btn-container">
          <button type="button" id="pop-up-new-game-btn">New Game</button>
        </div>
      </div>
      `;
    } else {
      popUpContainer.innerHTML = `
      <div class="pop-up-content-container">
        <h1>You Lost!</h1>
        <p>Sorry! You've run out of moves.</p>

        <div class="pop-up-btn-container">
          <button type="button" id="pop-up-new-game-btn">New Game</button>
        </div>
      </div>
      `;
    }

    handleLoseGameOverPopUp();
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

// Start a new game
function newGame() {
  gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  updateDOMGameBoard();

  currentScore = 0;
  scoreDisplay.innerHTML = "Score: 0";

  resetTimer();
  timerDisplay.innerHTML = `Time: 00:00:00`;
  isFirstMove = true;

  isGameWon = false;
  isGameOver = false;

  generateRandomTile();
  generateRandomTile();

  saveGame();
}

// Run saveGame() on page unload
window.addEventListener("beforeunload", () => {
  saveGame();
});

// Save game state to local storage
function saveGame() {
  localStorage.setItem("gameBoard", JSON.stringify(gameBoard));
  localStorage.setItem("isGameWon", JSON.stringify(isGameWon));
  localStorage.setItem("currentScore", JSON.stringify(currentScore));
  localStorage.setItem("elapsedTime", JSON.stringify(elapsedTime));
  localStorage.setItem("bestScore", JSON.stringify(bestScore));
  localStorage.setItem("bestTime", JSON.stringify(bestTime));
  localStorage.setItem("isGameOver", JSON.stringify(isGameOver));
  localStorage.setItem("isPopUpVisible", JSON.stringify(isPopUpVisible));
}

// Load game state from local storage
function loadGame() {
  const savedGameBoard = JSON.parse(localStorage.getItem("gameBoard"));
  const savedIsGameWon = JSON.parse(localStorage.getItem("isGameWon"));
  const savedCurrentScore = JSON.parse(localStorage.getItem("currentScore"));
  const savedElapsedTime = JSON.parse(localStorage.getItem("elapsedTime"));
  const savedBestScore = JSON.parse(localStorage.getItem("bestScore"));
  const savedBestTime = JSON.parse(localStorage.getItem("bestTime"));
  const savedIsGameOver = JSON.parse(localStorage.getItem("isGameOver"));
  const savedIsPopUpVisible = JSON.parse(
    localStorage.getItem("isPopUpVisible")
  );

  if (savedGameBoard) gameBoard = savedGameBoard;
  if (savedIsGameWon) isGameWon = savedIsGameWon;
  if (savedCurrentScore) currentScore = savedCurrentScore;
  if (savedElapsedTime) lastElapsedTime = savedElapsedTime;
  if (savedBestScore) bestScore = savedBestScore;
  if (savedBestTime) bestTime = savedBestTime;
  if (savedIsGameOver) isGameOver = savedIsGameOver;
  if (savedIsPopUpVisible) isPopUpVisible = savedIsPopUpVisible;
}

// Update DOM
function updateDOMGameBoard() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
  }
}

// Handle "New Game" button click
newGameButton.addEventListener("click", () => {
  newGame();
});

// Start and update DOM timer every second
function startTimer() {
  initialTime = Date.now();
  timerInterval = setInterval(updateDOMTimer, 1000);
}

// Update DOM timer
function updateDOMTimer() {
  // Time elapsed in seconds
  if (lastElapsedTime)
    elapsedTime =
      Math.floor((Date.now() - initialTime) / 1000) + lastElapsedTime;
  else elapsedTime = Math.floor((Date.now() - initialTime) / 1000);

  const [hours, minutes, seconds] = formatTime(elapsedTime);
  timerDisplay.innerHTML = `Time: ${hours}:${minutes}:${seconds}`;
}

// Reset timer
function resetTimer() {
  stopTimer();
  lastElapsedTime = 0;
  elapsedTime = 0;
}

// Stop timer
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Update best score
function updateBestScore() {
  if (currentScore > bestScore) {
    bestScore = currentScore;
    bestScoreDisplay.innerHTML = bestScore;
  }
}

// Update best time
function updateBestTime() {
  if (elapsedTime < bestTime || !bestTime) {
    bestTime = elapsedTime;

    const [hours, minutes, seconds] = formatTime(bestTime);
    bestTimeDisplay.innerHTML = `${hours}:${minutes}:${seconds}`;
  }
}

// Calculate and format time
function formatTime(time) {
  // Calculate hours, minutes, and seconds
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time % 3600) / 60);
  let seconds = time % 60;

  // Format hours, minutes, and seconds with leading zeros
  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  seconds = seconds.toString().padStart(2, "0");

  return [hours, minutes, seconds];
}

// Reset the game
function resetGame() {
  bestScore = 0;
  bestScoreDisplay.innerHTML = "0";

  bestTime = 0;
  bestTimeDisplay.innerHTML = "00:00:00";

  newGame();
}

// Handle "Reset" button click
resetButton.addEventListener("click", () => {
  resetGame();
});

// Initial touch event listener
document.addEventListener("touchstart", function (e) {
  // Get the first touch in multi-touch
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

// Ending touch event listener
document.addEventListener("touchend", function (e) {
  // Get the first touch in multi-touch
  touchEndX = e.changedTouches[0].clientX;
  touchEndY = e.changedTouches[0].clientY;

  handleSwipe();
});

// Determine swipe direction
function handleSwipe() {
  const swipeThreshold = 30;
  let deltaX = touchEndX - touchStartX;
  let deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
    // Start timer on first move
    if (isFirstMove && !isGameWon) {
      startTimer();
      isFirstMove = false;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        slideRight(); // Swipe right
      } else {
        slideLeft(); // Swipe left
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        slideDown(); // Swipe down
      } else {
        slideUp(); // Swipe up
      }
    }

    scoreDisplay.innerHTML = `Score: ${currentScore}`;
    updateBestScore();

    checkWin();
    checkLose();
    generateRandomTile();

    saveGame();
  }
}

// Disable touch scrolling
document.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false } // Ensure e.preventDefault() works
);

function handleWinPopUp() {
  popUpContainer.classList.remove("deactive");

  // Handle "New Game" button click to start a new game
  const popUpNewGameButton = document.getElementById("pop-up-new-game-btn");
  popUpNewGameButton.addEventListener("click", () => {
    popUpContainer.classList.add("deactive");
    isPopUpVisible = false;

    newGame();
  });

  // Process "Continue Playing" button click to resume game
  const popUpContinuePlayingButton = document.getElementById(
    "pop-up-continue-playing-btn"
  );
  popUpContinuePlayingButton.addEventListener("click", () => {
    popUpContainer.classList.add("deactive");
    isPopUpVisible = false;

    saveGame();
  });
}

function handleLoseGameOverPopUp() {
  popUpContainer.classList.remove("deactive");

  // Handle "New Game" button click to start a new game
  const popUpNewGameButton = document.getElementById("pop-up-new-game-btn");
  popUpNewGameButton.addEventListener("click", () => {
    popUpContainer.classList.add("deactive");
    isPopUpVisible = false;

    newGame();
  });
}

// Check and display low resolution warning
function checkScreenSize() {
  if (window.innerWidth < 299) {
    popUpContainer.classList.remove("deactive");

    popUpContainer.innerHTML = `
    <div class="pop-up-content-container">
      <h1>Sorry!</h1>
      <p>The screen is too small.</p>
      <p id="pop-up-parentheses-text">(less than 299px wide)</p>
    </div>
    `;
  } else popUpContainer.classList.add("deactive");
}

// Check screen size on resize
window.addEventListener("resize", checkScreenSize);
