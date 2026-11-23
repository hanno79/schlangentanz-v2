import { describe, expect, it } from 'vitest'
import { BLOCKADE, fehlendeStellungen, pruefeStellung, RB } from '../aufgaben_folgen_hilfen'
import type { Stellung } from '../aufgaben_folgen_hilfen'

/*
X2, A9 Nr. 5 „Vielfaltskönig“ (9 Punkte): „Habe in jeder deiner Schlangen min.
4 versch. Farben.“ Es braucht zwei Schlangen mit je mindestens vier Farben
(D38); die Farben dürfen irgendwo in der Schlange liegen. Jeder Joker zählt als
eine Farbe, die der Schlange noch fehlt (A9); die Karten unter einer
Farbenfusion zählen nicht einzeln (A9, A7.7), eine Schlangenblockade ist keine
Farbe.
*/

const TABELLE: Stellung[] = [
  { art: 'erfüllt', stellung: 'vier Farben in jeder der beiden Schlangen', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün'], ['Braun', 'Violett', 'Blau', 'Rot']], erfuellt: true },
  { art: 'erfüllt', stellung: 'Farben dürfen sich wiederholen und müssen nicht nebeneinander liegen', schlangen: [['Blau', 'Blau', 'Rot', 'Blau', 'Gelb', 'Gelb', 'Grün'], ['Braun', 'Violett', 'Braun', 'Blau', 'Rot', 'Rot']], erfuellt: true },
  { art: 'knapp nicht', stellung: 'die zweite Schlange hat nur drei Farben', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün'], ['Braun', 'Violett', 'Blau', 'Blau']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'D38: eine Schlange mit sechs Farben genügt nicht', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett']], erfuellt: false },
  { art: 'Regenbogenschlange', stellung: 'je eine Regenbogenschlange als vierte Farbe', schlangen: [['Blau', 'Rot', 'Gelb', RB], ['Braun', 'Violett', 'Grün', RB]], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'eine Regenbogenschlange ist nur eine Farbe: Blau, Rot und sie sind drei', schlangen: [['Blau', 'Rot', RB], ['Braun', 'Violett', 'Grün', 'Gelb']], erfuellt: false },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei blauen Karten zählt als vierte Farbe', schlangen: [['Blau', 'Rot', 'Gelb', { fusion: ['Blau', 'Blau'] }], ['Braun', 'Violett', 'Grün', 'Gelb']], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die gelben Karten unter der Farbenfusion zählen nicht: Blau, Rot und die Fusion sind drei', schlangen: [['Blau', 'Rot', { fusion: ['Gelb', 'Gelb'] }], ['Braun', 'Violett', 'Grün', 'Gelb']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade zwischen den Farben stört nicht', schlangen: [['Blau', 'Rot', BLOCKADE, 'Gelb', 'Grün'], ['Braun', 'Violett', 'Blau', 'Rot']], erfuellt: true },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade ist keine vierte Farbe', schlangen: [['Blau', 'Rot', 'Gelb', BLOCKADE], ['Braun', 'Violett', 'Blau', 'Rot']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'sechs Farben über beide Schlangen verteilt, aber die erste hat nur zwei', schlangen: [['Blau', 'Rot'], ['Gelb', 'Grün', 'Braun', 'Violett']], erfuellt: false },
]

describe('A9 Nr. 5 Vielfaltskönig: Entscheidungstabelle', () => {
  it.each(TABELLE)('A9 Vielfaltskönig, $art: $stellung', (zeile) => pruefeStellung('Vielfaltskönig', zeile))

  it('A9/X2: die Tabelle zu Vielfaltskönig hat jede Pflichtstellung', () => {
    expect(fehlendeStellungen(TABELLE), 'X2 Kriterium 2: fehlende Stellungen').toEqual([])
  })
})
