const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // Importerer bcrypt, ein pakke for å m.a. hashe passord
const session = require("express-session");
const PORT = 3000;

// Middleware for å servere statiske filer fra public-mappen
app.use(express.static('public'));

// Middleware for å parse JSON fra request body
app.use(express.json());

// For å håndtere filstier
const path = require('path');

// Databasen
const Database = require('better-sqlite3');
const db = new Database('./brukere.db');
// Opprett tabell dersom den ikkje finst
db.exec(`CREATE TABLE IF NOT EXISTS person (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fornavn TEXT,
    etternavn TEXT,
    passord TEXT,
    rolle TEXT DEFAULT 'kunder'
)`);
db.exec(`CREATE TABLE IF NOT EXISTS melding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problemId INTEGER,
    brukerId INTEGER,
    tekst TEXT,
    opprettet TEXT DEFAULT CURRENT_TIMESTAMP
)`);
db.exec(`CREATE TABLE IF NOT EXISTS problem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brukerId INTEGER,
    tittel TEXT,
    status TEXT DEFAULT 'åpen',
    visibleTo TEXT DEFAULT 'customer support',
    opprettet TEXT DEFAULT CURRENT_TIMESTAMP
)`);
// Prøv å legge til problemId-kolonne hvis gammel melding-tabell finnes uten den
try {
    db.prepare("ALTER TABLE melding ADD COLUMN problemId INTEGER").run();
} catch (e) {
    // Kolonnen finnes sannsynligvis allerede — ignorer feilen
}
// Prøv å legge til visibleTo-kolonne hvis problemtabellen er eldre
try {
    db.prepare("ALTER TABLE problem ADD COLUMN visibleTo TEXT DEFAULT 'customer support'").run();
} catch (e) {
    // Kolonnen finnes sannsynligvis allerede — ignorer feilen
}
// Oppdater gamle roller ved serverstart
const oppdaterGamleRoller = db.prepare("UPDATE person SET rolle = 'kunder' WHERE rolle = 'vanlig'");
const oppdaterSupportRoller = db.prepare("UPDATE person SET rolle = 'customer support' WHERE rolle = 'support'");
oppdaterGamleRoller.run();
oppdaterSupportRoller.run();
// Middleware for sessions
// Dette gir hver bruker en unik "sesjon" som lagres på serveren
// Nettleseren får en cookie som identifiserer sesjonen
app.use(
    session({
        secret: "hemmeligNøkkel", // Brukes for å kryptere session-ID (bytt i produksjon!)
        resave: false,              // Ikke lagre sesjonen på nytt hvis den ikke er endret
        saveUninitialized: false,   // Ikke lag session før noe lagres i den
        cookie: { 
            secure: false,          // Sett til true hvis du bruker HTTPS
            maxAge: 1000 * 60 * 60  // Session utløper etter 1 time
        }
    })
);

// Middleware for å logge alle innkommende og utgående requests (for debugging)
//  Skal logge: tidspunkt, http-metode, body og url og hvilken bruker
app.use((req, res, next) => {
    const tid = new Date().toISOString();
    const navn = req.session?.bruker?.fornavn || "Ingen";
    const body = JSON.stringify(req.body);

    console.log(`[${tid}] ${req.method} ${req.url} - Body: ${body} - Bruker: ${navn}`);
    next();
});

// Middleware for å beskytte sider bak "innloggings-mur"
function kreverInnlogging(req, res, next) {
    if (!req.session.bruker) { // Dersom brukaren ikkje har ein session (er logga inn)
        return res.redirect("/"); // Startsida som inneheld opprett brukar og logg inn
    }
    next(); // Brukaren er logga inn, gå vidare
}

// Middleware som er mer generell, som kan brukes for alle mulige roller - og som er lett å utvide i fremtiden
function kreverRolle(...roller) {
    return (req, res, next) => {
        if (!req.session.bruker) { // Dersom brukeren ikke har en session (er logga inn)
            return res.redirect("/");
        }
        if (!roller.includes(req.session.bruker.rolle)) { // Dersom brukeren sin rolle ikke er i listen over roller som har tilgang
            return res.status(403).json({ message: "Ingen tilgang" });
        }
        next();
    };
}

