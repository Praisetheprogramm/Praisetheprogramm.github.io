async function postJson(url, body) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (error) {
        console.error("Network error:", error);
        return { ok: false, status: 0, data: { error: "Netzwerkfehler" } };
    }
}

const tagSelect = document.getElementById("tagSelect");
const gameGrid = document.getElementById("gameGrid");
const showInfoBtn = document.getElementById("showInfoBtn");
const gameInfo = document.getElementById("gameInfo");

// Login-Status
let isLoggedIn = false;

// Prüfe beim Laden, ob der User eingeloggt ist
async function checkLoginStatus() {
    try {
        const res = await fetch("/api/me");
        
        // Fehlerbehandlung: Prüfe ob Response OK ist
        if (!res.ok) {
            console.error("API Fehler:", res.status);
            isLoggedIn = false;
            return;
        }
        
        const data = await res.json();
        isLoggedIn = data.loggedIn;
        
        // Buttons entsprechend aktivieren/deaktivieren
        updateButtonStates();
    } catch (error) {
        console.error("Fehler beim Prüfen des Login-Status:", error);
        isLoggedIn = false;
    }
}

// Buttons aktivieren/deaktivieren basierend auf Login-Status
function updateButtonStates() {
    const openAddGameBtn = document.getElementById("openAddGameBtn");
    if (openAddGameBtn) {
        if (isLoggedIn) {
            openAddGameBtn.disabled = false;
            openAddGameBtn.title = "Neues Game hinzufügen";
        } else {
            openAddGameBtn.disabled = true;
            openAddGameBtn.title = "Bitte melden Sie sich an, um Spiele hinzuzufügen";
        }
    }
}

// Hintergrund-Bilder Mapping
let gameBackgrounds = {
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
 22: "images/Dispatch.jpg",
 23: "images/Totalwar-Warhammer-2.jpg",
 24: "images/METAL-GEAR-SOLID-Δ.avif",
 25: "images/Arc-raider.jpg",
 26: "images/escape-from-tarkov.jpg",
 27: "images/delta-force.jpg",
 28: "images/Darksouls3.jpg",
 29: "images/seaofthieves.png",
 30: "images/apexlegens.jpg",
 31: "images/TailsofIrone2.png"
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

// Neue Variable für das herein gezogene Bild
let draggedImageFile = null;

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

// Funktion zur Initialisierung der Drop-Zone
function initializeDropZone() {
    // Entferne bestehende Drop-Zone, falls vorhanden
    const existingDropZone = document.getElementById("imageDropZone");
    if (existingDropZone) existingDropZone.remove();
    
    // Erstelle eine neue Drop-Zone
    const dropZone = document.createElement("div");
    dropZone.id = "imageDropZone";
    dropZone.style.cssText = `
        border: 2px dashed #ccc;
        padding: 20px;
        margin: 10px 0;
        text-align: center;
        background-color: #f9f9f9;
        cursor: pointer;
        transition: border-color 0.3s;
    `;
    dropZone.textContent = "Bild hier hineinziehen oder klicken, um auszuwählen";
    
    // Eingabe-Element für Fallback (Klick zum Auswählen)
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    dropZone.appendChild(fileInput);
    
    // Event-Listener für Drag-and-Drop
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#007bff";
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "#ccc";
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#ccc";
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith("image/")) {
            draggedImageFile = files[0];
            dropZone.textContent = `Bild ausgewählt: ${draggedImageFile.name}`;
            dropZone.style.backgroundColor = "#e9f7e9";
        } else {
            alert("Bitte nur Bilddateien hereinziehen!");
        }
    });
    
    // Fallback: Klick zum Auswählen
    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            draggedImageFile = e.target.files[0];
            dropZone.textContent = `Bild ausgewählt: ${draggedImageFile.name}`;
            dropZone.style.backgroundColor = "#e9f7e9";
        }
    });
    
    // Füge die Drop-Zone zum Formular hinzu (z.B. vor dem Submit-Button)
    const submitBtn = addGameForm.querySelector('button[type="submit"]');
    addGameForm.insertBefore(dropZone, submitBtn);

    // Lade Tags hartcodiert
    loadTagsForForm();
}

