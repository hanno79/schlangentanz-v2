import { describe, expect, it } from 'vitest'
import { BLOCKADE, fehlendeStellungen, pruefeStellung, RB } from '../aufgaben_folgen_hilfen'
import type { Stellung } from '../aufgaben_folgen_hilfen'

/*
X2, A9 Nr. 4 „Farbvielfalt“ (9 Punkte): „Bilde eine Kette aus je einer Karte
aller 6 Farben.“ Eine Kette sind Karten direkt hintereinander in einer
Schlange; „je einer Karte“ heisst: sechs Karten, von jeder Farbe genau eine.
Joker zählen als die Farbe, die noch fehlt (A9, Beispiel; A7.3, Beispiel), die
Karten unter einer Farbenfusion nicht einzeln (A9, A7.7); eine andere
Sonderkarte unterbricht die Kette (A9).
*/

const TABELLE: Stellung[] = [
  { art: 'erfüllt', stellung: 'A9 Beispiel: Blau, Rot, Gelb, Braun, Violett, Grün', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün']], erfuellt: true },
  { art: 'erfüllt', stellung: 'die Kette liegt mitten in einer längeren Schlange', schlangen: [['Gelb', 'Gelb', 'Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün', 'Grün']], erfuellt: true },
  { art: 'knapp nicht', stellung: 'fünf Farben, die sechste Karte wiederholt Blau', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Blau']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'alle sechs Farben, aber Rot liegt doppelt mitten in der Kette', schlangen: [['Blau', 'Rot', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'nur fünf Karten', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Violett']], erfuellt: false },
  { art: 'Regenbogenschlange', stellung: 'A7.3 Beispiel: Blau, Rot, Gelb, Braun, Grün und die Regenbogenschlange als Violett', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Grün', RB]], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'zwei Regenbogenschlangen füllen zwei fehlende Farben', schlangen: [['Blau', RB, 'Gelb', RB, 'Violett', 'Grün']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'mit Regenbogenschlange, aber Blau doppelt', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Blau', RB]], erfuellt: false },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei gelben Karten zählt als das fehlende Gelb', schlangen: [['Blau', 'Rot', { fusion: ['Gelb', 'Gelb'] }, 'Braun', 'Violett', 'Grün']], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei blauen Karten zählt als Grün; die Farbe darunter spielt keine Rolle (A7.7)', schlangen: [['Blau', 'Rot', 'Gelb', 'Braun', 'Violett', { fusion: ['Blau', 'Blau'] }]], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion ist eine Karte: mit ihr sind es nur fünf', schlangen: [['Blau', 'Rot', { fusion: ['Gelb', 'Gelb'] }, 'Braun', 'Violett']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade zwischen Gelb und Braun unterbricht die Kette', schlangen: [['Blau', 'Rot', 'Gelb', BLOCKADE, 'Braun', 'Violett', 'Grün']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade vor der Kette stört nicht', schlangen: [[BLOCKADE, 'Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün']], erfuellt: true },
  { art: 'zwei Schlangen', stellung: 'drei Farben in jeder Schlange: die Kette liegt in einer Schlange', schlangen: [['Blau', 'Rot', 'Gelb'], ['Braun', 'Violett', 'Grün']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'die zweite Schlange hat die Kette', schlangen: [['Blau', 'Blau'], ['Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün']], erfuellt: true },
]

describe('A9 Nr. 4 Farbvielfalt: Entscheidungstabelle', () => {
  it.each(TABELLE)('A9 Farbvielfalt, $art: $stellung', (zeile) => pruefeStellung('Farbvielfalt', zeile))

  it('A9/X2: die Tabelle zu Farbvielfalt hat jede Pflichtstellung', () => {
    expect(fehlendeStellungen(TABELLE), 'X2 Kriterium 2: fehlende Stellungen').toEqual([])
  })
})
