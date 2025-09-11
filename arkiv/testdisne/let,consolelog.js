let arrayNavn = ["ola","Kari","Per"];
console.log(arrayNavn); //schreibt alle drei namen 
for (let navn of arrayNavn) { //macht das selbe
    console.log(navn)
}
console.log(arrayNavn[1]) //schreibt nur Kari beziehungs weise den namen auf position 1 [0,1,2 .....]

let person = {
    navn: "Ola",
    alder: 25,
    yrke: "Utvikler"
}

console.log(person)
console.log(person.navn) // schreibt person und navn aus 

let arrayPersoner = [  // array mit namen und alter
    {
        navn: "Ola",
        alder: 25,
    }
    {
        navn: "Kari",
        alder: 30,
    }
    {
        navn: "Per",
        alder: 28,
    }
];

console.log(arrayPersoner) // schreibt den ganzen array aus
console.log(arrayPersoner[1]) //schreibt Kari und 30 aus
console.log(arrayPersoner[1.navn]) // schreibt nur Kari

arrayPersoner.push(person); //fügt etwas zum ende des arrays hinzu

for (let index = 0; index < arrayPersoner.length; index++) {
    console.log(arrayPersone[index].navn);
}
    
for (let person of arrayPersoner)
    if (person.alder >=30) {
        console.log(person)
    }