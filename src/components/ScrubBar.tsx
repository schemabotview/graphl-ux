import { useRef, useState } from 'react'

type Props = {
  progress: number
  onSeek: (fraction: number) => void
}

// The narration scrub bar: a thin line pinned to the bottom edge wrapped in a
// taller transparent hit zone so it's easy to grab on touch. Click anywhere to
// seek; press and drag to scrub (reels-style). The seek math lives in
// useNarration — this only turns the pointer's x into a 0..1 fraction and
// reports it via onSeek, and tracks the drag so the fill can snap (no ease).
export function ScrubBar({ progress, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const fractionFromX = (clientX: number) => {
    const el = barRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return (clientX - rect.left) / rect.width
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    onSeek(fractionFromX(e.clientX))
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    onSeek(fractionFromX(e.clientX))
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      ref={barRef}
      className={`scene-scrub${dragging ? ' scene-scrub--dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="scene-scrub__track">
        <div className="scene-scrub__fill" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}
