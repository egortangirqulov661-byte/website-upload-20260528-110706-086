(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dotsBox = hero.querySelector("[data-hero-dots]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      if (dotsBox) {
        Array.prototype.slice.call(dotsBox.children).forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (dotsBox) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-dot";
        dot.setAttribute("aria-label", "切换推荐" + (i + 1));
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
        dotsBox.appendChild(dot);
      });
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var nextButton = hero.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        next();
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-search-area]").forEach(function (area) {
    var input = area.querySelector("[data-search-input]");
    var clear = area.querySelector("[data-search-clear]");
    var cards = Array.prototype.slice.call(
      area.querySelectorAll("[data-movie-card]"),
    );

    function filter() {
      var value = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-keywords") || "",
        ]
          .join(" ")
          .toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      area.classList.toggle("is-empty", visible === 0);
    }

    if (input) {
      input.addEventListener("input", filter);
    }

    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
          input.focus();
        }
        filter();
      });
    }
  });

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".play-overlay");

    function prepare() {
      if (!video || video.dataset.ready === "1") {
        return;
      }

      var stream = video.getAttribute("data-stream");
      if (!stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }

      video.dataset.ready = "1";
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      var result = video.play();
      box.classList.add("is-playing");
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
    }
  });
})();
