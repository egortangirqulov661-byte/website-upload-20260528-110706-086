(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var input = document.querySelector('[data-page-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visibleCount = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre'));
            var chipMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var visible = chipMatch && queryMatch;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    if (input && initialQuery) {
        input.value = initialQuery;
    }
    if (input) {
        input.addEventListener('input', applyFilter);
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function (other) {
                other.classList.toggle('is-active', other === chip);
            });
            applyFilter();
        });
    });
    if (cards.length) {
        applyFilter();
    }
})();
