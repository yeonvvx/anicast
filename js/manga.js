/* =================================================================
   CineVault — manga.js
   Backed by Jikan v4 (https://jikan.moe), an unofficial free
   MyAnimeList API. No key or signup required. Cards link out to
   the title's MyAnimeList page, since Jikan is a read-only mirror
   of MAL's own catalog rather than a media host.
================================================================= */
const JIKAN_BASE = "https://api.jikan.moe/v4";

const MANGA_TYPES = [
  { label: "All", value: "" },
  { label: "Manga", value: "manga" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manhua", value: "manhua" },
  { label: "Novels", value: "novel" },
  { label: "One-shots", value: "oneshot" },
];

let mangaType = "";
let mangaQuery = "";
let mangaLoadToken = 0;

document.addEventListener("DOMContentLoaded", () => {
  CV.initTopSearch();
  CV.checkApiKey();
  renderTypeChips();

  const form = document.getElementById("mangaSearchForm");
  const input = document.getElementById("mangaSearchInput");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    mangaQuery = input.value.trim();
    loadManga();
  });

  loadManga();
});

function renderTypeChips() {
  const row = document.getElementById("mangaTypeChips");
  if (!row) return;
  row.innerHTML = MANGA_TYPES.map(
    (t, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-type="${t.value}">${t.label}</button>`
  ).join("");
  row.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      mangaType = chip.dataset.type;
      loadManga();
    });
  });
}

async function jikan(path, params = {}) {
  const url = new URL(JIKAN_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = new Error(`Jikan ${res.status} on ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function loadManga() {
  const grid = document.getElementById("mangaGrid");
  if (!grid) return;
  const myToken = ++mangaLoadToken;
  grid.innerHTML = CV.skeletonHTML(18);
  try {
    let data;
    if (mangaQuery) {
      data = await jikan("/manga", { q: mangaQuery, type: mangaType, limit: 24, order_by: "popularity", sort: "asc" });
    } else {
      data = await jikan("/top/manga", { type: mangaType, filter: "bypopularity", limit: 24 });
    }
    if (myToken !== mangaLoadToken) return;
    const results = data.data || [];
    grid.innerHTML = results.length
      ? results.map(mangaCardHTML).join("")
      : CV.emptyStateHTML("No results", "Try a different type or search term.");
  } catch (e) {
    if (myToken !== mangaLoadToken) return;
    const rateLimited = e.status === 429;
    grid.innerHTML = CV.emptyStateHTML(
      rateLimited ? "Jikan is rate-limiting requests" : "Couldn't load manga",
      rateLimited ? "The free MyAnimeList API is briefly throttling requests — wait a few seconds and refresh." : "Check your connection and refresh."
    );
  }
}

function mangaCardHTML(m) {
  const poster = m.images?.jpg?.large_image_url || m.images?.jpg?.image_url || CV.PLACEHOLDER_POSTER;
  const rating = m.score ? m.score.toFixed(1) : null;
  const year = m.published?.prop?.from?.year || "—";
  const typeLabel = m.type || "Manga";
  return `
    <a class="card" href="${m.url}" target="_blank" rel="noopener">
      <div class="card-poster">
        <img src="${poster}" alt="${escapeHTML(m.title)}" loading="lazy" />
        ${rating ? `<div class="card-rating">★ ${rating}</div>` : ""}
        <div class="card-play"><div class="card-play-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg>
        </div></div>
      </div>
      <div class="card-title">${escapeHTML(m.title)}</div>
      <div class="card-sub">${year} · ${typeLabel}</div>
    </a>`;
}

function escapeHTML(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
