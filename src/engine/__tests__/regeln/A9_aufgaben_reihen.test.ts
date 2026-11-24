import { describe, expect, it } from 'vitest'
import { gelberSchatz } from '../../aufgaben/gelberSchatz'
import { lilaRiese } from '../../aufgaben/lilaRiese'
import { mal, pruefeTabelle, RS, SPERRE, stellung } from '../farbmengen_hilfen'
import type { Stellung } from '../farbmengen_hilfen'

/*
X2 Paket A, Entscheidungstabellen: „Gelber Schatz“ (A9 Nr. 14) und „Lila Riese“
(A9 Nr. 15, D3, behebt C14). Beide verlangen nebeneinanderliegende Karten in
einer Schlange: eine Gruppe aus mindestens 6 gelben beziehungsweise eine
ununterbrochene Reihe aus mindestens 5 violetten Karten. D41: Joker zählen mit,
als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte. Andere
Sonderkarten unterbrechen die Reihe (A9 „Wichtig für Sonderkarten“).
*/

describe('A9/D41: Gelber Schatz – eine Gruppe aus mindestens 6 gelben Karten', () => {
  const tabelle: Stellung[] = [
    { fall: 'erfüllt: sechs gelbe Karten nebeneinander', schlangen: [['Rot', ...mal(6, 'Gelb'), 'Blau']], erwartet: true },
    { fall: 'knapp nicht: fünf gelbe Karten', schlangen: [mal(5, 'Gelb')], erwartet: false },
    { fall: 'knapp nicht: sechs gelbe Karten, aber durch eine rote getrennt (eine Gruppe liegt nebeneinander)', schlangen: [[...mal(3, 'Gelb'), 'Rot', ...mal(3, 'Gelb')]], erwartet: false },
    { fall: 'mit Regenbogenschlange am Ende: sie zählt als sechste gelbe Karte', schlangen: [[...mal(5, 'Gelb'), RS]], erwartet: true },
    { fall: 'mit Regenbogenschlange in der Mitte: sie verbindet zwei gelbe Reihen', schlangen: [[...mal(2, 'Gelb'), RS, ...mal(3, 'Gelb')]], erwartet: true },
    { fall: 'mit zwei Regenbogenschlangen: beide zählen als Gelb', schlangen: [[...mal(4, 'Gelb'), RS, RS]], erwartet: true },
    { fall: 'mit Farbenfusion: eine Fusion aus zwei blauen Karten zählt als sechste gelbe Karte', schlangen: [[...mal(5, 'Gelb'), { fusion: ['Blau', 'Blau'] }]], erwartet: true },
    { fall: 'mit Farbenfusion, knapp nicht: eine Fusion aus zwei gelben Karten zählt als eine Karte (D41), also fünf', schlangen: [[{ fusion: ['Gelb', 'Gelb'] }, ...mal(4, 'Gelb')]], erwartet: false },
    { fall: 'mit Blockade dazwischen: drei gelbe, Blockade, drei gelbe ist keine Gruppe aus sechs', schlangen: [[...mal(3, 'Gelb'), SPERRE, ...mal(3, 'Gelb')]], erwartet: false },
    { fall: 'über zwei Schlangen: drei und drei gelbe Karten in verschiedenen Schlangen erfüllen nicht', schlangen: [mal(3, 'Gelb'), mal(3, 'Gelb')], erwartet: false },
    { fall: 'über zwei Schlangen: sechs gelbe Karten in der zweiten Schlange genügen', schlangen: [mal(2, 'Rot'), mal(6, 'Gelb')], erwartet: true },
    { fall: 'sechs gelbe Karten in der Schlange des Gegners zählen nicht für Spieler 1', schlangen: [mal(2, 'Gelb')], gegner: [mal(6, 'Gelb')], erwartet: false },
  ]
  pruefeTabelle('A9/D41', gelberSchatz, tabelle)
})

