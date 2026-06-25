// The glyph square for a `symbol` leaf — an HTML/CSS port of NodeMap's IconBox.
// Shows an image when `icon` is a URL, otherwise a short literal (emoji / letters)
// or initials derived from the label. The square is filled with the role color so
// it reads as the node's identity chip; the full label sits beside/below it (the
// `symbol` branch in SceneNode owns that layout). Wired in Slice 3.

/** "Driver Program" → "Dri": first letter capitalized, next two lowercased. */
export function deriveInitials(label: string, count = 3): string {
  const clean = label.replace(/[^a-zA-Z0-9]/g, '')
  if (!clean) return ''
  return clean.charAt(0).toUpperCase() + clean.slice(1, count).toLowerCase()
}

export function SceneGlyph({
  icon,
  label,
  color,
  size,
}: {
  /** Image URL, or a short literal (emoji / letters). Falls back to initials. */
  icon?: string
  label: string
  color: string
  /** Square edge length in canvas px. */
  size: number
}) {
  const isUrl = !!icon && icon.startsWith('http')
  return (
    <span
      className="scene-glyph"
      style={{ width: size, height: size, ['--glyph-color' as string]: color }}
    >
      {isUrl ? (
        <img src={icon} alt={label} className="scene-glyph__img" />
      ) : (
        <span className="scene-glyph__text" style={{ fontSize: size * 0.4 }}>
          {icon || deriveInitials(label)}
        </span>
      )}
    </span>
  )
}
