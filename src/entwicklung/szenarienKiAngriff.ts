import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zu Angriff und Abwehr der soliden KI (Plan K3, Kriterien 1 bis 5). Bei den
Angriffen ist KI-Gegner 1 am Zug; man klickt „KI-Schritt (solide)“ und liest im
Verlauf ab, wohin seine Karte geht. Bei der Abwehr hat Spieler 1 schon eine Karte
gegen KI-Gegner 1 angesagt; ein Klick zeigt, ob er abwehrt oder durchlässt.
Die übrigen Handkarten kommen gemischt mit fester Saat von oben.
*/

/** Ein Tisch ohne Erweiterung, gemischt mit dieser Saat. */
function gemischt(spielerzahl: number, saat: number): Baukasten {
  return baukasten({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
}

/** Spieler 1 hat eine Schlangenblockade an Stelle `position` der Schlange `schlangenId` von KI-Gegner 1 angesagt; KI-Gegner 1 hält einen Farbenschutz. */
function blockadeAngesagt(bau: Baukasten, schlangenId: string, position: number, hand: Parameters<Baukasten['hand']>[1]): Baukasten {
  return bau
    .hand(1, hand)
    .schwebend(0, 'Schlangenblockade', (karteId, spielerId) => ({ typ: 'BlockadeLegen', spielerId, karteId, schlangenId, position }), [1])
    .haendeAuffuellen()
    .amZug(0)
}

export const KI_ANGRIFF_SZENARIEN: readonly Szenario[] = [
  {
    name: 'ki-frass-blockade',
    beschreibung:
      'K3, Kriterium 1: KI-Gegner 1 hat Grün, Grün, Schlangenblockade, Grün. Spieler 1 hat Rot, Gelb, Blau, also nichts, was sich zu fressen lohnt. KI-Gegner 1 hält einen Schlangenfrass, dazu Rot, Gelb, Violett und Braun.',
    erwartet:
      'Er spielt Schlangenfrass auf seine eigene Blockade (A7.4, Option a oder b, beide entfernen sie): Danach liegt Grün, Grün, Grün, eine Gruppe mit 9 Punkten. Die Schlange von Spieler 1 bleibt, wie sie ist.',
    erzeuge: () =>
      gemischt(2, 301)
        .schlange(1, ['Grün', 'Grün', 'Schlangenblockade', 'Grün'])
        .schlange(0, ['Rot', 'Gelb', 'Blau'])
        .hand(1, ['Schlangenfrass', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-frass-fuehrender',
    beschreibung:
      'K3, Kriterium 1: Drei Spieler. KI-Gegner 1 hat Blau, Blau, Schlangenblockade, Blau; die Blockade zu fressen brächte ihm 3 Punkte. Spieler 1 führt mit Grün, Grün, Grün, Grün (12 Punkte und Kettenbonus), KI-Gegner 2 hat Gelb, Gelb, Gelb. KI-Gegner 1 hält einen Schlangenfrass, dazu Rot, Gelb, Violett und Braun.',
    erwartet:
      'Er spielt Schlangenfrass mit Option c) und frisst zwei grüne Karten aus der Schlange von Spieler 1: Dessen Gruppe ist danach nur noch ein Paar und zählt nichts mehr. Seine eigene Blockade bleibt liegen.',
    erzeuge: () =>
      gemischt(3, 302)
        .schlange(1, ['Blau', 'Blau', 'Schlangenblockade', 'Blau'])
        .schlange(0, ['Grün', 'Grün', 'Grün', 'Grün'])
        .schlange(2, ['Gelb', 'Gelb', 'Gelb'])
        .hand(1, ['Schlangenfrass', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-blockade-fuehrender',
    beschreibung:
      'K3, Kriterien 2 und 5: Drei Spieler. Spieler 1 führt mit Grün, Grün, Grün (9) und Blau, Blau, Blau, Blau (4). KI-Gegner 1 hat Gelb ×5 und damit die längste Kette, KI-Gegner 2 Violett, Violett, Violett (6). KI-Gegner 1 hält eine Schlangenblockade, dazu Rot, Braun, Violett und Blau.',
    erwartet:
      'Er legt die Schlangenblockade mitten in die grüne Gruppe von Spieler 1 (Stelle 1 oder 2 von schlange-2): Spieler 1 verliert 9 Punkte, mehr als mit einer Blockade in der blauen Reihe (4) oder bei KI-Gegner 2 (6).',
    erzeuge: () =>
      gemischt(3, 303)
        .schlange(1, ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb'])
        .schlange(0, ['Grün', 'Grün', 'Grün'])
        .schlange(0, ['Blau', 'Blau', 'Blau', 'Blau'])
        .schlange(2, ['Violett', 'Violett', 'Violett'])
        .hand(1, ['Schlangenblockade', 'Rot', 'Braun', 'Violett', 'Blau'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-farbendieb-fuehrender',
    beschreibung:
      'K3, Kriterium 2: Drei Spieler. Spieler 1 führt mit Grün, Grün, Grün (9) und Braun, Braun, Braun (6). KI-Gegner 1 hat nur Gelb, Rot, KI-Gegner 2 Violett, Violett, Violett. KI-Gegner 1 hält einen Farbendieb, dazu Rot, Blau, Violett und Braun.',
    erwartet:
      'Er stiehlt mit dem Farbendieb eine grüne Karte aus der Gruppe von Spieler 1 (schlange-2) und legt sie in seine Schlange: Der Farbendieb kostet Spieler 1 9 Punkte, mehr als eine braune Karte (6). Die Farbkarte danach wählt er nach seiner Bewertung.',
    erzeuge: () =>
      gemischt(3, 304)
        .schlange(1, ['Gelb', 'Rot'])
        .schlange(0, ['Grün', 'Grün', 'Grün'])
        .schlange(0, ['Braun', 'Braun', 'Braun'])
        .schlange(2, ['Violett', 'Violett', 'Violett'])
        .hand(1, ['Farbendieb', 'Rot', 'Blau', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-farbe-eigene',
    beschreibung:
      'K3, Kriterium 3: KI-Gegner 1 hat Blau, Blau. Spieler 1 hat Rot, Grün, Grün; sein grünes Paar liegt offen am Ende. KI-Gegner 1 hält Blau, Rot, Gelb, Violett und Braun; jede davon könnte das grüne Paar zustellen.',
    erwartet:
      'Er legt das Blau an seine eigene Schlange: Blau, Blau, Blau, eine Gruppe mit 3 Punkten. Keine Farbkarte geht an die Schlange von Spieler 1, denn seine eigene Hand gibt etwas Besseres her.',
    erzeuge: () =>
      gemischt(2, 305)
        .schlange(1, ['Blau', 'Blau'])
        .schlange(0, ['Rot', 'Grün', 'Grün'])
        .hand(1, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-farbe-stoeren',
    beschreibung:
      'K3, Kriterium 3: KI-Gegner 1 hat zwei Schlangen, Rot, Gelb und Blau, Violett, also keine weitere. Er hält fünfmal Braun; an seinen Schlangen bringt Braun nichts. Spieler 1 hat Rot, Grün, Grün mit dem grünen Paar am Ende.',
    erwartet:
      'Er legt ein Braun hinter das grüne Paar von Spieler 1 (schlange-3, Ende): Das Paar kann dort nicht mehr zur Gruppe werden. Weil seine eigene Hand nichts Besseres hergibt, stört er.',
    erzeuge: () =>
      gemischt(2, 306)
        .schlange(1, ['Rot', 'Gelb'])
        .schlange(1, ['Blau', 'Violett'])
        .schlange(0, ['Rot', 'Grün', 'Grün'])
        .hand(1, ['Braun', 'Braun', 'Braun', 'Braun', 'Braun'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'ki-abwehr-dreiergruppe',
    beschreibung:
      'K3, Kriterium 4: Spieler 1 hat eine Schlangenblockade mitten in die Gruppe Grün, Grün, Grün von KI-Gegner 1 angesagt (Stelle 1). KI-Gegner 1 hält einen Farbenschutz und wird gefragt.',
    erwartet:
      'Er wehrt mit dem Farbenschutz ab: Die Blockade geht wirkungslos auf den Ablagestapel von Spieler 1, die grüne Gruppe (9 Punkte) bleibt. Danach ist Spieler 1 wieder am Zug.',
    erzeuge: () =>
      blockadeAngesagt(gemischt(2, 307).schlange(1, ['Grün', 'Grün', 'Grün']).schlange(0, ['Rot']), 'schlange-1', 1, ['Farbenschutz', 'Rot', 'Gelb', 'Violett', 'Braun']).zustand(),
  },
  {
    name: 'ki-abwehr-harmlos',
    beschreibung:
      'K3, Kriterium 4: Die Partie läuft. Spieler 1 hat eine Schlangenblockade hinter das blaue Paar in der Schlange Gelb, Blau, Blau von KI-Gegner 1 angesagt (Ende, Stelle 3). Das Paar ist danach zu, Punkte kostet es keine. KI-Gegner 1 hält einen Farbenschutz.',
    erwartet:
      'Er lässt durch: Der Schaden wiegt den Farbenschutz nicht auf, den er für einen echten Angriff behält. Die Blockade liegt danach am Ende seiner Schlange, der Farbenschutz bleibt auf der Hand.',
    erzeuge: () =>
      blockadeAngesagt(gemischt(2, 308).schlange(1, ['Gelb', 'Blau', 'Blau']).schlange(0, ['Rot']), 'schlange-1', 3, ['Farbenschutz', 'Rot', 'Gelb', 'Violett', 'Braun']).zustand(),
  },
  {
    name: 'ki-abwehr-schlussrunde',
    beschreibung:
      'K3, Kriterium 4: Wie „ki-abwehr-harmlos“, aber in der Schlussrunde: Spieler 1 hat die letzte Karte gezogen, KI-Gegner 1 hat danach noch seinen letzten Zug. Die Blockade hinter seinem blauen Paar ist angesagt, er hält einen Farbenschutz.',
    erwartet:
      'Er wehrt ab: In der Schlussrunde wehrt er jeden Schaden ab, auch diesen kleinen. Die Blockade geht wirkungslos auf den Ablagestapel von Spieler 1, das blaue Paar bleibt offen.',
    erzeuge: () =>
      blockadeAngesagt(gemischt(2, 308).schlange(1, ['Gelb', 'Blau', 'Blau']).schlange(0, ['Rot']), 'schlange-1', 3, ['Farbenschutz', 'Rot', 'Gelb', 'Violett', 'Braun'])
        .schlussrunde(0)
        .zustand(),
  },
  {
    name: 'ki-angriff-fuehrender',
    beschreibung:
      'K3, Kriterium 5: Vier Spieler. Spieler 1 führt mit Grün, Grün, Grün und Rot, Rot, Rot (12). KI-Gegner 2 hat Grün, Grün, Grün (9), KI-Gegner 3 Violett, Violett, Violett (6), KI-Gegner 1 Gelb ×5 mit dem Kettenbonus. KI-Gegner 1 hält eine Schlangenblockade, dazu Rot, Braun, Blau und Violett.',
    erwartet:
      'Er legt die Blockade in die grüne Gruppe von Spieler 1, des Führenden (schlange-2, Stelle 1 oder 2), nicht in die gleich wertvolle grüne Gruppe von KI-Gegner 2.',
    erzeuge: () =>
      gemischt(4, 309)
        .schlange(1, ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb'])
        .schlange(0, ['Grün', 'Grün', 'Grün'])
        .schlange(0, ['Rot', 'Rot', 'Rot'])
        .schlange(2, ['Grün', 'Grün', 'Grün'])
        .schlange(3, ['Violett', 'Violett', 'Violett'])
        .hand(1, ['Schlangenblockade', 'Rot', 'Braun', 'Blau', 'Violett'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
]
