import { jikan } from "../../lib/jikan";
import MediaCard from "../../components/MediaCard";

export default async function AnimePage() {
  const [top, seasonal] = await Promise.all([jikan.topAnime(), jikan.seasonNow()]);

  return (
    <main>
      <div className="notice">
        Anime metadata via Jikan (MyAnimeList). Titles link to an official trailer
        where TMDB / YouTube has one; there is no full-episode playback in this app.
      </div>
      <section className="section">
        <h2>Top Anime</h2>
        <div className="grid">
          {top.data?.map((a: any) => (
            <MediaCard
              key={a.mal_id}
              href={a.trailer?.url ?? a.url}
              imgSrc={a.images?.jpg?.image_url}
              title={a.title}
              meta={`★ ${a.score ?? "—"}`}
            />
          ))}
        </div>
      </section>
      <section className="section">
        <h2>This Season</h2>
        <div className="grid">
          {seasonal.data?.map((a: any) => (
            <MediaCard
              key={a.mal_id}
              href={a.trailer?.url ?? a.url}
              imgSrc={a.images?.jpg?.image_url}
              title={a.title}
              meta={a.episodes ? `${a.episodes} eps` : a.status}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
