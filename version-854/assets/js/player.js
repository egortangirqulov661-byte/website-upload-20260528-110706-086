(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var error = box.querySelector('[data-player-error]');
    var source = box.getAttribute('data-video');
    var started = false;
    var hlsInstance = null;

    function showError() {
      if (error) {
        error.hidden = false;
      }
      if (button) {
        button.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(showError);
      }
    }

    function loadAndPlay() {
      if (!video || !source) {
        showError();
        return;
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      if (error) {
        error.hidden = true;
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            showError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.addEventListener('error', showError, { once: true });
      } else {
        showError();
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
    box.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('button')) {
        return;
      }
      loadAndPlay();
    });
  }

  document.querySelectorAll('[data-player]').forEach(startPlayer);
})();
