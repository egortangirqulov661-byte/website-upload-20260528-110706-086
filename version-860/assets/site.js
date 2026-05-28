(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function setupInlineFilters() {
        document.querySelectorAll(".inline-filter").forEach(function (form) {
            var scopeId = form.getAttribute("data-filter-scope");
            var input = form.querySelector("input");
            var scope = scopeId ? document.getElementById(scopeId) : null;
            if (!input || !scope) {
                return;
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
            });
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                scope.querySelectorAll(".movie-card").forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function cardHTML(item) {
        return [
            '<article class="movie-card">',
            '<a class="movie-cover" href="./' + item.file + '">',
            '<img src="' + item.cover + '" alt="' + escapeHTML(item.title) + '海报" loading="lazy">',
            '<span class="cover-badge">' + escapeHTML(item.category) + '</span>',
            '<span class="cover-year">' + escapeHTML(item.year) + '</span>',
            '<span class="cover-play">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="./' + item.file + '">' + escapeHTML(item.title) + '</a></h3>',
            '<p>' + escapeHTML(item.description) + '</p>',
            '<div class="movie-meta">',
            '<span>' + escapeHTML(item.region) + '</span>',
            '<span>' + escapeHTML(item.type) + '</span>',
            '<span>★ ' + escapeHTML(item.rating) + '</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var empty = document.getElementById("search-empty");
        var label = document.getElementById("search-keyword");
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (label && query) {
            label.textContent = "搜索关键词：“" + query + "”";
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.SEARCH_INDEX.filter(function (item) {
            if (!terms.length) {
                return false;
            }
            var hay = [item.title, item.description, item.category, item.genre, item.region, item.type, item.tags].join(" ").toLowerCase();
            return terms.every(function (term) {
                return hay.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        results.innerHTML = matched.map(cardHTML).join("");
        if (empty) {
            empty.classList.toggle("is-visible", matched.length === 0);
        }
    }

    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        if (!video || !videoUrl) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
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
                    }
                });
            }
        }

        function play() {
            attach();
            video.controls = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        attach();
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupInlineFilters();
        setupSearchPage();
    });
})();
