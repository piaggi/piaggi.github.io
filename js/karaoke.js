(() => {
  'use strict';
  const player = document.getElementById('karaoke-player');
  if (!player) return;
  const button = document.querySelector('.karaoke-load');
  const status = document.querySelector('.karaoke-status');
  const source = player.querySelector('source').src;
  let engine;
  let libraryPromise;
  let loading = false;

  function fail() {
    loading = false;
    if (engine) { engine.destroy(); engine = null; }
    status.textContent = 'Nie udało się wczytać nagrania. Spróbuj ponownie za chwilę.';
    button.textContent = 'Spróbuj ponownie';
    button.disabled = false;
    button.hidden = false;
  }

  player.addEventListener('playing', () => {
    status.textContent = 'Teraz gra: Piosenka księżycowa — piaggi.';
  });

  // Safari and other browsers with native HLS use their built-in player.
  if (player.canPlayType('application/vnd.apple.mpegurl')) {
    player.addEventListener('error', () => {
      status.textContent = 'Nie udało się odtworzyć nagrania. Spróbuj ponownie za chwilę.';
    });
    return;
  }

  button.hidden = false;
  status.textContent = 'Wczytaj nagranie, a następnie naciśnij odtwarzanie.';
  button.addEventListener('click', async () => {
    if (loading) return;
    loading = true;
    button.disabled = true;
    status.textContent = 'Wczytywanie nagrania…';
    try {
      if (!libraryPromise) {
        libraryPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'vendor/hls/hls.min.js';
          script.onload = resolve;
          script.onerror = () => { script.remove(); libraryPromise = null; reject(new Error('HLS load failed')); };
          document.head.appendChild(script);
        });
      }
      await libraryPromise;
      if (!window.Hls || !window.Hls.isSupported()) {
        loading = false;
        status.textContent = 'Ta przeglądarka nie obsługuje odtwarzania HLS. Spróbuj w aktualnej wersji Safari, Chrome lub Firefox.';
        button.hidden = true;
        return;
      }
      engine = new window.Hls({ maxBufferLength: 30 });
      engine.on(window.Hls.Events.MANIFEST_PARSED, () => {
        loading = false;
        button.hidden = true;
        status.textContent = 'Nagranie gotowe. Naciśnij odtwarzanie.';
      });
      engine.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      engine.loadSource(source);
      engine.attachMedia(player);
    } catch (_error) {
      fail();
    }
  });
})();
