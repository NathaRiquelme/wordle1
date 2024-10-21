// ----------------------------------
// Global Variables
// ----------------------------------
let secretWord = ""; // Will be fetched from API
let currentRow = 0;
let currentCol = 0;
let guess = "";
let rows;
let columns;

// ----------------------------------
// Form Submission and Initialization
// ----------------------------------
document
  .getElementById("gameSetupForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    rows = parseInt(document.getElementById("rows").value);
    columns = parseInt(document.getElementById("columns").value);

    // Fetch the secret word based on the number of columns (word length)
    secretWord = await fetchSecretWord(columns);

    if (secretWord) {
      console.log("Secret Word:", secretWord); // For debugging
      initializeGame(rows, columns);
    } else {
      alert("Error fetching word. Try again.");
    }
  });

// ----------------------------------
// Fetch Secret Word from API
// ----------------------------------
async function fetchSecretWord(wordLength) {
  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?number=1&length=${wordLength}`
    );
    const wordArray = await response.json();
    return wordArray[0]; // Return the fetched word
  } catch (error) {
    console.error("Error fetching secret word:", error);
    return null;
  }
}

// Function to initialize the game based on rows and columns
function initializeGame(rows, columns) {
  document.getElementById("gameSetupForm").style.display = "none";
  document.getElementById("gameTitle").style.display = "none";
  document.getElementById("gameInstructions").style.display = "none";
  document.getElementById("game-wrapper").style.display = "block";

  // Create game rows
  createGameRows(rows, columns);

  // Initialize input handlers
  initializeInputHandlers(columns);
}

// ----------------------------------
// Dynamic Game Rows and Keyboard Creation
// ----------------------------------

// Function to create game rows dynamically
function createGameRows(rows, columns) {
  const gameWrapper = document.querySelector(".game_rows");
  gameWrapper.innerHTML = ""; // Clear any existing rows

  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.classList.add("Row");

    for (let j = 0; j < columns; j++) {
      const cell = document.createElement("div");
      cell.classList.add("Row-letter");
      const sup = document.createElement("sup");
      sup.style.display = "none";
      cell.appendChild(sup);
      row.appendChild(cell);
    }

    gameWrapper.appendChild(row);
  }
}

// ----------------------------------
// Input Handlers
// ----------------------------------

// Function to handle keyboard input
function initializeInputHandlers(columns) {
  // Set keydown event listener only after game is initialized
  document.addEventListener("keydown", (event) =>
    handleKeyPress(event, columns)
  );

  document.querySelectorAll(".Game-keyboard-button").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key || button.innerText.toLowerCase();
      handleInput(key, columns);
    });
  });
}

// Function to handle keypress from the real keyboard
function handleKeyPress(event, columns) {
  const key = event.key.toLowerCase();
  handleInput(key, columns);
}

// Main input handler for both keydown and click
function handleInput(key, columns) {
  if (isLetter(key) && currentCol < columns) {
    guess += key;
    document.querySelectorAll(".Row")[currentRow].children[
      currentCol
    ].innerText = key;
    currentCol++;
  } else if (key === "backspace" && currentCol > 0) {
    currentCol--;
    guess = guess.slice(0, -1);
    document.querySelectorAll(".Row")[currentRow].children[
      currentCol
    ].innerText = "";
  } else if (key === "enter" && currentCol === columns) {
    if (guess !== secretWord && currentRow === 0) {
      document.querySelector(".give_up").style.display = "block";
    }
    checkWord(columns);
  }
}

// Function to check if input is a letter
function isLetter(char) {
  return /^[a-z]$/.test(char);
}

// ----------------------------------
// Word Checking and Game Logic
// ----------------------------------

function checkWord(columns) {
  const rowLetters = document.querySelectorAll(".Row")[currentRow].children;
  const keyboardButtons = document.querySelectorAll(".Game-keyboard-button");

  for (let i = 0; i < columns; i++) {
    const letter = guess[i];
    const keyboardButton = Array.from(keyboardButtons).find(
      (button) => button.innerText.toLowerCase() === letter.toLowerCase()
    );

    if (secretWord[i] === letter) {
      rowLetters[i].style.backgroundColor = "#79b851";
      rowLetters[i].style.color = "#ffffff";
      if (keyboardButton) {
        keyboardButton.style.backgroundColor = "#79b851";
        keyboardButton.style.color = "#ffffff";
      }
    } else if (secretWord.includes(letter)) {
      rowLetters[i].style.backgroundColor = "#f3c237";
      rowLetters[i].style.color = "#ffffff";
      if (
        keyboardButton &&
        keyboardButton.style.backgroundColor !== "#79b851"
      ) {
        keyboardButton.style.backgroundColor = "#f3c237";
        keyboardButton.style.color = "#ffffff";
      }
    } else {
      rowLetters[i].style.backgroundColor = "#A4AEC4";
      rowLetters[i].style.color = "#ffffff";
      if (
        keyboardButton &&
        keyboardButton.style.backgroundColor !== "#79b851" &&
        keyboardButton.style.backgroundColor !== "#f3c237"
      ) {
        keyboardButton.style.backgroundColor = "#A4AEC4";
        keyboardButton.style.color = "#ffffff";
      }
    }
  }

  if (guess === secretWord) {
    alert("Congratulations! You guessed the word!");
  } else {
    currentRow++;
    currentCol = 0;
    guess = "";
    if (currentRow === rows) {
      showLosingModal(secretWord);

      // Disable the "Give up" button and dim it
      const giveUpButton = document.querySelector(".give_up");
      giveUpButton.disabled = true; // Disable the button functionality
      giveUpButton.classList.add("dim-background"); // Add a class to change its appearance
    }
  }
}

// Function to show the "You lost" modal when "Give up" is clicked
// Function to show losing modal
function showLosingModal(secretWord) {
  // Dim the game background
  const gameWrapper = document.getElementById("game-wrapper");
  gameWrapper.classList.add("dim-background");

  // Show modal
  const modal = document.querySelector(".modal_finish");
  if (modal) {
    console.log("Modal found, showing modal...");
    modal.style.display = "block"; // Make modal visible
    modal.style.pointerEvents = "auto"; // Enable interaction for modal

    // Update the modal with the correct word
    modal.querySelector(".word span").innerText = secretWord;

    const dictionaryLink = modal.querySelector(".definition");
    dictionaryLink.href = `https://www.dictionary.com/browse/${secretWord}`;

    // Listen for 'Enter' key to reload the page
    document.addEventListener("keydown", function reloadOnEnter(event) {
      if (event.key === "Enter") {
        window.location.reload(); // Reload the page
      }
    });
  } else {
    console.error("Modal element not found.");
  }
}

