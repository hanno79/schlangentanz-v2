// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
O2 K3: Wer `/spiel` oder `/regeln` direkt aufruft oder dort neu lädt, bekommt
auf Vercel die App und nicht deren 404. Eine einzige Umschreibung leitet jede
Adresse auf `index.html`; Vercel liefert vorhandene Dateien (`/assets/…`,
`/favicon.svg`) vor jeder Umschreibung aus. Welche Adressen es gibt, entscheidet
damit allein die App: Sie zeigt für eine unbekannte „Diese Seite gibt es
nicht“, und eine neue Seite braucht keinen Eintrag hier.
*/

interface Umschreibung {
  source: string
  destination: string
}

const { rewrites } = JSON.parse(readFileSync(resolve(__dirname, '..', 'vercel.json'), 'utf8')) as {
  rewrites: Umschreibung[]
}

describe('O2 K3: vercel.json leitet jede Adresse auf index.html', () => {
  it('O2 K3: genau eine Umschreibung, die jede Adresse auf /index.html leitet', () => {
    expect(rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }])
  })

  it.each(['/spiel', '/regeln', '/dev', '/dev/szenarien', '/gibt-es-nicht'])(
    'O2 K3: %s fällt unter die Umschreibung',
    (adresse) => {
      // Vercel liest `/(.*)` als regulären Ausdruck über den ganzen Pfad.
      expect(new RegExp(`^${rewrites[0].source}$`).test(adresse)).toBe(true)
    },
  )
})
