const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("bil.db");
const PORT = 3000;

// Middleware for å servere statiske filer fra public-mappen
app.use(express.static("public"));

// Middleware for å parse JSON-data
app.use(express.json());

// Middleware for sessions
app.use(
    session({
        secret: "hemmeligNøkkel", // Bytt til en sikker nøkkel i produksjon
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Sett til true hvis du bruker HTTPS
    })
);

// Middleware for å beskytte sider bak innloggings-mur
function kreverInnlogging(req, res, next) {
    if (!req.session.bruker) {
        return res.redirect("/login.html");
    }
    next();
}

// Rute for innlogging
app.post("/login", async (req, res) => {
    const { fornavn, passord } = req.body;

    const bruker = db.prepare("SELECT * FROM person WHERE fornavn = ?").get(fornavn);
    if (!bruker) {
        return res.status(401).json({ message: "Feil fornavn eller passord" });
    }

    const passordErGyldig = await bcrypt.compare(passord, bruker.passord);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Feil fornavn eller passord" });
    }

    // Lagre brukerdata i session
    req.session.bruker = { id: bruker.personnummer, fornavn: bruker.fornavn };
    res.json({ message: "Innlogging vellykket" });
});

// Rute for å logge ut
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Du er logget ut" });
});

// Eksempel på en beskyttet rute
app.get("/beskyttet", kreverInnlogging, (req, res) => {
    res.send(`Velkommen, ${req.session.bruker.fornavn}! Dette er en beskyttet side.`);
});

// Rute for å vise leggtilbil.html (kun for innloggede brukere)
app.get("/registrerbil", kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/beskytta/leggtilbil.html");
});

// Rute for å legge til ein ny bil i databasen (SQL)
app.post("/leggtilbil", (req, res) => {
    const { registreringsnummer, merke, modell, personnummer } = req.body;

    const stmt = db.prepare("INSERT INTO bil (personnummer, registreringsnummer, merke, modell) VALUES (?, ?, ?, ?)");
    const info = stmt.run(personnummer, registreringsnummer, merke, modell);

    res.json({ message: "Ny bil lagt til", info });
});

app.post("/leggtilperson", async (req, res) => {
    const { personnummer, fornavn, etternavn, postnummer, passord } = req.body;

    // Hash passordet med bcrypt
    const saltRounds = 10; // Antall runder med hashing
    const hashPassord = await bcrypt.hash(passord, saltRounds);

    const stmt = db.prepare("INSERT INTO person (personnummer, fornavn, etternavn, postnummer, passord) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(personnummer, fornavn, etternavn, postnummer, hashPassord);

    res.json({ message: "Ny person lagt til", info });
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});