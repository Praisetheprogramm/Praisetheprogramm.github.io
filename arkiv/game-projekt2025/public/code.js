const tagSelect = document.getElementById("tagSelect");
const gameGrid = document.getElementById("gameGrid");
const showInfoBtn = document.getElementById("showInfoBtn");
const gameInfo = document.getElementById("gameInfo");
// Hintergrund-Bilder Mapping
const gameBackgrounds = {
  1: "images/Hollow_Knight.jpg",
  2: "images/Skyrim.jpg",
  3: "images/helldivers2.jpg",
  4: "images/Silksong.jpg",
  5: "images/Cyberpunk2077.jpg",
  6: "images/Borderlands4.jpg",
  7: "images/Portal2.png",
  8: "images/CS2.jpeg",
  9: "images/Minecraft.png",
 10: "images/TotalwarWarhammer3.jpg",
 11: "images/Valorant.png",
 12: "images/Metal_Gear_Solit3.jpg"
};

// --- Popup Elemente ---
const popup = document.getElementById("addGamePopup");
const openAddGameBtn = document.getElementById("openAddGameBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const addGameForm = document.getElementById("addGameForm");
// --- Bewertungs-Popup Elemente ---
const ratingPopup = document.getElementById("ratingPopup");
const ratingForm = document.getElementById("ratingForm");
const closeRatingPopup = document.getElementById("closeRatingPopup");
const ratingGameTitle = document.getElementById("ratingGameTitle");
const ratingGameId = document.getElementById("ratingGameId");
const existingRatings = document.getElementById("existingRatings");
const ratingsList = document.getElementById("ratingsList");

// --- Tags Akkordeon Elemente ---
const tagsHeaderBtn = document.getElementById("tagsHeaderBtn");
const tagsDropdown = document.getElementById("tagsDropdown");
const tagsArrow = document.querySelector(".tags-arrow");
const tagsCount = document.querySelector(".tags-count");
const tagCheckboxes = document.querySelectorAll('.tag-checkbox input[type="checkbox"]');
const MAX_TAGS = 4;

// Tag Akkordeon Toggle
tagsHeaderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = tagsDropdown.style.display !== "none";
    tagsDropdown.style.display = isOpen ? "none" : "block";
    tagsArrow.classList.toggle("open", !isOpen);
});

// Funktion zum Aktualisieren des Counters
function updateTagCount() {
    const checkedCount = document.querySelectorAll('.tag-checkbox input[type="checkbox"]:checked').length;
    tagsCount.textContent = `(${checkedCount} ausgewählt)`;
}

// Popup öffnen - Tags zurücksetzen
openAddGameBtn.addEventListener("click", () => {
    popup.style.display = "flex";
    tagsDropdown.style.display = "none";
    tagsArrow.classList.remove("open");
    tagCheckboxes.forEach(cb => cb.checked = false);
    updateTagCount();
});

let currentGameForRating = null;

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

