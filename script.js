const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
let score = 0, timeLeft = 30;
const gridSize = 16; // tamaño de celda
// Laberinto simple: 0=pasillo, 1=muro
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  /* ... más filas ... */
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
let player = { x:1, y:1 };

function drawMaze() {
  for (let y=0; y<maze.length; y++){
    for (let x=0; x<maze[y].length; x++){
      ctx.fillStyle = maze[y][x] ? '#000' : '#222';
      ctx.fillRect(x*gridSize, y*gridSize, gridSize, gridSize);
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(
    player.x*gridSize + gridSize/2,
    player.y*gridSize + gridSize/2,
    gridSize/2 - 2, 0, Math.PI*2
  );
  ctx.fill();
}

function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMaze();
  drawPlayer();
  // aquí irían colisiones, bolitas y temporizador
  requestAnimationFrame(gameLoop);
}

document.getElementById('startBtn').onclick = () => {
  score = 0; timeLeft = 30;
  gameLoop();
};
