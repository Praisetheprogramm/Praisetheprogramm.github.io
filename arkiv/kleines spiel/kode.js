let img_stein = document.getElementById("stein");
let img_saks = document.getElementById("saks");
let img_papir = document.getElementById("papir");

img_stein.addEventListener("click",velgstein);

let antallklikk = 0;

function velgstein (){
    // antallklikk++;
    // antallklikk += 1;
    antallklikk = antallklikk +1;
    console.log("Du valgte stein!");
    alert("Du valgte stein!");
}

for (let i = 0; i <=10; i = i + 1) {
    console.log("Tallet" +i)
}

let listeNavn = ["Jo Bjarne","Jo Bjørnar","Jon Bjarte"]
console.log(listeNavn[0]);
console.log(listeNavn[1]);
console.log(listeNavn[2]);

for (let i = 0; i < listeNavn.length; i = i + 1) {
    console.log(listeNavn[i]);
}

let listeSpørsmål = ["Hvem er den beste læreren?","Hva er det beste faget"]
let listeSvar = ["Halvard","Programmering"]

for (let x = 0; x < listeSpørsmål.length; x++) {
    console.log("SpørsmåL:"+ listeSpørsmål[x]);
    let svar = prompt ["Spørsmål:"+listeSpørsmål[x]];

    if (svar == listeSvar[x]) {
        console.log("Riktig!");
    }

    else {
        console.log("Baklager..");
        console.log("Riktig svar er:"+ listeSvar[x])
    }
}

