import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../../engine'
import type { Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { meldeZugerweiterung } from '../../engine/zuggrenzen'
import { sichtFuer } from '../sicht'
import { folgeschluessel } from './folgeschluessel'

/*
K2 Iteration 3, Mangel 1, und X3, Prüfprotokoll Iteration 1, Mangel 1: Der
Folgeschlüssel der Zugsuche fasst gleichwertige Folgen ohne Karten-Ids zusammen.
Seit X3 führt der Zug die gespielten Karten mit Id (`verwendet`); der Schlüssel
darf sie nicht übernehmen. Gelten Zusatzaktionen nur für bestimmte Karten (D43),
unterscheidet er aber, ob eine solche Karte den Platz belegt.
*/

/** Der Schlüssel nach dem Ausspielen jeder Handkarte dieser Farbe an das Ende der ersten Schlange. */
function schluesselNachAnlegen(start: Spielzustand, farbe: string): string[] {
  const schlangenId = start.spieler[0].schlangen[0].id
  return start.spieler[0].hand
    .filter((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe)
    .map((karte) => {
      const aktion = ermittleAktionen(start).find(
        (eintrag) => eintrag.typ === 'FarbkarteLegen' && eintrag.karteId === karte.id && eintrag.ziel.art === 'schlange' && eintrag.ziel.schlangenId === schlangenId && eintrag.ziel.seite === 'ende',
      )!
      return folgeschluessel(sichtFuer(anwendeAktion(start, aktion).zustand, 0))
    })
}

describe('K2/X3: der Folgeschlüssel der Zugsuche kennt keine Karten-Ids', () => {
  it('K2/X3: eine von drei blauen Karten an dasselbe Ende ergibt dreimal denselben Schlüssel', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Blau', 'Blau', 'Blau', 'Rot']).schlange(0, ['Grün']).zustand()
    const schluessel = schluesselNachAnlegen(start, 'Blau')
    expect(schluessel).toHaveLength(3)
    expect(new Set(schluessel).size, 'X3: der Schlüssel unterscheidet gleichwertige Folgen nach der Karten-Id').toBe(1)
  })

  it('D43: gilt eine Zusatzaktion nur für eine der blauen Karten, unterscheidet der Schlüssel, ob sie den Platz belegt', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true })
      .hand(0, ['Blau', 'Blau', 'Rot'])
      .schlange(0, ['Grün'])
      .aendere((zustand) => {
        const [erste] = zustand.spieler[0].hand
        meldeZugerweiterung(zustand.zug, 'Schlangenkorb', [{ quelle: 'Schlangenkorb', erlaubt: ['Farbkarte'], nurKarten: [erste.id] }])
      })
      .zustand()
    const [mitZusatz, ohneZusatz] = schluesselNachAnlegen(start, 'Blau')
    expect(mitZusatz, 'D43: verschiedene Möglichkeiten danach, verschiedene Schlüssel').not.toBe(ohneZusatz)
  })
})
