import { tmdb, posterUrl } from "../../lib/tmdb";
import MediaCard from "../../components/MediaCard";

export default async function TVPage() {
  const [popular, topRated] = await Promise.all([tmdb.popularTV(), tmdb.topRatedTV()]);

  return (
    <main>
      <section className="section">
        <h2>Popular TV Shows</h2>
        <div className="grid">
          {popular.results.map((t: any) => (
            <MediaCard
              key={t.id}
              href={`/watch/tv-${t.id}`}
              imgSrc={posterUrl(t.poster_path)}
              title={t.name}
              meta={(t.first_air_date ?? "").slice(0, 4)}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Top Rated</h2>
        <div className="grid">
          {topRated.results.map((t: any) => (
            <MediaCard
              key={t.id}
              href={`/watch/tv-${t.id}`}
              imgSrc={posterUrl(t.poster_path)}
              title={t.name}
              meta={`★ ${t.vote_average?.toFixed(1)}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
