function summer () {
    let sum = tall1 + tall2;
    return sum;
}

let antallTimer = 90
let antallVikarttimer = 30;

let summertAntallTimer = summer(antallTimer, antallVikarttimer);

let overskrift = document.createElement("h1");
overskrift.innerText = "Du Har toatalt jobbet" + summertAntallTimer + "timer.";
document.body.appendChild(overskrift);

document.getElementById("knapp").addEventListener("click",siHei);

function siHei () {
    console.log("hei!");
}

document.getElementById("knopf").addEventListener("click", function( {
    console.log("hei det bra!")
}))

document.getElementById("knapp").addEventListener("click", ()=> {
    console.log("Denne anozme funktionen kjører også.")
}
])