// Eksempel på rute som viser deg index.html fra public-mappen (alltid tilgjengelig)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Beskyttet rute som krever innlogging, her gjør vi alle filer fra beskyttet-mappen tilgjengelig
app.use('/beskyttet', kreverInnlogging, express.static(path.join(__dirname, 'beskyttet')));

// Beskyttet rute som viser alle data om brukeren (kun egne data)
app.get("/api/minside", kreverInnlogging, (req, res) => {
    const brukerId = req.session.bruker.id;
    const bruker = db.prepare("SELECT id, fornavn, etternavn, passord, rolle FROM person WHERE id = ?").get(brukerId);
    res.json({ bruker });
});

// Ny måte: Admin-rute: henter all informasjon om alle brukere
app.get("/api/admin/brukere", kreverRolle('admin'), (req, res) => {
    const brukere = db.prepare("SELECT id, fornavn, etternavn, passord, rolle FROM person").all();
    res.json({ brukere });
});

// Admin-rute: slette en bruker (nur Kunden-User, und nur wenn keine offenen Probleme)
app.delete('/api/admin/bruker/:id/slett', kreverRolle('admin'), (req, res) => {
    const userId = req.params.id;
    const bruker = db.prepare('SELECT * FROM person WHERE id = ?').get(userId);

    // Prüfe, ob der Benutzer existiert
    if (!bruker) {
        return res.status(404).json({ message: 'Bruker ikke funnet' });
    }

    // Nur Kunden dürfen gelöscht werden
    if (bruker.rolle !== 'kunder') {
        return res.status(403).json({ message: 'Kun kundeversjoner kan slettes' });
    }

    // Prüfe, ob der Benutzer offene Probleme hat
    const problems = db.prepare("SELECT COUNT(*) as count FROM problem WHERE brukerId = ? AND status = 'åpen'").get(userId);
    if (problems.count > 0) {
        return res.status(400).json({ message: 'Bruker har åpne problemer og kan ikke slettes' });
    }

    // Lösche alle Meldungen des Benutzers
    const deleteMeldinger = db.prepare('DELETE FROM melding WHERE brukerId = ?');
    deleteMeldinger.run(userId);

    // Lösche alle abgeschlossenen Probleme des Benutzers
    const deleteProblemer = db.prepare('DELETE FROM problem WHERE brukerId = ?');
    deleteProblemer.run(userId);

    // Lösche den Benutzer selbst
    const deleteUser = db.prepare('DELETE FROM person WHERE id = ?');
    deleteUser.run(userId);

    res.json({ message: 'Bruker slettet' });
});

// Admin-rute: Ændre brukerrolle
app.post('/api/admin/bruker/:id/rolle', kreverRolle('admin'), (req, res) => {
    const userId = req.params.id;
    const { rolle } = req.body;

    // Validiere die neue Rolle
    const allowedRoles = ['kunder', 'customer support', 'utvikling', 'drift', 'admin'];
    if (!rolle || !allowedRoles.includes(rolle)) {
        return res.status(400).json({ message: 'Ugyldig rolle' });
    }

    // Prüfe, ob der Benutzer existiert
    const bruker = db.prepare('SELECT * FROM person WHERE id = ?').get(userId);
    if (!bruker) {
        return res.status(404).json({ message: 'Bruker ikke funnet' });
    }

    // Updat die Rolle
    const updateStmt = db.prepare('UPDATE person SET rolle = ? WHERE id = ?');
    updateStmt.run(rolle, userId);

    res.json({ message: `Brukerrolle endret til ${rolle}` });
});

// Ny måte: Support-rute: henter kun fornavn og etternavn for alle brukere
app.get("/api/support/brukere", kreverRolle('customer support', 'admin'), (req, res) => { // NB: Se at både customer support og admin har tilgang til denne ruten!
    const brukere = db.prepare("SELECT fornavn, etternavn FROM person").all();
    res.json({ brukere });
});

