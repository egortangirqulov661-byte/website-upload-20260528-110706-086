import { H as Hls } from './hls.js';

function showMessage(box, message) {
  if (!box) {
    return;
  }
  box.textContent = message;
  box.classList.add('is-visible');
}

function hideMessage(box) {
  if (!box) {
    return;
  }
  box.textContent = '';
  box.classList.remove('is-visible');
}

function setupPlayer(root) {
  var video = root.querySelector('video');
  var overlay = root.querySelector('.play-overlay');
  var message = root.querySelector('[data-player-message]');
  var source = root.getAttribute('data-src');
  var hlsInstance = null;
  var initialized = false;

  if (!video || !source) {
    return;
  }

  function startPlayback() {
    hideMessage(message);

    if (!initialized) {
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage(message, '网络加载异常，正在尝试重新连接播放源。');
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage(message, '媒体解码异常，正在尝试恢复播放。');
            hlsInstance.recoverMediaError();
          } else {
            showMessage(message, '当前浏览器无法播放此 HLS 视频源，请更换浏览器或稍后重试。');
            hlsInstance.destroy();
          }
        });
      } else {
        showMessage(message, '当前浏览器暂不支持 HLS 播放。');
        return;
      }
    }

    video.play().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }).catch(function () {
      showMessage(message, '浏览器阻止了自动播放，请再次点击播放器或使用视频控件播放。');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
  video.addEventListener('error', function () {
    showMessage(message, '视频加载失败，请检查播放源或网络连接。');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
