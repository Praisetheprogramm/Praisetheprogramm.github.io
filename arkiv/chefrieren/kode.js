let alfabet = "0123456789abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ,.-_!?";
let alfabetLengde = alfabet.length;
console.log("Alfabetet sin lengde: " + alfabetLengde);

// Krypteringsfunksjonen, som får inn bokstaven ein skal kryptere, samt krypteringsnøkkelen. 
// Returnerer den nye bokstaven.
function krypterBokstav(bokstavInn, krypteringsnokkelInn) {    
     // Her skal magien skje! Skriv din eigen kode.
    // if alfabetLengde > 0 ===1
    // if alfabetLengde > 9 + 1
    // if alfabetLengde > 73 - 74

    let posisjon   = alfabet.indexOf(bokstavInn);
    let posisjonNy = posisjon + krypteringsnokkelInn

    if (posisjonNy >= alfabetLengde) {
        posisjonNy = posisjonNy - alfabetLengde;
    }
    return alfabet[posisjonNy];

    // if alfabet == 74 [alfabet.indexOf(bokstavInn) + krypteringsnokkelInn2];

}

function dekrypterBokstav(bokstavInn, krypteringsnokkelInn) {    
   let posisjon   = alfabet.indexOf(bokstavInn);
   let posisjonNy = posisjon - krypteringsnokkelInn

   if (posisjonNy < 0) {
       posisjonNy = posisjonNy + alfabetLengde;
   }
   return alfabet[posisjonNy];

}

console.log(alfabet.indexOf("0")); // Skal returnere 0
console.log(alfabet.indexOf("a")); // Skal returnere 10

console.log(krypterBokstav("?", 1)); // Skal returnere "b"
console.log(dekrypterBokstav("b",1));

let setning = "angrip i morgen, klokka 08.15!";
let krypterSetning = "";

for (let bokstaven of setning) {
    krypterSetning = krypterSetning + krypterBokstav(bokstaven, 1);
}

// console. log(kryptertSetning);
// for (let i = 0; i <sentning. length; i++) {
//     krypterSetning = krypterSetning + krypterBokstav(bokstav, i);
// }
