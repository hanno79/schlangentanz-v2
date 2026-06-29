/* Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9 macht das Handkarten-Panel im 1440x900 Erstbild sichtbar
 *   ohne dass der Spieler scrollen muss. Vorher: Hand-Panel bei y=998-1226,
 *   also 100-300 px unterhalb des Viewport-Falzes. M9 strafft die
 *   grid-template-rows der .spielbereich--game-route .info-panel--waldtanz-arena.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync('src/App.css', 'utf8')

describe('M9 Handkarten-Erstbild-Sichtbarkeit', () => {
  it('M9:1 arenastein-clamp ist auf Hand-sichtbares Budget reduziert (clamp 24rem 50vh 32rem)', () => {
    expect(appCss).toMatch(/clamp\(24rem,\s*50vh,\s*32rem\)/)
  })

  it('M9:2 aktionsdock + zugseitenleiste-Zeilen sind auf 1.6-2rem gestrafft', () => {
    // Im grid-template-rows-Block der .spielbereich--game-route
    // .info-panel--waldtanz-arena (innerhalb @media 980px) müssen
    // beide clamp(1.6rem, 3vh, 2rem)-Zeilen vorkommen.
    // Anker: Block muss grid-template-rows enthalten (sonst greift non-greedy
    // den zu kurzen Position-Override-Block darüber).
    const block = appCss.match(
      /\.spielbereich--game-route\s+\.info-panel--waldtanz-arena\s*\{[\s\S]*?grid-template-rows:[\s\S]*?\n\s{2,4}\}\s*\n/,
    )
    expect(block).not.toBeNull()
    const rows = block![0].match(/clamp\(1\.6rem,\s*3vh,\s*2rem\)/g) ?? []
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('M9:3 grid-template-rows hat 6 Zeilen in stabiler Reihenfolge (spielerrahmen/gegner-plakette/aktionsdock/arenastein/zugseitenleiste/hand)', () => {
    const block = appCss.match(
      /\.spielbereich--game-route\s+\.info-panel--waldtanz-arena\s*\{[\s\S]*?grid-template-rows:[\s\S]*?\n\s{2,4}\}\s*\n/,
    )
    expect(block).not.toBeNull()
    const rows = block![0].match(/grid-template-rows:\s*([\s\S]*?);/)
    expect(rows).not.toBeNull()
    // Es müssen genau 6 Zeilen sein
    const lines = rows![1].split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    expect(lines).toHaveLength(6)
  })

  it('M9:4 grid-area:hand bleibt für Handkarten-Panel erhalten (M1d0/M1f-Vertrag)', () => {
    expect(appCss).toMatch(/\.spielbereich--game-route[^{]*\[class~="handkarten-panel"\][^{]*\{[\s\S]*?grid-area:\s*hand/)
  })

  it('M9:5 display:flex + flex-direction:column auf Hand-Panel bleibt (M1f-Vertrag)', () => {
    const block = appCss.match(/\.spielbereich--game-route[^{]*\[class~="handkarten-panel"\][^{]*\{([\s\S]*?)\n\s*\}/)
    expect(block).not.toBeNull()
    expect(block![1]).toMatch(/display:\s*flex/)
    expect(block![1]).toMatch(/flex-direction:\s*column/)
  })

  it('M9:6 Cascade-Order: arenastein-clamp in arena-grid-template-rows steht VOR schlangenlichtung-clamp', () => {
    const arenaIdx = appCss.indexOf('clamp(24rem, 50vh, 32rem)')
    const schlangenIdx = appCss.indexOf('min-height: clamp(16rem, 38vh, 22rem)')
    expect(arenaIdx).toBeGreaterThan(0)
    expect(schlangenIdx).toBeGreaterThan(0)
    // arena-clamp muss im arena-Block stehen (vor allen schlangenlichtung-Regeln)
    expect(arenaIdx).toBeLessThan(schlangenIdx)
  })
})
