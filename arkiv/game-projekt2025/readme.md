# Project: Gaming Review Platform

This [project](https://github.com/Praisetheprogramm/Praisetheprogramm.github.io/tree/main/arkiv/game-projekt2025/public/index.html) aims to create a gaming review website where inexperienced developers can share and receive feedback on their games.

![database](./readme-images/databaser.png)

---

## Project Overview

A **gaming review platform** where authenticated users can browse games, rate them, add comments, and submit new games to the database.

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

## Progress

- **November 10, 2025**: Database created, basic concept planned
- **November 11, 2025**: Server setup and database integration started
- **December 3, 2025**: Authentication, game management, and rating system fully implemented 