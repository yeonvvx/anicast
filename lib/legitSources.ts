// lib/legitSources.ts
//
// This file intentionally does NOT contain any third-party "embed provider"
// integration (no xpass/vidcore/peachify/vidzen/vsembed/videasy etc). Those
// services stream copyrighted film/TV without licensing and wiring them up
// would make this an operational piracy tool. Instead:
//
//  1. ONE_PLAYABLE_FILM is a movie that is actually in the public domain in
//     the US (copyright expired / never renewed), legally hosted on the
//     Internet Archive, and embeddable via a plain <video>/<iframe> tag.
//  2. Everything else in the catalog gets an official YouTube trailer via
//     TMDB's /videos endpoint (see lib/tmdb.ts -> findTrailerKey). Clicking
//     play on a title you don't have the rights to shows the trailer, not
//     the full film - same UX pattern, legal content.

export const ONE_PLAYABLE_FILM = {
  tmdbId: "10331", // Night of the Living Dead (1968) on TMDB
  title: "Night of the Living Dead",
  year: 1968,
  // Public domain: copyright notice was omitted from prints at release,
  // which under 1968 US copyright law forfeited protection. Confirmed
  // public domain status is why Internet Archive can host the full film.
  archiveOrgIdentifier: "night_of_the_living_dead",
  // Internet Archive provides a direct embeddable player at this URL pattern:
  embedUrl: "https://archive.org/embed/night_of_the_living_dead",
  source: "Internet Archive (archive.org) - public domain film",
};

export function youtubeTrailerEmbedUrl(youtubeKey: string) {
  return `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`;
}

/**
 * Decide what to actually put in the player for a given TMDB movie id.
 * Returns either the public-domain full film or a trailer-only embed.
 */
export function resolvePlayback(tmdbId: string, trailerKey: string | null) {
  if (tmdbId === ONE_PLAYABLE_FILM.tmdbId) {
    return {
      kind: "full-film" as const,
      embedUrl: ONE_PLAYABLE_FILM.embedUrl,
      label: "Full film - public domain (Internet Archive)",
    };
  }
  if (trailerKey) {
    return {
      kind: "trailer" as const,
      embedUrl: youtubeTrailerEmbedUrl(trailerKey),
      label: "Official trailer (YouTube)",
    };
  }
  return { kind: "unavailable" as const, embedUrl: null, label: "No legal source available" };
}
