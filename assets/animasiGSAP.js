// JavaScript
window.addEventListener("load", function () {
  document.getElementById("preloader").style.display = "none";
});

gsap.from(".page", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power2.out",
});

window.addEventListener("load", function () {
  gsap.to("#preloader", {
    opacity: 0,
    duration: 1,
    onComplete: () => {
      document.getElementById("preloader").style.display = "none";
    },
  });
  // Optionally animasi masuk halaman
  gsap.from(".main-content", {
    opacity: 0,
    y: 50,
    duration: 2,
    delay: 2,
  });
});
