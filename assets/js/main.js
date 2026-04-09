const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const PLAYER_SIZE = 70;

// SPRITES
const playerSprites = {
  right: new Image(),
  left: new Image(),
  up: new Image(),
  upRight: new Image(),
  downRight: new Image(),
  upLeft: new Image(),
  downLeft: new Image(),
  down: new Image()
};

playerSprites.right.src = "assets/img/robot-p-derecho.png";
playerSprites.left.src = "assets/img/robot-p-izquierdo.png";
playerSprites.up.src = "assets/img/robot-p-apuntando.png";
playerSprites.upRight.src = "assets/img/robot-p-arriba-derecha.png";
playerSprites.downRight.src = "assets/img/robot-p-abajo-derecha.png";
playerSprites.upLeft.src = "assets/img/robot-p-arriba-izquierda.png";
playerSprites.downLeft.src = "assets/img/robot-p-abajo-izquierda.png";
playerSprites.down.src = "assets/img/robot-p-abajo-centro.png";

// JEFE
const bossImg1 = new Image();
bossImg1.src = "assets/img/j-1.png";

const bossImg2 = new Image();
bossImg2.src = "assets/img/j-2.png";

const bossImg3 = new Image();
bossImg3.src = "assets/img/j-3.png";

// SONIDOS
const jumpSound = new Audio("assets/jump.wav");
const shootSound = new Audio("assets/shoot.wav");

// MOUSE
let mouse = { x: 0, y: 0 };

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// CONTROL
let direction = "right";
let lastAngle = 0;
let isAiming = false;
let lastShotTime = 0;
const RESET_AIM_TIME = 800;

// PLAYER
const player = {
  x: 170,
  y: 400,
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  velocityY: 0,
  gravity: 0.5,
  jumpPower: -9.6
};

let currentPlayerImg = playerSprites.right;

// SPRITE
function updatePlayerSprite(keys) {

  if (Date.now() - lastShotTime > RESET_AIM_TIME) {
    isAiming = false;
  }

  if (!isAiming) {
    if (keys["ArrowUp"]) {
      currentPlayerImg = playerSprites.up;
    } else {
      currentPlayerImg = direction === "right"
        ? playerSprites.right
        : playerSprites.left;
    }
    return;
  }

  let deg = lastAngle * (180 / Math.PI);

  if (deg >= -22.5 && deg < 22.5) currentPlayerImg = playerSprites.right;
  else if (deg >= 22.5 && deg < 67.5) currentPlayerImg = playerSprites.downRight;
  else if (deg >= 67.5 && deg < 112.5) currentPlayerImg = playerSprites.down;
  else if (deg >= 112.5 && deg < 157.5) currentPlayerImg = playerSprites.downLeft;
  else if (deg >= 157.5 || deg < -157.5) currentPlayerImg = playerSprites.left;
  else if (deg >= -157.5 && deg < -112.5) currentPlayerImg = playerSprites.upLeft;
  else if (deg >= -112.5 && deg < -67.5) currentPlayerImg = playerSprites.up;
  else if (deg >= -67.5 && deg < -22.5) currentPlayerImg = playerSprites.upRight;
}

// ARRAYS
let platforms = [];
let bullets = [];
let boss = null;

let score = 0;
let lastBossScore = 0;
let firstBoss = true;

const PLATFORM_GAP = 65;
const SLIME_CHANCE = 0.35;

const ZONES = {
  LEFT: 40,
  CENTER: canvas.width / 2 - 50,
  RIGHT: canvas.width - 140
};

const zoneKeys = ["LEFT", "CENTER", "RIGHT"];

// PLATAFORMAS
function getNextZone(prevZone) {
  let possible = zoneKeys.filter(z => z !== prevZone);
  return possible[Math.floor(Math.random() * possible.length)];
}

function getHighestPlatform() {
  return platforms.reduce((h, p) => p.y < h.y ? p : h, platforms[0]);
}

function createPlatforms() {
  platforms = [];

  platforms.push({
    x: ZONES.CENTER,
    y: player.y + 80,
    width: 100,
    height: 15,
    zone: "CENTER",
    slime: false
  });

  let y = player.y + 80 - PLATFORM_GAP;
  let lastZone = "CENTER";

  for (let i = 0; i < 10; i++) {
    let newZone = getNextZone(lastZone);

    platforms.push({
      x: ZONES[newZone],
      y: y,
      width: 100,
      height: 15,
      zone: newZone,
      slime: Math.random() < SLIME_CHANCE
    });

    lastZone = newZone;
    y -= PLATFORM_GAP;
  }
}

