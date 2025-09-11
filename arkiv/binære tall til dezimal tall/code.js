document.getElementById("convertBtn").addEventListener("click", function() {
  const binary = document.getElementById("binaryInput").value;

  // Prüfen ob Eingabe gültig ist (nur 0 und 1 erlaubt)
  if (!/^[01]+$/.test(binary)) {
    document.getElementById("result").textContent = "Bitte nur 0 und 1 eingeben!";
    return;
  }

  // Umwandlung Binär → Dezimal
  const decimal = parseInt(binary, 2);  // Basis 2
  document.getElementById("result").textContent = decimal;
});

function checkAge() {
  const age = parseInt(document.getElementById("ageInput").value);

  if (isNaN(age)) {
    alert("Vennligst skriv inn et gyldig nummer.");
    return;
  }

  if (age < 18) {
    alert("Dessverre er du for ung for denne siden.");
    window.close(); // Versucht die Seite zu schließen kann vom browser geblockt werden
  } 
    else {
      document.getElementById("ageModal").style.display = "none";
  }
}

// Optional: Modal automatisch beim Laden anzeigen
window.onload = function () {
  document.getElementById("ageModal").style.display = "flex";
};


// function ChatFrend() {
//   const chat = parseInt(document.getElementById("chatInput").value)

//   let inndata = document.getElementById("chatInn").value;
//     console.log(inndata);

//   if (inndata.)
// }


// function Grubattack () {
//   const obj = document.getElementById("meinObjekt");
//   obj.style.visibility = "visible";

//   const.audio = document.getElementById("Grubsound");
//   audio.play()

//   // Nach 0.5 Sekunden wieder unsichtbar machen
//   setTimeout(() => {
//     obj.style.visibility = "hidden";
//   }, 500);
// }

// // Alle 60 Sekunden ausführen
// setInterval(Grubattack, 60000);