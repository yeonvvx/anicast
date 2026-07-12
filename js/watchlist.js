document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  await CV.checkApiKey();
  const grid = document.getElementById("watchlistGrid");
  const list = CV.readStore(CV.WATCHLIST_KEY);
  grid.innerHTML = list.length
    ? list.map(CV.cardHTML).join("")
    : CV.emptyStateHTML("Your watchlist is empty", "Open any title's trailer page and tap \u201cAdd to Watchlist\u201d — it'll show up here.");
});
