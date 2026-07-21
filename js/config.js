// js/config.js — ADD THIS BELOW THE EXISTING CONFIG
const TMDB_API_KEY = "f1df4f14cd29615aba9945cd4630b823";

// ==========================================
// TMDB Configuration
// ==========================================

const CONFIG = {
  apiKey: TMDB_API_KEY,
  apiBase: "https://api.themoviedb.org/3",

  imgBase: "https://image.tmdb.org/t/p",
  posterSize: "w500",
  backdropSize: "original",
  profileSize: "w300",

  animeGenreId: 16,
};

const DEFAULT_SOURCE = "videasy";

const SOURCE_PRIORITY = [
  "xpass",
  "vidcore",
  "vidsrc",
  "videasy"
];

// ==========================================
// Streaming Providers
// ==========================================

const STREAMING_SOURCES = {

  videasy: {
    name: "Videasy",
    enabled: true,
    supports: "tmdb",

    quality: "4K",
    subtitles: true,
    anime: true,

    movie: (id) =>
      `https://videasy.to/movie/${id}`,

    tv: (id, season, episode) =>
      `https://videasy.to/tv/${id}/${season}/${episode}`
  },

  xpass: {
    name: "XPass",
    enabled: true,
    supports: "tmdb",

    subtitles: true,
    postMessage: true,

    movie: (id) =>
      `https://play.xpass.top/e/movie/${id}`,

    tv: (id, season, episode) =>
      `https://play.xpass.top/e/tv/${id}/${season}/${episode}`
  },

  vidcore: {
    name: "VidCore",
    enabled: true,
    supports: "tmdb",

    quality: "4K",
    subtitles: true,
    chromecast: true,

    movie: (id) =>
      `https://vidcore.net/movie/${id}?autoPlay=true`,

    tv: (id, season, episode) =>
      `https://vidcore.net/tv/${id}/${season}/${episode}?autoPlay=true`
  },

  vidsrc: {
    name: "VidSrc",
    enabled: true,
    supports: "imdb",

    subtitles: true,

    movie: (imdbId) =>
      `https://v2.vidsrc.me/embed/${imdbId}`,

    tv: (imdbId, season, episode) =>
      `https://v2.vidsrc.me/embed/${imdbId}/${season}-${episode}`
  }

};

// ==========================================
// Helper Functions
// ==========================================

function getPoster(path) {
  return path
    ? `${CONFIG.imgBase}/${CONFIG.posterSize}${path}`
    : "";
}

function getBackdrop(path) {
  return path
    ? `${CONFIG.imgBase}/${CONFIG.backdropSize}${path}`
    : "";
}

function getProfile(path) {
  return path
    ? `${CONFIG.imgBase}/${CONFIG.profileSize}${path}`
    : "";
}

function getStreamingUrl(source, type, id, season = null, episode = null) {
  const provider = STREAMING_SOURCES[source];

  if (!provider || !provider.enabled) return null;

  if (type === "movie") {
    return provider.movie(id);
  }

  return provider.tv(id, season, episode);
}

function getAvailableSources() {
  return Object.entries(STREAMING_SOURCES)
    .filter(([_, source]) => source.enabled)
    .sort(
      ([a], [b]) =>
        SOURCE_PRIORITY.indexOf(a) -
        SOURCE_PRIORITY.indexOf(b)
    )
    .map(([key, value]) => ({
      id: key,
      ...value
    }));
}