// Funktion zum Laden der Tags für das Formular
function loadTagsForForm() {
    const tags = [
        { tag_id: 1, name: "RPG" },
        { tag_id: 2, name: "Horror" },
        { tag_id: 3, name: "3D" },
        { tag_id: 4, name: "2D" },
        { tag_id: 5, name: "Action" },
        { tag_id: 6, name: "Strategy" },
        { tag_id: 7, name: "Open-World" },
        { tag_id: 8, name: "Jump and Run" },
        { tag_id: 9, name: "Competitive" },
        { tag_id: 10, name: "Multiplayer" },
        { tag_id: 11, name: "Singelplayer" },
        { tag_id: 12, name: "Extraktions-Shooter" },
        { tag_id: 13, name: "Building Game" },
        { tag_id: 14, name: "Souls Like" },
        { tag_id: 15, name: "Card Game" }
    ];
    
    const tagsDropdown = document.getElementById("tagsDropdown");
    // Entferne bestehende Checkboxen
    const existingCheckboxes = tagsDropdown.querySelectorAll('.tag-checkbox');
    existingCheckboxes.forEach(cb => cb.remove());
    
    // Füge neue Checkboxen hinzu
    tags.forEach(tag => {
        const div = document.createElement("div");
        div.className = "tag-checkbox";
        div.innerHTML = `
            <input type="checkbox" name="tags[]" value="${tag.tag_id}" id="tag${tag.tag_id}">
            <label for="tag${tag.tag_id}">${tag.name}</label>
        `;
        tagsDropdown.appendChild(div);
    });

    // Event-Listener für Checkboxen hinzufügen
    const checkboxes = tagsDropdown.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateSelectedCount);
    });

    // Initial Anzahl aktualisieren
    updateSelectedCount();
}

// Funktion zur Aktualisierung der Anzahl ausgewählter Tags
function updateSelectedCount() {
    const tagsDropdown = document.getElementById("tagsDropdown");
    const count = tagsDropdown.querySelectorAll('input[type="checkbox"]:checked').length;
    const countSpan = document.querySelector('.tags-count');
    if (countSpan) {
        countSpan.textContent = `(${count} ausgewählt)`;
    }
}

// Popup öffnen - Tags zurücksetzen und Drop-Zone initialisieren
openAddGameBtn.addEventListener("click", async () => {
    // Prüfe Login-Status erneut
    await checkLoginStatus();
    
    if (!isLoggedIn) {
        alert("Bitte melden Sie sich an, um Spiele hinzuzufügen!");
        loginPopup.style.display = "flex";
        formArea.style.display = "block";
        registerArea.style.display = "none";
        formTitle.textContent = "Anmelden";
        clearErrors();
        return;
    }
    popup.style.display = "flex";
    tagsDropdown.style.display = "none";
    tagsArrow.classList.remove("open");
    tagCheckboxes.forEach(cb => cb.checked = false);
    updateTagCount();
    
    // Drop-Zone dynamisch hinzufügen oder zurücksetzen
    initializeDropZone();
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
  
  // Aktualisiere gameBackgrounds mit den Bildpfaden aus den Daten
  games.forEach(game => {
    const gameId = game.game_id || game.id;
    if (game.image_path) {
      gameBackgrounds[gameId] = 'images/' + game.image_path;
    }
  });
  
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
          <strong>User:</strong> ${rating.username}
        </div>
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
checkLoginStatus();
fetchGames();


// Popup schließen
closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});


// // Game speichern (angepasst für FormData und Bild-Upload)
addGameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Mehrere Tags von den Checkboxen auslesen
  const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox input[type="checkbox"]:checked'))
    .map(cb => parseInt(cb.value));

  if (selectedTags.length === 0) {
    alert("Bitte wähle mindestens ein Tag aus!");
    return;
  }

  // FormData erstellen (unterstützt Dateien)
  const formData = new FormData(addGameForm);
  formData.append("created_at", new Date().toISOString());
  
  // Bild hinzufügen, falls vorhanden
  if (draggedImageFile) {
    formData.append("image", draggedImageFile);
  }

  console.log("FormData:", formData);

  try {
    const res = await fetch("/leggtilgame", {
      method: "POST",
      credentials: 'same-origin',
      body: formData // Keine Headers nötig, FormData setzt Content-Type automatisch
    });

    const data = await res.json();
    console.log("SERVER:", data);

    if (res.ok) {
      popup.style.display = "none";
      addGameForm.reset();
      draggedImageFile = null; // Zurücksetzen
      fetchGames(); // Aktualisiere die Liste und gameBackgrounds
    } else {
      alert(data.error || "Fehler beim Speichern des Spiels");
    }
  } catch (error) {
    console.error("Netzwerkfehler beim Speichern:", error);
    alert("Netzwerkfehler: " + error.message);
  }
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
    console.log("Rendering games:", games.length);
    gameGrid.innerHTML = "";
    
    for (let game of games) {
      const div = document.createElement("div");
      div.className = "game-box";
      // Ensure positioned container so absolute children (link button) can be placed bottom-left
      div.style.position = 'relative';

      // Set data attribute for game id to allow linking between boxes
      const gameId = game.game_id || game.id || game.gameId;
      if (gameId !== undefined) div.setAttribute('data-game-id', String(gameId));

      // Hintergrundbild aus Mapping oder direkt aus game.image_path setzen
      const bgImage = gameBackgrounds[game.game_id] || (game.image_path ? 'images/' + game.image_path : null);
      if (bgImage) {
        div.style.backgroundImage = `url('${bgImage}')`;
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
          console.log("Checking game:", game.title, "linked_game_id:", game.linked_game_id);
          // Build an array of link descriptors: { id, label }
          let linkDescriptors = [];
          if (Array.isArray(game.links) && game.links.length > 0) {
            linkDescriptors = game.links.map(l => ({ id: l.linked_game_id || l.linked_game || l.linkedTo, label: l.label || l.relation || undefined }));
          } else {
            const linkedId = game.linked_game_id || game.related_game_id || game.link_to || game.linkedTo;
            if (linkedId) linkDescriptors.push({ id: linkedId, label: game.link_label });
          }
          console.log("linkDescriptors:", linkDescriptors);
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
          console.log("Added link button to", game.title);
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
    // Prüfe Login-Status erneut
    await checkLoginStatus();
    
    if (!isLoggedIn) {
        alert("Bitte melden Sie sich an, um Spiele zu bewerten!");
        loginPopup.style.display = "flex";
        formArea.style.display = "block";
        registerArea.style.display = "none";
        formTitle.textContent = "Anmelden";
        clearErrors();
        return;
    }
    
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

// Login/Registrierung Popup Elemente
const loginPopup = document.getElementById("loginPopup");
const formTitle = document.getElementById("formTitle");
const formArea = document.getElementById("formArea");
const registerArea = document.getElementById("registerArea");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const closeLoginPopup = document.getElementById("closeLoginPopup");

// Formular-Wechsel
showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    formArea.style.display = "none";
    registerArea.style.display = "block";
    formTitle.textContent = "Registrieren";
    clearErrors();
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    formArea.style.display = "block";
    registerArea.style.display = "none";
    formTitle.textContent = "Anmelden";
    clearErrors();
});

