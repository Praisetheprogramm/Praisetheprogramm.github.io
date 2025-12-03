async function postJson(url, body) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // wichtig: Session-Cookies senden/empfangen (same-origin)
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (error) {
        console.error("Network error:", error);
        return { ok: false, status: 0, data: { error: "Netzwerkfehler" } };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formTitle = document.getElementById("formTitle");
    const formArea = document.getElementById("formArea");
    const registerArea = document.getElementById("registerArea");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // Formular-Wechsel
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        formArea.style.display = "none";
        registerArea.style.display = "block";
        formTitle.textContent = "Registrieren";
        clearErrors();
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        formArea.style.display = "block";
        registerArea.style.display = "none";
        formTitle.textContent = "Anmelden";
        clearErrors();
    });

    // Fehler löschen
    function clearErrors() {
        document.getElementById("errorMsg").textContent = "";
        document.getElementById("regError").textContent = "";
    }

    // Enter-Taste unterstützen
    function setupEnterKey(inputs, button) {
        inputs.forEach(input => {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    button.click();
                }
            });
        });
    }

    // Login
    const loginBtn = document.getElementById("loginBtn");
    const loginInputs = [
        document.getElementById("identifier"),
        document.getElementById("password")
    ];
    
    setupEnterKey(loginInputs, loginBtn);

    loginBtn.addEventListener("click", async () => {
        const identifier = document.getElementById("identifier").value.trim();
        const password = document.getElementById("password").value;
        const error = document.getElementById("errorMsg");
        error.textContent = "";

        if (!identifier || !password) {
            error.textContent = "Bitte Benutzername/E-Mail und Passwort eingeben.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Wird angemeldet...";

        const res = await postJson("/login", { identifier, password });
        
        loginBtn.disabled = false;
        loginBtn.textContent = "Anmelden";

        if (res.ok) {
            // Erfolgreich -> zur Hauptseite
            // Lade die Root-Route; der Server gibt abhängig von Session die richtige Seite aus
            window.location.href = "/";
        } else {
            error.textContent = res.data?.error || "Login fehlgeschlagen";
        }
    });

    // Registrierung
    const registerBtn = document.getElementById("registerBtn");
    const registerInputs = [
        document.getElementById("reg_username"),
        document.getElementById("reg_email"),
        document.getElementById("reg_password")
    ];
    
    setupEnterKey(registerInputs, registerBtn);

    registerBtn.addEventListener("click", async () => {
        const username = document.getElementById("reg_username").value.trim();
        const email = document.getElementById("reg_email").value.trim();
        const password = document.getElementById("reg_password").value;
        const error = document.getElementById("regError");
        error.textContent = "";

        if (!username || !email || !password) {
            error.textContent = "Bitte alle Felder ausfüllen.";
            return;
        }

        if (password.length < 6) {
            error.textContent = "Passwort muss mindestens 6 Zeichen lang sein.";
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = "Wird registriert...";

        const res = await postJson("/register", { username, email, password });
        
        registerBtn.disabled = false;
        registerBtn.textContent = "Registrieren";

        if (res.ok) {
            // Erfolgreich -> zur Hauptseite
            // Lade die Root-Route; der Server gibt abhängig von Session die richtige Seite aus
            window.location.href = "/";
        } else {
            error.textContent = res.data?.error || "Registrierung fehlgeschlagen";
        }
    });
});