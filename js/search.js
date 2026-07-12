document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  const ready = await CV.checkApiKey();
  const grid = document.getElementById("searchGrid");

  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";

  if (document.getElementById("topSearchInput")) {
    document.getElementById("topSearchInput").value = q;
  }

  if (!ready) {
    grid.innerHTML = CV.configNoticeHTML();
    return;
  }

  if (!q) {
    grid.innerHTML = CV.emptyStateHTML("Search for something", "Use the search bar above to find movies, TV shows, or anime.");
    return;
  }

  document.getElementById("searchTitle").textContent = `Results for "${q}"`;
  grid.innerHTML = CV.skeletonHTML(12);

  try {
    const data = await CV.tmdb("/search/multi", { query: q });
    const results = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");
    grid.innerHTML = results.length ? results.map(CV.cardHTML).join("") : CV.emptyStateHTML("No results", `Nothing matched "${q}".`);
  } catch (e) {
    grid.innerHTML = CV.emptyStateHTML("Search failed", "Check your connection or TMDB key and refresh.");
  }
});
