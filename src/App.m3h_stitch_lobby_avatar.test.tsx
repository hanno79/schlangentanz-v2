import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SonnigesNestLobby from './components/SonnigesNestLobby'


describe('M3h Stitch-Lobby-Avatar-Promotion', () => {
  // ÄNDERUNG [30.07.2026]: AP-6 — M3h:1 bis M3h:4 prüften Deklarationen im
  // CSS-Quelltext (position, border-radius, border, background, height, display,
  // flex-direction, align-items). Sie liegen jetzt als Messung in
  // tests/layout/lobby_erstbild.spec.ts.
  //
  // M3h:4 wurde dabei schärfer: statt der drei Flex-Deklarationen wird gemessen,
  // dass Avatar, Name, Host-Plakette und Bodenstreifen überlappungsfrei
  // untereinander liegen und dieselbe Mittelachse teilen. Das fällt auch dann auf,
  // wenn eine spätere Regel den Stapel kippt, ohne diese Properties anzufassen.
  //
  // Hier bleiben die Asserts, die den DOM-Aufbau prüfen und keinen Browser brauchen.
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

  it('M3h:7 — Name-Pille ist SIBLING vom Avatar (nicht Child), damit sie nicht vom runden Border abgeschnitten wird', () => {
    // SUT: .lobby-slot__name MUSS direkter Sibling von .lobby-avatar
    // innerhalb von .lobby-slot sein. Im Avatar (border-radius:999px +
    // overflow:hidden) waere die Pille abgeschnitten. Dies ist die
    // strukturelle Grundlage fuer die Sichtbarkeit der Namen.
    const { container } = render(
      <SonnigesNestLobby aktiveKiGegner={3} onNeuesSpiel={() => undefined} />,
    )
    const slots = container.querySelectorAll('.lobby-slot')
    slots.forEach((slot) => {
      const avatar = slot.querySelector('.lobby-avatar')
      const name = slot.querySelector('.lobby-slot__name')
      expect(avatar).not.toBeNull()
      expect(name).not.toBeNull()
      // Die Name-Pille darf NICHT innerhalb des Avatars liegen.
      expect(avatar?.contains(name as Node)).toBe(false)
    })
  })
})
