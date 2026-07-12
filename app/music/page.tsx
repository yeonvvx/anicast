// Uses Apple's iTunes Search API - no auth/API key required, returns
// official 30-second preview clips legally. Swap for Spotify's Web API
// (with OAuth) if your school project wants that instead.

async function searchTracks(term: string) {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=12`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return { results: [] };
  return res.json();
}

export default async function MusicPage() {
  const data = await searchTracks("top hits 2025");

  return (
    <main>
      <div className="notice">
        Music metadata + official 30-second previews via the iTunes Search API.
        Full tracks are not hosted or streamed by this app.
      </div>
      <section className="section">
        <h2>Trending Tracks</h2>
        <div className="grid">
          {data.results?.map((t: any) => (
            <div className="card" key={t.trackId}>
              <img src={t.artworkUrl100?.replace("100x100", "400x400")} alt={t.trackName} />
              <div className="card-body">
                <div className="card-title">{t.trackName}</div>
                <div className="card-meta">{t.artistName}</div>
                {t.previewUrl && (
                  <audio controls style={{ width: "100%", marginTop: 8 }} src={t.previewUrl} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
