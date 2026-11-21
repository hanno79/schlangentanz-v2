import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { anwendeAktion, pruefeAktion, pruefeInvarianten, serialisiere } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { angriffAufMich, mittelspiel } from '../tisch/__tests__/szenarien'
import { gespeichert, istEinSchritt, warte } from './__tests__/steuerung'
import { GEGNER_STRATEGIE, KI_PAUSE, erstelleGegner, useSpiel } from './useSpiel'

/*
O3: `useSpiel` führt die Partie. Es spielt die KI-Gegner Schritt für Schritt
mit einer Pause, nimmt die Aktionen des Menschen entgegen und schreibt nach
jedem Schritt den Spielstand weg, damit ein Neuladen genau dort fortsetzt.
*/

/** KI-Gegner 1 hält eine Schlangengrube; zu zweit kann sie nur den Menschen treffen. */
function grubeGegenDich(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(31) })
    .hand(1, ['Schlangengrube', 'Blau', 'Rot', 'Gelb', 'Grün'])
    .haendeAuffuellen()
    .amZug(1)
    .zustand()
}

/** Eine KI, die eine Schlangengrube spielt, sobald sie kann, sonst die erste Aktion. */
function grubenKi(): Ki {
  return { name: 'Gruben-KI', waehle: (_sicht, aktionen) => aktionen.find((aktion) => aktion.typ === 'SchlangengrubeSpielen') ?? aktionen[0] }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('O3 K1: Jeder KI-Schritt einzeln und sichtbar', () => {
  it('O3 K1: im Spiel etwa 700 ms Pause vor jedem KI-Schritt, und je Pause genau ein Schritt', () => {
    expect(KI_PAUSE).toBe(700)
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    const { result } = renderHook(() => useSpiel(start, { pause: KI_PAUSE }))
    const vorher = result.current.ansicht
    warte(699)
    expect(gespeichert(), 'vor Ablauf der Pause ist kein Schritt gespielt').toBeNull()
    expect(result.current.ansicht).toEqual(vorher)
    warte(1)
    const erster = gespeichert()!
    expect(istEinSchritt(start, erster), 'nach der ersten Pause genau ein Schritt').toBe(true)
    warte(699)
    expect(serialisiere(gespeichert()!)).toBe(serialisiere(erster))
    warte(1)
    expect(istEinSchritt(erster, gespeichert()!), 'nach der zweiten Pause genau ein weiterer Schritt').toBe(true)
  })

  it('O3 K1: ohne Pause („weniger Bewegung“, Test) folgt jeder Schritt einzeln, nicht alle auf einmal', () => {
    let vorher = erzeugeSzenario('schlussrunde-ohne-dich')
    const { result } = renderHook(() => useSpiel(vorher, { pause: 0 }))
    for (let schritt = 0; schritt < 4; schritt += 1) {
      warte(0)
      const nachher = gespeichert()!
      expect(istEinSchritt(vorher, nachher), `Schritt ${schritt + 1} ist genau eine Aktion`).toBe(true)
      expect(result.current.ansicht.nachziehstapel).toBe(nachher.nachziehstapel.length)
      vorher = nachher
    }
  })

  it('O3: entscheidet der Mensch, läuft kein KI-Schritt; die Sicht sagt, dass er gefragt ist', () => {
    const start = angriffAufMich()
    const { result } = renderHook(() => useSpiel(start, { pause: 0 }))
    warte(10_000)
    expect(gespeichert(), 'ohne Entscheidung des Menschen geht nichts weiter').toBeNull()
    expect(result.current.ansicht.status.schwebend?.entscheidet).toEqual({ name: 'Spieler 1', ich: true })
    expect(result.current.ansicht.aktionen.every((aktion) => aktion.typ === 'Reagieren')).toBe(true)
  })
})

describe('O3: Aktionen des Menschen', () => {
  it('O3: eine Aktion des Menschen wird ausgeführt und gespeichert; danach spielt die KI weiter', () => {
    const start = mittelspiel()
    const { result } = renderHook(() => useSpiel(start, { pause: 0 }))
    const farbkarte = result.current.ansicht.aktionen.find((aktion) => aktion.typ === 'FarbkarteLegen')!
    act(() => result.current.fuehreAus(farbkarte))
    expect(serialisiere(gespeichert()!)).toBe(serialisiere(anwendeAktion(start, farbkarte).zustand))
    expect(result.current.ablehnung).toBeNull()
    const zug = result.current.ansicht.aktionen.find((aktion) => aktion.typ === 'ZugBeenden')!
    act(() => result.current.fuehreAus(zug))
    const nachZug = gespeichert()!
    expect(nachZug.zug.spielerIndex).toBe(1)
    warte(0)
    expect(istEinSchritt(nachZug, gespeichert()!), 'KI-Gegner 1 spielt nach dem Zug des Menschen').toBe(true)
  })

  it('O3/B2, U12: lehnt die Engine eine Aktion ab, steht ihr deutscher Grund da und nichts ändert sich', () => {
    const start = mittelspiel()
    const { result } = renderHook(() => useSpiel(start, { pause: 0 }))
    const fremd: SpielAktion = { typ: 'ZugBeenden', spielerId: 'spieler-2' }
    act(() => result.current.fuehreAus(fremd))
    expect(result.current.ablehnung).toMatch(/[a-zäöü]{4,}/)
    expect(pruefeAktion(start, fremd)).toEqual({ erlaubt: false, grund: result.current.ablehnung })
    expect(gespeichert()).toBeNull()
    act(() => result.current.fuehreAus(result.current.ansicht.aktionen[0]))
    expect(result.current.ablehnung).toBeNull()
  })
})

describe('O3 K2: Neu laden setzt genau dort fort', () => {
  it('O3 K2: nach zwei KI-Schritten neu geladen, zeigt die Sicht denselben Stand und spielt von dort weiter', () => {
    const erst = renderHook(() => useSpiel(erzeugeSzenario('schlussrunde-ohne-dich'), { pause: 0 }))
    warte(0)
    warte(0)
    const vorDemNeuladen = erst.result.current.ansicht
    erst.unmount()
    const stand = gespeichert()!
    const neu = renderHook(() => useSpiel(stand, { pause: 0 }))
    expect(neu.result.current.ansicht).toEqual(vorDemNeuladen)
    warte(0)
    expect(istEinSchritt(stand, gespeichert()!)).toBe(true)
  })

  it('O3 K2: neu geladen mitten in der Pause geht kein Schritt verloren und keiner doppelt', () => {
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    const erst = renderHook(() => useSpiel(start, { pause: KI_PAUSE }))
    warte(300)
    erst.unmount()
    warte(KI_PAUSE)
    expect(gespeichert(), 'nach dem Schliessen spielt nichts weiter').toBeNull()
    renderHook(() => useSpiel(start, { pause: KI_PAUSE }))
    warte(KI_PAUSE)
    expect(istEinSchritt(start, gespeichert()!)).toBe(true)
  })

  it('O3 K2/A6: greift die KI den Menschen an, ist die Abwehrfrage gespeichert und steht nach dem Neuladen wieder da', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(grubenKi)
    const erst = renderHook(() => useSpiel(grubeGegenDich(), { pause: 0 }))
    warte(0)
    warte(1000)
    const frage = erst.result.current.ansicht
    expect(frage.status.schwebend).toEqual({ karte: 'Schlangengrube', von: { name: 'KI-Gegner 1', ich: false }, entscheidet: { name: 'Spieler 1', ich: true } })
    erst.unmount()
    const stand = gespeichert()!
    expect(stand.schwebend?.ausstehend).toEqual([0])
    const neu = renderHook(() => useSpiel(stand, { pause: 0 }))
    expect(neu.result.current.ansicht).toEqual(frage)
    act(() => neu.result.current.fuehreAus({ typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: null }))
    expect(gespeichert()!.ausliegendeGruben).toHaveLength(1)
  })

  it('O3 K2/A6: ist eine KI gefragt, antwortet sie nach dem Neuladen auf die offene Frage', () => {
    const stand = erzeugeSzenario('alle-orte')
    expect(stand.schwebend?.ausstehend).toEqual([2])
    renderHook(() => useSpiel(stand, { pause: 0 }))
    warte(0)
    const nachher = gespeichert()!
    expect(istEinSchritt(stand, nachher)).toBe(true)
    expect(nachher.schwebend).toBeNull()
  })
})

