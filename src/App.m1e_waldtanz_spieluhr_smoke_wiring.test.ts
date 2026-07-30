/**
 * Author: rahn
 * Datum: 24.06.2026
 * Version: 1.1
 * Beschreibung: M1e Smoke-Wiring-Test stellt sicher, dass der
 *              Waldtanz-Spieluhr-Smoke in einer der kanonischen Smoke-Ketten
 *              eingebunden ist. Verhindert, dass ein Slice-Smoke
 *              stillschweigend vom Release uebergangen wird.
 *
 *  AENDERUNG [30.07.2026]: AP-1 — M1e navigiert nach `/game?phase=endspurt`
 *  bzw. `?phase=spielende` und braucht damit den `?phase=`-Test-Hook. Seit AP-1
 *  laufen hook-abhaengige Smokes in `smoke:preview`, damit die Hooks in der
 *  ausgelieferten Production-App abgeschaltet bleiben koennen.
 *
 *  Zusaetzlich: M1e CSS-Token-Guard. Alle CSS-Custom-Properties, die in
 *  der Slice-CSS verwendet werden, muessen in :root definiert sein.
 *  Kimi-Review-Blocker B1 vom 24.06.2026: drei Token
 *  (--st-color-on-surface-variant, --st-color-inverse-surface,
 *  --st-color-secondary-fixed-dim) waren im Slice verwendet, aber
 *  nirgends in :root definiert. Sie fielen still auf inherited black
 *  zurueck. Regression-Test verhindert Wiederholung.
 */
/// <reference types="node" />

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, previewSchritte, produktionsPosition } from './test/smokeKetten'

describe('M1e Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Waldtanz-Spieluhr-Smoke', () => {
    expect(istVerdrahtet('m1e_waldtanz_spieluhr_smoke.mjs')).toBe(true)
  })

  // ÄNDERUNG [30.07.2026]: AP-1 — der frühere Assert „liegt nach dem M1dd-Smoke"
  // ist mit zwei Ketten gegenstandslos: M1dd läuft in `smoke:production`, M1e in
  // `smoke:preview`. Ein Positionsvergleich über Kettengrenzen hinweg hätte keine
  // Aussage mehr. Der schützenswerte Kern — „M1e wird nicht stillschweigend vom
  // Release übergangen" — bleibt über `istVerdrahtet` und den Kettenzuschnitt unten
  // erhalten.
  it('läuft in der Preview-Kette, weil es den ?phase=-Test-Hook braucht', () => {
    expect(previewSchritte().some((schritt) => schritt.includes('m1e_waldtanz_spieluhr_smoke.mjs'))).toBe(true)
    expect(produktionsPosition('m1dd_aktionsdock_im_spielbrett_smoke.mjs')).toBeGreaterThanOrEqual(0)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1e_waldtanz_spieluhr_smoke.mjs')).toBe(true)
  })
})

describe('M1e CSS-Token-Guard im :root-Block', () => {
  const appCss = readFileSync('src/App.css', 'utf8')
  const rootBlock = appCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? ''

  const benoetigteToken = [
    '--st-color-on-surface-variant',
    '--st-color-inverse-surface',
    '--st-color-secondary-fixed-dim',
  ] as const

  for (const token of benoetigteToken) {
    it(`definiert ${token} in :root (verhindert silent Fallback)`, () => {
      expect(rootBlock, `Token ${token} fehlt in :root`).toMatch(
        new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`),
      )
    })
  }
})
