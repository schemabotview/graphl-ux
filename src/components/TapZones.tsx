// Story-style tap zones (mobile only — desktop pages with arrow keys): left third =
// prev, right third = next, center = play/pause. The prev/next zones render only when
// a step exists in that direction, so there are no dead taps at the ends. Upper area
// only, so the bottom caption/controls stay tappable.
export function TapZones({
  canPrev,
  canNext,
  showHint,
  playing,
  playDisabled,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  canPrev: boolean
  canNext: boolean
  showHint: boolean
  playing: boolean
  playDisabled: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
}) {
  return (
    <>
      {canPrev && (
        <button
          className="scene-tapzone scene-tapzone--prev"
          onClick={onPrev}
          aria-label="Previous slide"
        >
          {showHint && <span className="scene-tapzone__hint">‹</span>}
        </button>
      )}
      {canNext && (
        <button
          className="scene-tapzone scene-tapzone--next"
          onClick={onNext}
          aria-label="Next slide"
        >
          {showHint && <span className="scene-tapzone__hint">›</span>}
        </button>
      )}
      {/* Center tap zone: play/pause, leaving prev/next on the left/right thirds. */}
      <button
        className="scene-tapzone scene-tapzone--play"
        onClick={onTogglePlay}
        disabled={playDisabled}
        aria-label={playing ? 'Pause' : 'Play'}
      />
    </>
  )
}
