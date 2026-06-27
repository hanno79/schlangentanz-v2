/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2d Pure-Logic-Helper: baueFixtureZustand injiziert eine
 *              Sonderkarte + passende Vorbedingungs-Schlange(n) in einen
 *              bestehenden Spielzustand. Genutzt vom window.__schlangentanzFixture-
 *              Hook in App.tsx, damit Live-Smokes deterministische Engine-
 *              Vorbedingungen herstellen koennen (ohne UI-Klick-Ketten).
 *
 * Sonderkarten-Vorbedingungen (laut Engine-Gates in src/engine/legalActions.ts):
 * - Schlangenfrass:   braucht eine gegnerische Schlange mit Karte in passender Farbe
 *                     ODER eine eigene Schlange mit Karte (1-Ziel-Variante)
 * - Farbendieb:       braucht eine gegnerische Schlange mit >=2 Karten
 * - Schlangenblockade: braucht eine gegnerische Schlange mit >=1 Karte
 * - Farbenschutz:     braucht eine eigene aktive Schlange mit >=1 Karte
 * - Farbenfusion:     braucht eine eigene Schlange mit 2 gleichfarbigen Karten
 *                     (Paar erkennbar durch ermittleFarbenfusionPaarInfo)
 * - Schlangenhaeutung: braucht eine eigene Schlange mit >=3 Karten
 *
 * Phase: 'Ausspielphase' (sonst sind keine Sonderkarten-Aktionen legal)
 */

import type {
  FarbkarteInfo,
  Farbe,
  Schlange,
  SonderkarteInfo,
  Spieler,
  Spielzustand,
} from '../engine/types'

export interface SchlangentanzFixtureEingabe {
  sonderkarte: { name: SonderkartenName; id: string }
  gegnerSchlange?: { id: string; farbe: Farbe; punkte: number }
}

export type SonderkartenName =
  | 'Schlangenfrass'
  | 'Farbendieb'
  | 'Schlangenblockade'
  | 'Farbenschutz'
  | 'Farbenfusion'
  | 'Schlangenhaeutung'

function farbkarte(id: string, farbe: Farbe, punkte: number): FarbkarteInfo {
  return { typ: 'Farbkarte', id, farbe, punkte }
}

function schlangeMitKarten(id: string, karten: FarbkarteInfo[], zustand: 'aktiv' = 'aktiv'): Schlange {
  return { id, karten, zustand }
}

function entferneSonderkarteMitNamen(hand: readonly (FarbkarteInfo | SonderkarteInfo)[], name: string): (FarbkarteInfo | SonderkarteInfo)[] {
  return hand.filter((karte) => !(karte.typ === 'Sonderkarte' && karte.name === name))
}

function findeAktivenMenschlichenSpieler(zustand: Spielzustand): Spieler {
  const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')
  if (mensch) return mensch
  return zustand.spieler[0]
}

function findeGegner(zustand: Spielzustand, aktiverSpielerId: string): Spieler {
  const gegner = zustand.spieler.find((spieler) => spieler.id !== aktiverSpielerId)
  if (!gegner) {
    throw new Error('baueFixtureZustand: kein Gegner im Zustand vorhanden')
  }
  return gegner
}

function baueGegnerSchlangeMitFarbe(
  schlangenId: string,
  farbe: Farbe,
  punkte: number,
  anzahlKarten = 1,
): Schlange {
  const karten: FarbkarteInfo[] = []
  for (let i = 0; i < anzahlKarten; i++) {
    karten.push(farbkarte(`${schlangenId}-karte-${i + 1}`, farbe, punkte))
  }
  return schlangeMitKarten(schlangenId, karten)
}

function baueEigeneSchlangeMitKarten(
  schlangenId: string,
  karten: FarbkarteInfo[],
): Schlange {
  return schlangeMitKarten(schlangenId, karten)
}

/**
 * Erzeugt einen neuen Spielzustand mit der Sonderkarte in hand[0] und der
 * passenden Engine-Vorbedingung (eigene/gegnerische Schlangen je nach Typ).
 * AENDERUNGEN sind immutable: zustand wird nicht mutiert.
 */
