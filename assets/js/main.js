const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// 🧍 Sprites
const playerRight = new Image();
playerRight.src = "assets/img/robot-p-derecho.png";

const playerLeft = new Image();
playerLeft.src = "assets/img/robot-p-izquierdo.png";

const playerUp = new Image();
playerUp.src = "assets/img/robot-p-apuntando.png";

// 👉 Dirección actual (clave)
let direction = "right"; // right | left

// Imagen actual
let currentPlayerImg = playerRight;

// 🔊 Sonido
const jumpSound = new Audio("assets/jump.wav");

// 🎮 Jugador (MÁS GRANDE 🔍)
const player = {
  x: 170,
  y: 400,
  width: 70,
  height: 70,
  velocityY: 0,
  gravity: 0.5,
  jumpPower: -12
};

// 🟩 Plataformas
let platforms = [];

function createPlatforms() {
  platforms = [];

  // 🛡 Plataforma segura
  platforms.push({
    x: player.x - 20,
    y: player.y + 80,
    width: 90,
    height: 10,
    broken: false
  });

  for (let i = 1; i < 7; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 60),
      y: i * 90,
      width: 60,
      height: 10,
      broken: Math.random() < 0.3
    });
  }
}

createPlatforms();

// 🎮 Controles
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "ArrowRight") {
    direction = "right";
    currentPlayerImg = playerRight;
  }

  if (e.key === "ArrowLeft") {
    direction = "left";
    currentPlayerImg = playerLeft;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// 🔄 Update
function update() {
  // Movimiento
  if (keys["ArrowLeft"]) player.x -= 5;
  if (keys["ArrowRight"]) player.x += 5;

  // Teletransporte
  if (player.x > canvas.width) player.x = -player.width;
  if (player.x < -player.width) player.x = canvas.width;

  // 🔼 PRIORIDAD: si mantiene ↑
  if (keys["ArrowUp"]) {
    currentPlayerImg = playerUp;
  } else {
    // 🔁 vuelve a última dirección
    currentPlayerImg = direction === "right" ? playerRight : playerLeft;
  }

  // Gravedad
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Colisiones
  platforms.forEach((platform, index) => {
    if (player.velocityY > 0) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + 15
      ) {
        jumpSound.currentTime = 0;
        jumpSound.play();

        player.velocityY = player.jumpPower;

        if (platform.broken) {
          platforms.splice(index, 1);
        }
      }
    }
  });

  // Scroll
  if (player.y < 250) {
    let diff = 250 - player.y;
    player.y = 250;

    platforms.forEach(p => {
      p.y += diff;

      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * (canvas.width - 60);
        p.broken = Math.random() < 0.3;
      }
    });
  }

  // Reset
  if (player.y > canvas.height) {
    player.y = 400;
    player.velocityY = 0;
    direction = "right";
    currentPlayerImg = playerRight;
    createPlatforms();
  }
}

// 🎨 Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);

  platforms.forEach(p => {
    ctx.fillStyle = p.broken ? "red" : "black";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

// 🔁 Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();