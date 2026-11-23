import { legeAufgabenAus } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten, Kartenwahl } from '../engine/testing/szenario'
import type { Sonderkartenname, Spielzustand } from '../engine'
import type { Szenario } from './szenarien'

/*
Szenarien zu den Aufgaben aus Paket C von X2 (A9 Nr. 7 bis 10 und 12): Je
Aufgabe wird sie mit echten Karten eingelöst, ohne Testbedingung. Was ein
Spieler bisher an Sonderkarten ausgespielt hat (D36), steht in der
Zustandsansicht unter „Ausgespielte Sonderkarten“, die neuen Dreiergruppen
einer Häutung (D37) unter „Dreiergruppen durch Häutung“; die Karten, die er
schon gespielt hat, liegen auf seinem Ablagestapel oder in seiner Schlange.
Offen liegen jeweils die Aufgabe des Szenarios, Gelber Schatz und Lila Riese,
die keine dieser Schlangen erfüllt; geheim hat Spieler 1 Symmetriemeister und
KI-Gegner 1 Farbharmonie.
*/

/** Zwei Spieler mit Erweiterung, Spieler 1 ist am Zug; offen liegt `aufgabe`. */
function tisch(aufgabe: string, hand0: Kartenwahl[], hand1: Kartenwahl[] = ['Rot', 'Gelb', 'Grün', 'Braun', 'Violett']): Baukasten {
  return baukasten({ spielerzahl: 2, erweiterung: true })
    .hand(0, hand0)
    .hand(1, hand1)
    .aendere((zustand) =>
      legeAufgabenAus(zustand, {
        offen: [aufgabe, 'Gelber Schatz', 'Lila Riese'],
        stapelOben: ['Farbkombination'],
        geheim: [
          [0, 'Symmetriemeister'],
          [1, 'Farbharmonie'],
        ],
      }),
    )
}

/** Spieler `spieler` hat diese Sonderkarten schon früher ausgespielt (D36). */
function ausgespielt(spieler: number, namen: Sonderkartenname[]): (zustand: Spielzustand) => void {
  return (zustand) => {
    zustand.spieler[spieler].ausgespielteSonderkarten = [...namen]
  }
}

const OFFEN = 'Offen liegen die Aufgabe des Szenarios, Gelber Schatz und Lila Riese, oben auf dem Aufgabenstapel Farbkombination.'

