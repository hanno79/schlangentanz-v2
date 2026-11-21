import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zur soliden KI (Plan K2, Kriterien 1 bis 6, Vorgaben des Autors zu
Kriterium 5). In jedem ist KI-Gegner 1 am Zug; man klickt „KI-Schritt (solide)“,
bis Spieler 1 wieder dran ist, und liest im Verlauf ab, was sie gespielt hat.
Die übrigen Handkarten kommen gemischt mit fester Saat von oben.
*/

/** Ein Tisch ohne Erweiterung, gemischt mit dieser Saat. */
function gemischt(spielerzahl: number, saat: number): Baukasten {
  return baukasten({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
}

export const KI_SZENARIEN: readonly Szenario[] = [
  {
    name: 'ki-dreiergruppe',
    beschreibung:
      'K2, Kriterium 1: KI-Gegner 1 ist am Zug und hat eine Schlange Violett, Violett. Auf der Hand hält er ein Violett, dazu Blau, Rot, Gelb und einen Farbenschutz.',
    erwartet:
      'Der erste „KI-Schritt (solide)“ legt das Violett an ein Ende seiner Schlange: Violett, Violett, Violett, eine Gruppe mit 6 Punkten. Danach beendet er den Zug; den Farbenschutz legt er nicht wirkungslos ab.',
    erzeuge: () =>
      gemischt(2, 201)
        .schlange(1, ['Violett', 'Violett'])
        .schlange(0, ['Braun'])
        .hand(1, ['Violett', 'Blau', 'Rot', 'Gelb', 'Farbenschutz'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-dreiergruppe-joker',
    beschreibung:
      'K2, Kriterium 1: KI-Gegner 1 ist am Zug und hat eine Schlange Grün, Grün. Ein Grün hält er nicht, wohl aber eine Regenbogenschlange, dazu Blau, Rot, Gelb und Braun.',
    erwartet:
      'Er legt die Regenbogenschlange vor oder hinter die beiden grünen Karten: eine grüne Dreiergruppe mit 6 Punkten (die Regenbogenschlange bringt selbst keinen Punkt, A7.3). Eine Farbkarte darf er im selben Zug zusätzlich legen.',
    erzeuge: () =>
      gemischt(2, 202)
        .schlange(1, ['Grün', 'Grün'])
        .schlange(0, ['Braun'])
        .hand(1, ['Regenbogenschlange', 'Blau', 'Rot', 'Gelb', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-farbe-und-sonderkarte',
    beschreibung:
      'K2, Kriterium 2: KI-Gegner 1 hat zwei Schlangen, Blau, Blau und Braun, Braun. Auf der Hand hält er ein Blau und eine Regenbogenschlange, dazu Rot, Gelb und Grün.',
    erwartet:
      'In einem Zug spielt er beide Karten, in beliebiger Reihenfolge: das Blau an die blaue Schlange (Gruppe mit 3 Punkten) und die Regenbogenschlange an die braune (Gruppe mit 4 Punkten). Danach steht sein Zwischenstand auf 7.',
    erzeuge: () =>
      gemischt(2, 203)
        .schlange(1, ['Blau', 'Blau'])
        .schlange(1, ['Braun', 'Braun'])
        .schlange(0, ['Gelb'])
        .hand(1, ['Blau', 'Regenbogenschlange', 'Rot', 'Gelb', 'Grün'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-regenbogen-eigene',
    beschreibung:
      'K2, Kriterium 3: KI-Gegner 1 hat eine Schlange aus vier roten Karten, Spieler 1 eine aus fünf grünen. Eine Regenbogenschlange mitten in die grüne Reihe würde dort die längste Farbkette unterbrechen. KI-Gegner 1 hält die Regenbogenschlange, Blau, Gelb, Braun und Violett.',
    erwartet:
      'Er legt die Regenbogenschlange nicht in die Schlange von Spieler 1: Unter den Knöpfen „RegenbogenschlangeLegen“ gibt es solche mit schlange-2 (Spieler 1), gewählt wird keiner davon. Entweder legt er sie in seine eigene Schlange oder behält sie.',
    erzeuge: () =>
      gemischt(2, 204)
        .schlange(1, ['Rot', 'Rot', 'Rot', 'Rot'])
        .schlange(0, ['Grün', 'Grün', 'Grün', 'Grün', 'Grün'])
        .hand(1, ['Regenbogenschlange', 'Blau', 'Gelb', 'Braun', 'Violett'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-fusion-senkt',
    beschreibung:
      'K2, Kriterium 4: KI-Gegner 1 hat Blau, Blau, Blau (3 Punkte). Jede Farbenfusion, die er spielen kann, liegt auf zwei seiner blauen Karten; danach wären es nur noch zwei Plätze und 0 Punkte (A7.7, D30). Spieler 1 hat Rot, Gelb, also nichts zu fusionieren.',
    erwartet:
      'Die Engine bietet zwei Knöpfe „FusionLegen“ an; die KI wählt keinen. Sie spielt eine Farbkarte und beendet den Zug, ihre blaue Gruppe bleibt bei 3 Punkten.',
    erzeuge: () =>
      gemischt(2, 205)
        .schlange(1, ['Blau', 'Blau', 'Blau'])
        .schlange(0, ['Rot', 'Gelb'])
        .hand(1, ['Farbenfusion', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-grube-ohne-zug',
    beschreibung:
      'K2, Kriterium 5 (F8a, D29): Schlussrunde zu zweit. Spieler 1 hat die letzte Karte gezogen und seinen Zug gemacht; KI-Gegner 1 spielt seinen letzten Zug. Er hält eine Schlangengrube, ein Blau und drei weitere Karten und hat eine Schlange Blau, Blau.',
    erwartet:
      'Die Engine bietet „SchlangengrubeSpielen“ auf Spieler 1 an, obwohl der keinen Zug mehr hat (D29). Die KI spielt sie nicht: Sie legt das Blau an ihre Schlange (Gruppe mit 3 Punkten), und mit ihrem „Zug beenden“ endet die Partie.',
    erzeuge: () =>
      gemischt(2, 206)
        .schlange(1, ['Blau', 'Blau'])
        .schlange(0, ['Rot', 'Rot', 'Rot'])
        .hand(1, ['Schlangengrube', 'Blau', 'Gelb', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .schlussrunde(0)
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-grube-schlussrunde',
    beschreibung:
      'K2, Kriterium 5 (F8a, D21): Schlussrunde zu dritt, ausgelöst von Spieler 1. KI-Gegner 1 spielt seinen letzten Zug; KI-Gegner 2 hat danach noch einen, Spieler 1 keinen mehr. KI-Gegner 1 hält eine Schlangengrube und vier Farbkarten.',
    erwartet:
      'Spielt KI-Gegner 1 die Schlangengrube, dann auf KI-Gegner 2, der dadurch seinen letzten Zug verliert (D21), nie auf Spieler 1 (D29: dort ohne Wirkung).',
    erzeuge: () =>
      gemischt(3, 207)
        .schlange(1, ['Gelb', 'Gelb'])
        .schlange(2, ['Grün', 'Grün', 'Grün'])
        .hand(1, ['Schlangengrube', 'Rot', 'Blau', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .schlussrunde(0)
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-wirkungslos',
    beschreibung:
      'K2, Kriterium 5: KI-Gegner 1 spielt den zweiten Zug nach einem Verdoppler. Er hält einen Verdoppler, der hier nur wirkungslos abgelegt werden kann (D23), einen Farbenschutz, der immer wirkungslos abgelegt werden darf (D25), und ein Rot zu seiner Schlange Rot, Rot.',
    erwartet:
      'Er legt das Rot an seine Schlange (Gruppe mit 3 Punkten) und beendet den Zug. „SonderkarteWirkungslosAblegen“ wird angeboten, er wählt es nicht.',
    erzeuge: () =>
      gemischt(2, 208)
        .schlange(1, ['Rot', 'Rot'])
        .schlange(0, ['Gelb'])
        .hand(1, ['Verdoppler', 'Farbenschutz', 'Rot', 'Blau', 'Gelb'])
        .haendeAuffuellen()
        .amZug(1, 2)
        .zustand(),
  },
  {
    name: 'ki-verdoppler',
    beschreibung:
      'K2, Kriterium 6: KI-Gegner 1 hat zwei Schlangen, Rot, Rot und Blau, Blau. Er hält einen Verdoppler, ein Rot, ein Blau und zwei Gelb. Oben auf dem Nachziehstapel liegen Violett und Braun.',
    erwartet:
      'Im ersten Zug spielt er den Verdoppler und eine der beiden Farbkarten, die eine Gruppe vollendet, und beendet den Zug: Er zieht Violett und Braun, Teilzug 2 beginnt. Im zweiten Zug vollendet er mit der anderen Farbkarte die zweite Gruppe. Am Ende hat er Rot, Rot, Rot und Blau, Blau, Blau (6 Punkte), dann ist Spieler 1 dran.',
    erzeuge: () =>
      gemischt(2, 209)
        .schlange(1, ['Rot', 'Rot'])
        .schlange(1, ['Blau', 'Blau'])
        .schlange(0, ['Gelb'])
        .hand(1, ['Verdoppler', 'Rot', 'Blau', 'Gelb', 'Gelb'])
        .haendeAuffuellen()
        .stapelOben(['Violett', 'Braun'])
        .amZug(1)
        .zustand(),
  },
]
