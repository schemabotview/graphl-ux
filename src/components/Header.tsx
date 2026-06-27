import { useEffect, useMemo, useRef, useState } from 'react'
import type { Concept } from '../content/catalog.ts'
import { buildConceptMenu, concepts } from '../content/catalog.ts'
import type { ModuleManifest } from '../content/module.ts'
import { navigate } from '../router.ts'

interface HeaderProps {
  concept: Concept
  /** Every wired module; the ☰ picker only renders when there's more than one. */
  modules: ModuleManifest[]
  /** Module of the current page — marks the active row in the picker. */
  activeModuleId: string
}

// Top brand bar. Three affordances: the glyph returns home (concept catalog), the
// concept label opens a concept switcher (jump straight to another concept without
// a trip through home), and the ☰ opens the module picker. Floats over the scene;
// only the interactive controls take pointer events so the canvas/tap-zones
// underneath stay live. Owns both pickers' open state + outside-click close.
export function Header({ concept, modules, activeModuleId }: HeaderProps) {
  const [conceptOpen, setConceptOpen] = useState(false)
  // Which category submenu is expanded (hover on desktop, tap on touch). Reset
  // whenever the concept dropdown closes.
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [moduleOpen, setModuleOpen] = useState(false)
  const conceptRef = useRef<HTMLDivElement>(null)
  const moduleRef = useRef<HTMLDivElement>(null)

  const conceptMenu = useMemo(() => buildConceptMenu(concepts), [])

  // Close either picker when clicking outside its wrapper.
  useEffect(() => {
    if (!conceptOpen && !moduleOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (conceptRef.current && !conceptRef.current.contains(t)) {
        setConceptOpen(false)
        setOpenCategory(null)
      }
      if (moduleRef.current && !moduleRef.current.contains(t)) setModuleOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [conceptOpen, moduleOpen])

  return (
    <div className="scene-brandbar">
      {/* Logo returns home (the concept catalog). */}
      <button
        className="scene-brandbar__logo"
        onClick={(e) => {
          e.currentTarget.blur()
          navigate('')
        }}
        aria-label="Home — all concepts"
      >
        <img src="/icon.svg" alt="" width={28} height={28} />
      </button>

      {/* Concept label opens a switcher to jump straight to another concept. */}
      <div className="scene-brandbar__concept-wrap" ref={conceptRef}>
        <button
          className="scene-brandbar__concept-btn"
          onClick={() => {
            setConceptOpen((o) => {
              if (o) setOpenCategory(null)
              return !o
            })
            setModuleOpen(false)
          }}
          aria-label="Switch concept"
          aria-expanded={conceptOpen}
        >
          <span className="scene-brandbar__concept">{concept.label}</span>
          <span className="scene-brandbar__caret" aria-hidden>▾</span>
        </button>
        {conceptOpen && (
          <div className="scene-modulepicker" role="menu">
            {conceptMenu.map((cat) => {
              const catActive = cat.concepts.some((c) => c.id === concept.id)
              const catOpen = openCategory === cat.label
              return (
                <div
                  key={cat.label}
                  className="scene-modulepicker__group"
                  onMouseEnter={() => setOpenCategory(cat.label)}
                  onMouseLeave={() => setOpenCategory(null)}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={catOpen}
                    // Tap toggles the submenu on touch (where hover never fires).
                    onClick={() => setOpenCategory((o) => (o === cat.label ? null : cat.label))}
                    className={`scene-modulepicker__item scene-modulepicker__item--parent${catActive ? ' scene-modulepicker__item--active' : ''}`}
                  >
                    <span>{cat.label}</span>
                    <span className="scene-modulepicker__submenu-caret" aria-hidden>›</span>
                  </button>
                  {catOpen && (
                    <div className="scene-modulepicker scene-modulepicker__submenu" role="menu">
                      {cat.concepts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="menuitem"
                          className={`scene-modulepicker__item${c.id === concept.id ? ' scene-modulepicker__item--active' : ''}`}
                          onClick={() => {
                            if (c.id !== concept.id) navigate(c.id)
                            setConceptOpen(false)
                            setOpenCategory(null)
                          }}
                        >
                          {c.variantLabel ?? c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modules.length > 1 && (
        <div className="scene-brandbar__menu" ref={moduleRef}>
          <button
            className="scene-brandbar__menu-btn"
            onClick={() => {
              setModuleOpen((o) => !o)
              setConceptOpen(false)
            }}
            aria-label="Switch module"
            aria-expanded={moduleOpen}
          >
            ☰
          </button>
          {moduleOpen && (
            <div className="scene-modulepicker" role="menu">
              {modules.map((m) => (
                <button
                  key={m.id}
                  className={`scene-modulepicker__item${m.id === activeModuleId ? ' scene-modulepicker__item--active' : ''}`}
                  role="menuitem"
                  onClick={() => {
                    navigate(concept.id, m.id)
                    setModuleOpen(false)
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
