    // Beispiel-Daten (könnte später aus SQLite kommen)
    const games = [
      { id: 1, title: "Resident Evil 4", tags: ["horror", "3d"], genre: "Horror-Action", release: 2023, description: "Ein moderner Survival-Horror-Klassiker mit intensiver Atmosphäre." },
      { id: 2, title: "Hollow Knight", tags: ["2d", "action"], genre: "2D Action", release: 2017, description: "Ein wunderschönes Metroidvania mit packendem Gameplay." },
      { id: 3, title: "Doom Eternal", tags: ["3d", "action"], genre: "Shooter", release: 2020, description: "Rasantes First-Person-Shooter-Gameplay gegen Dämonen aus der Hölle." },
      { id: 4, title: "Undertale", tags: ["2d", "rpg"], genre: "RPG", release: 2015, description: "Ein einzigartiges Rollenspiel, bei dem deine Entscheidungen alles verändern." },
      { id: 5, title: "Dead Space", tags: ["horror", "3d"], genre: "Sci-Fi Horror", release: 2008, description: "Science-Fiction-Horror mit intensiver Atmosphäre und furchterregenden Gegnern." }
    ];

    const tagSelect = document.getElementById("tagSelect");
    const gameGrid = document.getElementById("gameGrid");
    const showInfoBtn = document.getElementById("showInfoBtn");
    const gameInfo = document.getElementById("gameInfo");

    let selectedGame = null;

    // Spiele-Grid anzeigen
    function renderGames(filterTag = "all") {
      gameGrid.innerHTML = "";
      const filteredGames = filterTag === "all" ? games : games.filter(g => g.tags.includes(filterTag));

      filteredGames.forEach(game => {
        const div = document.createElement("div");
        div.className = "game-box";
        div.textContent = game.title;
        div.onclick = () => selectGame(game, div);
        gameGrid.appendChild(div);
      });
    }

    // Spiel auswählen
    function selectGame(game, div) {
      document.querySelectorAll(".game-box").forEach(b => b.classList.remove("selected"));
      div.classList.add("selected");
      selectedGame = game;
    }

    // Spiel-Info anzeigen
    showInfoBtn.addEventListener("click", () => {
      if (!selectedGame) {
        gameInfo.innerHTML = `
          <h2>Kein Spiel ausgewählt</h2>
          <p>Bitte wähle unten ein Spiel aus.</p>
        `;
        return;
      }

      gameInfo.innerHTML = `
        <h2>${selectedGame.title}</h2>
        <p><strong>Genre:</strong> ${selectedGame.genre}</p>
        <p><strong>Release:</strong> ${selectedGame.release}</p>
        <p><strong>Tags:</strong> ${selectedGame.tags.join(", ")}</p>
        <p>${selectedGame.description}</p>
      `;
    });

    // Filter ändern
    tagSelect.addEventListener("change", (e) => {
      renderGames(e.target.value);
      selectedGame = null;
      gameInfo.innerHTML = `
        <h2>Kein Spiel ausgewählt</h2>
        <p>Bitte wähle unten ein Spiel aus und drücke den Button oben.</p>
      `;
    });

    // Initiales Rendern
    renderGames();