/**
 * CineVault — configuration
 * -------------------------------------------------------------
 * 1. Get a free TMDB API key (called an "API Key (v3 auth)"):
 *    https://www.themoviedb.org/settings/api
 *    (Free account, instant approval, no card required.)
 * 2. Paste it below between the quotes.
 * 3. Commit the change directly in GitHub's web editor —
 *    no terminal, no build step needed.
 * 4. Turn on GitHub Pages for this repo (Settings → Pages →
 *    Deploy from branch → main → / (root)) and the site is live.
 * -------------------------------------------------------------
 */
const TMDB_API_KEY = "f1df4f14cd29615aba9945cd4630b823";

const CONFIG = {
  apiKey: TMDB_API_KEY,
  apiBase: "https://api.themoviedb.org/3",
  imgBase: "https://image.tmdb.org/t/p",
  // Anime = animation genre (16) restricted to Japanese origin.
  animeGenreId: 16,
};
