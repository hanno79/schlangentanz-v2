/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Präsentationshelfer für spielnahe Quest-Fährten auf der Waldtanz-Aufgabentafel.
*/

import { ermittleFarbgruppen, ermittleFarbkombinationFortschritt } from '../engine'
import type { AufgabenkarteInfo, Farbe, Schlange, Spielkarte, Spielzustand } from '../engine'

const ALLE_FARBEN: Farbe[] = ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun']

export interface QuestFaehrte {
  hauptwert: string
  chips: string[]
}

function aktiveSchlangen(zustand: Spielzustand): Schlange[] {
  return zustand.spieler[zustand.aktiverSpielerIndex]?.schlangen ?? []
}

function farbzaehler(schlangen: Schlange[]): Map<Farbe, number> {
  const zaehler = new Map<Farbe, number>()
  for (const karte of schlangen.flatMap((schlange) => schlange.karten)) {
    if (karte.typ !== 'Farbkarte') continue
    zaehler.set(karte.farbe, (zaehler.get(karte.farbe) ?? 0) + 1)
  }
  return zaehler
}

function farbenprachtFaehrte(zustand: Spielzustand): QuestFaehrte {
  const zaehler = farbzaehler(aktiveSchlangen(zustand))
  const fertigeFarben = ALLE_FARBEN.filter((farbe) => (zaehler.get(farbe) ?? 0) >= 2)
  const chips = fertigeFarben.length > 0
    ? fertigeFarben.map((farbe) => `${farbe} ×${zaehler.get(farbe)}`)
    : ['noch keine Farbenpaare']

  return { hauptwert: `Farbenpaare: ${fertigeFarben.length}/6`, chips }
}

function farbkombinationFaehrte(zustand: Spielzustand): QuestFaehrte {
  const beste = aktiveSchlangen(zustand)
    .map(ermittleFarbkombinationFortschritt)
    .sort((a, b) => b.anzahl - a.anzahl)[0]

  if (!beste || !beste.farbe) {
    return { hauptwert: 'Farbkombination: 0/5', chips: ['noch 5 Karten'] }
  }

  return {
    hauptwert: `Farbkombination: ${beste.farbe} ×${beste.anzahl}/5`,
    chips: [beste.bereit ? 'bereit' : `noch ${beste.fehlendeKarten} ${beste.fehlendeKarten === 1 ? 'Karte' : 'Karten'}`],
  }
}

function laengsteFarbwechselKette(karten: Spielkarte[]): number {
  let beste = 0
  let fenster: Farbe[] = []

  for (const karte of karten) {
    if (karte.typ !== 'Farbkarte') {
      fenster = []
      continue
    }

    const gleicheFarbeIndex = fenster.indexOf(karte.farbe)
    if (gleicheFarbeIndex >= 0) {
      fenster = fenster.slice(gleicheFarbeIndex + 1)
    }
    fenster.push(karte.farbe)
    beste = Math.max(beste, Math.min(4, fenster.length))
  }

  return beste
}

function farbwechslerFaehrte(zustand: Spielzustand): QuestFaehrte {
  const besteKette = Math.max(0, ...aktiveSchlangen(zustand).map((schlange) => laengsteFarbwechselKette(schlange.karten)))
  return {
    hauptwert: `Farbwechsel-Kette: ${besteKette}/4`,
    chips: [besteKette >= 4 ? 'bereit' : `noch ${4 - besteKette} ${4 - besteKette === 1 ? 'Farbe' : 'Farben'}`],
  }
}

function farbharmonieFaehrte(zustand: Spielzustand): QuestFaehrte {
  const gruppenFarben = new Set(
    aktiveSchlangen(zustand)
      .flatMap((schlange) => ermittleFarbgruppen(schlange))
      .map((gruppe) => gruppe.farbe),
  )

  return {
    hauptwert: `Dreiergruppen: ${gruppenFarben.size}/6 Farben`,
    chips: gruppenFarben.size > 0 ? Array.from(gruppenFarben).map((farbe) => `${farbe}-Gruppe`) : ['noch keine Dreiergruppe'],
  }
}

export function ermittleQuestFaehrte(aufgabe: AufgabenkarteInfo, zustand: Spielzustand): QuestFaehrte {
  switch (aufgabe.name) {
    case 'Farbenpracht':
      return farbenprachtFaehrte(zustand)
    case 'Farbharmonie':
      return farbharmonieFaehrte(zustand)
    case 'Farbkombination':
      return farbkombinationFaehrte(zustand)
    case 'Farbwechsler':
      return farbwechslerFaehrte(zustand)
    default:
      return { hauptwert: 'Fährte: Schlangenlichtung beobachten', chips: ['Schlangen bauen'] }
  }
}
