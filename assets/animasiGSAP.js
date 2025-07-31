// JavaScript
window.addEventListener("load", function () {
  document.getElementById("preloader").style.display = "none";
});

  gsap.from(".page", {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out"
  });