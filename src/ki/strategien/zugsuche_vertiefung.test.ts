// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { berechneEndwertung } from '../../engine'
import { ersterTeilzug, gruppenzahl, ladeStellung } from '../__tests__/stellungen'

/*
K2, Kriterium 1 (Prüfprotokoll K2, Iteration 3, Mangel 1): Die Zugsuche vertieft nur
die besten drei ersten Karten um eine zweite. Waren das gleichwertige Varianten
derselben Karte (Farbendieb braun-04 an den Stellen 0, 1 und 2), blieb die
Vollendung auf Rang 8 bis 10 liegen. Die Stellungen stammen aus Partien des
Prüfers, mit dem Code von 9f5435c bis zum Zugbeginn der soliden KI (Stelle 1)
gespielt und gespeichert, damit eine spätere Änderung der KI sie nicht verschiebt.
*/

describe('K2.1: die Vertiefung betrachtet verschiedene Züge, nicht dieselbe Karte mehrfach', () => {
  it.each([
    ['saat-8803-schritt-124.json', 'Farbendieb violett-09 und braun-07 vollenden (Endwertung 41 statt 37)', 5, 33],
    ['saat-7151-schritt-73.json', 'Schlangenhäutung und eine blaue Karte vollenden', 3, 34],
  ])('K2.1: %s – %s', (datei, _beschreibung, gruppenVorher, punkteVorher) => {
    const start = ladeStellung(datei)
    expect([gruppenzahl(start, 1), berechneEndwertung(start).spieler[1].summe], 'Testaufbau: die Stellung des Prüfprotokolls').toEqual([gruppenVorher, punkteVorher])
    const { ende } = ersterTeilzug(start, 1, 5)
    expect(gruppenzahl(ende, 1), `K2.1: Gruppen nach dem Teilzug, Endwertung ${berechneEndwertung(ende).spieler[1].summe}`).toBeGreaterThan(gruppenVorher)
  })
})
