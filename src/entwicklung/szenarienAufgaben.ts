import type { Spielzustand } from '../engine'
import { legeAufgabenAus } from '../engine/testing/aufgaben'
import type { Aufgabenauslage } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten, Kartenwahl } from '../engine/testing/szenario'
import type { Testbedingung } from '../engine/testing/testaufgaben'
import type { Szenario } from './szenarien'

/*
Szenarien zum Rahmen der Aufgabenkarten (X1, A9, D5, D35). Die Bedingungen der
15 Aufgaben setzt erst X2 um; bis dahin ist jede ein Platzhalter, der nie
erfüllt ist. Damit man Prüfung und Einlösen am Tisch sieht, geben diese
Szenarien einzelnen Aufgaben eine **Testbedingung**, die mit dem Kartentext
nichts zu tun hat und nur hier gilt (`testbedingungen`, der Entwicklertisch
setzt sie beim Laden des Szenarios). Was eingelöst wird, steht unter „Offene
Aufgaben“, „Erfüllte Aufgaben“ und „Geheime Aufgabe … erfüllt“ und in den
Ereignissen AufgabeErfuellt, AufgabeAufgedeckt und AufgabenstapelLeer.
*/

/** Testbedingung: Der Spieler hat eine Schlange mit mindestens `laenge` Karten. */
function schlangeAb(laenge: number): Testbedingung {
  return (zustand, spielerIndex) => zustand.spieler[spielerIndex].schlangen.some((schlange) => schlange.karten.length >= laenge)
}

/** Testbedingung: Der Spieler ist am Zug und hat in diesem Teilzug eine Sonderkarte gespielt; das gilt schon, solange sie angesagt ist. */
const sonderkarteGespielt: Testbedingung = (zustand, spielerIndex) => zustand.zug.spielerIndex === spielerIndex && zustand.zug.gespielteSonderkarten > 0

const AUSLAGE: Aufgabenauslage = {
  offen: ['Farbkombination', 'Fusionsexperte', 'Lila Riese'],
  stapelOben: ['Gelber Schatz', 'Farbvielfalt'],
  geheim: [
    [0, 'Schlangentanz'],
    [1, 'Symmetriemeister'],
  ],
}

const FARBKARTEN: Kartenwahl[] = ['Rot', 'Gelb', 'Grün', 'Braun', 'Violett']

/** Zwei Spieler mit Erweiterung; Spieler 1 ist am Zug und hat die Schlange Blau-Blau. */
function tisch(hand0: Kartenwahl[], hand1: Kartenwahl[], auslage: Aufgabenauslage = AUSLAGE): Baukasten {
  return baukasten({ spielerzahl: 2, erweiterung: true })
    .schlange(0, ['Blau', 'Blau'])
    .hand(0, hand0)
    .hand(1, hand1)
    .aendere((zustand) => legeAufgabenAus(zustand, auslage))
}

/** Bis auf `anzahl` Karten hat KI-Gegner 1 den Aufgabenstapel schon früher erfüllt. */
function stapelBis(anzahl: number): (zustand: Spielzustand) => void {
  return (zustand) => {
    zustand.spieler[1].erfuellteAufgaben.push(...zustand.aufgabenStapel.splice(anzahl))
  }
}

const TEST = 'Testbedingung (nur am Entwicklertisch, nicht der Kartentext):'

