/**
 * Author: rahn
 * Datum: 05.07.2026
 * Version: 1.0
 * Beschreibung: Audit-Fix (UI-Finding 1) — Der Spielmoment-Sprunglink muss exakt den
 * data-zielspur-key erzeugen, den die Brett-Anker tragen. Für Schlangenblockade und
 * Farbendieb fehlte zuvor die zielSpielerId, wodurch der Sprung ins Leere lief.
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WaldtanzSonderkartenSpielmoment from './WaldtanzSonderkartenSpielmoment'
import { blockadeKey, diebKey, frassKey } from './zielspurKey'
import type { SpielAktion, Spielkarte } from '../engine'

function ankerKey(container: HTMLElement): string | null {
  return container.querySelector('[data-zielspur-key]')?.getAttribute('data-zielspur-key') ?? null
}

describe('WaldtanzSonderkartenSpielmoment zielspurKey (UI-Finding 1)', () => {
  it('erzeugt für Schlangenblockade den Anker-Key inklusive zielSpielerId', () => {
    const karte: Spielkarte = { typ: 'Sonderkarte', id: 'blockade-1', name: 'Schlangenblockade' }
    const aktion: SpielAktion = {
      typ: 'SchlangenblockadeSpielen', spielerId: 'spieler-1', handkartenId: 'blockade-1',
      zielSpielerId: 'spieler-2', zielSchlangenId: 'schlange-2',
    }
    const { container } = render(
      <WaldtanzSonderkartenSpielmoment ausgewaehlteHandkarte={karte} legaleAktionen={[aktion]} aktiverSpielerId="spieler-1" />,
    )
    expect(ankerKey(container)).toBe(blockadeKey('spieler-2', 'schlange-2'))
  })

  it('erzeugt für Farbendieb den Anker-Key inklusive zielSpielerId', () => {
    const karte: Spielkarte = { typ: 'Sonderkarte', id: 'dieb-1', name: 'Farbendieb' }
    const aktion: SpielAktion = {
      typ: 'FarbendiebSpielen', spielerId: 'spieler-1', handkartenId: 'dieb-1',
      zielSpielerId: 'spieler-2', zielSchlangenId: 'schlange-2', zielKartenId: 'karte-x',
      eigeneSchlangenId: 'schlange-1', einfügeIndex: 0,
    }
    const { container } = render(
      <WaldtanzSonderkartenSpielmoment ausgewaehlteHandkarte={karte} legaleAktionen={[aktion]} aktiverSpielerId="spieler-1" />,
    )
    expect(ankerKey(container)).toBe(diebKey('spieler-2', 'schlange-2', 'karte-x'))
  })

  it('erzeugt für Schlangenfrass den Anker-Key mit der Ziel-Spieler-Id', () => {
    const karte: Spielkarte = { typ: 'Sonderkarte', id: 'frass-1', name: 'Schlangenfrass' }
    const aktion: SpielAktion = {
      typ: 'SchlangenfrassSpielen', spielerId: 'spieler-1', handkartenId: 'frass-1',
      ziele: [{ spielerId: 'spieler-2', schlangenId: 'schlange-2', kartenId: 'karte-y' }],
    }
    const { container } = render(
      <WaldtanzSonderkartenSpielmoment ausgewaehlteHandkarte={karte} legaleAktionen={[aktion]} aktiverSpielerId="spieler-1" />,
    )
    expect(ankerKey(container)).toBe(frassKey('spieler-2', 'schlange-2', 'karte-y'))
  })
})
