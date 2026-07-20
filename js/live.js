/* =================================================================
   CineVault — live.js
   Backed by TheSportsDB v1 (thesportsdb.com), using the shared free
   test key. CORS-enabled, no signup for read access. League IDs are
   looked up dynamically by name (not hardcoded) so this keeps working
   even if TheSportsDB renumbers anything.
================================================================= */
const SPORTS_KEY = "123";
const SPORTS_BASE = `https://www.thesportsdb.com/api/v1/json/${SPORTS_KEY}`;

const FEATURED_LEAGUES = [
  "English Premier League",
  "Spanish La Liga",
  "Italian Serie A",
  "German Bundesliga",
  "American Major League Soccer",
  "UEFA Champions League",
  "NBA",
  "NFL",
  "NHL",
  "Major League Baseball",
];

document.addEventListener("DOMContentLoaded", () => {
  CV.initTopSearch();
  CV.checkApiKey();
  loadLeagues();
});

async function sportsDB(path, params = {}) {
  const url = new URL(SPORTS_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = new Error(`TheSportsDB ${res.status} on ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function loadLeagues() {
  const chipRow = document.getElementById("sportsLeagueChips");
  const grid = document.getElementById("sportsGrid");
  if (!chipRow || !grid) return;
  chipRow.innerHTML = `<div class="section-note" style="padding:0;">loading leagues…</div>`;
  try {
    const data = await sportsDB("/all_leagues.php");
    const all = data.leagues || [];
    const featured = FEATURED_LEAGUES.map((name) => all.find((l) => l.strLeague === name)).filter(Boolean);

    if (!featured.length) throw new Error("No known leagues matched");

    chipRow.innerHTML = featured
      .map((l, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-id="${l.idLeague}">${l.strLeague}</button>`)
      .join("");
    chipRow.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        loadFixtures(chip.dataset.id);
      });
    });

    loadFixtures(featured[0].idLeague);
  } catch (e) {
    chipRow.innerHTML = "";
    grid.innerHTML = CV.emptyStateHTML("Couldn't load leagues", "Check your connection and refresh.");
  }
}

let fixturesLoadToken = 0;

async function loadFixtures(leagueId) {
  const grid = document.getElementById("sportsGrid");
  if (!grid) return;
  const myToken = ++fixturesLoadToken;
  grid.innerHTML = `<div class="section-note league-note">loading fixtures…</div>`;
  try {
    let data = await sportsDB("/eventsnextleague.php", { id: leagueId });
    let events = data.events;
    let label = "Upcoming fixtures";

    if (!events || !events.length) {
      data = await sportsDB("/eventspastleague.php", { id: leagueId });
      events = data.events;
      label = "Recent results";
    }
    if (myToken !== fixturesLoadToken) return;

    if (!events || !events.length) {
      grid.innerHTML = CV.emptyStateHTML("No fixtures found", "This league has no scheduled or recent events right now.");
      return;
    }

    events.sort((a, b) => (a.dateEvent || "").localeCompare(b.dateEvent || ""));
    grid.innerHTML =
      `<div class="section-note league-note">${label}</div>` +
      `<div class="fixture-list">${events.slice(0, 20).map(fixtureCardHTML).join("")}</div>`;
  } catch (e) {
    if (myToken !== fixturesLoadToken) return;
    grid.innerHTML = CV.emptyStateHTML("Couldn't load fixtures", "Check your connection and refresh.");
  }
}

function fixtureCardHTML(e) {
  const hasScore = e.intHomeScore !== null && e.intHomeScore !== undefined && e.intHomeScore !== "";
  const dateStr = formatEventDate(e.dateEvent, e.strTime);
  const venue = e.strVenue ? ` · ${escapeHTML(e.strVenue)}` : "";
  return `
    <div class="fixture-card">
      <div class="fixture-teams">
        <span class="fixture-team">${escapeHTML(e.strHomeTeam)}</span>
        <span class="fixture-vs">${hasScore ? `${e.intHomeScore} – ${e.intAwayScore}` : "vs"}</span>
        <span class="fixture-team">${escapeHTML(e.strAwayTeam)}</span>
      </div>
      <div class="fixture-meta">${dateStr}${venue}</div>
    </div>`;
}

function formatEventDate(dateEvent, strTime) {
  if (!dateEvent) return "Date TBD";
  const iso = strTime ? `${dateEvent}T${strTime}` : dateEvent;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return dateEvent;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(strTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function escapeHTML(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
