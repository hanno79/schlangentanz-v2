import { baukasten } from '../engine/testing/szenario'
import type { Kartenwahl } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien für den Schlangenkorb des Glücks (X6, A7.10, D42 bis D47, D54).
Spieler 1 hält den Korb; die Knöpfe „SchlangenkorbSpielen“ nennen den Bonus
(ziehen, tauschen, entfernen, aktionen) und sein Ziel. Unter /spiel spielt
der Mensch den Korb mit Karte, Bonus und Ziel (O10).
*/

const GEGNER: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']

function tisch(saat: number) {
  return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) })
}

export const KORB_SZENARIEN: readonly Szenario[] = [
  {
    name: 'korb-ziehen',
    beschreibung:
      'X6, A7.10, D43: Zwei Spieler. Spieler 1 hält den Schlangenkorb und Blau und hat die Schlange Grün. Oben auf dem Nachziehstapel liegen Verdoppler, Rot und Gelb.',
    erwartet:
      'Angeboten sind die Boni ziehen, tauschen (Blau gegen Grün) und aktionen; entfernen nicht, weil nirgends eine passende Sonderkarte liegt. Mit „ziehen“ hält Spieler 1 Blau, Verdoppler, Rot und Gelb; der Korb steht unter „Aus dem Spiel“, die Lage nennt zwei Zusatzaktionen „Schlangenkorb“ nur für die drei gezogenen Karten und „in dieser Runde: Schlangenkorb“. Der Verdoppler hat nur „SonderkarteWirkungslosAblegen“ (D43, D47). Spieler 1 legt Blau, Rot und Gelb an (drei Farbkarten); danach ist keine Handkarte mehr spielbar, angeboten sind „Zug beenden“ und die Risiko-Karten aus der Auslage.',
    erzeuge: () =>
      tisch(601).hand(0, ['Schlangenkorb des Glücks', 'Blau']).hand(1, GEGNER).schlange(0, ['Grün']).stapelOben(['Verdoppler', 'Rot', 'Gelb']).zustand(),
  },
  {
    name: 'korb-tauschen',
    beschreibung: 'X6, A7.10, D44: Spieler 1 hält den Schlangenkorb, Gelb und Grün und hat die Schlange Blau, Rot, Blau.',
    erwartet:
      'Für „tauschen“ gibt es 12 Knöpfe: jede der drei Farbkarten der Schlange gegen Gelb oder Grün einzeln und jedes Paar aus zwei Schlangenkarten. Mit „Rot gegen Gelb“ liegt Gelb an der Stelle von Rot, Rot auf der Hand (2 Handkarten), der Korb aus dem Spiel; niemand wird gefragt. KartenVersetzt nennt Gelb mit Id und die Karte zur Hand nur als „verdeckte Karte“.',
    erzeuge: () => tisch(602).hand(0, ['Schlangenkorb des Glücks', 'Gelb', 'Grün']).hand(1, GEGNER).schlange(0, ['Blau', 'Rot', 'Blau']).zustand(),
  },
  {
    name: 'korb-entfernen',
    beschreibung:
      'X6, A7.10, D45, D10: Spieler 1 hält den Schlangenkorb und Blau, seine Schlange ist Rot, Schlangenblockade, Rot. KI-Gegner 1 hält einen Farbenschutz und hat die Schlange Grün, Regenbogenschlange, Farbenfusion aus Gelb und Gelb.',
    erwartet:
      'Für „entfernen“ gibt es drei Knöpfe: die eigene Blockade, die Regenbogenschlange und die Farbenfusion des Gegners; Grün nicht. Die eigene Blockade kommt ohne Frage auf den Ablagestapel von Spieler 1. Beim Gegner wird die Karte angesagt, KI-Gegner 1 entscheidet (abwehren oder durchlassen). Lässt er die Farbenfusion durch, liegen die beiden Gelb wieder einzeln an ihrer Stelle und die Fusion auf dem Ablagestapel von Spieler 1. Wehrt er ab, bleibt alles liegen, sein Farbenschutz kommt auf seinen Ablagestapel, und der Korb steht trotzdem unter „Aus dem Spiel“, nicht auf einem Ablagestapel (D54).',
    erzeuge: () =>
      tisch(603)
        .hand(0, ['Schlangenkorb des Glücks', 'Blau'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .schlange(0, ['Rot', 'Schlangenblockade', 'Rot'])
        .schlange(1, ['Grün', 'Regenbogenschlange', { fusion: ['Gelb', 'Gelb'] }])
        .zustand(),
  },
  {
    name: 'korb-aktionen',
    beschreibung:
      'X6, A7.10, D46, D49: Spieler 1 hält sieben Karten, wie nach einer früheren Belohnung: Schlangenkorb, Blau, Rot, Gelb, zwei Farbenfusionen und einen Verdoppler. Seine Schlange ist Grün, Grün, Braun, Braun.',
    erwartet:
      'Mit „aktionen“ zeigt die Lage zwei Zusatzaktionen „Schlangenkorb“ für Farbkarte, Sonderkarte und „Zwei Karten abwerfen, drei ziehen“. Der Verdoppler hat nur „SonderkarteWirkungslosAblegen“ (D46, D47). Blau, Rot und Gelb lassen sich nacheinander anlegen (drei Farbkarten). Nach einer Farbenfusion auf Grün-Grün hat die zweite nur „SonderkarteWirkungslosAblegen“ (D56). Ein Knopf „ZweiAbwerfenDreiZiehen“ legt die zwei genannten Karten auf den Ablagestapel und zieht drei (KartenAbgeworfen, KartenGezogen).',
    erzeuge: () =>
      tisch(604)
        .hand(0, ['Schlangenkorb des Glücks', 'Blau', 'Rot', 'Gelb', 'Farbenfusion', 'Farbenfusion', 'Verdoppler'])
        .hand(1, GEGNER)
        .schlange(0, ['Grün', 'Grün', 'Braun', 'Braun'])
        .zustand(),
  },
  {
    name: 'korb-letzte-karten',
    beschreibung: 'X6, D43, D57, A10: Spieler 1 hält den Schlangenkorb und Blau; im Nachziehstapel liegen nur noch Rot und Gelb.',
    erwartet:
      'Mit „ziehen“ zieht Spieler 1 die beiden letzten Karten; Ereignis SchlussrundeBegonnen „ausgelöst von Spieler 1“. Er darf Rot und Gelb noch im selben Zug spielen (D57) und beendet ohne Nachziehen; danach hat KI-Gegner 1 einen letzten Zug, dann ist die Partie beendet.',
    erzeuge: () => tisch(605).hand(0, ['Schlangenkorb des Glücks', 'Blau']).hand(1, GEGNER).stapelOben(['Rot', 'Gelb']).stapelBehalten(2).zustand(),
  },
  {
    name: 'korb-allein',
    beschreibung:
      'O10 (Vorrang aus der Prüfung von X6), A7.10, D25: Spieler 1 hält nur den Schlangenkorb. Der Nachziehstapel ist leer, die Schlussrunde läuft; Spieler 1 hat eine Schlange Rot, Gelb.',
    erwartet:
      'Für den Korb gibt es „ziehen“, „tauschen“ fehlt (keine Farbkarte auf der Hand), „entfernen“ fehlt (keine Sonderkarte), dazu „aktionen“; kein „SonderkarteWirkungslosAblegen“, weil der Korb Ziele hat (D25), und kein „Zug beenden“, solange keine Karte gespielt ist. Unter /spiel ist der Korb in der Hand spielbar, die Boni stehen als Knöpfe in der Zugleiste; mit „Zwei zusätzliche Aktionen“ und „Ausführen“ ist der Korb aus dem Spiel, danach ist „Zug beenden“ bedienbar.',
    erzeuge: () => tisch(607).hand(0, ['Schlangenkorb des Glücks']).hand(1, GEGNER).schlange(0, ['Rot', 'Gelb']).schlussrunde(1).amZug(0).zustand(),
  },
  {
    name: 'korb-zweiter-zug',
    beschreibung: 'X6, D47, A7.8: Spieler 1 spielt den zweiten Zug nach einem Verdoppler. Er hält den Schlangenkorb und Blau; seine Schlange ist Rot, Schlangenblockade.',
    erwartet:
      'Lage: Teilzug 2, „in dieser Runde: Verdoppler“. Für den Korb gibt es nur „tauschen“ (Blau gegen Rot) und „entfernen“ (die eigene Blockade); „ziehen“ und „aktionen“ fehlen, weil sie den Zug erweitern würden (D47).',
    erzeuge: () => tisch(606).hand(0, ['Schlangenkorb des Glücks', 'Blau']).hand(1, GEGNER).schlange(0, ['Rot', 'Schlangenblockade']).amZug(0, 2).zustand(),
  },
]