// Function to close the modal
function closeModal() {
  const modal = document.querySelector(".modal_finish");
  modal.style.display = "none";
  document.body.style.filter = "";
  document.body.style.pointerEvents = "";
}

/// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener for the Help button
  document
    .querySelector(".button.mini_modal_link")
    .addEventListener("click", showInstructionsModal);

  // Add event listener to the close button inside the modal
  document
    .querySelector(".mini_modal .close")
    .addEventListener("click", closeInstructionsModal);
});

// Show "How to Play" modal
function showInstructionsModal() {
  const gameWrapper = document.getElementById("game-wrapper");
  const modal = document.getElementById("modal_info");

  gameWrapper.classList.add("dim-background");
  modal.style.display = "block";
  modal.style.pointerEvents = "auto";
}

// Hide "How to Play" modal
function closeInstructionsModal() {
  const gameWrapper = document.getElementById("game-wrapper");
  const modal = document.getElementById("modal_info");

  gameWrapper.classList.remove("dim-background");
  modal.style.display = "none";
}

// Function to listen when "Give up" is clicked
document.addEventListener("DOMContentLoaded", () => {
  const giveUpButton = document.querySelector(".give_up");
  giveUpButton.addEventListener("click", () => {
    showLosingModal(secretWord);
  });
});
