// Notebook loader. The `.ipynb` is the single source of truth for a module's
// prose + code. `parseNotebook` splits it at each level-2 (`## `) heading into
// sections; markdown cells render verbatim, code cells become fenced ```python
// blocks. Embedded diagram images are stripped — our React Flow scenes ARE those
// diagrams, so showing them in the panel would duplicate the canvas.
// Ported from graphl-ui's content/notebook.ts.

interface NotebookCell {
  cell_type: string
  source: string | string[]
}

export interface NotebookJson {
  cells: NotebookCell[]
}

export interface Section {
  heading: string
  body: string
}

const cellText = (c: NotebookCell): string =>
  Array.isArray(c.source) ? c.source.join('') : (c.source ?? '')

// Drop `![alt](url)` image references and collapse the blank lines they leave.
const stripImages = (md: string): string =>
  md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Split a notebook into sections at each level-2 (`## `) heading. */
export function parseNotebook(nb: NotebookJson): Section[] {
  const sections: Section[] = []
  let cur: { heading: string; parts: string[] } | null = null

  const flush = () => {
    if (cur) sections.push({ heading: cur.heading, body: stripImages(cur.parts.join('\n\n').trim()) })
  }

  for (const cell of nb.cells) {
    const text = cellText(cell)
    if (cell.cell_type === 'markdown') {
      let buf: string[] = []
      const pushBuf = () => {
        if (cur && buf.join('\n').trim()) cur.parts.push(buf.join('\n').trim())
        buf = []
      }
      for (const line of text.split('\n')) {
        const h2 = /^##\s+(.+?)\s*$/.exec(line)
        if (h2) {
          pushBuf()
          flush()
          cur = { heading: h2[1].trim(), parts: [] }
          continue
        }
        if (/^#\s+/.test(line)) continue // drop module/part H1 (title lives on the page)
        buf.push(line)
      }
      pushBuf()
    } else if (cell.cell_type === 'code') {
      const code = text.replace(/\s+$/, '')
      if (cur && code) cur.parts.push('```python\n' + code + '\n```')
    }
  }

  flush()
  return sections
}
