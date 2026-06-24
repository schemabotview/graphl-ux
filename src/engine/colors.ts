// Retention-tuned palette — see apache-spark-content/DESIGN.md.
// Semantic ROLES: a concept always wears the same color so color becomes a
// memory cue. Color lives in a CALM FILLED block (not a neon outline) — the
// hues below are mixed into a dark base in scene.css to get muted fills.
// Keep ≤4–5 live on screen; push supporting nodes to GRAY.

export const BLUE = '#5b8cff' // Driver / control plane — the brain, the plan
export const GREEN = '#37d39a' // Executors / compute / data — the muscle
export const ORANGE = '#ff7a59' // Storage / shuffle / I/O — where data lands
export const PURPLE = '#b98bff' // API / abstraction layer — DataFrame, lazy plan
export const TEAL = '#3fd0d6' // Transformations / flow — movement between stages
export const RED = '#ff5d6c' // Wide op / danger / gotcha — shuffle, exam traps
export const GRAY = '#9aa3b2' // Inert / context — supporting, non-focal nodes

/** Reserved for the ONE node the narration is on right now (+ animated edge). */
export const SPOTLIGHT = '#ffc24b'

/** Surfaces: flat neutral dark, no blue tint, no glow. */
export const BG = '#252525'
export const CODE_BG = '#282c34'

/** Edges are calm and uniform — color semantics live in the nodes, not arrows. */
export const EDGE = '#5b6270'
