const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Sprites
const playerRight = new Image();
playerRight.src = "assets/img/robot-p-derecho.png";

const playerLeft = new Image();
playerLeft.src = "assets/img/robot-p-izquierdo.png";

const playerUp = new Image();
playerUp.src = "assets/img/robot-p-apuntando.png";

// Sonidos
const jumpSound = new Audio("assets/jump.wav");
const shootSound = new Audio("assets/shoot.wav");

// Jugador
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

// Plataformas
let platforms = [];
let bullets = [];

// 👑 JEFE
let boss = null;

// Score
let score = 0;

// 🔥 NUEVO CONTROL
let lastBossScore = 0;

// POSICIONES
const POSITIONS = {
  LEFT: 40,
  CENTER: canvas.width / 2 - 30,
  RIGHT: canvas.width - 100
};

const pattern = ["LEFT", "CENTER", "RIGHT"];
let patternIndex = 0;

const PLATFORM_GAP = 55;

// UTIL
function getHighestPlatform() {
  return platforms.reduce((highest, p) => {
    return p.y < highest.y ? p : highest;
  }, platforms[0]);
}

// CREAR PLATAFORMAS
function createPlatforms() {
  platforms = [];

  let base = {
    x: POSITIONS.CENTER,
    y: player.y + 80,
    width: 80,
    height: 10
  };

  platforms.push(base);

  let y = base.y - PLATFORM_GAP;

  for (let i = 0; i < 10; i++) {
    let posKey = pattern[patternIndex % pattern.length];
    patternIndex++;

    platforms.push({
      x: POSITIONS[posKey],
      y: y,
      width: 60,
      height: 10
    });

    y -= PLATFORM_GAP;
  }
}

createPlatforms();

// SPAWN JEFE
function spawnBoss() {
  boss = {
    x: 100,
    y: 50,
    width: 120,
    height: 80,
    hp: 20,
    maxHp: 20,
    speed: 2,
    direction: 1,
    state: "alive",
    deathTimer: 0
  };
}

// CONTROLES
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "ArrowRight") direction = "right";
  if (e.key === "ArrowLeft") direction = "left";

  if (e.key === "ArrowUp") shoot();
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// DISPARO
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

// UPDATE
function update() {
  if (keys["ArrowLeft"]) player.x -= 5;
  if (keys["ArrowRight"]) player.x += 5;

  if (player.x > canvas.width) player.x = -player.width;
  if (player.x < -player.width) player.x = canvas.width;

  currentPlayerImg = keys["ArrowUp"]
    ? playerUp
    : (direction === "right" ? playerRight : playerLeft);

  let prevY = player.y;

  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // COLISIÓN
  platforms.forEach((p) => {
    if (player.velocityY > 0) {
      let prevBottom = prevY + player.height;
      let currentBottom = player.y + player.height;

      if (
        prevBottom <= p.y &&
        currentBottom >= p.y &&
        player.x + player.width > p.x &&
        player.x < p.x + p.width
      ) {
        player.y = p.y - player.height;
        player.velocityY = player.jumpPower;

        jumpSound.currentTime = 0;
        jumpSound.play();
      }
    }
  });

  // SCROLL
  if (player.y < 250) {
    let diff = 250 - player.y;
    player.y = 250;

    platforms.forEach(p => {
      p.y += diff;

      if (p.y > canvas.height) {
        let top = getHighestPlatform();

        let posKey = pattern[patternIndex % pattern.length];
        patternIndex++;

        p.x = POSITIONS[posKey];
        p.y = top.y - PLATFORM_GAP;

        score += 100;

        // 🔥 NUEVO SISTEMA DE JEFE
        if ((score - lastBossScore) >= 1500 && boss === null) {
          spawnBoss();
        }
      }
    });
  }

  // BALAS
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  });

  // 👑 JEFE
  if (boss) {
    if (boss.state === "alive") {

      boss.x += boss.speed * boss.direction;

      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }

      bullets.forEach((b, bi) => {
        if (
          b.x < boss.x + boss.width &&
          b.x + b.width > boss.x &&
          b.y < boss.y + boss.height &&
          b.y + b.height > boss.y
        ) {
          boss.hp--;
          bullets.splice(bi, 1);
        }
      });

      if (boss.hp <= 0) {
        boss.state = "dying";
        boss.deathTimer = 60;

        // 🔥 REINICIAR CONTADOR AQUÍ
        lastBossScore = score;
      }

      if (
        player.x < boss.x + boss.width &&
        player.x + player.width > boss.x &&
        player.y < boss.y + boss.height &&
        player.y + player.height > boss.y
      ) {
        gameOver();
      }
    }

    else {
      boss.deathTimer--;

      if (boss.deathTimer <= 0) {
        boss = null;
      }
    }
  }

  if (player.y > canvas.height) gameOver();
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);

  ctx.fillStyle = "black";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  if (boss) {
    if (boss.state === "alive") {
      ctx.fillStyle = "darkred";
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

      ctx.fillStyle = "red";
      ctx.fillRect(50, 20, 300, 10);

      ctx.fillStyle = "green";
      ctx.fillRect(50, 20, 300 * (boss.hp / boss.maxHp), 10);
    } else {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(
        boss.x + boss.width / 2,
        boss.y + boss.height / 2,
        60 - boss.deathTimer,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 50);
}

function gameOver() {
  alert("💀 Game Over\nScore: " + score);
  location.reload();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();