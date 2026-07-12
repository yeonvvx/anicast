import { mangadex, coverUrl } from "../../lib/mangadex";
import MediaCard from "../../components/MediaCard";

export default async function MangaPage() {
  const popular = await mangadex.popular();

  return (
    <main>
      <div className="notice">
        Manga metadata via MangaDex. This page shows covers, titles, and
        descriptions only - it does not link to chapter reading.
      </div>
      <section className="section">
        <h2>Popular Manga</h2>
        <div className="grid">
          {popular.data?.map((m: any) => {
            const cover = m.relationships.find((r: any) => r.type === "cover_art");
            const title =
              m.attributes.title.en ?? Object.values(m.attributes.title)[0] ?? "Untitled";
            return (
              <MediaCard
                key={m.id}
                href={`https://mangadex.org/title/${m.id}`}
                imgSrc={cover ? coverUrl(m.id, cover.attributes.fileName) : "/placeholder-poster.svg"}
                title={String(title)}
                meta={m.attributes.status}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
