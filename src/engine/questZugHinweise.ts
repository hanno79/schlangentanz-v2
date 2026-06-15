/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Engine-nahe Quest-Zughinweise für legale Schlangenbau-Aktionen aus offenen Aufgaben.
*/

import { ermittleFarbgruppen } from './colorGroups'
import { anwendeAktion } from './legalActions'
import { ermittleFarbkombinationFortschritt } from './aufgabenPruefung'
import type { Farbe, Schlange, Spielzustand } from './types'
import type { SpielAktion } from './legalActions'

export interface QuestZugHinweis {
  karteId: string
  labels: string[]
}

type SchlangenbauAktion = Extract<SpielAktion, { typ: 'KarteAnlegen' | 'NeueSchlangeStarten' }>

function offeneAufgabe(zustand: Spielzustand, name: string): boolean {
  return zustand.offeneAufgaben.some((aufgabe) => aufgabe.name === name)
}

function aktiverSpielerSchlangen(zustand: Spielzustand): Schlange[] {
  return zustand.spieler[zustand.aktiverSpielerIndex]?.schlangen ?? []
}

function farbenMitPaar(schlangen: Schlange[]): Set<Farbe> {
  const zaehler = new Map<Farbe, number>()
  for (const karte of schlangen.flatMap((schlange) => schlange.karten)) {
    if (karte.typ !== 'Farbkarte') continue
    zaehler.set(karte.farbe, (zaehler.get(karte.farbe) ?? 0) + 1)
  }
  return new Set(Array.from(zaehler.entries()).filter(([, anzahl]) => anzahl >= 2).map(([farbe]) => farbe))
}

function farbenMitDreiergruppe(schlangen: Schlange[]): Set<Farbe> {
  return new Set(schlangen.flatMap((schlange) => ermittleFarbgruppen(schlange)).map((gruppe) => gruppe.farbe))
}

function besteFarbkombination(schlangen: Schlange[]): number {
  return Math.max(0, ...schlangen.map((schlange) => ermittleFarbkombinationFortschritt(schlange).anzahl))
}

function waechstSet(vorher: Set<Farbe>, nachher: Set<Farbe>): boolean {
  return Array.from(nachher).some((farbe) => !vorher.has(farbe))
}

function questLabelsFuerAktion(vorher: Spielzustand, aktion: SchlangenbauAktion): string[] {
  const nachher = anwendeAktion(vorher, aktion)
  const vorherSchlangen = aktiverSpielerSchlangen(vorher)
  const nachherSchlangen = aktiverSpielerSchlangen(nachher)
  const labels: string[] = []

  if (offeneAufgabe(vorher, 'Farbenpracht') && waechstSet(farbenMitPaar(vorherSchlangen), farbenMitPaar(nachherSchlangen))) {
    labels.push('Farbenpracht-Paar')
  }
  if (offeneAufgabe(vorher, 'Farbkombination') && besteFarbkombination(nachherSchlangen) > besteFarbkombination(vorherSchlangen)) {
    labels.push('Farbkombination +1')
  }
  if (offeneAufgabe(vorher, 'Farbharmonie') && waechstSet(farbenMitDreiergruppe(vorherSchlangen), farbenMitDreiergruppe(nachherSchlangen))) {
    labels.push('Farbharmonie-Gruppe')
  }

  return labels
}

export function ermittleQuestZugHinweise(zustand: Spielzustand, legaleAktionen: SpielAktion[]): QuestZugHinweis[] {
  const schlangenbauAktionen = legaleAktionen.filter((aktion): aktion is SchlangenbauAktion => aktion.typ === 'KarteAnlegen' || aktion.typ === 'NeueSchlangeStarten')
  const labelsNachKarte = new Map<string, Set<string>>()

  for (const aktion of schlangenbauAktionen) {
    const labels = questLabelsFuerAktion(zustand, aktion)
    if (labels.length === 0) continue
    const set = labelsNachKarte.get(aktion.handkartenId) ?? new Set<string>()
    labels.forEach((label) => set.add(label))
    labelsNachKarte.set(aktion.handkartenId, set)
  }

  return zustand.spieler[zustand.aktiverSpielerIndex].hand
    .map((karte) => ({ karteId: karte.id, labels: Array.from(labelsNachKarte.get(karte.id) ?? []) }))
    .filter((hinweis) => hinweis.labels.length > 0)
}
