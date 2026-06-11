// Registrere ny kundebruker
const formNyKunde = document.querySelector("#formNyKunde");
formNyKunde.addEventListener("submit", registrerKunde);

async function registrerKunde(event) {
    event.preventDefault();

    const fornavn = document.getElementById("fornavn").value;
    const etternavn = document.getElementById("etternavn").value;
    const passord = document.getElementById("passord").value;

    const response = await fetch("/api/leggtilperson", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fornavn,
            etternavn,
            passord
        })
    });

    const result = await response.json();
    alert(result.message);
}

// Logg inn
const formLoggInn = document.querySelector("#formLoggInn");
formLoggInn.addEventListener("submit", loggInn);

async function loggInn(event) {
    event.preventDefault();

    const fornavn = document.getElementById("fornavnLogin").value;
    const passord = document.getElementById("passordLogin").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fornavn, passord })
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = "/beskyttet";
    } else {
        alert(result.message);
    }
}