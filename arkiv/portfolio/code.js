function scrollToProjects() {
    console.log('scrollToProjects() called');
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
        // calculate offset to account for any fixed header height if needed
        const headerOffset = 0; // adjust if you have a fixed header
        const targetPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    } else {
        console.error("Projects section not found");
    }
}

// Projekt-Daten
const projects = {
    1: {
        title: "Guide to New Zealand",
        text: "I made this page as my first project and I will revise it; right now it's pretty bad and ugly, you can see how little I knew back then.",
        link: "https://praisetheprogramm.github.io/arkiv/englisch/index.html"
    },
    2: {
        title: "Game rating ebsite",
        text: "Ausführliche Beschreibung von Projekt 2.",
        link: "https://github.com/Praisetheprogramm/Praisetheprogramm.github.io/blob/main/arkiv/game-projekt2025/public/index.html"
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

// ---- Gallery toggle: Hide until button pressed ----
const toggleBtn = document.getElementById('toggle-gallery');
const galleryWrapper = document.getElementById('gallery-wrapper');

function toggleGallery() {
    if (!galleryWrapper || !toggleBtn) return;
    const isOpen = galleryWrapper.classList.toggle('open');
    toggleBtn.textContent = isOpen ? 'Hide gallery' : 'View gallery';
    toggleBtn.setAttribute('aria-expanded', isOpen);
    galleryWrapper.setAttribute('aria-hidden', !isOpen);

    if (isOpen) {
        // wait for the CSS transition to finish before scrolling and running fade
        function onGalleryTransition(e) {
            if (e.propertyName !== 'max-height') return;
            const top = toggleBtn.getBoundingClientRect().bottom + window.pageYOffset - 8;
            window.scrollTo({ top, behavior: 'smooth' });
            checkFade();
            galleryWrapper.removeEventListener('transitionend', onGalleryTransition);
        }
        galleryWrapper.addEventListener('transitionend', onGalleryTransition);
    }
}

if (toggleBtn) toggleBtn.addEventListener('click', toggleGallery);