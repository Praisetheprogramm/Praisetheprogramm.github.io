// Clean, single-file client script for beskyttet area
// Lar brukeren kunne logge ut
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) window.location.href = '/';
        else alert('Noe gikk galt ved utlogging');
    });
}

// Hent og vis brukerdata, og initialiser seksjoner basert på rolle
async function hentBrukerData() {
    const response = await fetch('/api/minside');
    if (!response.ok) return alert('Kunne ikke hente brukerdata');
    const { bruker } = await response.json();
    const brukerDataDiv = document.getElementById('brukerData');
    brukerDataDiv.innerHTML = `
        <p><strong>Kundenummer:</strong> ${bruker.id}</p>
        <p><strong>Fornavn:</strong> ${bruker.fornavn}</p>
        <p><strong>Etternavn:</strong> ${bruker.etternavn}</p>
        <p><strong>Rolle:</strong> ${bruker.rolle}</p>
    `;

    // Vis/hide seksjoner
    const kundeProblemerSeksjon = document.getElementById('kundeProblemerSeksjon');
    if (kundeProblemerSeksjon) kundeProblemerSeksjon.style.display = (bruker.rolle === 'kunder') ? 'block' : 'none';

    const supportSeksjon = document.getElementById('supportMeldingerSeksjon');
    if (supportSeksjon) supportSeksjon.style.display = (['customer support','utvikling','drift','admin'].includes(bruker.rolle)) ? 'block' : 'none';

    const csSeksjon = document.getElementById('customerSupportSeksjon');
    if (csSeksjon) csSeksjon.style.display = (['customer support','admin'].includes(bruker.rolle)) ? 'block' : 'none';

    const adminSeksjon = document.getElementById('adminSeksjon');
    if (adminSeksjon) adminSeksjon.style.display = (bruker.rolle === 'admin') ? 'block' : 'none';

    const slettKontoButton = document.getElementById('slettKontoButton');
    const slettKontoHint = document.getElementById('slettKontoHint');
    if (slettKontoButton) {
        slettKontoButton.style.display = (bruker.rolle === 'kunder') ? 'inline-block' : 'none';
        if (bruker.rolle === 'kunder' && slettKontoHint) {
            slettKontoHint.textContent = 'Du kan bare slette kontoen hvis du ikke har noen aktive problemer.';
        }
    }

    // Initialiser data for hver rolle
    if (bruker.rolle === 'kunder') hentMineProblemer();
    if (['customer support','utvikling','drift','admin'].includes(bruker.rolle)) hentSupportProblemer();
    if (bruker.rolle === 'admin') hentAdminData();
}

