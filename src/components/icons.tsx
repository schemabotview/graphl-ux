// Small presentational SVG icons for the reel control cluster (App.tsx).
// Pure markup, no behavior — extracted so App.tsx reads as wiring, not paths.

// Play ▶ / pause ❚❚ — toggles glyph by the live play state.
export function PlayPauseIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {playing ? (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" />
      )}
    </svg>
  )
}

// Content-panel toggle — a framed box with a divided right column.
export function PanelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="14" y1="5" x2="14" y2="19" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

// Close ✕ — used by the content panel's dismiss button (matches the scene-iconbtn chrome).
export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Expand-to-corners — "fit the whole scene" (show-full / drop the spotlight).
export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