// Fehler löschen
function clearErrors() {
    document.getElementById("errorMsg").textContent = "";
    document.getElementById("regError").textContent = "";
}

// Enter-Taste unterstützen
function setupEnterKey(inputs, button) {
    inputs.forEach(input => {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                button.click();
            }
        });
    });
}

// Login
const loginBtn = document.getElementById("loginBtn");
const loginInputs = [
    document.getElementById("identifier"),
    document.getElementById("password")
];

setupEnterKey(loginInputs, loginBtn);

loginBtn.addEventListener("click", async () => {
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("errorMsg");
    error.textContent = "";

    if (!identifier || !password) {
        error.textContent = "Bitte Benutzername/E-Mail und Passwort eingeben.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Wird angemeldet...";

    const res = await postJson("/login", { identifier, password });
    
    loginBtn.disabled = false;
    loginBtn.textContent = "Anmelden";

    if (res.ok) {
        alert("Du bist jetzt eingeloggt!");
        loginPopup.style.display = "none";
        checkLoginStatus(); // Status aktualisieren
    } else {
        error.textContent = res.data?.error || "Login fehlgeschlagen";
    }
});

// Registrierung
const registerBtn = document.getElementById("registerBtn");
const registerInputs = [
    document.getElementById("reg_username"),
    document.getElementById("reg_email"),
    document.getElementById("reg_password")
];

setupEnterKey(registerInputs, registerBtn);

registerBtn.addEventListener("click", async () => {
    const username = document.getElementById("reg_username").value.trim();
    const email = document.getElementById("reg_email").value.trim();
    const password = document.getElementById("reg_password").value;
    const error = document.getElementById("regError");
    error.textContent = "";

    if (!username || !email || !password) {
        error.textContent = "Bitte alle Felder ausfüllen.";
        return;
    }

    if (password.length < 6) {
        error.textContent = "Passwort muss mindestens 6 Zeichen lang sein.";
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "Wird registriert...";

    const res = await postJson("/register", { username, email, password });
    
    registerBtn.disabled = false;
    registerBtn.textContent = "Registrieren";

    if (res.ok) {
        alert("Registrierung erfolgreich! Du bist jetzt eingeloggt.");
        loginPopup.style.display = "none";
        checkLoginStatus(); // Status aktualisieren
    } else {
        error.textContent = res.data?.error || "Registrierung fehlgeschlagen";
    }
});

// Popup schließen
closeLoginPopup.addEventListener("click", () => {
    loginPopup.style.display = "none";
});

// JavaScript für loginbutton
document.getElementById("btnlogin").addEventListener("click", function() {
    if (isLoggedIn) {
        // Vielleicht Logout-Option hinzufügen
        alert("Du bist bereits eingeloggt!");
    } else {
        loginPopup.style.display = "flex";
        formArea.style.display = "block";
        registerArea.style.display = "none";
        formTitle.textContent = "Anmelden";
        clearErrors();
    }
});

 // JavaScript für unique games button
 document.getElementById("btnUniqueGames").addEventListener("click", function() {
  window.location.href = "/our_unique_games.html";
});