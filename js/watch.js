/* =================================================================
   Anicast — watch.js
   Real streaming integration with XPass, VidCore, VidSrc, Videasy
================================================================= */

(async () => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const id = params.get("id");           // TMDB ID
  const type = params.get("type") || "movie"; // movie | tv
  const season = params.get("season");
  const episode = params.get("episode");

  if (!id) {
    document.body.innerHTML = `<div class="empty-state"><h3>No ID provided</h3></div>`;
    return;
  }

  // DOM refs
  const titleEl = document.getElementById("watchTitle");
  const metaEl = document.getElementById("watchMeta");
  const posterEl = document.getElementById("watchPoster");
  const playerWrap = document.getElementById("playerWrap");
  const sourceTabs = document.getElementById("sourceTabs");
  const epGrid = document.getElementById("episodeGrid");

  let tmdbData = null;
  let imdbId = null;
  let currentSource = null;

  /* ---------------- Load TMDB details ---------------- */
  async function loadDetails() {
    try {
      const path = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
      tmdbData = await CV.tmdb(path, { append_to_response: "external_ids" });
      
      // Extract IMDB ID for VidSrc
      imdbId = tmdbData.external_ids?.imdb_id || null;
      
      renderHeader();
      renderPlayer();
      if (type === "tv") renderSeasons();
      
    } catch (e) {
      console.error(e);
      playerWrap.innerHTML = `<div class="empty-state"><h3>Failed to load title</h3><p>${e.message}</p></div>`;
    }
  }

  function renderHeader() {
    const title = tmdbData.title || tmdbData.name;
    const year = (tmdbData.release_date || tmdbData.first_air_date || "").slice(0, 4);
    const runtime = tmdbData.runtime || tmdbData.episode_run_time?.[0];
    const rating = tmdbData.vote_average ? tmdbData.vote_average.toFixed(1) : "—";
    
    if (titleEl) titleEl.textContent = title;
    if (metaEl) {
      metaEl.innerHTML = `
        <span class="rating">★ ${rating}</span>
        <span>${year}</span>
        ${runtime ? `<span>${Math.floor(runtime / 60)}h ${runtime % 60}m</span>` : ""}
        <span>${tmdbData.genres?.map(g => g.name).join(", ") || ""}</span>
      `;
    }
    if (posterEl) {
      posterEl.src = CV.IMG.poster(tmdbData.poster_path, "w500") || CV.PLACEHOLDER_POSTER;
    }
    document.title = `${title} — Anicast`;
  }

  /* ---------------- Build embed URLs ---------------- */
  function getEmbedUrl(sourceKey) {
    const src = STREAMING_SOURCES[sourceKey];
    if (!src) return null;

    // Check if we have the required ID type
    if (src.supports === "imdb" && !imdbId) return null;
    const idToUse = src.supports === "imdb" ? imdbId : id;

    if (type === "tv" && season && episode) {
      return src.tv(idToUse, season, episode);
    }
    return src.movie(idToUse);
  }

  /* ---------------- Render player + source tabs ---------------- */
  function renderPlayer() {
    // Build source tabs
    const availableSources = SOURCE_PRIORITY.filter(key => {
      const src = STREAMING_SOURCES[key];
      if (src.supports === "imdb" && !imdbId) return false;
      return true;
    });

    if (availableSources.length === 0) {
      playerWrap.innerHTML = `<div class="empty-state"><h3>No streaming sources available</h3><p>This title is missing required IDs.</p></div>`;
      return;
    }

    // Source tab buttons
    if (sourceTabs) {
      sourceTabs.innerHTML = availableSources.map(key => {
        const src = STREAMING_SOURCES[key];
        const isActive = key === (currentSource || availableSources[0]);
        return `<button class="source-tab ${isActive ? 'active' : ''}" data-source="${key}">${src.name}</button>`;
      }).join("");
      
      // Tab click handlers
      sourceTabs.querySelectorAll(".source-tab").forEach(btn => {
        btn.addEventListener("click", () => switchSource(btn.dataset.source));
      });
    }

    // Auto-load first available source
    switchSource(currentSource || availableSources[0]);
  }

  function switchSource(sourceKey) {
    currentSource = sourceKey;
    const url = getEmbedUrl(sourceKey);
    
    if (!url) {
      playerWrap.innerHTML = `<div class="empty-state"><h3>Source unavailable</h3></div>`;
      return;
    }

    // Update active tab
    document.querySelectorAll(".source-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.source === sourceKey);
    });

    // Render iframe
    const isXPass = sourceKey === "xpass";
    const iframeHtml = `
      <iframe 
        id="videoPlayer"
        src="${url}" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allowfullscreen
        allow="encrypted-media; autoplay; picture-in-picture"
        ${isXPass ? 'data-postmessage="true"' : ''}
      ></iframe>
    `;
    playerWrap.innerHTML = iframeHtml;

    // Setup XPass postMessage controls if applicable
    if (isXPass) setupXPassControls();
  }

  /* ---------------- XPass PostMessage API ---------------- */
  function setupXPassControls() {
    // Optional: Add custom controls overlay for XPass
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://play.xpass.top") return;
      const data = event.data;
      if (data?.type !== "player.event") return;
      
      switch (data.event.name) {
        case "ready":
          console.log("XPass player ready");
          break;
        case "error":
          console.error("XPass error:", data.event.code, data.event.message);
          // Auto-fallback on error
          fallbackSource();
          break;
      }
    });
  }

  function playerAction(action, extra = {}) {
    const iframe = document.getElementById("videoPlayer");
    if (!iframe || !iframe.dataset.postmessage) return;
    iframe.contentWindow.postMessage(
      { type: "player.action", action, ...extra },
      "https://play.xpass.top"
    );
  }

  function fallbackSource() {
    // Try next available source
    const remaining = SOURCE_PRIORITY.filter(k => k !== currentSource);
    const next = remaining.find(k => getEmbedUrl(k));
    if (next) {
      console.log(`Falling back to ${next}`);
      switchSource(next);
    }
  }

  /* ---------------- TV Season/Episode picker ---------------- */
  async function renderSeasons() {
    if (!epGrid) return;
    
    try {
      const { seasons } = await CV.tmdb(`/tv/${id}`);
      const currentSeason = season ? parseInt(season) : 1;
      
      // Fetch episodes for current season
      const seasonData = await CV.tmdb(`/tv/${id}/season/${currentSeason}`);
      
      epGrid.innerHTML = seasonData.episodes.map(ep => {
        const isActive = episode && parseInt(episode) === ep.episode_number;
        return `
          <a href="watch.html?id=${id}&type=tv&season=${currentSeason}&episode=${ep.episode_number}" 
             class="ep-card ${isActive ? 'active' : ''}">
            <span class="ep-num">${ep.episode_number}</span>
            <span class="ep-title">${ep.name}</span>
            <span class="ep-runtime">${ep.runtime || "—"}m</span>
          </a>
        `;
      }).join("");
      
    } catch (e) {
      console.error("Failed to load episodes:", e);
    }
  }

  // Initialize
  await loadDetails();
})();
