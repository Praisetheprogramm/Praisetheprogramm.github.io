const musikk = new Audio("Musik.mp3");
musikk.play();

setInterval (changepage , 10000)

function changepage() {
    var randomNumber = Math.random();
    if (randomNumber < 0.5) {
        window.location.href = "kampf.html";
    } else {
        window.location.href = "Laden.html";
    }
}

window.addEventListener('load', function() {
    var audio = document.getElementById('myAudio');
    audio.play();
});


