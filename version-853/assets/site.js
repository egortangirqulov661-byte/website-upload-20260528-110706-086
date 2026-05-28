(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var category = scope.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var term = valueOf(input);
        var yearValue = valueOf(year);
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        var categoryValue = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (term && search.indexOf(term) === -1) {
            ok = false;
          }
          if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
            ok = false;
          }
          if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
            ok = false;
          }
          if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
            ok = false;
          }
          if (categoryValue && (card.getAttribute("data-category") || "").toLowerCase() !== categoryValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type, category].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  window.initializeMoviePlayer = function (streamUrl) {
    ready(function () {
      var shell = document.querySelector("[data-player]");
      if (!shell) {
        return;
      }
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-play-trigger]");
      var hls = null;
      var attached = false;

      function attach() {
        if (!video || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 90,
            backBufferLength: 30
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              attached = false;
            }
          });
        }
      }

      function play() {
        attach();
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
        video.play().catch(function () {});
      }

      if (trigger) {
        trigger.addEventListener("click", play);
        trigger.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            play();
          }
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
