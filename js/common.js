/* =================================================================
   CineVault — common.js
   Shared helpers loaded on every page. No modules/bundler — this
   file just attaches everything to a single `CV` global so each
   page's own small script can use it.
================================================================= */
const CV = (() => {
  "use strict";

  const {
  apiKey,
  apiBase,
  imgBase,
  posterSize,
  backdropSize,
  profileSize,
  animeGenreId,
   } = CONFIG;

   const IMG = {
     poster: (p, size = posterSize) =>
       p ? `${imgBase}/${size}${p}` : null,

     backdrop: (p, size = backdropSize) =>
       p ? `${imgBase}/${size}${p}` : null,

     profile: (p, size = profileSize) =>
       p ? `${imgBase}/${size}${p}` : null,
   };

  const PLACEHOLDER_POSTER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='342' height='513'><rect width='100%' height='100%' fill='#1a1a24'/><text x='50%' y='50%' fill='#5b5b6b' font-family='sans-serif' font-size='16' text-anchor='middle'>No Image</text></svg>`
    );

  /* ---------------- TMDB fetch (with a tiny in-memory cache) ---------------- */
  const cache = new Map();

  async function tmdb(path, params = {}) {
    const key = path + JSON.stringify(params);
    if (cache.has(key)) return cache.get(key);

    const url = new URL(apiBase + path);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = new Error(`TMDB ${res.status} on ${path}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    cache.set(key, data);
    return data;
  }

  /* ---------------- API key check (runs once per page) ---------------- */
  function keyIsSet() {
    return !!apiKey && apiKey !== "f1df4f14cd29615aba9945cd4630b823";
  }

  async function checkApiKey() {
    const tag = document.getElementById("apiStatusTag");
    if (!keyIsSet()) {
      if (tag) {
        tag.textContent = "no TMDB key set — see js/config.js";
        tag.style.color = "#ff4d94";
      }
      return false;
    }
    try {
      await tmdb("/configuration");
      if (tag) {
        tag.textContent = "TMDB connected";
        tag.style.color = "";
      }
      return true;
    } catch (e) {
      if (tag) {
        tag.textContent = "TMDB key invalid or blocked";
        tag.style.color = "#ff4d94";
      }
      return false;
    }
  }

  function configNoticeHTML() {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        <h3>Add a TMDB API key to get started</h3>
        <p>Open <code>js/config.js</code> in the GitHub web editor, paste a free key from
        themoviedb.org/settings/api, and commit. No terminal needed — the site updates as soon as GitHub Pages rebuilds.</p>
      </div>`;
  }

  /* ---------------- shared item helpers ---------------- */
  function mediaTypeOf(item) {
    return item.media_type || (item.first_air_date ? "tv" : "movie");
  }
  function titleOf(item) {
    return item.title || item.name || "Untitled";
  }
  function yearOf(item) {
    const d = item.release_date || item.first_air_date;
    return d ? d.slice(0, 4) : "—";
  }

  /* Cards are real <a> links to watch.html — they work with JS off too. */
  function cardHTML(item) {
    const type = mediaTypeOf(item);
    const poster = IMG.poster(item.poster_path) || PLACEHOLDER_POSTER;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    return `
      <a class="card" href="watch.html?type=${type}&id=${item.id}">
        <div class="card-poster">
          <img src="${poster}" alt="${titleOf(item)}" loading="lazy" />
          ${rating ? `<div class="card-rating">★ ${rating}</div>` : ""}
          <div class="card-play"><div class="card-play-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>
          </div></div>
        </div>
        <div class="card-title">${titleOf(item)}</div>
        <div class="card-sub">${yearOf(item)} · ${type === "tv" ? "TV" : "Movie"}</div>
      </a>`;
  }

  function skeletonHTML(n) {
    return Array.from({ length: n })
      .map(() => `<div class="card skeleton"><div class="card-poster"></div></div>`)
      .join("");
  }

  function emptyStateHTML(title, body) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 15h.01M12 15h.01M16 15h.01"/></svg>
        <h3>${title}</h3>
        <p>${body}</p>
      </div>`;
  }

  /* ---------------- topbar search (present on every page) ---------------- */
  function initTopSearch() {
    const input = document.getElementById("topSearchInput");
    const form = document.getElementById("topSearchForm");
    const box = document.getElementById("searchResults");
    if (!input || !box) return;

    let debounce;
    input.addEventListener("input", () => {
      clearTimeout(debounce);
      const q = input.value.trim();
      if (!q) {
        box.classList.remove("open");
        return;
      }
      debounce = setTimeout(() => runQuickSearch(q, box), 280);
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) location.href = `search.html?q=${encodeURIComponent(q)}`;
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) box.classList.remove("open");
    });
  }

  async function runQuickSearch(q, box) {
    try {
      const data = await tmdb("/search/multi", { query: q });
      const results = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv").slice(0, 8);
      box.innerHTML = results.length
        ? results
            .map(
              (r) => `
        <a class="search-result-item" href="watch.html?type=${r.media_type}&id=${r.id}">
          <img src="${IMG.poster(r.poster_path, "w92") || PLACEHOLDER_POSTER}" alt="" />
          <div class="sri-meta">
            <div class="sri-title">${titleOf(r)}</div>
            <div class="sri-sub">${yearOf(r)} · ${r.media_type === "tv" ? "TV" : "Movie"}</div>
          </div>
        </a>`
            )
            .join("")
        : `<div class="section-note" style="padding:14px;">No matches.</div>`;
      box.classList.add("open");
    } catch (e) {
      box.innerHTML = `<div class="section-note" style="padding:14px;">Search failed.</div>`;
      box.classList.add("open");
    }
  }

  /* ---------------- watchlist + history (localStorage only) ---------------- */
  const WATCHLIST_KEY = "cinevault_watchlist";
  const HISTORY_KEY = "cinevault_history";

  function readStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }
  function writeStore(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function isInWatchlist(id, type) {
    return readStore(WATCHLIST_KEY).some((i) => String(i.id) === String(id) && i.type === type);
  }

  function toggleWatchlist(item, type) {
    const list = readStore(WATCHLIST_KEY);
    const idx = list.findIndex((i) => String(i.id) === String(item.id) && i.type === type);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift({
        id: item.id,
        type,
        title: titleOf(item),
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        addedAt: Date.now(),
      });
    }
    writeStore(WATCHLIST_KEY, list);
    return isInWatchlist(item.id, type);
  }

  function logHistory(item, type) {
    let list = readStore(HISTORY_KEY);
    list = list.filter((i) => !(String(i.id) === String(item.id) && i.type === type));
    list.unshift({
      id: item.id,
      type,
      title: titleOf(item),
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      watchedAt: Date.now(),
    });
    writeStore(HISTORY_KEY, list.slice(0, 60));
  }

  function clearHistory() {
    writeStore(HISTORY_KEY, []);
  }

  /* ---------------- trailer selection ---------------- */
  function pickTrailer(videos, preferKey) {
    if (!videos || !videos.length) return null;
    const yt = videos.filter((v) => v.site === "YouTube");
    if (preferKey) {
      const found = yt.find((v) => v.key === preferKey);
      if (found) return found;
    }
    return (
      yt.find((v) => v.type === "Trailer" && v.official) ||
      yt.find((v) => v.type === "Trailer") ||
      yt.find((v) => v.type === "Teaser") ||
      yt[0] ||
      null
    );
  }

  return {
    IMG,
    PLACEHOLDER_POSTER,
    tmdb,
    keyIsSet,
    checkApiKey,
    configNoticeHTML,
    mediaTypeOf,
    titleOf,
    yearOf,
    cardHTML,
    skeletonHTML,
    emptyStateHTML,
    initTopSearch,
    isInWatchlist,
    toggleWatchlist,
    logHistory,
    clearHistory,
    readStore,
    WATCHLIST_KEY,
    HISTORY_KEY,
    pickTrailer,
    animeGenreId,
  };
})();
