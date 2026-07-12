# CineVault

A movie / TV / anime discovery site in the spirit of a dark, sidebar-driven
streaming hub — but it only ever plays official trailers (embedded from
YouTube via TMDB's video data). It's a **fully static, multi-page site**:
every page is its own real `.html` file, plain CSS/JS, no build step, no
server, no `npm install`.

## Pages

Each of these is a standalone HTML file — you can open any one directly:

| File | What it does |
|---|---|
| `index.html` | Home — trailer hero + shelves (Popular Movies, Popular TV, Anime, Top Rated, Upcoming) |
| `search.html` | Search results, driven by `?q=` in the URL |
| `browse.html` | Genre-filtered browsing (Movies / TV toggle + genre chips) |
| `movies.html` | Popular movies grid |
| `tv.html` | Popular TV shows grid |
| `anime.html` | Anime grid (TMDB animation genre + Japanese origin) |
| `manga.html` | Placeholder page — no manga data source is wired up |
| `music.html` | Placeholder page — no music data source is wired up |
| `live.html` | Placeholder page — no live-sports data source is wired up |
| `watchlist.html` | Titles you've saved, stored in your browser |
| `history.html` | Titles you've opened a trailer for, stored in your browser |
| `legal.html` | Legal / DMCA notice |
| **`watch.html`** | **The dedicated trailer player page.** Every poster/card links here with `?type=movie|tv&id=123`; it fetches the title's details and plays the official trailer in an embedded YouTube player, full page, with a picker if more than one trailer exists. |

## Get it running — zero terminal required

**1. Get a free TMDB API key**
- Go to https://www.themoviedb.org/, create a free account.
- Go to **Settings → API**, request an API key (choose "Developer", fill in
  the short form — approval is instant).
- Copy the **API Key (v3 auth)** value.

**2. Add the key, right in GitHub**
- Upload this folder to a new GitHub repository (drag-and-drop the files on
  the "Add file → Upload files" screen works fine).
- Open `js/config.js` in GitHub's own file editor (pencil icon).
- Replace `YOUR_TMDB_API_KEY_HERE` with the key you copied.
- Click **Commit changes**.

**3. Turn on GitHub Pages**
- In the repo, go to **Settings → Pages**.
- Under "Build and deployment", choose **Deploy from a branch**.
- Branch: `main`, folder: `/ (root)` → **Save**.
- GitHub gives you a URL like `https://yourname.github.io/your-repo/` within
  a minute or two — that's the live site.

No CLI, no `git push`, no bundler. Every edit after this can be made the same
way, directly in the GitHub web editor.

## How it's wired together

- `js/config.js` — your TMDB key + a couple of constants. The only file you
  need to touch.
- `js/common.js` — shared helpers loaded on every page: the TMDB fetch
  wrapper, poster-card markup (real `<a>` links to `watch.html`), the topbar
  search widget, and the watchlist/history storage functions.
- `js/<page>.js` — one small script per page that fetches and renders just
  that page's content.
- Every page shares the same sidebar/topbar markup (plain duplicated HTML —
  there's no templating engine, since the goal is zero build step), with the
  current page's nav link marked `active`.

## What's real vs. placeholder

| Section | Backed by |
|---|---|
| Home, Movies, TV Shows, Anime, Browse, Search, Watch | Live TMDB data (posters, ratings, overviews, cast, and the official trailer if TMDB has one) |
| Trailer playback (`watch.html`) | Embedded YouTube player — no video is hosted by this site |
| Watchlist, History | Saved locally in your browser (`localStorage`) — no account or server |
| Manga, Music, Live Sports | Real pages, kept for structural parity, intentionally **not** wired to a data source — TMDB doesn't cover them |
| Legal / DMCA | Static text explaining the above |

## Notes

- The TMDB key is visible in the page's JS source. That's expected for a
  client-only app and is how TMDB's own docs describe using a v3 key from the
  browser — just don't reuse a key you care about protecting for anything
  sensitive.
- "Anime" is TMDB's animation genre filtered to Japanese origin — close, but
  not a dedicated anime database, so a few edge cases will slip through.
