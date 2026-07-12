import { tmdb, posterUrl, backdropUrl } from "../lib/tmdb";
import MediaCard from "../components/MediaCard";

export default async function HomePage() {
  const [trending, movies, tv] = await Promise.all([
    tmdb.trendingAll(),
    tmdb.popularMovies(),
    tmdb.popularTV(),
  ]);

  const hero = trending.results?.[0];

  return (
    <main>
      {hero && (
        <section
          className="hero"
          style={{ backgroundImage: `url(${backdropUrl(hero.backdrop_path)})` }}
        >
          <div className="hero-content">
            <span className="badge">Trending now</span>
            <h1>{hero.title ?? hero.name}</h1>
            <p>{hero.overview}</p>
            <a
              className="btn btn-primary"
              href={`/watch/${hero.media_type}-${hero.id}`}
            >
              ▶ Play
            </a>
          </div>
        </section>
      )}

      <Row title="Trending" items={trending.results} />
      <Row title="Popular Movies" items={movies.results} type="movie" />
      <Row title="Popular TV Shows" items={tv.results} type="tv" />

      <div className="notice">
        Playback: one public-domain film plays in full; every other title plays its
        official trailer. See <a href="/legal">Legal / DMCA</a>.
      </div>
    </main>
  );
}

function Row({ title, items, type }: { title: string; items: any[]; type?: string }) {
  if (!items?.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="grid">
        {items.slice(0, 12).map((item) => {
          const mediaType = type ?? item.media_type;
          if (mediaType !== "movie" && mediaType !== "tv") return null;
          return (
            <MediaCard
              key={`${mediaType}-${item.id}`}
              href={`/watch/${mediaType}-${item.id}`}
              imgSrc={posterUrl(item.poster_path)}
              title={item.title ?? item.name}
              meta={(item.release_date ?? item.first_air_date ?? "").slice(0, 4)}
            />
          );
        })}
      </div>
    </section>
  );
}
