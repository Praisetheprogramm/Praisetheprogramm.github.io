// --- Bewertungs-Popup Elemente ---
const ratingPopup = document.getElementById("ratingPopup");
const ratingForm = document.getElementById("ratingForm");
const closeRatingPopup = document.getElementById("closeRatingPopup");
const ratingGameTitle = document.getElementById("ratingGameTitle");
const ratingGameId = document.getElementById("ratingGameId");
const existingRatings = document.getElementById("existingRatings");
const ratingsList = document.getElementById("ratingsList");

let currentGameForRating = null;

// Spiel-Boxen mit Bewertungs-Button rendern
function renderGames(games) {
    console.log(games);
    gameGrid.innerHTML = "";
    
    for (let game of games) {
        const div = document.createElement("div");
        div.className = "game-box";
        
        // Spiel-Titel und Bewertungs-Button
        div.innerHTML = `
            <div class="game-title">${game.title}</div>
            <button class="rate-btn" onclick="event.stopPropagation(); openRatingPopup(${game.game_id}, '${game.title}')">
                ★ Bewerten
            </button>
        `;
        
        div.onclick = () => selectGame(game, div);
        gameGrid.appendChild(div);
        
        // Durchschnittsbewertung laden und anzeigen
        loadAverageRating(game.game_id, div);
    }
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
    
    const formData = new FormData(ratingForm);
    const ratingData = {
        game_id: currentGameForRating,
        rating: parseInt(formData.get("rating")),
        comment: formData.get("comment")
    };
    
    try {
        const res = await fetch("/rating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ratingData)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert("Bewertung erfolgreich abgegeben!");
            ratingPopup.style.display = "none";
            
            // Spiel-Liste neu laden um aktualisierte Bewertungen anzuzeigen
            fetchGames(tagSelect.value);
        } else {
            alert(data.error || "Fehler beim Speichern der Bewertung");
        }
    } catch (error) {
        console.error("Fehler:", error);
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