(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-search-scope]').forEach(function (panel) {
    var section = panel.parentElement;
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var empty = panel.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilters() {
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      var keyword = normalize(input && input.value);
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matches = matchesKeyword && matchesRegion && matchesYear;
        card.style.display = matches ? '' : 'none';
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
