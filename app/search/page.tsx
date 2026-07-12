import { tmdb, posterUrl } from "../../lib/tmdb";
import MediaCard from "../../components/MediaCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const results = q ? await tmdb.search(q) : null;

  return (
    <main className="section">
      <h2>Search</h2>
      <form action="/search" method="get" style={{ marginBottom: 24 }}>
        <input
          className="search-input"
          style={{ width: 320 }}
          name="q"
          defaultValue={q}
          placeholder="Search movies & TV..."
        />
      </form>

      {!q && <p style={{ color: "var(--text-muted)" }}>Type a title to search.</p>}

      {results && (
        <div className="grid">
          {results.results
            .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
            .map((item: any) => (
              <MediaCard
                key={`${item.media_type}-${item.id}`}
                href={`/watch/${item.media_type}-${item.id}`}
                imgSrc={posterUrl(item.poster_path)}
                title={item.title ?? item.name}
                meta={item.media_type}
              />
            ))}
        </div>
      )}
    </main>
  );
}
