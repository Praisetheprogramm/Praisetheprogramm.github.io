
async function hentBiler() {
    const res = await fetch('');
    const data = await res.json();
    
    // Tømmer sida for gamle vitsar
    document.querySelector("#vits").innerHTML = "";

    // Opprettar ein ny vits i ein paragraf
    let vits = document.createElement("p");
    vits.innerText = data.value;
    document.querySelector("#vits").appendChild(vits);
    
    // Legg til eit bilete av Chuck Norris
    let bilde = document.createElement("img");
    bilde.src = data.icon_url;
    document.querySelector("#vits").appendChild(bilde);
}

hentVits(); // Slik at me får ein vits med ein gong me lastar sida

// Slik kan me hente ein vits kvar gong me trykker på ein knapp på tastaturet
document.body.addEventListener("keydown", hentVits);