const tagSelect = document.getElementById("tagSelect");
const gameGrid = document.getElementById("gameGrid");
const showInfoBtn = document.getElementById("showInfoBtn");
const gameInfo = document.getElementById("gameInfo");

let games = [];
let selectedGame = null;

// Spiele vom Backend holen
async function fetchGames(tag = "all") {
  const res = await fetch(`http://localhost:3000/games?tag=${tag}`);
  games = await res.json();
  renderGames();
}

// Spiele anzeigen
function renderGames() {
  gameGrid.innerHTML = "";
  games.forEach(game => {
    const div = document.createElement("div");
    div.className = "game-box";
    div.textContent = game.title;
    div.onclick = () => selectGame(game, div);
    gameGrid.appendChild(div);
  });
}

// Spiel auswählen
function selectGame(game, div) {
  document.querySelectorAll(".game-box").forEach(b => b.classList.remove("selected"));
  div.classList.add("selected");
  selectedGame = game;
}

// Info anzeigen
showInfoBtn.addEventListener("click", () => {
  if (!selectedGame) {
    gameInfo.innerHTML = `
      <h2>Kein Spiel ausgewählt</h2>
      <p>Bitte wähle unten ein Spiel aus.</p>
    `;
    return;
  }

  gameInfo.innerHTML = `
    <h2>${selectedGame.title}</h2>
    <p><strong>Genre:</strong> ${selectedGame.genre}</p>
    <p><strong>Release:</strong> ${selectedGame.release_year}</p>
    <p><strong>Tags:</strong> ${selectedGame.tags}</p>
    <p>${selectedGame.description}</p>
  `;
});

// Dropdown Filter
tagSelect.addEventListener("change", e => {
  fetchGames(e.target.value);
  selectedGame = null;
  gameInfo.innerHTML = `
    <h2>Kein Spiel ausgewählt</h2>
    <p>Bitte wähle unten ein Spiel aus und drücke den Button oben.</p>
  `;
});

// Initialer Aufruf
fetchGames();