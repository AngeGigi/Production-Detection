// Slideshow
document.addEventListener("DOMContentLoaded", function () {
    const slideshowContainer = document.querySelector(".background-slideshow");
    const images = [
        "/pics/bmw.avif",
        "/pics/nature.avif",
        "/pics/water.avif"
    ];
    let index = 0;

    function changeBackgroundImage() {
        slideshowContainer.style.backgroundImage = `url('${images[index]}')`;
        index = (index + 1) % images.length;
    }

    // Initial background image
    changeBackgroundImage();

    // Change image every 5 seconds with smooth transition
    setInterval(changeBackgroundImage, 5000);
});