// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { GERAETEKLASSEN } from '../scripts/pruefung/geraeteklassen.mjs'

/*
P0.3c: Layout-Verträge, die in einer der neuen Geräteklassen (Tablet hochkant,
Handy quer) rot sind, stehen mit Befund in `tests/layout/geraeteklassen_ausnahmen.json`.
Playwright erwartet dort ein Scheitern (`test.fail`); wird der Vertrag grün, meldet
es das als Fehler, und der Eintrag muss gehen. Diese Tests halten die Liste
ehrlich: nur neue Klassen, nur bestehende Verträge, und sie wächst nicht.
*/

const WURZEL = resolve(__dirname, '..')
const LISTE = 'tests/layout/geraeteklassen_ausnahmen.json'
const VERGLEICH = 'origin/neuaufbau'
/** Die drei Klassen vor P0.3c waren grün; für sie gibt es keine Ausnahme. */
const NEUE_KLASSEN = ['tablet-hochkant', 'handy-quer']

type Ausnahme = { datei: string; vertrag: string; klasse: string; befund: string }
type Liste = { erklaerung: string[]; ausnahmen: Ausnahme[] }

const schluessel = ({ datei, vertrag, klasse }: Ausnahme) => `${klasse} | ${datei} | ${vertrag}`

function liesListe(): Liste {
  return JSON.parse(readFileSync(join(WURZEL, LISTE), 'utf8')) as Liste
}

function git(...argumente: string[]) {
  const lauf = spawnSync('git', argumente, { cwd: WURZEL, encoding: 'utf8' })
  return { ok: lauf.status === 0, ausgabe: (lauf.stdout ?? '').trim(), fehler: (lauf.stderr ?? '').trim() }
}

describe('P0.3c: Ausnahmeliste der Layout-Verträge je Geräteklasse', () => {
  it('P0.3c: jeder Eintrag nennt Datei, Vertrag, eine neue Geräteklasse und den Befund, keiner doppelt', () => {
    const { erklaerung, ausnahmen } = liesListe()
    const bekannt = GERAETEKLASSEN.map(({ name }) => name)

    expect(erklaerung.length, 'die Liste erklärt sich nicht').toBeGreaterThan(0)
    for (const ausnahme of ausnahmen) {
      const wo = schluessel(ausnahme)
      expect(bekannt, `${wo}: unbekannte Geräteklasse`).toContain(ausnahme.klasse)
      expect(NEUE_KLASSEN, `${wo}: nur Tablet hochkant und Handy quer dürfen Ausnahmen haben`).toContain(ausnahme.klasse)
      expect(ausnahme.befund.trim(), `${wo}: Befund fehlt`).not.toBe('')
      expect(ausnahme.vertrag, `${wo}: Vertrag als „Gruppe › Test“`).toContain(' › ')
    }
    expect(new Set(ausnahmen.map(schluessel)).size).toBe(ausnahmen.length)
  })

  it('P0.3c: jeder Eintrag zeigt auf einen bestehenden Vertrag in einer Datei, die die Liste anwendet', () => {
    for (const ausnahme of liesListe().ausnahmen) {
      const pfad = join(WURZEL, ausnahme.datei)
      expect(existsSync(pfad), `${ausnahme.datei} fehlt`).toBe(true)
      const quelltext = readFileSync(pfad, 'utf8')
      expect(quelltext, `${ausnahme.datei} ruft duldeBekannteAusnahmen() nicht auf`).toContain('duldeBekannteAusnahmen()')
      const gruppe = ausnahme.vertrag.split(' › ')[0]
      expect(quelltext, `${ausnahme.datei}: keine Gruppe „${gruppe}“`).toContain(gruppe)
    }
  })

  it(`P0.3c: die Liste wächst nicht gegenüber der Merge-Basis mit ${VERGLEICH}`, () => {
    const basis = git('merge-base', 'HEAD', VERGLEICH)
    expect(basis.ok, `keine Merge-Basis von HEAD und ${VERGLEICH}: ${basis.fehler}`).toBe(true)
    const frueher = git('show', `${basis.ausgabe}:${LISTE}`)
    // Fehlt die Datei auf der Basis, legt dieser Stand sie an (P0.3c); dann gibt es nichts zu vergleichen.
    if (!frueher.ok) return
    const erlaubt = new Set((JSON.parse(frueher.ausgabe) as Liste).ausnahmen.map(schluessel))

    const neu = liesListe().ausnahmen.map(schluessel).filter((eintrag) => !erlaubt.has(eintrag))
    expect(neu, 'neue Ausnahmen; die Liste darf nur schrumpfen').toEqual([])
  })
})