showInfoBtn.addEventListener("click", async () => {
  console.log("selectedGame Object:", selectedGame); // Debug-Ausgabe
  console.log("selectedGame Keys:", Object.keys(selectedGame || {})); // Welche Eigenschaften hat es?
  
  if (!selectedGame) {
    gameInfo.innerHTML = `
      <h2>Kein Spiel ausgewählt</h2>
      <p>Bitte wähle unten ein Spiel aus.</p>
    `;
    return;
  }

  try {
    // Grundlegende Spielinfo mit Prüfung
    gameInfo.innerHTML = `
      <h2>${selectedGame.title || selectedGame.name || "Unbekannter Titel"}</h2>
      <p><strong>Genre:</strong> ${selectedGame.genre || "Nicht angegeben"}</p>
      <p><strong>Release:</strong> ${selectedGame.release_year || selectedGame.year || "Unbekannt"}</p>
      <p><strong>Tags:</strong> ${selectedGame.tags || "Keine"}</p>
      <p>${selectedGame.description || "Keine Beschreibung verfügbar"}</p>
      
      <h3 style="margin-top: 20px;">Bewertungen:</h3>
      <div id="ratings-display"></div>
    `;

    // Prüfe die Game-ID
    const gameId = selectedGame.id || selectedGame.game_id || selectedGame.gameId;
    console.log("Game ID für API Call:", gameId);
    
    if (!gameId) {
      document.getElementById("ratings-display").innerHTML = 
        "<p style='color: orange;'>Keine Game-ID gefunden</p>";
      return;
    }

    // Ratings laden
    const response = await fetch(`/ratings/${gameId}`);
    console.log("Response Status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const ratings = await response.json();
    console.log("Ratings Daten:", ratings);
    
    const ratingsDisplay = document.getElementById("ratings-display");
    
    if (!ratings || ratings.length === 0) {
      ratingsDisplay.innerHTML = "<p>Noch keine Bewertungen vorhanden.</p>";
      return;
    }
    
    // Alle Ratings anzeigen
    ratingsDisplay.innerHTML = ratings.map(rating => `
      <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
        <div>
          <strong>Bewertung:</strong> ${rating.rating}/10
          ${[1,2,3,4,5,6,7,8,9,10].map(star => 
            star <= rating.rating ? '★' : '☆'
          ).join('')}
        </div>
        ${rating.comment ? `
          <div style="margin-top: 5px;">
            <strong>Kommentar:</strong> ${rating.comment}
          </div>
        ` : ''}
        <div style="margin-top: 5px; font-size: 12px; color: #666;">
          <strong>Erstellt am:</strong> ${new Date(rating.created_at).toLocaleDateString('de-DE')}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error("Detailierter Fehler:", error);
    gameInfo.innerHTML += `<p style="color: red;">Fehler beim Laden der Bewertungen: ${error.message}</p>`;
  }
});
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

  // Mehrere Tags von den Checkboxen auslesen
  const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox input[type="checkbox"]:checked'))
    .map(cb => parseInt(cb.value));

  if (selectedTags.length === 0) {
    alert("Bitte wähle mindestens ein Tag aus!");
    return;
  }

  const formData = new FormData(addGameForm);

  const newGame = { 
    title: formData.get("title"),
    tags: selectedTags, // Array!
    description: formData.get("description"),
    developer: formData.get("developer"),
    created_at: new Date().toISOString()
  };

  console.log("newGame", newGame);

  const res = await fetch("/leggtilgame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // falls diese Route Sessions benötigt: Cookie mitsenden
    credentials: 'same-origin',
    body: JSON.stringify(newGame)
  });

  const data = await res.json();
  console.log("SERVER:", data);

  popup.style.display = "none";
  addGameForm.reset();
  fetchGames();
});

// Checkbox Event Listener für Max 4 Tags Limit
tagCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
        const checkedCount = document.querySelectorAll('.tag-checkbox input[type="checkbox"]:checked').length;
        
        // Wenn bereits 4 Tags ausgewählt sind, weitere können nicht ausgewählt werden
        if (checkedCount > MAX_TAGS) {
            checkbox.checked = false;
        }
        
        // Counter aktualisieren
        updateTagCount();
    });
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

// Spiel-Boxen mit Bewertungs-Button rendern
function renderGames(games) {
    console.log(games);
    gameGrid.innerHTML = "";
    
    for (let game of games) {
      const div = document.createElement("div");
      div.className = "game-box";

      // Hintergrundbild aus Mapping setzen
      if (gameBackgrounds[game.game_id]) {
        div.style.backgroundImage = `url('${gameBackgrounds[game.game_id]}')`;
        div.style.backgroundSize = "cover";
        div.style.backgroundPosition = "center";
      }

      // Spiel-Titel und Bewertungs-Button
        div.innerHTML = `
          <div class="game-title">${game.title}</div>
          <button class="rate-btn rate-btn-corner" onclick="event.stopPropagation(); openRatingPopup(${game.game_id}, '${game.title}')">
            ★ Bewerten
          </button>
        `;
        
        div.onclick = () => selectGame(game, div);
        gameGrid.appendChild(div);
        
        // Durchschnittsbewertung laden und anzeigen
        loadAverageRating(game.game_id, div);
    }
}// Durchschnittsbewertung laden
async function loadAverageRating(gameId, gameElement) {
    try {
        const res = await fetch(`/ratings/average/${gameId}`);
        const data = await res.json();
        
        if (data.count > 0) {
            const avgRating = parseFloat(data.average).toFixed(1);
            const ratingElement = document.createElement("div");
            ratingElement.className = "average-rating";
            ratingElement.innerHTML = `★ ${avgRating} (${data.count} Bewertungen)`;
            gameElement.appendChild(ratingElement);
        }
    } catch (error) {
        console.error("Fehler beim Laden der Bewertungen:", error);
    }
}

// Bewertungs-Popup öffnen
async function openRatingPopup(gameId, gameTitle) {
    currentGameForRating = gameId;
    ratingGameId.value = gameId;
    ratingGameTitle.textContent = `${gameTitle} bewerten`;
    
    // Formular zurücksetzen
    ratingForm.reset();
    
    // Vorhandene Bewertungen laden
    await loadExistingRatings(gameId);
    
    // Popup anzeigen
    ratingPopup.style.display = "flex";
}

// Vorhandene Bewertungen laden
async function loadExistingRatings(gameId) {
    try {
        const res = await fetch(`/ratings/${gameId}`);
        const ratings = await res.json();
        
        if (ratings.length > 0) {
            ratingsList.innerHTML = "";
            ratings.forEach(rating => {
                const ratingDiv = document.createElement("div");
                ratingDiv.className = "rating-item";
                ratingDiv.innerHTML = `
                    <strong>${rating.username}</strong>: ★ ${rating.rating}/10
                    <br><em>${rating.comment || 'Kein Kommentar'}</em>
                    <small> - ${new Date(rating.created_at).toLocaleDateString()}</small>
                    <hr>
                `;
                ratingsList.appendChild(ratingDiv);
            });
            existingRatings.style.display = "block";
        } else {
            existingRatings.style.display = "none";
        }
    } catch (error) {
        console.error("Fehler beim Laden der Bewertungen:", error);
        existingRatings.style.display = "none";
    }
}

// Bewertung absenden
ratingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    console.log("Bewertung wird abgesendet...");
    
    const formData = new FormData(ratingForm);
    const ratingData = {
        game_id: currentGameForRating,
        rating: parseInt(formData.get("rating")),
        comment: formData.get("comment")
    };
    
    console.log("Rating Data:", ratingData);
    
    try {
        const res = await fetch("/rating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(ratingData)
        });
        
        console.log("Response Status:", res.status);
        console.log("Response OK:", res.ok);
        
        const data = await res.json();
        console.log("Response Data:", data);
        
        if (res.ok) {
            alert("Bewertung erfolgreich abgegeben!");
            ratingPopup.style.display = "none";
            fetchGames(tagSelect.value);
        } else {
            alert(data.error || "Fehler beim Speichern der Bewertung");
        }
        
    } catch (error) {
        console.error("Detailierter Fehler:", error);
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        
        alert("Netzwerkfehler - bitte versuche es erneut");
    }
});

// Bewertungs-Popup schließen
closeRatingPopup.addEventListener("click", () => {
    ratingPopup.style.display = "none";
});

// Popup schließen bei Klick außerhalb
ratingPopup.addEventListener("click", (e) => {
    if (e.target === ratingPopup) {
        ratingPopup.style.display = "none";
    }
});

 // JavaScript für loginbutton
 document.getElementById("btnlogin").addEventListener("click", function() {
  window.location.href = "/login.html";
});

 // JavaScript für unique games button
 document.getElementById("btnUniqueGames").addEventListener("click", function() {
  window.location.href = "/our_unique_games.html";
});