// document.getElementById("star").addEventListener("click", Klick);
// let rotation=0
// function Klick () {
//     if (rotation <=0) {
//         direction +1;
//         rotation = rotation +1
//     }
//     console.log("Hello world")
//     else (rotation >=1) {
//         direction -1;
//         rotation = rotation -1
//     }


    const box = document.getElementById("box");
    let clockwise = true;

    box.addEventListener("click", () => {
      clockwise = !clockwise;
      box.style.animationName = clockwise ? "rotateClockwise" : "rotateCounterClockwise";
    });
    