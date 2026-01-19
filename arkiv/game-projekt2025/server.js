// Video med forklaring: https://youtu.be/Fqi6RsVPOa4
/*
    Denne videoen viser hvordan du kan lage en rute i app.js-filen din som 
    tillater å legge til data i databasen. I tillegg blir det vist hvordan du lager 
    en nettside (i public-mappen), som bruker et skjema (form), litt enkel JS (await, async), 
    og ruten du lagde på serveren, for å kunne sette inn faktiske data.

    Merk at det blir vist litt om feilmeldinger og problemer som kan oppstå, men her er det mer arbeid å gjøre.

<--------------------------------------------------------------------------------------------------------------------->
    WEN DAS PROGAM SICH SELBER SCHLIEST GIB DAS HIER IM CMD EIN => taskkill /F /IM node.exe <=
<--------------------------------------------------------------------------------------------------------------------->
*/

const express = require("express");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("Projektgamewebseite.db");

// Set busy timeout to avoid "database is locked"
db.pragma('busy_timeout = 5000');

const PORT = 3000;

// Middleware for å servere statiske filer fra public-mappen
app.use(express.static('public'));

// Middleware for å parse JSON-data
app.use(express.json());

const session = require("express-session");
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require("bcrypt");

// Session middleware MUSS VOR den Routen kommen
app.use(
    session({
        secret: "hemmeligNøkkel", // Bytt til en sikker nøkkel i produksjon
        resave: true,
        saveUninitialized: true,
        store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
        cookie: { 
            secure: false, // Sett til true hvis du bruker HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
        }
    })
);

// Static files zuletzt einbinden, damit Session-Middleware zuvor aktiv ist
app.use(express.static('public'));

// Aktuell eingeloggter User (für Frontend)
app.get("/api/me", (req, res) => {
    console.log("Session userId:", req.session.userId);
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Geschützte Routen
function requireAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ error: "Nicht eingeloggt" });
}

// Tabelle users erstellen falls nicht vorhanden
db.prepare(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )
`).run();

// Tabelle ratings erstellen falls nicht vorhanden
db.prepare(`
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    user_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Startseite - immer index.html senden, Login-Status wird im Frontend geprüft
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Registrierung
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    // Validierung
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Alle Felder müssen ausgefüllt werden" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Passwort muss mindestens 6 Zeichen lang sein" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const stmt = db.prepare("INSERT INTO user (username, email, password) VALUES (?, ?, ?)");
        const result = stmt.run(username, email, hashedPassword);
        
        // Session direkt nach Registrierung setzen
        req.session.userId = result.lastInsertRowid;
        req.session.username = username;
        
        res.json({ 
            ok: true, 
            message: "Registrierung erfolgreich",
            user: { id: result.lastInsertRowid, username }
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            res.status(400).json({ error: "Benutzername oder E-Mail bereits vergeben" });
        } else {
            console.error("Registrierungsfehler:", error);
            res.status(500).json({ error: "Interner Serverfehler" });
        }
    }
});

// Login
app.post("/login", (req, res) => {
    const { identifier, password } = req.body;
    console.log(identifier, password);

    // Validierung
    if (!identifier || !password) {
        return res.status(400).json({ error: "Benutzername/E-Mail und Passwort sind erforderlich" });
    }

    try {
        // User finden (per Username oder Email)
        const user = db.prepare("SELECT * FROM user WHERE username = ? OR email = ?")
                       .get(identifier, identifier);
        console.log("Found user:", user);

        if (!user) {
            return res.status(400).json({ error: "Benutzername oder Passwort falsch" });
        }

        // Passwort überprüfen
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Benutzername oder Passwort falsch" });
        }

        // Session setzen
        req.session.userId = user.user_id;
        req.session.username = user.username;
        console.log("User ID:", user.user_id);
        console.log("Session userId:", req.session.userId);

        res.json({ 
            ok: true, 
            message: "Login erfolgreich",
            user: { id: user.user_id, username: user.username }
        });
    } catch (error) {
        console.error("Login-Fehler:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout fehlgeschlagen" });
        }
        res.json({ ok: true, message: "Logout erfolgreich" });
    });
});

// User-Info abrufen
app.get("/api/user", requireAuth, (req, res) => {
    res.json({ 
        id: req.session.userId, 
        username: req.session.username 
    });
});

// Schutz-Middleware
function requireAuth(req, res, next) {
    console.log("requireAuth - Session userId:", req.session.userId);
    if (req.session.userId) return next();
    res.status(401).json({ error: "Nicht eingeloggt" });
}

// Eksempel på rute som hentar brukarar frå databasen (besøk http://localhost:3000/personer)
app.get("/users", (req, res) => {
    const users = db.prepare("SELECT * FROM user").all();
    res.json(users);
});