// Opprett et nytt problem (kunden starter en chat-tråd)
app.post('/api/problemer', kreverRolle('kunder'), (req, res) => {
    const { tittel, tekst, visibleTo } = req.body;
    if (!tittel || !tekst) {
        return res.status(400).json({ message: 'Tittel og melding må fylles ut' });
    }

    const allowedVisibility = ['customer support', 'utvikling', 'drift', 'admin'];
    const visibleArray = Array.isArray(visibleTo)
        ? visibleTo
        : visibleTo
            ? [visibleTo]
            : [];
    const visibleFiltered = [...new Set(visibleArray
        .map((value) => String(value).trim())
        .filter((value) => allowedVisibility.includes(value)))];
    const visibleString = visibleFiltered.length > 0
        ? visibleFiltered.join(',')
        : 'customer support';

    const insertProblem = db.prepare('INSERT INTO problem (brukerId, tittel, status, visibleTo) VALUES (?, ?, ?, ?)');
    const info = insertProblem.run(req.session.bruker.id, tittel, 'åpen', visibleString);
    const problemId = info.lastInsertRowid;

    const insertMelding = db.prepare('INSERT INTO melding (problemId, brukerId, tekst) VALUES (?, ?, ?)');
    insertMelding.run(problemId, req.session.bruker.id, tekst);

    res.json({ message: 'Problem opprettet', id: problemId });
});

// Support/admin/utvikling/drift: hent åpne problemer
app.get('/api/support/problemer', kreverRolle('customer support', 'utvikling', 'drift', 'admin'), (req, res) => {
    let problemer;
    if (req.session.bruker.rolle === 'admin') {
        problemer = db.prepare(`SELECT p.id, p.tittel, p.status, p.opprettet, p.visibleTo, u.fornavn, u.etternavn
            FROM problem p
            JOIN person u ON u.id = p.brukerId
            WHERE p.status = 'åpen'
            ORDER BY p.opprettet DESC`).all();
    } else {
        const rolle = req.session.bruker.rolle;
        problemer = db.prepare(`SELECT p.id, p.tittel, p.status, p.opprettet, p.visibleTo, u.fornavn, u.etternavn
            FROM problem p
            JOIN person u ON u.id = p.brukerId
            WHERE p.status = 'åpen'
              AND (',' || p.visibleTo || ',') LIKE ?
            ORDER BY p.opprettet DESC`).all(`%,${rolle},%`);
    }
    res.json({ problemer });
});

// Hent meldinger for et problem (kunde må eie problemet, support/admin kan se alle)
app.get('/api/problemer/:id/meldinger', kreverInnlogging, (req, res) => {
    const problemId = req.params.id;
    const problem = db.prepare('SELECT * FROM problem WHERE id = ?').get(problemId);
    if (!problem) return res.status(404).json({ message: 'Fant ikke problem' });

    if (req.session.bruker.rolle === 'kunder' && req.session.bruker.id !== problem.brukerId) {
        return res.status(403).json({ message: 'Ingen tilgang til dette problemet' });
    }

    if (req.session.bruker.rolle !== 'admin' && req.session.bruker.rolle !== 'kunder') {
        const visibleTo = problem.visibleTo || 'customer support';
        const visibleRoles = visibleTo.split(',').map((value) => value.trim());
        if (!visibleRoles.includes(req.session.bruker.rolle)) {
            return res.status(403).json({ message: 'Ingen tilgang til dette problemet' });
        }
    }

    const meldinger = db.prepare(`SELECT m.id, m.tekst, m.opprettet, p.fornavn, p.etternavn, p.id as senderId
        FROM melding m
        JOIN person p ON p.id = m.brukerId
        WHERE m.problemId = ?
        ORDER BY m.opprettet ASC`).all(problemId);

    res.json({ problem, meldinger });
});

// Hent problemer for innlogget kunde
app.get('/api/problemer/mine', kreverRolle('kunder'), (req, res) => {
    const problemer = db.prepare('SELECT id, tittel, status, opprettet FROM problem WHERE brukerId = ? ORDER BY opprettet DESC').all(req.session.bruker.id);
    res.json({ problemer });
});

