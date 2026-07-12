document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  const ready = await CV.checkApiKey();
  const grid = document.getElementById("moviesGrid");
  if (!ready) {
    grid.innerHTML = CV.configNoticeHTML();
    return;
  }
  grid.innerHTML = CV.skeletonHTML(18);
  try {
    const pages = await Promise.all([1, 2, 3].map((p) => CV.tmdb("/movie/popular", { page: p })));
    const results = pages.flatMap((p) => p.results);
    grid.innerHTML = results.map(CV.cardHTML).join("");
  } catch (e) {
    grid.innerHTML = CV.emptyStateHTML("Couldn't load movies", "Check your connection or TMDB key and refresh.");
  }
});
