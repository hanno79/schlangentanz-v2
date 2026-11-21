import { baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien für den Spieltisch unter `/spiel?szenario=<name>` (O3, Kriterium 7).
Sie zeigen, was die Partie-Steuerung ohne Bedienung trägt: eine offene
Abwehrfrage an dich und eine Schlussrunde, die die KI-Gegner allein zu Ende
spielen. Am Entwicklertisch lassen sie sich wie jedes Szenario mit Klicks
weiterspielen. Für O5 kommt ein Zugende mit zu vielen Handkarten dazu (A5),
für O7 eine Schlangenhäutung, die Punkte bringt oder nimmt (A7.9, A11).
*/

export const SPIEL_SZENARIEN: readonly Szenario[] = [
  {
    name: 'angriff-auf-dich',
    beschreibung:
      'A6, D33: Zwei Spieler. KI-Gegner 1 hat eine Schlangengrube auf Spieler 1 angesagt; Spieler 1 hält einen Farbenschutz und entscheidet, ob er abwehrt.',
    erwartet:
      'Unter /spiel sagt die Statuszeile „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“; kein KI-Schritt läuft, auch nicht nach Neuladen. Am Entwicklertisch zwei Knöpfe für Spieler 1: „Reagieren: abwehren mit Farbenschutz“ und „Reagieren: durchlassen“. Abwehren: Abgewehrt und AnsageEntschieden ohne Wirkung, die Grube liegt auf dem Ablagestapel von KI-Gegner 1. Durchlassen: die Grube liegt vor Spieler 1.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(91) })
        .hand(0, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .schlange(1, ['Rot', 'Rot'])
        .schwebend(1, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-1' }), [0])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'schlussrunde-ohne-dich',
    beschreibung:
      'A10: Vier Spieler in der Schlussrunde. Spieler 1 hat die letzte Karte gezogen und seinen Zug beendet; KI-Gegner 1 ist mit seinem letzten Zug dran. Die KI-Gegner halten nur Farbkarten, damit niemand dich angreift.',
    erwartet:
      'KI-Gegner 1, 2 und 3 spielen je ihren letzten Zug ohne Nachziehen, dann ist die Partie beendet; Spieler 1 entscheidet nichts mehr. Unter /spiel?szenario=schlussrunde-ohne-dich&tempo=sofort steht danach die Wertung (O8) mit allen vier Spielern, „Noch einmal“ und „Zur Lobby“.',
    erzeuge: () =>
      baukasten({ spielerzahl: 4, erweiterung: false, zufall: erzeugeZufall(92) })
        .hand(0, ['Blau', 'Rot', 'Gelb'])
        .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Violett'])
        .hand(2, ['Braun', 'Rot', 'Gelb', 'Grün', 'Blau'])
        .hand(3, ['Violett', 'Braun', 'Rot', 'Blau', 'Gelb'])
        .schlange(0, ['Grün', 'Grün'])
        .schlussrunde(0)
        .amZug(1)
        .zustand(),
  },
  {
    name: 'zu-viele-handkarten',
    beschreibung:
      'A5: Zwei Spieler. Spieler 1 hat seinen Zug beendet und hält danach 7 Karten (Rot, Blau, Gelb, Grün, Violett, Braun, Farbenschutz); er legt die überzähligen 2 ab. Er hat eine Schlange Rot, Rot.',
    erwartet:
      'Unter /spiel öffnet sich der Dialog „Zu viele Handkarten“ mit 7 Karten; „Ablegen“ geht erst mit genau 2 gewählten. Am Entwicklertisch 21 Knöpfe UeberhandAbwerfen, je ein Paar. Danach liegen die zwei Karten oben auf dem Ablagestapel von Spieler 1, er hält 5, und KI-Gegner 1 ist dran.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(93) })
        .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun', 'Farbenschutz'])
        .schlange(0, ['Rot', 'Rot'])
        .haendeAuffuellen()
        .aendere((zustand) => {
          zustand.zug.abschnitt = 'Abwerfen'
        })
        .zustand(),
  },
  {
    name: 'haeutung-punkte',
    beschreibung:
      'A7.9, A11, D9: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hält eine Schlangenhäutung, Blau, Rot, Gelb und Violett und hat die Schlange Rot, Blau, Rot, Rot, Gelb (0 Punkte). KI-Gegner 1 hat die Schlange Grün, Grün, Grün, Blau, Rot (9 Punkte) und keinen Farbenschutz.',
    erwartet:
      'Unter /spiel: Häutung, „Deine Schlange 1 wählen“, Karte 1 und Karte 4 antippen, Blau mit dem letzten Rot tauschen: die Zugleiste zeigt „Deine Punkte: vorher 0, nachher 3“, die Schlange die Farbgruppe Rot (3). In der Schlange von KI-Gegner 1 Karte 1 bis 4 und Grün mit Blau tauschen: „Punkte von KI-Gegner 1: vorher 9, nachher 0“.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(94) })
        .hand(0, ['Schlangenhäutung', 'Blau', 'Rot', 'Gelb', 'Violett'])
        .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Violett'])
        .schlange(0, ['Rot', 'Blau', 'Rot', 'Rot', 'Gelb'])
        .schlange(1, ['Grün', 'Grün', 'Grün', 'Blau', 'Rot'])
        .zustand(),
  },
]
