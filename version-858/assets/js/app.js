(function () {
    "use strict";

    var hlsCallbacks = [];
    var hlsLoading = false;

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
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

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var yearFilter = scope.querySelector("[data-year-filter]");
            var typeFilter = scope.querySelector("[data-type-filter]");
            var regionFilter = scope.querySelector("[data-region-filter]");
            var categoryFilter = scope.querySelector("[data-category-filter]");
            var empty = scope.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function value(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function update() {
                var keyword = value(input);
                var year = value(yearFilter);
                var type = value(typeFilter);
                var region = value(regionFilter);
                var category = value(categoryFilter);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (year && String(card.getAttribute("data-year") || "").toLowerCase() !== year) {
                        ok = false;
                    }
                    if (type && String(card.getAttribute("data-type") || "").toLowerCase() !== type) {
                        ok = false;
                    }
                    if (region && String(card.getAttribute("data-region") || "").toLowerCase() !== region) {
                        ok = false;
                    }
                    if (category && String(card.getAttribute("data-category") || "").toLowerCase() !== category) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, yearFilter, typeFilter, regionFilter, categoryFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", update);
                    element.addEventListener("change", update);
                }
            });

            update();
        });
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsLoading) {
            return;
        }
        hlsLoading = true;
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            hlsLoading = false;
            hlsCallbacks.splice(0).forEach(function (fn) {
                fn();
            });
        };
        script.onerror = function () {
            hlsLoading = false;
            hlsCallbacks.splice(0).forEach(function (fn) {
                fn();
            });
        };
        document.head.appendChild(script);
    }

    window.setupMoviePlayer = function (source, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var parsed = false;

        if (!video || !source) {
            return;
        }

        function attachSource(callback) {
            if (attached) {
                callback();
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                callback();
                return;
            }

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (!parsed) {
                            parsed = true;
                            callback();
                        }
                    });
                    window.setTimeout(function () {
                        if (!parsed) {
                            callback();
                        }
                    }, 1200);
                } else {
                    video.src = source;
                    callback();
                }
            });
        }

        function play() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            attachSource(function () {
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
