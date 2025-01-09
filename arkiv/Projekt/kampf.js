// document.getElementById("btnHitCheck").addEventListener("click", hit)

// document.getElementById("Progress").addEventListener

// function hit () {
//     let hitChange =  Math.random();
//     if (hitChange > 0.5) {
//         console.log("You hit")
//         // Personen treffer
//         // Kode for mindre liv til motstander goes here
//         Progress - 20 
//     } else {
//         console.log("You missed!")
//         // BOM! You missed!
//         // 
//     }
// }


// class A{
//     constructor(name, types, move, attack_Power, health){
//         this.name = name;
//         this.types = types;
//         this.move = move;
//         this.attack_Power = attack_Power;
//         this.health = health;
//     }
    
//     battle(Bot) {
//         let version = ["Mensch", "Monster"];

//         for(let [i,k] of  version.entries()) {
//             if (Bot.types === k) {
//                 string_1_attack = "/nIts not very effective...";
//                 string_2_attack = "/nIts not very effective...";
//             }

//             //typ is stronger
//             if (Bot.types === version[(i + 1) % 3]) {
//                 Bot.attack_Power *= 2;
//                 this.attack_Power /= 2;
//                 string_1_attack = "/nIts not very effective...";
//                 string_2_attack = "/nIts super effective!";
//             }

//             //typ is weak
//             if (Bot.types === version [(i + 2) % 3]) {
//                 this.attack_Power *= 2;
//                 Bot.attack_Power /= 2;
//                 string_1_attack = "/nIts super effective!";
//                 string_2_attack = "/nIts not very effective...";
//             }
//         }
//     }
// }

// let Ckarackter = new A ("Ckarackter", "Mensch", "Schlag", 20, 100);
// let Bot = new A ("Bot", "Monster", "Schlag", 10, 100);

// console.log(Ckarackter)
// console.log(Bot)

// window.addEventListener('load', function() {
//     var audio = document.getElementById('myAudio');
//     audio.play();
// });

var playerHealth = 100;
var enemyHealth = 100;

function updateHealthBars() {
    document.getElementById('playerHealth').style.width = playerHealth + 'px';
    document.getElementById('enemyHealth').style.width = enemyHealth + 'px';
}

function checkGameOver() {
    if (playerHealth <= 0) {
        alert('Du hast verloren! Das Spiel ist vorbei.');
        document.getElementById('attackButton').disabled = true;
    } else if (enemyHealth <= 0) {
        alert('Du hast gewonnen! Das Spiel ist vorbei.');
        document.getElementById('attackButton').disabled = true;
    }
}


function attack() {
    // Spieler greift an
    if (Math.random() < 0.5) {
        enemyHealth -= 30;
        alert('Treffer! Der Gegner verliert 10 Lebenspunkte.');
    } else {
        alert('Daneben! Kein Schaden am Gegner.');
    }

    updateHealthBars();

   // Gegner greift an, wenn das Spiel noch nicht vorbei ist
   if (enemyHealth > 0) {
    if (Math.random() < 0.5) {
        playerHealth -= 20;
        alert('Der Gegner trifft! Du verlierst 10 Lebenspunkte.');
    } else {
        alert('Der Gegner verfehlt! Kein Schaden an dir.');
    }

    updateHealthBars();
    checkGameOver();
}

document.getElementById('attackButton').addEventListener('click', attack);

updateHealthBars();
