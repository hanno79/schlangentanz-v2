import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zum Legen (E5): Farbkarte in eine gegnerische Schlange (A5, D9, D10,
D19), Regenbogenschlange in die eigene und in eine fremde Schlange (A7.3) und
A6 Beispiel 1 mit der Schlangenblockade (A7.5). Der Stapel ist mit fester Saat
gemischt; nur Hände und Schlangen, auf die es ankommt, sind fest gewählt.
*/

function gemischt(spielerzahl: number, saat: number): Baukasten {
  return baukasten({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
}

export const LEGEN_SZENARIEN: readonly Szenario[] = [
  {
    name: 'farbkarte-beim-gegner',
    beschreibung:
      'D9, D19, D10: Zwei Spieler. Spieler 1 ist am Zug, hält Rot, Blau, Gelb, Violett und Braun und hat schon zwei Schlangen (schlange-1: Blau, schlange-2: Gelb). KI-Gegner 1 hat schlange-3 mit Rot, Rot und hält einen Farbenschutz.',
    erwartet:
      '30 Knöpfe FarbkarteLegen: jede der fünf Farbkarten an „anfang“ und „ende“ von schlange-1, schlange-2 und schlange-3; keine „neue Schlange“, weil Spieler 1 schon zwei hat (A5). Klick auf Rot → schlange-3 ende: nur das Ereignis KarteGespielt „→ schlange-3 von KI-Gegner 1, Stelle 2“, kein KarteAngesagt und keine Abwehrfrage, obwohl KI-Gegner 1 Farbenschutz hält (D10); es entscheidet weiter Spieler 1. schlange-3 ist Rot, Rot, Rot; in der Wertung hat KI-Gegner 1 eine Gruppe Rot×3 = 3, Spieler 1 bekommt dafür nichts.',
    erzeuge: () =>
      gemischt(2, 51)
        .hand(0, ['Rot', 'Blau', 'Gelb', 'Violett', 'Braun'])
        .hand(1, ['Farbenschutz', 'Blau', 'Gelb', 'Grün', 'Braun'])
        .schlange(0, ['Blau'])
        .schlange(0, ['Gelb'])
        .schlange(1, ['Rot', 'Rot'])
        .zustand(),
  },
  {
    name: 'regenbogen',
    beschreibung:
      'A7.3, D9, D10, D16: Drei Spieler. Spieler 1 ist am Zug, hält eine Regenbogenschlange und vier Farbkarten und hat schlange-1 mit Rot, Rot, Braun, Braun (A7.3 Beispiel 3 ohne Joker). KI-Gegner 1 hat schlange-2 mit Gelb, Gelb und hält einen Farbenschutz; KI-Gegner 2 hat keine Schlange.',
    erwartet:
      '8 Knöpfe RegenbogenschlangeLegen: schlange-1 Stelle 0 bis 4 und schlange-2 Stelle 0 bis 2, keiner für KI-Gegner 2 (eine neue Schlange beginnt sie nicht, D16). Weg 1, schlange-1 Stelle 2: nur KarteGespielt „→ schlange-1 von Spieler 1, Stelle 2“, niemand wird gefragt; schlange-1 ist Rot, Rot, Regenbogenschlange, Braun, Braun und bringt 4 Punkte (Joker als Braun); danach nur FarbkarteLegen und ZugBeenden. Weg 2 (Szenario neu laden), schlange-2 Stelle 2: KarteAngesagt (trifft KI-Gegner 1) und AbwehrGefragt; KI-Gegner 1 hat „abwehren mit Farbenschutz“ und „durchlassen“. Abwehren: Abgewehrt, AnsageEntschieden ohne Wirkung → Ablagestapel von Spieler 1, schlange-2 bleibt Gelb, Gelb. Durchlassen: AnsageEntschieden → schlange-2 von KI-Gegner 1, Stelle 2; Gelb, Gelb, Regenbogenschlange bringt KI-Gegner 1 2 Punkte (D9).',
    erzeuge: () =>
      gemischt(3, 52)
        .hand(0, ['Regenbogenschlange', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Violett', 'Braun'])
        .hand(2, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .schlange(0, ['Rot', 'Rot', 'Braun', 'Braun'])
        .schlange(1, ['Gelb', 'Gelb'])
        .zustand(),
  },
  {
    name: 'blockade-abwehr',
    beschreibung:
      'A6 Beispiel 1, A7.5: Drei Spieler. Spieler 1 (A) ist am Zug, hält zwei Schlangenblockaden, Blau, Rot, Gelb und hat schlange-1 mit Blau, Blau. KI-Gegner 1 (B) hat schlange-2 mit Rot, Rot, Rot (A7.5 Beispiel) und hält einen Farbenschutz; KI-Gegner 2 hat schlange-3 mit Gelb.',
    erwartet:
      '18 Knöpfe BlockadeLegen: jede der zwei Blockaden an schlange-1 Stelle 0 bis 2, schlange-2 Stelle 0 bis 3 und schlange-3 Stelle 0 bis 1, auch an die Enden und in die eigene Schlange. Klick auf die erste Blockade → schlange-2 Stelle 1: KarteAngesagt (trifft KI-Gegner 1) und AbwehrGefragt. Abwehren: Abgewehrt, AnsageEntschieden ohne Wirkung → Ablagestapel von Spieler 1; der Farbenschutz liegt auf dem Ablagestapel von KI-Gegner 1, er hält 4 Karten; schlange-2 bleibt Rot, Rot, Rot. Spieler 1 hat danach nur FarbkarteLegen und ZugBeenden: Die Blockade lässt sich nicht gegen KI-Gegner 2 richten, auch die zweite nicht. ZugBeenden: KartenGezogen (Spieler 1 zieht 1), ZugBegonnen (KI-Gegner 1), KartenGezogen (KI-Gegner 1 zieht 1). Durchlassen statt Abwehren (Szenario neu laden): schlange-2 wird Rot, Schlangenblockade, Rot, Rot und bringt 0 Punkte.',
    erzeuge: () =>
      gemischt(3, 53)
        .hand(0, ['Schlangenblockade', 'Schlangenblockade', 'Blau', 'Rot', 'Gelb'])
        .hand(1, ['Farbenschutz', 'Blau', 'Gelb', 'Violett', 'Braun'])
        .hand(2, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .schlange(0, ['Blau', 'Blau'])
        .schlange(1, ['Rot', 'Rot', 'Rot'])
        .schlange(2, ['Gelb'])
        .zustand(),
  },
]
