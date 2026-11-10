(() => {
  'use strict';
  // This is a public application identifier, not a personal access token.
  const CLIENT_ID = '7e0480f1b37bb6d233bfade2f2555b1e';
  const API = 'https://api.ising.pl/v2/users/piaggi/recordings';
  const LIMIT = 10;
  const MAX_PAGES = 20;
  const player = document.getElementById('karaoke-player');
  if (!player) return;
  const title = document.querySelector('.karaoke-current-title');
  const status = document.querySelector('.karaoke-status');
  const listStatus = document.querySelector('.karaoke-list-status');
  const list = document.querySelector('.karaoke-playlist ol');
  const loadButton = document.querySelector('.karaoke-load');
  const refreshButton = document.querySelector('.karaoke-refresh');
  const nativeHls = Boolean(player.canPlayType('application/vnd.apple.mpegurl'));
  let tracks = [];
  let selected = -1;
  let engine;
  let libraryPromise;
  let version = 0;
  let fetching = false;

  function recording(row) {
    const publicRecording = row.privacy === 0 || row.privacy === '0';
    const soloRecording = row.recording_type === 0 || row.recording_type === '0';
    const hasDuet = row.duet && (typeof row.duet !== 'object' || Object.keys(row.duet).length > 0);
    if (!publicRecording || !soloRecording || hasDuet || !row.id || typeof row.title !== 'string') return null;
    const published = Date.parse(row.date_published);
    if (!Number.isFinite(published)) return null;
    try {
      const url = new URL(row.media_url);
      if (url.protocol !== 'https:' || url.hostname !== 'w.ising.pl' || url.port || url.username || url.password ||
          !/^\/media\/play\/.+\/playlist\.m3u8$/.test(url.pathname)) return null;
      // Media playback uses the bare URL, without client IDs or personal tokens.
      url.search = '';
      url.hash = '';
      const duration = Number(row.duration);
      return { id: String(row.id), title: row.title, source: url.href, published,
        duration: Number.isFinite(duration) && duration >= 0 ? Math.floor(duration) : null };
    } catch (_error) { return null; }
  }

  async function getRecordings() {
    const found = new Map();
    const pages = new Set();
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = new URL(API);
      url.search = new URLSearchParams({ client_id: CLIENT_ID, recording_type: 'all', privacy: 'all',
        sort: 'date', pagination: '1', browse: '1', page: String(page) });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let body;
      try {
        const response = await fetch(url, { credentials: 'omit', signal: controller.signal });
        if (!response.ok) throw new Error('API request failed');
        body = await response.json();
      } finally { clearTimeout(timeout); }
      if (!body || !Array.isArray(body.data)) throw new Error('Invalid API response');
      if (!body.data.length) return [...found.values()];
      const signature = JSON.stringify(body.data.map(row => row && row.id));
      if (pages.has(signature)) throw new Error('API pagination did not advance');
      pages.add(signature);
      for (const row of body.data) {
        if (!row || typeof row !== 'object') continue;
        const track = recording(row);
        if (track) found.set(track.id, track);
      }
      if (found.size >= LIMIT) return [...found.values()];
    }
    throw new Error('API page limit reached');
  }

  function stopPlayer() {
    version++;
    player.pause();
    if (engine) { engine.destroy(); engine = null; }
    player.removeAttribute('src');
    player.load();
  }

  function fail(requestVersion) {
    if (requestVersion !== version) return;
    if (engine) { engine.destroy(); engine = null; }
    status.textContent = 'Nie udało się wczytać nagrania. Spróbuj ponownie lub wybierz inny utwór.';
    loadButton.textContent = 'Spróbuj ponownie';
    loadButton.disabled = false;
    loadButton.hidden = false;
  }

  function loadLibrary() {
    if (!libraryPromise) libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/hls/hls.min.js';
      script.onload = resolve;
      script.onerror = () => { script.remove(); libraryPromise = null; reject(new Error('HLS unavailable')); };
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  async function loadSelected() {
    if (selected < 0) return;
    stopPlayer();
    const requestVersion = version;
    const track = tracks[selected];
    loadButton.disabled = true;
    status.textContent = 'Wczytywanie: ' + track.title + '…';
    if (nativeHls) {
      player.src = track.source;
      player.load();
      loadButton.hidden = true;
      status.textContent = 'Wybrano nagranie. Naciśnij odtwarzanie.';
      return;
    }
    try {
      await loadLibrary();
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
      engine.on(window.Hls.Events.ERROR, (_event, data) => { if (data.fatal) fail(requestVersion); });
      engine.loadSource(track.source);
      engine.attachMedia(player);
    } catch (_error) { fail(requestVersion); }
  }

  function select(index, load) {
    selected = index;
    const track = tracks[index];
    title.textContent = track.title;
    player.setAttribute('aria-label', track.title + ' — karaoke');
    list.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    loadButton.textContent = 'Wczytaj nagranie';
    loadButton.disabled = false;
    loadButton.hidden = nativeHls;
    if (load) loadSelected();
    else if (nativeHls) player.src = track.source;
    else status.textContent = 'Wczytaj nagranie lub wybierz utwór z listy, a następnie naciśnij odtwarzanie.';
  }

  function render() {
    list.replaceChildren();
    tracks.forEach((track, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'karaoke-track';
      button.setAttribute('aria-pressed', 'false');
      const number = document.createElement('span');
      number.className = 'track-number'; number.setAttribute('aria-hidden', 'true');
      number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'track-title'; label.textContent = track.title;
      button.append(number, label);
      if (track.duration !== null) {
        const duration = document.createElement('span'); duration.className = 'track-duration';
        duration.textContent = Math.floor(track.duration / 60) + ':' + String(track.duration % 60).padStart(2, '0');
        button.append(duration);
      }
      button.addEventListener('click', () => select(index, true));
      item.append(button); list.append(item);
    });
    if (tracks.length) select(0, false);
  }

  async function refresh() {
    if (fetching) return;
    fetching = true;
    stopPlayer();
    tracks = []; selected = -1;
    list.replaceChildren();
    title.textContent = 'Wybierz nagranie'; status.textContent = '';
    loadButton.hidden = true;
    refreshButton.hidden = false; refreshButton.disabled = true;
    listStatus.textContent = 'Wczytywanie nagrań…';
    try {
      tracks = (await getRecordings()).sort((a, b) => b.published - a.published).slice(0, LIMIT);
      render();
      listStatus.textContent = tracks.length ? '' : 'Nie znaleziono publicznych nagrań solowych.';
      refreshButton.textContent = 'Odśwież listę';
    } catch (_error) {
      listStatus.textContent = 'Nie udało się pobrać nagrań. Spróbuj ponownie za chwilę.';
      refreshButton.textContent = 'Spróbuj ponownie';
    } finally { fetching = false; refreshButton.disabled = false; }
  }

  player.addEventListener('playing', () => {
    if (selected >= 0) status.textContent = 'Teraz gra: ' + tracks[selected].title + '.';
  });
  if (nativeHls) player.addEventListener('error', () => { if (selected >= 0 && player.error) fail(version); });
  loadButton.addEventListener('click', loadSelected);
  refreshButton.addEventListener('click', refresh);
  refresh();
})();
