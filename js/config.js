// js/config.js — ADD THIS BELOW THE EXISTING CONFIG
const STREAMING_SOURCES = {
  xpass: {
    name: "XPass",
    movie: (tmdbId) => `https://play.xpass.top/e/movie/${tmdbId}`,
    tv: (tmdbId, season, episode) => `https://play.xpass.top/e/tv/${tmdbId}/${season}/${episode}`,
    supports: "tmdb",
    postMessage: true
  },
  vidcore: {
    name: "VidCore",
    movie: (id) => `https://vidcore.net/movie/${id}?autoPlay=true`,
    tv: (id, season, episode) => `https://vidcore.net/tv/${id}/${season}/${episode}?autoPlay=true`,
    supports: "tmdb", // Also supports IMDB
    features: ["4k", "subtitles", "chromecast"]
  },
  vidsrc: {
    name: "VidSrc",
    movie: (imdbId) => `https://v2.vidsrc.me/embed/${imdbId}`,
    tv: (imdbId, season, episode) => `https://v2.vidsrc.me/embed/${imdbId}/${season}-${episode}`,
    supports: "imdb",
    features: ["subtitles"]
  },
  videasy: {
    name: "Videasy",
    movie: (tmdbId) => `https://videasy.to/movie/${tmdbId}`,
    tv: (tmdbId, season, episode) => `https://videasy.to/tv/${tmdbId}/${season}/${episode}`,
    supports: "tmdb",
    features: ["4k", "anime"]
  }
};

// Priority order for auto-select
const SOURCE_PRIORITY = ["videasy", "vidcore", "xpass", "vidsrc"];
