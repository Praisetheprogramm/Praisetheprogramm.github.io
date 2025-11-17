// Video med forklaring: https://youtu.be/Fqi6RsVPOa4
/*
    Denne videoen viser hvordan du kan lage en rute i app.js-filen din som 
    tillater å legge til data i databasen. I tillegg blir det vist hvordan du lager 
    en nettside (i public-mappen), som bruker et skjema (form), litt enkel JS (await, async), 
    og ruten du lagde på serveren, for å kunne sette inn faktiske data.

    Merk at det blir vist litt om feilmeldinger og problemer som kan oppstå, men her er det mer arbeid å gjøre.

*/

const express = require("express");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("Projektgamewebseite.db");

const PORT = 3000;

// Middleware for å servere statiske filer fra public-mappen
app.use(express.static('public'));

// Middleware for å parse JSON-data
app.use(express.json());

const session = require("express-session");
const bcrypt = require("bcrypt");

app.use(session({
    secret: "geheim",
    resave: false,
    saveUninitialized: false
}));

// Tabelle users erstellen falls nicht vorhanden
db.prepare(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
)
`).run();

// Registrierung
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    const hashed = bcrypt.hashSync(password, 10);

    try {
        db.prepare("INSERT INTO user (username, email, password) VALUES (?, ?, ?)")
          .run(username, email, hashed);
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: "Username oder Email existiert schon" });
    }
});

// Login
app.post("/login", (req, res) => {
    const { identifier, password } = req.body;

    const user = db.prepare("SELECT * FROM user WHERE username = ? OR email = ?")
                   .get(identifier, identifier);

    if (!user) return res.status(400).json({ error: "Nicht gefunden" });

    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ error: "Falsches Passwort" });
    }

    // Session setzen
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ ok: true });
});

// Schutz-Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ error: "Nicht eingeloggt" });
}

// Eksempel på rute som hentar brukarar frå databasen (besøk http://localhost:3000/personer)
app.get("/user", (req, res) => {
    const users = db.prepare("SELECT * FROM user").all();
    res.json(users);
});

// Eksempel på rute som hentar bilar frå databasen (besøk http://localhost:3000/biler)
app.get("/games", (req, res) => {
    const cars = db.prepare("SELECT * FROM games").all();
    res.json(cars);
});

// Rute for å legge til ein ny bil i databasen
app.post("/leggtilgame", (req, res) => {
    const { game_id, strategy, title, tags, description, developer, created_at, Logo } = req.body;

    const stmt = db.prepare("INSERT INTO games (game_id, title, tags, description, developer, created_at, Logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const info = stmt.run(game_id, strategy, title, tags, description, developer, created_at, Logo);

    res.json({ message: "Ny game er lagt til", info });
});

app.listen(PORT, () => {
    console.log(`Server køyrer: http://localhost:${PORT}`);
});