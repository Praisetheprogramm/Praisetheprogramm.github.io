function attack() {
    let hitchance = Math.random();
    let hitchanceenemy = Math.random();
    console.log(hitchance);

    // Spieler greift an
    if (hitchance < 0.1) {
        enemyHealth -= 30;
        alert('Treffer! Der Gegner verliert 30 Lebenspunkte.');
    } else {
        alert('Daneben! Kein Schaden am Gegner.');
    }
}

window.addEventListener('load', function() {
    var audio = document.getElementById('myAudio');
    audio.play();
});