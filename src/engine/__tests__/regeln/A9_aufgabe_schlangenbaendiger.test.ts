import { describe, expect, it } from 'vitest'
import { BLOCKADE, fehlendeStellungen, pruefeStellung, RB } from '../aufgaben_folgen_hilfen'
import type { Stellung } from '../aufgaben_folgen_hilfen'

/*
X2, A9 Nr. 11 „Schlangenbändiger“ (7 Punkte): „Habe in einer Schlange ein sich
wiederholendes Muster aus min. 3 versch. Farben.“ Das Muster liegt mindestens
zweimal direkt hintereinander und ist eine beliebige Kartenfolge mit mindestens
drei verschiedenen Farben, also ABCABC, aber auch AABCAABC (D40). Joker zählen
als die Farbe, mit der die Aufgabe erfüllt ist (A9), die Karten unter einer
Farbenfusion nicht einzeln; eine andere Sonderkarte unterbricht das Muster (A9).
*/

const TABELLE: Stellung[] = [
  { art: 'erfüllt', stellung: 'A9 Beispiel: Rot, Blau, Grün, Rot, Blau, Grün', schlangen: [['Rot', 'Blau', 'Grün', 'Rot', 'Blau', 'Grün']], erfuellt: true },
  { art: 'erfüllt', stellung: 'D40: AABCAABC, Rot-Rot, Blau, Grün, Rot-Rot, Blau, Grün', schlangen: [['Rot', 'Rot', 'Blau', 'Grün', 'Rot', 'Rot', 'Blau', 'Grün']], erfuellt: true },
  { art: 'erfüllt', stellung: 'ein Muster aus vier Farben mitten in der Schlange', schlangen: [['Braun', 'Rot', 'Blau', 'Grün', 'Gelb', 'Rot', 'Blau', 'Grün', 'Gelb', 'Braun']], erfuellt: true },
  { art: 'knapp nicht', stellung: 'die Wiederholung bricht nach zwei Karten ab', schlangen: [['Rot', 'Blau', 'Grün', 'Rot', 'Blau', 'Gelb']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'ein Muster aus nur zwei Farben, Rot, Blau, dreimal', schlangen: [['Rot', 'Blau', 'Rot', 'Blau', 'Rot', 'Blau']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'D40: die Wiederholung ist durch Gelb getrennt', schlangen: [['Rot', 'Blau', 'Grün', 'Gelb', 'Rot', 'Blau', 'Grün']], erfuellt: false },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange zählt als das Blau der Wiederholung', schlangen: [['Rot', 'Blau', 'Grün', 'Rot', RB, 'Grün']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'je eine Regenbogenschlange in beiden Hälften, an verschiedenen Stellen', schlangen: [[RB, 'Blau', 'Grün', 'Rot', RB, 'Grün']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'zwei Regenbogenschlangen an derselben Stelle beider Hälften zählen als dritte Farbe', schlangen: [[RB, 'Blau', 'Grün', RB, 'Blau', 'Grün']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange kann Gelb und Rot nicht gleich machen', schlangen: [['Rot', 'Blau', 'Grün', 'Gelb', RB, 'Grün']], erfuellt: false },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei gelben Karten zählt als Blau', schlangen: [['Rot', 'Blau', 'Grün', 'Rot', { fusion: ['Gelb', 'Gelb'] }, 'Grün']], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion ist eine Karte, nicht zwei: Rot, Fusion aus Blau und Blau, Grün, Rot, Blau, Blau, Grün', schlangen: [['Rot', { fusion: ['Blau', 'Blau'] }, 'Grün', 'Rot', 'Blau', 'Blau', 'Grün']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade zwischen den beiden Mustern unterbricht', schlangen: [['Rot', 'Blau', 'Grün', BLOCKADE, 'Rot', 'Blau', 'Grün']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade vor dem Muster stört nicht', schlangen: [[BLOCKADE, 'Rot', 'Blau', 'Grün', 'Rot', 'Blau', 'Grün']], erfuellt: true },
  { art: 'zwei Schlangen', stellung: 'je ein Muster in einer Schlange wiederholt sich nicht', schlangen: [['Rot', 'Blau', 'Grün'], ['Rot', 'Blau', 'Grün']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'die zweite Schlange hat das Muster', schlangen: [['Gelb'], ['Rot', 'Blau', 'Grün', 'Rot', 'Blau', 'Grün']], erfuellt: true },
]

describe('A9 Nr. 11 Schlangenbändiger: Entscheidungstabelle', () => {
  it.each(TABELLE)('A9 Schlangenbändiger, $art: $stellung', (zeile) => pruefeStellung('Schlangenbändiger', zeile))

  it('A9/X2: die Tabelle zu Schlangenbändiger hat jede Pflichtstellung', () => {
    expect(fehlendeStellungen(TABELLE), 'X2 Kriterium 2: fehlende Stellungen').toEqual([])
  })
})
