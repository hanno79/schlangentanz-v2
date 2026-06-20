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

export interface ZielspurFamilie {
  key: string
  label: string
  anzahl: number
  hilfe: string
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

function sammleZielspurBrettziele({
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
  if (!handkartenId) return { alle: new Set<string>(), start: new Set<string>(), wachstum: new Set<string>(), eigene: new Set<string>(), gegner: new Set<string>() }
  const alle = new Set<string>(), start = new Set<string>(), wachstum = new Set<string>(), eigene = new Set<string>(), gegner = new Set<string>()
  for (const aktion of karteAnlegenAktionen) if (passt(aktion, handkartenId)) { add(wachstum, `${aktion.schlangenId}:${aktion.position}`); add(alle, `anlegen:${aktion.schlangenId}:${aktion.position}`) }
  for (const aktion of neueSchlangeStartenAktionen) if (passt(aktion, handkartenId)) { add(start, 'startkreis'); add(alle, 'startkreis') }
  for (const aktion of farbenschutzAktionen) if (passt(aktion, handkartenId)) { add(eigene, `schutz:${aktion.zielSchlangenId}`); add(alle, `schutz:${aktion.zielSchlangenId}`) }
  for (const aktion of farbenfusionAktionen) if (passt(aktion, handkartenId)) { add(eigene, `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`); add(alle, `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`) }
  for (const aktion of schlangenfrassAktionen) if (passt(aktion, handkartenId)) for (const ziel of aktion.ziele) {
    const key = `frass:${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`
    add(ziel.spielerId === aktiverSpielerId ? eigene : gegner, key)
    add(alle, key)
  }
  for (const aktion of schlangenblockadeAktionen) if (passt(aktion, handkartenId)) { add(gegner, `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`); add(alle, `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`) }
  for (const aktion of farbendiebAktionen) if (passt(aktion, handkartenId)) {
    const key = `dieb:${aktion.zielSpielerId}:${aktion.zielSchlangenId}:${aktion.zielKartenId}`
    add(gegner, key)
    add(alle, key)
  }
  for (const schlange of aktiverSpielerSchlangen.slice(0, haeutungZielAnzahl)) { add(eigene, `haeutung:${aktiverSpielerId}:${schlange.id}`); add(alle, `haeutung:${aktiverSpielerId}:${schlange.id}`) }
  return { alle, start, wachstum, eigene, gegner }
}

export function ermittleZielspurFamilien(optionen: ZielspurOptionen): ZielspurFamilie[] {
  const { start, wachstum, eigene, gegner } = sammleZielspurBrettziele(optionen)
  return [
    { key: 'startkreis', label: 'Startkreis', anzahl: start.size, hilfe: 'neue Schlange' },
    { key: 'wachstum', label: 'Wachstumsenden', anzahl: wachstum.size, hilfe: 'Schlangenpfad' },
    { key: 'eigene-zauber', label: 'Eigene Zauberziele', anzahl: eigene.size, hilfe: 'Lichtung' },
    { key: 'gegner-zauber', label: 'Gegnerziele', anzahl: gegner.size, hilfe: 'Tischrunde' },
  ].filter((familie) => familie.anzahl > 0)
}

export function zaehleZielspurBrettziele(optionen: ZielspurOptionen) {
  return sammleZielspurBrettziele(optionen).alle.size
}
