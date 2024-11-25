let bilde = document.getElementById("bilde");

// bilde.src = "bilder/bilde_Unbenannt68.jpg";

let bildeGalleri = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg"
];

// bilde.src = "bilde/"+ bildeGalleri[0];
let aktivtBilde = 0
bilde.src = "bilder/"+ bildeGalleri[aktivtBilde];

set internavl (skriftBilde, 5000);

function skriftBilde() {
    aktivtBilde = aktivtBilde + 1;
    if (aktivtBilde > bildeGalleri.length-1){
        aktivtBilde = 0
}
 bilde.src = "bilder/"+ bildeGalleri[aktivtBilde];
 }