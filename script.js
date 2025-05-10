const gameContainer = document.getElementById("game-container");
const playerCar = document.getElementById("player-car");
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");

let score = 0;
let gameOver = false;
let playerX = 275; // Başlangıçta araba 275px sola yerleştirildi (merkez)
let gamePaused = false;
let obstacles = [];
let obstacleSpeed = 5;
let obstacleInterval = 1000;
let keysPressed = {};

function playSound(src) {
  try {
    const sound = new Audio(src);
    sound.play();
  } catch (error) {
    console.warn("Ses dosyası eksik ya da oynatılamıyor:", src);
  }
}

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function movePlayer() {
  if (gameOver || gamePaused) return;

  // Sol hareket
  if (keysPressed["ArrowLeft"]) {
    if (playerX > 50) { // Sol sınır (yol kenarı)
      playerX -= 10; // Move in smaller increments for smoother movement
    }
  }

  // Sağ hareket
  if (keysPressed["ArrowRight"]) {
    if (playerX < 500) { // Sağ sınır (yol kenarı) updated to 500
      playerX += 10; // Move in smaller increments for smoother movement
    }
  }

  // Remove snapping to avoid movement issues
  // playerX = Math.round(playerX / 50) * 50;

  playerCar.style.left = playerX + "px";
}

function createObstacle() {
  const obs = document.createElement("img");
  obs.src = "taş.jpg";
  obs.classList.add("obstacle");
  // Adjust obstacle positions to align with player car movement range (50 to 500)
  const possiblePositions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
  const randomIndex = Math.floor(Math.random() * possiblePositions.length);
  obs.style.left = possiblePositions[randomIndex] + "px";
  obs.style.top = "-100px";
  gameContainer.appendChild(obs);
  obstacles.push(obs);
}

function checkCollision(obs) {
  const obsRect = obs.getBoundingClientRect();
  const carRect = playerCar.getBoundingClientRect();

  // Adjust margin to 3px for more precise collision detection
  const margin = 3;

  const obsLeft = obsRect.left + margin;
  const obsRight = obsRect.right - margin;
  const obsTop = obsRect.top + margin;
  const obsBottom = obsRect.bottom - margin;

  const carLeft = carRect.left + margin;
  const carRight = carRect.right - margin;
  const carTop = carRect.top + margin;
  const carBottom = carRect.bottom - margin;

  const collision = !(
    obsBottom < carTop ||
    obsTop > carBottom ||
    obsRight < carLeft ||
    obsLeft > carRight
  );

  if (collision) {
    console.log("Collision detected between car and obstacle at positions:", carLeft, obsLeft);
  }
  return collision;
}

function updateGame() {
  if (gameOver || gamePaused) return;

  movePlayer();

  obstacles.forEach((obs, index) => {
    let top = parseInt(obs.style.top);
    obs.style.top = top + obstacleSpeed + "px";

    if (checkCollision(obs)) {
      gameOver = true;
      gameOverDisplay.style.display = "block";
      clearInterval(obstacleCreationInterval);
      playSound("collision.mp3");
    }

    if (top > 600) {
      obs.remove();
      obstacles.splice(index, 1);
      score++;
      scoreDisplay.innerText = "Skor: " + score;
      playSound("score.mp3");
    }
  });

  requestAnimationFrame(updateGame);
}

let obstacleCreationInterval;

function startGame() {
  console.log("Oyun başlatılıyor...");
  startScreen.style.display = "none";
  gameContainer.style.display = "flex";
  gameOver = false;
  gamePaused = false;
  score = 0;
  scoreDisplay.innerText = "Skor: " + score;
  playerX = 275; // Başlangıçta araba 275px sola yerleştirildi (merkez)
  playerCar.style.left = playerX + "px";
  gameOverDisplay.style.display = "none";

  obstacles.forEach(obs => obs.remove());
  obstacles = [];
  obstacleSpeed = 5;
  obstacleInterval = 1000;

  clearInterval(obstacleCreationInterval);
  obstacleCreationInterval = setInterval(() => {
    if (!gameOver && !gamePaused) {
      createObstacle();
      if (obstacleSpeed < 20) obstacleSpeed += 0.1;
      if (obstacleInterval > 300) obstacleInterval -= 10;
    }
  }, obstacleInterval);

  updateGame();
}

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", () => {
  gameOverDisplay.style.display = "none";
  startGame();
});

pauseButton.addEventListener("click", () => {
  if (gameOver) return;
  gamePaused = !gamePaused;
  pauseButton.innerText = gamePaused ? "Devam Et" : "Duraklat";
  if (!gamePaused) {
    updateGame();
  }
});

// Mobil dokunmatik kontroller
gameContainer.addEventListener("touchstart", (e) => {
  const touchX = e.touches[0].clientX - gameContainer.getBoundingClientRect().left;
  if (touchX < playerX + 25) {
    keysPressed["ArrowLeft"] = true;
    keysPressed["ArrowRight"] = false;
  } else {
    keysPressed["ArrowRight"] = true;
    keysPressed["ArrowLeft"] = false;
  }
});

gameContainer.addEventListener("touchend", (e) => {
  keysPressed["ArrowLeft"] = false;
  keysPressed["ArrowRight"] = false;
});
