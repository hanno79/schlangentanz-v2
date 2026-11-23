// @vitest-environment node
import { isDeepStrictEqual } from 'node:util'
import { describe, expect, it } from 'vitest'
import { benannteHandkarten } from '../../index'
import type { Spielzustand } from '../../index'
import { dauerlauf, dauerlaufPartien } from '../../testing/dauerlauf'
import type { SchrittPruefer } from '../../testing/dauerlauf'
import { allePruefer, neueReaktionen, reaktionsPruefer, regelPruefer, stapelPruefer } from '../dauerlauf_pruefer'
import { lageVon, spieleNach, verrateneHandkarten } from '../nachrechnen'

/*
X5: Risiko-Karten im Dauerlauf mit Erweiterung. Zufallspartien mit festen
Saaten spielen alle vier Aktionen mit Erfolg und Misserfolg; in jedem Schritt
gelten zusätzlich zu den Invarianten: nur im eigenen Zug und nie in der
Schlussrunde (D55), höchstens eine je Runde (D50), was die Oberfläche zeigt,
lässt sich aus den Ereignissen nachrechnen (Plan E2), und weder eine offene
Entscheidung noch ein Ereignis nennt eine Karte, die verdeckt auf einer Hand
liegt (B2), ausser der offen benannten Farbkarte aus Aktion 2 (D52).
*/

/** Jede Id und jedes Wort in einer offenen Entscheidung; Wahlen wie „blau-01 schlange-2 ende“ zählen Wort für Wort. */
function woerterDerEntscheidung(zustand: Spielzustand): string[] {
  const { entscheidung } = zustand
  if (entscheidung === null) return []
  return [entscheidung.art, ...entscheidung.optionen, ...Object.values(entscheidung.daten).map(String)].flatMap((text) => text.split(' '))
}

interface Zaehler {
  gespielt: Record<string, number>
  gegnerEntscheidet: number
}

function risikoPruefer(zaehler: Zaehler): SchrittPruefer {
  let runde = 0
  const genutzt = new Set<number>()
  return (vorher, _aktion, { zustand, ereignisse }) => {
    for (const ereignis of ereignisse) {
      if (ereignis.typ === 'ZugBegonnen' && ereignis.teilzug === 1) runde += 1
      if (ereignis.typ === 'EntscheidungVerlangt' && ereignis.art.startsWith('Risiko') && ereignis.spielerIndex !== vorher.zug.spielerIndex) zaehler.gegnerEntscheidet += 1
      if (ereignis.typ !== 'RisikoKarteGespielt') continue
      if (ereignis.spielerIndex !== vorher.zug.spielerIndex) return `A8.2: ${ereignis.spielerIndex} spielt eine Risiko-Karte ausserhalb seines Zuges.`
      if (vorher.partiephase !== 'Laufend') return 'D55: Risiko-Karte in der Schlussrunde.'
      if (genutzt.has(runde)) return `D50: zweite Risiko-Karte in Runde ${runde}.`
      genutzt.add(runde)
      const schluessel = `${ereignis.risikoAktion}-${ereignis.erfolg ? 'Erfolg' : 'Misserfolg'}`
      zaehler.gespielt[schluessel] = (zaehler.gespielt[schluessel] ?? 0) + 1
    }
    const nachgerechnet = spieleNach(lageVon(vorher), ereignisse)
    if (!isDeepStrictEqual(nachgerechnet, lageVon(zustand))) return `E2: nicht nachrechenbar: ${JSON.stringify(ereignisse)}`
    const verraten = verrateneHandkarten(zustand, ereignisse)
    if (verraten.length > 0) return `B2: ein Ereignis nennt die Handkarten ${verraten.join(', ')}`
    const aufHand = new Set(zustand.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)))
    const benannt = new Set(benannteHandkarten(zustand.entscheidung).map((eintrag) => eintrag.karteId))
    const verdeckt = woerterDerEntscheidung(zustand).filter((wort) => aufHand.has(wort) && !benannt.has(wort))
    if (verdeckt.length > 0) return `B2: die Entscheidung ${JSON.stringify(zustand.entscheidung)} nennt die Handkarten ${verdeckt.join(', ')}`
    return null
  }
}

describe('A8.2: Risiko-Karten im Dauerlauf mit Erweiterung (X5)', () => {
  it('A8.2/D50/D55/B2: 60 Zufallspartien enden alle; jede Aktion kommt mit Erfolg und Misserfolg vor, auch Entscheidungen eines Gegners', () => {
    const zaehler: Zaehler = { gespielt: {}, gegnerEntscheidet: 0 }
    const neuerPruefer = () => allePruefer(regelPruefer(), reaktionsPruefer(neueReaktionen()), stapelPruefer, risikoPruefer(zaehler))
    const ergebnisse = dauerlauf(dauerlaufPartien(60, true, 8001), { neuerPruefer })
    expect(ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet'), 'Partien, die nicht regulär endeten').toEqual([])
    for (const aktion of [1, 2, 3, 4]) {
      for (const ausgang of ['Erfolg', 'Misserfolg']) {
        expect(zaehler.gespielt[`${aktion}-${ausgang}`] ?? 0, `A8.2 Aktion ${aktion}, ${ausgang} im Dauerlauf`).toBeGreaterThan(0)
      }
    }
    expect(zaehler.gegnerEntscheidet, 'D52/D54: der begünstigte Gegner entscheidet').toBeGreaterThan(0)
  }, 300_000)
})