describe('A9/D3/D41: Lila Riese – eine ununterbrochene Reihe aus mindestens 5 violetten Karten (behebt C14)', () => {
  it('A9/D3 (C14): vier violette Karten in einer Reihe erfüllen nicht, fünf erfüllen', () => {
    expect(lilaRiese.istErfuellt(stellung([mal(4, 'Violett')]), 0), 'lilaRiese.istErfuellt mit 4 violetten Karten').toBe(false)
    expect(lilaRiese.istErfuellt(stellung([mal(5, 'Violett')]), 0), 'lilaRiese.istErfuellt mit 5 violetten Karten').toBe(true)
  })

  const tabelle: Stellung[] = [
    { fall: 'erfüllt: sechs violette Karten zwischen anderen Farben', schlangen: [['Blau', ...mal(6, 'Violett'), 'Rot']], erwartet: true },
    { fall: 'knapp nicht (C14): eine violette Dreiergruppe genügt nicht mehr', schlangen: [[...mal(3, 'Violett'), 'Blau']], erwartet: false },
    { fall: 'knapp nicht: fünf violette Karten, durch eine braune unterbrochen', schlangen: [[...mal(2, 'Violett'), 'Braun', ...mal(3, 'Violett')]], erwartet: false },
    { fall: 'mit Regenbogenschlange: vier violette Karten und eine Regenbogenschlange am Anfang', schlangen: [['Blau', RS, ...mal(4, 'Violett')]], erwartet: true },
    { fall: 'mit Regenbogenschlange in der Mitte: sie schliesst die Lücke zwischen zwei violetten Reihen', schlangen: [[...mal(2, 'Violett'), RS, ...mal(2, 'Violett')]], erwartet: true },
    { fall: 'mit Regenbogenschlange, knapp nicht: drei violette Karten und eine Regenbogenschlange', schlangen: [[...mal(3, 'Violett'), RS]], erwartet: false },
    { fall: 'mit Farbenfusion: eine Fusion aus zwei roten Karten zählt als fünfte violette Karte', schlangen: [[...mal(4, 'Violett'), { fusion: ['Rot', 'Rot'] }]], erwartet: true },
    { fall: 'mit Farbenfusion, knapp nicht: eine Fusion aus zwei violetten Karten zählt als eine Karte (D41), also vier', schlangen: [[...mal(3, 'Violett'), { fusion: ['Violett', 'Violett'] }]], erwartet: false },
    { fall: 'mit Blockade dazwischen: die Reihe ist unterbrochen', schlangen: [[...mal(2, 'Violett'), SPERRE, ...mal(3, 'Violett')]], erwartet: false },
    { fall: 'über zwei Schlangen: drei und zwei violette Karten in verschiedenen Schlangen erfüllen nicht', schlangen: [mal(3, 'Violett'), mal(2, 'Violett')], erwartet: false },
    { fall: 'über zwei Schlangen: fünf violette Karten in der ersten Schlange genügen', schlangen: [mal(5, 'Violett'), mal(2, 'Gelb')], erwartet: true },
    { fall: 'fünf violette Karten in der Schlange des Gegners zählen nicht für Spieler 1', schlangen: [mal(2, 'Violett')], gegner: [mal(5, 'Violett')], erwartet: false },
  ]
  pruefeTabelle('A9/D41', lilaRiese, tabelle)
})

describe('A9/A7.3: derselbe Joker zählt bei zwei Aufgaben als verschiedene Farbe', () => {
  it('A9/A7.3/D8: zwischen fünf gelben und vier violetten Karten zählt eine Regenbogenschlange für Gelber Schatz als Gelb und für Lila Riese als Violett', () => {
    const zustand = stellung([[...mal(5, 'Gelb'), RS, ...mal(4, 'Violett')]])
    expect(gelberSchatz.istErfuellt(zustand, 0), 'gelberSchatz.istErfuellt: Regenbogenschlange als Gelb').toBe(true)
    expect(lilaRiese.istErfuellt(zustand, 0), 'lilaRiese.istErfuellt: dieselbe Regenbogenschlange als Violett').toBe(true)
  })

  it('A9/A7.7/D8: ebenso eine Farbenfusion aus zwei blauen Karten zwischen gelben und violetten Karten', () => {
    const zustand = stellung([[...mal(5, 'Gelb'), { fusion: ['Blau', 'Blau'] }, ...mal(4, 'Violett')]])
    expect(gelberSchatz.istErfuellt(zustand, 0), 'gelberSchatz.istErfuellt: Fusion als Gelb').toBe(true)
    expect(lilaRiese.istErfuellt(zustand, 0), 'lilaRiese.istErfuellt: dieselbe Fusion als Violett').toBe(true)
  })
})
