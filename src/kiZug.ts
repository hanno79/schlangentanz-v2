/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: UI-nahe KI-Zug-Automation fuer das Vorspulen von Gegnerzuegen bis zum naechsten menschlichen Zug.
*/

import {
  anwendeAktion,
  beendeAufgabenpruefung,
  beendeAusspielphase,
  beendeZug,
  ermittleLegaleAktionen,
  ermittleReaktionsAktionen,
  HANDKARTENLIMIT,
  starteAusspielphase,
  werfeUeberzaehligeHandkartenAb,
} from './engine'
import type { Spielzustand } from './engine'
import { aktionsLabel } from './aktionsLabel'

export interface KiZugVorspulErgebnis {
  zustand: Spielzustand
  protokoll: string[]
}

function aktiverName(zustand: Spielzustand): string {
  return zustand.spieler[zustand.aktiverSpielerIndex].name
}

function ueberhandAbwurfKartenIds(zustand: Spielzustand): string[] {
  const hand = zustand.spieler[zustand.aktiverSpielerIndex].hand
  return hand.slice(HANDKARTENLIMIT).map(karte => karte.id)
}

function reaktionsSpielerIndex(zustand: Spielzustand): number | null {
  const pending = zustand.pendingReaktion
  if (pending === null) return null
  switch (pending.typ) {
    case 'SchlangengrubeAbwehr':
    case 'SchlangenblockadeAbwehr':
    case 'FarbendiebAbwehr':
      return pending.zielSpielerIndex
    case 'VerdopplerAbwehr':
      return pending.verbleibendeSpielerIndizes[0] ?? null
    case 'SchlangenfrassAbwehr':
      return pending.verbleibendeZiele[0]?.spielerIndex ?? null
  }
}

function brauchtMenschlicheReaktion(zustand: Spielzustand): boolean {
  const index = reaktionsSpielerIndex(zustand)
  return index !== null && zustand.spieler[index]?.steuerung === 'Mensch'
}

export function spieleKiZuegeBisZumMenschen(start: Spielzustand): KiZugVorspulErgebnis {
  let zustand = start
  const protokoll: string[] = []

  for (let schritt = 0; schritt < 80; schritt += 1) {
    const spieler = zustand.spieler[zustand.aktiverSpielerIndex]
    if (zustand.zugphase === 'Spielende' || spieler.steuerung === 'Mensch') break
    const name = aktiverName(zustand)

    if (brauchtMenschlicheReaktion(zustand)) {
      protokoll.push(`${name}: wartet auf eine menschliche Reaktion.`)
      break
    }

    const reaktionsAktionen = ermittleReaktionsAktionen(zustand)
    if (reaktionsAktionen.length > 0) {
      const aktion = reaktionsAktionen[0]
      protokoll.push(`${name}: ${aktionsLabel(aktion)}.`)
      zustand = anwendeAktion(zustand, aktion)
      continue
    }

    if (zustand.zugphase === 'Nachziehphase') {
      protokoll.push(`${name}: Ausspielphase gestartet.`)
      zustand = starteAusspielphase(zustand)
      continue
    }

    if (zustand.zugphase === 'Ausspielphase') {
      if (zustand.zugpflichten.gespielteKarten > 0) {
        protokoll.push(`${name}: Ausspielphase beendet.`)
        zustand = beendeAusspielphase(zustand)
        continue
      }
      const aktionen = ermittleLegaleAktionen(zustand)
      if (aktionen.length === 0) {
        protokoll.push(`${name}: kann gerade keine Aktion ausführen.`)
        break
      }
      const aktion = aktionen[0]
      protokoll.push(`${name}: ${aktionsLabel(aktion)}.`)
      zustand = anwendeAktion(zustand, aktion)
      continue
    }

    if (zustand.zugphase === 'Aufgabenpruefung') {
      protokoll.push(`${name}: Aufgabenprüfung abgeschlossen.`)
      zustand = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true })
      continue
    }

    if (zustand.zugphase === 'Zugabschluss') {
      const abwurfIds = ueberhandAbwurfKartenIds(zustand)
      if (abwurfIds.length > 0) {
        protokoll.push(`${name}: ${abwurfIds.length} überzählige Karten abgeworfen.`)
        zustand = werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: abwurfIds })
        continue
      }
      protokoll.push(`${name}: Zug beendet.`)
      zustand = beendeZug(zustand, { pflichtenErfuellt: true })
      continue
    }
  }

  return { zustand, protokoll }
}