app.get("/games", (req, res) => {
  const rows = db.prepare("SELECT * FROM games").all();
  res.json(rows);
});

app.get("/games/byTag/:tagId", (req, res) => {
  const tagId = req.params.tagId;
  console.log(tagId)

  const sql = `
    SELECT games.game_id, games.title, games.Logo, games_tag.tag_id
    FROM games
    INNER JOIN games_tag ON games.game_id = games_tag.game_id
    WHERE games_tag.tag_id = ?
  `;

  const rows = db.prepare(sql).all(tagId);
  res.json(rows);
});

// Route für unique_games
app.get("/unique-games", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM unique_games").all();
    res.json(rows);
  } catch (error) {
    console.error("Fehler beim Abrufen der unique_games:", error);
    res.status(500).json({ error: "Fehler beim Laden der Spiele" });
  }
});

// Bewertung löschen
app.delete("/rating/:id", requireAuth, (req, res) => {
    const ratingId = req.params.id;
    const userId = req.session.userId;

    try {
        // Prüfen ob die Bewertung dem User gehört
        const rating = db.prepare("SELECT * FROM ratings WHERE id = ? AND user_id = ?").get(ratingId, userId);
        
        if (!rating) {
            return res.status(404).json({ error: "Bewertung nicht gefunden oder nicht berechtigt" });
        }

        // Bewertung löschen
        const info = db.prepare("DELETE FROM ratings WHERE id = ?").run(ratingId);
        
        if (info.changes > 0) {
            res.json({ message: "Bewertung erfolgreich gelöscht" });
        } else {
            res.status(500).json({ error: "Fehler beim Löschen" });
        }
    } catch (error) {
        console.error("Fehler beim Löschen der Bewertung:", error);
        res.status(500).json({ error: "Fehler beim Löschen der Bewertung" });
    }
});

// Bewertung abgeben
app.post("/rating", requireAuth, (req, res) => {
    console.log("Rating Request erhalten:", req.body);
    console.log("User ID:", req.session.userId);
    
    const { game_id, rating, comment } = req.body;
    const user_id = req.session.userId;

    // Validierung
    if (!game_id || !rating) {
        console.log("Fehlende Daten:", { game_id, rating });
        return res.status(400).json({ error: "Spiel-ID und Bewertung sind erforderlich" });
    }

    if (rating < 1 || rating > 10) {
        return res.status(400).json({ error: "Bewertung muss zwischen 1 und 10 liegen" });
    }

    // Prüfen ob bereits bewertet
    const existingRating = db.prepare("SELECT * FROM ratings WHERE game_id = ? AND user_id = ?").get(game_id, user_id);
    
    if (existingRating) {
        console.log("Bereits bewertet:", existingRating);
        return res.status(400).json({ error: "Du hast dieses Spiel bereits bewertet" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO ratings (game_id, user_id, rating, comment) 
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(game_id, user_id, rating, comment);
        console.log("Bewertung gespeichert:", info);
        
        res.json({ 
            message: "Bewertung erfolgreich abgegeben!", 
            ratingId: info.lastInsertRowid 
        });
    } catch (e) {
        console.error("Datenbank-Fehler:", e);
        res.status(500).json({ error: "Fehler beim Speichern der Bewertung" });
    }
});

// Backend
app.post("/leggtilgame", requireAuth, (req, res) => {
    const { title, description, developer, created_at, tags } = req.body;

    try {
        // Game einfügen
        const gameStmt = db.prepare(`
            INSERT INTO games (title, description, developer, created_at)
            VALUES (?, ?, ?, ?)
        `);
        
        const info = gameStmt.run(title, description, developer, created_at);
        const gameId = info.lastInsertRowid;
        
        // Tags verarbeiten (wenn vorhanden)
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
            message: "Neues Game hinzugefügt!",
            gameId: gameId
        });

    } catch (err) {
        console.error("Fehler beim Hinzufügen des Spiels:", err);
        res.status(500).json({ error: "Game konnte nicht gespeichert werden" });
    }
});

app.listen(PORT, () => {
    console.log(`Server køyrer: http://localhost:${PORT}`);
});

// Server-Seite (Node.js mit Express)
app.get("/ratings/:gameId", (req, res) => {
    const gameId = req.params.gameId;
    
    try {
        const ratings = db.prepare(`
            SELECT ratings.rating, ratings.comment, ratings.created_at, user.username 
            FROM ratings 
            INNER JOIN user ON ratings.user_id = user.user_id 
            WHERE ratings.game_id = ? 
            ORDER BY ratings.created_at DESC
        `).all(gameId);
        
        res.json(ratings || []);
    } catch (error) {
        console.error("Fehler beim Abrufen der Ratings:", error);
        res.status(500).json({ error: "Fehler beim Laden der Bewertungen" });
    }
});