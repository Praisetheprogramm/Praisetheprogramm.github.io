// --- Grundlagen ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;


// UI Elemente
const healthEl = document.getElementById('health');
const scoreEl = document.getElementById('score');
const enemiesEl = document.getElementById('enemies');
const nextShopEl = document.getElementById('next-shop');
const restartBtn = document.getElementById('restart');
const shopEl = document.getElementById('shop');
const buyHealBtn = document.getElementById('buy-heal');
const buySpeedBtn = document.getElementById('buy-speed');
const buyDamageBtn = document.getElementById('buy-damage');
const resumeBtn = document.getElementById('resume');
const itemSlotsEl = document.getElementById('item-slots');
const toggleInfoBtn = document.getElementById('toggle-info');
const fullscreenBtn = document.getElementById('fullscreen');
const uiPanel = document.querySelector('.ui');

const SHOP_INTERVAL = 40;


// --- Spielzustand ---
let keys = {};
let mouse = { x: W/2, y: H/2, down:false };
let player, enemies, bullets, lastTime, spawnTimer, score, gameOver, shopTimer, shopOpen, shopItems, equippedItems;


const itemDefinitions = [
  { name: 'Stahlschädel', desc: '+8 Schaden', type: 'damage', value: 8 },
  { name: 'Leichtes Laufwerk', desc: '+24 Geschwindigkeit', type: 'speed', value: 24 },
  { name: 'Regenration', desc: '+18 Max HP', type: 'maxHp', value: 18 },
  { name: 'Panzerweste', desc: '+30 HP', type: 'heal', value: 30 },
  { name: 'Präzisionsmodul', desc: '-0.04s Feuerrate', type: 'fireRate', value: -0.04 },
  { name: 'Explosives Magazin', desc: '+4 Projektilschaden', type: 'damage', value: 4 },
  { name: 'Kondensator', desc: '+12 Geschwindigkeit', type: 'speed', value: 12 },
  { name: 'Stählerne Adern', desc: '+14 Max HP', type: 'maxHp', value: 14 }
];


function reset(){
  player = { x: W/2, y: H/2, r:14, speed:220, hp:100, maxHp:100, damage:18, fireRate:0.18, fireCooldown:0, equipped: [] };
  enemies = [];
  bullets = [];
  score = 0;
  spawnTimer = 0;
  shopTimer = 0;
  shopOpen = false;
  shopItems = [];
  equippedItems = { head:null, torso:null, handL:null, handR:null, footL:null, footR:null };
  lastTime = performance.now();
  gameOver = false;
  shopEl.classList.add('hidden');
  renderShopItems();
  renderEquipSlots();
  updateUI();
}


function rand(min,max){ return Math.random()*(max-min) + min; }
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }


function spawnEnemy(){
  const edge = Math.floor(rand(0, 4));
  const size = 14 + Math.round(rand(0, 8));
  const speed = 60 + Math.min(120, score * 0.25) + rand(0, 20);
  let x = 0, y = 0;
  if(edge === 0){ x = -size; y = rand(0, H); }
  else if(edge === 1){ x = W + size; y = rand(0, H); }
  else if(edge === 2){ x = rand(0, W); y = -size; }
  else { x = rand(0, W); y = H + size; }
  enemies.push({ x, y, r: size, speed, hp: 20 + size*2, maxHp: 20 + size*2, touchCooldown: 0 });
}


function generateShopItems(){
  shopItems = [];
  const available = [...itemDefinitions];
  for(let i = 0; i < 4; i++){
    const idx = Math.floor(rand(0, available.length));
    const base = available.splice(idx, 1)[0];
    shopItems.push({ ...base, cost: 20, id: `item-${Date.now()}-${i}` });
  }
  renderShopItems();
}


