var MoviePlayer = (function () {
  function start(videoId, coverId, buttonId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var hls = null;

    if (!video || !source) {
      return;
    }

    function bindSource() {
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

    function play() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      bindSourceOnce();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    var bound = false;
    function bindSourceOnce() {
      if (!bound) {
        bound = true;
        bindSource();
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      bindSourceOnce();
    });
    video.addEventListener('emptied', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      bound = false;
    });
  }

  return {
    start: start
  };
})();