export const AUFGABEN_SZENARIEN: readonly Szenario[] = [
  {
    name: 'aufgaben-einloesen',
    beschreibung: `A9, D5, D35: Zwei Spieler, mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange Blau, Blau und hält Blau, Rot, Gelb, Grün, Braun. Offen liegen Farbkombination, Fusionsexperte und Lila Riese, oben auf dem Aufgabenstapel Gelber Schatz, dann Farbvielfalt. Geheim hat Spieler 1 Schlangentanz. ${TEST} Farbkombination, Gelber Schatz und Schlangentanz sind erfüllt, sobald der Spieler eine Schlange mit mindestens 3 Karten hat, Lila Riese ab 4 Karten.`,
    erwartet:
      'Vorher ist nichts erfüllt. Spieler 1 legt Blau an schlange-1 (Anfang oder Ende): Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Farbkombination), AufgabeAufgedeckt (Gelber Schatz an Stelle von Farbkombination), AufgabeErfuellt (Spieler 1, Gelber Schatz; die aufgedeckte Aufgabe wird sofort mitgeprüft, D5), AufgabeAufgedeckt (Farbvielfalt an Stelle von Gelber Schatz). Offene Aufgaben: Farbvielfalt, Fusionsexperte, Lila Riese; erfüllt bei Spieler 1: Farbkombination, Gelber Schatz; der Aufgabenstapel hat 2 Karten weniger. Die geheime Aufgabe von Spieler 1 steht auf „erfüllt“, ohne Ereignis (D35). Lila Riese bleibt liegen (3 Karten). Spieler 1 spielt danach normal weiter.',
    testbedingungen: { Farbkombination: schlangeAb(3), 'Gelber Schatz': schlangeAb(3), Schlangentanz: schlangeAb(3), 'Lila Riese': schlangeAb(4) },
    erzeuge: () => tisch(['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'], FARBKARTEN).zustand(),
  },
  {
    name: 'aufgaben-stapel-leer',
    beschreibung: `A9: wie aufgaben-einloesen, aber im Aufgabenstapel liegt nur noch Gelber Schatz; die übrigen Aufgaben hat KI-Gegner 1 schon erfüllt. ${TEST} Farbkombination und Lila Riese sind erfüllt, sobald der Spieler eine Schlange mit mindestens 3 Karten hat.`,
    erwartet:
      'Spieler 1 legt Blau an schlange-1: AufgabeErfuellt (Farbkombination), AufgabeAufgedeckt (Gelber Schatz an Stelle von Farbkombination), AufgabeErfuellt (Lila Riese), AufgabenstapelLeer (an Stelle von Lila Riese). Offen liegen nur noch Gelber Schatz und Fusionsexperte, der Aufgabenstapel hat 0 Karten: Der Platz bleibt leer.',
    testbedingungen: { Farbkombination: schlangeAb(3), 'Lila Riese': schlangeAb(3) },
    erzeuge: () => tisch(['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'], FARBKARTEN).aendere(stapelBis(1)).zustand(),
  },
  {
    name: 'aufgaben-abwehr',
    beschreibung: `A9, A6: Zwei Spieler, mit Erweiterung. Spieler 1 hält eine Schlangengrube, Blau, Rot, Gelb, Grün; KI-Gegner 1 hält einen Farbenschutz. ${TEST} Farbkombination ist erfüllt, sobald der Spieler am Zug in diesem Zug eine Sonderkarte gespielt hat; das gilt schon, solange die Karte angesagt ist.`,
    erwartet:
      'Spieler 1 spielt die Schlangengrube auf KI-Gegner 1: KarteAngesagt und AbwehrGefragt, aber kein AufgabeErfuellt: Solange KI-Gegner 1 abwehren kann, ist die Aktion nicht aufgelöst. Nach seiner Entscheidung (abwehren oder durchlassen) folgen AnsageEntschieden, AufgabeErfuellt (Spieler 1, Farbkombination) und AufgabeAufgedeckt (Gelber Schatz). Die Aufgabe geht an Spieler 1, nicht an KI-Gegner 1.',
    testbedingungen: { Farbkombination: sonderkarteGespielt },
    erzeuge: () => tisch(['Schlangengrube', 'Blau', 'Rot', 'Gelb', 'Grün'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun']).zustand(),
  },
  {
    name: 'aufgaben-gegnerzug',
    beschreibung: `A9, D9, D35: Zwei Spieler, mit Erweiterung. Spieler 1 hat die Schlange Blau, Blau und hält Gelb, Rot, Grün, Braun, Violett; KI-Gegner 1 hat die Schlange Gelb, Gelb und geheim Symmetriemeister. ${TEST} Farbkombination und Symmetriemeister sind erfüllt, sobald der Spieler eine Schlange mit mindestens 3 Karten hat.`,
    erwartet:
      'Spieler 1 legt Gelb ans Ende von schlange-2 (KI-Gegner 1): Die Schlange hat 3 Karten, aber KI-Gegner 1 ist nicht am Zug, also kein AufgabeErfuellt, und seine geheime Aufgabe steht auf „nicht erfüllt“. Spieler 1 beendet den Zug: KartenGezogen (Spieler 1 zieht 1), ZugBegonnen (KI-Gegner 1), dann AufgabeErfuellt (KI-Gegner 1, Farbkombination) und AufgabeAufgedeckt (Gelber Schatz). Die geheime Aufgabe von KI-Gegner 1 steht jetzt auf „erfüllt“, ohne Ereignis.',
    testbedingungen: { Farbkombination: schlangeAb(3), Symmetriemeister: schlangeAb(3) },
    erzeuge: () => tisch(['Gelb', 'Rot', 'Grün', 'Braun', 'Violett'], FARBKARTEN).schlange(1, ['Gelb', 'Gelb']).zustand(),
  },
]
