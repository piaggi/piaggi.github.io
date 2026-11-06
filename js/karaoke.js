(() => {
  'use strict';
  const player = document.getElementById('karaoke-player');
  if (!player) return;
  const loadButton = document.querySelector('.karaoke-load');
  const status = document.querySelector('.karaoke-status');
  const title = document.querySelector('.karaoke-current-title');
  const artist = document.querySelector('.karaoke-current-artist');
  const tracks = Array.from(document.querySelectorAll('.karaoke-track'));
  const nativeHls = Boolean(player.canPlayType('application/vnd.apple.mpegurl'));
  let selected = tracks.findIndex(track => track.getAttribute('aria-pressed') === 'true');
  let engine;
  let libraryPromise;
  let version = 0;

  function fail(requestVersion) {
    if (requestVersion !== version) return;
    if (engine) { engine.destroy(); engine = null; }
    status.textContent = 'Nie udało się wczytać nagrania. Spróbuj ponownie lub wybierz inny utwór.';
    loadButton.textContent = 'Spróbuj ponownie';
    loadButton.disabled = false;
    loadButton.hidden = false;
  }

  function loadLibrary() {
    if (!libraryPromise) {
      libraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/hls/hls.min.js';
        script.onload = resolve;
        script.onerror = () => {
          script.remove(); libraryPromise = null;
          reject(new Error('HLS load failed'));
        };
        document.head.appendChild(script);
      });
    }
    return libraryPromise;
  }

  async function loadSelected() {
    const requestVersion = ++version;
    player.pause();
    if (engine) { engine.destroy(); engine = null; }
    loadButton.disabled = true;
    status.textContent = 'Wczytywanie: ' + tracks[selected].dataset.title + '…';
    const source = tracks[selected].dataset.source;
    if (nativeHls) {
      player.src = source;
      player.load();
      loadButton.hidden = true;
      status.textContent = 'Wybrano nagranie. Naciśnij odtwarzanie.';
      return;
    }
    try {
      await loadLibrary();
      // Ignore a delayed library load when the listener already chose another song.
      if (requestVersion !== version) return;
      if (!window.Hls || !window.Hls.isSupported()) {
        status.textContent = 'Ta przeglądarka nie obsługuje odtwarzania HLS. Spróbuj w aktualnej wersji Safari, Chrome lub Firefox.';
        loadButton.hidden = true;
        return;
      }
      engine = new window.Hls({ maxBufferLength: 30 });
      engine.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (requestVersion !== version) return;
        loadButton.hidden = true;
        status.textContent = 'Nagranie gotowe. Naciśnij odtwarzanie.';
      });
      engine.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail(requestVersion);
      });
      engine.loadSource(source);
      engine.attachMedia(player);
    } catch (_error) { fail(requestVersion); }
  }

  player.addEventListener('playing', () => {
    status.textContent = 'Teraz gra: ' + tracks[selected].dataset.title + ' — piaggi.';
  });
  if (nativeHls) player.addEventListener('error', () => {
    if (player.error) fail(version);
  });

  document.querySelector('.karaoke-playlist').hidden = false;
  tracks.forEach((track, index) => {
    track.addEventListener('click', () => {
      selected = index;
      tracks.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
      title.textContent = track.dataset.title;
      artist.textContent = track.dataset.artist + ' · wykonanie piaggi';
      player.setAttribute('aria-label', track.dataset.title + ' — wykonanie karaoke piaggi');
      loadSelected();
    });
  });
  loadButton.addEventListener('click', loadSelected);
  loadButton.hidden = nativeHls;
  if (!nativeHls) status.textContent = 'Wczytaj nagranie lub wybierz utwór z listy, a następnie naciśnij odtwarzanie.';
})();
