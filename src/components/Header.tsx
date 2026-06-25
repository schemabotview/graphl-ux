import { useEffect, useRef, useState } from 'react'
import type { Concept } from '../content/catalog.ts'
import type { ModuleManifest } from '../content/module.ts'
import { navigate } from '../router.ts'

interface HeaderProps {
  concept: Concept
  /** Every wired module; the ☰ picker only renders when there's more than one. */
  modules: ModuleManifest[]
  /** Module of the current page — marks the active row in the picker. */
  activeModuleId: string
}

// Top brand bar: glyph + concept label (→ home/concept catalog) and the ☰ module
// picker. Floats over the scene; only the interactive controls take pointer events
// so the canvas/tap-zones underneath stay live. Owns the picker's open state +
// outside-click close, since they exist only for this bar.
export function Header({ concept, modules, activeModuleId }: HeaderProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the module picker when clicking outside the menu wrapper.
  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [pickerOpen])

  return (
    <div className="scene-brandbar">
      {/* Logo + concept label are one button: clicking either returns home. */}
      <button
        className="scene-brandbar__home"
        onClick={(e) => {
          e.currentTarget.blur()
          navigate('')
        }}
        aria-label="Home — all concepts"
      >
        <img src="/icon.svg" alt="" width={28} height={28} />
        <span className="scene-brandbar__concept">{concept.label}</span>
      </button>
      {modules.length > 1 && (
        <div className="scene-brandbar__menu" ref={menuRef}>
          <button
            className="scene-brandbar__menu-btn"
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="Switch module"
            aria-expanded={pickerOpen}
          >
            ☰
          </button>
          {pickerOpen && (
            <div className="scene-modulepicker" role="menu">
              {modules.map((m) => (
                <button
                  key={m.id}
                  className={`scene-modulepicker__item${m.id === activeModuleId ? ' scene-modulepicker__item--active' : ''}`}
                  role="menuitem"
                  onClick={() => {
                    navigate(concept.id, m.id)
                    setPickerOpen(false)
                  }}
                >
                  {m.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
