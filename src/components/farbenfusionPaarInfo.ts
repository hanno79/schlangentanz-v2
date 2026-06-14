/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Hilfslogik für sichtbare Farbenfusion-Paare im Schlangenbereich.
*/
import type { SpielAktion, Spielkarte } from '../engine'

type FarbenfusionAktion = Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>

export interface FarbenfusionPaarInfo {
  aktion: FarbenfusionAktion
  ersteKartenId: string
  zweiteKartenId: string
  punkte: number
  istStartkarte: boolean
}

function kartenPunkte(karte: Spielkarte | undefined) {
  return karte?.typ === 'Farbkarte' ? karte.punkte : 0
}

function findeAktion(
  aktionen: FarbenfusionAktion[],
  handkartenId: string | null,
  zielSchlangenId: string,
  zielKartenId: string | undefined,
) {
  if (!handkartenId || !zielKartenId) return null
  return aktionen.find((aktion) =>
    aktion.handkartenId === handkartenId &&
    aktion.zielSchlangenId === zielSchlangenId &&
    aktion.zielKartenId === zielKartenId,
  ) ?? null
}

export function ermittleFarbenfusionPaarInfo(
  karten: Spielkarte[],
  kartenIndex: number,
  zielSchlangenId: string,
  handkartenId: string | null,
  aktionen: FarbenfusionAktion[],
): FarbenfusionPaarInfo | null {
  const aktuelleKarte = karten[kartenIndex]
  const startAktion = findeAktion(aktionen, handkartenId, zielSchlangenId, aktuelleKarte?.id)
  if (startAktion) {
    const zweiteKarte = karten[kartenIndex + 1]
    return {
      aktion: startAktion,
      ersteKartenId: aktuelleKarte.id,
      zweiteKartenId: zweiteKarte?.id ?? '',
      punkte: kartenPunkte(aktuelleKarte) + kartenPunkte(zweiteKarte),
      istStartkarte: true,
    }
  }

  const ersteKarte = karten[kartenIndex - 1]
  const partnerAktion = findeAktion(aktionen, handkartenId, zielSchlangenId, ersteKarte?.id)
  if (!partnerAktion) return null
  return {
    aktion: partnerAktion,
    ersteKartenId: ersteKarte.id,
    zweiteKartenId: aktuelleKarte.id,
    punkte: kartenPunkte(ersteKarte) + kartenPunkte(aktuelleKarte),
    istStartkarte: false,
  }
}
