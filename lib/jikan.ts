// lib/jikan.ts
// Jikan is a free, unofficial REST wrapper around MyAnimeList data.
// It returns metadata only (title, synopsis, cover art, score, episode count) -
// no video/streaming content. Used here purely for the Anime browse/search pages.

const JIKAN_BASE = "https://api.jikan.moe/v4";

async function jikanFetch(endpoint: string) {
  const res = await fetch(`${JIKAN_BASE}${endpoint}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Jikan error ${res.status} on ${endpoint}`);
  return res.json();
}

export const jikan = {
  topAnime: (page = 1) => jikanFetch(`/top/anime?page=${page}`),
  seasonNow: (page = 1) => jikanFetch(`/seasons/now?page=${page}`),
  search: (query: string, page = 1) =>
    jikanFetch(`/anime?q=${encodeURIComponent(query)}&page=${page}&sfw=true`),
  byId: (id: string) => jikanFetch(`/anime/${id}/full`),
};
