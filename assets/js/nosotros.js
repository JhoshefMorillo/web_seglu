(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var stats = document.querySelectorAll(".about-stats__num");
    if (!stats.length || !("IntersectionObserver" in window)) {
      return;
    }

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    var DURATION = 2000;

    function animateNumber(el) {
      if (el.dataset.animating === "true") return;

      var target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      el.dataset.animating = "true";
      el.dataset.done = "false";

      var start = null;

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function format(value) {
        return String(Math.round(value)).replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ",",
        );
      }

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / DURATION, 1);
        var eased = easeOutQuart(progress);

        el.textContent = format(target * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = format(target);
          el.dataset.animating = "false";
          el.dataset.done = "true";
        }
      }

      requestAnimationFrame(step);
    }

    function setFinal(el) {
      var target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;
      el.textContent = String(target).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ",",
      );
      el.dataset.done = "true";
    }

    if (reduceMotion) {
      stats.forEach(setFinal);
      return;
    }

    var played = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;

          if (!played[el.dataset.index]) {
            played[el.dataset.index] = true;
            animateNumber(el);
          }
        });
      },
      { threshold: 0.4 },
    );

    stats.forEach(function (el, index) {
      el.dataset.index = index;
      observer.observe(el);
    });

    stats.forEach(function (el) {
      el.addEventListener(
        "mouseenter",
        function () {
          if (el.dataset.done === "true") {
            animateNumber(el);
          }
        },
        { passive: true },
      );
    });

    initDepthCarousel();
    initFlipCards();
  });

  function initFlipCards() {
    var cards = document.querySelectorAll(".mv__card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("is-flipped");
      });
    });
  }

  function initDepthCarousel() {
    var root = document.getElementById("depth-carousel");
    if (!root) return;

    var slides = root.querySelectorAll(".depth-carousel__slide");
    if (!slides.length) return;

    var prevBtn = root.querySelector(".depth-carousel__nav--prev");
    var nextBtn = root.querySelector(".depth-carousel__nav--next");
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    var index = 0;

    function width() {
      return Math.max(0, Math.min(480, root.clientWidth));
    }

    function layout() {
      var base = width();
      var stepX = Math.max(64, base * 0.22);

      slides.forEach(function (slide, i) {
        var d = i - index;
        if (d > slides.length / 2) d -= slides.length;
        if (d < -slides.length / 2) d += slides.length;

        var abs = Math.abs(d);
        var z = -abs * 240;
        var x = d * stepX;
        var scale = 1 - abs * 0.14;
        var rotate = d * -4;

        slide.style.transform =
          "translateX(" +
          x +
          "px) translateZ(" +
          z +
          "px) scale(" +
          scale +
          ") rotateY(" +
          rotate +
          "deg)";
        slide.style.opacity = String(1 - abs * 0.3);
        slide.style.zIndex = String(100 - abs * 10);

        if (d === 0) {
          slide.style.pointerEvents = "auto";
        } else {
          slide.style.pointerEvents = "none";
        }
      });
    }

    function go(next) {
      index = (index + next + slides.length) % slides.length;
      layout();
    }

    function layoutFlat() {
      slides.forEach(function (slide, i) {
        slide.style.transform = "";
        slide.style.opacity = "1";
        slide.style.zIndex = String(slides.length - i);
      });
    }

    if (reduceMotion) {
      layoutFlat();
    } else {
      layout();

      if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

      window.addEventListener("resize", layout);

      var timer = setInterval(function () { go(1); }, 4000);

      root.addEventListener("mouseenter", function () {
        clearInterval(timer);
      });
      root.addEventListener("mouseleave", function () {
        timer = setInterval(function () { go(1); }, 4000);
      });
    }
  }
})();