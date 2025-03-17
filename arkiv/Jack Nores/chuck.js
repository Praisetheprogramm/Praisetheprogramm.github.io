// Dokumentasjon om Chuck Norris API: https://api.chucknorris.io/
// Der står det mellom anna at når me hentar noko frå URL-en under, så får me dette som respons (unik vits kvar gong):
// {
//     "icon_url" : "https://api.chucknorris.io/img/avatar/chuck-norris.png",
//     "id" : "Y2aXR9qgTF-kddHSjWmAMQ",
//     "url" : "",
//     "value" : "If you put Chuck Norris as your profile picture on facebook thousands of supermodels will friend you each day"
// } 

async function hentVits() {
    const res = await fetch('https://api.chucknorris.io/jokes/random');
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