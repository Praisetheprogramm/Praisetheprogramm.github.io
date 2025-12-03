
const express = require("express");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("Projektgamewebseite.db");

// Tabelle für Bewertungen erstellen
db.prepare(`
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    user_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 10),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`).run();

// Bewertung abgeben
app.post("/rating", requireAuth, (req, res) => {
    const { game_id, rating, comment } = req.body;
    const user_id = req.session.userId;

    // Prüfen ob bereits bewertet
    const existingRating = db.prepare("SELECT * FROM ratings WHERE game_id = ? AND user_id = ?").get(game_id, user_id);
    
    if (existingRating) {
        return res.status(400).json({ error: "Du hast dieses Spiel bereits bewertet" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO ratings (game_id, user_id, rating, comment) 
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(game_id, user_id, rating, comment);
        res.json({ message: "Bewertung erfolgreich abgegeben!", info });
    } catch (e) {
        res.status(500).json({ error: "Fehler beim Speichern der Bewertung" });
    }
});

// Bewertungen für ein Spiel abrufen
app.get("/ratings/:game_id", (req, res) => {
    const game_id = req.params.game_id;
    
    const ratings = db.prepare(`
        SELECT r.rating, r.comment, r.created_at, u.username 
        FROM ratings r 
        JOIN user u ON r.user_id = u.id 
        WHERE r.game_id = ? 
        ORDER BY r.created_at DESC
    `).all(game_id);
    
    res.json(ratings);
});

// Durchschnittsbewertung für ein Spiel
app.get("/ratings/average/:game_id", (req, res) => {
    const game_id = req.params.game_id;
    
    const result = db.prepare(`
        SELECT AVG(rating) as average, COUNT(*) as count 
        FROM ratings 
        WHERE game_id = ?
    `).get(game_id);
    
    res.json(result);
});