document.getElementById('selectButton').addEventListener('click', function() {
    const images = document.querySelectorAll('.image');
    const selectedImages = [];


    images.forEach(image => image.classList.remove('show'));

    while (selectedImages.length < 3) {
        const randomIndex = Math.floor(Math.random() * images.length);
        if (!selectedImages.includes(images[randomIndex])) {
            selectedImages.push(images[randomIndex]);
        }
    }

    selectedImages.forEach(image => image.classList.add('show'));
});

window.addEventListener('load', function() {
    var audio = document.getElementById('myAudio');
    audio.play();
});