export function baueFixtureZustand(
  zustand: Spielzustand,
  eingabe: SchlangentanzFixtureEingabe,
): Spielzustand {
  const aktiverSpieler = findeAktivenMenschlichenSpieler(zustand)
  const gegner = findeGegner(zustand, aktiverSpieler.id)
  const sonderkarte: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: eingabe.sonderkarte.id,
    name: eingabe.sonderkarte.name,
  }
  const neueHand = [
    sonderkarte,
    ...entferneSonderkarteMitNamen(aktiverSpieler.hand, eingabe.sonderkarte.name),
  ]
  const aktiverSpielerNeu: Spieler = {
    ...aktiverSpieler,
    hand: neueHand,
  }
  // Kimi B1/B2 (2026-06-27): Schlangenfrass/Farbendieb muessen EIGENE Schlangen
  // bauen, daher liefert die Switch ein Tupel { aktiverSpieler, gegner }.
  const schlangenBau: { aktiverSpieler: Spieler; gegner: Spieler } = ((): {
    aktiverSpieler: Spieler
    gegner: Spieler
  } => {
    switch (eingabe.sonderkarte.name) {
      case 'Schlangenfrass': {
        const gegnerSchlangeId = eingabe.gegnerSchlange?.id ?? `${gegner.id}-fixture-gegner-schlange`
        const gegnerFarbe = eingabe.gegnerSchlange?.farbe ?? 'Blau'
        const gegnerPunkte = eingabe.gegnerSchlange?.punkte ?? 3
        // Kimi B1: Schlangenfrass mit 1 Ziel braucht EIGENE Schlange (legalActions.ts:577-581).
        // Wir bauen deshalb eine eigene Schlange mit 1 Karte in passender Farbe.
        const eigeneSchlangeId = `${aktiverSpieler.id}-fixture-frass-schlange`
        const aktiverSpielerMitEigenerSchlange: Spieler = {
          ...aktiverSpielerNeu,
          schlangen: [
            baueEigeneSchlangeMitKarten(eigeneSchlangeId, [
              farbkarte(`${eigeneSchlangeId}-karte-1`, gegnerFarbe, gegnerPunkte),
            ]),
          ],
        }
        const gegnerMitSchlange: Spieler = {
          ...gegner,
          schlangen: [
            baueGegnerSchlangeMitFarbe(gegnerSchlangeId, gegnerFarbe, gegnerPunkte),
          ],
        }
        return { aktiverSpieler: aktiverSpielerMitEigenerSchlange, gegner: gegnerMitSchlange }
      }
      case 'Farbendieb': {
        const gegnerSchlangeId = eingabe.gegnerSchlange?.id ?? `${gegner.id}-fixture-dieb-schlange`
        const gegnerFarbe = eingabe.gegnerSchlange?.farbe ?? 'Blau'
        // Kimi B2: Farbendieb iteriert ueber aktiverSpieler.schlangen (legalActions.ts:985).
        // Wir bauen deshalb eine eigene Schlange mit 1 Karte.
        const eigeneSchlangeId = `${aktiverSpieler.id}-fixture-dieb-eigene-schlange`
        const aktiverSpielerMitEigenerSchlange: Spieler = {
          ...aktiverSpielerNeu,
          schlangen: [
            baueEigeneSchlangeMitKarten(eigeneSchlangeId, [
              farbkarte(`${eigeneSchlangeId}-karte-1`, gegnerFarbe, 3),
            ]),
          ],
        }
        const gegnerMitSchlange: Spieler = {
          ...gegner,
          schlangen: [
            baueGegnerSchlangeMitFarbe(gegnerSchlangeId, gegnerFarbe, 3, 2),
          ],
        }
        return { aktiverSpieler: aktiverSpielerMitEigenerSchlange, gegner: gegnerMitSchlange }
      }
      case 'Schlangenblockade': {
        const gegnerSchlangeId = eingabe.gegnerSchlange?.id ?? `${gegner.id}-fixture-blockade-schlange`
        const gegnerFarbe = eingabe.gegnerSchlange?.farbe ?? 'Blau'
        return {
          aktiverSpieler: aktiverSpielerNeu,
          gegner: {
            ...gegner,
            schlangen: [
              baueGegnerSchlangeMitFarbe(gegnerSchlangeId, gegnerFarbe, 3),
            ],
          },
        }
      }
      case 'Farbenschutz': {
        const eigeneSchlangeId = `${aktiverSpieler.id}-fixture-schutz-schlange`
        return {
          aktiverSpieler: {
            ...aktiverSpielerNeu,
            schlangen: [
              baueEigeneSchlangeMitKarten(eigeneSchlangeId, [
                farbkarte(`${eigeneSchlangeId}-karte-1`, 'Rot', 2),
              ]),
            ],
          },
          gegner,
        }
      }
      case 'Farbenfusion': {
        const eigeneSchlangeId = `${aktiverSpieler.id}-fixture-fusion-schlange`
        return {
          aktiverSpieler: {
            ...aktiverSpielerNeu,
            schlangen: [
              baueEigeneSchlangeMitKarten(eigeneSchlangeId, [
                farbkarte(`${eigeneSchlangeId}-karte-1`, 'Blau', 2),
                farbkarte(`${eigeneSchlangeId}-karte-2`, 'Blau', 3),
              ]),
            ],
          },
          gegner,
        }
      }
      case 'Schlangenhaeutung': {
        const eigeneSchlangeId = `${aktiverSpieler.id}-fixture-haeutung-schlange`
        return {
          aktiverSpieler: {
            ...aktiverSpielerNeu,
            schlangen: [
              baueEigeneSchlangeMitKarten(eigeneSchlangeId, [
                farbkarte(`${eigeneSchlangeId}-karte-1`, 'Blau', 2),
                farbkarte(`${eigeneSchlangeId}-karte-2`, 'Rot', 2),
                farbkarte(`${eigeneSchlangeId}-karte-3`, 'Gelb', 2),
              ]),
            ],
          },
          gegner,
        }
      }
    }
  })()
  // Kimi B1/B2: fuer Schlangenfrass/Farbendieb hat die Switch-Switch bereits
  // aktiverSpieler+gegner gemeinsam zurueckgegeben (eigene Schlange noetig).
  // Wir normalisieren die Rueckgabe zu einem einheitlichen { aktiverSpieler, gegner }.
  const aktiverSpielerFinal: Spieler = schlangenBau.aktiverSpieler
  const gegnerFinal: Spieler = schlangenBau.gegner
  const aktualisierteSpieler = zustand.spieler.map((spieler) => {
    if (spieler.id === aktiverSpielerFinal.id) return aktiverSpielerFinal
    if (spieler.id === gegnerFinal.id) return gegnerFinal
    return spieler
  })
  return {
    ...zustand,
    spieler: aktualisierteSpieler,
  }
}
