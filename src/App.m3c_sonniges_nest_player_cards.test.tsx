import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SonnigesNestLobby from './components/SonnigesNestLobby'
import { readFileSync } from 'node:fs'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlock(selector: string): string {
  // Pragmatischer Helper: sucht die Basis-Regel, die als alleiniger
  // Top-Level-Selector beginnt (nicht als Teil eines Combined-Selectors).
  // Anker: vor dem Selector MUSS ein Zeilenanfang ODER "}" stehen,
  // und in den vorhergehenden ~80 Zeichen darf KEIN "," am Zeilenende
  // sein (das deutet auf einen Combined-Selector hin).
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(^|\\n|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'g')
  const allMatches = Array.from(appCss.matchAll(regex))
  if (allMatches.length === 0) return ''
  // Filtere: kein @media-Kontext + kein Combined-Selector (letzte 100
  // Zeichen vor dem Match duerfen kein Komma enthalten).
  for (const m of allMatches) {
    const idx = m.index ?? 0
    const preceding = appCss.slice(Math.max(0, idx - 100), idx)
    if (!/@media\s*\(/.test(preceding) && !/,\s*$/.test(preceding)) {
      return m[2]
    }
  }
  // Fallback: erstes Match.
  return allMatches[0][2]
}

function cssReducedMotion(_selector: string): string {
  // Spezifisch: sucht den Selector innerhalb @media (prefers-reduced-motion: reduce).
  void _selector
  const block = appCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)
  return block?.[1] ?? ''
}

