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

  // Click the progress bar to seek: map the click x to a fraction of the duration.
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  return { audioRef, playing, setPlaying, progress, seek, onTimeUpdate }
}
