// lib/tmdb.ts
// Thin client for TMDB (The Movie Database) - free metadata API.
// Get a key at https://www.themoviedb.org/settings/api and put it in .env.local as TMDB_ACCESS_TOKEN

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w500") {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_URL}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280") {
  if (!path) return "/placeholder-backdrop.svg";
  return `${TMDB_IMAGE_URL}/${size}${path}`;
}

async function tmdbFetch(endpoint: string) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Missing TMDB_ACCESS_TOKEN. Add a free key from https://www.themoviedb.org/settings/api to .env.local"
    );
  }
  const res = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 }, // cache 1hr, be a good API citizen
  });
  if (!res.ok) throw new Error(`TMDB error ${res.status} on ${endpoint}`);
  return res.json();
}

export const tmdb = {
  trendingAll: (window: "day" | "week" = "week") => tmdbFetch(`/trending/all/${window}`),
  trendingMovies: (window: "day" | "week" = "week") => tmdbFetch(`/trending/movie/${window}`),
  trendingTV: (window: "day" | "week" = "week") => tmdbFetch(`/trending/tv/${window}`),
  popularMovies: (page = 1) => tmdbFetch(`/movie/popular?page=${page}`),
  topRatedMovies: (page = 1) => tmdbFetch(`/movie/top_rated?page=${page}`),
  popularTV: (page = 1) => tmdbFetch(`/tv/popular?page=${page}`),
  topRatedTV: (page = 1) => tmdbFetch(`/tv/top_rated?page=${page}`),
  movieDetails: (id: string) =>
    tmdbFetch(`/movie/${id}?append_to_response=videos,credits,similar`),
  tvDetails: (id: string) =>
    tmdbFetch(`/tv/${id}?append_to_response=videos,credits,similar`),
  discoverByGenre: (genreId: number, mediaType: "movie" | "tv" = "movie", page = 1) =>
    tmdbFetch(`/discover/${mediaType}?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`),
  search: (query: string, page = 1) =>
    tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`),
  movieGenres: () => tmdbFetch(`/genre/movie/list`),
  tvGenres: () => tmdbFetch(`/genre/tv/list`),
};

/** Pull the first official YouTube trailer key out of a TMDB videos.results array */
export function findTrailerKey(videos?: { results: any[] }) {
  if (!videos?.results?.length) return null;
  const trailer =
    videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ??
    videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
  return trailer?.key ?? null;
}
