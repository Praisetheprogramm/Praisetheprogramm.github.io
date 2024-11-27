
const valg = ["stein","saks","papir"];

let img_stein = document.getElementById("stein");
let img_saks = document.getElementById("saks");
let img_papir = document.getElementById("papir");

img_stein.addEventListener("click",velgstein);

let antallklikk = 0;

// function velgstein (){
//     // antallklikk++;
//     // antallklikk += 1;
//     antallklikk = antallklikk +1;
//     console.log("Du valgte stein!");
//     alert("Du valgte stein!");
// }

img_papir.addEventListener("click",velgpapir);

function velgpapir (){
    // antallklikk++;
    // antallklikk += 1;
    antallklikk = antallklikk +1;
    console.log("Du valgte papir!");
    alert("Du valgte papir!");
}
img_saks.addEventListener('click', velgsacks)


function velgsacks (){
    // antallklikk++;
    // antallklikk += 1;
    antallklikk = antallklikk +1;
    console.log("Du valgte sacks!");
    alert("Du valgte sacks!");
}

function randomValg() {
    return randomValg[Math.floor(Math.random() * randomValg.length)];
}

function velgstein(){
    console.log("Du har valgt Stein");
    let maskinValg = randomValg();
    console.log(maskinValg);

    if (maskinValg == "stein") {
        antallUvagjort++;
        document.getElementById("tap").innerText = "Antall uavgjort:" + antallUvagjort;
        document.getElementById("utskrift").innerText = "Maskinen valgte også stein, uavgjort!"
    }

    if (maskinValg == "papir") {
        antallTap++;
        document.getElementById("tap").innerText = "Antall tap: " + antallTap;
        document.getElementById("utskrift").innerText = "Maskinen valgte papir, du tapte!"
    }

    if (maskinValg == "saks") {
        antallSeire++;
        document.getElementById("seire").innerText = "Antall seire: " + antallSeire;
        document.getElementById("utskrift").innerText = "Maskinen valgte saks, du vant!"
    }
}

function velgPapir() {
    console.log("Du har valgt papir");
    let maskinValg = randomValg();
    console.log("Maskinen har valgt:" + maskinValg);
    if (maskinValg == "stein") {
        antallSeire++;
        document.getElementById("seire").innerText = "Antall seire: " + antallSeire;
        document.getElementById("utskrift").innerText = "Maskinen valgte stein, du vant!"
    }
    if (maskinValg == "papir") {
        antallUavgjort++;
        document.getElementById("uavgjort").innerText = "Antall uavgjort: " + antallUavgjort;
        document.getElementById("utskrift").innerText = "Maskinen valgte papir, uavgjort!"
    }
    if (maskinValg == "saks") {
        antallTap++;
        document.getElementById("tap").innerText = "Antall tap: " + antallTap;
        document.getElementById("utskrift").innerText = "Maskinen valgte saks, du tapte!"
    }
}

function velgSaks() {
    console.log("Du har valgt saks");
    let maskinValg = randomValg();
    console.log("Maskinen har valgt:" + maskinValg);
    if (maskinValg == "stein") {
        antallTap++;
        document.getElementById("tap").innerText = "Antall tap: " + antallTap;
        document.getElementById("utskrift").innerText = "Maskinen valgte stein, du tapte!"
    }
    if (maskinValg == "papir") {
        antallSeire++;
        document.getElementById("seire").innerText = "Antall seire: " + antallSeire;
        document.getElementById("utskrift").innerText = "Maskinen valgte papir, du vant!"
    }
    if (maskinValg == "saks") {
        antallUavgjort++;
        document.getElementById("uavgjort").innerText = "Antall uavgjort: " + antallUavgjort;
        document.getElementById("utskrift").innerText = "Maskinen valgte stein, uavgjort!"
    }
}


// for (let i = 0; i <=10; i = i + 1) {
//     console.log("Tallet" +i)
// }

// let listeNavn = ["Jo Bjarne","Jo Bjørnar","Jon Bjarte"]
// console.log(listeNavn[0]);
// console.log(listeNavn[1]);
// console.log(listeNavn[2]);

// for (let i = 0; i < listeNavn.length; i = i + 1) {
//     console.log(listeNavn[i]);
// }

// let listeSpørsmål = ["Hvem er den beste læreren?","Hva er det beste faget"]
// let listeSvar = ["Halvard","Programmering"]

// for (let x = 0; x < listeSpørsmål.length; x++) {
//     console.log("SpørsmåL:"+ listeSpørsmål[x]);
//     let svar = prompt ["Spørsmål:"+listeSpørsmål[x]];

//     if (svar == listeSvar[x]) {
//         console.log("Riktig!");
//     }

//     else {
//         console.log("Baklager..");
//         console.log("Riktig svar er:"+ listeSvar[x])
//     }
// }

