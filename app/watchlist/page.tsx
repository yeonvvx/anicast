export default function WatchlistPage() {
  return (
    <main className="section">
      <h2>Watchlist</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: 560 }}>
        Backed by the <code>WatchlistItem</code> Prisma model (see{" "}
        <code>prisma/schema.prisma</code>). Once auth is wired up (NextAuth /
        Clerk), &quot;Add to Watchlist&quot; buttons on movie/TV cards write a row
        here keyed by the signed-in user, and this page lists them with a
        remove button. Left as a stub in this scaffold since it needs a real
        database connection and signed-in user to demo meaningfully.
      </p>
    </main>
  );
}
