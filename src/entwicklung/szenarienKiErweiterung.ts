import type { Spielzustand } from '../engine'
import { legeAufgabenAus } from '../engine/testing/aufgaben'
import type { Aufgabenauslage } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien zur soliden KI mit Erweiterung (Plan K4, Kriterien 1 bis 3). Zwei Spieler,
mit Erweiterung; KI-Gegner 1 ist am Beginn seines Zuges. Man klickt „KI-Schritt
(solide)“, bis Spieler 1 wieder dran ist, und liest im Verlauf ab, was er gespielt hat.
Die übrigen Handkarten kommen gemischt mit fester Saat von oben. Wo es nicht um
Risiko-Karten geht, liegen die von KI-Gegner 1 schon aus dem Spiel, damit keine davon
den Zug überlagert. Die Aufgaben sind so ausgelegt, dass nur die genannten eine Rolle
spielen.
*/

/** Aufgaben, die in diesen Szenarien niemand erfüllt. */
const RUHIGE_AUFGABEN: Aufgabenauslage = {
  offen: ['Symmetriemeister', 'Lila Riese', 'Gelber Schatz'],
  stapelOben: ['Farbharmonie', 'Vielfaltskönig'],
  geheim: [
    [0, 'Schlangentanz'],
    [1, 'Fusionsexperte'],
  ],
}

function tisch(saat: number): Baukasten {
  return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) })
}

/** Legt die Aufgaben aus, nimmt KI-Gegner 1 ohne `mitRisiko` die Risiko-Karten und beginnt seinen Zug. */
function zugbeginn(bau: Baukasten, auslage: Aufgabenauslage, mitRisiko = false): Spielzustand {
  return bau
    .haendeAuffuellen()
    .aendere((zustand) => {
      legeAufgabenAus(zustand, auslage)
      if (!mitRisiko) zustand.ausDemSpiel.push(...zustand.spieler[1].risikoKarten.splice(0))
    })
    .amZug(1)
    .zugbeginn()
    .zustand()
}

const LESEN = 'Abzulesen im Verlauf, unter „Erfüllte Aufgaben“ und an den Schlangen von KI-Gegner 1.'

