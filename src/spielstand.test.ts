/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Die gespeicherte Partie — und was passiert, wenn sie nicht taugt.

Der interessante Teil ist nicht der Roundtrip, sondern der Fehlerpfad: Ein
kaputter Eintrag muss `null` liefern **und** verschwinden. Bliebe er stehen,
sperrte er den Spieler bei jedem Reload erneut aus — er hat ihn weder verursacht
noch kann er ihn beheben.
*/

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ladeSpielstand,
  speichereSpielstand,
  verwirfSpielstand,
  SPIELSTAND_SCHLUESSEL,
} from './spielstand'
import { serialisiere } from './engine'
import { einzelspielerPartie } from './test/brettTest'

afterEach(() => {
  vi.restoreAllMocks()
})


describe('Spielstand', () => {
  it('gibt die gespeicherte Partie unverändert zurück', () => {
    const zustand = einzelspielerPartie()

    speichereSpielstand(zustand)
    const geladen = ladeSpielstand()

    expect(geladen).not.toBeNull()
    // Über die Serialisierung vergleichen: Sie ist die Zusage, nicht die
    // Objektidentität.
    expect(serialisiere(geladen!)).toBe(serialisiere(zustand))
  })

  it('liefert null, wenn nichts gespeichert ist', () => {
    expect(ladeSpielstand()).toBeNull()
  })

  it('verwirft einen unlesbaren Eintrag, statt ihn liegen zu lassen', () => {
    window.localStorage.setItem(SPIELSTAND_SCHLUESSEL, 'kein json {{{')

    expect(ladeSpielstand()).toBeNull()
    // Der eigentliche Punkt: Der kaputte Eintrag ist weg, nicht nur ignoriert.
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('verwirft auch einen strukturell ungültigen Spielstand', () => {
    // Gültiges JSON, aber kein Spielzustand — `deserialisiere` lehnt das ab.
    window.localStorage.setItem(SPIELSTAND_SCHLUESSEL, JSON.stringify({ version: 1, spieler: 'nein' }))

    expect(ladeSpielstand()).toBeNull()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('löscht den Eintrag auf Verlangen', () => {
    speichereSpielstand(einzelspielerPartie())
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).not.toBeNull()

    verwirfSpielstand()

    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  /*
   * `localStorage` wirft im Privatmodus älterer Browser, bei vollem Kontingent
   * und bei blockierten Drittanbieter-Speichern. Ein Spiel, das daran stirbt,
   * wäre genau der Fehler, den der Fehlerbehandlungs-Slice vom selben Tag
   * behoben hat.
   */
  it('spielt weiter, wenn der Speicher das Schreiben verweigert', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => speichereSpielstand(einzelspielerPartie())).not.toThrow()
  })

  it('spielt weiter, wenn der Speicher das Lesen verweigert', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    // `toBeNull` schließt „wirft nicht" ein — ein Wurf ließe den Test scheitern.
    expect(ladeSpielstand()).toBeNull()
  })
})
