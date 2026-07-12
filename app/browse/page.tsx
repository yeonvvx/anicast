import { tmdb, posterUrl } from "../../lib/tmdb";
import MediaCard from "../../components/MediaCard";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { genre?: string; type?: string };
}) {
  const type = (searchParams.type as "movie" | "tv") ?? "movie";
  const genres = await (type === "movie" ? tmdb.movieGenres() : tmdb.tvGenres());
  const genreId = searchParams.genre ? Number(searchParams.genre) : genres.genres?.[0]?.id;
  const results = genreId ? await tmdb.discoverByGenre(genreId, type) : null;

  return (
    <main className="section">
      <h2>Browse</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <a className={`badge`} href={`/browse?type=movie&genre=${genreId ?? ""}`}>Movies</a>
        <a className={`badge`} href={`/browse?type=tv&genre=${genreId ?? ""}`}>TV Shows</a>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {genres.genres?.map((g: any) => (
          <a
            key={g.id}
            href={`/browse?type=${type}&genre=${g.id}`}
            className="badge"
            style={{
              background: g.id === genreId ? "var(--accent)" : undefined,
              color: g.id === genreId ? "#fff" : undefined,
            }}
          >
            {g.name}
          </a>
        ))}
      </div>

      {results && (
        <div className="grid">
          {results.results.map((item: any) => (
            <MediaCard
              key={item.id}
              href={`/watch/${type}-${item.id}`}
              imgSrc={posterUrl(item.poster_path)}
              title={item.title ?? item.name}
              meta={(item.release_date ?? item.first_air_date ?? "").slice(0, 4)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
