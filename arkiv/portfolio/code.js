function scrollToProjects() {
    document.getElementById("projects").scrollIntoView({
        behavior: "smooth"
    });
}

// Projekt-Daten
const projects = {
    1: {
        title: "Projekt 1",
        text: "Ausführliche Beschreibung von Projekt 1.",
        link: "https://github.com/DEINNAME/Projekt1"
    },
    2: {
        title: "Projekt 2",
        text: "Ausführliche Beschreibung von Projekt 2.",
        link: "https://github.com/DEINNAME/Projekt2"
    },
    3: {
        title: "Projekt 3",
        text: "Ausführliche Beschreibung von Projekt 3.",
        link: "https://github.com/DEINNAME/Projekt3"
    }
};

function openProject(id) {
    const modal = document.getElementById("modal");
    document.getElementById("modal-title").textContent = projects[id].title;
    document.getElementById("modal-text").textContent = projects[id].text;
    document.getElementById("modal-link").href = projects[id].link;

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Klick außerhalb des Modals schließt es
window.onclick = function (e) {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

// Fade-In Scroll Effekt
const fadeElements = document.querySelectorAll('.fade-in');

function checkFade() {
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade);