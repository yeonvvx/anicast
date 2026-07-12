import "../styles/globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "StreamClone (legit) - school project",
  description: "A legally-sourced streaming catalog UI built for a school project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer>
          <p>
            School project. Catalog metadata via TMDB, Jikan, and MangaDex. All video
            playback is either a public-domain film or an official trailer -
            see <a href="/legal" style={{ color: "var(--accent-2)" }}>Legal / DMCA</a> for details.
          </p>
        </footer>
      </body>
    </html>
  );
}
