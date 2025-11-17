// public/login.js
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

document.addEventListener("DOMContentLoaded", () => {
  const formTitle = document.getElementById("formTitle");
  const formArea = document.getElementById("formArea");
  const registerArea = document.getElementById("registerArea");

  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");

  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    formArea.style.display = "none";
    registerArea.style.display = "block";
    formTitle.textContent = "Registrieren";
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    formArea.style.display = "block";
    registerArea.style.display = "none";
    formTitle.textContent = "Anmelden";
  });

  // Login
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("errorMsg");
    error.textContent = "";

    if (!identifier || !password) { error.textContent = "Bitte beides eingeben."; return; }

    const res = await postJson("/login", { identifier, password });
    if (!res.ok) {
      error.textContent = res.data && res.data.error ? res.data.error : "Login fehlgeschlagen";
      return;
    }
    // Erfolg -> weiterleiten zur Hauptseite
    window.location.href = "/index.html";
  });

  // Register
  document.getElementById("registerBtn").addEventListener("click", async () => {
    const username = document.getElementById("reg_username").value.trim();
    const email = document.getElementById("reg_email").value.trim();
    const password = document.getElementById("reg_password").value;
    const error = document.getElementById("regError");
    error.textContent = "";

    if (!username || !email || !password) { error.textContent = "Alle Felder ausfüllen."; return; }

    const res = await postJson("/register", { username, email, password });
    if (!res.ok) {
      error.textContent = res.data && res.data.error ? res.data.error : "Registrierung fehlgeschlagen";
      return;
    }
    // Erfolg -> weiterleiten zur Hauptseite
    window.location.href = "/index.html";
  });
});