function renderShopItems(){
  if(!itemSlotsEl) return;
  itemSlotsEl.innerHTML = '';
  shopItems.forEach((item, index) => {
    const slot = document.createElement('div');
    slot.className = 'item-slot';
    if(item){
      slot.innerHTML = `
        <strong>${item.name}</strong>
        <div class="item-desc">${item.desc}</div>
        <button class="btn buy-btn">${item.cost} Punkte</button>
      `;
      slot.draggable = true;
      slot.dataset.index = index;
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', String(index));
      });
      slot.querySelector('.buy-btn').addEventListener('click', () => equipItem(index));
    } else {
      slot.innerHTML = `<strong>Leer</strong><div class="item-desc">Verkauft</div>`;
    }
    itemSlotsEl.appendChild(slot);
  });
  for(let i = shopItems.length; i < 4; i++){
    const empty = document.createElement('div');
    empty.className = 'item-slot';
    empty.innerHTML = `<strong>Leer</strong><div class="item-desc">Kein Item</div>`;
    itemSlotsEl.appendChild(empty);
  }
  // initialize draggable handlers for newly rendered items and equip overlays
  makeDraggableInventory();
  setupEquipDroppables();
}


function applyItem(item){
  if(item.type === 'damage') player.damage += item.value;
  else if(item.type === 'speed') player.speed += item.value;
  else if(item.type === 'maxHp'){
    player.maxHp += item.value;
    player.hp += item.value;
  }
  else if(item.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + item.value);
  else if(item.type === 'fireRate') player.fireRate = Math.max(0.05, player.fireRate + item.value);
}


function equipItem(index){
  if(gameOver) return;
  const item = shopItems[index];
  if(!item || score < item.cost) return;
  const slotOrder = ['handR','handL','torso','head','footR','footL'];
  const free = slotOrder.find(s => !equippedItems[s]);
  if(!free) return;
  score -= item.cost;
  applyItem(item);
  equippedItems[free] = item;
  shopItems[index] = null;
  renderShopItems();
  renderEquipSlots();
  updateUI();
}

// Drag & drop support: inventory items -> equip slots
function makeDraggableInventory(){
  const itemButtons = document.querySelectorAll('#item-slots .item-slot');
  itemButtons.forEach((btn, idx) => {
    const button = btn.querySelector('button');
    if(!button) return;
    button.draggable = true;
    button.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', idx);
    });
  });
}

function setupEquipDroppables(){
  const slots = document.querySelectorAll('.equip-slot');
  slots.forEach(s => {
    s.addEventListener('dragover', e => { e.preventDefault(); s.classList.add('drag-over'); });
    s.addEventListener('dragleave', e => { s.classList.remove('drag-over'); });
    s.addEventListener('drop', e => {
      e.preventDefault(); s.classList.remove('drag-over');
      const idx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if(Number.isFinite(idx) && shopItems[idx]){
        const item = shopItems[idx];
        // equip to specific slot if compatible (for now allow all)
        const slotName = s.dataset.slot;
        const slotIndex = equippedItems.findIndex(v => v === null);
        if(slotIndex === -1) return;
        score -= item.cost;
        applyItem(item);
        equippedItems[slotIndex] = item;
        shopItems[idx] = null;
        renderShopItems();
        renderEquipSlots();
        updateUI();
      }
    });
  });
}


function renderEquipSlots(){
  const container = document.getElementById('equip-slots');
  if(!container) return;
  container.innerHTML = '';
  const slots = [
    { id: 'slot-head', name: 'head', label: 'Kopf' },
    { id: 'slot-torso', name: 'torso', label: 'Torso' },
    { id: 'slot-hand-left', name: 'handL', label: 'Hand L' },
    { id: 'slot-hand-right', name: 'handR', label: 'Hand R' },
    { id: 'slot-foot-left', name: 'footL', label: 'Fuß L' },
    { id: 'slot-foot-right', name: 'footR', label: 'Fuß R' }
  ];
  slots.forEach(s => {
    const el = document.createElement('div');
    el.className = 'item-slot';
    const it = equippedItems[s.name];
    if(it){
      el.innerHTML = `<strong>${it.name}</strong><div class="item-desc">${it.desc}</div>`;
      el.dataset.occupied = '1';
    } else {
      el.innerHTML = `<strong>${s.label}</strong><div class="item-desc">Frei</div>`;
      delete el.dataset.occupied;
    }
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', e => {
      e.preventDefault();
      const idx = e.dataTransfer.getData('text/plain');
      tryEquipToSlot(parseInt(idx,10), s.name);
    });
    container.appendChild(el);

    // sync silhouette overlay
    const overlay = document.getElementById(s.id);
    if(overlay){
      if(it){ overlay.dataset.occupied = '1'; overlay.innerHTML = `<small>${it.name.split(' ')[0]}</small>`; }
      else { overlay.removeAttribute('data-occupied'); overlay.innerHTML = ''; }
      overlay.ondragover = e => e.preventDefault();
      overlay.ondrop = e => { e.preventDefault(); const idx = e.dataTransfer.getData('text/plain'); tryEquipToSlot(parseInt(idx,10), s.name); };
    }
  });
}

