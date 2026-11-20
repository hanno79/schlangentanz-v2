import { afterEach, describe, expect, it, vi } from 'vitest'
import { ermittleAktionen, erzeugeZufall, pruefeAktion } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { entscheidetKi, kiWahl, naechsterKiSchritt } from './schritt'
import type { Ki } from './schritt'
import { sichtFuer } from './sicht'
import type { Sicht } from './sicht'

// Die Engine bleibt echt; nur für den Fall „keine Aktion aufgezählt“ lässt sich ihr Ergebnis einmal ersetzen.
vi.mock('../engine', async (original) => {
  const engine = await original<typeof import('../engine')>()
  return { ...engine, ermittleAktionen: vi.fn(engine.ermittleAktionen) }
})

afterEach(() => vi.mocked(ermittleAktionen).mockClear())

/** Eine KI, die sich merkt, was sie bekam, und die Aktion an Stelle `stelle` zurückgibt. */
type Aufruf = { sicht: Sicht; aktionen: readonly SpielAktion[] }

function merkKi(stelle = 0): Ki & { aufrufe: Aufruf[] } {
  const aufrufe: Aufruf[] = []
  return {
    name: 'Merk-KI',
    aufrufe,
    waehle(sicht, aktionen) {
      aufrufe.push({ sicht, aktionen })
      return aktionen[stelle]
    },
  }
}

/** Zwei Spieler ohne Erweiterung, Karten ausgeteilt, `amZug` ist dran. */
function partie(amZug: number): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(5) }).haendeAuffuellen().amZug(amZug).zustand()
}

describe('K1: naechsterKiSchritt liefert genau eine Aktion oder nichts', () => {
  it('B2: entscheidet ein Mensch, liefert er nichts und fragt die KI nicht', () => {
    const ki = merkKi()
    expect(naechsterKiSchritt(partie(0), ki)).toBeNull()
    expect(ki.aufrufe).toEqual([])
    expect(entscheidetKi(partie(0))).toBe(false)
  })

  it('A10: nach Spielende liefert er nichts', () => {
    const beendet = baukasten({ spielerzahl: 2, erweiterung: false }).beendet(0).zustand()
    const ki = merkKi()
    expect(naechsterKiSchritt(beendet, ki)).toBeNull()
    expect(kiWahl(beendet, ki)).toBeNull()
    expect(entscheidetKi(beendet)).toBe(false)
    expect(ki.aufrufe).toEqual([])
  })

  it('U3: entscheidet eine KI, wählt sie aus den aufgezählten Aktionen mit ihrer eigenen Sicht', () => {
    const zustand = partie(1)
    const ki = merkKi(2)
    const aktion = naechsterKiSchritt(zustand, ki)
    expect(entscheidetKi(zustand)).toBe(true)
    expect(ki.aufrufe).toHaveLength(1)
    expect(ki.aufrufe[0].sicht).toEqual(sichtFuer(zustand, 1))
    expect(ki.aufrufe[0].aktionen).toEqual(ermittleAktionen(zustand))
    expect(aktion, 'U3: geliefert wird genau die gewählte, aufgezählte Aktion').toEqual(ermittleAktionen(zustand)[2])
    expect(aktion?.spielerId).toBe('spieler-2')
    expect(pruefeAktion(zustand, aktion!)).toEqual({ erlaubt: true })
  })

  it('K1: kiWahl fragt die KI auch für den Platz eines Menschen, etwa im Turnier', () => {
    const zustand = partie(0)
    const ki = merkKi()
    expect(kiWahl(zustand, ki)).toEqual(ermittleAktionen(zustand)[0])
    expect(ki.aufrufe[0].sicht.ich).toBe(0)
  })

  it('U3: baut die KI eine Aktion selbst, auch eine gleich aussehende, wird das mit Grund abgelehnt', () => {
    const zustand = partie(1)
    const nachbau: Ki = { name: 'Nachbau-KI', waehle: (_, aktionen) => ({ ...aktionen[0] }) }
    expect(() => naechsterKiSchritt(zustand, nachbau)).toThrow(
      'KI-Schritt: Nachbau-KI hat eine Aktion gewählt, die die Engine nicht aufgezählt hat; eine KI wählt nur aus den aufgezählten Aktionen (U3).',
    )
    const fremd: Ki = { name: 'Fremd-KI', waehle: () => ({ typ: 'ZugBeenden', spielerId: 'spieler-2' }) }
    expect(() => naechsterKiSchritt(zustand, fremd)).toThrow(/Fremd-KI hat eine Aktion gewählt, die die Engine nicht aufgezählt hat/)
  })

  it('U3: verändert die KI die angebotene Liste, merkt der Schritt es nicht als Erlaubnis', () => {
    const zustand = partie(1)
    const ki: Ki = {
      name: 'Schieb-KI',
      waehle: (_, aktionen) => {
        const eigene: SpielAktion = { typ: 'ZugBeenden', spielerId: 'spieler-2' }
        ;(aktionen as SpielAktion[]).push(eigene)
        return eigene
      },
    }
    expect(() => naechsterKiSchritt(zustand, ki)).toThrow(/nicht aufgezählt/)
  })

  it('U3: verändert die KI die gewählte Aktion, gilt trotzdem die aufgezählte', () => {
    const zustand = partie(1)
    const aufgezaehlt = ermittleAktionen(zustand)
    const ki: Ki = {
      name: 'Umbau-KI',
      waehle: (_, aktionen) => {
        const gewaehlt = aktionen[0]
        if ('karteId' in gewaehlt) gewaehlt.karteId = 'gibt-es-nicht'
        gewaehlt.spielerId = 'spieler-1'
        return gewaehlt
      },
    }
    expect(naechsterKiSchritt(zustand, ki)).toEqual(aufgezaehlt[0])
    expect(ermittleAktionen(zustand), 'U3: die Engine zählt danach dasselbe auf').toEqual(aufgezaehlt)
  })

  it('K1: zählt die Engine für eine KI keine Aktion auf, obwohl sie entscheidet, bricht der Schritt mit Grund ab', () => {
    vi.mocked(ermittleAktionen).mockReturnValueOnce([])
    expect(() => naechsterKiSchritt(partie(1), merkKi())).toThrow(
      'KI-Schritt: KI-Gegner 1 entscheidet, aber die Engine zählt keine Aktion auf (Plan E2, Kriterium 12).',
    )
  })

  it('A6: bei einer angesagten Sonderkarte entscheidet die KI des Gefragten, mit der Ansage in ihrer Sicht (füllt E4)', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(8) })
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }), [2])
      .haendeAuffuellen()
      .amZug(0)
      .zustand()
    const reaktion: SpielAktion = { typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null }
    vi.mocked(ermittleAktionen).mockReturnValueOnce([reaktion])
    const ki = merkKi()
    expect(entscheidetKi(zustand), 'A6: der Spieler am Zug ist ein Mensch, gefragt ist KI-Gegner 2').toBe(true)
    expect(naechsterKiSchritt(zustand, ki)).toEqual(reaktion)
    expect(ki.aufrufe[0].sicht.ich).toBe(2)
    expect(ki.aufrufe[0].sicht.angesagt?.aktion).toMatchObject({ typ: 'SchlangengrubeSpielen', zielSpielerId: 'spieler-3' })
  })
})