describe('O3 K4/U5: Jeder KI-Gegner hat eine eigene Instanz aus der Registry', () => {
  it('O3 K4: je KI-Gegner ein Aufruf der Fabrik aus der Registry, mit eigener Zufallsquelle', () => {
    const fabrik = vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE)
    const quelle = vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.2).mockReturnValueOnce(0.3)
    const gegner = erstelleGegner(erzeugeSzenario('start-4'), quelle)
    expect([...gegner.keys()]).toEqual(['spieler-2', 'spieler-3', 'spieler-4'])
    expect(new Set(gegner.values()).size).toBe(3)
    expect(fabrik).toHaveBeenCalledTimes(3)
    const zufaelle = fabrik.mock.calls.map(([zufall]) => zufall)
    expect(new Set(zufaelle).size, 'jede Instanz hat ihre eigene Zufallsquelle').toBe(3)
    const folgen = zufaelle.map((zufall) => [zufall(), zufall(), zufall()])
    expect(folgen[0]).toEqual(Array.from({ length: 3 }, erzeugeZufall(Math.floor(0.1 * 2 ** 32))))
    expect(folgen[1]).not.toEqual(folgen[0])
    expect(quelle).toHaveBeenCalledTimes(3)
  })

  it('O3 K4: im Spiel kommt die Saat jeder KI aus Math.random, nicht aus dem Partie-Zufall', () => {
    const zufall = vi.spyOn(Math, 'random')
    renderHook(() => useSpiel(erzeugeSzenario('start-4'), { pause: 0 }))
    expect(zufall.mock.calls.length, 'eine Saat je KI-Gegner und Instanz').toBeGreaterThanOrEqual(3)
    expect(zufall.mock.calls.length % 3).toBe(0)
  })

  it('O3 K4: jeder Gegner entscheidet mit seiner eigenen Instanz, und jede Instanz nur für ihren Sitz', () => {
    const sitzeJeInstanz: number[][] = []
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation((zufall) => {
      const sitze: number[] = []
      sitzeJeInstanz.push(sitze)
      return {
        name: 'Beobachter',
        waehle(sicht, aktionen) {
          sitze.push(sicht.ich)
          return aktionen[Math.floor(zufall() * aktionen.length)]
        },
      }
    })
    // Die drei KI-Gegner spielen ihre letzten Züge, ohne dass du gefragt wirst.
    renderHook(() => useSpiel(erzeugeSzenario('schlussrunde-ohne-dich'), { pause: 0 }))
    for (let schritt = 0; schritt < 30; schritt += 1) warte(0)
    expect(gespeichert()!.partiephase).toBe('Beendet')
    const benutzt = sitzeJeInstanz.filter((sitze) => sitze.length > 0)
    expect(benutzt.length, 'alle drei Gegner haben gespielt').toBe(3)
    for (const sitze of benutzt) expect(new Set(sitze).size, `Instanz spielte für die Sitze ${sitze.join(', ')}`).toBe(1)
    expect(new Set(benutzt.map((sitze) => sitze[0])).size).toBe(benutzt.length)
  })
})

describe('O3: Eine Partie läuft bis zum Ende', () => {
  it.each([2, 3, 4])('O3: %i Spieler, der Mensch wählt zufällig, alle Invarianten nach jedem Schritt erfüllt', (spieler) => {
    const mensch = erzeugeZufall(spieler * 101)
    const start = erzeugeSzenario(spieler === 2 ? 'start-2' : spieler === 3 ? 'start-erweiterung' : 'start-4')
    const { result } = renderHook(() => useSpiel(start, { pause: 0 }))
    let schritte = 0
    while (result.current.ansicht.status.partiephase !== 'Beendet') {
      const { aktionen } = result.current.ansicht
      if (aktionen.length > 0) act(() => result.current.fuehreAus(aktionen[Math.floor(mensch() * aktionen.length)]))
      else warte(0)
      schritte += 1
      expect(schritte, 'die Partie endet nicht').toBeLessThan(3000)
      const verletzt = pruefeInvarianten(gespeichert()!).filter((befund) => befund.verletzt)
      expect(verletzt, `Schritt ${schritte}`).toEqual([])
      expect(result.current.ablehnung).toBeNull()
    }
    expect(gespeichert()!.partiephase).toBe('Beendet')
  })
})