async function hentAdminData() {
    // 1. Daten vom Server abholen
    const response = await fetch('/api/admin/brukere');
    if (!response.ok) return; // Falls der Server einen Fehler meldet, stoppen

    // 2. Die Daten in ein lesbares JSON-Objekt umwandeln
    const data = await response.json();
    const brukereliste = data.brukere;

    // 3. Den Tabellen-Inhalt (die Zeilen) Zeile für Zeile aufbauen
    let tabellenRader = "";
    for (const bruker of brukereliste) {
        const slettButton = bruker.rolle === 'kunder' 
            ? `<button class="deleteUserBtn" data-id="${bruker.id}" data-name="${bruker.fornavn} ${bruker.etternavn}">Slett</button>`
            : '';
        const rolleDropdown = `<select class="roleSelect" data-id="${bruker.id}" data-current="${bruker.rolle}">
            <option value="kunder" ${bruker.rolle === 'kunder' ? 'selected' : ''}>Kunde</option>
            <option value="customer support" ${bruker.rolle === 'customer support' ? 'selected' : ''}>Kundesupport</option>
            <option value="utvikling" ${bruker.rolle === 'utvikling' ? 'selected' : ''}>Utvikling</option>
            <option value="drift" ${bruker.rolle === 'drift' ? 'selected' : ''}>Drift</option>
            <option value="admin" ${bruker.rolle === 'admin' ? 'selected' : ''}>Admin</option>
        </select>`;
        tabellenRader += `
            <tr>
                <td>${bruker.id}</td>
                <td>${bruker.fornavn}</td>
                <td>${bruker.etternavn}</td>
                <td>${rolleDropdown}</td>
                <td>${slettButton}</td>
            </tr>`;
    }

    // 4. Das fertige HTML in die Webseite einfügen
    const adminDataContainer = document.getElementById('adminData');
    adminDataContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Fornavn</th>
                    <th>Etternavn</th>
                    <th>Rolle</th>
                    <th>Handling</th>
                </tr>
            </thead>
            <tbody>
                ${tabellenRader}
            </tbody>
        </table>`;

    // 5. Delete-Button-Events hinzufügen
    document.querySelectorAll('.deleteUserBtn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.dataset.id;
            const userName = e.target.dataset.name;
            if (confirm(`Slettet bruker "${userName}" virkelig? Dette kan ikke angres.`)) {
                const r = await fetch(`/api/admin/bruker/${userId}/slett`, { method: 'DELETE' });
                const data = await r.json();
                if (r.ok) {
                    alert('Bruker slettet.');
                    hentAdminData(); // Liste aktualisieren
                } else {
                    alert(data.message || 'Feil ved sletting av bruker');
                }
            }
        });
    });

    // 6. Role-Change-Events hinzufügen
    document.querySelectorAll('.roleSelect').forEach((select) => {
        select.addEventListener('change', async (e) => {
            const userId = e.target.dataset.id;
            const newRole = e.target.value;
            const r = await fetch(`/api/admin/bruker/${userId}/rolle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rolle: newRole })
            });
            const data = await r.json();
            if (r.ok) {
                alert(data.message);
                hentAdminData();
            } else {
                alert(data.message || 'Feil ved endring av rolle');
                hentAdminData();
            }
        });
    });
}

async function hentCustomerSupportData() {
    // 1. Daten vom Server abrufen
    const response = await fetch('/api/support/brukere');
    if (!response.ok) return;

    // 2. Daten in JSON umwandeln und Liste herausholen
    const data = await response.json();
    const brukereliste = data.brukere;

    // 3. HTML-Zeilen für jeden Support-Mitarbeiter bauen
    let tabellenRader = "";
    for (const bruker of brukereliste) {
        tabellenRader += `
            <tr>
                <td>${bruker.fornavn}</td>
                <td>${bruker.etternavn}</td>
            </tr>`;
    }

    // 4. Die fertige Tabelle auf der Webseite anzeigen
    const csDiv = document.getElementById('customerSupportData');
    csDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Fornavn</th>
                    <th>Etternavn</th>
                </tr>
            </thead>
            <tbody>
                ${tabellenRader}
            </tbody>
        </table>`;
}

// Hent åpne problemer for support/admin
async function hentSupportProblemer() {
    // 1. Tickets/Probleme vom Server abrufen
    const response = await fetch('/api/support/problemer');
    if (!response.ok) return;

    // 2. Daten in JSON umwandeln und Liste herausholen
    const data = await response.json();
    const problemListe = data.problemer;

    const supportDiv = document.getElementById('supportMeldingerData');

    // 3. Prüfen, ob die Liste leer ist
    if (!problemListe || problemListe.length === 0) {
        supportDiv.innerHTML = '<p>Ingen åpne problemer.</p>';
        return;
    }

    // 4. HTML-Zeilen für jedes Ticket in einer Schleife bauen
    let tabellenRader = "";
    for (const problem of problemListe) {
        // Vorname und Nachname zusammenfügen (falls vorhanden)
        const fulltNavn = `${problem.fornavn || ''} ${problem.etternavn || ''}`;

        tabellenRader += `
            <tr>
                <td>${fulltNavn}</td>
                <td>${problem.tittel}</td>
                <td>${problem.opprettet}</td>
                <td>${problem.visibleTo ? problem.visibleTo : 'customer support'}</td>
                <td>
                    <button data-id="${problem.id}" class="openProblemBtn">Åpne</button>
                </td>
            </tr>`;
    }

    // 5. Die Tabelle in das HTML-Dokument einfügen
    supportDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Kunde</th>
                    <th>Emne</th>
                    <th>Sendt</th>
                    <th>Synlig for</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${tabellenRader}
            </tbody>
        </table>`;

    // 6. Klick-Events für alle "Åpne"-Buttons aktivieren
    const alleKnapper = document.querySelectorAll('.openProblemBtn');
    for (const knapp of alleKnapper) {
        knapp.addEventListener('click', (e) => {
            const problemId = e.currentTarget.dataset.id;
            åpneProblem(problemId);
        });
    }
}

