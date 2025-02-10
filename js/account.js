function slide(direction) {
    let slider = document.getElementById("slider");
    slider.style.transition = "all 0.5s ease";
    slider.style.transitionDelay = "0.1s";

    if (direction < 0) {
        slider.style.marginLeft = "0%";
    }
    if (direction > 0) {
        slider.style.marginLeft = "-100%";
    }
}