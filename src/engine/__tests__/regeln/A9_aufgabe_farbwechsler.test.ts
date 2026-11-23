import { describe, expect, it } from 'vitest'
import { BLOCKADE, fehlendeStellungen, pruefeStellung, RB } from '../aufgaben_folgen_hilfen'
import type { Stellung } from '../aufgaben_folgen_hilfen'

/*
X2, A9 Nr. 6 „Farbwechsler“ (6 Punkte): „Habe in einer Schlange mindestens 4
verschiedene Farben, die direkt aufeinander folgen. Es müssen nicht einzelne
Farben aufeinander folgen. Es gelten auch Reihen.“ Eine Reihe gleicher Farbe
gilt als eine Farbe in der Folge (X2, Kriterium 6; behebt C21). Joker zählen als
die Farbe, mit der die Aufgabe erfüllt ist (A9), die Karten unter einer
Farbenfusion nicht einzeln; eine andere Sonderkarte unterbricht die Folge (A9).
*/

const TABELLE: Stellung[] = [
  { art: 'erfüllt', stellung: 'A9 Beispiel: Blau, Rot, Gelb, Grün, Blau', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Blau']], erfuellt: true },
  { art: 'erfüllt', stellung: 'X2 Kriterium 6: Reihen gelten als eine Farbe, Blau-Blau, Rot, Gelb-Gelb-Gelb, Grün', schlangen: [['Blau', 'Blau', 'Rot', 'Gelb', 'Gelb', 'Gelb', 'Grün']], erfuellt: true },
  { art: 'erfüllt', stellung: 'sechs Farben nacheinander', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett']], erfuellt: true },
  { art: 'knapp nicht', stellung: 'nur drei Farben nacheinander', schlangen: [['Blau', 'Rot', 'Gelb', 'Blau']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'vier Farben, aber Rot dazwischen wiederholt: Blau, Rot, Gelb, Rot, Grün', schlangen: [['Blau', 'Rot', 'Gelb', 'Rot', 'Grün']], erfuellt: false },
  { art: 'knapp nicht', stellung: 'X2 Kriterium 6: zwei blaue Reihen sind keine zwei Farben, Blau-Blau, Rot-Rot, Blau-Blau, Gelb', schlangen: [['Blau', 'Blau', 'Rot', 'Rot', 'Blau', 'Blau', 'Gelb']], erfuellt: false },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange ist die vierte Farbe', schlangen: [['Blau', 'Rot', 'Gelb', RB]], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'die Regenbogenschlange in einer Reihe verlängert sie', schlangen: [['Blau', RB, 'Blau', 'Rot', 'Gelb', 'Grün']], erfuellt: true },
  { art: 'Regenbogenschlange', stellung: 'eine Regenbogenschlange zwischen zwei blauen Karten ergibt höchstens drei Farben', schlangen: [['Blau', RB, 'Blau', 'Rot']], erfuellt: false },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion aus zwei blauen Karten zählt als Gelb', schlangen: [['Blau', 'Rot', { fusion: ['Blau', 'Blau'] }, 'Grün']], erfuellt: true },
  { art: 'Farbenfusion', stellung: 'die Farbenfusion ist eine Farbe, nicht zwei: Blau, Fusion, Rot', schlangen: [['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade zwischen Rot und Gelb unterbricht die Folge', schlangen: [['Blau', 'Rot', BLOCKADE, 'Gelb', 'Grün']], erfuellt: false },
  { art: 'Blockade dazwischen', stellung: 'eine Schlangenblockade hinter der Folge stört nicht', schlangen: [['Blau', 'Rot', 'Gelb', 'Grün', BLOCKADE]], erfuellt: true },
  { art: 'zwei Schlangen', stellung: 'zwei Farben in jeder Schlange ergeben keine Folge', schlangen: [['Blau', 'Rot'], ['Gelb', 'Grün']], erfuellt: false },
  { art: 'zwei Schlangen', stellung: 'die zweite Schlange hat die Folge', schlangen: [['Blau', 'Rot'], ['Gelb', 'Grün', 'Braun', 'Violett']], erfuellt: true },
]

describe('A9 Nr. 6 Farbwechsler: Entscheidungstabelle', () => {
  it.each(TABELLE)('A9 Farbwechsler, $art: $stellung', (zeile) => pruefeStellung('Farbwechsler', zeile))

  it('A9/X2: die Tabelle zu Farbwechsler hat jede Pflichtstellung', () => {
    expect(fehlendeStellungen(TABELLE), 'X2 Kriterium 2: fehlende Stellungen').toEqual([])
  })
})
