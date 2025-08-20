window.onload = async () => {
    const res = await fetch('/games');
    const data = await res.json();
    const container = document.getElementById('games');
    const search = document.getElementById('search');
  
    function renderGames(filter = '') {
      container.innerHTML = '';
      data
        .filter(g => g.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(game => {
          const div = document.createElement('div');
          div.innerHTML = `
            <h2>${game.name}</h2>
            <p>${game.summary}</p>
            <p>⛳ Erfahrung: ${game.level}</p>
            <p>⭐ Bewertung: ${game.rating}/10</p>
            <div style="background:#eee;width:200px;height:10px;">
              <div style="background:#69f;width:${game.rating * 10}%;height:10px;"></div>
            </div>
          `;
          container.appendChild(div);
        });
    }
  
    search.addEventListener('input', e => renderGames(e.target.value));
    renderGames();
  };