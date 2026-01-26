# Project: Gaming Review Platform

This [project](https://github.com/Praisetheprogramm/Praisetheprogramm.github.io/tree/main/arkiv/game-projekt2025/public/index.html) aims to create a gaming review website where inexperienced developers can share and receive feedback on their games.

##![database](./readme-images/databaser.png)

[Demo Video](https://onedrive.live.com/?id=%2Fpersonal%2Fab7b02262c9a24a9%2FDocuments%2F2025%2D12%2D05%2011%2D02%2D29%2Emp4&parent=%2Fpersonal%2Fab7b02262c9a24a9%2FDocuments)

---

## Project Overview

A **gaming review platform** where authenticated users can browse games, rate them, add comments, and submit new games to the database.

---

## Project Structure

```
game-projekt2025/
├── package.json          # Project dependencies and scripts
├── readme.md             # This README file
├── server.js             # Express backend server
├── public/               # Static files served by the server
│   ├── index.html        # Main game browsing page
│   ├── login.html        # Login and registration page (not shown in structure)
│   ├── code.js           # Frontend JavaScript for main page
│   ├── extrazeug.css     # Additional CSS styles
│   ├── login.css         # Styles for login page
│   ├── our_unique_games.html  # Page for unique games
│   ├── our_unique_games.js    # JS for unique games page
│   ├── our_unique_games.css   # CSS for unique games page
│   ├── games/            # Game-specific pages
│   │   ├── filler.html   # Placeholder page
│   │   └── Spore/        # Example game page
│   │       ├── index.html
│   │       ├── code.js
│   │       └── extra_zeug.css
│   └── images/           # Game background images
│       └── METAL-GEAR-SOLID-Δ.avif
└── readme-images/        # Images for README
    └── databaser.png
```

---

## Code Summary

### 1. **server.js** - Express Backend

Handles all API routes and database interactions:

- **Authentication**: Register, login, logout with bcrypt password hashing and session management
- **Game Routes**: Fetch all games, filter by tags, retrieve unique games
- **Rating System**: Submit ratings (1-10), view existing ratings, calculate averages
- **Security**: Session-based auth, protected routes with `requireAuth` middleware

### 2. **login.html & login.js** - Authentication UI

- Simple two-tab interface for login and registration
- Form validation and error handling
- Sends credentials to `/login` or `/register` endpoints
- Auto-redirects to main page on success

### 3. **index.html** - Main Page

Interactive game browser with:
- **Header**: Tag filter dropdown, info button, unique games link, logout button
- **Game Grid**: Clickable game boxes with backgrounds and ratings
- **Game Info Panel**: Displays selected game details and all reviews
- **Add Game Popup**: Form to submit new games with tags
- **Rating Popup**: Modal for submitting game ratings and comments

### 4. **code.js** - Frontend Logic

Manages all interactive features:
- **Game Management**: Fetch, render, filter by tags
- **Game Selection**: Display details and existing ratings
- **Rating System**: Submit and display ratings with star visualization
- **Tag Handling**: Accordion menu with max 4 tag limit
- **Navigation**: Links to login and unique games pages

---

## Data Flow

```
User opens app
    ↓
Server checks session
    ├─ No session → login.html
    └─ Session exists → index.html
         ↓
    Load games from /games
    User selects game
         ↓
    Click "Show Info" or "★ Rate"
         ├─ Info: Display details + ratings
         └─ Rate: Open modal
              ↓
         User submits rating (1-10) + comment
              ↓
         POST to /rating
              ↓
         Server saves (checks if already rated)
              ↓
         UI updates, average rating recalculated
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Authentication | bcrypt, express-session |
| Server Port | 3000 |

---

## Important Functions

Below are the key functions from the main files with short descriptions and small code excerpts you can reference.

**code.js**
- fetchGames(tag): Fetches games from the backend (optionally filtered by tag) and calls `renderGames`.

```javascript
async function fetchGames(tag = "") {
     let url = "/games";
     if (tag && tag !== "all") url += `?tag=${encodeURIComponent(tag)}`;
     const res = await fetch(url);
     games = await res.json();
     renderGames(games);
}
```

- renderGames(games): Renders the game grid. Each game box gets a `data-game-id` attribute and a rating button.

```javascript
function renderGames(games) {
     gameGrid.innerHTML = "";
     for (let game of games) {
          const div = document.createElement("div");
          div.className = "game-box";
          div.setAttribute('data-game-id', String(game.game_id || game.id));
          div.innerHTML = `<div class="game-title">${game.title}</div>`;
          div.onclick = () => selectGame(game, div);
          gameGrid.appendChild(div);
     }
}
```

- openRatingPopup(gameId, title): Opens the rating modal, loads existing ratings and prepares the form.

```javascript
async function openRatingPopup(gameId, title) {
     ratingGameId.value = gameId;
     ratingGameTitle.textContent = `${title} bewerten`;
     ratingForm.reset();
     await loadExistingRatings(gameId);
     ratingPopup.style.display = 'flex';
}
```

**server.js**
- POST `/register`: Validates input, hashes password, inserts user and sets session.

```javascript
app.post('/register', (req, res) => {
     const { username, email, password } = req.body;
     const hashed = bcrypt.hashSync(password, 10);
     const info = db.prepare('INSERT INTO user (username,email,password) VALUES (?,?,?)').run(username,email,hashed);
     req.session.userId = info.lastInsertRowid;
     res.json({ ok: true });
});
```

- POST `/login`: Finds user by username/email, verifies password, sets session.

```javascript
app.post('/login', (req, res) => {
     const { identifier, password } = req.body;
     const user = db.prepare('SELECT * FROM user WHERE username=? OR email=?').get(identifier, identifier);
     if (user && bcrypt.compareSync(password, user.password)) {
          req.session.userId = user.id;
          res.json({ ok: true });
     } else res.status(400).json({ error: 'Login failed' });
});
```

- requireAuth(req,res,next): Middleware that checks `req.session.userId` and allows access only if set.

```javascript
function requireAuth(req, res, next) {
     if (req.session.userId) return next();
     res.status(401).json({ error: 'Nicht eingeloggt' });
}
```

**index.html** (important elements)
- `#tagSelect`: dropdown to filter games by tag (triggers GET `/games/byTag/:tagId`).
- `#showInfoBtn`: button to show detailed info and ratings for the selected game.
- `#openAddGameBtn` / `#addGamePopup`: opens the form to add a new game.
- `#ratingPopup`: modal used by `openRatingPopup` for sending `/rating` POST requests.

Small HTML example for the rating form element:

```html
<form id="ratingForm">
     <input type="hidden" id="ratingGameId">
     <select id="ratingSelect" name="rating"></select>
     <textarea id="ratingComment" name="comment"></textarea>
     <button type="submit">Bewertung abgeben</button>
</form>

**Additional Functions**

**code.js**
- selectGame(game, div): Selects a game and highlights it visually.

```javascript
function selectGame(game, div) {
  document.querySelectorAll(".game-box").forEach(b => b.classList.remove("selected"));
  div.classList.add("selected");
  selectedGame = game;
}
```

- loadExistingRatings(gameId): Fetches and displays existing ratings for a game.

```javascript
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
```

**server.js**
- GET `/games`: Retrieves all games from the database.

```javascript
app.get("/games", (req, res) => {
  const rows = db.prepare("SELECT * FROM games").all();
  res.json(rows);
});
```

- POST `/rating`: Submits a new rating for a game, ensuring no duplicate ratings per user.

```javascript
app.post("/rating", requireAuth, (req, res) => {
    const { game_id, rating, comment } = req.body;
    const user_id = req.session.userId;

    // Validation
    if (!game_id || !rating) {
        return res.status(400).json({ error: "Game ID and rating are required" });
    }

    if (rating < 1 || rating > 10) {
        return res.status(400).json({ error: "Rating must be between 1 and 10" });
    }

    // Check if already rated
    const existingRating = db.prepare("SELECT * FROM ratings WHERE game_id = ? AND user_id = ?").get(game_id, user_id);
    
    if (existingRating) {
        return res.status(400).json({ error: "You have already rated this game" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO ratings (game_id, user_id, rating, comment) 
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(game_id, user_id, rating, comment);
        
        res.json({ 
            message: "Rating submitted successfully!", 
            ratingId: info.lastInsertRowid 
        });
    } catch (e) {
        console.error("Database error:", e);
        res.status(500).json({ error: "Error saving rating" });
    }
});
```

- POST `/leggtilgame`: Adds a new game to the database with tags.

```javascript
app.post("/leggtilgame", requireAuth, (req, res) => {
    const { title, description, developer, created_at, tags } = req.body;

    try {
        // Insert game
        const gameStmt = db.prepare(`
            INSERT INTO games (title, description, developer, created_at)
            VALUES (?, ?, ?, ?)
        `);
        
        const info = gameStmt.run(title, description, developer, created_at);
        const gameId = info.lastInsertRowid;
        
        // Process tags
        if (Array.isArray(tags) && tags.length > 0) {
            const tagStmt = db.prepare(`
                INSERT INTO games_tag (game_id, tag_id)
                VALUES (?, ?)
            `);
            
            for (const tag of tags) {
                if (tag) {
                    tagStmt.run(gameId, tag);
                }
            }
        }
        
        res.json({
            ok: true,
            message: "New game added!",
            gameId: gameId
        });

    } catch (err) {
        console.error("Error adding game:", err);
        res.status(500).json({ error: "Game could not be saved" });
    }
});
```
