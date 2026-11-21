// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { berechneEndwertung, deserialisiere, ermittleAktionen, erzeugeZufall, werteSchlangen } from '../../engine'
import type { Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { nachDurchlassen } from '../__tests__/stellungen'
import { planeZug } from './zugsuche'

/*
K2, Kriterium 1 (Prüfprotokoll K2, Iteration 3, Mangel 1): Die Zugsuche vertieft nur
die besten drei ersten Karten um eine zweite. Waren das gleichwertige Varianten
derselben Karte (Farbendieb braun-04 an den Stellen 0, 1 und 2), blieb die
Vollendung auf Rang 8 bis 10 liegen. Die Stellungen stammen aus Partien des
Prüfers, mit dem Code von 9f5435c bis zum Zugbeginn der soliden KI (Stelle 1)
gespielt und gespeichert, damit eine spätere Änderung der KI sie nicht verschiebt.
*/

function stellung(datei: string): Spielzustand {
  return deserialisiere(readFileSync(join(__dirname, '../__tests__/stellungen', datei), 'utf8'))
}

function gruppen(zustand: Spielzustand, sitz: number): number {
  return werteSchlangen(zustand.spieler[sitz].schlangen, zustand.erweiterung).schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0)
}

/** Spielt den ersten Teilzug der soliden KI an Stelle `sitz` bis „Zug beenden“; gefragte Gegner lassen durch. */
function ersterTeilzug(start: Spielzustand, sitz: number): Spielzustand {
  let zustand = start
  for (let schritt = 0; schritt < 10; schritt += 1) {
    const plan = planeZug(sichtFuer(zustand, sitz), ermittleAktionen(zustand), erzeugeZufall(5))
    if (plan.aktion.typ === 'ZugBeenden') return zustand
    zustand = nachDurchlassen(zustand, plan.aktion, sitz)
  }
  throw new Error('Testaufbau: Der Teilzug endet nicht nach zehn Schritten.')
}

describe('K2.1: die Vertiefung betrachtet verschiedene Züge, nicht dieselbe Karte mehrfach', () => {
  it.each([
    ['saat-8803-schritt-124.json', 'Farbendieb violett-09 und braun-07 vollenden (Endwertung 41 statt 37)', 5, 33],
    ['saat-7151-schritt-73.json', 'Schlangenhäutung und eine blaue Karte vollenden', 3, 34],
  ])('K2.1: %s – %s', (datei, _beschreibung, gruppenVorher, punkteVorher) => {
    const start = stellung(datei)
    expect([gruppen(start, 1), berechneEndwertung(start).spieler[1].summe], 'Testaufbau: die Stellung des Prüfprotokolls').toEqual([gruppenVorher, punkteVorher])
    const ende = ersterTeilzug(start, 1)
    expect(gruppen(ende, 1), `K2.1: Gruppen nach dem Teilzug, Endwertung ${berechneEndwertung(ende).spieler[1].summe}`).toBeGreaterThan(gruppenVorher)
  })
})
