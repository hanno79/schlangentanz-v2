import { describe, expect, it } from 'vitest'
import { farbenpracht } from '../../aufgaben/farbenpracht'
import { farbharmonie } from '../../aufgaben/farbharmonie'
import { farbkombination } from '../../aufgaben/farbkombination'
import { mal, pruefeTabelle, RS, SPERRE, stellung } from '../farbmengen_hilfen'
import type { Stellung } from '../farbmengen_hilfen'

/*
X2 Paket A, Entscheidungstabellen: „Farbenpracht“ (A9 Nr. 1, D38),
„Farbharmonie“ (A9 Nr. 2, D31) und „Farbkombination“ (A9 Nr. 3, D41).

Für alle gilt A9 „Wichtig für Sonderkarten“: Regenbogenschlange und Farbenfusion
zählen als eine Karte der Farbe, mit der die Aufgabe erfüllt ist; die Karten
unter einer Farbenfusion zählen nicht einzeln (A7.7); andere Sonderkarten wie die
Schlangenblockade unterbrechen Farbreihen und zählen nicht.
*/

const FUSION_GELB = { fusion: ['Gelb', 'Gelb'] } as const
const PAARE = [...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Gelb'), ...mal(2, 'Violett'), ...mal(2, 'Braun'), ...mal(2, 'Grün')]
const OHNE_GELB = [...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Violett'), ...mal(2, 'Braun'), ...mal(2, 'Grün')]

describe('A9/D38: Farbenpracht – von jeder Farbe mindestens zwei Karten in den eigenen Schlangen', () => {
  const tabelle: Stellung[] = [
    { fall: 'erfüllt: eine Schlange mit je zwei Karten aller sechs Farben (D38: eine genügt)', schlangen: [PAARE], erwartet: true },
    { fall: 'knapp nicht: nur eine grüne Karte', schlangen: [PAARE.slice(0, -1)], erwartet: false },
    { fall: 'mit Regenbogenschlange: sie zählt als die fehlende zweite grüne Karte', schlangen: [[...PAARE.slice(0, -1), RS]], erwartet: true },
    {
      fall: 'mit Regenbogenschlange, knapp nicht: ein Joker ersetzt nur eine fehlende Karte, hier fehlen Braun und Grün',
      schlangen: [[...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Gelb'), ...mal(2, 'Violett'), 'Braun', 'Grün', RS]],
      erwartet: false,
    },
    { fall: 'mit Farbenfusion: sie zählt als die zweite gelbe Karte', schlangen: [[...OHNE_GELB, FUSION_GELB, 'Gelb']], erwartet: true },
    { fall: 'mit Farbenfusion, knapp nicht: die zwei gelben Karten darunter zählen nicht einzeln (A7.7), die Fusion ist eine Karte', schlangen: [[...OHNE_GELB, FUSION_GELB]], erwartet: false },
    { fall: 'mit Blockade dazwischen: sie unterbricht nichts, was die Aufgabe braucht', schlangen: [[...PAARE.slice(0, 5), SPERRE, ...PAARE.slice(5)]], erwartet: true },
    { fall: 'mit Blockade statt der zweiten grünen Karte: die Blockade zählt nicht als Karte', schlangen: [[...PAARE.slice(0, -1), SPERRE]], erwartet: false },
    { fall: 'über zwei Schlangen: gezählt wird über beide eigenen Schlangen', schlangen: [PAARE.slice(0, 6), PAARE.slice(6)], erwartet: true },
    { fall: 'über zwei Schlangen, knapp nicht: je eine grüne Karte in beiden Schlangen genügt, aber Braun liegt nur einmal', schlangen: [[...PAARE.slice(0, 8), 'Grün'], ['Braun', 'Grün']], erwartet: false },
    { fall: 'eine grüne Karte in der Schlange des Gegners zählt nicht für Spieler 1', schlangen: [PAARE.slice(0, -1)], gegner: [['Grün']], erwartet: false },
  ]
  pruefeTabelle('A9/D38', farbenpracht, tabelle)
})

const DREIER_BRG = [...mal(3, 'Blau'), ...mal(3, 'Rot'), ...mal(3, 'Grün')]
const DREIER_GBV = [...mal(3, 'Gelb'), ...mal(3, 'Braun'), ...mal(3, 'Violett')]

describe('A9/D31: Farbharmonie – in den eigenen Schlangen mindestens eine Dreiergruppe jeder Farbe', () => {
  it('A9 Beispiel Farbharmonie: Schlange 1 Blau, Rot, Grün und Schlange 2 Gelb, Braun, Violett, je drei: erfüllt', () => {
    expect(farbharmonie.istErfuellt(stellung([DREIER_BRG, DREIER_GBV]), 0), 'farbharmonie.istErfuellt, Beispiel A9').toBe(true)
  })

  const tabelle: Stellung[] = [
    { fall: 'erfüllt: alle sechs Dreiergruppen in einer Schlange', schlangen: [[...DREIER_BRG, ...DREIER_GBV]], erwartet: true },
    { fall: 'knapp nicht: Violett hat nur zwei Karten', schlangen: [DREIER_BRG, DREIER_GBV.slice(0, -1)], erwartet: false },
    { fall: 'eine Vierergruppe ist auch eine Dreiergruppe ihrer Farbe (Gruppe ab drei Karten, A11)', schlangen: [['Blau', ...DREIER_BRG], DREIER_GBV], erwartet: true },
    { fall: 'mit Regenbogenschlange: sie vervollständigt die violette Gruppe', schlangen: [DREIER_BRG, [...DREIER_GBV.slice(0, -1), RS]], erwartet: true },
    {
      fall: 'mit Regenbogenschlange, knapp nicht: zwischen Grün-Grün und Braun-Braun vervollständigt sie nur eine der beiden Gruppen',
      schlangen: [[...mal(3, 'Blau'), ...mal(3, 'Rot'), 'Grün', 'Grün', RS, 'Braun', 'Braun'], [...mal(3, 'Gelb'), ...mal(3, 'Violett')]],
      erwartet: false,
    },
    { fall: 'mit Farbenfusion: sie zählt als dritte grüne Karte, die gelben Karten darunter spielen keine Rolle', schlangen: [[...DREIER_BRG.slice(0, -1), FUSION_GELB], DREIER_GBV], erwartet: true },
    {
      fall: 'mit Farbenfusion, knapp nicht: Grün und eine Fusion aus zwei grünen Karten sind nur zwei Karten (A7.7)',
      schlangen: [[...mal(3, 'Blau'), ...mal(3, 'Rot'), 'Grün', { fusion: ['Grün', 'Grün'] }], DREIER_GBV],
      erwartet: false,
    },
    { fall: 'mit Blockade dazwischen: Grün, Grün, Blockade, Grün ist keine Dreiergruppe', schlangen: [[...DREIER_BRG.slice(0, -1), SPERRE, 'Grün'], DREIER_GBV], erwartet: false },
    { fall: 'über zwei Schlangen: das Beispiel aus A9', schlangen: [DREIER_BRG, DREIER_GBV], erwartet: true },
    {
      fall: 'über zwei Schlangen, knapp nicht: eine Gruppe reicht nicht über das Ende einer Schlange hinaus',
      schlangen: [[...DREIER_BRG, ...DREIER_GBV.slice(0, -2)], ['Violett', 'Violett']],
      erwartet: false,
    },
    { fall: 'D31: drei Regenbogenschlangen nebeneinander sind eine Gruppe frei wählbarer Farbe, hier Grün', schlangen: [[...mal(3, 'Blau'), ...mal(3, 'Rot'), RS, RS, RS], DREIER_GBV], erwartet: true },
    {
      fall: 'D31: Regenbogenschlange, Farbenfusion, Regenbogenschlange sind eine Gruppe, hier Grün',
      schlangen: [[...mal(3, 'Blau'), ...mal(3, 'Rot'), RS, FUSION_GELB, RS], DREIER_GBV],
      erwartet: true,
    },
    { fall: 'Dreiergruppen in der Schlange des Gegners zählen nicht für Spieler 1', schlangen: [DREIER_BRG], gegner: [DREIER_GBV], erwartet: false },
  ]
  pruefeTabelle('A9/D31', farbharmonie, tabelle)
})

describe('A9/D41: Farbkombination – 5 oder mehr Karten der gleichen Farbe in einer Schlange', () => {
  it('A9 Beispiel Farbkombination: Blau, Blau, Blau, Blau, Blau: erfüllt', () => {
    expect(farbkombination.istErfuellt(stellung([mal(5, 'Blau')]), 0), 'farbkombination.istErfuellt, Beispiel A9').toBe(true)
  })

  it('A9 Beispiel (Allgemein): eine Vierergruppe blauer Karten erfüllt noch nicht, die fünfte blaue Karte schon', () => {
    expect(farbkombination.istErfuellt(stellung([mal(4, 'Blau')]), 0), 'farbkombination.istErfuellt, vorher').toBe(false)
    expect(farbkombination.istErfuellt(stellung([mal(5, 'Blau')]), 0), 'farbkombination.istErfuellt, nach der fünften').toBe(true)
  })

  const tabelle: Stellung[] = [
    { fall: 'erfüllt: sechs gelbe Karten', schlangen: [mal(6, 'Gelb')], erwartet: true },
    { fall: 'knapp nicht: vier blaue und eine rote Karte', schlangen: [[...mal(4, 'Blau'), 'Rot']], erwartet: false },
    { fall: 'mit Regenbogenschlange: vier blaue Karten und eine Regenbogenschlange', schlangen: [[...mal(2, 'Blau'), RS, ...mal(2, 'Blau')]], erwartet: true },
    { fall: 'mit Regenbogenschlange, knapp nicht: drei blaue Karten und eine Regenbogenschlange', schlangen: [[...mal(3, 'Blau'), RS, 'Rot']], erwartet: false },
    { fall: 'mit Farbenfusion: sie zählt als die fünfte blaue Karte, die gelben Karten darunter spielen keine Rolle', schlangen: [[...mal(2, 'Blau'), FUSION_GELB, ...mal(2, 'Blau')]], erwartet: true },
    {
      fall: 'mit Farbenfusion, knapp nicht: drei blaue Karten und eine Fusion aus zwei blauen sind nur vier Karten (A7.7)',
      schlangen: [[...mal(3, 'Blau'), { fusion: ['Blau', 'Blau'] }]],
      erwartet: false,
    },
    { fall: 'mit Blockade dazwischen: fünf blaue Karten irgendwo in der Schlange genügen (D41)', schlangen: [[...mal(2, 'Blau'), SPERRE, ...mal(3, 'Blau')]], erwartet: true },
    { fall: 'D41: auch getrennte Gruppen derselben Farbe zählen zusammen', schlangen: [['Blau', 'Rot', 'Blau', 'Blau', 'Gelb', 'Blau', 'Grün', 'Blau']], erwartet: true },
    { fall: 'mit Blockade statt der fünften Karte: die Blockade zählt nicht', schlangen: [[...mal(4, 'Blau'), SPERRE]], erwartet: false },
    { fall: 'über zwei Schlangen: drei und zwei blaue Karten in verschiedenen Schlangen erfüllen nicht', schlangen: [mal(3, 'Blau'), mal(2, 'Blau')], erwartet: false },
    { fall: 'über zwei Schlangen: es genügt, wenn eine der beiden Schlangen fünf hat', schlangen: [mal(2, 'Rot'), mal(5, 'Grün')], erwartet: true },
    { fall: 'fünf blaue Karten in der Schlange des Gegners zählen nicht für Spieler 1', schlangen: [mal(2, 'Blau')], gegner: [mal(5, 'Blau')], erwartet: false },
  ]
  pruefeTabelle('A9/D41', farbkombination, tabelle)
})
