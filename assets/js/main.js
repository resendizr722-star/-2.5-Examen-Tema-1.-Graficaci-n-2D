const canvas = document.getElementById("game");

//FULL SCREEN
const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.addEventListener("click", () => {
  let elem = document.documentElement;

  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
});

const ctx = canvas.getContext("2d");

if ("ontouchstart" in window) {
  document.body.addEventListener("touchmove", (e) => {
    e.preventDefault();
  }, { passive: false });
}

canvas.width = 400;
canvas.height = 600;

const PLAYER_SIZE = 70;

// 🌌 BACKGROUND ESTRELLAS
let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.2
  });
}

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

// JEFE 1
const bossImg1 = new Image();
bossImg1.src = "assets/img/j-1.png";

const bossImg2 = new Image();
bossImg2.src = "assets/img/j-2.png";

const bossImg3 = new Image();
bossImg3.src = "assets/img/j-3.png";

//JEFE 2
const boss2Img1 = new Image();
boss2Img1.src = "assets/img/k-1.png";

const boss2Img2 = new Image();
boss2Img2.src = "assets/img/k-2.png";

const boss2Img3 = new Image();
boss2Img3.src = "assets/img/k-3.png";

// JEFE 3
const boss3Img1 = new Image();
boss3Img1.src = "assets/img/L-1.png";

const boss3Img2 = new Image();
boss3Img2.src = "assets/img/L-2.png";

const boss3Img3 = new Image();
boss3Img3.src = "assets/img/L-3.png";

// SONIDOS
const jumpSound = new Audio("assets/jump.wav");
const shootSound = new Audio("assets/shoot.wav");

// MOUSE
let mouse = { x: 0, y: 0 };
let touchStartX = 0;
let touchCurrentX = 0;
let isSwiping = false;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
// ==========================
// 📱 TOUCH SWIPE + TAP
// ==========================
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  touchStartX = touch.clientX;
  touchCurrentX = touch.clientX;

  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;

  isSwiping = false;

}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  touchCurrentX = touch.clientX;

  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;

  let diffX = touchCurrentX - touchStartX;

  if (Math.abs(diffX) > 15) {
    isSwiping = true;

    if (diffX > 0) {
      keys["ArrowRight"] = true;
      keys["ArrowLeft"] = false;
      direction = "right";
    } else {
      keys["ArrowLeft"] = true;
      keys["ArrowRight"] = false;
      direction = "left";
    }
  }

}, { passive: false });

canvas.addEventListener("touchend", () => {

  if (!isSwiping) {
    shoot(); // TAP dispara
  }

  keys["ArrowLeft"] = false;
  keys["ArrowRight"] = false;
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
let bossBullets = []; // 💥 NUEVO
let boss = null;
let meteors = [];
let meteorTimer = 0;
let score = 0;
let lastBossScore = 0;
let firstBoss = true;
let bossLevel = 0;
let bossCycle = 0;

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

  // evita repetir extremos
  if (prevZone === "LEFT") return Math.random() < 0.7 ? "CENTER" : "RIGHT";
  if (prevZone === "RIGHT") return Math.random() < 0.7 ? "CENTER" : "LEFT";

  // desde el centro puede ir a cualquiera
  return Math.random() < 0.5 ? "LEFT" : "RIGHT";
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
    slime: false,

    falling: false,
    fallSpeed: 0,
    passed: false
  });

  let y = player.y + 80 - PLATFORM_GAP;
  let lastZone = "CENTER";

  for (let i = 0; i < 10; i++) {
    let newZone = getNextZone(lastZone);

    platforms.push({
      breakable: false,
      hp: 1,
      breaking: false,
      breakTimer: 0,
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

  let baseHP = 30;
  let baseSpeed = 2;
  let baseCooldown = 60;

  boss = {
    x: canvas.width / 2 - 90,
    y: 50,
    width: 180,
    height: 120,

    // 🔥 ESCALADO
    hp: baseHP + bossCycle * 10,
    maxHp: baseHP + bossCycle * 10,

    speed: baseSpeed + bossCycle * 0.3,

    direction: 1,
    state: "alive",
    deathTimer: 0,

    shootCooldown: baseCooldown - bossCycle * 2
  };

  // 🚫 límite para que no dispare absurdo
  if (boss.shootCooldown < 20) boss.shootCooldown = 20;
}
function spawnMeteor() {

  let size = Math.random() * 15 + 20; // tamaños más consistentes

  meteors.push({
    x: Math.random() * canvas.width,
    y: -30,

    size: size,

    // 🔥 velocidad vertical (caída)
    speed: Math.random() * 1.5 + 2.5,

    // ↘️ movimiento lateral leve
    vx: (Math.random() - 0.5) * 1.2,

    // 🪨 manchas fijas (para que no parpadeen)
    spots: Array.from({ length: 4 }, () => ({
      x: (Math.random() - 0.5),
      y: (Math.random() - 0.5)
    }))
  });
}
// DISPARO JEFE
function bossShoot() {

  // 🎯 apuntar al jugador
  let dx = (player.x + player.width / 2) - (boss.x + boss.width / 2);
  let dy = player.y - (boss.y + boss.height / 2);

  let angle = Math.atan2(dy, dx);

  // 🔥 ERROR (imprecisión)
  let spread = (Math.random() - 0.5) * 0.6; // ajusta dificultad
  angle += spread;

  bossBullets.push({
    x: boss.x + boss.width / 2,
    y: boss.y + boss.height / 2,
    size: 4,
    vx: Math.cos(angle) * 3,
    vy: Math.sin(angle) * 3
  });

  
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

  // 🧱 COLISIONES CON PLATAFORMAS
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

        // 🚫 si ya se está rompiendo, no colisiona
        if (p.breaking) return;

        if (p.breakable) {

          // 💥 rebote + ruptura inmediata
          player.y = p.y - player.height;
          player.velocityY = player.jumpPower;

          if (jumpSound.paused) jumpSound.play();

          p.breaking = true;
          p.breakTimer = 20;

        } else {

          // normal
          player.y = p.y - player.height;
          player.velocityY = player.jumpPower;

          if (jumpSound.paused) jumpSound.play();
        }
      }
    }
  });

  // 💥 ANIMACIÓN DE PLATAFORMAS QUE SE ROMPEN
  platforms.forEach(p => {
    if (p.breaking) {
      p.breakTimer--;

      // ⬇️ caída con aceleración (más pro)
      p.y += 5 + (20 - p.breakTimer) * 0.3;

      // 👻 desaparecer
      if (p.breakTimer <= 0) {
        p.y = canvas.height + 200;
      }
    }
  });

