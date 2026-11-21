import { afterEach } from 'vitest'
import type { AufgabenkarteInfo, Ereignis, Farbe, SpielAktion, Spielzustand } from '../index'
import { legeAufgabenAus } from '../testing/aufgaben'
import type { Aufgabenauslage } from '../testing/aufgaben'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { entferneTestbedingungen } from '../testing/testaufgaben'
import type { Testbedingung } from '../testing/testaufgaben'
import { aktionen, fuehreAus } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Aufgabenrahmens (X1). Die 15 Aufgaben aus A9 prüft
erst X2; bis dahin sind sie Platzhalter, die nie erfüllt sind. Die Tests geben
einzelnen Aufgaben deshalb eine Testbedingung (`setzeTestbedingungen`), die mit
der Bedingung auf der Karte nichts zu tun hat. Nach jedem Test gelten wieder
die Platzhalter.
*/

afterEach(() => {
  entferneTestbedingungen()
})

/** Testbedingung: Der Spieler hat eine Schlange mit mindestens `laenge` Karten. */
export function schlangeAb(laenge: number): Testbedingung {
  return (zustand, spielerIndex) => zustand.spieler[spielerIndex].schlangen.some((schlange) => schlange.karten.length >= laenge)
}

/** Testbedingung: immer erfüllt, für jeden Spieler oder nur für `nurFuer`. */
export function immer(nurFuer?: number): Testbedingung {
  return (_zustand, spielerIndex) => nurFuer === undefined || spielerIndex === nurFuer
}

export const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']

/** Die Auslage der meisten Tests: drei offene, zwei oben auf dem Stapel, je Spieler eine geheime. */
export const AUSLAGE: Aufgabenauslage = {
  offen: ['Farbkombination', 'Fusionsexperte', 'Lila Riese'],
  stapelOben: ['Gelber Schatz', 'Farbvielfalt'],
  geheim: [
    [0, 'Schlangentanz'],
    [1, 'Symmetriemeister'],
  ],
}

/**
 * Zwei Spieler mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange
 * Blau-Blau (`schlange-1`) und hält `hand0`; KI-Gegner 1 hält `hand1`.
 */
export function aufgabenTisch(hand0: Kartenwahl[] = FUENF, hand1: Kartenwahl[] = FUENF, auslage: Aufgabenauslage = AUSLAGE): Baukasten {
  return baukasten({ spielerzahl: 2, erweiterung: true })
    .schlange(0, ['Blau', 'Blau'])
    .hand(0, hand0)
    .hand(1, hand1)
    .aendere((zustand) => legeAufgabenAus(zustand, auslage))
}

/** Die Id der ersten Handkarte dieser Farbe beim Spieler am Zug. */
function farbkarteAufHand(zustand: Spielzustand, farbe: Farbe): string {
  const karte = zustand.spieler[zustand.zug.spielerIndex].hand.find((handkarte) => handkarte.typ === 'Farbkarte' && handkarte.farbe === farbe)
  if (karte === undefined) throw new Error(`Testaufbau: Der Spieler am Zug hält kein ${farbe}`)
  return karte.id
}

/** Der Spieler am Zug legt eine Karte dieser Farbe ans Ende der Schlange `schlangenId` (A5, D9). */
export function legeAn(zustand: Spielzustand, farbe: Farbe, schlangenId = 'schlange-1'): Schritt {
  const karteId = farbkarteAufHand(zustand, farbe)
  const aktion = aktionen(zustand, 'FarbkarteLegen').find(
    (eintrag) => eintrag.typ === 'FarbkarteLegen' && eintrag.karteId === karteId && eintrag.ziel.art === 'schlange' && eintrag.ziel.schlangenId === schlangenId && eintrag.ziel.seite === 'ende',
  )
  if (aktion === undefined) throw new Error(`Testaufbau: ${farbe} ans Ende von ${schlangenId} ist nicht aufgezählt`)
  return fuehreAus(zustand, aktion)
}

/** Die erste aufgezählte Aktion, die zur Wahl passt. */
export function erste(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): SpielAktion {
  const aktion = aktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(aktionen(zustand))}`)
  return aktion
}

const AUFGABEN_EREIGNISSE: ReadonlySet<string> = new Set(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabenstapelLeer'])

/** Nur die Ereignisse zu Aufgaben, in ihrer Reihenfolge. */
export function aufgabenEreignisse(ereignisse: Ereignis[]): Ereignis[] {
  return ereignisse.filter((ereignis) => AUFGABEN_EREIGNISSE.has(ereignis.typ))
}

export function namen(aufgaben: readonly AufgabenkarteInfo[]): string[] {
  return aufgaben.map((aufgabe) => aufgabe.name)
}

/** Die Id der Aufgabe mit diesem Namen (A9: `aufgabe-<Nummer>`). */
export function aufgabeId(zustand: Spielzustand, name: string): string {
  const alle = [
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
    ...zustand.spieler.flatMap((spieler) => [...spieler.erfuellteAufgaben, ...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe])]),
  ]
  const aufgabe = alle.find((eintrag) => eintrag.name === name)
  if (aufgabe === undefined) throw new Error(`Testaufbau: Die Aufgabe ${name} liegt nicht im Spiel`)
  return aufgabe.id
}
