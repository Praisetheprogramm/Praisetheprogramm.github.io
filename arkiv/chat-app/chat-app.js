// HTML-Elemente holen
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('message-input');
const chatBox = document.getElementById('chat-box');

// Funktion: Nachricht anzeigen
function sendMessage() {
  const messageText = input.value.trim(); // Text holen & Leerzeichen entfernen

  if (messageText === "") return; // nichts senden, wenn leer

  // Neue Nachricht erstellen
  const message = document.createElement('div');
  message.classList.add('message');
  message.textContent = messageText;

  // Nachricht in den Chat einfügen
  chatBox.appendChild(message);

  // Eingabefeld leeren
  input.value = "";

  // Automatisch nach unten scrollen
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Wenn auf "Senden" geklickt wird
sendBtn.addEventListener('click', sendMessage);

// Wenn Enter gedrückt wird
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();
});