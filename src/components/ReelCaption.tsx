// The hierarchy breadcrumb pinned bottom-left: the module title (stable across a
// module — scenes can swap mid-module, so we don't use the scene title) over the
// section title, with the N/M counter riding the section line (the thing it counts).
// The concept lives in the top brand bar, so it's deliberately not repeated here.
export function ReelCaption({
  moduleTitle,
  heading,
  moduleIndex,
  moduleCount,
}: {
  moduleTitle: string
  heading: string
  moduleIndex: number
  moduleCount: number
}) {
  return (
    <div className="scene-caption">
      <h1>{moduleTitle}</h1>
      <p className="scene-caption__section">
        {heading.replace(/`/g, '')}
        <span className="scene-caption__count">
          {' '}· {moduleIndex + 1}/{moduleCount}
        </span>
      </p>
    </div>
  )
}
