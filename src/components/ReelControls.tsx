import { ExpandIcon, PanelIcon, PlayPauseIcon } from './icons.tsx'

// Bottom-right control cluster: the contextual show-full sits alone on a top row; the
// two persistent buttons (play · panel) ride a bottom row pinned to the edge, so
// show-full appearing/disappearing only adds/removes the top row and never moves
// play/panel. Each button blurs itself after click — these are momentary actions and
// Space/keys drive play globally, so retained focus would mislead.
export function ReelControls({
  canShowFull,
  showFull,
  playing,
  playDisabled,
  panelOpen,
  onToggleShowFull,
  onTogglePlay,
  onTogglePanel,
}: {
  canShowFull: boolean
  showFull: boolean
  playing: boolean
  playDisabled: boolean
  panelOpen: boolean
  onToggleShowFull: () => void
  onTogglePlay: () => void
  onTogglePanel: () => void
}) {
  return (
    <div className="scene-controls">
      {canShowFull && (
        <button
          className="scene-iconbtn"
          onClick={(e) => {
            e.currentTarget.blur()
            onToggleShowFull()
          }}
          aria-pressed={showFull}
          aria-label={showFull ? 'Return to focus' : 'Show full scene'}
        >
          <ExpandIcon />
        </button>
      )}
      <div className="scene-controls__row">
        <button
          className="scene-playstate"
          onClick={(e) => {
            e.currentTarget.blur()
            onTogglePlay()
          }}
          disabled={playDisabled}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <PlayPauseIcon playing={playing} />
        </button>
        <button
          className="scene-iconbtn"
          onClick={(e) => {
            e.currentTarget.blur()
            onTogglePanel()
          }}
          aria-pressed={panelOpen}
          aria-label="Toggle content panel"
        >
          <PanelIcon />
        </button>
      </div>
    </div>
  )
}