// Hent kundens egne problemer
async function hentMineProblemer() {
    // 1. Eigene Probleme/Tickets vom Server abrufen
    const response = await fetch('/api/problemer/mine');
    const div = document.getElementById('mineProblemer');
    
    // Fehlerbehandlung, falls der Server nicht antwortet
    if (!response.ok) { 
        div.innerHTML = '<p>Kunne ikke hente problemer</p>'; 
        return; 
    }
    
    // 2. Daten in JSON umwandeln und Liste prüfen
    const data = await response.json();
    const problemListe = data.problemer;
    
    if (!problemListe || problemListe.length === 0) { 
        div.innerHTML = '<p>Ingen åpne problemer</p>'; 
        return; 
    }
    
    // 3. HTML-Zeilen für jedes Ticket in einer Schleife bauen
    let htmlInnhold = "";
    for (const problem of problemListe) {
        htmlInnhold += `
            <div class="problemRad">
                <strong>${problem.tittel}</strong> — ${problem.opprettet} 
                <button data-id="${problem.id}" class="openMyProblem">Åpne</button>
            </div>`;
    }
    
    // Das gebaute HTML in die Webseite einfügen
    div.innerHTML = htmlInnhold;
    
    // 4. Klick-Events für alle "Åpne"-Buttons aktivieren
    const alleKnapper = document.querySelectorAll('.openMyProblem');
    for (const knapp of alleKnapper) {
        knapp.addEventListener('click', (e) => {
            const problemId = e.currentTarget.dataset.id;
            åpneProblem(problemId);
        });
    }
}

// Åpne problem-chat og vis meldinger
let aktivProblemId = null;

async function åpneProblem(id) {
    // 1. Nachrichten für das ausgewählte Ticket vom Server laden
    const resp = await fetch(`/api/problemer/${id}/meldinger`);
    if (!resp.ok) { 
        alert('Kunne ikke åpne problem'); 
        return; 
    }
    
    const data = await resp.json();
    aktivProblemId = id; // Die ID global speichern für spätere Server-Anfragen

    // 2. Chat-Bereich sichtbar machen und Titel setzen
    const chatSection = document.getElementById('problemChatSeksjon');
    chatSection.style.display = 'block';
    
    document.getElementById('chatTittel').textContent = data.problem.tittel;

    // 3. Alle Chat-Nachrichten in einer Schleife in HTML umwandeln
    let chatInnhold = "";
    for (const melding of data.meldinger) {
        chatInnhold += `
            <div class="chatRad">
                <strong>${melding.fornavn} ${melding.etternavn}:</strong> ${melding.tekst} 
                <div class="ts">${melding.opprettet}</div>
            </div>`;
    }
    
    const chatDiv = document.getElementById('chatMeldinger');
    chatDiv.innerHTML = chatInnhold;

    // 4. Den Sende-Button für neue Chat-Nachrichten konfigurieren
    document.getElementById('sendChatButton').onclick = async () => {
        const inputFelt = document.getElementById('chatTekst');
        const tekst = inputFelt.value.trim();
        if (!tekst) return; // Leere Nachrichten ignorieren

        // Nachricht per POST-Request an den Server senden
        const r = await fetch(`/api/problemer/${aktivProblemId}/meldinger`, { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ tekst }) 
        });

        if (r.ok) { 
            inputFelt.value = ''; // Textfeld leeren
            åpneProblem(aktivProblemId); // Chat neu laden, um die Nachricht anzuzeigen
        } else {
            alert('Kunne ikke sende melding');
        }
    };

    // 5. Benutzerrolle prüfen (Support oder Admin?), um den "Løst"-Button anzuzeigen
    const brukerResp = await fetch('/api/minside');
    const bruker = brukerResp.ok ? (await brukerResp.json()).bruker : null;
    
    const existing = document.getElementById('problemLøstBtn');
    const actions = document.getElementById('problemActions');

    // Wenn der Nutzer Support oder Admin ist:
    if (bruker && ['customer support', 'admin'].includes(bruker.rolle)) {
        // Falls der Button noch nicht da ist, erstellen wir ihn neu
        if (!existing) {
            const btn = document.createElement('button');
            btn.id = 'problemLøstBtn';
            btn.textContent = 'Problem løst';
            
            // Klick-Event für das Schließen des Tickets
            btn.addEventListener('click', async () => {
                const r = await fetch(`/api/problemer/${aktivProblemId}/ferdig`, { method: 'POST' });
                
                if (r.ok) {
                    alert('Problem løst');
                    document.getElementById('problemChatSeksjon').style.display = 'none'; // Chat schließen
                    hentSupportProblemer(); // Support-Liste aktualisieren
                } else {
                    // Fehlermeldung vom Server auslesen
                    let message = 'Kunne ikke markere som løst';
                    try {
                        const errorData = await r.json();
                        if (errorData && errorData.message) {
                            message = errorData.message;
                        }
                    } catch (_) {}
                    alert(message);
                }
            });
            
            if (actions) actions.appendChild(btn);
        }
    } else {
        // Wenn kein Admin/Support eingeloggt ist, den Button entfernen
        if (existing) {
            existing.remove();
        }
    }
}

