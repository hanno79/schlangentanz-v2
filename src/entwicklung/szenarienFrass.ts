import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zum Schlangenfrass (E6, A7.4, A6 Beispiel 2, D15). Die Knöpfe
„SchlangenfrassSpielen“ tragen alle dieselbe Beschriftung; welche Option und
welche Karten sie fressen, steht im Tooltip (`data-aktion`). Die Hände sind fest
gewählt, damit klar ist, wer Farbenschutz hält.
*/

function gemischt(spielerzahl: number, saat: number): Baukasten {
  return baukasten({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
}

export const FRASS_SZENARIEN: readonly Szenario[] = [
  {
    name: 'frass-eigen',
    beschreibung:
      'A7.4 a) und b): Zwei Spieler. Spieler 1 hat die Schlange Rot, Rot, Schlangenblockade, Rot und hält Schlangenfrass, Blau, Gelb, Violett, Braun. KI-Gegner 1 hat keine Schlange und hält einen Farbenschutz.',
    erwartet:
      'Fünf Knöpfe SchlangenfrassSpielen: viermal Option a) (eigeneKarte, je eine Karte der Schlange, von vorn nach hinten), einmal Option b) (eigeneBlockade auf die Blockade); Option c) gibt es nicht, der Gegner hat keine Schlange. Nach b): nur das Ereignis KarteGespielt (Schlangenfrass → Ablagestapel von Spieler 1), niemand wird gefragt, obwohl KI-Gegner 1 Farbenschutz hält (A6). Die Schlange ist Rot, Rot, Rot; auf dem Ablagestapel von Spieler 1 liegen Schlangenfrass und Schlangenblockade. Danach sind nur noch FarbkarteLegen und ZugBeenden angeboten. Wer statt b) mit a) eine Rot aus der Mitte frisst, sieht die Nachbarn aufschliessen.',
    erzeuge: () =>
      gemischt(2, 61)
        .schlange(0, ['Rot', 'Rot', 'Schlangenblockade', 'Rot'])
        .hand(0, ['Schlangenfrass', 'Blau', 'Gelb', 'Violett', 'Braun'])
        .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .zustand(),
  },
  {
    name: 'frass-zwei-spieler',
    beschreibung:
      'A6 Beispiel 2, A7.4 c), D15: Drei Spieler. Spieler 1 hält einen Schlangenfrass. KI-Gegner 1 hat die Schlange Blau, Blau, Blau und hält einen Farbenschutz, KI-Gegner 2 hat Gelb, Gelb, Gelb und hält keinen.',
    erwartet:
      'Fünfzehn Knöpfe SchlangenfrassSpielen, alle mit Option c) (gegnerischeKarten), je ein Paar aus den sechs Karten. Mit einer Blau und einer Gelb: KarteAngesagt (trifft KI-Gegner 1, KI-Gegner 2), dann AbwehrGefragt an KI-Gegner 1 mit zwei Knöpfen (abwehren, durchlassen), danach AbwehrGefragt an KI-Gegner 2 nur mit „durchlassen“ (D33). Bis beide entschieden haben, liegen alle Karten noch. Wehrt KI-Gegner 1 ab: AnsageEntschieden (wirkt, abgewehrt von KI-Gegner 1); seine drei Blau bleiben, KI-Gegner 2 hat noch Gelb, Gelb. Ablagestapel: Spieler 1 Schlangenfrass und die Gelb, KI-Gegner 1 Farbenschutz. Wählt Spieler 1 stattdessen zwei Blau, wird nur KI-Gegner 1 gefragt, und sein Farbenschutz schützt beide (D15).',
    erzeuge: () =>
      gemischt(3, 62)
        .schlange(1, ['Blau', 'Blau', 'Blau'])
        .schlange(2, ['Gelb', 'Gelb', 'Gelb'])
        .hand(0, ['Schlangenfrass', 'Rot', 'Violett', 'Braun', 'Grün'])
        .hand(1, ['Farbenschutz', 'Rot', 'Violett', 'Braun', 'Grün'])
        .hand(2, ['Rot', 'Violett', 'Braun', 'Grün', 'Rot'])
        .zustand(),
  },
  {
    name: 'frass-fusion',
    beschreibung:
      'A7.4, A7.7: Zwei Spieler. Spieler 1 hat die Schlange Blau, Farbenfusion (auf Gelb, Gelb), Blau und hält einen Schlangenfrass. KI-Gegner 1 hat Rot, Rot, Farbenfusion (auf Grün, Grün) und hält keinen Farbenschutz.',
    erwartet:
      'Drei Knöpfe Option a) für die eigenen Karten und drei Knöpfe Option c) für die Paare beim Gegner. Option a) auf die eigene Farbenfusion: KarteGespielt (Schlangenfrass → Ablagestapel von Spieler 1); die Schlange ist danach Blau, Gelb, Gelb, Blau ohne Fusion, auf dem Ablagestapel liegen Schlangenfrass und Farbenfusion. Option c) auf Rot und die gegnerische Farbenfusion: KarteAngesagt, AbwehrGefragt an KI-Gegner 1 (nur durchlassen), dann AnsageEntschieden; seine Schlange ist Rot, Grün, Grün, auf dem Ablagestapel von Spieler 1 liegen Schlangenfrass, Rot und Farbenfusion. Die Karten unter einer gefressenen Fusion liegen also wieder einzeln an ihrer Stelle.',
    erzeuge: () =>
      gemischt(2, 63)
        .schlange(0, ['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Blau'])
        .schlange(1, ['Rot', 'Rot', { fusion: ['Grün', 'Grün'] }])
        .hand(0, ['Schlangenfrass', 'Rot', 'Violett', 'Braun', 'Gelb'])
        .hand(1, ['Blau', 'Rot', 'Violett', 'Braun', 'Gelb'])
        .zustand(),
  },
]
