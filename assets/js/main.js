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

// 🔊 Sonidos
const jumpSound = new Audio("assets/jump.wav");
const shootSound = new Audio("assets/shoot.wav");

// 🎮 Jugador
const player = {
  x: 170,
  y: 400,
  width: 70,
  height: 70,
  velocityY: 0,
  gravity: 0.5,
  jumpPower: -12
};

let direction = "right";
let currentPlayerImg = playerRight;

// 🟩 Plataformas
let platforms = [];

// 🔫 Balas
let bullets = [];

// 👾 Enemigos
let enemies = [];

// 📊 Score
let score = 0;

// Crear plataformas
function createPlatforms() {
  platforms = [];

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

// Crear enemigo
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -50,
    width: 40,
    height: 40,
    speed: 1 + Math.random()
  });
}

// 🎮 Controles
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "ArrowRight") {
    direction = "right";
  }

  if (e.key === "ArrowLeft") {
    direction = "left";
  }

  // 🔫 Disparo
  if (e.key === "ArrowUp") {
    shoot();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// 🔫 Disparar
function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 5,
    y: player.y,
    width: 10,
    height: 20,
    speed: 7
  });

  shootSound.currentTime = 0;
  shootSound.play();
}

// 🔄 Update
function update() {
  // Movimiento
  if (keys["ArrowLeft"]) player.x -= 5;
  if (keys["ArrowRight"]) player.x += 5;

  // Teletransporte
  if (player.x > canvas.width) player.x = -player.width;
  if (player.x < -player.width) player.x = canvas.width;

  // Sprite
  if (keys["ArrowUp"]) {
    currentPlayerImg = playerUp;
  } else {
    currentPlayerImg = direction === "right" ? playerRight : playerLeft;
  }

  // Gravedad
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Colisiones con plataformas
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
    score += Math.floor(diff);

    platforms.forEach(p => {
      p.y += diff;

      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * (canvas.width - 60);
        p.broken = Math.random() < 0.3;
      }
    });

    enemies.forEach(e => e.y += diff);
  }

  // 🔫 Balas
  bullets.forEach((b, i) => {
    b.y -= b.speed;

    if (b.y < 0) bullets.splice(i, 1);
  });

  // 👾 Enemigos
  if (Math.random() < 0.02) spawnEnemy();

  enemies.forEach((e, ei) => {
    e.y += e.speed;

    // Colisión bala-enemigo
    bullets.forEach((b, bi) => {
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 100;
      }
    });

    // Game over
    if (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    ) {
      alert("💀 Game Over\nPuntaje: " + score);
      document.location.reload();
    }
  });

  // Caída
  if (player.y > canvas.height) {
    alert("💀 Game Over\nPuntaje: " + score);
    document.location.reload();
  }
}

// 🎨 Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);

  // Plataformas
  platforms.forEach(p => {
    ctx.fillStyle = p.broken ? "red" : "black";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Balas
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Enemigos
  ctx.fillStyle = "purple";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // Score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();