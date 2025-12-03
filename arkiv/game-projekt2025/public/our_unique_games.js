const gameGrid = document.getElementById("gameGrid");
const ratingPopup = document.getElementById("ratingPopup");
const ratingForm = document.getElementById("ratingForm");
const closeRatingPopup = document.getElementById("closeRatingPopup");
const ratingGameTitle = document.getElementById("ratingGameTitle");
const ratingGameId = document.getElementById("ratingGameId");

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
 11: "images/Valorant.png"
};

let currentGameForRating = null;
let games = [];
let selectedGame = null;

// Spiele vom Backend holen
async function fetchUniqueGames() {
  try {
    const res = await fetch("/unique-games");
    games = await res.json();
    renderGames(games);
  } catch (error) {
    console.error("Fehler beim Laden der Spiele:", error);
    gameGrid.innerHTML = "<p>Fehler beim Laden der Spiele</p>";
  }
}

// Spiel-Boxen rendern
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
        
      // Klick-Handler: Wenn Spore, öffne index.html im Spore-Ordner, sonst normales Verhalten
      div.onclick = () => {
        if (game.title.toLowerCase() === "spore") {
          window.location.href = "../spore/index.html";
        } else {
          selectGame(game, div);
        }
      };
      gameGrid.appendChild(div);
      
      // Durchschnittsbewertung laden und anzeigen
      loadAverageRating(game.game_id, div);
    }
}

// Spiel auswählen
function selectGame(game, div) {
  document.querySelectorAll(".game-box").forEach(b => b.classList.remove("selected"));
  div.classList.add("selected");
  selectedGame = game;
}

// Durchschnittsbewertung laden
async function loadAverageRating(gameId, gameElement) {
    try {
        const res = await fetch(`/ratings/average/${gameId}`);
        const data = await res.json();
        
        if (data.count > 0) {
            const avgRating = parseFloat(data.average).toFixed(1);
            const ratingElement = document.createElement("div");
            ratingElement.className = "average-rating";
            ratingElement.textContent = `★ ${avgRating} (${data.count})`;
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
        
        const ratingsList = document.getElementById("ratingsList");
        const existingRatings = document.getElementById("existingRatings");
        
        if (!ratings || ratings.length === 0) {
            existingRatings.style.display = "none";
            return;
        }
        
        existingRatings.style.display = "block";
        ratingsList.innerHTML = ratings.map(rating => `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <div><strong>Bewertung:</strong> ${rating.rating}/10</div>
                ${rating.comment ? `<div><strong>Kommentar:</strong> ${rating.comment}</div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error("Fehler beim Laden der Bewertungen:", error);
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
            credentials: 'same-origin',
            body: JSON.stringify(ratingData)
        });
        
        if (!res.ok) {
            const error = await res.json();
            alert(error.error || "Fehler beim Speichern der Bewertung");
            return;
        }
        
        const result = await res.json();
        console.log("Bewertung gespeichert:", result);
        alert("Bewertung erfolgreich gespeichert!");
        ratingPopup.style.display = "none";
        
        // Spiele neu laden
        fetchUniqueGames();
    } catch (error) {
        console.error("Fehler:", error);
        alert("Fehler beim Absenden der Bewertung");
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

// Zurück-Button
document.getElementById("btnBack").addEventListener("click", function() {
  window.location.href = "/";
});

// Login-Button
document.getElementById("btnlogin").addEventListener("click", function() {
  window.location.href = "/login.html";
});

// Initialer Aufruf
fetchUniqueGames();
