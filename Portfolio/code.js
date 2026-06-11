// ===== MOBILE NAVIGATION =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        navToggle?.classList.remove('active');
        navMenu?.classList.remove('active');
    }
});

// ===== SCROLL TO PROJECTS =====
function scrollToProjects() {
    console.log('scrollToProjects() called');
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
        const headerOffset = 80;
        const targetPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    } else {
        console.error("Projects section not found");
    }
}

// ===== PROJECT DATA =====
const projects = {
    1: {
        title: "Guide to New Zealand",
        text: "I made this page as my first project and I will revise it; right now it's pretty bad and ugly, you can see how little I knew back then.",
        link: "https://praisetheprogramm.github.io/arkiv/englisch/index.html"
    },
    2: {
        title: "Game rating website",
        text: "Denne nettsiden har som mål å gjøre det mulig for folk å dele sine erfaringer med et spill med venner og andre, og dermed fraråde andre eller anbefale spill. Videre er denne nettsiden ment å gi små utviklere muligheten til å vise frem spillene sine anonymt og motta kritikk og komplimenter. (Dette prosjektet bruker localhost 3000; denne knappen vil derfor bare ta deg til GitHub-siden min som inneholder nettstedets kode.)",
        link: "https://github.com/Praisetheprogramm/Praisetheprogramm.github.io/blob/main/arkiv/game-projekt2025/public/index.html"
    },
    3: {
        title: "Customer support",
        text: "A simple support website with login, different roles, and a minimal chat system.",
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

// Click outside modal to close
window.onclick = function (e) {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

// ===== FADE-IN SCROLL EFFECT =====
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

// ===== GALLERY TOGGLE =====
const toggleBtn = document.getElementById('toggle-gallery');
const galleryContent = document.getElementById('gallery-content');

function toggleGallery() {
    if (!galleryContent || !toggleBtn) return;
    const isOpen = galleryContent.classList.toggle('open');
    toggleBtn.textContent = isOpen ? 'Hide gallery' : 'View gallery';
    toggleBtn.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
        setTimeout(() => {
            const top = toggleBtn.getBoundingClientRect().bottom + window.pageYOffset - 20;
            window.scrollTo({ top, behavior: 'smooth' });
            checkFade();
        }, 100);
    }
}

if (toggleBtn) toggleBtn.addEventListener('click', toggleGallery);