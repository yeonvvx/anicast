export default function Navbar() {
  return (
    <header className="navbar">
      <a href="/" className="logo">StreamClone</a>
      <nav>
        <a href="/">Home</a>
        <a href="/search">Search</a>
        <a href="/browse">Browse</a>
        <a href="/movies">Movies</a>
        <a href="/tv">TV Shows</a>
        <a href="/anime">Anime</a>
        <a href="/manga">Manga</a>
        <a href="/music">Music</a>
        <a href="/sports">Live Sports</a>
        <a href="/watchlist">Watchlist</a>
        <a href="/history">History</a>
        <a href="/legal">Legal/DMCA</a>
      </nav>
      <form action="/search" method="get">
        <input className="search-input" name="q" placeholder="Search titles..." />
      </form>
    </header>
  );
}
