import { baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zum Farbendieb (E8, A7.1, D2, D17). Die Knöpfe „FarbendiebSpielen“
tragen alle dieselbe Beschriftung; welche Karte wohin geht, steht im Tooltip
und in `data-aktion` (`quelle.karteId`, `ziel`).
*/

export const FARBENDIEB_SZENARIEN: readonly Szenario[] = [
  {
    name: 'farbendieb',
    beschreibung:
      'A7.1 Beispiel: Zwei Spieler. Spieler 1 hält einen Farbendieb und hat eine Schlange Gelb, Gelb; KI-Gegner 1 hat eine Schlange Blau, Gelb und keinen Farbenschutz.',
    erwartet:
      'Sechs Knöpfe FarbendiebSpielen: jede der beiden Farbkarten von KI-Gegner 1 an Stelle 0, 1 oder 2 der eigenen Schlange; eine neue Schlange ist nicht angeboten (D17), wirkungslos ablegen auch nicht (D25). Nach dem Knopf mit dem Gelb von KI-Gegner 1 an Stelle 2: Ereignisse KarteAngesagt (trifft KI-Gegner 1) und AbwehrGefragt; KI-Gegner 1 hat nur „Reagieren: durchlassen“ (D33). Danach AnsageEntschieden (wirkt, niemand hat abgewehrt, Ablagestapel von Spieler 1). Spieler 1 hat jetzt Gelb, Gelb, Gelb (Zwischenstand 3 Punkte), KI-Gegner 1 nur noch Blau; der Farbendieb liegt auf dem Ablagestapel von Spieler 1. Angeboten sind danach nur noch FarbkarteLegen und ZugBeenden.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(81) })
        .hand(0, ['Farbendieb', 'Blau', 'Rot', 'Grün', 'Violett'])
        .hand(1, ['Rot', 'Rot', 'Braun', 'Violett', 'Grün'])
        .schlange(0, ['Gelb', 'Gelb'])
        .schlange(1, ['Blau', 'Gelb'])
        .zustand(),
  },
  {
    name: 'farbendieb-abwehr',
    beschreibung:
      'A7.1, A7.2, D17: Drei Spieler. Spieler 1 hält einen Farbendieb und hat keine Schlange. KI-Gegner 1 hat Grün, Grün, Grün und hält einen Farbenschutz; KI-Gegner 2 hat eine Schlange mit nur einem Blau und keinen Farbenschutz.',
    erwartet:
      'Vier Knöpfe FarbendiebSpielen, je eine Farbkarte der Gegner, Ziel immer „neueSchlange“ (D17, F4). Nach dem Knopf mit dem ersten Grün: KI-Gegner 1 entscheidet mit „Reagieren: abwehren mit Farbenschutz“ und „Reagieren: durchlassen“. Abwehren: Abgewehrt und AnsageEntschieden (ohne Wirkung, Ablagestapel von Spieler 1); die grüne Dreiergruppe bleibt, Spieler 1 hat weiter keine Schlange, der Farbenschutz liegt auf dem Ablagestapel von KI-Gegner 1, der 4 Karten hält und nicht nachzieht. Durchlassen statt dessen: Spieler 1 hat eine neue Schlange mit dem Grün, KI-Gegner 1 nur noch Grün, Grün. Mit dem Knopf für das Blau von KI-Gegner 2 und durchlassen verschwindet dessen Schlange (letzte Karte).',
    erzeuge: () =>
      baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(82) })
        .hand(0, ['Farbendieb', 'Blau', 'Rot', 'Gelb', 'Violett'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Braun'])
        .hand(2, ['Rot', 'Gelb', 'Blau', 'Braun', 'Violett'])
        .schlange(1, ['Grün', 'Grün', 'Grün'])
        .schlange(2, ['Blau'])
        .zustand(),
  },
]
