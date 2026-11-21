// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { erstellePartie, erzeugeZufall } from '../src/engine'
import type { Ki } from '../src/ki/strategien/strategie'
import { spielePartie } from '../src/ki/turnier'
import type { Teilnehmer } from '../src/ki/turnier'
import { istTestdatei, sammleDateien } from './architektur_pruefung'
import { WURZEL } from './probebaum'

/*
Isolationstest der Strategien (P0.3d, Entscheidung des Autors vom 21.11.2026,
Option A). Instanzen derselben Strategie dürfen kein Wissen teilen, auch nicht
über einen Weg, den die statischen Regeln des Architekturtests nicht kennen.
Deshalb vergleicht der Test das Verhalten: Mehrere Partien mit 2 bis 4 Sitzen,
alle mit derselben Strategie, laufen zweimal, (a) mit allen Instanzen aus einer
Modulinstanz und (b) mit jeder Instanz aus einem frisch geladenen Modul. Gleich
sein müssen jede Entscheidung und der sichtbare Zustand jeder KI am Ende.

Erfasst wird jede Strategie unter src/ki/strategien: jede exportierte Funktion,
deren Name mit `erstelle` beginnt, gilt als Fabrik `(zufall) => Ki`.
*/

type Fabrik = Teilnehmer['erstelle']
type Partie = { spielerzahl: number; erweiterung: boolean; saat: number }

const PARTIEN: Partie[] = [
  { spielerzahl: 2, erweiterung: false, saat: 11 },
  { spielerzahl: 3, erweiterung: false, saat: 12 },
  { spielerzahl: 4, erweiterung: true, saat: 13 },
  { spielerzahl: 2, erweiterung: true, saat: 14 },
]

/** Die Fabriken eines Moduls, frisch geladen: `vi.resetModules()` lässt auch alle seine Abhängigkeiten neu laden. */
async function ladeFabriken(pfad: string): Promise<Map<string, Fabrik>> {
  vi.resetModules()
  const modul: Record<string, unknown> = await import(/* @vite-ignore */ pathToFileURL(join(WURZEL, pfad)).href)
  const fabriken = Object.entries(modul).filter((eintrag): eintrag is [string, Fabrik] => eintrag[0].startsWith('erstelle') && typeof eintrag[1] === 'function')
  return new Map(fabriken)
}

/** Was von einer KI nach aussen sichtbar ist, ohne Funktionen; Map und Set als Listen. */
function sichtbarerZustand(ki: Ki): string {
  return JSON.stringify(ki, (_, wert: unknown) => {
    if (typeof wert === 'function') return undefined
    if (wert instanceof Map || wert instanceof Set) return [...wert]
    return wert
  })
}

/** Spielt `partien`; mit `jeInstanzNeu` kommt jede KI aus einem eigenen, frisch geladenen Modul. */
async function spiele(pfad: string, name: string, jeInstanzNeu: boolean, partien: Partie[]) {
  const gemeinsam = jeInstanzNeu ? null : await ladeFabriken(pfad)
  const ergebnisse: Array<{ ausgang: string; verlauf: unknown[]; kis: string[] }> = []
  for (const [nummer, { spielerzahl, erweiterung, saat }] of partien.entries()) {
    const kis: Ki[] = []
    for (let sitz = 0; sitz < spielerzahl; sitz++) {
      const fabrik = (gemeinsam ?? (await ladeFabriken(pfad))).get(name)
      if (fabrik === undefined) throw new Error(`Isolationstest: ${pfad} exportiert ${name} nicht mehr`)
      kis.push(fabrik(erzeugeZufall(1000 * (nummer + 1) + sitz)))
    }
    const lauf = spielePartie(erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) }), kis, undefined, `${name}, Partie ${nummer + 1}`)
    ergebnisse.push({ ausgang: lauf.ausgang, verlauf: lauf.verlauf, kis: kis.map(sichtbarerZustand) })
  }
  return ergebnisse
}

/** Ob die Fabrik `name` aus `pfad` sich gleich verhält, ob ihre Instanzen ein Modul teilen oder nicht. */
async function vergleiche(pfad: string, name: string, partien = PARTIEN) {
  const geteilt = await spiele(pfad, name, false, partien)
  const getrennt = await spiele(pfad, name, true, partien)
  return { geteilt, getrennt }
}

const strategien = sammleDateien(WURZEL, 'src/ki/strategien').filter((pfad) => !istTestdatei(pfad))
const fabriken = (await Promise.all(strategien.map(async (pfad) => [...(await ladeFabriken(pfad)).keys()].map((name) => [pfad, name] as const)))).flat()

describe('P0.3d: Instanzen einer Strategie teilen kein Wissen (Isolationstest)', () => {
  it('P0.3d: der Test erfasst die Strategien unter src/ki/strategien, mindestens die Zufalls-KI', () => {
    expect(fabriken, 'P0.3d: erwartet erstelleZufallsKi unter den gefundenen Fabriken').toContainEqual(['src/ki/strategien/zufallsKi.ts', 'erstelleZufallsKi'])
  })

  it.each(fabriken)('P0.3d: %s, %s entscheidet gleich, ob die Instanzen ein Modul teilen oder nicht', async (pfad, name) => {
    const { geteilt, getrennt } = await vergleiche(pfad, name)

    expect(geteilt.map(({ ausgang }) => ausgang), 'P0.3d: erwartet, dass jede Partie endet').toEqual(PARTIEN.map(() => 'beendet'))
    expect(getrennt, `P0.3d: ${name} verhält sich mit geteiltem Modul anders als mit getrennten Modulen; Instanzen teilen Wissen`).toEqual(geteilt)
  }, 120_000)
})

describe('P0.3d: Gegenproben – der Isolationstest erkennt geteiltes Wissen', () => {
  const spione = [
    ['tests/isolation/spion_anker.ts', 'erstelleSpionAnker', 'Eigenschaft einer Funktion über Array.of (Angriff der Prüfung)'],
    ['tests/isolation/spion_map.ts', 'erstelleSpionMap', 'Funktion der Modulebene über Map.set/get'],
    ['tests/isolation/spion_newtarget.ts', 'erstelleSpionNewTarget', 'Klasse der Modulebene über new.target'],
  ] as const

  it.each(spione)('P0.3d: %s (%s) verhält sich mit geteiltem Modul anders', async (pfad, name, wie) => {
    // Der Kanal zeigt sich schon in der ersten Partie, sobald der zweite Sitz wählt.
    const { geteilt, getrennt } = await vergleiche(pfad, name, PARTIEN.slice(0, 1))

    expect(getrennt, `P0.3d: erwartet, dass der Isolationstest den Kanal „${wie}“ bemerkt`).not.toEqual(geteilt)
  }, 120_000)
})
