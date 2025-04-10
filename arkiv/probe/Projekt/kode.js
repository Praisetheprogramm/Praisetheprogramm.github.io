// document.getElementById("Echse").addEventListener("click", Lizardman);
document.getElementById("Echse").addEventListener("mouseover", playsoundonhover)

function Lizardman() {
    alert("You chose the lizard man")
}

document.getElementById("Ork").addEventListener("click", Ork);

function Ork() {
    alert("You chose the Ork")
}

document.getElementById("Söldner").addEventListener("click", mercenary);

function mercenary() {
    alert("You chose the mercenary")
}

function playsoundonhover () {
    console.log("On mouse over effect yo")
}