import { baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zur Schlangenhäutung (E9, nur mit Erweiterung): ein Abschnitt in der
eigenen Schlange (A7.9, Beispiel 1) und in der Schlange eines Mitspielers, dort
abwehrbar (D9, D10); dazu ein Tisch, an dem es keinen Abschnitt gibt (A7.9,
Beispiel 2, D26). Jeder Knopf „SchlangenhaeutungSpielen“ nennt hinter dem Pfeil
die Schlange und die Karten des Abschnitts in ihrer neuen Folge, Farbkarten mit
Anzeigenamen und Id (`gelb-…`, `rot-…`).
*/

export const HAEUTUNG_SZENARIEN: readonly Szenario[] = [
  {
    name: 'haeutung',
    beschreibung:
      'A7.9 Beispiel 1, D9, D10: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hält eine Schlangenhäutung, Blau, Rot, Gelb und Grün und hat die Schlange Blau, Rot, Gelb, Rot, Gelb. KI-Gegner 1 hält einen Farbenschutz und hat die Schlange Braun, Violett, Braun.',
    erwartet:
      'Kein SonderkarteWirkungslosAblegen für die Häutung (D25). 56 Knöpfe SchlangenhaeutungSpielen: 54 in schlange-1 (jeder Abschnitt von 3 bis 5 Karten, jede neue Farbfolge, nie die bisherige, D26) und 2 in schlange-2. Der Knopf, der hinter „→ schlange-1 ·“ die Karten gelb, gelb, blau, rot, rot nennt (Sonnenblatt (gelb-…), Sonnenblatt (gelb-…), Wasserwirbel (blau-…), Feuerkeim (rot-…), Feuerkeim (rot-…)), wirkt sofort, ohne Frage an KI-Gegner 1: Ereignisse KartenVersetzt (nur die Karten, die ihre Reihenfolge ändern) und KarteGespielt (Schlangenhäutung → Ablagestapel von Spieler 1, Stelle 0); schlange-1 zeigt Gelb, Gelb, Blau, Rot, Rot. Danach kein SchlangenhaeutungSpielen mehr, nur FarbkarteLegen und ZugBeenden. Neu laden, ein Knopf in schlange-2: KarteAngesagt (betroffen KI-Gegner 1) und AbwehrGefragt, er hat „Reagieren: abwehren mit Farbenschutz“ und „Reagieren: durchlassen“. Abwehren: Abgewehrt und AnsageEntschieden ohne Wirkung, schlange-2 bleibt Braun, Violett, Braun, die Häutung liegt auf dem Ablagestapel von Spieler 1, der Farbenschutz auf dem von KI-Gegner 1. Durchlassen: KartenVersetzt und AnsageEntschieden, schlange-2 liegt in der Folge des Knopfes.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(41) })
        .hand(0, ['Schlangenhäutung', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .schlange(0, ['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'])
        .schlange(1, ['Braun', 'Violett', 'Braun'])
        .zustand(),
  },
  {
    name: 'haeutung-nicht-moeglich',
    beschreibung:
      'A7.9 Beispiel 2, D26: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hält eine Schlangenhäutung, Blau, Rot, Gelb und Grün und hat die Schlange Blau, Violett, Schlangenblockade, Grün, Violett. KI-Gegner 1 hat die Schlangen Rot, Rot, Rot (nur eine Farbe) und Gelb, Blau, Regenbogenschlange, Grün, Braun.',
    erwartet:
      'Kein Knopf SchlangenhaeutungSpielen: Die Blockade und die Regenbogenschlange unterbrechen die Abschnitte, nirgends liegen drei Farbkarten verschiedener Farbe in Folge, und Rot, Rot, Rot lässt sich nicht anders ordnen (D26). Angeboten ist „SonderkarteWirkungslosAblegen: Schlangenhäutung …“ (D13); danach liegt die Häutung auf dem Ablagestapel von Spieler 1, alle Schlangen sind unverändert, und es gibt nur noch FarbkarteLegen und ZugBeenden.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(42) })
        .hand(0, ['Schlangenhäutung', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Violett'])
        .schlange(0, ['Blau', 'Violett', 'Schlangenblockade', 'Grün', 'Violett'])
        .schlange(1, ['Rot', 'Rot', 'Rot'])
        .schlange(1, ['Gelb', 'Blau', 'Regenbogenschlange', 'Grün', 'Braun'])
        .zustand(),
  },
]