export const KI_ERWEITERUNG_SZENARIEN: readonly Szenario[] = [
  {
    name: 'ki-aufgabe-offen',
    beschreibung:
      'K4, Kriterium 1: KI-Gegner 1 hat schlange-1 Blau, Rot, Gelb, Braun, Violett und schlange-2 Braun, Braun. Er hält Grün, Braun, zwei Farbenschutz und eine Schlangengrube. Offen liegt Farbvielfalt (9 Punkte, je eine Karte aller 6 Farben in einer Kette, D58).',
    erwartet: `Ihm fehlt für Farbvielfalt nur Grün, und er hält es: Er legt Grün an ein Ende von schlange-1, und Farbvielfalt geht an ihn (AufgabeErfuellt). Das Braun, das schlange-2 zur Dreiergruppe (6 Punkte) machte, bleibt auf der Hand; ohne die Aufgabe hätte er es gelegt. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4101)
          .schlange(1, ['Blau', 'Rot', 'Gelb', 'Braun', 'Violett'])
          .schlange(1, ['Braun', 'Braun'])
          .schlange(0, ['Rot', 'Rot'])
          .hand(1, ['Grün', 'Braun', 'Farbenschutz', 'Farbenschutz', 'Schlangengrube']),
        { ...RUHIGE_AUFGABEN, offen: ['Farbvielfalt', 'Lila Riese', 'Gelber Schatz'] },
      ),
  },
  {
    name: 'ki-aufgabe-geheim',
    beschreibung:
      'K4, Kriterium 1: KI-Gegner 1 hat schlange-1 Blau, Blau, Rot, Rot, Gelb, Gelb und schlange-2 Violett, Violett, Braun, Braun, Grün. Er hält Grün, Gelb, zwei Farbenschutz und eine Schlangengrube. Seine geheime Aufgabe ist Farbenpracht (8 Punkte, von jeder Farbe zwei Karten; geprüft am Ende des eigenen Zuges, D59).',
    erwartet: `Ihm fehlt nur das zweite Grün, und er hält es: Er legt Grün an ein Ende einer seiner Schlangen, nicht das Gelb, das schlange-1 zur Dreiergruppe machte. Nach „Zug beenden“ steht seine geheime Aufgabe auf „erfüllt“ (ohne Ereignis, D35). ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4102)
          .schlange(1, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb', 'Gelb'])
          .schlange(1, ['Violett', 'Violett', 'Braun', 'Braun', 'Grün'])
          .schlange(0, ['Rot'])
          .hand(1, ['Grün', 'Gelb', 'Farbenschutz', 'Farbenschutz', 'Schlangengrube']),
        { ...RUHIGE_AUFGABEN, geheim: [[0, 'Schlangentanz'], [1, 'Farbenpracht']] },
      ),
  },
  {
    name: 'ki-comeback-nutzen',
    beschreibung:
      'K4, Kriterium 2: KI-Gegner 1 hat Grün, Grün und Blau, Blau; Spieler 1 hat eine Schlange mit 7 Karten, also liegt KI-Gegner 1 zu Zugbeginn 5 Karten zurück (A8.1, D48). Er hält Grün, Blau und drei Farbenschutz.',
    erwartet: `Mit der Farbkarte des Zuges vollendet er eine der beiden Gruppen; die Comeback-Karte setzt er ein, weil sie ihm die zweite Gruppe bringt (ComebackEingesetzt). Am Ende liegen Grün, Grün, Grün (9 Punkte) und Blau, Blau, Blau (3 Punkte), die Comeback-Karte steht auf „verbraucht“. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4103)
          .schlange(1, ['Grün', 'Grün'])
          .schlange(1, ['Blau', 'Blau'])
          .schlange(0, ['Rot', 'Gelb', 'Rot', 'Gelb', 'Rot', 'Gelb', 'Rot'])
          .hand(1, ['Grün', 'Blau', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
      ),
  },
  {
    name: 'ki-comeback-ohne-nutzen',
    beschreibung:
      'K4, Kriterium 2: wie „ki-comeback-nutzen“, 5 Karten Rückstand, aber KI-Gegner 1 hält nur Grün und vier Farbenschutz.',
    erwartet: `Er legt Grün an Grün, Grün (9 Punkte) und beendet den Zug. Die Comeback-Karte setzt er nicht ein: Mit den Zusatzaktionen könnte er nur einen Farbenschutz wirkungslos ablegen oder zwei davon gegen drei unbekannte Karten tauschen, und das hebt seine Bewertung nicht. Sie bleibt ohne „(verbraucht)“. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4104)
          .schlange(1, ['Grün', 'Grün'])
          .schlange(1, ['Blau', 'Blau'])
          .schlange(0, ['Rot', 'Gelb', 'Rot', 'Gelb', 'Rot', 'Gelb', 'Rot'])
          .hand(1, ['Grün', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
      ),
  },
  {
    name: 'ki-korb-tausch',
    beschreibung:
      'K4, Kriterium 2: KI-Gegner 1 hat die Schlange Blau, Blau, Rot, Blau, Blau und hält den Schlangenkorb, Blau, Gelb und zwei Farbenschutz.',
    erwartet: `Er spielt den Schlangenkorb mit „tauschen“ und tauscht das Rot gegen sein Blau (D44): Blau, Blau, Blau, Blau, Blau, eine Gruppe mit 5 Punkten statt der 3, die das Blau am Ende brächte. Das Rot liegt danach auf seiner Hand, der Korb unter „Aus dem Spiel“. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4105)
          .schlange(1, ['Blau', 'Blau', 'Rot', 'Blau', 'Blau'])
          .schlange(0, ['Gelb', 'Gelb'])
          .hand(1, ['Schlangenkorb des Glücks', 'Blau', 'Gelb', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
      ),
  },
  {
    name: 'ki-korb-ohne-nutzen',
    beschreibung:
      'K4, Kriterium 2: Im Nachziehstapel liegt nur noch eine Karte, die übrigen liegen auf den Ablagestapeln. KI-Gegner 1 hat die Schlange Grün, Grün und hält den Schlangenkorb, Grün und drei Farbenschutz. Spieler 1 hat Gelb, Gelb, keine Sonderkarte liegt in einer Schlange.',
    erwartet: `Er legt Grün an Grün, Grün (9 Punkte) und beendet den Zug; den Korb hält er. Keiner der Boni bringt hier mehr, als der Korb auf der Hand wert ist: „ziehen“ brächte nur noch eine Karte (D43), „aktionen“ nur Farbenschutz ohne Wirkung, „tauschen“ Grün gegen Grün nichts, und zu entfernen gibt es nichts. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4106)
          .schlange(1, ['Grün', 'Grün'])
          .schlange(0, ['Gelb', 'Gelb'])
          .hand(1, ['Schlangenkorb des Glücks', 'Grün', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz'])
          .hand(0, ['Blau', 'Rot', 'Violett', 'Braun', 'Farbenschutz'])
          .stapelBehalten(1),
        RUHIGE_AUFGABEN,
      ),
  },
  {
    name: 'ki-risiko-nutzen',
    beschreibung:
      'K4, Kriterium 2: KI-Gegner 1 hat die Schlange Blau, Blau, Rot, Blau, Blau, hält Blau, Gelb und drei Farbenschutz und hat beide Risiko-Karten in der Auslage.',
    erwartet: `Vor seinen übrigen Karten spielt er eine Risiko-Karte (RisikoKarteGespielt), weil sie nach den offenen Wahrscheinlichkeiten mehr bringt, als sie in der Auslage wert ist: mit Aktion 3 auf das Rot (bei einer Farbkarte mit 1 Punkt tauscht er es gegen sein Blau, Blau ×5) oder mit Aktion 2 (zusätzliches Blau an die Schlange). Was danach kommt, hängt von der aufgedeckten Karte ab. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4107)
          .schlange(1, ['Blau', 'Blau', 'Rot', 'Blau', 'Blau'])
          .schlange(0, ['Gelb', 'Gelb'])
          .hand(1, ['Blau', 'Gelb', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
        true,
      ),
  },
  {
    name: 'ki-risiko-ohne-nutzen',
    beschreibung:
      'K4, Kriterium 2: Erster Zug von KI-Gegner 1, er hat noch keine Schlange und hält Verdoppler, Farbendieb, Regenbogenschlange und zwei Farbenschutz; beide Risiko-Karten liegen in seiner Auslage. Spieler 1 hat Rot, Rot, Gelb.',
    erwartet: `Er spielt in diesem Zug keine Risiko-Karte (kein RisikoKarteGespielt): Im ersten Zug setzt er sie nur ein, wenn die Bewertung um mehr als ihren Haltewert für den ersten Zug steigt, und ohne eigene Schlange gehen nur Aktion 1 und 4. Er spielt zuerst den Verdoppler und beendet den ersten Teilzug; im zweiten legt er die nachgezogene Farbkarte als neue Schlange und die Regenbogenschlange an ihren Anfang. Beide Risiko-Karten liegen danach noch in seiner Auslage. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4108)
          .schlange(0, ['Rot', 'Rot', 'Gelb'])
          .hand(1, ['Verdoppler', 'Farbendieb', 'Regenbogenschlange', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
        true,
      ),
  },
  {
    name: 'ki-haeutung-tanz',
    beschreibung:
      'K4, Kriterium 3, Beispiel zu „Schlangentanz“ (A9): KI-Gegner 1 hat Blau, Grün, Grün, Blau, Grün, Rot, Rot, Violett, Violett, Rot, Violett und hält die Schlangenhäutung, Gelb, Braun und zwei Farbenschutz. Offen liegt Schlangentanz (7 Punkte).',
    erwartet: `Er spielt die Schlangenhäutung auf die letzten fünf Karten und ordnet sie zu Rot, Rot, Rot, Violett, Violett, Violett: zwei neue Dreiergruppen (3 und 6 Punkte, A7.9), und Schlangentanz geht an ihn (D37, D62). ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4109)
          .schlange(1, ['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Violett', 'Violett', 'Rot', 'Violett'])
          .schlange(0, ['Gelb', 'Gelb'])
          .hand(1, ['Schlangenhäutung', 'Gelb', 'Braun', 'Farbenschutz', 'Farbenschutz']),
        { ...RUHIGE_AUFGABEN, offen: ['Schlangentanz', 'Lila Riese', 'Gelber Schatz'], geheim: [[0, 'Farbkombination'], [1, 'Fusionsexperte']] },
      ),
  },
  {
    name: 'ki-haeutung-gruppe',
    beschreibung:
      'K4, Kriterium 3: KI-Gegner 1 hat Blau, Rot, Blau, Rot, Blau und hält die Schlangenhäutung, Gelb, Braun und zwei Farbenschutz. Keine Aufgabe hängt daran.',
    erwartet: `Er spielt die Schlangenhäutung und ordnet die fünf Karten so, dass drei blaue nebeneinander liegen: eine neue Dreiergruppe (3 Punkte), die beiden roten als Paar an einem Ende. ${LESEN}`,
    erzeuge: () =>
      zugbeginn(
        tisch(4110)
          .schlange(1, ['Blau', 'Rot', 'Blau', 'Rot', 'Blau'])
          .schlange(0, ['Gelb', 'Gelb'])
          .hand(1, ['Schlangenhäutung', 'Gelb', 'Braun', 'Farbenschutz', 'Farbenschutz']),
        RUHIGE_AUFGABEN,
      ),
  },
]