// Send melding i en problem-tråd
app.post('/api/problemer/:id/meldinger', kreverInnlogging, (req, res) => {
    const problemId = req.params.id;
    const { tekst } = req.body;
    if (!tekst) return res.status(400).json({ message: 'Tekst må fylles ut' });

    const problem = db.prepare('SELECT * FROM problem WHERE id = ?').get(problemId);
    if (!problem) return res.status(404).json({ message: 'Fant ikke problem' });

    if (req.session.bruker.rolle === 'kunder' && req.session.bruker.id !== problem.brukerId) {
        return res.status(403).json({ message: 'Ingen tilgang til dette problemet' });
    }

    const stmt = db.prepare('INSERT INTO melding (problemId, brukerId, tekst) VALUES (?, ?, ?)');
    stmt.run(problemId, req.session.bruker.id, tekst);
    res.json({ message: 'Melding sendt' });
});

// Support/admin: merk problem som løst (slett problem + meldinger)
app.post('/api/problemer/:id/ferdig', kreverRolle('customer support', 'admin'), (req, res) => {
    const problemId = req.params.id;
    const problem = db.prepare('SELECT * FROM problem WHERE id = ?').get(problemId);
    if (!problem) return res.status(404).json({ message: 'Fant ikke problem' });

    const delMeldinger = db.prepare('DELETE FROM melding WHERE problemId = ?');
    delMeldinger.run(problemId);
    const delProblem = db.prepare('DELETE FROM problem WHERE id = ?');
    delProblem.run(problemId);

    res.json({ message: 'Problem markert som løst og fjernet' });
});

// Rute for å legge til ein ny person (alltid som 'kunder')
app.post("/api/leggtilperson", async (req, res) => {
    const { fornavn, etternavn, passord } = req.body;

    // Validering av input-data
    if (!fornavn || !etternavn || !passord) {
        return res.status(400).json({ message: "Fornavn, etternavn og passord må fylles ut" });
    }

    // Sjekk om brukeren allerede finnes
    const eksisterendeBruker = db.prepare("SELECT * FROM person WHERE fornavn = ?").get(fornavn);
    if (eksisterendeBruker) {
        return res.status(400).json({ message: "Bruker med dette fornavnet finnes allerede" });
    }

    try {
        // Hash passordet med bcrypt
        const saltRounds = 10;
        const hashPassord = await bcrypt.hash(passord, saltRounds);

        // Nye brukere registreres ALLTID som 'kunder'
        const rolle = 'kunder';

        const stmt = db.prepare("INSERT INTO person (fornavn, etternavn, passord, rolle) VALUES (?, ?, ?, ?)");
        const info = stmt.run(fornavn, etternavn, hashPassord, rolle);

        res.status(201).json({ message: "Ny bruker opprettet som Kunde", id: info.lastInsertRowid });
    } catch (error) {
        console.error("Feil ved oppretting av bruker:", error);
        res.status(500).json({ message: "Noe gikk galt på serveren" });
    }
});

// Rute for å logge inn
app.post("/api/login", async (req, res) => {
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
    req.session.bruker = { id: bruker.id, fornavn: bruker.fornavn, rolle: bruker.rolle };
    res.json({ message: "Innlogging vellykket" });
});

// Rute for å slette egen kundekonto
app.post('/api/slettmeg', kreverRolle('kunder'), (req, res) => {
    const brukerId = req.session.bruker.id;
    const eksisterendeProblem = db.prepare('SELECT 1 FROM problem WHERE brukerId = ? LIMIT 1').get(brukerId);
    if (eksisterendeProblem) {
        return res.status(403).json({ message: 'Du kan ikke slette brukeren fordi du har minst ett problem knyttet til kontoen din.' });
    }

    const slettPerson = db.prepare('DELETE FROM person WHERE id = ?');
    slettPerson.run(brukerId);

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved sletting av konto' });
        }
        res.json({ message: 'Kontoen er slettet' });
    });
});

// Rute for å logge ut
app.post("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Du er logget ut" });
});

// Starter serveren
app.listen(PORT, () => {
    console.log(`Server oppe: http://localhost:${PORT}`);
});