createPlatforms();

// JEFE
function spawnBoss() {
  boss = {
    x: canvas.width / 2 - 90,
    y: 50,
    width: 180,
    height: 120,
    hp: 20,
    maxHp: 20,
    speed: 2,
    direction: 1,
    state: "alive",
    deathTimer: 0,
    isFirst: firstBoss
  };

  firstBoss = false;
}

// CONTROLES
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "ArrowRight") direction = "right";
  if (e.key === "ArrowLeft") direction = "left";
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// DISPARO
canvas.addEventListener("click", shoot);

function shoot() {
  let dx = mouse.x - (player.x + player.width / 2);
  let dy = mouse.y - player.y;

  let angle = Math.atan2(dy, dx);

  lastAngle = angle;
  isAiming = true;
  lastShotTime = Date.now();

  bullets.push({
    x: player.x + player.width / 2,
    y: player.y,
    width: 8,
    height: 8,
    vx: Math.cos(angle) * 7,
    vy: Math.sin(angle) * 7
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

  updatePlayerSprite(keys);

  let prevY = player.y;

  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // COLISIÓN SUAVE
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

        if (jumpSound.paused) jumpSound.play();
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
        let newZone = getNextZone(top.zone);

        p.zone = newZone;
        p.x = ZONES[newZone];
        p.y = top.y - PLATFORM_GAP;
        p.slime = Math.random() < SLIME_CHANCE;

        score += 100;

        if ((score - lastBossScore) >= 1500 && boss === null) {
          spawnBoss();
        }
      }
    });
  }

  // BALAS
  bullets = bullets.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    return b.y > 0 && b.x > -20 && b.x < canvas.width + 20;
  });

  // JEFE
  if (boss) {
    if (boss.state === "alive") {

      boss.x += boss.speed * boss.direction;

      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }

      bullets.forEach((b, i) => {
        if (
          b.x < boss.x + boss.width &&
          b.x + b.width > boss.x &&
          b.y < boss.y + boss.height &&
          b.y + b.height > boss.y
        ) {
          boss.hp--;
          bullets.splice(i, 1);
        }
      });

      if (boss.hp <= 0) {
        boss.state = "dying";
        boss.deathTimer = 60;
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
    } else {
      boss.deathTimer--;
      if (boss.deathTimer <= 0) boss = null;
    }
  }

  if (player.y > canvas.height) gameOver();
}

// SLIME
function drawSlime(p) {
  ctx.fillStyle = "#00ff88";

  let time = Date.now() * 0.005;

  for (let i = 0; i < 3; i++) {
    let dripX = p.x + 15 + i * 25;
    let dripHeight = 8 + Math.sin(time + i) * 5;

    ctx.fillRect(dripX, p.y + p.height, 4, dripHeight);
  }
}

// MIRA
function drawCrosshair() {
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mouse.x - 15, mouse.y);
  ctx.lineTo(mouse.x + 15, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - 15);
  ctx.lineTo(mouse.x, mouse.y + 15);
  ctx.stroke();
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    currentPlayerImg,
    player.x + player.width / 2 - PLAYER_SIZE / 2,
    player.y + player.height / 2 - PLAYER_SIZE / 2,
    PLAYER_SIZE,
    PLAYER_SIZE
  );

  platforms.forEach(p => {
    ctx.fillStyle = "#7f8c8d";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(p.x, p.y, p.width, 3);

    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(p.x, p.y + p.height - 3, p.width, 3);

    if (p.slime) {
      ctx.fillStyle = "#00ff88";
      ctx.fillRect(p.x, p.y - 3, p.width, 3);
      drawSlime(p);
    }
  });

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // JEFE DRAW
  if (boss) {
    let img;

    if (boss.isFirst) {
      if (boss.hp === boss.maxHp) img = bossImg1;
      else if (boss.hp > boss.maxHp / 2) img = bossImg2;
      else img = bossImg3;
    } else {
      ctx.fillStyle = "darkred";
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    }

    if (img) ctx.drawImage(img, boss.x, boss.y, boss.width, boss.height);

    ctx.fillStyle = "red";
    ctx.fillRect(50, 20, 300, 10);

    ctx.fillStyle = "green";
    ctx.fillRect(50, 20, 300 * (boss.hp / boss.maxHp), 10);
  }

  drawCrosshair();

  ctx.fillStyle = "white";
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