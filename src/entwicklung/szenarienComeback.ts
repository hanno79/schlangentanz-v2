import { setzeComebackEin } from '../engine/erweiterung/comeback'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten, Kartenwahl } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien der Comeback-Karte (X4, A8.1). Jedes beginnt am Anfang des Zuges von
Spieler 1: Die Bedingung stellt der Baukasten so fest, wie die Engine es zu
Beginn eines Zuges tut (`zugbeginn`, D48). KI-Gegner 1 hat die lange Schlange.
*/

const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']

/** Zwei Spieler mit Erweiterung; Spieler 1 hält `hand` und hat die Schlange Grün, KI-Gegner 1 eine aus `fremde` Karten. */
function tisch(saat: number, hand: Kartenwahl[], fremde: number): Baukasten {
  const farben: Kartenwahl[] = ['Rot', 'Rot', 'Blau', 'Blau', 'Gelb', 'Gelb']
  return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) })
    .hand(0, hand)
    .hand(1, FUENF)
    .schlange(0, ['Grün'])
    .schlange(1, farben.slice(0, fremde))
}

export const COMEBACK_SZENARIEN: readonly Szenario[] = [
  {
    name: 'comeback-bedingung',
    beschreibung:
      'X4, A8.1, D46, D47: Zwei Spieler mit Erweiterung. Spieler 1 hat die Schlange Grün (1 Karte), KI-Gegner 1 eine mit 6 Karten: 5 Karten Rückstand zu Zugbeginn. Spieler 1 hält Blau, Rot, Gelb, Schlangenblockade und Verdoppler.',
    erwartet:
      'Am Zug: „Comeback-Bedingung zu Zugbeginn erfüllt (A8.1, D48)“; unter den Knöpfen „ComebackEinsetzen: Comeback-Karte (comeback-01)“, offen vor Spieler 1 die Comeback-Karte ohne „(verbraucht)“. Nach dem Klick: Ereignis „ComebackEingesetzt: Spieler 1 dreht comeback-01 um, zwei Zusatzaktionen“, die Karte steht als „(verbraucht)“ da, Zusatzaktionen zweimal „Comeback: Farbkarte/Sonderkarte/Zwei Karten abwerfen, drei ziehen“, „in dieser Runde: Comeback“. Der Verdoppler hat nur noch „SonderkarteWirkungslosAblegen“ (D47). Spieler 1 legt Blau, Rot und Gelb an und spielt die Schlangenblockade: drei Farbkarten und eine Sonderkarte, dann bleibt nur „Zug beenden“. Danach beginnt KI-Gegner 1 ohne Zusatzaktionen; seine Bedingung ist nicht erfüllt.',
    erzeuge: () => tisch(401, ['Blau', 'Rot', 'Gelb', 'Schlangenblockade', 'Verdoppler'], 6).zugbeginn().zustand(),
  },
  {
    name: 'comeback-rueckstand-4',
    beschreibung: 'X4, A8.1: wie „comeback-bedingung“, aber KI-Gegner 1 hat nur 5 Karten in der Schlange: 4 Karten Rückstand.',
    erwartet:
      'Am Zug: „Comeback-Bedingung zu Zugbeginn nicht erfüllt (A8.1, D48)“; kein Knopf „ComebackEinsetzen“. Legt Spieler 1 Blau an die Schlange von KI-Gegner 1 (dann 6 Karten, 5 Rückstand), erscheint der Knopf trotzdem nicht: Die Bedingung gilt so, wie sie zu Zugbeginn war.',
    erzeuge: () => tisch(402, ['Blau', 'Rot', 'Gelb', 'Schlangenblockade', 'Verdoppler'], 5).zugbeginn().zustand(),
  },
  {
    name: 'comeback-abwerfen-ziehen',
    beschreibung: 'X4, A8.1, D49: Spieler 1 hält fünf Farbkarten und liegt 5 Karten zurück.',
    erwartet:
      'Nach „ComebackEinsetzen“ zehn Knöpfe „ZweiAbwerfenDreiZiehen“, je einer für jedes Paar von Handkarten. Ein Klick: Ereignisse „KartenAbgeworfen: Spieler 1 legt … ab“ mit den zwei Karten (sie liegen offen auf seinem Ablagestapel) und „KartenGezogen: Spieler 1 zieht 3“; er hält 6 Karten, kein Ereignis nennt eine gezogene Karte. Ein zweiter Klick geht noch (7 Karten), dann gibt es keinen Knopf „ZweiAbwerfenDreiZiehen“ mehr und auch kein „Zug beenden“, bis er eine Karte spielt (das Abwerfen zählt nicht als Karte des Zuges). Eine Farb- und eine Sonderkarte bleiben ihm.',
    erzeuge: () => tisch(403, FUENF, 6).zugbeginn().zustand(),
  },
  {
    name: 'comeback-letzte-karte',
    beschreibung:
      'X4, A8.1, D49, D57, A10: wie „comeback-abwerfen-ziehen“, aber Spieler 1 hat seine Comeback-Karte schon eingesetzt (verbraucht, zwei Zusatzaktionen), und im Nachziehstapel liegen nur noch zwei violette Karten.',
    erwartet:
      'Zehn Knöpfe „ZweiAbwerfenDreiZiehen“, kein „ComebackEinsetzen“. Nach einem „ZweiAbwerfenDreiZiehen“: Ereignisse KartenAbgeworfen, „KartenGezogen: Spieler 1 zieht 2“ und „SchlussrundeBegonnen: ausgelöst von Spieler 1“; Partiephase Schlussrunde, kein weiterer Knopf zum Abwerfen (D49). Spieler 1 spielt beide violetten Karten im selben Zug (D57) und beendet den Zug ohne Nachziehen. KI-Gegner 1 hat genau einen letzten Zug; nach seinem „Zug beenden“ ist die Partie beendet.',
    erzeuge: () =>
      tisch(404, FUENF, 6)
        .stapelOben(['Violett', 'Violett'])
        .stapelBehalten(2)
        .zugbeginn()
        // Die Comeback-Karte ist schon eingesetzt, so wie es der Knopf „ComebackEinsetzen“ täte.
        .aendere((zustand) => setzeComebackEin(zustand, 0, []))
        .zustand(),
  },
  {
    name: 'comeback-verdoppler',
    beschreibung: 'X4, A8.1, D47, D48: Spieler 1 liegt 5 Karten zurück und hält einen Verdoppler, Blau, Rot, Gelb und Braun.',
    erwartet:
      'Zu Beginn sind „ComebackEinsetzen“ und „VerdopplerSpielen“ beide da. Nach „VerdopplerSpielen“ fehlt „ComebackEinsetzen“ (D47: in dieser Runde wirkt schon der Verdoppler). Nach „Zug beenden“ folgt Teilzug 2 für Spieler 1; auch dort kein „ComebackEinsetzen“ (D48: im zweiten Zug nach einem Verdoppler nie). Setzt man stattdessen zuerst die Comeback-Karte ein, hat der Verdoppler nur noch „SonderkarteWirkungslosAblegen“.',
    erzeuge: () => tisch(405, ['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Braun'], 6).zugbeginn().zustand(),
  },
]
