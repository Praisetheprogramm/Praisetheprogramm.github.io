const expr = document.getElementById('expr');
const result = document.getElementById('result');
const evalBtn = document.getElementById('eval');
const clearBtn = document.getElementById('clear');
const ansBtn = document.getElementById('ans');
const degRadBtn = document.getElementById('degRad');
const historyEl = document.getElementById('history');
const pad = document.getElementById('pad');

let memory = 0;
let angleMode = 'rad';
const history = [];

function showResult(v){ result.textContent = String(v); }
function showError(e){ result.textContent = 'Error: '+e.message; }

function addHistory(exprText, value){ history.unshift({expr:exprText, value}); renderHistory(); }
function renderHistory(){ historyEl.innerHTML = ''; history.forEach((h, i)=>{
  const li = document.createElement('li'); li.textContent = `${h.expr} = ${h.value}`; li.addEventListener('click', ()=>{ expr.value = h.expr; expr.focus(); }); historyEl.appendChild(li);
}); }

function createParser(){ const p = math.parser(); // expose constants
 p.set('pi', Math.PI); p.set('e', Math.E); p.set('i', math.complex(0,1)); p.set('ans', memory);
 if(angleMode === 'deg'){
   p.set('sin', x => math.sin(x * Math.PI/180));
   p.set('cos', x => math.cos(x * Math.PI/180));
   p.set('tan', x => math.tan(x * Math.PI/180));
 }
 return p;
}

function evaluateExpression(){ const text = expr.value.trim(); if(!text) return; try{
  const p = createParser(); const res = p.evaluate(text);
  memory = res; showResult(res); addHistory(text, res);
 }catch(e){ showError(e); }
}

// events
evalBtn.addEventListener('click', evaluateExpression);
clearBtn.addEventListener('click', ()=>{ expr.value = ''; result.textContent = ''; expr.focus(); });
ansBtn.addEventListener('click', ()=>{ expr.value += ' ans'; expr.focus(); });
degRadBtn.addEventListener('click', ()=>{ angleMode = angleMode==='rad'?'deg':'rad'; degRadBtn.textContent = angleMode.toUpperCase(); expr.focus(); });

expr.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); evaluateExpression(); } });

pad.addEventListener('click', (e)=>{ if(e.target.matches('button')){ const t = e.target.textContent; if(t.length===1 && /[0-9.()+\-*/^]/.test(t)){ expr.value += t; } else { expr.value += t + (/[a-z]/i.test(t)?'(':''); }
 expr.focus(); } });

// init
degRadBtn.textContent = angleMode.toUpperCase(); expr.focus(); renderHistory();
