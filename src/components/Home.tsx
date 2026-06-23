import { concepts } from '../content/catalog.ts'
import { navigate } from '../router.ts'
import './home.css'

// Home / concept catalog — the app's front door. A calm grid of concept cards
// (DESIGN.md: muted accent FILL + solid accent edge, no glow/blur/gradient).
// Driven entirely by the concept registry in catalog.ts; tapping a card routes to
// that concept (`#/<id>`), which App.tsx loads from its content repo.
//
// No reel/section counts here on purpose — those are content-derived and would
// drift from the catalog; they surface on the content view once the manifest is
// loaded.
export function Home() {
  return (
    <main className="home">
      <header className="home__hero">
        <img className="home__glyph" src="/brand.svg" alt="" width={52} height={52} />
        <h1 className="home__brand">GraphL</h1>
        <p className="home__tagline">Pick a concept to start learning</p>
      </header>

      <ul className="home__grid">
        {concepts.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="home__card"
              style={{ '--accent': c.accent } as React.CSSProperties}
              onClick={() => navigate(c.id)}
            >
              <span className="home__card-label">{c.label}</span>
              {c.blurb && <span className="home__card-blurb">{c.blurb}</span>}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
