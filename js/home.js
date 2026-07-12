document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  const ready = await CV.checkApiKey();
  if (!ready) {
    document.getElementById("hero").innerHTML = CV.configNoticeHTML();
    return;
  }
  await buildHero();
  await buildShelves();
});

async function buildHero() {
  const hero = document.getElementById("hero");
  try {
    const trending = await CV.tmdb("/trending/movie/week");
    const picks = trending.results.slice(0, 5);

    hero.innerHTML = `
      ${picks
        .map(
          (m, i) => `
        <div class="hero-slide ${i === 0 ? "active" : ""}" data-i="${i}"
             style="background-image:url('${CV.IMG.backdrop(m.backdrop_path) || ""}')"></div>`
        )
        .join("")}
      <div class="hero-scrim"></div>
      <div class="hero-body">
        <div class="hero-eyebrow">TRENDING THIS WEEK</div>
        <h1 class="hero-title" id="heroTitle">${CV.titleOf(picks[0])}</h1>
        <div class="hero-meta" id="heroMeta">
          <span class="badge rating">★ ${picks[0].vote_average.toFixed(1)}</span>
          <span class="badge">${CV.yearOf(picks[0])}</span>
          <span class="badge">Movie</span>
        </div>
        <p class="hero-overview" id="heroOverview">${picks[0].overview || ""}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" id="heroPlayBtn" href="watch.html?type=movie&id=${picks[0].id}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>
            Play Trailer
          </a>
          <button class="btn btn-ghost" id="heroWatchlistBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>
            Watchlist
          </button>
        </div>
      </div>
      <div class="hero-dots">
        ${picks.map((_, i) => `<div class="hero-dot ${i === 0 ? "active" : ""}" data-i="${i}"></div>`).join("")}
      </div>`;

    let activeIdx = 0;
    const setActive = (i) => {
      activeIdx = i;
      hero.querySelectorAll(".hero-slide").forEach((s) => s.classList.toggle("active", +s.dataset.i === i));
      hero.querySelectorAll(".hero-dot").forEach((d) => d.classList.toggle("active", +d.dataset.i === i));
      const m = picks[i];
      document.getElementById("heroTitle").textContent = CV.titleOf(m);
      document.getElementById("heroOverview").textContent = m.overview || "";
      document.getElementById("heroMeta").innerHTML = `
        <span class="badge rating">★ ${m.vote_average.toFixed(1)}</span>
        <span class="badge">${CV.yearOf(m)}</span>
        <span class="badge">Movie</span>`;
      document.getElementById("heroPlayBtn").href = `watch.html?type=movie&id=${m.id}`;
    };

    hero.querySelectorAll(".hero-dot").forEach((dot) => dot.addEventListener("click", () => setActive(+dot.dataset.i)));

    let timer = setInterval(() => setActive((activeIdx + 1) % picks.length), 7000);
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", () => {
      timer = setInterval(() => setActive((activeIdx + 1) % picks.length), 7000);
    });

    document.getElementById("heroWatchlistBtn").addEventListener("click", (e) => {
      const inList = CV.toggleWatchlist(picks[activeIdx], "movie");
      e.currentTarget.querySelector("svg").nextSibling.textContent = inList ? " In Watchlist" : " Watchlist";
    });
  } catch (e) {
    hero.innerHTML = CV.emptyStateHTML("Couldn't load trending titles", "Check your connection or TMDB key and refresh.");
  }
}

async function buildShelfInto(container, title, countLabel, fetcher) {
  const id = "shelf-" + Math.random().toString(36).slice(2, 8);
  const wrap = document.createElement("div");
  wrap.className = "shelf";
  wrap.innerHTML = `
    <div class="shelf-head">
      <div class="shelf-title">${title}</div>
      <div class="shelf-count">${countLabel}</div>
    </div>
    <div class="shelf-track" id="${id}">${CV.skeletonHTML(8)}</div>`;
  container.appendChild(wrap);

  try {
    const results = await fetcher();
    document.getElementById(id).innerHTML = results.map(CV.cardHTML).join("");
  } catch (e) {
    document.getElementById(id).innerHTML = `<div class="section-note">Couldn't load this row.</div>`;
  }
}

async function buildShelves() {
  const container = document.getElementById("homeShelves");
  container.innerHTML = "";
  await Promise.all([
    buildShelfInto(container, "Popular Movies", "TMDB · popular", async () => (await CV.tmdb("/movie/popular")).results.slice(0, 14)),
    buildShelfInto(container, "Popular TV Shows", "TMDB · popular", async () => (await CV.tmdb("/tv/popular")).results.slice(0, 14)),
    buildShelfInto(container, "Anime", "animation · JP", async () =>
      (await CV.tmdb("/discover/tv", { with_genres: CV.animeGenreId, with_origin_country: "JP", sort_by: "popularity.desc" })).results.slice(0, 14)
    ),
    buildShelfInto(container, "Top Rated Movies", "TMDB · top rated", async () => (await CV.tmdb("/movie/top_rated")).results.slice(0, 14)),
    buildShelfInto(container, "Upcoming", "in theaters soon", async () => (await CV.tmdb("/movie/upcoming")).results.slice(0, 14)),
  ]);
}
