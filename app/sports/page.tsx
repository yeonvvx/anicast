// TheSportsDB free tier ("test" key = 3) gives schedules/scores, no video.
// There is no legal free API for live game streams, so this page shows
// fixtures/results only, matching how legitimate sports-schedule apps work.

async function fetchEvents(league: string) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${league}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return { events: [] };
  return res.json();
}

export default async function SportsPage() {
  // 4328 = English Premier League (example league id)
  const data = await fetchEvents("4328");
  const upcoming = (data.events ?? []).slice(0, 12);

  return (
    <main>
      <div className="notice">
        Live Sports shows fixtures/results via TheSportsDB's free API. This app does
        not stream live game video - no legal free source exists for that, so we
        display schedule data only, the way a legitimate sports app would.
      </div>
      <section className="section">
        <h2>Upcoming & Recent Fixtures</h2>
        <div className="grid">
          {upcoming.map((e: any) => (
            <div className="card" key={e.idEvent}>
              <div className="card-body">
                <div className="card-title">{e.strEvent}</div>
                <div className="card-meta">{e.dateEvent}</div>
                {e.intHomeScore != null && (
                  <div className="card-meta">
                    {e.intHomeScore} - {e.intAwayScore}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