describe('M3c Sonniges Nest — Player-Cards', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/')
    }
  })
  afterEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/')
    }
  })

  it('M3c:1 — Spieler-Slots rendern als 2x2 Grid (nicht auto-fit horizontal)', () => {
    // SUT: .lobby-spieler-grid (NEU) hat 2 Spalten (mobile: 1 Spalte).
    const block = cssBlock('.lobby-spieler-grid')
    expect(block).toMatch(/display:\s*grid/)
    expect(block).toMatch(/grid-template-columns:\s*repeat\(2,\s*minmax\(/)
  })

  it('M3c:2 — Avatare sind 8rem rund mit 3px Border + Hard-Shadow', () => {
    // SUT: .lobby-avatar (NEU) hat width/height 8rem, border 3px,
    // box-shadow hard. Token-driven via --st-border-width-chunky.
    const block = cssBlock('.lobby-avatar')
    expect(block).toMatch(/width:\s*8rem/)
    expect(block).toMatch(/height:\s*8rem/)
    expect(block).toMatch(/border:\s*(?:3px|var\(--st-border-width-chunky\))\s+solid/)
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/box-shadow:\s*inset\s+0\s+8px\s+0/)
    expect(block).toMatch(/box-shadow:[^;]*0\s+4px\s+0/)
  })

  it('M3c:3 — Vier Avatare sichtbar: Host + 3 KI-Slots, alle als SVG (kein Emoji)', () => {
    // SUT: <SonnigesNestLobby> rendert 4 .lobby-avatar mit <svg> darin,
    // Namen Slippy Host + Orange Crush + Lime Loop + Berry Boa.
    // Accessibility: SVG-Dekoration MUSS fuer Screenreader versteckt sein
    // (entweder aria-hidden am SVG selbst oder am Parent-Wrapper), aber
    // der .lobby-slot__name MUSS lesbar bleiben.
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={3} onNeuesSpiel={() => undefined} />,
    )
    const avatars = container.querySelectorAll('.lobby-avatar')
    expect(avatars.length).toBe(4)
    avatars.forEach((avatar) => {
      // Avatar-Content MUSS eine SVG sein (kein Emoji mehr).
      const svg = avatar.querySelector('svg')
      expect(svg).not.toBeNull()
      // SVG-Dekoration ist fuer Screenreader versteckt — entweder
      // direkt am SVG oder am Parent-Span.
      const svgAria = svg?.getAttribute('aria-hidden')
      const wrapperAria = avatar.querySelector('.lobby-avatar__bild')?.getAttribute('aria-hidden')
      const isHidden = svgAria === 'true' || wrapperAria === 'true'
      expect(isHidden).toBe(true)
    })
    // M3h (2026-07-01): .lobby-slot__name ist jetzt Sibling von
    // .lobby-avatar (vorher Child), damit der Name nicht vom runden
    // Border abgeschnitten wird. Selektiere Namen ueber die Slots,
    // nicht ueber die Avatare.
    const slots = container.querySelectorAll('.lobby-slot')
    const namen = Array.from(slots).map(
      (slot) => slot.querySelector('.lobby-slot__name')?.textContent?.trim() ?? '',
    )
    expect(namen).toContain('Slippy Host')
    expect(namen).toContain('Orange Crush')
    expect(namen).toContain('Lime Loop')
    expect(namen).toContain('Berry Boa')
    // Accessibility-Hardening (Kimi-Blocker 2026-06-28): Avatar-Wrapper
    // selbst darf NICHT aria-hidden sein, sonst ist der Name unsichtbar.
    avatars.forEach((avatar) => {
      expect(avatar.getAttribute('aria-hidden')).not.toBe('true')
    })
  })

  it('M3c:4 — SVG-Avatare haben Schlange-typische fill-Farben je Slot', () => {
    // SUT: Host = forest-gruen, Orange Crush = orange,
    // Lime Loop = hellgruen, Berry Boa = magenta.
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={3} onNeuesSpiel={() => undefined} />,
    )
    const farben = Array.from(container.querySelectorAll('.lobby-avatar')).map(
      (avatar) => {
        const path = avatar.querySelector('svg path, svg circle, svg ellipse')
        return path?.getAttribute('fill') ?? ''
      },
    )
    expect(farben.some((f) => /^#?[0-9a-fA-F]{3,6}$/.test(f) || /^(rgb|hsl)/.test(f))).toBe(true)
    // Vier verschiedene Slots — also mind. 2 unterschiedliche fill-Werte.
    const unique = new Set(farben.filter(Boolean))
    expect(unique.size).toBeGreaterThanOrEqual(2)
  })

  it('M3c:5 — Baumstamm-Rahmen auf .lobby-baumhaus mit 4rem border-radius + 12px Hard-Shadow', () => {
    // SUT: .lobby-baumhaus border-radius 4rem (statt 3rem),
    // box-shadow 0 12px 0 statt 0 10px 0.
    const block = cssBlock('.lobby-baumhaus')
    expect(block).toMatch(/border-radius:\s*4rem/)
    expect(block).toMatch(/box-shadow:\s*0\s+12px\s+0/)
  })

  it('M3c:6 — Vines/Leafs als ::before/::after vergroessert auf 12rem', () => {
    // SUT: .lobby-baumhaus::before, ::after haben 12rem Groesse
    // (vorher 9rem) — lime Quarter-Circle top-left, mint Quarter-Circle
    // bottom-right.
    const block = cssBlock('.lobby-baumhaus::before,\n.lobby-baumhaus::after')
      || cssBlock('.lobby-baumhaus::before')
      || appCss.match(/\.lobby-baumhaus::before[\s\S]*?\.lobby-baumhaus::after[\s\S]*?\}/m)?.[0]
      || ''
    expect(block).toMatch(/width:\s*12rem/)
    expect(block).toMatch(/height:\s*12rem/)
  })

  it('M3c:7 — Name-Pille unter jedem Avatar sichtbar', () => {
    // SUT: .lobby-slot__name (NEU) ist border-radius-pill mit
    // border-2 border-inverse-surface und surface-Hintergrund.
    const block = cssBlock('.lobby-slot__name')
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/border:\s*2px\s+solid/)
  })

  it('M3c:8 — Difficulty-Pille nur auf KI-Slots (Host-Slot ohne)', () => {
    // SUT: .lobby-slot--ki enthaelt eine .lobby-slot__difficulty-Pille
    // mit Text "leicht" / "mutig" / "fies". Host-Slot hat KEINE Pille.
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={3} onNeuesSpiel={() => undefined} />,
    )
    const kiSlots = Array.from(container.querySelectorAll('.lobby-slot--ki'))
    expect(kiSlots.length).toBe(3)
    const difficulties = kiSlots.map(
      (slot) => slot.querySelector('.lobby-slot__difficulty')?.textContent?.trim() ?? '',
    )
    expect(difficulties).toEqual(['mutig', 'listig', 'fies'])
    // Host-Slot darf KEINE .lobby-slot__difficulty haben.
    const hostSlot = container.querySelector('.lobby-slot--host')
    expect(hostSlot?.querySelector('.lobby-slot__difficulty')).toBeNull()
    // .lobby-slot__difficulty ist als Pill gestylt.
    const diffBlock = cssBlock('.lobby-slot__difficulty')
    expect(diffBlock).toMatch(/border-radius:\s*999px/)
    expect(diffBlock).toMatch(/border:\s*2px\s+solid/)
  })

  it('M3c:9 — M3b-Vertrag bleibt erhalten: aktive KI-Slots haben Slide-In-Animation', () => {
    // SUT: .lobby-slot--ki animation != none (bestehender M3b-Vertrag).
    const block = cssBlock('.lobby-slot--ki')
    expect(block).toMatch(/animation:\s*lobby-snake-slide/)
  })

  it('M3c:10 — Code-Schild schwingt weiterhin (lobby-sway, M3a-Vertrag bleibt)', () => {
    const block = cssBlock('.lobby-code-schild')
    expect(block).toMatch(/animation:\s*lobby-sway/)
  })

  it('M3c:11 — Reduced-Motion Override: Avatar-Animation und Hover-Transition aus', () => {
    // SUT: @media (prefers-reduced-motion: reduce) enthaelt einen
    // Override fuer .lobby-avatar, das animation: none setzt.
    const reducedMotionBlock = cssReducedMotion('.lobby-code-schild')
    expect(reducedMotionBlock).toMatch(/\.lobby-avatar/)
    expect(reducedMotionBlock).toMatch(/animation:\s*none/)
  })
})