# StreamClone (legit) — school project scaffold

A media-catalog app with the same page layout as the brief (Home, Search,
Browse, Movies, TV Shows, Anime, Manga, Music, Live Sports, Watchlist,
History, Legal/DMCA), built entirely on legal data sources.

## What's real vs. stubbed

| Page | Data source | Status |
|---|---|---|
| Home / Movies / TV / Search / Browse | TMDB | Fully working (needs free API key) |
| Anime | Jikan (MyAnimeList) | Fully working, no key needed |
| Manga | MangaDex | Fully working, no key needed |
| Music | iTunes Search API | Fully working, no key needed |
| Live Sports | TheSportsDB | Fixtures/scores only, no key needed |
| Watch page | Internet Archive (1 public-domain film) + YouTube trailers | Fully working |
| Watchlist / History | Prisma schema included | UI stub — needs a Postgres DB + auth to demo live |

## Why there's no "embed provider" integration

Sites like the one this was modeled on (and services such as vidcore,
peachify, vidzen, vsembed, videasy, xpass) work by embedding unlicensed
video sources. That's not included here on purpose — it's outside what I'll
help build regardless of framing (school project, "for now", etc.), since
the resulting app would be a functioning piracy tool. Swapping in TMDB +
public-domain + trailers gets you the same UI/UX and the same technical
skills (Next.js App Router, API integration, dynamic routing, a real video
player) without that problem — and it's worth mentioning to your teacher
that this is the swap made and why, in case the rubric needs adjusting.

## Setup

```bash
npm install
cp .env.example .env.local
# add your free TMDB key: https://www.themoviedb.org/settings/api
npm run dev
```

## Extending this for the cybersecurity angle

If the assignment is genuinely about anti-piracy / cybersecurity, a strong
addition here (not built in this scaffold, happy to build on request) is a
**detector**: a script that takes a domain, checks for signals typical of
piracy-aggregator sites (iframe chains to known embed hosts, absence of a
real DMCA page, MAL/TMDB-scraped metadata paired with third-party video
embeds) and flags it. That's a defensive tool, not an infringing one, and
fits a security curriculum much more directly than reproducing the thing
being defended against.
