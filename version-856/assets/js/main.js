(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('.menu-toggle');
  var mobilePanel = qs('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobilePanel.hasAttribute('hidden');
      if (isHidden) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.textContent = '×';
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      }
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  function buildOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  qsa('.filter-scope').forEach(function (scope) {
    var container = scope.closest('section') || document;
    var input = qs('.filter-input', container);
    var yearSelect = qs('.filter-year', container);
    var typeSelect = qs('.filter-type', container);
    var cards = qsa('.movie-card', scope);
    var years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean))).sort().reverse();
    var types = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-type') || '';
    }).filter(Boolean))).sort();

    buildOptions(yearSelect, years);
    buildOptions(typeSelect, types);

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var typeValue = card.getAttribute('data-type') || '';
        var visible = (!query || text.indexOf(query) !== -1) && (!year || yearValue === year) && (!type || typeValue === type);
        card.classList.toggle('is-hidden-card', !visible);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var queryInput = qs('.query-input', container);
    if (q && queryInput) {
      queryInput.value = q;
    }
    applyFilters();
  });
})();
