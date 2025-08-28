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