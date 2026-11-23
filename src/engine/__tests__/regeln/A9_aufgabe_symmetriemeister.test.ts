import { describe, expect, it } from 'vitest'
import { BLOCKADE, fehlendeStellungen, pruefeStellung, RB } from '../aufgaben_folgen_hilfen'
import type { Stellung } from '../aufgaben_folgen_hilfen'

/*
X2, A9 Nr. 13 „Symmetriemeister“ (10 Punkte): „Habe eine Schlange mit min. 8
Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.“ D39: Auch
eine ungerade Kartenzahl ist erlaubt, die mittlere Karte ist die Achse und
gehört zu keiner Hälfte; Joker zählen als die passende Farbe; liegt eine andere
Sonderkarte in der Schlange, ist die Aufgabe nicht erfüllt (behebt C23). Eine
Farbenfusion ist für Aufgaben eine Karte, die Karten darunter zählen nicht
einzeln (A9).
*/

const TABELLE: Stellung[] = [
  { art: 'erfüllt', stellung: 'A9 Beispiel: Blau, Rot, Gelb, Grün, Grün, Gelb, Rot, Blau', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: true },
  { art: 'erfüllt', stellung: 'D39: neun Karten, Violett ist die Achse', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Violett', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: true },
  { art: 'erfüllt', stellung: 'zehn Karten mit Reihen', schlangen: [['Blau', 'Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau', 'Blau']], erfuellt: true },
  { art: 'knapp nicht', stellung: 'sieben Karten, spiegelgleich, aber weniger als 8', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'die letzten beiden Karten sind vertauscht', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Blau', 'Rot']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'die zweite Hälfte wiederholt die erste, statt sie zu spiegeln', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Blau', 'Rot', 'Gelb', 'Grün']], erfuellt: false },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange zählt als das gespiegelte Grün', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', RB, 'Gelb', 'Rot', 'Blau']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'D39: die Regenbogenschlange als Achse', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', RB, 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange hilft nicht, wenn zwei Farbkarten nicht passen', schlangen: [['Blau', 'Rot', 'Gelb', RB, 'Grün', 'Gelb', 'Rot', 'Braun']], erfuellt: false },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei blauen Karten zählt als das gespiegelte Gelb', schlangen: [['Blau', 'Rot', { fusion: ['Blau', 'Blau'] }, 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion ist eine Karte: Blau, Rot, Gelb, Fusion, Gelb, Rot, Blau sind sieben', schlangen: [['Blau', 'Rot', 'Gelb', { fusion: ['Grün', 'Grün'] }, 'Gelb', 'Rot', 'Blau']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'D39: eine Schlangenblockade als Achse verhindert die Aufgabe', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', BLOCKADE, 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'D39: auch eine Schlangenblockade am Anfang verhindert sie', schlangen: [[BLOCKADE, 'Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'die Hälften liegen in zwei Schlangen', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün'], ['Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'die zweite Schlange ist spiegelgleich', schlangen: [['Braun'], ['Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau']], erfuellt: true },
]

describe('A9 Nr. 13 Symmetriemeister: Entscheidungstabelle', () => {
  it.each(TABELLE)('A9 Symmetriemeister, $art: $stellung', (zeile) => pruefeStellung('Symmetriemeister', zeile))

  it('A9/X2: die Tabelle zu Symmetriemeister hat jede Pflichtstellung', () => {
    expect(fehlendeStellungen(TABELLE), 'X2 Kriterium 2: fehlende Stellungen').toEqual([])
  })
})
