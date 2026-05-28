(function () {
  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', root);
    var dots = queryAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = queryAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var container = panel.parentElement;
      var grid = container ? container.querySelector('[data-movie-grid]') : null;
      if (!grid) {
        return;
      }
      var cards = queryAll('[data-title]', grid);
      var input = panel.querySelector('[data-local-search]');
      var clearButton = panel.querySelector('[data-clear-filter]');
      var count = panel.querySelector('[data-filter-count]');
      var activeGenre = '';
      var activeYear = '';

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesGenre = !activeGenre || haystack.indexOf(normalize(activeGenre)) !== -1;
          var matchesYear = !activeYear || normalize(card.getAttribute('data-year')) === normalize(activeYear);
          var shouldShow = matchesKeyword && matchesGenre && matchesYear;
          card.setAttribute('data-movie-card-hidden', shouldShow ? 'false' : 'true');
          if (shouldShow) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      function activateButton(button, selector) {
        queryAll(selector, panel).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      }

      queryAll('[data-filter-genre]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          activeGenre = button.getAttribute('data-filter-genre') || '';
          activateButton(button, '[data-filter-genre]');
          apply();
        });
      });

      queryAll('[data-filter-year]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          activeYear = button.getAttribute('data-filter-year') || '';
          activateButton(button, '[data-filter-year]');
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      if (clearButton) {
        clearButton.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          activeGenre = '';
          activeYear = '';
          queryAll('[data-filter-genre], [data-filter-year]', panel).forEach(function (button) {
            var value = button.getAttribute('data-filter-genre');
            if (value === null) {
              value = button.getAttribute('data-filter-year');
            }
            button.classList.toggle('active', value === '');
          });
          apply();
        });
      }

      apply();
    });
  }

  function setupPlayers() {
    queryAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = video ? video.getAttribute('data-stream') : '';
      var hls = null;
      var loaded = false;

      function loadSource() {
        if (!video || !source || loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        loadSource();
        player.classList.add('playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === video && !video.paused) {
          return;
        }
        if (!loaded || video.paused) {
          playVideo();
        }
      });

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            player.classList.remove('playing');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  setupMenu();
  setupHero();
  setupFilters();
  setupPlayers();
})();
