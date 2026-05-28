(function () {
    function initMoviePlayer(streamUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playOverlay');
        var hlsInstance = null;
        var ready = false;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            prepare();
            overlay.classList.add('is-hidden');
            var playback = video.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