// 6. Neues Ticket erstellen (Für das Kundenformular)
const sendMeldingButton = document.getElementById('sendMeldingButton');
if (sendMeldingButton) {
    sendMeldingButton.addEventListener('click', async () => {
        const tittelFelt = document.getElementById('meldingTittel');
        const tekstFelt = document.getElementById('meldingTekst');
        const svar = document.getElementById('meldingSvar');

        const tittel = tittelFelt.value.trim();
        const tekst = tekstFelt.value.trim();
        const visibleInputs = Array.from(document.querySelectorAll('input[name="visibleTo"]:checked'));
        const visibleTo = visibleInputs.map((input) => input.value);

        // Validierung der Eingabefelder
        if (!tittel || !tekst) { 
            svar.textContent = 'Vennligst fyll inn både emne og beskrivelse.'; 
            return; 
        }
        if (visibleTo.length === 0) {
            svar.textContent = 'Velg minst én rolle som problemet skal være synlig for.';
            return;
        }

        // POST-Request für das neue Problem absenden
        const r = await fetch('/api/problemer', { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ tittel, tekst, visibleTo }) 
        });
        
        const res = await r.json(); 
        svar.textContent = res.message || '';

        if (r.ok) { 
            tittelFelt.value = ''; // Felder leeren
            tekstFelt.value = ''; 
            document.querySelectorAll('input[name="visibleTo"]').forEach((input) => {
                input.checked = input.value === 'customer support';
            });
            hentMineProblemer(); // Eigene Ticketliste aktualisieren
            åpneProblem(res.id); // Den Chat direkt mit dem neuen Ticket öffnen
        }
    });
}

// Delegert click-fallback for "Åpne" knapper (fanger også dynamisk innhold)
document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.openProblemBtn, .openMyProblem');
    if (btn) {
        const id = btn.dataset && btn.dataset.id;
        if (id) {
            åpneProblem(id);
            e.preventDefault();
        } else {
            console.log('Åpne-knapp uten data-id', btn);
        }
    }
});

// Dropdown for vanlige problemer: naviger til hjelpe-side
function initProblemDropdown() {
    const select = document.getElementById('problemSelect');
    if (!select) return;
    select.addEventListener('change', (event) => {
        const url = event.target.value;
        if (url) {
            window.location.href = url;
        }
    });
}

// Initialiser når siden lastes
document.addEventListener('DOMContentLoaded', () => {
    hentBrukerData();
    initProblemDropdown();

    const slettKontoButton = document.getElementById('slettKontoButton');
    if (slettKontoButton) {
        slettKontoButton.addEventListener('click', async () => {
            if (!confirm('Er du sikker på at du vil slette kontoen din? Dette kan ikke angres.')) {
                return;
            }

            const resp = await fetch('/api/slettmeg', { method: 'POST' });
            const data = await resp.json();
            if (!resp.ok) {
                alert(data.message || 'Kunne ikke slette kontoen');
                return;
            }

            alert(data.message || 'Konto slettet');
            window.location.href = '/';
        });
    }
});