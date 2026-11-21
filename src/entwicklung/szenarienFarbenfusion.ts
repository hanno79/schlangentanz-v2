import { baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zur Farbenfusion (E7): in die eigene Schlange (A7.7, Beispiel 1) und
in die Schlangen der Mitspieler, dort abwehrbar (D9, D10). Die Knöpfe
„FusionLegen“ tragen dieselbe Beschriftung; welches Paar ein Knopf meint, steht
in seinem Tooltip (`schlangenId`, `kartenIds`). Die Erwartung nennt sie deshalb
in der Reihenfolge, in der die Engine sie aufzählt.
*/

export const FARBENFUSION_SZENARIEN: readonly Szenario[] = [
  {
    name: 'fusion-eigen',
    beschreibung:
      'A7.7 Beispiel 1: Zwei Spieler. Spieler 1 ist am Zug, hält zwei Farbenfusionen, Rot, Grün und Violett und hat die Schlange Blau, Blau, Gelb, Gelb. KI-Gegner 1 hält einen Farbenschutz und hat die Schlange Rot, Gelb (kein Paar).',
    erwartet:
      'Vier Knöpfe FusionLegen, je Farbenfusion zwei: auf die beiden Blau und auf die beiden Gelb von schlange-1 (Tooltip: kartenIds). Kein SonderkarteWirkungslosAblegen für die Fusionen, sie haben ein Ziel (D25). Nach dem zweiten Knopf (die beiden Gelb): ein Ereignis KarteGespielt (Farbenfusion → Schlange von Spieler 1, Stelle 2), keine Frage an KI-Gegner 1, obwohl er Farbenschutz hält (A6). schlange-1 zeigt Blau, Blau, Farbenfusion, darunter „Unter farbenfusion-…“ mit den beiden Gelb. Danach kein FusionLegen mehr (A7.7, je Zug eine), nur FarbkarteLegen und ZugBeenden; in der Lage steht beim Zug „Farbenfusion“. Die Wertung von Spieler 1 nennt eine Gruppe Blau×3 mit 4 Punkten: die Fusion zählt als Blau und bringt die 2 Punkte der beiden Gelb.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(31) })
        .hand(0, ['Farbenfusion', 'Farbenfusion', 'Rot', 'Grün', 'Violett'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Braun'])
        .schlange(0, ['Blau', 'Blau', 'Gelb', 'Gelb'])
        .schlange(1, ['Rot', 'Gelb'])
        .zustand(),
  },
  {
    name: 'fusion-beim-gegner',
    beschreibung:
      'D9, D10: Drei Spieler. Spieler 1 ist am Zug, hält eine Farbenfusion und hat keine Schlange. KI-Gegner 1 hat die Dreiergruppe Rot, Rot, Rot (3 Punkte) und hält einen Farbenschutz; KI-Gegner 2 hat die Schlange Gelb, Gelb, Blau und hält keinen.',
    erwartet:
      'Drei Knöpfe FusionLegen: zweimal in schlange-1 von KI-Gegner 1 (Rot 1 und 2, Rot 2 und 3), einmal in schlange-2 von KI-Gegner 2 (die beiden Gelb). Nach dem ersten: KarteAngesagt (betroffen nur KI-Gegner 1) und AbwehrGefragt; es entscheidet KI-Gegner 1 mit „Reagieren: abwehren mit Farbenschutz“ und „Reagieren: durchlassen“. Abwehren: Abgewehrt und AnsageEntschieden ohne Wirkung; die Farbenfusion liegt auf dem Ablagestapel von Spieler 1, der Farbenschutz auf dem von KI-Gegner 1, die Schlange bleibt Rot, Rot, Rot mit 3 Punkten. Durchlassen (Szenario neu laden): AnsageEntschieden (wirkt, Schlange von KI-Gegner 1, Stelle 0); schlange-1 zeigt Farbenfusion, Rot, darunter die beiden Rot, und die Wertung von KI-Gegner 1 hat keine Gruppe mehr (0 Punkte, die Fusion braucht zwei weitere Karten, D30). Mit dem dritten Knopf wird nur KI-Gegner 2 gefragt; ohne Farbenschutz hat er nur „Reagieren: durchlassen“ (D33), danach zeigt schlange-2 Farbenfusion, Blau.',
    erzeuge: () =>
      baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(32) })
        .hand(0, ['Farbenfusion', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .hand(1, ['Farbenschutz', 'Blau', 'Gelb', 'Violett', 'Braun'])
        .hand(2, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .schlange(1, ['Rot', 'Rot', 'Rot'])
        .schlange(2, ['Gelb', 'Gelb', 'Blau'])
        .zustand(),
  },
]
