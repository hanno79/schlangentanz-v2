import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SonnigesNestLobby from './components/SonnigesNestLobby'
import { readFileSync } from 'node:fs'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlock(selector: string): string {
  // Pragmatischer Helper: sucht die Basis-Regel, die als alleiniger
  // Top-Level-Selector beginnt (nicht als Teil eines Combined-Selectors).
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(^|\\n|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'g')
  const allMatches = Array.from(appCss.matchAll(regex))
  if (allMatches.length === 0) return ''
  for (const m of allMatches) {
    const idx = m.index ?? 0
    const preceding = appCss.slice(Math.max(0, idx - 100), idx)
    if (!/@media\s*\(/.test(preceding) && !/,\s*$/.test(preceding)) {
      return m[2]
    }
  }
  return allMatches[0][2]
}

describe('M3h Stitch-Lobby-Avatar-Promotion', () => {
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

  it('M3h:1 — Schwierigkeit-Pille ist im Flex-Flow (position: static), nicht absolute schwebend', () => {
    // SUT: .lobby-slot__difficulty muss NICHT position:absolute haben,
    // damit sie unter dem Avatar sitzt (im Flex-Flow der .lobby-slot).
    const block = cssBlock('.lobby-slot__difficulty')
    expect(block).not.toMatch(/position:\s*absolute/)
    // Sanity: Border + Radius vom M3c-Vertrag bleiben.
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/border:\s*2px\s+solid/)
  })

  it('M3h:2 — Neue .lobby-slot__host-badge Klasse mit Stitch-Pill-Stil (Border + Background + Radius)', () => {
    // SUT: .lobby-slot__host-badge (NEU) hat border-radius 999px, 2px
    // Border, Background var(--st-color-tertiary-container).
    const block = cssBlock('.lobby-slot__host-badge')
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/border:\s*2px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(block).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
  })

  it('M3h:3 — Neuer .lobby-slot__boden (Forest-Boden-Streifen) unter dem Avatar', () => {
    // SUT: .lobby-slot__boden (NEU) ist ~0.7rem hoch mit
    // var(--st-color-tertiary-container) Background und abgerundeten Ecken.
    const block = cssBlock('.lobby-slot__boden')
    expect(block).toMatch(/height:\s*0\.7rem/)
    expect(block).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
    expect(block).toMatch(/border-radius:\s*0\.4rem/)
  })

  it('M3h:4 — .lobby-slot ist Flex-Column (vertikale Spalte mit zentrierten Kindern)', () => {
    // SUT: .lobby-slot display:flex flex-direction:column align-items:center.
    // Vorher war display:grid justify-items:center — jetzt brauchen wir
    // einen echten vertikalen Stack, weil 5+ Elemente (Avatar + Name +
    // Difficulty + Host-Badge + Boden) gestapelt werden.
    const block = cssBlock('.lobby-slot')
    expect(block).toMatch(/display:\s*flex/)
    expect(block).toMatch(/flex-direction:\s*column/)
    expect(block).toMatch(/align-items:\s*center/)
  })

  it('M3h:5 — Host-Slot rendert .lobby-slot__host-badge mit Text "DU"', () => {
    // SUT: <SonnigesNestLobby> rendert genau eine .lobby-slot__host-badge
    // (nur im Host-Slot), mit dem Text "DU" (User-Markierung).
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={3} onNeuesSpiel={() => undefined} />,
    )
    const hostSlot = container.querySelector('.lobby-slot--host')
    expect(hostSlot).not.toBeNull()
    const hostBadges = hostSlot?.querySelectorAll('.lobby-slot__host-badge') ?? []
    expect(hostBadges.length).toBe(1)
    expect(hostBadges[0]?.textContent?.trim()).toBe('DU')
    // KI-Slots duerfen KEINE Host-Badge haben.
    const kiSlots = container.querySelectorAll('.lobby-slot--ki')
    kiSlots.forEach((slot) => {
      expect(slot.querySelector('.lobby-slot__host-badge')).toBeNull()
    })
  })

  it('M3h:6 — Wartende Slots rendern Name-Pille mit Text "frei" (nicht "wartet auf KI-Schlange")', () => {
    // SUT: Leere Slots (.lobby-slot--wartet) zeigen kurzen Platzhalter
    // "frei" statt 19-Zeichen-Fehlermeldung.
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={2} onNeuesSpiel={() => undefined} />,
    )
    const wartetSlots = container.querySelectorAll('.lobby-slot--wartet')
    expect(wartetSlots.length).toBe(1) // 1 wartender Slot bei aktiveKiGegner=2
    const name = wartetSlots[0]?.querySelector('.lobby-slot__name')
    expect(name?.textContent?.trim()).toBe('frei')
  })
})
