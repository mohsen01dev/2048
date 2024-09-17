// Define variables and DOM elements
const gameBoardDiv = document.getElementById("game-board");
const popUp = document.getElementsByClassName("pop-up")[0];

let gameBoard;
let isKeyDown = false;
let isGameWon = false;
let isPopUpVisible = false;

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

  // Generate two starting random tiles
  generateRandomTile();
  generateRandomTile();
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
  if (isPopUpVisible) {
    return;
  } else if (e.code == "ArrowLeft" && !isKeyDown) {
    isKeyDown = true;
    slideLeft();

    checkWin();
    checkLose();

    generateRandomTile();
  } else if (e.code == "ArrowRight" && !isKeyDown) {
    isKeyDown = true;
    slideRight();

    checkWin();
    checkLose();

    generateRandomTile();
  } else if (e.code == "ArrowUp" && !isKeyDown) {
    isKeyDown = true;
    slideUp();

    checkWin();
    checkLose();

    generateRandomTile();
  } else if (e.code == "ArrowDown" && !isKeyDown) {
    isKeyDown = true;
    slideDown();

    checkWin();
    checkLose();

    generateRandomTile();
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

// Execute corresponding code if the pressed key is "right"
function slideRight() {
  for (let r = 0; r < 4; r++) {
    let row = gameBoard[r];
    row.reverse(); // Reverse row to simulate sliding right
    row = slide(row);
    row.reverse(); // Restore original order
    gameBoard[r] = row;

    // Update DOM tiles
    for (let c = 0; c < 4; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
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

    // Update game board and DOM tiles
    for (let r = 0; r < 4; r++) {
      gameBoard[r][c] = row[r]; // Convert row array back to column
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
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

    // Update game board and DOM tiles
    for (let r = 0; r < 4; r++) {
      gameBoard[r][c] = row[r]; // Convert row array back to column
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = gameBoard[r][c];
      updateTile(tile, num);
    }
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

          popUp.innerHTML = `
          <div class="pop-up-content">
            <h1>You Won!</h1>
            <p>Congratulations! You've reached the 2048 tile.</p>
  
            <div class="pop-up-btn">
              <button type="button" id="win-confirmation-btn">Thanks!</button>
            </div>
          </div>
          `;

          popUp.classList.remove("deactive");

          const winConfirmationButton = document.getElementById(
            "win-confirmation-btn"
          );

          winConfirmationButton.addEventListener("click", () => {
            popUp.classList.add("deactive");
            isPopUpVisible = false;
          });
        }
      }
    }
  }
}

// Check lose condition (no empty tiles and valid moves) and show lose pop-up
function checkLose() {
  // Deep copy gameBoard to preserve original
  const copyBoard = JSON.parse(JSON.stringify(gameBoard));

  let foundEmptyTile = hasEmptyTile();
  let canSlideLeft = simulateSlideLeft(copyBoard);
  let canSlideRight = simulateSlideRight(copyBoard);
  let canSlideUp = simulateSlideUp(copyBoard);
  let canSlideDown = simulateSlideDown(copyBoard);

  if (
    !foundEmptyTile &&
    !canSlideLeft &&
    !canSlideRight &&
    !canSlideUp &&
    !canSlideDown
  ) {
    isPopUpVisible = true;

    popUp.innerHTML = `
      <div class="pop-up-content">
        <h1>You Lost!</h1>
        <p>Sorry! You've run out of moves.</p>
    
        <div class="pop-up-btn">
          <button type="button" id="lose-confirmation-btn">OK!</button>
        </div>
      </div>
    `;

    popUp.classList.remove("deactive");

    const loseConfirmationButton = document.getElementById(
      "lose-confirmation-btn"
    );

    loseConfirmationButton.addEventListener("click", () => {
      popUp.classList.add("deactive");
      isPopUpVisible = false;
    });
  }
}

// Simulate left slide operation without updating DOM
function simulateSlideLeft(copyBoard) {
  const initialBoardState = JSON.stringify(copyBoard);

  for (let r = 0; r < 4; r++) {
    let row = copyBoard[r];
    row = slide(row);
    copyBoard[r] = row;
  }

  return JSON.stringify(copyBoard) !== initialBoardState;
}

// Simulate right slide operation without updating DOM
function simulateSlideRight(copyBoard) {
  const initialBoardState = JSON.stringify(copyBoard);

  for (let r = 0; r < 4; r++) {
    let row = copyBoard[r];
    row.reverse(); // Reverse row to simulate sliding right
    row = slide(row);
    row.reverse(); // Restore original order
    copyBoard[r] = row;
  }

  return JSON.stringify(copyBoard) !== initialBoardState;
}

// Simulate up slide operation without updating DOM
function simulateSlideUp(copyBoard) {
  const initialBoardState = JSON.stringify(copyBoard);

  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      copyBoard[0][c],
      copyBoard[1][c],
      copyBoard[2][c],
      copyBoard[3][c],
    ];
    row = slide(row);

    // Update copy board
    for (let r = 0; r < 4; r++) {
      copyBoard[r][c] = row[r]; // Convert row array back to column
    }
  }

  return JSON.stringify(copyBoard) !== initialBoardState;
}

// Simulate down slide operation without updating DOM
function simulateSlideDown(copyBoard) {
  const initialBoardState = JSON.stringify(copyBoard);

  // Convert column to row to use row sliding logic for column
  for (let c = 0; c < 4; c++) {
    let row = [
      copyBoard[0][c],
      copyBoard[1][c],
      copyBoard[2][c],
      copyBoard[3][c],
    ];
    row.reverse(); // Reverse row to simulate sliding down
    row = slide(row);
    row.reverse(); // Restore original order

    // Update copy board
    for (let r = 0; r < 4; r++) {
      copyBoard[r][c] = row[r]; // Convert row array back to column
    }
  }

  return JSON.stringify(copyBoard) !== initialBoardState;
}
