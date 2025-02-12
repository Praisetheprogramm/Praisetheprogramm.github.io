window.addEventListener('scroll', function() {
    const gallery = document.getElementById('gallery');
    const scrollPosition = window.pageYOffset;
    gallery.style.transform = `translateY(${-scrollPosition}px)`;
});