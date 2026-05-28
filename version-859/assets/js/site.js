(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMobileNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback]'));
    images.forEach(function (image) {
      function markMissing() {
        image.classList.add('is-hidden');
        var coverBox = image.closest('[data-cover-box], .poster-wrap, .poster-side, .hero-slide, .detail-hero');
        if (coverBox) {
          coverBox.classList.add('cover-missing');
        }
      }
      image.addEventListener('error', markMissing);
      if (image.complete && image.naturalWidth === 0) {
        markMissing();
      }
    });
  }

  function initDomFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var count = scope.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function applyFilter() {
        var keyword = valueOf(input);
        var selectedYear = valueOf(year);
        var selectedRegion = valueOf(region);
        var selectedType = valueOf(type);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || (card.getAttribute('data-year') || '').toLowerCase() === selectedYear;
          var matchesRegion = !selectedRegion || (card.getAttribute('data-region') || '').toLowerCase() === selectedRegion;
          var matchesType = !selectedType || (card.getAttribute('data-type') || '').toLowerCase() === selectedType;
          var visibleNow = matchesKeyword && matchesYear && matchesRegion && matchesType;
          card.classList.toggle('is-filtered-out', !visibleNow);
          if (visibleNow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [input, year, region, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
      applyFilter();
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildSearchCard(movie) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="poster-wrap" data-cover-box href="video/' + escapeHtml(movie.id) + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img data-fallback src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async" />',
      '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
      '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="video/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="tag-row"><span class="tag">' + escapeHtml(movie.category) + '</span><span class="tag">' + escapeHtml(movie.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function initSearchPage() {
    var container = document.getElementById('search-results');
    if (!container || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim().toLowerCase();
    var input = document.getElementById('search-page-input');
    var title = document.getElementById('search-title');
    var subtitle = document.getElementById('search-subtitle');
    if (input) {
      input.value = keyword;
    }

    var movies = window.MOVIE_INDEX;
    var results = movies.filter(function (movie) {
      if (!keyword) {
        return true;
      }
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags, movie.one_line]
        .join(' ')
        .toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    });

    var limited = results.slice(0, 240);
    if (title) {
      title.textContent = keyword ? '“' + keyword + '”的搜索结果' : '推荐影片';
    }
    if (subtitle) {
      subtitle.textContent = '共匹配 ' + results.length + ' 条，当前展示 ' + limited.length + ' 条。';
    }

    container.innerHTML = limited.map(buildSearchCard).join('\n') || '<p>没有找到匹配影片，请换一个关键词试试。</p>';
    initImageFallbacks();
  }

  ready(function () {
    initMobileNavigation();
    initHeroSlider();
    initImageFallbacks();
    initDomFilters();
    initSearchPage();
  });
})();
