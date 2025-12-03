# Projekt: Gaming-Bewertungsplattform

Min idé für [dieses Projekt](https://github.com/Praisetheprogramm/Praisetheprogramm.github.io/tree/main/arkiv/game-projekt2025) ist es, eine Webseite für Spieltests und -bewertungen zu schaffen, um kleinen und unerfahrenen Entwicklern eine Plattform zu geben.

![datenbank](./readme-images/databaser.png)

---

## Projektbeschreibung

Das Projekt ist eine **Gaming-Bewertungsplattform**, auf der eingeloggte Nutzer Spiele anschauen, bewerten und kommentieren können. Es gibt auch die Möglichkeit, neue Spiele zur Datenbank hinzuzufügen.

---

## Code-Zusammenfassung

### 1. **server.js** - Express Backend

Der Server ist das Herzstück der Anwendung und verwaltet alle Routen und die Datenbankinteraktion:

#### Authentifizierung:
- **POST `/register`**: Registrierung neuer Benutzer
  - Validiert Eingaben (Passwort mindestens 6 Zeichen)
  - Hasht Passwörter mit bcrypt für Sicherheit
  - Erstellt automatisch eine Session nach erfolgreicher Registrierung
  - Prüft auf doppelte Benutzernamen/E-Mails

- **POST `/login`**: Benutzer-Login
  - Akzeptiert Benutzername oder E-Mail als Identifier
  - Validiert Passwort gegen gespeicherten Hash
  - Erstellt Session bei erfolgreicher Authentifizierung

- **POST `/logout`**: Sitzung beenden
  - Zerstört die aktuelle Session

#### Geschützte Routen (erfordern Login):
- **GET `/api/user`**: Gibt aktuelle Benutzerinformationen zurück

#### Spiel-Management:
- **GET `/games`**: Holt alle Spiele aus der Datenbank
- **GET `/games/byTag/:tagId`**: Filtert Spiele nach Tag-ID mittels JOIN
- **GET `/unique-games`**: Holt spezielle/einzigartige Spiele
- **POST `/leggtilgame`**: Fügt neues Spiel hinzu (mit Tag-Verarbeitung und Transaktionen)

#### Bewertungssystem:
- **POST `/rating`**: Speichert eine Bewertung (1-10) für ein Spiel
  - Authentifizierung erforderlich
  - Prüft, ob Nutzer das Spiel bereits bewertet hat
  - Speichert Rating und optionalen Kommentar

- **GET `/ratings/:gameId`**: Holt alle Bewertungen für ein Spiel
- **GET `/ratings/average/:gameId`**: Berechnet Durchschnittsbewertung (Backend - Code sichtbar in code.js)

#### Middleware & Sicherheit:
- Session-Handling mit express-session
- Passwort-Hashing mit bcrypt
- Authentifizierungs-Middleware (`requireAuth`) für geschützte Routen
- CORS-sichere Cookies mit `sameSite: 'lax'`

---

### 2. **login.html & login.js** - Authentifizierungs-UI

#### HTML (`login.html`):
- Einfaches Design mit Card-Layout
- Zwei Tabs: **Login** und **Registrierung**
- Tab-Wechsel über Links ("Noch keinen Account? Registrieren" / "Schon registriert? Anmelden")
- Fehleranzeige unter jedem Formular

#### JavaScript (`login.js`):
- **Login-Funktion**:
  - Validiert Eingaben (Identifier + Passwort erforderlich)
  - Sendet POST-Request an `/login` mit JSON-Daten
  - Bei Erfolg: Redirect zur Startseite (`/`)
  - Fehlerausgabe bei Fehlschlag

- **Registrierungs-Funktion**:
  - Validiert Benutzername, E-Mail und Passwort
  - Prüft Passwortlänge (min. 6 Zeichen)
  - Sendet POST-Request an `/register` mit JSON-Daten
  - Bei Erfolg: Automatischer Redirect zur Hauptseite
  - Fehlerausgabe bei Konflikten (z.B. doppelter Benutzername)

- **Features**:
  - Enter-Taste aktiviert Login/Registrierung
  - Session-Cookies werden automatisch mit `credentials: 'same-origin'` gesendet
  - Fehlermeldungen werden gelöscht, wenn Benutzer zwischen Tabs wechselt

---

### 3. **index.html** - Hauptseite (Desktop)

Die Startseite ist eine interaktive Spiel-Browser mit folgenden Elementen:

#### Header:
- **Tag-Filter Dropdown**: Filtern nach RPG, Horror, 3D, 2D, Action, Strategy, Open-World, Jump and Run etc.
- **Button "Spiel-Info anzeigen"**: Zeigt Details und Bewertungen des ausgewählten Spiels
- **Button "Einzigartige Spiele"**: Navigiert zu einer Seite mit speziellen Spielen
- **Button "Inn Logging"**: Navigiert zur Login-Seite

#### Hauptbereich:
- **Spiel-Grid**: Zeigt verfügbare Spiele als anklickbare Boxen an
- **Spiel-Info Section**: Detailanzeige mit Beschreibung, Genre, Release-Jahr und Bewertungen
- **"Neues Game hinzufügen" Button**: Öffnet Popup-Formular

#### Popup: Neues Spiel hinzufügen
- **Eingabefelder**: Titel, Tags (Akkordeon mit Checkbox-Limit von 4), Beschreibung, Developer
- **Tags-Akkordeon**: Expandierbar/kollabierbar mit Zähler (zeigt wie viele Tags ausgewählt)
- **Speichern/Abbrechen Buttons**

#### Bewertungs-Popup
- **Dropdown**: Bewertung 1-10 mit Beschreibungen
- **Textarea**: Optionaler Kommentar
- **Anzeige**: Bereich für vorhandene Bewertungen
- **Buttons**: Bewertung abgeben / Abbrechen

---

### 4. **code.js** - Frontend-Logik (Hauptanwendung)

Dieses Script verwaltet alle interaktiven Features der Gaming-Plattform:

#### DOM-Elemente & Initialisierung:
- Referenzen zu allen wichtigen HTML-Elementen (Grid, Popups, Buttons)
- Mapping von Spiel-IDs zu Hintergrundbildern
- Tags-Akkordeon-Setup mit Arrow-Animation

#### Spiel-Verwaltung:
- **`fetchGames(tag)`**: Holt Spiele vom Backend
  - Unterstützt optionales Tag-Filtering via Query-Parameter
  - Fallback zu allen Spielen bei Tag="all"

- **`selectGame(game, div)`**: Markiert ausgewähltes Spiel
  - Entfernt "selected"-Klasse von vorherigen Spielen
  - Speichert aktuelles Spiel in `selectedGame`-Variable

#### Spielanzeige:
- **`renderGames(games)`**: Rendert Spiele als Grid-Boxen
  - Nutzt Hintergrundbild-Mapping falls vorhanden
  - Zeigt Spiel-Titel und "★ Bewerten"-Button
  - Lädt und zeigt Durchschnittsbewertung unter jedem Spiel
  - Click-Handler für Spielauswahl

- **`loadAverageRating(gameId, gameElement)`**: Lädt Durchschnittsbewertung
  - Fetch zu `/ratings/average/{gameId}`
  - Zeigt Durchschnitt und Anzahl der Bewertungen an

#### Spiel-Informationen anzeigen:
- **Event-Listener auf "Spiel-Info anzeigen" Button**:
  - Zeigt Titel, Genre, Release-Jahr, Tags, Beschreibung
  - Lädt und rendert alle Bewertungen für das Spiel
  - Zeigt Bewertungen mit Sternen-Anzeige und Kommentare
  - Fehlerbehandlung für fehlende Spiel-IDs

#### Tag-Verwaltung:
- **Tags-Akkordeon Toggle**: Öffnet/schließt die Tag-Liste mit Animation
- **`updateTagCount()`**: Aktualisiert die Anzeige der ausgewählten Tags (max. 4)
- **Checkbox-Validierung**: Verhindert mehr als 4 gleichzeitig ausgewählte Tags

#### Neues Spiel hinzufügen:
- **Popup öffnen**: Setzt Tags zurück, zeigt Modal
- **Formular absenden**:
  - Sammelt Titel, ausgewählte Tags, Beschreibung, Developer
  - Validiert, dass mindestens ein Tag ausgewählt ist
  - Sendet POST-Request an `/leggtilgame`
  - Aktualisiert Spiel-Grid nach erfolgreichem Speichern
  - Zeigt Popup-Fehler bei Problemen

#### Bewertungssystem:
- **`openRatingPopup(gameId, gameTitle)`**: Öffnet Bewertungs-Modal
  - Lädt vorhandene Bewertungen
  - Setzt Formular zurück
  - Zeigt Spiel-Titel in Modal-Heading

- **`loadExistingRatings(gameId)`**: Lädt und zeigt bisherige Bewertungen
  - Holt Ratings von `/ratings/{gameId}`
  - Zeigt Benutzername, Bewertung (Sterne), Kommentar und Datum
  - Versteckt Bereich wenn keine Bewertungen vorhanden

- **Bewertungs-Form absenden**:
  - Sammelt Bewertung (1-10) und optionalen Kommentar
  - Sendet POST-Request an `/rating` mit Session-Cookies
  - Validiert Bewertungs-Range auf Backend
  - Aktualisiert Spiel-Grid nach erfolgreicher Bewertung
  - Fehlerbehandlung für bereits bewertete Spiele

#### Navigation:
- **Login-Button**: Navigiert zu `/login.html`
- **Einzigartige Spiele-Button**: Navigiert zu `/our_unique_games.html`

#### Tag-Filtering:
- **Event-Listener auf Tag-Dropdown**:
  - Bei Auswahl eines Tags: Filtert Spiele über `/games/byTag/{tagId}`
  - "Alle Tags" zeigt wieder alle Spiele

---

## Datenfluss Übersicht

```
Benutzer öffnet App
    ↓
Server prüft Session
    ├─ Keine Session → login.html
    └─ Session vorhanden → index.html
         ↓
    Spiele laden von /games
    Benutzer wählt Spiel
         ↓
    Klick auf "Spiel-Info" oder "★ Bewerten"
         ├─ Info: Zeigt Spieldetails + bisherige Bewertungen
         └─ Bewertung: Öffnet Modal
              ↓
         Benutzer gibt Bewertung (1-10) + Kommentar ein
              ↓
         POST zu /rating
              ↓
         Server speichert Bewertung (prüft ob bereits bewertet)
              ↓
         UI aktualisiert, Durchschnittsbewertung neu berechnet
```

---

## Technologie-Stack

| Komponente | Technologie |
|-----------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Datenbank | SQLite (better-sqlite3) |
| Authentifizierung | bcrypt, express-session |
| Server-Port | 3000 |

---

## Fortschritt

- **10. November 2025**: Datenbank erstellt, grundlegendes Konzept geplant
- **11. November 2025**: Server-Setup und Datenbank-Integration gestartet
- **3. Dezember 2025**: Authentifizierung, Spiel-Management und Bewertungssystem vollständig implementiert 