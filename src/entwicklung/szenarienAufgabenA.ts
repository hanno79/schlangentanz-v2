import type { Spielzustand } from '../engine'
import { GRUNDAUSLAGE, legeAufgabenAus } from '../engine/testing/aufgaben'
import type { Aufgabenauslage } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import type { Kartenwahl, Schlangenglied } from '../engine/testing/szenario'
import type { Szenario } from './szenarien'

/*
Szenarien zu den Aufgaben aus X2 Paket A (A9 Nr. 1, 2, 3, 14 und 15). Anders als
die Szenarien zum Rahmen (`szenarienAufgaben.ts`) gilt hier die Bedingung von
der Karte, ohne Testbedingung: Die Aufgabe wird mit echten Karten eingelöst.
Offen und oben auf dem Aufgabenstapel liegen nur Aufgaben dieses Pakets, damit
keine andere Aufgabe ein Ereignis auslöst. Geheime Aufgaben zählen still (D35);
die Erwartungen sagen über sie nichts.
*/

const KI_HAND: Kartenwahl[] = ['Rot', 'Gelb', 'Grün', 'Braun', 'Blau']

function mal(anzahl: number, glied: Schlangenglied): Schlangenglied[] {
  return Array.from({ length: anzahl }, () => glied)
}

interface Aufbau {
  /** Die Schlangen von Spieler 1. */
  schlangen: Schlangenglied[][]
  /** Die Hand von Spieler 1. */
  hand: Kartenwahl[]
  offen: string[]
  stapelOben: string[]
  /** Die Schlangen von KI-Gegner 1. */
  gegner?: Schlangenglied[][]
}

/** Zwei Spieler mit Erweiterung; Spieler 1 ist am Zug. Geheim halten die Spieler dieselben Aufgaben wie in `GRUNDAUSLAGE`. */
function tisch({ schlangen, hand, offen, stapelOben, gegner = [] }: Aufbau): () => Spielzustand {
  const auslage: Aufgabenauslage = { offen, stapelOben, geheim: GRUNDAUSLAGE.geheim }
  return () => {
    const bau = baukasten({ spielerzahl: 2, erweiterung: true })
    for (const glieder of schlangen) bau.schlange(0, glieder)
    for (const glieder of gegner) bau.schlange(1, glieder)
    return bau
      .hand(0, hand)
      .hand(1, KI_HAND)
      .aendere((zustand) => legeAufgabenAus(zustand, auslage))
      .zustand()
  }
}

const ZUM_ABLESEN = 'Abzulesen unter „Offene Aufgaben“ und „Erfüllte Aufgaben“ von Spieler 1 und in den Ereignissen.'

