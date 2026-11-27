import { describe, expect, it } from 'vitest'
import '../../engine'
import { ENTSCHEIDUNGSREGISTER } from '../../engine/entscheidungsregister'
import { TESTENTSCHEIDUNGEN } from '../../engine/testing/testentscheidung'
import { ENTSCHEIDUNGSART, entscheidungsart, wegDerEntscheidung } from './entscheidungsarten'

/*
O10: Die Oberfläche kennt jede Art von Entscheidung, die die Engine stellen
kann (X3, X5). Die Engine führt die Arten als Texte in ihrem Register; ändert
sich dort eine Art oder kommt eine dazu, wird dieser Test rot, statt dass der
Tisch erst im Spiel abbricht.
*/

describe('O10/X3: Die Arten der Entscheidungen', () => {
  it('O10/X5: jede Art im Entscheidungsregister der Engine und jede Test-Entscheidung hat eine Bedienung am Tisch', () => {
    const register = [...ENTSCHEIDUNGSREGISTER.keys(), ...TESTENTSCHEIDUNGEN.map((definition) => definition.art)].sort()
    expect(register).toEqual([...new Set(Object.values(ENTSCHEIDUNGSART))].sort())
  })

  it('O10: eine unbekannte Art ist ein Fehler, kein stiller Ersatz', () => {
    expect(() => entscheidungsart('Risiko: erfunden')).toThrow(/kennt der Tisch keine Bedienung/)
  })

  it('O10/D52, D53: Anlegen und Tausch wählt man am Tisch mit Karte und Ziel, alles andere als Knopf', () => {
    expect(wegDerEntscheidung(ENTSCHEIDUNGSART.anlegen, 'rot-01 schlange-2 ende')).toEqual([
      { art: 'karte', karteId: 'rot-01' },
      { art: 'schlangenende', schlangenId: 'schlange-2', seite: 'ende' },
    ])
    expect(wegDerEntscheidung(ENTSCHEIDUNGSART.tausch, 'gelb-03')).toEqual([{ art: 'karte', karteId: 'gelb-03' }])
    expect(wegDerEntscheidung(ENTSCHEIDUNGSART.tausch, 'kein Tausch')).toEqual([{ art: 'entscheiden', wahl: 'kein Tausch' }])
    expect(wegDerEntscheidung(ENTSCHEIDUNGSART.gegnerwahl, 'spieler-2')).toEqual([{ art: 'entscheiden', wahl: 'spieler-2' }])
    expect(() => wegDerEntscheidung(ENTSCHEIDUNGSART.anlegen, 'rot-01 schlange-2 mitte')).toThrow(/kein Ende/)
  })
})
