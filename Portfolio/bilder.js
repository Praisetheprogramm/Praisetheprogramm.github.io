
const gallery = document.querySelector('.gallery');
gallery.addEventListener('scroll', () => {
    const scrollPosition = gallery.scrollLeft;
    gallery.style.backgroundColor = `rgba(0, 0, 0, ${scrollPosition / gallery.scrollWidth})`;
});

const image = document.getElementById('movingImage');
        let position = 0;
        const speed = 2; // Geschwindigkeit des Bildes

        function moveImage() {
            position += speed;
            if (position > window.innerWidth) {
                position = -image.width;
            }
            image.style.left = position + 'px';
            requestAnimationFrame(moveImage);
        }

        moveImage();
