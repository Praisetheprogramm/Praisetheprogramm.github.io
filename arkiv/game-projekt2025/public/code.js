const tagSelect = document.getElementById("tagSelect");
const gameGrid = document.getElementById("gameGrid");
const showInfoBtn = document.getElementById("showInfoBtn");
const gameInfo = document.getElementById("gameInfo");
// --- Popup Elemente ---
const popup = document.getElementById("addGamePopup");
const openAddGameBtn = document.getElementById("openAddGameBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const addGameForm = document.getElementById("addGameForm");


let games = [];
let selectedGame = null;

// Spiele vom Backend holen (mit optionalem Tag-Filter)
async function fetchGames(tag = "") {
  let url = "/games";
  if (tag && tag !== "all") url += `?tag=${encodeURIComponent(tag)}`;

  const res = await fetch(url);
  games = await res.json();
  renderGames(games);
}

// Spiele anzeigen
function renderGames(games) {
  console.log(games);
  gameGrid.innerHTML="";
  for (let game of games) {
    const div = document.createElement("div");
    div.className = "game-box";
    div.textContent = game.title;
    div.onclick = () => selectGame(game, div);
    gameGrid.appendChild(div);
  }
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

// Dropdown Filter aktivieren
tagSelect.addEventListener("change", e => {
  const selectedTag = e.target.value;
  fetchGames(selectedTag); // ruft nur Spiele mit Tag ab
  selectedGame = null;

  gameInfo.innerHTML = `
    <h2>Kein Spiel ausgewählt</h2>
    <p>Bitte wähle unten ein Spiel aus und drücke den Button oben.</p>
  `;
});

// async function loadTag1() {
//   const res = await fetch("/games/byTag/1");
//   const games = await res.json();

//   const resultDiv = document.getElementById("result");
//   resultDiv.innerHTML = "";

//   games.forEach(game => {
//     const div = document.createElement("div");
//     div.innerHTML = `
//       <h3>${game.title}</h3>
//       <img src="${game.Logo}" width="120">
//       <p>Tag ID: ${game.tag_id}</p>
//       <hr>
//     `;
//     resultDiv.appendChild(div);
//   });
// }

// Initialer Aufruf
fetchGames();

// Popup öffnen
openAddGameBtn.addEventListener("click", () => {
  popup.style.display = "flex";
});


// Popup schließen
closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});


// // Game speichern
addGameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addGameForm);

  const newGame = { 
    title: formData.get("title"),
    tags: formData.get("tags"),
    description: formData.get("description"),
    developer: formData.get("developer"),
    created_at: new Date().toISOString(),
    // Logo: formData.get("Logo")
  };
  console.log(newGame)
  const res = await fetch("/leggtilgame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newGame)
  });


  // const data = await res.json();
  // console.log("SERVER:", data);

  // // Popup schließen
  // popup.style.display = "none";

  // // Formular resetten
  // addGameForm.reset();
  // // Liste neu laden
  // fetchGames();
});

  tagSelect.addEventListener("change", async (e) => {
  const tagId = e.target.value;
  console.log("tagId="+tagId)

  if (tagId === "all") {
    fetchGames();
    return;
  }

  const res = await fetch(`/games/byTag/${tagId}`);
  const games = await res.json();
  renderGames(games);
});