function tryEquipToSlot(itemIndex, slotName){
  const item = shopItems[itemIndex];
  if(!item) return;
  if(score < item.cost) return;
  if(equippedItems[slotName]) return; // slot occupied
  score -= item.cost;
  applyItem(item);
  equippedItems[slotName] = item;
  shopItems[itemIndex] = null;
  renderShopItems();
  renderEquipSlots();
  updateUI();
}


function findNearestEnemy(){
  let nearest = null;
  let best = Infinity;
  enemies.forEach(e => {
    const d = dist(e, player);
    if(d < best){
      best = d;
      nearest = e;
    }
  });
  return nearest;
}


function openShop(){
  shopOpen = true;
  shopEl.classList.remove('hidden');
  generateShopItems();
  updateButtons();
  renderEquipSlots();
}


function closeShop(){
  shopOpen = false;
  shopTimer = 0;
  shopEl.classList.add('hidden');
}


function updateButtons(){
  const canBuy = score >= 20 && !gameOver;
  buyHealBtn.disabled = !canBuy;
  buySpeedBtn.disabled = !canBuy;
  buyDamageBtn.disabled = !canBuy;
}


function buyUpgrade(type){
  if(gameOver || score < 20) return;
  score -= 20;
  if(type === 'heal'){
    player.hp = Math.min(player.maxHp, player.hp + 20);
  } else if(type === 'speed'){
    player.speed += 20;
  } else if(type === 'damage'){
    player.damage += 6;
  }
  updateUI();
  updateButtons();
}


function updateUI(){
  healthEl.textContent = Math.max(0, Math.round(player.hp));
  scoreEl.textContent = Math.floor(score);
  enemiesEl.textContent = enemies.length;
  nextShopEl.textContent = Math.max(0, Math.ceil(SHOP_INTERVAL - shopTimer));
}


function draw(){
  ctx.clearRect(0, 0, W, H);
  drawGrid();

  bullets.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
  });

  enemies.forEach(e => {
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(225,80,80,0.95)'; ctx.fill();
  });

  ctx.save();
  ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fillStyle = '#79ffe1'; ctx.fill();
  const nearest = findNearestEnemy();
  const ang = nearest ? Math.atan2(nearest.y - player.y, nearest.x - player.x) : Math.atan2(mouse.y - player.y, mouse.x - player.x);
  ctx.beginPath(); ctx.arc(player.x + Math.cos(ang)*7, player.y + Math.sin(ang)*7, 4, 0, Math.PI*2);
  ctx.fillStyle = '#063'; ctx.fill();
  ctx.restore();

  drawHUD();

  if(gameOver){
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '42px system-ui'; ctx.fillText('GAME OVER', W/2, H/2 - 10);
    ctx.font = '18px system-ui'; ctx.fillText('Drücke R für Neustart', W/2, H/2 + 28);
  }
}


