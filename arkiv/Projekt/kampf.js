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


class A{
    constructor(name, types, move, attack_Power, health){
        this.name = name;
        this.types = types;
        this.move = move;
        this.attack_Power = attack_Power;
        this.health = health;
    }
    
    battle(Bot) {
        let version = ["Mensch", "Monster"];

        for(let [i,k] of  version.entries()) {
            if (Bot.types === k) {
                string_1_attack = "/nIts not very effective...";
                string_2_attack = "/nIts not very effective...";
            }

            //typ is stronger
            if (Bot.types === version[(i + 1) % 3]) {
                Bot.attack_Power *= 2;
                this.attack_Power /= 2;
                string_1_attack = "/nIts not very effective...";
                string_2_attack = "/nIts super effective!";
            }

            //typ is weak
            if (Bot.types === version [(i + 2) % 3]) {
                this.attack_Power *= 2;
                Bot.attack_Power /= 2;
                string_1_attack = "/nIts super effective!";
                string_2_attack = "/nIts not very effective...";
            }
        }
    }
}

let Ckarackter = new A ("Ckarackter", "Mensch", "Schlag", 20, 100);
let Bot = new A ("Bot", "Monster", "Schlag", 10, 100);

console.log(Ckarackter)
console.log(Bot)