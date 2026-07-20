/* =================================================================
   CineVault — music.js
   Backed by the iTunes Search API (itunes.apple.com/search). No
   key or signup required. That endpoint doesn't send CORS headers,
   so it's called via its documented JSONP mode (a <script> tag +
   callback) instead of fetch — that's the standard workaround and
   works from any static page with no backend.
   Tapping a card plays its 30-second preview in a bottom mini-player.
================================================================= */
const MUSIC_GENRES = [
  { label: "Pop", term: "pop hits" },
  { label: "Hip-Hop", term: "hip hop hits" },
  { label: "R&B", term: "r&b hits" },
  { label: "Rock", term: "rock hits" },
  { label: "Electronic", term: "electronic dance" },
  { label: "K-Pop", term: "k-pop" },
  { label: "Anime", term: "anime soundtrack" },
  { label: "Classical", term: "classical" },
];

let musicTerm = MUSIC_GENRES[0].term;
let musicQuery = "";
let musicLoadToken = 0;
let audioEl = null;
let activeCard = null;

document.addEventListener("DOMContentLoaded", () => {
  CV.initTopSearch();
  CV.checkApiKey();
  renderGenreChips();

  const form = document.getElementById("musicSearchForm");
  const input = document.getElementById("musicSearchInput");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    musicQuery = input.value.trim();
    loadMusic();
  });

  loadMusic();
});

function renderGenreChips() {
  const row = document.getElementById("musicGenreChips");
  if (!row) return;
  row.innerHTML = MUSIC_GENRES.map(
    (g, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-term="${encodeURIComponent(g.term)}">${g.label}</button>`
  ).join("");
  row.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      musicTerm = decodeURIComponent(chip.dataset.term);
      musicQuery = "";
      const input = document.getElementById("musicSearchInput");
      if (input) input.value = "";
      loadMusic();
    });
  });
}

function itunesJSONP(params) {
  return new Promise((resolve, reject) => {
    const cbName = "cvItunesCb_" + Math.random().toString(36).slice(2);
    const url = new URL("https://itunes.apple.com/search");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("callback", cbName);

    let settled = false;
    const script = document.createElement("script");

    const cleanup = () => {
      delete window[cbName];
      script.remove();
    };

    window[cbName] = (data) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("iTunes request failed"));
    };

    script.src = url.toString();
    document.body.appendChild(script);

    setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("iTunes request timed out"));
    }, 10000);
  });
}

async function loadMusic() {
  const grid = document.getElementById("musicGrid");
  if (!grid) return;
  const myToken = ++musicLoadToken;
  grid.innerHTML = CV.skeletonHTML(18);
  try {
    const term = musicQuery || musicTerm;
    const data = await itunesJSONP({ term, media: "music", entity: "song", limit: 24 });
    if (myToken !== musicLoadToken) return;
    const results = (data.results || []).filter((r) => r.previewUrl);
    grid.innerHTML = results.length
      ? results.map(musicCardHTML).join("")
      : CV.emptyStateHTML("No results", "Try a different genre or search term.");
    attachMusicCardHandlers(grid);
  } catch (e) {
    if (myToken !== musicLoadToken) return;
    grid.innerHTML = CV.emptyStateHTML("Couldn't load music", "iTunes might be unreachable — check your connection and refresh.");
  }
}

function hiResArtwork(url) {
  return url ? url.replace("100x100bb", "300x300bb") : CV.PLACEHOLDER_POSTER;
}

function musicCardHTML(t) {
  const art = hiResArtwork(t.artworkUrl100);
  return `
    <div class="card music-card" tabindex="0" role="button"
         data-preview="${t.previewUrl}" data-title="${escapeHTML(t.trackName)}"
         data-artist="${escapeHTML(t.artistName)}" data-art="${art}" data-link="${t.trackViewUrl || ""}">
      <div class="card-poster">
        <img src="${art}" alt="${escapeHTML(t.trackName)}" loading="lazy" />
        <div class="card-play"><div class="card-play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>
        </div></div>
      </div>
      <div class="card-title">${escapeHTML(t.trackName)}</div>
      <div class="card-sub">${escapeHTML(t.artistName)}</div>
    </div>`;
}

function attachMusicCardHandlers(grid) {
  grid.querySelectorAll(".music-card").forEach((card) => {
    card.addEventListener("click", () => playPreview(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        playPreview(card);
      }
    });
  });
}

function ensurePlayer() {
  if (audioEl) return;
  const bar = document.createElement("div");
  bar.className = "mini-player";
  bar.id = "miniPlayer";
  bar.innerHTML = `
    <img id="mpArt" src="" alt="" />
    <div class="mp-meta">
      <div class="mp-title" id="mpTitle"></div>
      <div class="mp-artist" id="mpArtist"></div>
    </div>
    <button class="mp-btn" id="mpToggle" type="button" aria-label="Play or pause preview">
      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
    </button>
    <a class="mp-link" id="mpLink" href="#" target="_blank" rel="noopener">Open in Apple Music</a>
    <button class="mp-close" id="mpClose" type="button" aria-label="Close player">✕</button>`;
  document.body.appendChild(bar);

  audioEl = new Audio();
  audioEl.addEventListener("ended", () => {
    setPlayIcon(true);
    activeCard?.classList.remove("playing");
  });

  document.getElementById("mpToggle").addEventListener("click", () => {
    if (!audioEl.src) return;
    if (audioEl.paused) {
      audioEl.play();
      setPlayIcon(false);
      activeCard?.classList.add("playing");
    } else {
      audioEl.pause();
      setPlayIcon(true);
      activeCard?.classList.remove("playing");
    }
  });

  document.getElementById("mpClose").addEventListener("click", () => {
    audioEl.pause();
    activeCard?.classList.remove("playing");
    document.getElementById("miniPlayer").classList.remove("open");
  });
}

function setPlayIcon(paused) {
  const btn = document.getElementById("mpToggle");
  btn.innerHTML = paused
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
}

function playPreview(card) {
  ensurePlayer();
  const { preview, title, artist, art, link } = card.dataset;
  if (!preview) return;

  activeCard?.classList.remove("playing");
  activeCard = card;
  card.classList.add("playing");

  document.getElementById("mpArt").src = art;
  document.getElementById("mpTitle").textContent = title;
  document.getElementById("mpArtist").textContent = artist;
  document.getElementById("mpLink").href = link || "#";

  audioEl.src = preview;
  audioEl.currentTime = 0;
  audioEl.play();
  setPlayIcon(false);
  document.getElementById("miniPlayer").classList.add("open");
}

function escapeHTML(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
