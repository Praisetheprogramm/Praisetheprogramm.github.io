const overskrift = document.createElement("h1");

overskrift.innerText = "Dette er en overskrift."
document.body.appendChild(overskrift);

const knapp = document.createElement("button");
knapp.innerText = "Trykk på meg";
knapp.id = "knapp1";
knapp.addEventListener("click", trykk);
document.body.appendChild(knapp);

function trykk(evt) {
    console.log(evt.target.id);
}

const knopf = document.createElement("button");
knopf.innerText = "Drücke mich bitte";
knapp.id = "knopf1";
knopf.addEventListener("dragover", moin);
knopf.addEventListener("click", Drück);
// document.body.appendChild(knopf);

function moin (evt) {
    console.log (evt.target.id);
}