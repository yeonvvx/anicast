let browseType = "movie";
let browseGenre = null;

document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  const ready = await CV.checkApiKey();
  if (!ready) {
    document.getElementById("browseGrid").innerHTML = CV.configNoticeHTML();
    return;
  }

  document.querySelectorAll("#browseTypeChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      browseType = chip.dataset.type;
      document.querySelectorAll("#browseTypeChips .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      loadGenres();
    });
  });

  loadGenres();
});

async function loadGenres() {
  const chipRow = document.getElementById("browseGenreChips");
  chipRow.innerHTML = `<div class="section-note" style="padding:0;">loading genres…</div>`;
  try {
    const data = await CV.tmdb(`/genre/${browseType}/list`);
    browseGenre = data.genres[0].id;
    chipRow.innerHTML = data.genres
      .map((g, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-genre="${g.id}">${g.name}</button>`)
      .join("");
    chipRow.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        browseGenre = +chip.dataset.genre;
        chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        loadGrid();
      });
    });
    loadGrid();
  } catch (e) {
    chipRow.innerHTML = "";
    document.getElementById("browseGrid").innerHTML = CV.emptyStateHTML("Couldn't load genres", "Check your connection or TMDB key and refresh.");
  }
}

async function loadGrid() {
  const grid = document.getElementById("browseGrid");
  grid.innerHTML = CV.skeletonHTML(18);
  try {
    const data = await CV.tmdb(`/discover/${browseType}`, { with_genres: browseGenre, sort_by: "popularity.desc" });
    grid.innerHTML = data.results.length ? data.results.map(CV.cardHTML).join("") : CV.emptyStateHTML("Nothing here", "Try a different genre.");
  } catch (e) {
    grid.innerHTML = CV.emptyStateHTML("Couldn't load results", "Check your connection or TMDB key and refresh.");
  }
}
