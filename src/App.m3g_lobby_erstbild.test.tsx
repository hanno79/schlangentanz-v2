// M3g — Sonniges-Nest-Lobby-Reinigung (Lobby-First-Erstbild)
// RED-Tests: Beweist, dass auf `/` der Game-Tree (Spielbereich) versteckt ist,
// die Start-Buttons in den Viewport passen, und auf `/game` alles sichtbar bleibt.
//
// Klassen-Audit (Pitfall #45): app-shell, sonniges-nest, lobby-baumhaus,
// lobby-spieler-grid, lobby-startreihe, lobby-startbutton, spielbereich, schlangenbuch.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const appCss = readFileSync('src/App.css', 'utf8')

/** Last-match cssBlock — gleiches Rezept wie M1dt Pattern 6.
 *  Pitfall #43-Fix: Prefix-Anchor als negative lookbehind statt character class,
 *  weil ".lobby-spieler-grid" von ". ," (Dot+Komma) eingeleitet wird und ein
 *  Char-Class-Anchor nur ein einzelnes Zeichen konsumiert.
 *  Pitfall #32-Fix: Brace-Depth-Walk sucht den letzten Top-Level-Match (depth 0),
 *  weil die @media-Block-Heuristik fuer nested Klassen unzuverlaessig ist. */
function cssBlock(selector: string): string {
  // Escape regex specials for class names like "lobby-startbutton"
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(
    appCss.matchAll(new RegExp(`(?<![A-Za-z0-9_-])${escaped}\\s*\\{([^}]*)\\}`, 'g')),
  )
  if (matches.length === 0) return ''
  // Walk from last to first, pick the last top-level (brace-depth 0) match
  for (let i = matches.length - 1; i >= 0; i--) {
    const preceding = appCss.slice(0, matches[i].index ?? 0)
    let depth = 0
    for (const ch of preceding) {
      if (ch === '{') depth++
      else if (ch === '}') depth--
    }
    if (depth === 0) return matches[i][1]
  }
  return matches[matches.length - 1][1]
}

describe('M3g — Sonniges-Nest-Lobby-Reinigung', () => {
  it('M3g:1 — CSS-Source: App.css versteckt den Spielbereich auf der Lobby-Route (ohne app-shell--game Modifier)', () => {
    // Wir suchen die exakte Regel `.app-shell:not(.app-shell--game) #spielbereich { display: none }`
    // tolerant gegen Whitespace, mit last-match falls es mehrere Treffer gibt.
    const matches = Array.from(
      appCss.matchAll(/\.app-shell:not\(\.app-shell--game\)\s+#spielbereich\s*\{([^}]*)\}/g),
    )
    expect(matches.length).toBeGreaterThanOrEqual(1)
    const lastBody = matches[matches.length - 1][1]
    expect(lastBody).toMatch(/display:\s*none/)
  })

  it('M3g:2 — CSS-Source: lobby-spieler-grid hat kompakteres gap (kleiner als 1rem) damit Start-Buttons in den Viewport passen', () => {
    const block = cssBlock('lobby-spieler-grid')
    // Akzeptiere entweder eine direkte gap-Override auf der Basis-Regel
    // ODER eine route-scoped @media-Regel mit gap < 1rem
    const directGap = block.match(/gap:\s*([\d.]+rem)/)
    if (directGap) {
      // Wenn direkt, muss < 1rem sein
      const gapRem = parseFloat(directGap[1])
      expect(gapRem).toBeLessThan(1.0)
    } else {
      // Mindestens eine @media-Override mit gap < 1rem muss existieren
      const mediaMatches = Array.from(
        appCss.matchAll(/@media[^{]*\{[^}]*\.lobby-spieler-grid[^}]*\{([^}]*)\}/g),
      )
      expect(mediaMatches.length).toBeGreaterThan(0)
      const allHaveSmallGap = mediaMatches.every((m) => {
        const gap = m[1].match(/gap:\s*([\d.]+rem)/)
        return gap && parseFloat(gap[1]) < 1.0
      })
      expect(allHaveSmallGap).toBe(true)
    }
  })

  it('M3g:3 — CSS-Source: Schlangenbuch wird auf der Lobby-Route ausgeblendet (display: none) damit Erstbild fokussiert bleibt', () => {
    // Akzeptiere entweder eine route-scoped Regel mit `:not(.app-shell--game)` Selector
    // oder einen .lobby-schlangenbuch-vorschau Wrapper als alternative Loesung.
    const matchRouteScoped = appCss.match(
      /\.app-shell:not\(\.app-shell--game\)\s+\.schlangenbuch\s*\{([^}]*)\}/,
    )
    if (matchRouteScoped) {
      expect(matchRouteScoped[1]).toMatch(/display:\s*none/)
    } else {
      // Alternative: Schlangenbuch wird in einen neuen Container gewrappt
      const hasWrapper = appCss.includes('lobby-schlangenbuch') || appCss.includes('lobby-spiel-preview')
      expect(hasWrapper).toBe(true)
    }
  })

  it('M3g:4 — CSS-Source: app-shell auf der Lobby-Route hat einen Override-Block (z.B. fuer kompakteres Layout)', () => {
    // Konkreter CSS-Check: ein `.app-shell:not(.app-shell--game) { ... }`-Block existiert
    // mit irgendeiner Deklaration (display/grid/padding), die das Lobby-Layout unterscheidet.
    const match = appCss.match(/\.app-shell:not\(\.app-shell--game\)\s*\{([^}]*)\}/)
    expect(match).not.toBeNull()
    expect(match![1].length).toBeGreaterThan(0)
  })

  it('M3g:5 — DOM-Assert: SonnigesNestLobby rendert 3 Start-Buttons und 4 Spieler-Slots (Host + 3 KI)', async () => {
    const { render } = await import('@testing-library/react')
    const React = await import('react')
    const { default: SonnigesNestLobby } = await import('./components/SonnigesNestLobby')
    const { container } = render(
      React.createElement(SonnigesNestLobby, { aktiveKiGegner: 1, onNeuesSpiel: () => {} }),
    )
    // 3 Start-Buttons vorhanden
    const startButtons = container.querySelectorAll('.lobby-startbutton')
    expect(startButtons.length).toBe(3)
    // 4 Spieler-Slots: 1 Host + 3 KI
    const slots = container.querySelectorAll('.lobby-slot')
    expect(slots.length).toBe(4)
  })

  it('M3g:6 — CSS-Source: lobby-startreihe oder sonniges-nest hat einen push-Override (margin-top: auto oder padding-bottom: 0) damit die Start-Buttons in den Viewport ruecken', () => {
    const lobbyStartreihe = cssBlock('lobby-startreihe')
    const sonnigesNest = cssBlock('sonniges-nest')
    const hasMarginAuto = /margin-top:\s*auto/.test(lobbyStartreihe) || /margin-block-start:\s*auto/.test(lobbyStartreihe)
    const hasSonnigesNestPush = /padding-bottom:\s*0\s*;|padding-block-end:\s*0\s*;/.test(sonnigesNest)
    // Mindestens EINE dieser Loesungen muss greifen
    expect(hasMarginAuto || hasSonnigesNestPush).toBe(true)
  })
})
