const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const tagSelect = $("#tagSelect");
const searchInput = $("#searchInput");
const gameGrid = $("#gameGrid");
const showInfoBtn = $("#showInfoBtn");
const btnLogin = $("#btnlogin");
const btnLogout = $("#btnLogout");

// Login-Status
let isLoggedIn = false;

// Hintergrund-Bilder Mapping
const gameBackgrounds = {
  1: "images/Hollow_Knight.jpg",
  2: "images/Skyrim.jpg",
  3: "images/helldivers2.jpg",
  4: "images/Silksong.webp",
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
 31: "images/TailsofIrone2.png",
 40: "the-lords-of-the-fallen.jpg"
};

// --- UI Elemente ---
const popup = $("#addGamePopup");
const openAddGameBtn = $("#openAddGameBtn");
const closePopupBtn = $("#closePopupBtn");
const addGameForm = $("#addGameForm");

const ratingPopup = $("#ratingPopup");
const ratingForm = $("#ratingForm");
const closeRatingPopup = $("#closeRatingPopup");
const ratingGameTitle = $("#ratingGameTitle");
const ratingGameId = $("#ratingGameId");
const existingRatings = $("#existingRatings");
const ratingsList = $("#ratingsList");

const tagsHeaderBtn = $("#tagsHeaderBtn");
const tagsDropdown = $("#tagsDropdown");
const tagsArrow = $(".tags-arrow");
const tagsCount = $(".tags-count");

const loginPopup = $("#loginPopup");
const formTitle = $("#formTitle");
const formArea = $("#formArea");
const registerArea = $("#registerArea");
const showRegister = $("#showRegister");
const showLogin = $("#showLogin");
const closeLoginPopup = $("#closeLoginPopup");

const loginBtn = $("#loginBtn");
const registerBtn = $("#registerBtn");
const btnUniqueGames = $("#btnUniqueGames");

const MAX_TAGS = 4;

let draggedImageFile = null;
let currentGameForRating = null;
let games = [];
let selectedGame = null;

async function postJson(url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("Network error:", error);
    return { ok: false, status: 0, data: { error: "Netzwerkfehler" } };
  }
}

async function checkLoginStatus() {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) {
      console.error("API Fehler:", res.status);
      isLoggedIn = false;
      return;
    }

    const data = await res.json();
    isLoggedIn = data.loggedIn;
    updateButtonStates();
  } catch (error) {
    console.error("Fehler beim Prüfen des Login-Status:", error);
    isLoggedIn = false;
  }
}

function updateButtonStates() {
  if (openAddGameBtn) {
    openAddGameBtn.disabled = !isLoggedIn;
    openAddGameBtn.title = isLoggedIn
      ? "Neues Game hinzufügen"
      : "Bitte melden Sie sich an, um Spiele hinzuzufügen";
  }

  if (btnLogin) btnLogin.style.display = isLoggedIn ? "none" : "inline-block";
  if (btnLogout) btnLogout.style.display = isLoggedIn ? "inline-block" : "none";
}

function showLoginDialog() {
  if (!loginPopup) return;
  loginPopup.style.display = "flex";
  formArea.style.display = "block";
  registerArea.style.display = "none";
  formTitle.textContent = "Anmelden";
  clearErrors();
}

function getTagCheckboxes() {
  return $$(".tag-checkbox input[type=checkbox]");
}

function updateTagCount() {
  const count = getTagCheckboxes().filter(cb => cb.checked).length;
  if (tagsCount) tagsCount.textContent = `(${count} ausgewählt)`;
}

function initializeDropZone() {
  if (!addGameForm) return;

  const existing = $("#imageDropZone");
  if (existing) existing.remove();

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
  dropZone.textContent =
    "Drag and drop the image here or click to select (and make sure the image has a high resolution)";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  dropZone.appendChild(fileInput);

  const setSelectedImage = (file) => {
    if (!file) return;
    draggedImageFile = file;
    dropZone.textContent = `Bild ausgewählt: ${file.name}`;
    dropZone.style.backgroundColor = "#e9f7e9";
  };

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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    } else {
      alert("Please only upload image files!");
    }
  });

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  });

  const submitBtn = addGameForm.querySelector('button[type="submit"]');
  addGameForm.insertBefore(dropZone, submitBtn);

  loadTagsForForm();
}

