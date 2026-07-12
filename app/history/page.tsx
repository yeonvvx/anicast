export default function HistoryPage() {
  return (
    <main className="section">
      <h2>History</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: 560 }}>
        Backed by the <code>WatchHistoryItem</code> Prisma model. Every time
        someone opens <code>/watch/[id]</code>, the page should upsert a row
        here (userId, mediaId, progress, watchedAt). This page then lists
        those rows newest-first with a resume link and a &quot;clear history&quot;
        action. Left as a stub since it needs a real database + signed-in
        user to demo meaningfully.
      </p>
    </main>
  );
}
