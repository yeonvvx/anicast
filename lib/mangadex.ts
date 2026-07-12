// lib/mangadex.ts
// MangaDex's public API for manga metadata and cover art. MangaDex hosts
// scanlations of varying legality, so this app only uses it for
// browse/search metadata (title, description, cover, tags) - it does not
// link out to read chapters.

const MANGADEX_BASE = "https://api.mangadex.org";

async function mdFetch(endpoint: string) {
  const res = await fetch(`${MANGADEX_BASE}${endpoint}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`MangaDex error ${res.status} on ${endpoint}`);
  return res.json();
}

export const mangadex = {
  popular: () =>
    mdFetch(`/manga?order[followedCount]=desc&limit=20&includes[]=cover_art`),
  search: (title: string) =>
    mdFetch(`/manga?title=${encodeURIComponent(title)}&limit=20&includes[]=cover_art`),
};

export function coverUrl(mangaId: string, coverFileName: string, size: "256" | "512" = "512") {
  return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.${size}.jpg`;
}
