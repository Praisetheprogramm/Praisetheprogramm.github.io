// Server-bit
const express = require('express');
const app = express();

const PORT = 3000;

// Databasen
const Database = require('better-sqlite3');
const db = new Database ('Chat.db');

//Serve statiske filer fra client-mappen
app.use(express.static('client'));

//Eksempel på en rute
app.get('/', (req, res) => {     
    res.send("Hei!");
    //res.sendFile(__dirname + '/client/index.html');
});

// Eksemple på en rute
app.get('/hentMeldinger', (req, res) => {
    const row = db.prepare('SELECT * FROM Messages').all();
    res.json(row);
});

// Åpner en viss port på serveren, og nå kjører den
app.listen(PORT, () => {
    console.log('Server kjører på port 3000')
});

