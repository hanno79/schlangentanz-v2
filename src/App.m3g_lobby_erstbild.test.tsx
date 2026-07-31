// M3g — Sonniges-Nest-Lobby-Reinigung (Lobby-First-Erstbild)
//
// ÄNDERUNG [30.07.2026]: AP-6 — die CSS-Quelltext-Asserts dieser Datei sind nach
// tests/layout/lobby_erstbild.spec.ts gewandert und werden dort im Browser
// gemessen. Übrig bleibt der Verhaltens-Assert, der ohne Browser auskommt.
//
// Was dabei sichtbar wurde und im neuen Vertrag dokumentiert ist:
//  - M3g:4 prüfte `expect(match[1].length).toBeGreaterThan(0)` — „irgendein Block
//    mit irgendeiner Deklaration". Ersatzlos entfallen.
//  - M3g:3 hatte einen Oder-Zweig, der lediglich prüfte, ob im Stylesheet
//    irgendwo die Zeichenkette "lobby-schlangenbuch" vorkommt. Das machte die
//    Prüfung praktisch unfalsifizierbar.
//  - M3g:2 (`gap < 1rem`) und M3g:6 (`margin-top: auto`) prüften Mittel statt
//    Zweck: Die Start-Buttons sollten dadurch ins Erstbild rücken. Gemessen liegen
//    sie bei y=1092 — unterhalb des 900-px-Falzes und damit schlechter als der
//    Zustand, den M3g beheben sollte. Beide Asserts waren trotzdem grün.

import { describe, expect, it } from 'vitest'

describe('M3g — Sonniges-Nest-Lobby-Reinigung', () => {
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
})
