document.getElementById("burger").addEventListener("click", Klick);
let antalklick =0

function Klick () {
    antalklick = antalklick +1
    console.log(antalklick)
    if (antalklick >=5) {
        console.log("nonono")
    }
}