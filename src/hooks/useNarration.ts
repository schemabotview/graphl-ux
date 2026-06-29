import { useEffect, useRef, useState } from 'react'

// Owns the narration <audio>: the element ref, the play/progress state, and the two
// effects that keep the element in sync. Caller renders the <audio> with the returned
// ref + handlers and drives navigation; this hook never advances pages itself — it
// only reacts to `pageIdx` changing (reset the clip) and to play/pause toggles.
//
// `pageIdx` is a dependency, not state we own: when the shell pages, the current clip
// resets to the top but the PLAY STATE is preserved (read via a ref so a play/pause
// toggle alone doesn't reset the clip). So narration on → next clip auto-plays;
// paused → stays paused.
export function useNarration(pageIdx: number) {
  const audioRef = useRef<HTMLAudioElement>(null)
  // Mirror `playing` in a ref so the page-change effect can read the live play state
  // without depending on it (else it would reset the clip on every toggle).
  const playingRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Drive the <audio> element from the play state.
  useEffect(() => {
    playingRef.current = playing
    const a = audioRef.current
    if (!a) return
    if (playing) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [playing])

  // A new slide starts its clip from the top but preserves play state (see header).
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    setProgress(0)
    if (playingRef.current) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [pageIdx])

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const a = e.currentTarget
    setProgress(a.duration > 0 ? a.currentTime / a.duration : 0)
  }

  // Seek to an absolute fraction (0..1) of the clip — the scrub bar reports this
  // for both click and drag. Clamped, and updates progress immediately so the
  // fill tracks the pointer rather than waiting on the next timeupdate.
  const seekToFraction = (fraction: number) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    const f = Math.min(1, Math.max(0, fraction))
    a.currentTime = f * a.duration
    setProgress(f)
  }

  // Nudge the clip by `delta` seconds (keyboard < / >), clamped to the clip; no-ops
  // when no clip is loaded. Updates progress immediately so the fill tracks the seek.
  const nudge = (delta: number) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    a.currentTime = Math.min(a.duration, Math.max(0, a.currentTime + delta))
    setProgress(a.currentTime / a.duration)
  }

  return { audioRef, playing, setPlaying, progress, seekToFraction, nudge, onTimeUpdate }
}