function loadTagsForForm() {
  if (!tagsDropdown) return;

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

  tagsDropdown.innerHTML = tags
    .map(
      (tag) => `
        <div class="tag-checkbox">
          <input type="checkbox" name="tags[]" value="${tag.tag_id}" id="tag${tag.tag_id}">
          <label for="tag${tag.tag_id}">${tag.name}</label>
        </div>`
    )
    .join("");

  updateTagCount();
}

function enforceTagLimit(e) {
  if (!e.target.matches(".tag-checkbox input[type=checkbox]")) return;
  const checked = getTagCheckboxes().filter((cb) => cb.checked);
  if (checked.length > MAX_TAGS) {
    e.target.checked = false;
  }
  updateTagCount();
}

function toggleTagsDropdown() {
  if (!tagsDropdown) return;
  const isOpen = tagsDropdown.style.display !== "none";
  tagsDropdown.style.display = isOpen ? "none" : "block";
  tagsArrow?.classList.toggle("open", !isOpen);
}

async function fetchGames(tag = "") {
  let url = "/games";
  if (tag && tag !== "all") url += `?tag=${encodeURIComponent(tag)}`;

  const res = await fetch(url);
  games = await res.json();

  games.forEach((game) => {
    const gameId = game.game_id || game.id;
    if (game.image_path) {
      gameBackgrounds[gameId] = "images/" + game.image_path;
    }
  });

  filterAndRenderGames();
}

function filterAndRenderGames() {
  if (!games) return;
  const term = (searchInput?.value || "").trim().toLowerCase();
  const list = term
    ? games.filter((g) => g.title && g.title.toLowerCase().includes(term))
    : games;
  renderGames(list);
}

function selectGame(game, div) {
  document.querySelectorAll(".game-box").forEach((b) => b.classList.remove("selected"));
  div.classList.add("selected");
  selectedGame = game;
}

function clearFocusOverlay() {
  const backdrop = $(".focused-backdrop");
  const clone = $(".focused-clone");
  backdrop?.remove();
  clone?.remove();
}

