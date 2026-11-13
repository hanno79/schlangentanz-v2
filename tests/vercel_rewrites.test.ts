// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
O2 K3: Wer `/spiel` oder `/regeln` direkt aufruft oder dort neu lädt, bekommt
auf Vercel die App und nicht deren 404. Jede Seite der App braucht deshalb eine
Umschreibung auf `index.html`; `/dev` braucht sie für die Vercel-Vorschau.
*/

interface Umschreibung {
  source: string
  destination: string
}

const { rewrites } = JSON.parse(readFileSync(resolve(__dirname, '..', 'vercel.json'), 'utf8')) as {
  rewrites: Umschreibung[]
}

describe('O2 K3: vercel.json leitet jede Seite der App auf index.html', () => {
  it.each(['/spiel', '/regeln', '/dev', '/dev/:path*'])('O2 K3: %s wird auf /index.html umgeschrieben', (quelle) => {
    expect(rewrites.filter((eintrag) => eintrag.source === quelle).map((eintrag) => eintrag.destination)).toEqual([
      '/index.html',
    ])
  })

  it('O2 K3: keine Umschreibung zeigt auf eine Seite, die es nicht mehr gibt', () => {
    expect(rewrites.map((eintrag) => eintrag.source).filter((quelle) => quelle.startsWith('/game'))).toEqual([])
  })
})
