/*
Author: Claude Code (S-1)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Guard gegen doppelte Accessible Names bei Phasen-Aktionen
              (Fixplan G1).

Dieselbe Phasen-Aktion wird bewusst an mehreren Bedienorten angeboten
(Brettrand, Handleiste, Zugkompass, Aktionsliste). Bis S-1 trugen dabei bis zu
zwei gleichzeitig sichtbare Knöpfe denselben Namen:

  /game  Zugabschluss    „Zug an nächsten Spieler geben"   2×
  /      Zugabschluss    „Zug an nächsten Spieler geben"   2×
  /      Überhand        „Überzählige Karten abwerfen"     2×
  /      Nachziehphase   „Ausspielphase starten"           2×

Für Screenreader-Nutzer sind solche Knöpfe nicht unterscheidbar. Vier
Production-Smokes (M1ck, M1cm, M1cp, M1cq) brachen aus demselben Grund mit
`strict mode violation` ab — sie konnten nicht wissen, welchen Knopf sie meinen.

Dieser Test prüft die Regel aus `src/phasenAktionen.ts` über alle Routen und
Zugphasen: Kein kanonischer Aktionsname darf zweimal gleichzeitig vorkommen.
*/

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'
import { PHASENAKTION_TEXTE, phasenAktionName } from './phasenAktionen'

function zustandInPhase(zugphase: Spielzustand['zugphase'], mitUeberhand = false): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.zugphase = zugphase
  if (mitUeberhand) {
    // Über das Handkartenlimit hinaus auffüllen, damit die Abwurf-Aktion erscheint.
    zustand.spieler[0].hand = [...zustand.spieler[0].hand, ...zustand.nachziehstapel.slice(0, 7)]
  }
  return zustand
}

const LAGEN: ReadonlyArray<{ name: string; zustand: () => Spielzustand }> = [
  { name: 'Nachziehphase', zustand: () => zustandInPhase('Nachziehphase') },
  { name: 'Ausspielphase', zustand: () => zustandInPhase('Ausspielphase') },
  { name: 'Aufgabenprüfung', zustand: () => zustandInPhase('Aufgabenpruefung') },
  { name: 'Zugabschluss', zustand: () => zustandInPhase('Zugabschluss') },
  { name: 'Zugabschluss mit Überhand', zustand: () => zustandInPhase('Zugabschluss', true) },
]

describe('S-1 Phasen-Aktionen haben eindeutige Accessible Names', () => {
  for (const route of ['/', '/game']) {
    for (const lage of LAGEN) {
      it(`${route} in ${lage.name}: kein Aktionsname doppelt`, () => {
        window.history.pushState({}, '', route)
        render(<App initialZustand={lage.zustand()} />)

        const doppelte = PHASENAKTION_TEXTE
          .map((text) => ({ text, anzahl: screen.queryAllByRole('button', { name: text }).length }))
          .filter((eintrag) => eintrag.anzahl > 1)

        expect(
          doppelte,
          `Mehrfach vergebene Accessible Names auf ${route} (${lage.name}): ` +
            doppelte.map((d) => `"${d.text}" ${d.anzahl}×`).join(', '),
        ).toEqual([])
      })
    }
  }

  it('hängt an Zweit-Bedienorten den Ort an, an kanonischen nicht', () => {
    expect(phasenAktionName('zugBeenden', 'brettrand')).toBe('Zug an nächsten Spieler geben')
    expect(phasenAktionName('zugBeenden', 'aktionsliste')).toBe('Zug an nächsten Spieler geben')
    expect(phasenAktionName('zugBeenden', 'zugkompass')).toBe('Zug an nächsten Spieler geben — Zugkompass')
    expect(phasenAktionName('zugBeenden', 'handleiste')).toBe('Zug beenden — Handleiste')
  })

  it('gibt der End-Turn-Pille einen Namen, der ihren sichtbaren Text enthält (WCAG 2.5.3)', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandInPhase('Zugabschluss')} />)

    const pille = screen.getByRole('button', { name: 'Zug beenden — Handleiste' })
    expect(pille.textContent, 'Accessible Name muss den sichtbaren Text enthalten').toContain('Zug beenden')
  })
})
