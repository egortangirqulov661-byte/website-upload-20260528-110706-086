(function () {
  function onReady(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-selected", dotIndex === current ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    if (!inputs.length || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-global-search");
      var panel = document.querySelector(targetSelector);
      if (!panel) {
        return;
      }

      input.addEventListener("input", function () {
        var query = normalize(input.value);
        panel.innerHTML = "";
        if (!query) {
          panel.classList.remove("is-open");
          return;
        }

        var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          return normalize(item.t + " " + item.k + " " + item.d + " " + item.y + " " + item.r).indexOf(query) !== -1;
        }).slice(0, 18);

        panel.classList.add("is-open");
        if (!results.length) {
          panel.innerHTML = '<div class="search-result"><div><strong>未找到相关影片</strong><p>可尝试输入影片名称、年份、地区、类型或标签。</p></div></div>';
          return;
        }

        panel.innerHTML = results.map(function (item) {
          return [
            '<a class="search-result" href="' + item.u + '">',
            '<img src="' + item.i + '" alt="' + escapeHtml(item.t) + '">',
            '<div>',
            '<strong>' + escapeHtml(item.t) + '</strong>',
            '<p>' + escapeHtml(item.d) + '</p>',
            '<p>' + escapeHtml(item.y + " · " + item.r) + '</p>',
            '</div>',
            '</a>'
          ].join("");
        }).join("");
      });
    });
  }

  function initPageFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var search = filterRoot.querySelector("[data-page-search]");
    var year = filterRoot.querySelector("[data-filter-year]");
    var type = filterRoot.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
    var empty = filterRoot.querySelector("[data-filter-empty]");

    function update() {
      var query = normalize(search && search.value);
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
    update();
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var source = video ? video.getAttribute("data-src") : "";
      var status = box.querySelector("[data-player-status]");
      if (!video || !source) {
        return;
      }

      var hls = null;
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setStatus("播放源正在重新连接");
              }
            }
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放源已就绪");
      } else {
        video.src = source;
        setStatus("点击播放");
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function playToggle() {
        if (video.paused) {
          var result = video.play();
          if (result && result.catch) {
            result.catch(function () {
              setStatus("再次点击播放");
            });
          }
        } else {
          video.pause();
        }
      }

      box.querySelectorAll("[data-player-play]").forEach(function (button) {
        button.addEventListener("click", playToggle);
      });

      var mute = box.querySelector("[data-player-mute]");
      if (mute) {
        mute.addEventListener("click", function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      var full = box.querySelector("[data-player-fullscreen]");
      if (full) {
        full.addEventListener("click", function () {
          if (video.requestFullscreen) {
            video.requestFullscreen();
          }
        });
      }

      video.addEventListener("click", playToggle);
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
        setStatus("正在播放");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
        setStatus("已暂停");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  onReady(function () {
    initMobileMenu();
    initHeroSlider();
    initGlobalSearch();
    initPageFilters();
    initPlayers();
  });
})();
