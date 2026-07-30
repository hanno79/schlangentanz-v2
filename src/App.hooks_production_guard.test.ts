/*
Author: Claude Code (AP-1)
Datum: 30.07.2026
Version: 1.0
Beschreibung: AP-1 Guard — kein Smoke, der einen Test-Hook benötigt, darf in der
              `smoke:production`-Kette stehen.

Hintergrund (Onboarding-Finding 7): Audit-Fix C4 sperrte die Test-Hooks
`window.__schlangentanzFixture` und `?phase=` hinter `testHooksAktiv()`. Der
Sicherheitsgewinn war aber faktisch aufgehoben, weil `docs/WORKFLOW.md` verlangte,
`VITE_TEST_HOOKS=1` im Vercel-Projekt zu setzen — sonst wären sechs Smokes
gescheitert. Damit war der Hook in der ausgelieferten App wieder erreichbar und
konnte beliebige Spielzustände injizieren.

Seit AP-1 laufen genau diese sechs Smokes in `smoke:preview` gegen ein
Preview-Deployment. Dieser Guard hält die Trennung fest: Wandert ein
hook-abhängiger Smoke zurück in die Production-Kette, oder benutzt ein bestehender
Production-Smoke neu einen Hook, schlägt der Test fehl.
*/
/// <reference types="node" />

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  HOOK_ABHAENGIGE_SMOKES,
  nutztTestHook,
  previewSchritte,
  produktionsSchritte,
} from './test/smokeKetten'

function skriptPfad(dateiname: string): string {
  return `scripts/${dateiname}`
}

describe('AP-1 Test-Hooks nicht in der Production-Smoke-Kette', () => {
  it('kennt beide Ketten', () => {
    expect(produktionsSchritte().length).toBeGreaterThan(0)
    expect(previewSchritte().length).toBeGreaterThan(0)
  })

  it('führt jeden hook-abhängigen Smoke ausschließlich in der Preview-Kette', () => {
    for (const smoke of HOOK_ABHAENGIGE_SMOKES) {
      const inProduktion = produktionsSchritte().filter((schritt) => schritt.includes(smoke))
      const inPreview = previewSchritte().filter((schritt) => schritt.includes(smoke))

      expect(inProduktion, `${smoke} darf nicht in smoke:production stehen`).toEqual([])
      expect(inPreview.length, `${smoke} muss in smoke:preview stehen`).toBe(1)
    }
  })

  it('hat für jeden hook-abhängigen Smoke ein existierendes Skript', () => {
    for (const smoke of HOOK_ABHAENGIGE_SMOKES) {
      expect(existsSync(skriptPfad(smoke)), `${smoke} fehlt in scripts/`).toBe(true)
    }
  })

  it('benutzt in keinem Production-Smoke einen Test-Hook', () => {
    const verstoesse = produktionsSchritte()
      .map((schritt) => schritt.replace(/^node\s+/, '').trim())
      .filter((pfad) => pfad.endsWith('.mjs') && existsSync(pfad))
      .filter((pfad) => nutztTestHook(pfad))

    expect(
      verstoesse,
      'Diese Production-Smokes nutzen einen Test-Hook und gehören nach smoke:preview',
    ).toEqual([])
  })

  it('deckt die Liste der hook-abhängigen Smokes vollständig ab', () => {
    // Gegenprobe: Jedes Skript in der Preview-Kette muss tatsächlich einen Hook
    // benutzen — sonst gehört es zurück nach Production, wo es gegen die echte
    // ausgelieferte App laufen kann.
    const ohneHook = previewSchritte()
      .map((schritt) => schritt.replace(/^node\s+/, '').trim())
      .filter((pfad) => pfad.endsWith('.mjs') && existsSync(pfad))
      .filter((pfad) => !nutztTestHook(pfad))

    expect(ohneHook, 'Diese Preview-Smokes brauchen keinen Hook und gehören nach smoke:production').toEqual([])
  })
})
