// --- Configuración inicial ---
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const grid   = 20;                       
const cols   = canvas.width / grid;     
const rows   = canvas.height / grid;    

// Estado del juego
let score    = 0;
let lives    = 3;
let timeLeft = 60;
let level    = 1;
let playing  = false;
let maze, dots;
let timerInterval;

// Jugador y fantasma
let player = { x: 1, y: 1, dx: 0, dy: 0 };
let ghost  = { x: cols - 2, y: rows - 2, dx: 0, dy: 0 };

// Captura de teclado global (flechas, WASD, teclado numérico)
const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key;
  const valid = [
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
    'w','a','s','d','W','A','S','D',
    '8','2','4','6'
  ];
  if (valid.includes(k)) {
    e.preventDefault();
    keys[k] = true;
  }
});
window.addEventListener('keyup', e => {
  const k = e.key;
  const valid = [
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
    'w','a','s','d','W','A','S','D',
    '8','2','4','6'
  ];
  if (valid.includes(k)) {
    e.preventDefault();
    keys[k] = false;
  }
});

// Construye un laberinto simple (borde de muros)
function buildMaze() {
  maze = Array(rows).fill().map((_, y) =>
    Array(cols).fill().map((_, x) =>
      (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) ? 1 : 0
    )
  );
}

// Genera bolitas en cada pasillo
function spawnDots() {
  dots = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 0) dots.push({ x, y, eaten: false });
    }
  }
}

// Dibuja laberinto, bolitas, jugador y fantasma
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = maze[y][x] ? '#000' : '#222';
      ctx.fillRect(x * grid, y * grid, grid, grid);
    }
  }
}
function drawDots() {
  dots.forEach(dot => {
    if (!dot.eaten) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(dot.x * grid + grid/2, dot.y * grid + grid/2, 3, 0, Math.PI*2);
      ctx.fill();
    }
  });
}
function drawPlayer() {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(player.x * grid + grid/2, player.y * grid + grid/2, grid/2 - 2, 0, Math.PI*2);
  ctx.fill();
}
function drawGhost() {
  ctx.fillStyle = 'red';
  ctx.fillRect(ghost.x * grid + 2, ghost.y * grid + 2, grid - 4, grid - 4);
}

// Actualiza estado: movimiento, colisiones, mecánicas
function update() {
  // Movimiento según flechas, WASD y numpad
  player.dx = player.dy = 0;
  if (keys.ArrowUp   || keys.w || keys.W || keys['8']) player.dy = -1;
  if (keys.ArrowDown || keys.s || keys.S || keys['2']) player.dy =  1;
  if (keys.ArrowLeft || keys.a || keys.A || keys['4']) player.dx = -1;
  if (keys.ArrowRight|| keys.d || keys.D || keys['6']) player.dx =  1;

  let nx = player.x + player.dx, ny = player.y + player.dy;
  if (maze[ny] && maze[ny][nx] === 0) {
    player.x = nx; player.y = ny;
  }

  // Comer bolita
  const dot = dots.find(d => d.x===player.x && d.y===player.y && !d.eaten);
  if (dot) {
    dot.eaten = true;
    score += 10;

    // Alerta cada 1000 pts
    if (score % 1000 === 0) alert('¡Muy bien, excelente! Vamos bien.');

    // Vida extra cada 3000 pts
    if (score % 3000 === 0) {
      lives++;
      document.getElementById('lives').textContent = `Vidas: ${lives}`;
      alert('¡Has ganado una vida extra!');
    }

    document.getElementById('score').textContent = `Puntaje: ${score}`;
  }

  // IA básica del fantasma (aleatorio)
  if (Math.random() < 0.02) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const [dx,dy] = dirs[Math.floor(Math.random()*dirs.length)];
    if (maze[ghost.y+dy][ghost.x+dx] === 0) {
      ghost.dx = dx; ghost.dy = dy;
    }
  }
  nx = ghost.x + ghost.dx; ny = ghost.y + ghost.dy;
  if (maze[ny] && maze[ny][nx] === 0) {
    ghost.x = nx; ghost.y = ny;
  }

  // Colisión con fantasma
  if (ghost.x===player.x && ghost.y===player.y) {
    lives--;
    document.getElementById('lives').textContent = `Vidas: ${lives}`;
    resetPositions();
    if (lives <= 0) return endGame();
  }

  // Fin de nivel
  if (dots.every(d => d.eaten)) {
    level++;
    document.getElementById('level').textContent = `Nivel: ${level}`;
    resetPositions();
    spawnDots();
  }
}

// Dibuja todo en el canvas
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMaze();
  drawDots();
  drawPlayer();
  drawGhost();
}

// Bucle principal
function gameLoop() {
  if (!playing) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Temporizador
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Tiempo: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// Reinicia posiciones de jugador y fantasma
function resetPositions() {
  player = { x:1, y:1, dx:0, dy:0 };
  ghost  = { x:cols-2, y:rows-2, dx:0, dy:0 };
}

// Inicia/reinicia el juego
function startGame() {
  score    = 0; lives = 3; timeLeft = 60; level = 1;
  document.getElementById('score').textContent = `Puntaje: ${score}`;
  document.getElementById('lives').textContent = `Vidas: ${lives}`;
  document.getElementById('timer').textContent = `Tiempo: ${timeLeft}`;
  document.getElementById('level').textContent = `Nivel: ${level}`;

  buildMaze();
  spawnDots();
  resetPositions();

  playing = true;
  startTimer();
  requestAnimationFrame(gameLoop);
}

// Finaliza el juego
function endGame() {
  playing = false;
  clearInterval(timerInterval);
  alert(`Game Over\nPuntaje final: ${score}`);
}

// Conectar botón Start
document.getElementById('startBtn').addEventListener('click', startGame);