showInfoBtn?.addEventListener("click", async () => {
  if (!selectedGame) {
    alert("Bitte wähle unten ein Spiel aus.");
    return;
  }

  const selectedDiv = document.querySelector(".game-box.selected");
  if (!selectedDiv) {
    alert("Ausgewählte Game-Box nicht gefunden.");
    return;
  }

  if ($(".focused-backdrop")) {
    clearFocusOverlay();
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.className = "focused-backdrop";
  document.body.appendChild(backdrop);

  const clone = document.createElement("div");
  clone.className = "focused-clone";
  clone.style.backgroundImage =
    selectedDiv.style.backgroundImage || getComputedStyle(selectedDiv).backgroundImage;
  clone.style.backgroundSize = "cover";
  clone.style.backgroundPosition = "center";

  const title = selectedGame.title || selectedGame.name || "Unbekannter Titel";
  const release = selectedGame.created_at || selectedGame.year || "Unbekannt";
  const developer = selectedGame.developer || "Unknown";
  const tags = (selectedGame.tags && selectedGame.tags.join(", ")) || selectedGame.gametag_id || "Keine";
  const desc = selectedGame.description || "Keine Beschreibung verfügbar";

  const overlay = document.createElement("div");
  overlay.className = "info-overlay visible";
  overlay.innerHTML = `
    <button class="info-close">Schließen</button>
    <div class="info-title">${title}</div>
    <div class="info-meta"><strong>Release:</strong> ${release} &nbsp; <strong>Developer:</strong> ${developer} &nbsp; <strong>Tags:</strong> ${tags}</div>
    <div class="info-desc">${desc}</div>
    <div class="info-ratings" id="ratings-display-mini">Lade Bewertungen...</div>
  `;

  overlay.querySelector(".info-close")?.addEventListener("click", clearFocusOverlay);
  backdrop.addEventListener("click", clearFocusOverlay);

  clone.appendChild(overlay);
  document.body.appendChild(clone);

  try {
    const gameId = selectedGame.id || selectedGame.game_id || selectedGame.gameId;
    const ratingsEl = overlay.querySelector("#ratings-display-mini");
    if (!gameId) {
      ratingsEl.innerHTML = '<p style="color:orange">Keine Game-ID</p>';
    } else {
      const res = await fetch(`/ratings/${gameId}`);
      if (!res.ok) {
        ratingsEl.innerHTML = '<p>Fehler beim Laden der Bewertungen.</p>';
      } else {
        const ratings = await res.json();
        if (!ratings || ratings.length === 0) {
          ratingsEl.innerHTML = '<p>Noch keine Bewertungen.</p>';
        } else {
          ratingsEl.innerHTML = ratings
            .map(
              (r) => `
          <div style="font-size:12px; padding:6px 0; border-top:1px solid rgba(255,255,255,0.06)">
            <strong>${r.username || "User"}</strong>: ${r.rating}/10<br>
            <small style="color:#ccc">${(r.comment || "")}</small>
          </div>`
            )
            .join("");
        }
      }
    }
  } catch (e) {
    const ratingsEl = overlay.querySelector("#ratings-display-mini");
    if (ratingsEl) ratingsEl.innerHTML = "<p>Fehler beim Laden.</p>";
    console.error("Ratings mini load error", e);
  }
});

if (searchInput) searchInput.addEventListener("input", filterAndRenderGames);

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

async function openRatingPopup(gameId, gameTitle) {
  await checkLoginStatus();
  if (!isLoggedIn) {
    alert("Bitte melden Sie sich an, um Spiele zu bewerten!");
    showLoginDialog();
    return;
  }

  currentGameForRating = gameId;
  ratingGameId.value = gameId;
  ratingGameTitle.textContent = `${gameTitle} bewerten`;
  ratingForm.reset();
  await loadExistingRatings(gameId);
  ratingPopup.style.display = "flex";
}

async function loadExistingRatings(gameId) {
  try {
    const res = await fetch(`/ratings/${gameId}`);
    const ratings = await res.json();

    if (ratings.length > 0) {
      ratingsList.innerHTML = "";
      ratings.forEach((rating) => {
        const ratingDiv = document.createElement("div");
        ratingDiv.className = "rating-item";
        ratingDiv.innerHTML = `
                    <strong>${rating.username}</strong>: ★ ${rating.rating}/10
                    <br><em>${rating.comment || "Kein Kommentar"}</em>
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
      credentials: "include",
      body: JSON.stringify(ratingData)
    });
    const data = await res.json();

    if (res.ok) {
      alert("Bewertung erfolgreich abgegeben!");
      ratingPopup.style.display = "none";
      fetchGames(tagSelect?.value);
    } else {
      alert(data.error || "Fehler beim Speichern der Bewertung");
    }
  } catch (error) {
    console.error("Detailierter Fehler:", error);
    alert("Netzwerkfehler - bitte versuche es erneut");
  }
});

closeRatingPopup?.addEventListener("click", () => {
  ratingPopup.style.display = "none";
});

ratingPopup?.addEventListener("click", (e) => {
  if (e.target === ratingPopup) ratingPopup.style.display = "none";
});

showRegister?.addEventListener("click", (e) => {
  e.preventDefault();
  formArea.style.display = "none";
  registerArea.style.display = "block";
  formTitle.textContent = "Registrieren";
  clearErrors();
});

showLogin?.addEventListener("click", (e) => {
  e.preventDefault();
  formArea.style.display = "block";
  registerArea.style.display = "none";
  formTitle.textContent = "Anmelden";
  clearErrors();
});

function clearErrors() {
  $("#errorMsg").textContent = "";
  $("#regError").textContent = "";
}

function setupEnterKey(inputs, button) {
  inputs.forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") button.click();
    });
  });
}

setupEnterKey([$("#identifier"), $("#password")], loginBtn);

loginBtn?.addEventListener("click", async () => {
  const identifier = $("#identifier").value.trim();
  const password = $("#password").value;
  const error = $("#errorMsg");
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
    checkLoginStatus();
  } else {
    error.textContent = res.data?.error || "Login fehlgeschlagen";
  }
});

setupEnterKey([$("#reg_username"), $("#reg_email"), $("#reg_password")], registerBtn);

registerBtn?.addEventListener("click", async () => {
  const username = $("#reg_username").value.trim();
  const email = $("#reg_email").value.trim();
  const password = $("#reg_password").value;
  const error = $("#regError");
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
    checkLoginStatus();
  } else {
    error.textContent = res.data?.error || "Registrierung fehlgeschlagen";
  }
});

closeLoginPopup?.addEventListener("click", () => {
  loginPopup.style.display = "none";
});

btnLogin?.addEventListener("click", () => {
  if (isLoggedIn) {
    alert("Du bist bereits eingeloggt!");
  } else {
    showLoginDialog();
  }
});

btnLogout?.addEventListener("click", async () => {
  try {
    const res = await fetch("/logout", { method: "POST", credentials: "same-origin" });
    if (res.ok) {
      isLoggedIn = false;
      updateButtonStates();
      alert("Erfolgreich ausgeloggt");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Logout fehlgeschlagen");
    }
  } catch (e) {
    console.error("Logout Fehler:", e);
    alert("Netzwerkfehler beim Ausloggen");
  }
});

openAddGameBtn?.addEventListener("click", async () => {
  await checkLoginStatus();
  if (!isLoggedIn) {
    alert("Bitte melden Sie sich an, um Spiele hinzuzufügen!");
    showLoginDialog();
    return;
  }

  popup.style.display = "flex";
  tagsDropdown.style.display = "none";
  tagsArrow?.classList.remove("open");
  getTagCheckboxes().forEach((cb) => (cb.checked = false));
  updateTagCount();
  initializeDropZone();
});

closePopupBtn?.addEventListener("click", () => {
  popup.style.display = "none";
});

if (tagsHeaderBtn) tagsHeaderBtn.addEventListener("click", toggleTagsDropdown);
if (tagsDropdown) tagsDropdown.addEventListener("change", enforceTagLimit);
if (tagSelect) tagSelect.addEventListener("change", () => fetchGames(tagSelect.value));
if (btnUniqueGames) btnUniqueGames.addEventListener("click", () => (window.location.href = "/our_unique_games.html"));

addGameForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedTags = getTagCheckboxes().filter((cb) => cb.checked).map((cb) => parseInt(cb.value, 10));
  if (selectedTags.length === 0) {
    alert("Bitte wähle mindestens ein Tag aus!");
    return;
  }

  const formData = new FormData(addGameForm);
  formData.append("created_at", new Date().toISOString());
  if (draggedImageFile) formData.append("image", draggedImageFile);

  try {
    const res = await fetch("/leggtilgame", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      popup.style.display = "none";
      addGameForm.reset();
      draggedImageFile = null;
      fetchGames();
    } else {
      alert(data.error || "Fehler beim Speichern des Spiels");
    }
  } catch (error) {
    console.error("Netzwerkfehler beim Speichern:", error);
    alert("Netzwerkfehler: " + error.message);
  }
});

ratingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(ratingForm);
  const ratingData = {
    game_id: currentGameForRating,
    rating: parseInt(formData.get("rating"), 10),
    comment: formData.get("comment")
  };

  try {
    const res = await fetch("/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ratingData)
    });
    const data = await res.json();

    if (res.ok) {
      alert("Bewertung erfolgreich abgegeben!");
      ratingPopup.style.display = "none";
      fetchGames(tagSelect?.value);
    } else {
      alert(data.error || "Fehler beim Speichern der Bewertung");
    }
  } catch (error) {
    console.error("Detailierter Fehler:", error);
    alert("Netzwerkfehler - bitte versuche es erneut");
  }
});

checkLoginStatus();
fetchGames();

function renderGames(games) {
  if (!gameGrid) return;
  gameGrid.innerHTML = "";

  for (const game of games) {
    const div = document.createElement("div");
    div.className = "game-box";
    div.style.position = "relative";

    const gameId = game.game_id || game.id || game.gameId;
    if (gameId !== undefined) div.dataset.gameId = String(gameId);

    const bgImage = gameBackgrounds[gameId] || (game.image_path ? "images/" + game.image_path : null);
    if (bgImage) {
      div.style.backgroundImage = `url('${bgImage}')`;
      div.style.backgroundSize = "cover";
      div.style.backgroundPosition = "center";
    }

    const titleText = game.title || game.name || "Unbekannter Titel";

    const titleEl = document.createElement("div");
    titleEl.className = "game-title";
    titleEl.textContent = titleText;

    const rateBtn = document.createElement("button");
    rateBtn.className = "rate-btn rate-btn-corner";
    rateBtn.textContent = "★ Bewerten";
    rateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openRatingPopup(gameId, titleText);
    });

    div.append(titleEl, rateBtn);
    div.addEventListener("click", () => selectGame(game, div));

    const linkDescriptors = [];
    if (Array.isArray(game.links) && game.links.length) {
      linkDescriptors.push(
        ...game.links.map((l) => ({
          id: l.linked_game_id || l.linked_game || l.linkedTo,
          label: l.label || l.relation
        }))
      );
    } else {
      const linkedId = game.linked_game_id || game.related_game_id || game.link_to || game.linkedTo;
      if (linkedId) linkDescriptors.push({ id: linkedId, label: game.link_label });
    }

    if (linkDescriptors.length) {
      const linkBtn = document.createElement("button");
      linkBtn.className = "link-btn";
      linkBtn.textContent =
        linkDescriptors.length === 1
          ? linkDescriptors[0].label || "Linked"
          : game.link_label || "Linked games";
      linkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const linkedGames = linkDescriptors.map((d) => {
          const found = games.find((g) => (g.game_id || g.id || g.gameId) == d.id);
          return {
            id: d.id,
            label: d.label || (found && (found.title || found.name)) || `Game ${d.id}`,
            found: !!found,
            gameObj: found || null
          };
        });
        openLinkedGamesPopup(linkedGames);
      });

      const wrapper = document.createElement("div");
      wrapper.className = "link-btn-wrapper";
      wrapper.style.position = "absolute";
      wrapper.style.left = "8px";
      wrapper.style.bottom = "8px";
      wrapper.style.zIndex = "10";
      linkBtn.style.padding = "6px 8px";
      linkBtn.style.fontSize = "12px";
      wrapper.appendChild(linkBtn);
      div.appendChild(wrapper);
    }

    gameGrid.appendChild(div);
    loadAverageRating(gameId, div);
  }
}

function openLinkedGamesPopup(linkedGames) {
  const overlay = document.createElement("div");
  overlay.className = "linked-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000
  });

  const popup = document.createElement("div");
  popup.className = "linked-popup";
  Object.assign(popup.style, {
    background: "rgba(0,0,0,0.85)",
    padding: "16px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "80%",
    overflow: "auto",
    color: "#fff"
  });

  const title = document.createElement("h3");
  title.textContent = "Linked games";
  title.style.color = "#fff";
  popup.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "linked-grid";
  Object.assign(grid.style, { display: "flex", gap: "12px", flexWrap: "wrap" });

  linkedGames.forEach((link) => {
    const targetGame = link.gameObj || games.find((g) => (g.game_id || g.id || g.gameId) == link.id);
    const tile = document.createElement("div");
    tile.className = "game-box linked-mini";
    tile.dataset.gameId = String(link.id);

    const previewId = (targetGame && (targetGame.game_id || targetGame.id || targetGame.gameId)) || link.id;
    if (gameBackgrounds[previewId]) {
      tile.style.backgroundImage = `url('${gameBackgrounds[previewId]}')`;
      tile.style.backgroundSize = "cover";
      tile.style.backgroundPosition = "center";
      tile.style.border = "1px solid rgba(255,255,255,0.12)";
      tile.style.color = "#fff";
    }

    const titleText = (targetGame && (targetGame.title || targetGame.name)) || link.label || `Game ${link.id}`;
    const titleEl = document.createElement("div");
    titleEl.className = "game-title";
    titleEl.textContent = titleText;

    const rateBtn = document.createElement("button");
    rateBtn.className = "rate-btn rate-btn-corner";
    rateBtn.textContent = "★ Bewerten";
    rateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openRatingPopup(link.id, titleText);
    });

    tile.append(titleEl, rateBtn);

    tile.addEventListener("click", (e) => {
      e.stopPropagation();
      const tg = targetGame || games.find((g) => (g.game_id || g.id || g.gameId) == link.id);
      if (tg) {
        const td = document.querySelector(`.game-box[data-game-id="${link.id}"]`);
        if (td) {
          selectGame(tg, td);
          td.scrollIntoView({ behavior: "smooth", block: "center" });
          overlay.remove();
          return;
        }
      }
      fetchGames();
      setTimeout(() => {
        const td = document.querySelector(`.game-box[data-game-id="${link.id}"]`);
        const tg2 = games.find((g) => (g.game_id || g.id || g.gameId) == link.id);
        if (td && tg2) selectGame(tg2, td);
        overlay.remove();
      }, 400);
    });

    grid.appendChild(tile);
  });

  popup.appendChild(grid);

  const close = document.createElement("button");
  close.textContent = "Close";
  Object.assign(close.style, {
    marginTop: "12px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  });
  close.addEventListener("click", () => overlay.remove());
  popup.appendChild(close);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

checkLoginStatus();
fetchGames();
