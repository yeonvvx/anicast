import { tmdb, backdropUrl, findTrailerKey } from "../../../lib/tmdb";
import { resolvePlayback } from "../../../lib/legitSources";

export default async function WatchPage({ params }: { params: { id: string } }) {
  // id comes in as "movie-603" or "tv-1399"
  const [mediaType, tmdbId] = params.id.split("-");
  const details =
    mediaType === "tv" ? await tmdb.tvDetails(tmdbId) : await tmdb.movieDetails(tmdbId);

  const trailerKey = findTrailerKey(details.videos);
  const playback = resolvePlayback(tmdbId, trailerKey);

  return (
    <main className="section">
      <h2>{details.title ?? details.name}</h2>
      <span className="badge">{playback.label}</span>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        {playback.embedUrl ? (
          <div className="player-wrap">
            <iframe
              src={playback.embedUrl}
              allow="autoplay; fullscreen"
              allowFullScreen
              title={details.title ?? details.name}
            />
          </div>
        ) : (
          <div className="notice">
            No legal video source is available for this title in this app -
            only its catalog page. See <a href="/legal">Legal / DMCA</a>.
          </div>
        )}
      </div>

      <p style={{ color: "var(--text-muted)", maxWidth: 640 }}>{details.overview}</p>

      <div style={{ display: "flex", gap: 16, marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>
        <span>★ {details.vote_average?.toFixed(1)}</span>
        <span>{(details.release_date ?? details.first_air_date ?? "").slice(0, 4)}</span>
        <span>{details.genres?.map((g: any) => g.name).join(", ")}</span>
      </div>
    </main>
  );
}
