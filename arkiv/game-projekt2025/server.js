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