export const AUFGABEN_SZENARIEN_A: readonly Szenario[] = [
  {
    name: 'aufgabe-farbenpracht',
    beschreibung:
      'A9 Nr. 1 Farbenpracht, D38: Zwei Spieler, mit Erweiterung. Spieler 1 hat schlange-1 Blau, Blau, Rot, Rot, Gelb, Gelb und schlange-2 Violett, Violett, Braun, Braun, Grün und hält Grün, Rot, Gelb, Blau, Braun. Offen liegen Farbenpracht, Farbkombination und Lila Riese, oben auf dem Aufgabenstapel Gelber Schatz, dann Farbharmonie.',
    erwartet: `Von jeder Farbe fehlt nur die zweite grüne Karte. Legt Spieler 1 Grün an ein Ende von schlange-2 (oder schlange-1): Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Farbenpracht; gezählt wird über beide Schlangen) und AufgabeAufgedeckt (Gelber Schatz an Stelle von Farbenpracht). Offen liegen dann Gelber Schatz, Farbkombination, Lila Riese. Legt er stattdessen Rot, Gelb, Blau oder Braun, geschieht nichts. ${ZUM_ABLESEN}`,
    erzeuge: tisch({
      schlangen: [
        ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb', 'Gelb'],
        ['Violett', 'Violett', 'Braun', 'Braun', 'Grün'],
      ],
      hand: ['Grün', 'Rot', 'Gelb', 'Blau', 'Braun'], offen: ['Farbenpracht', 'Farbkombination', 'Lila Riese'], stapelOben: ['Gelber Schatz', 'Farbharmonie'] }),
  },
  {
    name: 'aufgabe-farbharmonie',
    beschreibung:
      'A9 Nr. 2 Farbharmonie, A7.3: Zwei Spieler, mit Erweiterung. Spieler 1 hat schlange-1 mit je drei blauen, roten und grünen Karten und schlange-2 mit je drei gelben und braunen und zwei violetten Karten; er hält Regenbogenschlange, Blau, Rot, Gelb, Grün. Offen liegen Farbharmonie, Farbkombination und Lila Riese, oben auf dem Aufgabenstapel Gelber Schatz, dann Farbenpracht.',
    erwartet: `Es fehlt nur die dritte violette Karte. Legt Spieler 1 die Regenbogenschlange ans Ende von schlange-2 (Stelle 8, hinter die beiden violetten Karten): Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Farbharmonie; die Regenbogenschlange zählt als Violett) und AufgabeAufgedeckt (Gelber Schatz an Stelle von Farbharmonie). Ebenso an Stelle 6 oder 7, neben die violetten Karten. Am Anfang von schlange-2 oder irgendwo in schlange-1 vervollständigt sie keine violette Gruppe, dann geschieht nichts. ${ZUM_ABLESEN}`,
    erzeuge: tisch({
      schlangen: [
        [...mal(3, 'Blau'), ...mal(3, 'Rot'), ...mal(3, 'Grün')],
        [...mal(3, 'Gelb'), ...mal(3, 'Braun'), 'Violett', 'Violett'],
      ],
      hand: ['Regenbogenschlange', 'Blau', 'Rot', 'Gelb', 'Grün'], offen: ['Farbharmonie', 'Farbkombination', 'Lila Riese'], stapelOben: ['Gelber Schatz', 'Farbenpracht'] }),
  },
  {
    name: 'aufgabe-farbkombination',
    beschreibung:
      'A9 Beispiel und Nr. 3 Farbkombination: Zwei Spieler, mit Erweiterung. Spieler 1 hat eine Vierergruppe blauer Karten (schlange-1) und hält Blau, Rot, Gelb, Grün, Braun; KI-Gegner 1 hat vier rote Karten (schlange-2), ist also auch kurz davor. Offen liegen Farbkombination, Gelber Schatz und Lila Riese, oben auf dem Aufgabenstapel Farbenpracht, dann Farbharmonie.',
    erwartet: `Legt Spieler 1 Blau an ein Ende von schlange-1: Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Farbkombination) und AufgabeAufgedeckt (Farbenpracht an Stelle von Farbkombination). Nach „Zug beenden“ beginnt KI-Gegner 1 seinen Zug; er bekommt keine Aufgabe, Farbkombination ist schon weg. ${ZUM_ABLESEN}`,
    erzeuge: tisch({ schlangen: [mal(4, 'Blau')], hand: ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'], offen: ['Farbkombination', 'Gelber Schatz', 'Lila Riese'], stapelOben: ['Farbenpracht', 'Farbharmonie'], gegner: [mal(4, 'Rot')] }),
  },
  {
    name: 'aufgabe-gelber-schatz',
    beschreibung:
      'A9 Nr. 14 Gelber Schatz, A7.3, D41: Zwei Spieler, mit Erweiterung. Spieler 1 hat schlange-1 Gelb, Gelb, Gelb, Gelb, Gelb, Violett, Violett und hält Regenbogenschlange, Blau, Rot, Grün, Braun. Offen liegen Gelber Schatz, Lila Riese und Farbharmonie, oben auf dem Aufgabenstapel Farbenpracht, dann Farbkombination.',
    erwartet: `Legt Spieler 1 die Regenbogenschlange an Stelle 5, zwischen die gelben und die violetten Karten: Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Gelber Schatz; die Regenbogenschlange zählt als sechste gelbe Karte) und AufgabeAufgedeckt (Farbenpracht an Stelle von Gelber Schatz). Unter „Wertung“ zählt dieselbe Regenbogenschlange dagegen als Violett (violette Dreiergruppe), und Gelber Schatz bringt Spieler 1 trotzdem 5 Aufgabenpunkte: Die erfüllte Aufgabe bleibt erfüllt (A9). ${ZUM_ABLESEN}`,
    erzeuge: tisch({ schlangen: [[...mal(5, 'Gelb'), 'Violett', 'Violett']], hand: ['Regenbogenschlange', 'Blau', 'Rot', 'Grün', 'Braun'], offen: ['Gelber Schatz', 'Lila Riese', 'Farbharmonie'], stapelOben: ['Farbenpracht', 'Farbkombination'] }),
  },
  {
    name: 'aufgabe-lila-riese',
    beschreibung:
      'A9 Nr. 15 Lila Riese, D3 (behebt C14): Zwei Spieler, mit Erweiterung. Spieler 1 hat schlange-1 mit vier violetten Karten und hält Violett, Blau, Rot, Gelb, Grün. Offen liegen Lila Riese, Gelber Schatz und Farbharmonie, oben auf dem Aufgabenstapel Farbenpracht, dann Farbkombination.',
    erwartet: `Vier violette Karten in einer Reihe genügen nicht: Legt Spieler 1 Blau an den Anfang, geschieht nichts. Legt er stattdessen Violett an ein Ende von schlange-1: Ereignisse KarteGespielt, AufgabeErfuellt (Spieler 1, Lila Riese; fünf violette Karten in einer Reihe) und AufgabeAufgedeckt (Farbenpracht an Stelle von Lila Riese). ${ZUM_ABLESEN}`,
    erzeuge: tisch({ schlangen: [mal(4, 'Violett')], hand: ['Violett', 'Blau', 'Rot', 'Gelb', 'Grün'], offen: ['Lila Riese', 'Gelber Schatz', 'Farbharmonie'], stapelOben: ['Farbenpracht', 'Farbkombination'] }),
  },
  {
    name: 'aufgabe-joker-zwei-farben',
    beschreibung:
      'A9 „Wichtig für Sonderkarten“, A7.3: Zwei Spieler, mit Erweiterung. Spieler 1 hat schlange-1 mit fünf gelben und dahinter vier violetten Karten und hält Regenbogenschlange, Blau, Rot, Grün, Braun. Offen liegen Gelber Schatz, Lila Riese und Farbharmonie, oben auf dem Aufgabenstapel Farbenpracht, Fusionsexperte, dann Farbkombination.',
    erwartet: `Legt Spieler 1 die Regenbogenschlange an Stelle 5, zwischen Gelb und Violett: Ereignisse KarteGespielt, AufgabeErfuellt (Gelber Schatz; die Regenbogenschlange zählt als Gelb), AufgabeAufgedeckt (Farbenpracht), AufgabeErfuellt (Lila Riese; dieselbe Regenbogenschlange zählt als Violett), AufgabeAufgedeckt (Fusionsexperte). Offen liegen dann Farbenpracht, Fusionsexperte, Farbharmonie; Spieler 1 hat Gelber Schatz und Lila Riese erfüllt. ${ZUM_ABLESEN}`,
    erzeuge: tisch({ schlangen: [[...mal(5, 'Gelb'), ...mal(4, 'Violett')]], hand: ['Regenbogenschlange', 'Blau', 'Rot', 'Grün', 'Braun'], offen: ['Gelber Schatz', 'Lila Riese', 'Farbharmonie'], stapelOben: ['Farbenpracht', 'Fusionsexperte', 'Farbkombination'] }),
  },
]