export const AUFGABEN_C_SZENARIEN: readonly Szenario[] = [
  {
    name: 'aufgabe-fusionsexperte',
    beschreibung: `A9 Nr. 7, A7.7: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Gelb, Farbenfusion (Blau + Blau), Gelb, Rot, Rot und hält eine Farbenfusion, Blau, Gelb, Grün, Braun. ${OFFEN} Fusionsexperte verlangt eine Schlange mit mindestens 2 Farbfusionen.`,
    erwartet:
      'Vorher ist Fusionsexperte offen: eine Fusion. Spieler 1 klickt „FusionLegen“ auf die beiden roten Karten (rot-…, rot-…) in schlange-1: Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Fusionsexperte), AufgabeAufgedeckt (Farbkombination an Stelle von Fusionsexperte). Erfüllt bei Spieler 1: Fusionsexperte (6 Punkte); schlange-1 zeigt Gelb, Fusion, Gelb, Fusion. Die Fusion auf Blau, Blau gibt es nicht als Knopf, sie liegt schon. Ausgespielte Sonderkarten von Spieler 1: Farbenfusion.',
    erzeuge: () => tisch('Fusionsexperte', ['Farbenfusion', 'Blau', 'Gelb', 'Grün', 'Braun']).schlange(0, ['Gelb', { fusion: ['Blau', 'Blau'] }, 'Gelb', 'Rot', 'Rot']).zustand(),
  },
  {
    name: 'aufgabe-schlangenbeschwoerer',
    beschreibung: `A9 Nr. 8: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlangen Rot, Regenbogenschlange, Rot und Gelb, Schlangenblockade, Farbenfusion (Blau + Blau), zusammen 3 Sonderkarten, und hält eine Regenbogenschlange, Blau, Gelb, Grün, Braun. ${OFFEN} Schlangenbeschwörer verlangt mindestens 4 Sonderkarten in den eigenen Schlangen.`,
    erwartet:
      'Spieler 1 klickt einen beliebigen Knopf „RegenbogenschlangeLegen“ in schlange-1 oder schlange-2: Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Schlangenbeschwörer), AufgabeAufgedeckt (Farbkombination). Erfüllt bei Spieler 1: Schlangenbeschwörer (7 Punkte). Die Fusion zählt als eine Sonderkarte, die Blockade auch.',
    erzeuge: () =>
      tisch('Schlangenbeschwörer', ['Regenbogenschlange', 'Blau', 'Gelb', 'Grün', 'Braun'])
        .schlange(0, ['Rot', 'Regenbogenschlange', 'Rot'])
        .schlange(0, ['Gelb', 'Schlangenblockade', { fusion: ['Blau', 'Blau'] }])
        .zustand(),
  },
  {
    name: 'aufgabe-schlangenmeister',
    beschreibung: `A9 Nr. 9, D36: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Rot, Rot, Schlangenblockade (von KI-Gegner 1), Rot, Regenbogenschlange und hat bisher Regenbogenschlange, Farbenschutz und Verdoppler ausgespielt (3 Karten; Farbenschutz und Verdoppler liegen auf seinem Ablagestapel). Er hält eine Schlangengrube, Blau, Gelb, Grün, Braun; KI-Gegner 1 hält einen Farbenschutz. ${OFFEN} Schlangenmeister verlangt 2 verschiedene Sonderkarten in den eigenen Schlangen und 4 ausgespielte.`,
    erwartet:
      'Spieler 1 klickt „SchlangengrubeSpielen“ auf KI-Gegner 1: KarteAngesagt und AbwehrGefragt, noch kein AufgabeErfuellt (die Ansage ist nicht aufgelöst); Ausgespielte Sonderkarten von Spieler 1 zeigen schon 4 Karten. KI-Gegner 1 klickt „Reagieren: abwehren mit Farbenschutz“ (D36: auch eine abgewehrte Karte ist ausgespielt): Abgewehrt, AnsageEntschieden ohne Wirkung, dann AufgabeErfuellt (Spieler 1, Schlangenmeister) und AufgabeAufgedeckt (Farbkombination). Beim Durchlassen ebenso, dann setzt KI-Gegner 1 aus. Bei KI-Gegner 1 steht Farbenschutz unter den ausgespielten Sonderkarten.',
    erzeuge: () =>
      tisch('Schlangenmeister', ['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun'])
        .schlange(0, ['Rot', 'Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange'])
        .ablage(0, ['Farbenschutz', 'Verdoppler'])
        .aendere(ausgespielt(0, ['Regenbogenschlange', 'Farbenschutz', 'Verdoppler']))
        .aendere(ausgespielt(1, ['Schlangenblockade']))
        .zustand(),
  },
  {
    name: 'aufgabe-schlangenrepertoire',
    beschreibung: `A9 Nr. 10, D36, D25: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Rot, Regenbogenschlange, Rot, Rot und hat bisher Regenbogenschlange, Schlangenfrass, Farbendieb und Verdoppler ausgespielt (4 Arten; Schlangenfrass, Farbendieb und Verdoppler liegen auf seinem Ablagestapel). Er hält einen Farbenschutz, Blau, Gelb, Grün, Braun. ${OFFEN} Schlangenrepertoire verlangt 5 verschiedene Arten ausgespielter Sonderkarten.`,
    erwartet:
      'Spieler 1 klickt „SonderkarteWirkungslosAblegen“ mit dem Farbenschutz (D25: ein Farbenschutz darf immer wirkungslos abgelegt werden): Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Schlangenrepertoire), AufgabeAufgedeckt (Farbkombination). Ausgespielte Sonderkarten: Regenbogenschlange, Schlangenfrass, Farbendieb, Verdoppler, Farbenschutz. Legt er stattdessen nur Blau an, bleibt die Aufgabe offen.',
    erzeuge: () =>
      tisch('Schlangenrepertoire', ['Farbenschutz', 'Blau', 'Gelb', 'Grün', 'Braun'])
        .schlange(0, ['Rot', 'Regenbogenschlange', 'Rot', 'Rot'])
        .ablage(0, ['Schlangenfrass', 'Farbendieb', 'Verdoppler'])
        .aendere(ausgespielt(0, ['Regenbogenschlange', 'Schlangenfrass', 'Farbendieb', 'Verdoppler']))
        .zustand(),
  },
  {
    name: 'aufgabe-schlangentanz',
    beschreibung: `A9 Nr. 12, Beispiel der Website, D37: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Blau, Grün, Grün, Blau, Grün, Rot, Rot, Violett, Violett, Rot, Violett und hält eine Schlangenhäutung, Blau, Rot, Gelb, Grün. ${OFFEN} Schlangentanz verlangt 2 neue Dreiergruppen aus einer eigenen Häutung in einer eigenen Schlange.`,
    erwartet:
      'Vorher: Dreiergruppen durch Häutung 0. Spieler 1 klickt den Knopf „SchlangenhaeutungSpielen“, der hinter „→ schlange-1 ·“ die letzten fünf Karten als rot, rot, violett, violett, violett nennt: Ereignisse KartenVersetzt, KarteGespielt, AufgabeErfuellt (Spieler 1, Schlangentanz), AufgabeAufgedeckt (Farbkombination). schlange-1 zeigt Blau, Grün, Grün, Blau, Grün, Rot, Rot, Rot, Violett, Violett, Violett; Dreiergruppen durch Häutung: 2. Wählt er stattdessen rot, violett, violett, violett, rot, steht dort 1, und Schlangentanz bleibt offen.',
    erzeuge: () =>
      tisch('Schlangentanz', ['Schlangenhäutung', 'Blau', 'Rot', 'Gelb', 'Grün'])
        .schlange(0, ['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Violett', 'Violett', 'Rot', 'Violett'])
        .zustand(),
  },
]
