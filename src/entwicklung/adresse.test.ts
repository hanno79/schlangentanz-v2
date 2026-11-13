import { describe, expect, it } from 'vitest'
import { leseEntwicklerAnfrage } from './adresse'

describe('P0.4: Adressen des Entwicklertischs', () => {
  it('P0.4: /dev ohne Parameter zeigt die Startseite', () => {
    expect(leseEntwicklerAnfrage('/dev', '')).toEqual({ art: 'start' })
    expect(leseEntwicklerAnfrage('/dev/', '')).toEqual({ art: 'start' })
  })

  it('P0.4: /dev/szenarien listet die Szenarien', () => {
    expect(leseEntwicklerAnfrage('/dev/szenarien', '')).toEqual({ art: 'szenarien' })
  })

  it('P0.4: ein Schrägstrich am Ende ändert nichts, auch nicht bei /dev/szenarien/', () => {
    expect(leseEntwicklerAnfrage('/dev/szenarien/', '')).toEqual({ art: 'szenarien' })
    expect(leseEntwicklerAnfrage('/dev/', '?seed=1&spieler=2')).toEqual(leseEntwicklerAnfrage('/dev', '?seed=1&spieler=2'))
  })

  it('P0.4: /dev?szenario=<name> lädt ein Szenario', () => {
    expect(leseEntwicklerAnfrage('/dev', '?szenario=reaktionsfenster')).toEqual({
      art: 'szenario',
      name: 'reaktionsfenster',
    })
  })

  it('P0.4: /dev?seed=1&spieler=2 startet eine Partie ohne Erweiterung', () => {
    expect(leseEntwicklerAnfrage('/dev', '?seed=1&spieler=2')).toEqual({
      art: 'partie',
      saat: 1,
      spieler: 2,
      erweiterung: 0,
    })
  })

  it('P0.4: /dev?seed=<n>&spieler=<2–4>&erweiterung=<0|1> übernimmt alle drei Werte', () => {
    expect(leseEntwicklerAnfrage('/dev', '?seed=4711&spieler=4&erweiterung=1')).toEqual({
      art: 'partie',
      saat: 4711,
      spieler: 4,
      erweiterung: 1,
    })
    expect(leseEntwicklerAnfrage('/dev', '?seed=0&spieler=3&erweiterung=0')).toEqual({
      art: 'partie',
      saat: 0,
      spieler: 3,
      erweiterung: 0,
    })
  })

  it.each([
    ['?seed=1', 'spieler'],
    ['?spieler=2', 'seed'],
    ['?seed=abc&spieler=2', 'seed'],
    ['?seed=-1&spieler=2', 'seed'],
    ['?seed=1.5&spieler=2', 'seed'],
    ['?seed=4294967296&spieler=2', 'seed'],
    ['?seed=1&spieler=1', 'spieler'],
    ['?seed=1&spieler=5', 'spieler'],
    ['?seed=1&spieler=2&erweiterung=2', 'erweiterung'],
    ['?szenario=', 'szenario'],
    ['?szenario=reaktionsfenster&seed=1', 'szenario'],
  ])('P0.4: %s ist ungültig und nennt den Parameter „%s“', (suche, parameter) => {
    const anfrage = leseEntwicklerAnfrage('/dev', suche)
    expect(anfrage.art).toBe('fehler')
    expect(anfrage.art === 'fehler' ? anfrage.meldung : '').toContain(parameter)
  })

  it('P0.4: eine unbekannte Unterseite ist ein Fehler, keine leere Seite', () => {
    const anfrage = leseEntwicklerAnfrage('/dev/gibtsnicht', '')
    expect(anfrage.art).toBe('fehler')
    expect(anfrage.art === 'fehler' ? anfrage.meldung : '').toContain('/dev/gibtsnicht')
  })
})
