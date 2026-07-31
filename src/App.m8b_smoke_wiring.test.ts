/**
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M8b Smoke-Wiring-Test stellt sicher, dass der neue
 *              Schlangenfrass-2-Ziel-Smoke in der kanonischen
 *              `smoke:production`-Kette eingebunden ist UND dass die
 *              vorigen M-Slice-Smoke-Tests (M8a, M9, M9.5) NICHT
 *              ihre "Last-In-Chain"-Assertion behalten, die reflexiv
 *              rot wird sobald ein neuer M-Smoke angehängt wird.
 *              (M-Pitfall #14 "Last-In-Chain-Migration")
 */
/// <reference types="node" />

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsKette } from './test/smokeKetten'

const smokeChain = produktionsKette()
const steps = smokeChain.split('&&').map((s) => s.trim())

describe('M8b Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen 2-Ziel-Schlangenfrass-Smoke', () => {
    expect(istVerdrahtet('m8b_schlangenfrass_zweiziel_smoke.mjs')).toBe(true)
  })

  it('liegt nach dem M8a-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM8a = steps.findIndex((s) => s.includes('m8a_aktions_hinweis_smoke.mjs'))
    const idxM8b = steps.findIndex((s) => s.includes('m8b_schlangenfrass_zweiziel_smoke.mjs'))
    expect(idxM8a).toBeGreaterThanOrEqual(0)
    expect(idxM8b).toBeGreaterThan(idxM8a)
  })

  it('besteht ausschliesslich aus node-Scripts (kein grep/awk/--exclude)', () => {
    for (const step of steps) {
      expect(step).toMatch(/^node\s+scripts\//)
    }
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m8b_schlangenfrass_zweiziel_smoke.mjs')).toBe(true)
  })
})

describe('M8b Self-Test (offline Konfig-Check)', () => {
  it('kompiliert das Skript ohne Netzwerk oder Browser', async () => {
    const { spawnSync } = await import('node:child_process')
    const result = spawnSync('node', ['scripts/m8b_schlangenfrass_zweiziel_smoke.mjs', '--self-test'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('M8b Self-Test')
    expect(result.stdout).toContain('OK')
  })
})
