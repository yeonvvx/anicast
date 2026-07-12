import { tmdb, posterUrl } from "../../lib/tmdb";
import MediaCard from "../../components/MediaCard";

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    tmdb.popularMovies(),
    tmdb.topRatedMovies(),
  ]);

  return (
    <main>
      <section className="section">
        <h2>Popular Movies</h2>
        <div className="grid">
          {popular.results.map((m: any) => (
            <MediaCard
              key={m.id}
              href={`/watch/movie-${m.id}`}
              imgSrc={posterUrl(m.poster_path)}
              title={m.title}
              meta={(m.release_date ?? "").slice(0, 4)}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Top Rated</h2>
        <div className="grid">
          {topRated.results.map((m: any) => (
            <MediaCard
              key={m.id}
              href={`/watch/movie-${m.id}`}
              imgSrc={posterUrl(m.poster_path)}
              title={m.title}
              meta={`★ ${m.vote_average?.toFixed(1)}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
