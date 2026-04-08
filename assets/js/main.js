const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// 🧍 Imagen del jugador
const playerImg = new Image();
playerImg.src = "assets/player.png";

// 🔊 Sonido salto
const jumpSound = new Audio("assets/jump.wav");

// 🎮 Jugador
const player = {
  x: 180,
  y: 400,
  width: 40,
  height: 40,
  velocityY: 0,
  gravity: 0.5,
  jumpPower: -12
};

// 🟩 Plataformas
let platforms = [];

// Crear plataformas (con inicio seguro)
function createPlatforms() {
  platforms = [];

  // 🛡 Plataforma inicial SEGURA
  platforms.push({
    x: player.x - 10,
    y: player.y + 50,
    width: 80,
    height: 10,
    broken: false
  });

  // Resto de plataformas
  for (let i = 1; i < 7; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 60),
      y: i * 90,
      width: 60,
      height: 10,
      broken: Math.random() < 0.3 // 30% se rompen
    });
  }
}

createPlatforms();

// 🎮 Controles
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// 🔄 Update
function update() {
  // Movimiento lateral
  if (keys["ArrowLeft"]) player.x -= 5;
  if (keys["ArrowRight"]) player.x += 5;

  // Teletransporte lateral
  if (player.x > canvas.width) player.x = -player.width;
  if (player.x < -player.width) player.x = canvas.width;

  // Gravedad
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // 🧠 Colisiones
  platforms.forEach((platform, index) => {
    if (player.velocityY > 0) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + 15
      ) {
        // 🔊 sonido
        jumpSound.currentTime = 0;
        jumpSound.play();

        player.velocityY = player.jumpPower;

        // 💥 romper plataforma
        if (platform.broken) {
          platforms.splice(index, 1);
        }
      }
    }
  });

  // 📈 Scroll
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

  // ❌ Caída
  if (player.y > canvas.height) {
    player.y = 400;
    player.velocityY = 0;
    createPlatforms();
  }
}

// 🎨 Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador (imagen)
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Plataformas
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