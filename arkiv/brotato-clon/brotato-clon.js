// --- Grundlagen ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;


// UI Elemente
const healthEl = document.getElementById('health');
const scoreEl = document.getElementById('score');
const enemiesEl = document.getElementById('enemies');
const restartBtn = document.getElementById('restart');


// --- Spielzustand ---
let keys = {};
let mouse = { x: W/2, y: H/2, down:false };
let player, enemies, bullets, lastTime, spawnTimer, score, gameOver;


function reset(){
player = { x: W/2, y: H/2, r:14, speed:220, hp:100, maxHp:100 };
enemies = [];
bullets = [];
score = 0;
spawnTimer = 0;
lastTime = performance.now();
gameOver = false;
updateUI();
}


// --- Utilities ---
function rand(min,max){return Math.random()*(max-min)+min}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
updateUI();
}


draw();
requestAnimationFrame(update);
}


// --- UI update ---
function updateUI(){ healthEl.textContent = Math.max(0, Math.round(player.hp)); scoreEl.textContent = Math.floor(score);
enemiesEl.textContent = enemies.length; }


// --- Rendering ---
function draw(){
// clear
ctx.clearRect(0,0,W,H);


// background grid / vignette
drawGrid();


// draw bullets
bullets.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill(); });


// draw enemies
enemies.forEach(e=>{
// body
const t = Math.max(0, e.hp/e.maxHp);
ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
ctx.fillStyle = `rgba(225,80,80,0.95)`; ctx.fill();
// health bar
ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(e.x-12, e.y - e.r - 10, 24, 4);
ctx.fillStyle = 'rgba(0,255,150,0.9)'; ctx.fillRect(e.x-12, e.y - e.r - 10, 24 * t, 4);
});


// player (draw on top)
ctx.save();
ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
ctx.fillStyle = '#79ffe1'; ctx.fill();
// eyes / direction
const ang = Math.atan2(mouse.y-player.y, mouse.x-player.x);
ctx.beginPath(); ctx.arc(player.x + Math.cos(ang)*6, player.y + Math.sin(ang)*6, 3, 0, Math.PI*2); ctx.fillStyle = '#063'; ctx.fill();
ctx.restore();


// HUD: health bar bottom-left
drawHUD();


if(gameOver){ ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='42px system-ui'; ctx.fillText('GAME OVER', W/2, H/2-10); ctx.font='18px system-ui'; ctx.fillText('Drücke R für Neustart', W/2, H/2+26); }
}


function drawGrid(){
ctx.save();
ctx.globalAlpha = 0.06;
ctx.translate(0,0);
ctx.strokeStyle = '#fff';
ctx.lineWidth = 1;
const size = 80;
for(let x=0;x<=W;x+=size){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
for(let y=0;y<=H;y+=size){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
ctx.restore();
}


function drawHUD(){
// health bar
const bw = 220; const bh = 16; const bx = 12; const by = H - bh - 12;
const t = Math.max(0, player.hp/player.maxHp);
ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(bx-2,by-2,bw+4,bh+4);
ctx.fillStyle = 'rgba(40,40,40,0.8)'; ctx.fillRect(bx,by,bw,bh);
ctx.fillStyle = '#ef4444'; ctx.fillRect(bx,by, bw * t, bh);
ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(bx,by,bw,bh);


// score
ctx.fillStyle = '#dbeafe'; ctx.font='16px system-ui'; ctx.textAlign='right'; ctx.fillText('Score: ' + Math.floor(score), W-12, 26);
}


// --- Start ---
reset();
requestAnimationFrame(update);

