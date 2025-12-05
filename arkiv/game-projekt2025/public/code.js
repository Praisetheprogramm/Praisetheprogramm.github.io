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
 12: "images/Metal_Gear_Solit3.jpg",
 13: "images/DBD.jpg",
 14: "images/RDR2.png",
 15: "images/Eldenring.jpg",
 16: "images/Eldenringshadowoftheearthtree.jpg",
 17: "images/Expedition-33.png",
 18: "images/baldurs-gate-3.jpeg",
 19: "images/phasmophobia.jpg",
 20: "images/resident-evil-3.jpg",
 21: "images/oxygen-not-included.jpg",
 22: "images/Dispatch.jpg"
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
      <p><strong>Release:</strong> ${selectedGame.created_at || selectedGame.year || "Unbekannt"}</p>
      <p><strong>Developer:</strong> ${selectedGame.developer ||"Unknown"}</p>
      <p><strong>Tags:</strong> ${selectedGame.gametag_id || "Keine"}</p>
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`); //error z.B. "HTTP 404: Not Found"
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
      // Ensure positioned container so absolute children (link button) can be placed bottom-left
      div.style.position = 'relative';

      // Set data attribute for game id to allow linking between boxes
      const gameId = game.game_id || game.id || game.gameId;
      if (gameId !== undefined) div.setAttribute('data-game-id', String(gameId));

      // Hintergrundbild aus Mapping setzen
      if (gameBackgrounds[game.game_id]) {
        div.style.backgroundImage = `url('${gameBackgrounds[game.game_id]}')`;
        div.style.backgroundSize = "cover";

  // Öffnet ein Popup mit den verlinkten Spielen (Array von {id,label,found,gameObj})
  function openLinkedGamesPopup(linkedGames) {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'linked-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    });

    const popup = document.createElement('div');
      popup.className = 'linked-popup';
      Object.assign(popup.style, {
        background: 'rgba(0,0,0,0.85)', padding: '16px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '80%', overflow: 'auto', color: '#fff'
      });

    const title = document.createElement('h3');
    title.textContent = 'Linked games';
      title.style.color = '#fff';
      popup.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'linked-grid';
    Object.assign(grid.style, { display: 'flex', gap: '12px', flexWrap: 'wrap' });

    linkedGames.forEach(link => {
      // Try to use the actual game object if available
      const targetGame = link.gameObj || games.find(g => (g.game_id || g.id || g.gameId) == link.id) || null;

      // Create a small game-box that mirrors the main grid markup
      const tile = document.createElement('div');
      tile.className = 'game-box linked-mini';
      const targetId = link.id;
      tile.setAttribute('data-game-id', String(targetId));

      // Background if available
      const previewId = (targetGame && (targetGame.game_id || targetGame.id || targetGame.gameId)) || link.id;
      if (gameBackgrounds[previewId]) {
        tile.style.backgroundImage = `url('${gameBackgrounds[previewId]}')`;
        tile.style.backgroundSize = 'cover';
          tile.style.backgroundPosition = 'center';
          tile.style.border = '1px solid rgba(255,255,255,0.12)';
          tile.style.color = '#fff';
      }

      // Inner HTML: title + rate button (same as main grid)
      const titleText = (targetGame && (targetGame.title || targetGame.name)) || link.label || `Game ${link.id}`;
      tile.innerHTML = `
        <div class="game-title">${titleText}</div>
        <button class="rate-btn rate-btn-corner" onclick="event.stopPropagation(); openRatingPopup(${targetId}, '${titleText.replace("'","\'")}')">
          ★ Bewerten
        </button>
      `;

      // click selects the game on main page
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        const tg = targetGame || games.find(g => (g.game_id || g.id || g.gameId) == targetId);
        if (tg) {
          const td = document.querySelector(`.game-box[data-game-id="${targetId}"]`);
          if (td) {
            selectGame(tg, td);
            td.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (overlay.parentNode) document.body.removeChild(overlay);
            return;
          }
        }
        // reload and try later
        fetchGames();
        setTimeout(() => {
          const td = document.querySelector(`.game-box[data-game-id="${targetId}"]`);
          const tg2 = games.find(g => (g.game_id || g.id || g.gameId) == targetId);
          if (td && tg2) selectGame(tg2, td);
          if (overlay.parentNode) document.body.removeChild(overlay);
        }, 400);
      });

      grid.appendChild(tile);
    });

    popup.appendChild(grid);

    const close = document.createElement('button');
    close.textContent = 'Close';
      Object.assign(close.style, { marginTop: '12px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' });
    close.addEventListener('click', () => { if (overlay.parentNode) document.body.removeChild(overlay); });
    popup.appendChild(close);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }
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

        // Optional: create a link button if this game links to other games (e.g. DLC -> base game)
        // The linked id(s) can come from fields like `links` (array), or `linked_game_id` / `related_game_id` / `link_to`.
        (function maybeAddLink() {
          // Build an array of link descriptors: { id, label }
          let linkDescriptors = [];
          if (Array.isArray(game.links) && game.links.length > 0) {
            linkDescriptors = game.links.map(l => ({ id: l.linked_game_id || l.linked_game || l.linkedTo, label: l.label || l.relation || undefined }));
          } else {
            const linkedId = game.linked_game_id || game.related_game_id || game.link_to || game.linkedTo;
            if (linkedId) linkDescriptors.push({ id: linkedId, label: game.link_label });
          }
          if (linkDescriptors.length === 0) return;

          const linkBtn = document.createElement('button');
          linkBtn.className = 'link-btn';
          linkBtn.textContent = linkDescriptors.length === 1 ? (linkDescriptors[0].label || 'Linked') : (game.link_label || 'Linked games');
          linkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Prepare array of linked game objects (may be missing from current `games` list)
            const linkedGames = linkDescriptors.map(d => {
              const found = games.find(g => (g.game_id || g.id || g.gameId) == d.id);
              return {
                id: d.id,
                label: d.label || (found && (found.title || found.name)) || `Game ${d.id}`,
                found: !!found,
                gameObj: found || null
              };
            });
            openLinkedGamesPopup(linkedGames);
          });

          const wrapper = document.createElement('div');
          wrapper.className = 'link-btn-wrapper';
          Object.assign(wrapper.style, { position: 'absolute', left: '8px', bottom: '8px', zIndex: 10 });
          // Make the button compact for the corner
          Object.assign(linkBtn.style, { padding: '6px 8px', fontSize: '12px' });
          wrapper.appendChild(linkBtn);
          div.appendChild(wrapper);
        })();

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