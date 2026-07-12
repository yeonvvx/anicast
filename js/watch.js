document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  const ready = await CV.checkApiKey();

  const playerFrame = document.getElementById("playerFrame");
  const watchBody = document.getElementById("watchBody");

  const params = new URLSearchParams(location.search);
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const id = params.get("id");

  if (!ready) {
    playerFrame.innerHTML = "";
    watchBody.innerHTML = CV.configNoticeHTML();
    return;
  }

  if (!id) {
    playerFrame.innerHTML = "";
    watchBody.innerHTML = CV.emptyStateHTML("No title selected", "Head back and pick something to watch a trailer for.");
    return;
  }

  playerFrame.innerHTML = `<div class="no-trailer"><div class="section-note" style="padding:0;">loading…</div></div>`;
  watchBody.innerHTML = "";

  try {
    const data = await CV.tmdb(`/${type}/${id}`, { append_to_response: "videos,credits" });
    const trailers = (data.videos?.results || []).filter((v) => v.site === "YouTube");
    const trailer = CV.pickTrailer(trailers);

    document.title = `${CV.titleOf(data)} — Watch Trailer — CineVault`;

    renderPlayer(playerFrame, trailer);
    if (trailers.length > 1) renderTrailerPicker(watchBody, trailers, trailer, playerFrame);

    const title = CV.titleOf(data);
    const year = CV.yearOf(data);
    const runtime = data.runtime
      ? `${data.runtime} min`
      : data.episode_run_time?.[0]
      ? `${data.episode_run_time[0]} min/ep`
      : data.number_of_seasons
      ? `${data.number_of_seasons} season${data.number_of_seasons > 1 ? "s" : ""}`
      : null;

    const cast = (data.credits?.cast || []).slice(0, 10);

    const infoWrap = document.createElement("div");
    infoWrap.innerHTML = `
      <h1 class="watch-title">${title}</h1>
      <div class="watch-meta">
        ${data.vote_average ? `<span class="badge rating">★ ${data.vote_average.toFixed(1)}</span>` : ""}
        <span class="badge">${year}</span>
        ${runtime ? `<span class="badge">${runtime}</span>` : ""}
        <span class="badge">${type === "tv" ? "TV Show" : "Movie"}</span>
      </div>
      <p class="watch-overview">${data.overview || "No overview available."}</p>
      <div class="watch-genres">${(data.genres || []).map((g) => `<span class="chip">${g.name}</span>`).join("")}</div>
      <div class="watch-actions">
        <button class="btn btn-primary" id="watchlistBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>
          <span id="watchlistBtnLabel">${CV.isInWatchlist(id, type) ? "In Watchlist" : "Add to Watchlist"}</span>
        </button>
      </div>
      ${
        cast.length
          ? `<div class="cast-row">${cast
              .map(
                (c) => `
        <div class="cast-card">
          <img src="${CV.IMG.profile(c.profile_path) || CV.PLACEHOLDER_POSTER}" alt="${c.name}" />
          <div class="cn">${c.name}</div>
          <div class="cc">${c.character || ""}</div>
        </div>`
              )
              .join("")}</div>`
          : ""
      }`;
    watchBody.appendChild(infoWrap);

    document.getElementById("watchlistBtn").addEventListener("click", () => {
      const inList = CV.toggleWatchlist(data, type);
      document.getElementById("watchlistBtnLabel").textContent = inList ? "In Watchlist" : "Add to Watchlist";
    });

    CV.logHistory(data, type);
  } catch (e) {
    playerFrame.innerHTML = "";
    watchBody.innerHTML = CV.emptyStateHTML("Couldn't load this title", "Check your connection or TMDB key and try again.");
  }
});

function renderPlayer(playerFrame, trailer) {
  playerFrame.innerHTML = "";
  if (trailer) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = trailer.name || "Trailer";
    playerFrame.appendChild(iframe);
  } else {
    playerFrame.innerHTML = `
      <div class="no-trailer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 5v14l11-7L8 5Z"/></svg>
        <div>No trailer available for this title on TMDB</div>
      </div>`;
  }
}

function renderTrailerPicker(watchBody, trailers, current, playerFrame) {
  const picker = document.createElement("div");
  picker.className = "trailer-picker";
  picker.innerHTML = trailers
    .slice(0, 6)
    .map((v) => `<button data-key="${v.key}" class="${current && v.key === current.key ? "active" : ""}">${v.type}${v.official ? " · official" : ""}</button>`)
    .join("");
  watchBody.prepend(picker);
  picker.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = trailers.find((v) => v.key === btn.dataset.key);
      renderPlayer(playerFrame, t);
      picker.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      playerFrame.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}
