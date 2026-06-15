/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Zielspur-Zählung und Dimm-Entscheidung für sichtbare Waldtanz-Brettziele.
*/
import type { SpielAktion, Spieler } from '../engine'

type Aktion<T extends SpielAktion['typ']> = Extract<SpielAktion, { typ: T }>

interface ZielspurOptionen {
  handkartenId: string | null
  aktiverSpielerId: string
  aktiverSpielerSchlangen: Spieler['schlangen']
  karteAnlegenAktionen: Aktion<'KarteAnlegen'>[]
  neueSchlangeStartenAktionen: Aktion<'NeueSchlangeStarten'>[]
  farbenschutzAktionen: Aktion<'FarbenschutzSpielen'>[]
  farbenfusionAktionen: Aktion<'FarbenfusionSpielen'>[]
  schlangenfrassAktionen: Aktion<'SchlangenfrassSpielen'>[]
  schlangenblockadeAktionen: Aktion<'SchlangenblockadeSpielen'>[]
  farbendiebAktionen: Aktion<'FarbendiebSpielen'>[]
  haeutungZielAnzahl: number
}

function passt(aktion: { handkartenId: string }, handkartenId: string) {
  return aktion.handkartenId === handkartenId
}

function add(set: Set<string>, key: string) {
  set.add(key)
}

export function hatSichtbaresEigenesSchlangenziel({
  handkartenId,
  spielerId,
  schlangenId,
  farbenfusionAktionen,
  schlangenfrassAktionen,
}: {
  handkartenId: string | null
  spielerId: string
  schlangenId: string
  farbenfusionAktionen: Aktion<'FarbenfusionSpielen'>[]
  schlangenfrassAktionen: Aktion<'SchlangenfrassSpielen'>[]
}) {
  if (!handkartenId) return false
  return farbenfusionAktionen.some(aktion => passt(aktion, handkartenId) && aktion.zielSchlangenId === schlangenId) ||
    schlangenfrassAktionen.some(aktion => passt(aktion, handkartenId) && aktion.ziele.some(ziel => ziel.spielerId === spielerId && ziel.schlangenId === schlangenId))
}

export function zaehleZielspurBrettziele({
  handkartenId,
  aktiverSpielerId,
  aktiverSpielerSchlangen,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  farbenschutzAktionen,
  farbenfusionAktionen,
  schlangenfrassAktionen,
  schlangenblockadeAktionen,
  farbendiebAktionen,
  haeutungZielAnzahl,
}: ZielspurOptionen) {
  if (!handkartenId) return 0
  const ziele = new Set<string>()
  for (const aktion of karteAnlegenAktionen) if (passt(aktion, handkartenId)) add(ziele, `anlegen:${aktion.schlangenId}:${aktion.position}`)
  for (const aktion of neueSchlangeStartenAktionen) if (passt(aktion, handkartenId)) add(ziele, 'startkreis')
  for (const aktion of farbenschutzAktionen) if (passt(aktion, handkartenId)) add(ziele, `schutz:${aktion.zielSchlangenId}`)
  for (const aktion of farbenfusionAktionen) if (passt(aktion, handkartenId)) add(ziele, `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`)
  for (const aktion of schlangenfrassAktionen) if (passt(aktion, handkartenId)) for (const ziel of aktion.ziele) add(ziele, `frass:${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`)
  for (const aktion of schlangenblockadeAktionen) if (passt(aktion, handkartenId)) add(ziele, `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`)
  for (const aktion of farbendiebAktionen) if (passt(aktion, handkartenId)) add(ziele, `dieb:${aktion.zielSpielerId}:${aktion.zielSchlangenId}:${aktion.zielKartenId}:${aktion.eigeneSchlangenId}:${aktion.einfügeIndex}`)
  for (const schlange of aktiverSpielerSchlangen.slice(0, haeutungZielAnzahl)) add(ziele, `haeutung:${aktiverSpielerId}:${schlange.id}`)
  return ziele.size
}
