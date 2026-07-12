document.addEventListener("DOMContentLoaded", async () => {
  CV.initTopSearch();
  await CV.checkApiKey();
  renderHistory();
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    CV.clearHistory();
    renderHistory();
  });
});

function renderHistory() {
  const grid = document.getElementById("historyGrid");
  const list = CV.readStore(CV.HISTORY_KEY);
  grid.innerHTML = list.length
    ? list.map(CV.cardHTML).join("")
    : CV.emptyStateHTML("No history yet", "Titles you open a trailer for will be logged here, locally in your browser.");
}