function drawGrid(){
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  const size = 80;
  for(let x = 0; x <= W; x += size){ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for(let y = 0; y <= H; y += size){ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}


function drawHUD(){
  const bw = 220; const bh = 16; const bx = 12; const by = H - bh - 12;
  const t = Math.max(0, player.hp / player.maxHp);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(bx-2, by-2, bw+4, bh+4);
  ctx.fillStyle = 'rgba(20,20,30,0.85)'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(bx, by, bw * t, bh);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = '#dbeafe'; ctx.font = '16px system-ui'; ctx.textAlign = 'right'; ctx.fillText('Score: ' + Math.floor(score), W - 12, 26);
}


function update(time){
  const dt = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  if(!gameOver && !shopOpen){
    shopTimer += dt;
    if(shopTimer >= SHOP_INTERVAL){
      openShop();
    }

    spawnTimer += dt;
    if(spawnTimer >= 1.2){
      spawnTimer = 0;
      spawnEnemy();
    }

    if(player.fireCooldown > 0){
      player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    }

    const moveX = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    const moveY = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    const length = Math.hypot(moveX, moveY);
    if(length > 0){
      player.x += (moveX / length) * player.speed * dt;
      player.y += (moveY / length) * player.speed * dt;
    }
    player.x = Math.max(player.r, Math.min(W - player.r, player.x));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y));

    const target = findNearestEnemy();
    const aimAngle = target ? Math.atan2(target.y - player.y, target.x - player.x) : Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if((mouse.down || keys.Space || target) && player.fireCooldown === 0 && target){
      player.fireCooldown = player.fireRate;
      bullets.push({
        x: player.x + Math.cos(aimAngle) * (player.r + 8),
        y: player.y + Math.sin(aimAngle) * (player.r + 8),
        vx: Math.cos(aimAngle) * 520,
        vy: Math.sin(aimAngle) * 520,
        r: 5,
        damage: player.damage,
      });
    }

    bullets = bullets.filter(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      return b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10;
    });

    enemies.forEach(e => {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      e.x += (dx / len) * e.speed * dt;
      e.y += (dy / len) * e.speed * dt;
      e.touchCooldown = Math.max(0, e.touchCooldown - dt);
      if(dist(e, player) < e.r + player.r && e.touchCooldown === 0){
        player.hp -= 18;
        e.touchCooldown = 0.4;
      }
    });

    bullets.forEach((b, bi) => {
      enemies.forEach((e, ei) => {
        if(dist(b, e) < b.r + e.r){
          e.hp -= b.damage;
          bullets.splice(bi, 1);
          if(e.hp <= 0){
            score += 6 + Math.floor(e.r * 0.8);
            enemies.splice(ei, 1);
          }
        }
      });
    });

    enemies = enemies.filter(e => e.hp > 0);

    if(player.hp <= 0){
      player.hp = 0;
      gameOver = true;
      shopEl.classList.add('hidden');
    }
  }

  updateUI();
  draw();
  requestAnimationFrame(update);
}


function init(){
  restartBtn.addEventListener('click', reset);
  buyHealBtn.addEventListener('click', () => buyUpgrade('heal'));
  buySpeedBtn.addEventListener('click', () => buyUpgrade('speed'));
  buyDamageBtn.addEventListener('click', () => buyUpgrade('damage'));
  resumeBtn.addEventListener('click', () => { if(shopOpen){ closeShop(); } });
  toggleInfoBtn.addEventListener('click', () => {
    uiPanel.classList.toggle('ui--hidden');
    toggleInfoBtn.textContent = uiPanel.classList.contains('ui--hidden') ? 'Infos einblenden' : 'Infos ausblenden';
  });
  fullscreenBtn.addEventListener('click', async () => {
    if(document.fullscreenElement){
      await document.exitFullscreen();
      fullscreenBtn.textContent = 'Vollbild';
    } else {
      await document.documentElement.requestFullscreen();
      fullscreenBtn.textContent = 'Fenster';
    }
  });

  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if(e.key === 'r' || e.key === 'R'){ reset(); }
    if(e.key === ' '){ e.preventDefault(); keys.Space = true; }
  });

  window.addEventListener('keyup', e => {
    keys[e.key] = false;
    if(e.key === ' '){ keys.Space = false; }
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  window.addEventListener('mouseup', () => { mouse.down = false; });

  reset();
  requestAnimationFrame(update);
}

window.addEventListener('load', init);

