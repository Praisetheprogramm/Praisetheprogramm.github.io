const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function fitCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
fitCanvas();
window.addEventListener('resize', fitCanvas);

let playerType = null;
let keys = {};
let enemies = [];
let neutrals = [];
let plants = [];
let levelProgress = 0; // 0 bis 100

const player = {
  health: 100,
  x: canvas.width/2,
  y: canvas.height/2,
  w: 30,
  h: 30,
  color: 'blue',
  speed: 4
};

function spawnEnemies(n) {
  for (let i=0;i<n;i++) {
    enemies.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      w: 30,
      h: 30,
      color: 'red',
      type: 'fleischfresser',
      dx: (Math.random()*2-1)*2,
      dy: (Math.random()*2-1)*2
    });
  }
}

function spawnNeutrals(n) {
  for (let i=0;i<n;i++) {
    neutrals.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      w: 30,
      h: 30,
      color: 'lightgreen',
      type: 'pflanzenfresser',
      dx: (Math.random()*2-1)*2,
      dy: (Math.random()*2-1)*2,
      hits: 0
    });
  }
}

function spawnPlants(n) {
  for (let i=0;i<n;i++) {
    plants.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      w: 15,
      h: 15,
      color: 'darkgreen'
    });
  }
}

function updateEntity(e) {
  e.x += e.dx;
  e.y += e.dy;
  if (e.x < 0) { e.x = 0; e.dx *= -1; }
  if (e.x + e.w > canvas.width) { e.x = canvas.width - e.w; e.dx *= -1; }
  if (e.y < 0) { e.y = 0; e.dy *= -1; }
  if (e.y + e.h > canvas.height) { e.y = canvas.height - e.h; e.dy *= -1; }
}

function movePlayer() {
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height-player.h, player.y));
}

function collides(a,b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gameLoop() {
  if (!playerType) return requestAnimationFrame(gameLoop);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Level-Leiste zeichnen
  ctx.fillStyle = 'gray';
  ctx.fillRect(20, 20, 200, 20);
  ctx.fillStyle = 'yellow';
  ctx.fillRect(20, 20, 200 * (levelProgress / 100), 20);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(20, 20, 200, 20);

  movePlayer();

  // Pflanzen zeichnen
  for (let i = plants.length-1; i >= 0; i--) {
    const p = plants[i];
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x,p.y,p.w,p.h);
    if (collides(player,p)) {
      // Pflanzen können von Pflanzenfressern gegessen werden
      plants.splice(i,1);
      levelProgress = Math.min(100, levelProgress + 5);
    }
  }

  // Gegner verhalten
  for (let ei = enemies.length-1; ei >= 0; ei--) {
    const e = enemies[ei];
    // Gegner KI: auf Spieler oder neutrale Gegner zu (wenn in Nähe)
    let target = player;
    let nearestNeutral = null;
    let nearestNeutralDist = Infinity;
    for (let ni = 0; ni < neutrals.length; ni++) {
      const n = neutrals[ni];
      const d = Math.hypot(n.x - e.x, n.y - e.y);
      if (d < nearestNeutralDist) { nearestNeutralDist = d; nearestNeutral = n; }
    }
    // Wenn ein neutraler nahe ist (<200), greifen Gegner (Fleischfresser) ihn an
    if (nearestNeutral && nearestNeutralDist < 200) target = nearestNeutral;

    const dist = Math.hypot(target.x - e.x, target.y - e.y);
    if (dist > 0 && dist < 400) {
      e.dx = (target.x - e.x) / dist * 2;
      e.dy = (target.y - e.y) / dist * 2;
    } else {
      updateEntity(e);
    }

    // Bewegung anwenden und zeichnen
    updateEntity(e);
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x,e.y,e.w,e.h);

    // Kollisionslogik mit Spieler
    if (collides(player,e)) {
      // Spieler nimmt Schaden, egal ob Pflanzen- oder Fleischfresser
      player.health -= 0.5; // langsameren Schaden pro Frame
      if (player.health <= 0) {
        alert('Du wurdest besiegt!');
        location.reload();
        return;
      }
      // Wenn Spieler Fleischfresser ist, kann er Gegner töten
      if (playerType === 'fleischfresser') {
        enemies.splice(ei,1);
        levelProgress = Math.min(100, levelProgress + 10);
      }
    }

    // Wenn Gegner an einem neutralen vorbeikommt: Treffer zählen
    for (let ni = neutrals.length-1; ni >= 0; ni--) {
      const n = neutrals[ni];
      if (collides(n,e)) {
        n.hits++;
        if (n.hits >= 5) {
          neutrals.splice(ni,1);
        }
      }
    }
  }

  // Neutrale verhalten (fliehen vor Gegnern)
  for (let ni = neutrals.length-1; ni >= 0; ni--) {
    const n = neutrals[ni];
    // Finde nächsten Gegner
    let nearestE = null;
    let nearestEDist = Infinity;
    for (let ei = 0; ei < enemies.length; ei++) {
      const e = enemies[ei];
      const d = Math.hypot(e.x - n.x, e.y - n.y);
      if (d < nearestEDist) { nearestEDist = d; nearestE = e; }
    }
    if (nearestE && nearestEDist < 200) {
      // Fliehen: Richtung vom Gegner weg
      const dist = nearestEDist || 1;
      n.dx = (n.x - nearestE.x) / dist * 2.5;
      n.dy = (n.y - nearestE.y) / dist * 2.5;
    } else {
      // normale Bewegung
      updateEntity(n);
    }

    // Bewegung anwenden und zeichnen
    updateEntity(n);
    ctx.fillStyle = n.color;
    ctx.fillRect(n.x,n.y,n.w,n.h);
  }

  // Spieler zeichnen
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x,player.y,player.w,player.h);

  // Lebensleiste zeichnen
  ctx.fillStyle = 'red';
  ctx.fillRect(20, 50, 200, 20);
  ctx.fillStyle = 'lime';
  ctx.fillRect(20, 50, 200 * (player.health / 100), 20);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(20, 50, 200, 20);

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown',e=>keys[e.key]=true);
window.addEventListener('keyup',e=>keys[e.key]=false);

function startGame(type) {
  playerType = type;
  document.getElementById('ui').style.display = 'none';
  // Reset defaults
  enemies = [];
  neutrals = [];
  plants = [];
  levelProgress = 0;
  player.health = 100;
  player.x = canvas.width/2;
  player.y = canvas.height/2;

  spawnEnemies(8);
  spawnNeutrals(5);
  spawnPlants(15);
}

document.getElementById('btnFleisch').addEventListener('click',()=>startGame('fleischfresser'));
document.getElementById('btnPflanze').addEventListener('click',()=>startGame('pflanzenfresser'));

requestAnimationFrame(gameLoop);