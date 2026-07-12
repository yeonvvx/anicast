export default function LegalPage() {
  return (
    <main className="section" style={{ maxWidth: 720 }}>
      <h2>Legal &amp; DMCA</h2>

      <h3>What this app actually streams</h3>
      <p style={{ color: "var(--text-muted)" }}>
        This is a school project demonstrating a media-catalog application.
        Catalog metadata (titles, descriptions, cover art, ratings) is pulled
        from public APIs: TMDB, Jikan (MyAnimeList), MangaDex, the iTunes
        Search API, and TheSportsDB. Actual video/audio playback in this app
        is limited to:
      </p>
      <ul style={{ color: "var(--text-muted)" }}>
        <li>One film in the U.S. public domain, hosted by the Internet Archive.</li>
        <li>Official trailers hosted on YouTube via TMDB&apos;s video metadata.</li>
        <li>Official 30-second song previews via the iTunes Search API.</li>
      </ul>
      <p style={{ color: "var(--text-muted)" }}>
        No copyrighted film, TV episode, manga chapter, full song, or live
        sports broadcast is hosted, proxied, or streamed by this app.
      </p>

      <h3>DMCA takedown process (for reference / grading)</h3>
      <p style={{ color: "var(--text-muted)" }}>
        A production service that hosts user- or third-party-supplied media
        would need a designated DMCA agent registered with the U.S.
        Copyright Office, a takedown request form capturing the
        complainant&apos;s contact info, the copyrighted work, the
        infringing URL, and a good-faith statement, plus a documented
        counter-notice process under 17 U.S.C. §512. This app doesn&apos;t
        host third-party media, so there is nothing to take down, but the
        workflow above is what &quot;safe harbor&quot; compliance looks like
        for a real streaming platform.
      </p>

      <h3>Contact</h3>
      <p style={{ color: "var(--text-muted)" }}>
        Replace with your own contact details for the assignment submission.
      </p>
    </main>
  );
}