// SCROLL
if (player.y < 250) {
  let diff = 250 - player.y;
  player.y = 250;

  // =========================
  // 🧱 PLATAFORMAS
  // =========================
  platforms.forEach(p => {
    p.y += diff;

    if (p.y > canvas.height) {
      let top = getHighestPlatform();
      let newZone = getNextZone(top.zone);

      p.zone = newZone;
      p.x = ZONES[newZone];
      p.y = top.y - PLATFORM_GAP;
      p.slime = Math.random() < SLIME_CHANCE;
      
      // 🔄 reset
      p.passed = false;
      p.falling = false;
      p.fallSpeed = 0;

      // 🔄 reset estado
      p.breakable = false;
      p.breaking = false;
      p.breakTimer = 0;

      // 🎲 distribución de tipos
      if (!firstBoss) {

        let isSafe = !(top.breakable || top.slime);
        let r = Math.random();

        if (r < 0.15 && isSafe) {
          p.breakable = true;

        } else if (r < 0.25) {

          let rescueZone = getNextZone(p.zone);

          platforms.push({
            x: ZONES[rescueZone],
            y: p.y - PLATFORM_GAP,
            width: 100,
            height: 15,
            zone: rescueZone,
            slime: false,
            breakable: false,
            breaking: false,
            breakTimer: 0,
            passed: false,
            falling: false,
            fallSpeed: 0
          });
        }
      }

      score += 100;

     if (boss === null) {
      let nextBossScore = 2500 + (bossCycle * 7500);

      if (score >= nextBossScore) {

        // 🔁 rotar bosses: 1 → 2 → 3 → 1 → 2 → 3...
        bossLevel++;
        if (bossLevel > 3) bossLevel = 1;

        spawnBoss();

       bossCycle++; // 🔥 siguiente ronda

  }
    
}
    }
  });

  // =========================
  // ☄️ METEORITOS (FIX)
  // =========================
  meteors.forEach(m => {
    m.y += diff;
  });

  // =========================
  // 💥 BALAS JEFE (recomendado)
  // =========================
  bossBullets.forEach(b => {
    b.y += diff;
  });

  // =========================
  // 🔫 BALAS PLAYER (opcional)
  // =========================
  bullets.forEach(b => {
    b.y += diff;
  });
}

  // 🔫 BALAS PLAYER
  bullets = bullets.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    return b.y > 0 && b.x > -20 && b.x < canvas.width + 20;
  });

  // 💥 BALAS JEFE
  bossBullets = bossBullets.filter(b => {
    b.x += b.vx;
    b.y += b.vy;

    // 🎯 HITBOX PRECISA
    const padding = 30;

    if (
      b.x < player.x + player.width - padding &&
      b.x + b.size > player.x + padding &&
      b.y < player.y + player.height - padding &&
      b.y + b.size > player.y + padding
    ) {
      gameOver();
    }

    return b.y < canvas.height;
  });

  // 👾 JEFE
  if (boss) {
    if (boss.state === "alive") {

      boss.x += boss.speed * boss.direction;

      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }

      // 💀 DISPARO CONTROLADO
      boss.shootCooldown--;
      if (boss.shootCooldown <= 0) {
        bossShoot();
        boss.shootCooldown = 60;
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
  // ☄️ SPAWN METEORITOS (solo si NO hay jefe)
if (!boss) {
  meteorTimer--;

  if (meteorTimer <= 0) {
    spawnMeteor();

    // ⏱️ tiempo aleatorio (no constante)
    meteorTimer = Math.random() * 120 + 80; // entre 80 y 200 frames
  }
}

// ☄️ MOVIMIENTO
meteors = meteors.filter(m => {
  m.y += m.speed;
  m.x += m.vx;

  // 💀 colisión con jugador
  let playerCenterX = player.x + player.width / 2;
let playerCenterY = player.y + player.height / 2;

let meteorCenterX = m.x;
let meteorCenterY = m.y;

let dx = playerCenterX - meteorCenterX;
let dy = playerCenterY - meteorCenterY;

let distance = Math.sqrt(dx * dx + dy * dy);

// 🎯 radios
let playerRadius = player.width / 3; // más justo
let meteorRadius = m.size;

if (distance < playerRadius + meteorRadius) {
  gameOver();
}

  return m.y < canvas.height + 50;
});

platforms = platforms.filter(p => {

  // solo eliminar si ya salió completamente de pantalla
  if (p.y > canvas.height + 100) {
    return false;
  }

  return true;
});

// ==========================
// 🧠 1. MARCAR PASSED PRIMERO
// ==========================
platforms.forEach(p => {

  // marcar como pasada SOLO cuando el jugador ya está arriba de ella
  if (
    !p.passed &&
    player.velocityY < 0 && // sigue subiendo
    player.y + player.height < p.y - 10 // ya quedó claramente arriba
  ) {
    p.passed = true;
  }

});

// ==========================
// 💥 2. ACTIVAR CAÍDA
// ==========================
platforms.forEach(p => {

  if (p.passed && !p.falling && p.y > player.y + 250) {
    p.falling = true;
    p.fallSpeed = 2;
  }

});

// ==========================
// ⬇️ 3. MOVER CAÍDA
// ==========================
platforms.forEach(p => {

  if (p.falling) {
    p.y += p.fallSpeed;
    p.fallSpeed += 0.2;
  }

});

// ==========================
// 🧠 GENERADOR DE SEGURIDAD
// ==========================
while (platforms.length < 12) {

  let top = getHighestPlatform();
  let newZone = getNextZone(top.zone);

  platforms.push({
    x: ZONES[newZone],
    y: top.y - PLATFORM_GAP,
    width: 100,
    height: 15,
    zone: newZone,
    slime: Math.random() < SLIME_CHANCE,

    breakable: false,
    breaking: false,
    breakTimer: 0,

    // IMPORTANTE
    passed: false,
    falling: false,
    fallSpeed: 0
  });
  

}
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

// 🎯 MIRA
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

// 🌌 FONDO
function drawBackground() {

  // 🌌 fondo normal
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

  if (boss && boss.state === "alive") {
    // 😈 modo jefe (más oscuro / alien)
    gradient.addColorStop(0, "#0a0014");
    gradient.addColorStop(1, "#1a0033");
  } else {
    // 🌠 modo normal
    gradient.addColorStop(0, "#050510");
    gradient.addColorStop(1, "#0b1a2a");
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ⭐ estrellas
  ctx.fillStyle = "white";
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });

  // 😈 overlay cuando hay jefe
  if (boss && boss.state === "alive") {
    ctx.fillStyle = "rgba(150,0,255,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// DRAW
function draw() {
  drawBackground();platforms.forEach(p => {

  // 👻 EFECTO CUANDO CAE
  if (p.falling) {
    ctx.globalAlpha = 0.5; // transparencia
  }

  // 💥 PLATAFORMA ROMPIBLE
  if (p.breakable) {

    ctx.fillStyle = "#8e44ad";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    ctx.fillStyle = "#c39bd3";
    ctx.fillRect(p.x, p.y, p.width, 3);

    ctx.strokeStyle = "#f5eef8";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(p.x + 10, p.y + 5);
    ctx.lineTo(p.x + 40, p.y + 12);
    ctx.lineTo(p.x + 70, p.y + 6);
    ctx.stroke();

  } else {

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
  }

  // 🔄 RESET (MUY IMPORTANTE)
  ctx.globalAlpha = 1;

});

  ctx.drawImage(
    currentPlayerImg,
    player.x + player.width / 2 - PLAYER_SIZE / 2,
    player.y + player.height / 2 - PLAYER_SIZE / 2,
    PLAYER_SIZE,
    PLAYER_SIZE
  );



  // 💥 DISPAROS PLAYER (ENERGÍA)
  bullets.forEach(b => {

  // glow
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 10;

  ctx.fillStyle = "#00ff88";
  ctx.fillRect(b.x, b.y, b.width, b.height);

  // núcleo
  ctx.fillStyle = "#aaffcc";
  ctx.fillRect(b.x + 2, b.y + 2, b.width - 4, b.height - 4);

  ctx.shadowBlur = 0;
  });

  // 💥 BALAS JEFE
  // ☠️ DISPAROS JEFE (PELIGRO)
  bossBullets.forEach(b => {

  ctx.shadowColor = "red";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "#ff0033";
  ctx.fillRect(b.x, b.y, b.size, b.size);

  // núcleo brillante
  ctx.fillStyle = "#ffaaaa";
  ctx.fillRect(b.x + 1, b.y + 1, b.size - 2, b.size - 2);

  ctx.shadowBlur = 0;
  });

// JEFE DRAW
if (boss) {
  let img;

  // =========================
  // 👾 JEFE 1
  // =========================
  if (bossLevel === 1) {
    if (boss.hp === boss.maxHp) {
      img = bossImg1;
    } else if (boss.hp > boss.maxHp / 2) {
      img = bossImg2;
    } else {
      img = bossImg3;
    }
  }

  // =========================
  // 😈 JEFE 2
  // =========================
  else if (bossLevel === 2) {
    if (boss.hp === boss.maxHp) {
      img = boss2Img1;
    } else if (boss.hp > boss.maxHp / 2) {
      img = boss2Img2;
    } else {
      img = boss2Img3;
    }
  }

  // =========================
  // ☠️ JEFE 3
  // =========================
  else if (bossLevel === 3) {
    if (boss.hp === boss.maxHp) {
      img = boss3Img1; // L-1
    } else if (boss.hp > boss.maxHp / 2) {
      img = boss3Img2; // L-2
    } else {
      img = boss3Img3; // L-3
    }
  }

  // =========================
  // 🎨 DIBUJAR
  // =========================
  if (img) {
    let newWidth = 200;
    let newHeight = 200;

    let offsetX = boss.x + (boss.width - newWidth) / 2;
    let offsetY = boss.y + (boss.height - newHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  }

  // ❤️ VIDA
  ctx.fillStyle = "red";
  ctx.fillRect(50, 20, 300, 10);

  ctx.fillStyle = "green";
  ctx.fillRect(50, 20, 300 * (boss.hp / boss.maxHp), 10);
}

  drawCrosshair();

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 50);

meteors.forEach(m => {

  // ======================
  // 🔥 ESTELA (PRIMERO)
  // ======================
  let angle = Math.atan2(m.speed, m.vx);
  let length = 40 + m.size * 1.2;

  ctx.shadowColor = "orange";
  ctx.shadowBlur = 15;

  // capa externa
  ctx.fillStyle = "#ff8c00";
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.lineTo(
    m.x - Math.cos(angle + 0.6) * length,
    m.y - Math.sin(angle + 0.6) * length
  );
  ctx.lineTo(
    m.x - Math.cos(angle - 0.6) * length,
    m.y - Math.sin(angle - 0.6) * length
  );
  ctx.closePath();
  ctx.fill();

  // capa interna
  ctx.fillStyle = "#ffd966";
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.lineTo(
    m.x - Math.cos(angle + 0.3) * (length - 15),
    m.y - Math.sin(angle + 0.3) * (length - 15)
  );
  ctx.lineTo(
    m.x - Math.cos(angle - 0.3) * (length - 15),
    m.y - Math.sin(angle - 0.3) * (length - 15)
  );
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // ======================
  // ⚪ BORDE (STICKER)
  // ======================
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.size + 3, 0, Math.PI * 2);
  ctx.fill();

  // ======================
  // 🪨 ROCA
  // ======================
  ctx.fillStyle = "#8b2e1a";
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
  ctx.fill();

  // ======================
  // 🪨 MANCHAS
  // ======================
  ctx.fillStyle = "#5a1a10";

  m.spots.forEach(s => {
    ctx.beginPath();
    ctx.arc(
      m.x + s.x * m.size,
      m.y + s.y * m.size,
      m.size * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

});
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