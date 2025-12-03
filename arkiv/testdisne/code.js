// Funktion zum Erstellen der Box mit Button
function createGameRatingBox(gameId, gameTitle) {
    // Box erstellen
    const box = document.createElement('div');
    box.className = 'game-rating-box';
    box.style.border = '1px solid #ddd';
    box.style.padding = '20px';
    box.style.margin = '10px';
    box.style.borderRadius = '8px';
    box.style.backgroundColor = '#f9f9f9';
    
    // Titel hinzufügen
    const title = document.createElement('h3');
    title.textContent = gameTitle || `Spiel #${gameId}`;
    box.appendChild(title);
    
    // Button erstellen
    const button = document.createElement('button');
    button.textContent = 'Bewertungen anzeigen';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Bereich für die Bewertungen
    const ratingsContainer = document.createElement('div');
    ratingsContainer.id = `ratings-${gameId}`;
    ratingsContainer.style.marginTop = '15px';
    
    // Event Listener für den Button
    button.addEventListener('click', async function() {
        // Loading-Status anzeigen
        ratingsContainer.innerHTML = '<p>Lade Bewertungen...</p>';
        
        try {
            // API aufrufen
            const response = await fetch(`/ratings/${gameId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP Fehler: ${response.status}`);
            }
            
            const ratings = await response.json();
            
            // Bewertungen anzeigen
            if (ratings.length === 0) {
                ratingsContainer.innerHTML = '<p>Noch keine Bewertungen vorhanden.</p>';
            } else {
                ratingsContainer.innerHTML = '';
                
                ratings.forEach(rating => {
                    const ratingElement = document.createElement('div');
                    ratingElement.className = 'rating-item';
                    ratingElement.style.borderBottom = '1px solid #eee';
                    ratingElement.style.padding = '10px 0';
                    
                    // Sterne anzeigen (falls Rating 1-5)
                    const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
                    
                    ratingElement.innerHTML = `
                        <div style="color: gold; font-size: 18px;">${stars}</div>
                        <p><strong>Bewertung:</strong> ${rating.rating}/5</p>
                        ${rating.comment ? `<p><strong>Kommentar:</strong> ${rating.comment}</p>` : ''}
                        <small style="color: #666;">${new Date(rating.created_at).toLocaleDateString('de-DE')}</small>
                    `;
                    
                    ratingsContainer.appendChild(ratingElement);
                });
            }
            
        } catch (error) {
            console.error('Fehler beim Laden der Bewertungen:', error);
            ratingsContainer.innerHTML = '<p style="color: red;">Fehler beim Laden der Bewertungen.</p>';
        }
    });
    
    // Elemente zur Box hinzufügen
    box.appendChild(button);
    box.appendChild(ratingsContainer);
    
    return box;
}

// Beispiel für die Verwendung:
document.addEventListener('DOMContentLoaded', function() {
    // Container für die Boxen
    const container = document.getElementById('games-container') || document.body;
    
    // Beispiel: Box für Spiel mit ID 123 erstellen
    const gameBox1 = createGameRatingBox(123, 'Super Mario Bros');
    container.appendChild(gameBox1);
    
    // Beispiel: Box für Spiel mit ID 456 erstellen
    const gameBox2 = createGameRatingBox(456, 'The Legend of Zelda');
    container.appendChild(gameBox2);
    
    // Weitere Boxen können dynamisch hinzugefügt werden
});

// Verbesserte Version mit CSS-Klassen
function createStyledGameRatingBox(gameId, gameTitle) {
    const box = document.createElement('div');
    box.className = 'game-rating-box';
    
    const title = document.createElement('h3');
    title.textContent = gameTitle || `Spiel #${gameId}`;
    box.appendChild(title);
    
    const button = document.createElement('button');
    button.className = 'rating-button';
    button.textContent = 'Bewertungen anzeigen';
    
    const ratingsContainer = document.createElement('div');
    ratingsContainer.className = 'ratings-container';
    ratingsContainer.id = `ratings-${gameId}`;
    
    button.addEventListener('click', async function() {
        if (ratingsContainer.hasChildNodes()) {
            // Bereits geladen - ausblenden/einblenden
            ratingsContainer.style.display = 
                ratingsContainer.style.display === 'none' ? 'block' : 'none';
            return;
        }
        
        ratingsContainer.innerHTML = '<p>Lade Bewertungen...</p>';
        
        try {
            const response = await fetch(`/ratings/${gameId}`);
            const ratings = await response.json();
            
            ratingsContainer.innerHTML = '';
            
            if (ratings.length === 0) {
                ratingsContainer.innerHTML = '<p>Noch keine Bewertungen vorhanden.</p>';
                return;
            }
            
            ratings.forEach(rating => {
                const ratingElement = document.createElement('div');
                ratingElement.className = 'rating-item';
                
                const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
                
                ratingElement.innerHTML = `
                    <div class="rating-stars">${stars}</div>
                    <p><strong>Bewertung:</strong> ${rating.rating}/5</p>
                    ${rating.comment ? `<p class="rating-comment"><strong>Kommentar:</strong> ${rating.comment}</p>` : ''}
                    <small class="rating-date">${new Date(rating.created_at).toLocaleDateString('de-DE')}</small>
                `;
                
                ratingsContainer.appendChild(ratingElement);
            });
            
        } catch (error) {
            console.error('Fehler:', error);
            ratingsContainer.innerHTML = '<p style="color: red;">Fehler beim Laden der Bewertungen.</p>';
        }
    });
    
    box.appendChild(button);
    box.appendChild(ratingsContainer);
    
    return box;
}