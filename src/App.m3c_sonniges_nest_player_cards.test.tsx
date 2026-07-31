import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SonnigesNestLobby from './components/SonnigesNestLobby'


describe('M3c Sonniges Nest — Player-Cards', () => {
  // ÄNDERUNG [30.07.2026]: AP-6 — M3c:1, :2, :5, :6, :7 und :11 prüften
  // Deklarationen im CSS-Quelltext. Sie liegen jetzt als Messung in
  // tests/layout/lobby_erstbild.spec.ts, zwei davon deutlich schärfer:
  //
  //  - M3c:1 prüfte `grid-template-columns: repeat(2, minmax(…))`. Gemessen wird
  //    jetzt die Anordnung selbst — vier Plätze in zwei Spalten und zwei Zeilen.
  //  - M3c:11 prüfte, ob im @media-Block die Zeichenketten `.lobby-avatar` und
  //    `animation: none` vorkommen. Das sagt nichts darüber, ob die Regel greift.
  //    Der Layout-Lauf arbeitet mit reduzierter Bewegung; gemessen wird direkt,
  //    dass keine Animation mehr läuft.
  //
  // Hier bleiben die Asserts über DOM-Aufbau und Inhalte.
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
    // Der Pillen-Stil selbst wird in tests/layout/lobby_erstbild.spec.ts gemessen.
  })

})