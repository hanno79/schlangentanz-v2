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
  ermittleNichtEnumerierteAktionenHinweise,
  ermittleReaktionsAktionen,
  HANDKARTENLIMIT,
  starteAusspielphase,
  werfeUeberzaehligeHandkartenAb,
} from './engine'
import type { Spielzustand, SpielAktion } from './engine'
import { erstelleAktionsLabel } from './aktionsLabel'

export interface KiZugVorspulErgebnis {
  zustand: Spielzustand
  /** Jeder Schritt, auch Phasenwechsel — für Diagnose und Tests. */
  protokoll: string[]
  /**
   * Nur die Züge, die etwas am Brett verändert haben.
   *
   * ÄNDERUNG [31.07.2026]: Seit der Gegnerzug ohne Klick durchläuft, ist das
   * Protokoll die einzige Rückmeldung darüber, was passiert ist — und dort
   * zählt, was der Gegner *gespielt* hat. „Ausspielphase gestartet",
   * „Aufgabenprüfung abgeschlossen" und „Zug beendet" sind Buchhaltung; sie
   * verdrängen im Brett nur die Spielfläche.
   */
  spielzuege: string[]
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

// H1: Baut eine triviale, garantiert reihenfolge-ändernde Schlangenhäutung (Rotation der
// längsten aktiven Schlange) für die KI, sofern eine Häutung die einzige Option ist.
function baueKiSchlangenhaeutung(zustand: Spielzustand): SpielAktion | null {
  if (!ermittleNichtEnumerierteAktionenHinweise(zustand).some((hinweis) => hinweis.typ === 'Schlangenhaeutung')) {
    return null
  }
  const spieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const haeutungKarte = spieler.hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung')
  const schlange = [...spieler.schlangen]
    .filter((s) => s.zustand === 'aktiv' && s.karten.length > 1)
    .sort((a, b) => b.karten.length - a.karten.length)[0]
  if (!haeutungKarte || !schlange) return null
  const ids = schlange.karten.map((karte) => karte.id)
  const rotiert = [...ids.slice(1), ids[0]] // Rotation ändert bei eindeutigen Ids stets die Reihenfolge.
  return {
    typ: 'SchlangenhaeutungSpielen',
    spielerId: spieler.id,
    handkartenId: haeutungKarte.id,
    schlangenId: schlange.id,
    kartenIdsInNeuerReihenfolge: rotiert,
  }
}

export function spieleKiZuegeBisZumMenschen(start: Spielzustand): KiZugVorspulErgebnis {
  let zustand = start
  const protokoll: string[] = []
  const spielzuege: string[] = []
  /** Schritt ins Protokoll — `istZug`, wenn er das Brett verändert hat. */
  const notiere = (zeile: string, istZug = false) => {
    protokoll.push(zeile)
    if (istZug) spielzuege.push(zeile)
  }

  for (let schritt = 0; schritt < 80; schritt += 1) {
    const spieler = zustand.spieler[zustand.aktiverSpielerIndex]
    if (zustand.zugphase === 'Spielende' || spieler.steuerung === 'Mensch') break
    const name = aktiverName(zustand)

    if (brauchtMenschlicheReaktion(zustand)) {
      notiere(`${name}: wartet auf eine menschliche Reaktion.`, true)
      break
    }

    const reaktionsAktionen = ermittleReaktionsAktionen(zustand)
    if (reaktionsAktionen.length > 0) {
      const aktion = reaktionsAktionen[0]
      notiere(`${name}: ${erstelleAktionsLabel(zustand)(aktion)}.`, true)
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
        // H1: Ist die einzige spielbare Option eine (nicht enumerierte) Schlangenhäutung,
        // spielt die KI eine triviale Neuordnung (Rotation) statt hängen zu bleiben.
        const haeutungZug = baueKiSchlangenhaeutung(zustand)
        if (haeutungZug !== null) {
          notiere(`${name}: Schlangenhäutung gespielt.`, true)
          zustand = anwendeAktion(zustand, haeutungZug)
          continue
        }
        // H2: Ohne Handkarten (z. B. im Endspurt) besteht keine Zugpflicht — Phase beenden statt hängen.
        if (spieler.hand.length === 0 && zustand.zugpflichten.gespielteKarten === 0) {
          protokoll.push(`${name}: keine Handkarten — Ausspielphase beendet.`)
          zustand = beendeAusspielphase(zustand)
          continue
        }
        notiere(`${name}: kann gerade keine Aktion ausführen.`, true)
        break
      }
      const aktion = aktionen[0]
      notiere(`${name}: ${erstelleAktionsLabel(zustand)(aktion)}.`, true)
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
        notiere(`${name}: ${abwurfIds.length} überzählige Karten abgeworfen.`, true)
        zustand = werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: abwurfIds })
        continue
      }
      protokoll.push(`${name}: Zug beendet.`)
      zustand = beendeZug(zustand, { pflichtenErfuellt: true })
      continue
    }
  }

  return { zustand, protokoll, spielzuege }
}
