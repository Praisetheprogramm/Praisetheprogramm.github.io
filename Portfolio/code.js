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
        title: "Calculator",
        text: "a simple calculator",
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

// ===== ONE-TIME HERO INTRO VIDEO =====
(() => {
    const hero = document.getElementById('hero-intro');
    const heroVideo = document.getElementById('hero-video');
    if (!hero || !heroVideo) return;

    const transitionToBlack = () => {
        hero.classList.add('intro-finished');
        hero.style.background = '#000000';
        hero.style.transition = 'background 0.8s ease';
        const title = document.querySelector('.hero-content h2');
        const subtitle = document.querySelector('.hero-content p');
        if (title) title.style.color = '#ffffff';
        if (subtitle) subtitle.style.color = '#d9d9d9';
    };

    heroVideo.addEventListener('ended', transitionToBlack);

    // if the video is already loaded and short, transition right after play finishes
    heroVideo.addEventListener('loadedmetadata', () => {
        if (heroVideo.duration < 1) {
            heroVideo.currentTime = 0;
        }
    });
})();

// ===== VIDEO PLAY ON SCROLL (snap, lock, play, transition) =====
(() => {
    const section = document.getElementById('video-section');
    const video = document.getElementById('bg-video');
    const fallback = document.querySelector('.video-fallback');
    const post = document.getElementById('post-video');
    if (!section || !video || !post) return;

    // track last scroll direction
    let lastPos = window.pageYOffset;
    window._lastScrollDir = null;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        window._lastScrollDir = y > lastPos ? 'down' : 'up';
        lastPos = y;
    }, { passive: true });

    let started = false;
    let lockedScrollY = 0;

    // prevent default handlers while locked
    function preventDefault(e){ e.preventDefault(); }
    function preventKey(e){
        const keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '];
        if (keys.includes(e.key)) e.preventDefault();
    }

    function addLockInputs(){
        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventDefault, { passive: false });
        window.addEventListener('keydown', preventKey, { passive: false });
    }

    function removeLockInputs(){
        window.removeEventListener('wheel', preventDefault, { passive: false });
        window.removeEventListener('touchmove', preventDefault, { passive: false });
        window.removeEventListener('keydown', preventKey, { passive: false });
    }

    function lockScroll() {
        lockedScrollY = window.pageYOffset;
        // snap instantly to section top
        window.scrollTo({ top: section.offsetTop, behavior: 'auto' });
        // prevent further scrolling
        document.body.style.position = 'fixed';
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        section.classList.add('fixed-playing');
        addLockInputs();
    }

    function unlockScrollAndGoTo(targetY) {
        // restore scrolling
        removeLockInputs();
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        // restore previous scroll position then smooth-scroll to target
        window.scrollTo(0, lockedScrollY);
        window.setTimeout(() => {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        }, 50);
    }

    // fallback: play hexagon animation if autoplay blocked
    function fallbackFlow(durationSeconds) {
        if (started) return;
        started = true;
        // lock page and run hexagon ripple animation for duration
        lockScroll();
        section.classList.add('playing');
        if (fallback) {
            fallback.style.display = '';
            fallback.classList.add('ripple');
        }

        const dur = (typeof durationSeconds === 'number' && isFinite(durationSeconds) && durationSeconds > 0) ? durationSeconds : 4;
        setTimeout(() => {
            // end fallback
            if (fallback) {
                fallback.classList.remove('ripple');
            }
            section.classList.remove('playing');
            section.classList.add('ended');
            const targetY = post.offsetTop || (window.pageYOffset + window.innerHeight);
            setTimeout(() => {
                unlockScrollAndGoTo(targetY);
                setTimeout(() => section.classList.remove('fixed-playing'), 800);
            }, 120);
        }, dur * 1000 + 120);
    }

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started && window._lastScrollDir === 'down') {
                // snap instantly to the section and try to autoplay
                window.scrollTo({ top: section.offsetTop, behavior: 'auto' });
                // try autoplay; if blocked, show overlay but keep page locked so user must interact
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // autoplay succeeded
                        started = true;
                        lockScroll();
                        section.classList.add('playing');
                        if (fallback) fallback.style.display = 'none';
                    }).catch(() => {
                        // autoplay blocked: use hexagon fallback for video.duration
                        if (video.readyState >= 1 && isFinite(video.duration)) {
                            fallbackFlow(video.duration);
                        } else {
                            // wait for metadata then start fallback
                            const onMeta = () => {
                                video.removeEventListener('loadedmetadata', onMeta);
                                fallbackFlow(isFinite(video.duration) ? video.duration : 4);
                            };
                            video.addEventListener('loadedmetadata', onMeta);
                        }
                    });
                } else {
                    // no promise returned, assume play started
                    started = true;
                    lockScroll();
                    section.classList.add('playing');
                    if (fallback) fallback.style.display = 'none';
                }
            }
        });
    }, { threshold: 0.6 });

    obs.observe(section);

    // when video ends, unlock and scroll to post-video (black) section
    video.addEventListener('ended', () => {
        section.classList.remove('playing');
        section.classList.add('ended');
        const targetY = post.offsetTop || (window.pageYOffset + window.innerHeight);
        setTimeout(() => {
            unlockScrollAndGoTo(targetY);
            setTimeout(() => section.classList.remove('fixed-playing'), 800);
        }, 120);
    });

    // if video can play before user interaction, hide fallback
    video.addEventListener('canplay', () => {
        if (!started && fallback) fallback.style.display = 'none';
    });

})();