import { expect } from 'vitest'
import { ermittleAktionen } from '../index'
import type { SpielAktion, Spielkarte, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl, Schlangenglied } from '../testing/szenario'
import { pruefeSchritt } from './rahmen_hilfen'
import { fuehreAus } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Regeltests der Risiko-Belohnungs-Karten (A8.2, X5). Gespielt
wird nur, was die Engine aufzählt; jeder Schritt geht durch `pruefeSchritt`
(nachrechenbar aus den Ereignissen, kein Ereignis verrät eine Handkarte, jede
Invariante hält).
*/

export const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']

export interface RisikoTisch {
  /** Die Hand von Spieler 1, der am Zug ist. */
  hand: Kartenwahl[]
  /** Oben auf dem Nachziehstapel, oberste zuerst. */
  oben?: Kartenwahl[]
  /** Die eigene Schlange von Spieler 1. */
  schlange?: Schlangenglied[]
  /** Der Ablagestapel von Spieler 1. */
  ablage?: Kartenwahl[]
  spielerzahl?: number
  /** Danach noch am Baukasten. */
  weiter?: (bau: Baukasten) => void
}

/** Ein Tisch mit Erweiterung; die Gegner halten je fünf Farbkarten, KI-Gegner 1 hat eine eigene Schlange Rot, Rot. */
export function risikoTisch({ hand, oben = [], schlange, ablage, spielerzahl = 3, weiter }: RisikoTisch): Spielzustand {
  const bau = baukasten({ spielerzahl, erweiterung: true }).hand(0, hand)
  for (let index = 1; index < spielerzahl; index += 1) bau.hand(index, FUENF)
  bau.schlange(1, ['Rot', 'Rot'])
  if (schlange !== undefined) bau.schlange(0, schlange)
  if (ablage !== undefined) bau.ablage(0, ablage)
  bau.stapelOben(oben)
  weiter?.(bau)
  return bau.zustand()
}

/** Die Id der ersten Karte dieser Farbe oder dieses Namens auf der Hand oder dem Ablagestapel des Spielers. */
export function idVon(zustand: Spielzustand, spieler: number, wahl: string, ort: 'hand' | 'ablagestapel' = 'hand'): string {
  const karte = zustand.spieler[spieler][ort].find((eintrag: Spielkarte) => (eintrag.typ === 'Farbkarte' ? eintrag.farbe : eintrag.name) === wahl)
  if (karte === undefined) throw new Error(`Testaufbau: ${wahl} liegt nicht auf ${ort} von Spieler ${spieler}.`)
  return karte.id
}

/** Die Id der Schlangenkarte an Stelle `position` in der ersten Schlange des Spielers. */
export function schlangenkarte(zustand: Spielzustand, spieler: number, position: number): string {
  return zustand.spieler[spieler].schlangen[0].karten[position].id
}

/** Die aufgezählten Risiko-Aktionen des Entscheiders. */
export function risikoAktionen(zustand: Spielzustand): SpielAktion[] {
  return ermittleAktionen(zustand).filter((aktion) => aktion.typ === 'RisikoKarteSpielen')
}

/** Die aufgezählte Risiko-Aktion `nummer` mit dieser benannten Karte; sie muss angeboten sein. */
export function risiko(zustand: Spielzustand, nummer: number, benannt: string | null = null): SpielAktion {
  const passend = risikoAktionen(zustand).find((aktion) => 'risikoAktion' in aktion && aktion.risikoAktion === nummer && aktion.benannt === benannt)
  expect(passend, `Risiko-Aktion ${nummer} mit ${String(benannt)} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

/** Spielt die Risiko-Aktion und prüft den Schritt. */
export function spieleRisiko(zustand: Spielzustand, nummer: number, benannt: string | null = null): Schritt {
  return pruefeSchritt(zustand, fuehreAus(zustand, risiko(zustand, nummer, benannt)))
}

/** Die aufgezählten Wahlen der offenen Entscheidung. */
export function wahlen(zustand: Spielzustand): string[] {
  return ermittleAktionen(zustand).flatMap((aktion) => (aktion.typ === 'Entscheiden' ? [aktion.wahl] : []))
}

/** Trifft die aufgezählte Wahl und prüft den Schritt. */
export function waehle(zustand: Spielzustand, wahl: string): Schritt {
  const angebot = ermittleAktionen(zustand).find((aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === wahl)
  expect(angebot, `Die Wahl „${wahl}“ ist nicht angeboten; angeboten: ${wahlen(zustand).join(', ')}`).toBeDefined()
  return pruefeSchritt(zustand, fuehreAus(zustand, angebot!))
}
