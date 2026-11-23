import { legeAufgabenAus } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import type { Kartenwahl, Schlangenglied } from '../engine/testing/szenario'
import type { Szenario } from './szenarien'

/*
Szenarien zu den Aufgaben aus X2, Paket B (A9): Farbvielfalt, Vielfaltskönig,
Farbwechsler, Schlangenbändiger und Symmetriemeister. Jede wird mit echten
Karten eingelöst, ohne Testbedingung: Es gilt die Bedingung aus ihrer Datei
unter `src/engine/aufgaben/`. Was eingelöst wird, steht unter „Offene
Aufgaben“ und „Erfüllte Aufgaben“ und in den Ereignissen AufgabeErfuellt und
AufgabeAufgedeckt.
*/

const FARBKARTEN: Kartenwahl[] = ['Rot', 'Gelb', 'Grün', 'Braun', 'Violett']

/**
 * Zwei Spieler mit Erweiterung; Spieler 1 ist am Zug, hat diese Schlangen und hält `hand`. Offen liegen die
 * Aufgabe, Fusionsexperte und Schlangentanz, oben auf dem Aufgabenstapel Gelber Schatz.
 */
function tisch(aufgabe: string, schlangen: Schlangenglied[][], hand: Kartenwahl[]) {
  const bau = baukasten({ spielerzahl: 2, erweiterung: true })
  for (const schlange of schlangen) bau.schlange(0, schlange)
  return bau
    .hand(0, hand)
    .hand(1, FARBKARTEN)
    .aendere((zustand) =>
      legeAufgabenAus(zustand, {
        offen: [aufgabe, 'Fusionsexperte', 'Schlangentanz'],
        stapelOben: ['Gelber Schatz'],
        geheim: [
          [0, 'Schlangenmeister'],
          [1, 'Schlangenrepertoire'],
        ],
      }),
    )
    .zustand()
}

const AUSLAGE = 'Offen liegen die Aufgabe, Fusionsexperte und Schlangentanz, oben auf dem Aufgabenstapel Gelber Schatz.'
const EINGELOEST = 'Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1,'
const DANACH = 'AufgabeAufgedeckt (Gelber Schatz an ihrer Stelle). Offene Aufgaben: Gelber Schatz, Fusionsexperte, Schlangentanz.'

export const AUFGABEN_B_SZENARIEN: readonly Szenario[] = [
  {
    name: 'aufgabe-farbvielfalt',
    beschreibung: `A9 Nr. 4, A7.3: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Blau, Rot, Gelb, Braun, Grün und hält eine Regenbogenschlange, Blau, Rot, Gelb, Grün. ${AUSLAGE} Keine Testbedingung.`,
    erwartet: `Vorher ist nichts erfüllt. Spieler 1 legt die Regenbogenschlange an eine beliebige Lücke von schlange-1, etwa ans Ende: ${EINGELOEST} Farbvielfalt), ${DANACH} Die Regenbogenschlange zählt als das fehlende Violett. Legt er stattdessen Blau ans Ende, wird nichts eingelöst (Blau wäre doppelt).`,
    erzeuge: () => tisch('Farbvielfalt', [['Blau', 'Rot', 'Gelb', 'Braun', 'Grün']], ['Regenbogenschlange', 'Blau', 'Rot', 'Gelb', 'Grün']),
  },
  {
    name: 'aufgabe-vielfaltskoenig',
    beschreibung: `A9 Nr. 5, D38, A7.7: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug und hat zwei Schlangen: schlange-1 Blau, Rot, Gelb, Grün (vier Farben) und schlange-2 Braun, Violett, Farbenfusion aus zwei roten Karten (drei Farben, die Fusion zählt als eine). Er hält Gelb, Violett, Braun, Violett, Braun. ${AUSLAGE} Keine Testbedingung.`,
    erwartet: `Spieler 1 legt Gelb an schlange-2 (Anfang oder Ende): ${EINGELOEST} Vielfaltskönig), ${DANACH} Legt er stattdessen Violett oder Braun an schlange-2, wird nichts eingelöst: Die roten Karten unter der Fusion zählen nicht als Farbe.`,
    erzeuge: () =>
      tisch('Vielfaltskönig', [['Blau', 'Rot', 'Gelb', 'Grün'], ['Braun', 'Violett', { fusion: ['Rot', 'Rot'] }]], ['Gelb', 'Violett', 'Braun', 'Violett', 'Braun']),
  },
  {
    name: 'aufgabe-farbwechsler',
    beschreibung: `A9 Nr. 6: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Blau, Blau, Rot, Gelb, Gelb und hält Grün, Blau, Gelb, Rot, Blau. ${AUSLAGE} Keine Testbedingung.`,
    erwartet: `Spieler 1 legt Grün an schlange-1 (Anfang oder Ende): ${EINGELOEST} Farbwechsler), ${DANACH} Reihen gelten als eine Farbe: Blau-Blau, Rot, Gelb-Gelb, Grün. Legt er stattdessen Blau, Gelb oder Rot an, wird nichts eingelöst.`,
    erzeuge: () => tisch('Farbwechsler', [['Blau', 'Blau', 'Rot', 'Gelb', 'Gelb']], ['Grün', 'Blau', 'Gelb', 'Rot', 'Blau']),
  },
  {
    name: 'aufgabe-schlangenbaendiger',
    beschreibung: `A9 Nr. 11, D40: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Rot, Blau, Grün, Rot, Blau und hält Grün, Rot, Blau, Gelb, Gelb. ${AUSLAGE} Keine Testbedingung.`,
    erwartet: `Spieler 1 legt Grün ans Ende von schlange-1: ${EINGELOEST} Schlangenbändiger), ${DANACH} Das Muster Rot, Blau, Grün liegt zweimal hintereinander (A9 Beispiel). Grün an den Anfang löst ebenfalls ein (Grün, Rot, Blau zweimal). Rot oder Gelb ans Ende löst nichts ein.`,
    erzeuge: () => tisch('Schlangenbändiger', [['Rot', 'Blau', 'Grün', 'Rot', 'Blau']], ['Grün', 'Rot', 'Blau', 'Gelb', 'Gelb']),
  },
  {
    name: 'aufgabe-symmetriemeister',
    beschreibung: `A9 Nr. 13, D39: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Blau, Rot, Gelb, Grün, Grün, Gelb, Rot (sieben Karten) und hält Blau, Rot, Gelb, Grün, Braun. ${AUSLAGE} Keine Testbedingung.`,
    erwartet: `Spieler 1 legt Blau ans Ende von schlange-1: ${EINGELOEST} Symmetriemeister), ${DANACH} Die Schlange ist das A9-Beispiel mit acht Karten. Blau an den Anfang löst nichts ein (die Schlange ist dann nicht spiegelgleich).`,
    erzeuge: () => tisch('Symmetriemeister', [['Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot']], ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']),
  },
]
