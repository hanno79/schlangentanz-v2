import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { serialisiere } from '../../engine'
import type { Kartenwahl } from '../../engine/testing/szenario'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { gespeichert, warte } from './__tests__/steuerung'
import { GEGNER_STRATEGIE, KI_PAUSE, KI_PAUSE_SCHNELL, erstelleGegner, useSpiel } from './useSpiel'

/*
O6: Gegnerzüge. Jeder KI-Schritt kommt einzeln und steht im Protokoll;
„Schneller“ verkürzt die Pause (K1). Musst du aussetzen, sagt die Steuerung es
und spielt weiter (K4). Wird eine KI angegriffen, dauert ihre Entscheidung
gleich lange, ob sie einen Farbenschutz hält oder nicht, auch wenn sie mit
einem Farbenschutz länger rechnet (K5). Die KI-Gegner spielen die solide KI
(K2, Produktentscheidung 2.3).
*/

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Eine KI, die die erste passende Aktion wählt, sonst die erste. */
function kiMit(...vorrang: ((aktion: SpielAktion) => boolean)[]): Ki {
  return {
    name: 'Test-KI',
    waehle: (_sicht, aktionen) => {
      for (const passt of vorrang) {
        const treffer = aktionen.find(passt)
        if (treffer !== undefined) return treffer
      }
      return aktionen[0]
    },
  }
}

const anDeinEnde = (aktion: SpielAktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1' && aktion.ziel.seite === 'ende'
const beenden = (aktion: SpielAktion) => aktion.typ === 'ZugBeenden'
const farbkarte = (aktion: SpielAktion) => aktion.typ === 'FarbkarteLegen'

/** KI-Gegner 1 ist am Zug; du hast eine Schlange Rot, Rot. */
const kiAmZug = () =>
  baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(71) })
    .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
    .schlange(0, ['Rot', 'Rot'])
    .haendeAuffuellen()
    .amZug(1)
    .zustand()

const texte = (eintraege: { text: string }[]) => eintraege.map((eintrag) => eintrag.text)

describe('O6 K1: Jeder KI-Schritt einzeln im Protokoll; „Schneller“ verkürzt die Pause', () => {
  it('O6 K1: Karte und Ziel des KI-Schritts stehen im Protokoll, jeder Schritt mit eigener Nummer', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(anDeinEnde, beenden))
    const { result } = renderHook(() => useSpiel(kiAmZug(), { pause: KI_PAUSE }))
    expect(result.current.verlauf.eintraege).toEqual([])
    warte(KI_PAUSE)
    expect(texte(result.current.verlauf.eintraege)).toEqual(['KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.'])
    warte(KI_PAUSE)
    const eintraege = result.current.verlauf.eintraege
    expect(texte(eintraege)).toEqual(['KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.', 'KI-Gegner 1 zieht 1 Karte.', 'Du bist dran.'])
    expect(eintraege.map((eintrag) => eintrag.schritt)).toEqual([1, 2, 2])
  })

  it('O6 K1: „Schneller“ verkürzt die Pause vor jedem KI-Schritt und lässt sich wieder ausschalten', () => {
    expect(KI_PAUSE_SCHNELL).toBeLessThan(KI_PAUSE)
    expect(KI_PAUSE_SCHNELL).toBeGreaterThan(0)
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(anDeinEnde, beenden))
    const start = kiAmZug()
    const { result } = renderHook(() => useSpiel(start, { pause: KI_PAUSE }))
    expect(result.current.verlauf.schneller).toBe(false)
    act(() => result.current.verlauf.schalteSchneller())
    expect(result.current.verlauf.schneller).toBe(true)
    warte(KI_PAUSE_SCHNELL - 1)
    expect(gespeichert(), 'vor Ablauf der kurzen Pause ist nichts gespielt').toBeNull()
    warte(1)
    expect(gespeichert(), 'nach der kurzen Pause ist der Schritt gespielt').not.toBeNull()
    act(() => result.current.verlauf.schalteSchneller())
    const nachEins = serialisiere(gespeichert()!)
    warte(KI_PAUSE - 1)
    expect(serialisiere(gespeichert()!), 'wieder die volle Pause').toBe(nachEins)
    warte(1)
    expect(serialisiere(gespeichert()!)).not.toBe(nachEins)
  })

  it('O6 K1: ohne Pause („weniger Bewegung“) ändert „Schneller“ nichts', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(anDeinEnde, beenden))
    const { result } = renderHook(() => useSpiel(kiAmZug(), { pause: 0 }))
    act(() => result.current.verlauf.schalteSchneller())
    warte(0)
    expect(gespeichert()).not.toBeNull()
  })
})

describe('O6 K4: Musst du aussetzen, sagt es die Steuerung und spielt weiter', () => {
  it('O6 K4/A7.6: nach dem Zug von KI-Gegner 1 setzt du aus; er ist wieder dran, bis du das nächste Mal handelst, steht es da', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(beenden, farbkarte))
    const start = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(72) })
      .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
      .grube(1, 0)
      .haendeAuffuellen()
      .amZug(1)
      .zustand()
    const { result } = renderHook(() => useSpiel(start, { pause: 0 }))
    warte(0)
    expect(result.current.verlauf.ausgesetzt).toBe(false)
    warte(0)
    expect(texte(result.current.verlauf.eintraege)).toContain('Du setzt diesen Zug aus (Schlangengrube).')
    expect(result.current.verlauf.ausgesetzt).toBe(true)
    expect(result.current.ansicht.status.amZug).toEqual({ name: 'KI-Gegner 1', ich: false })
    warte(0)
    warte(0)
    expect(result.current.ansicht.status.amZug, 'die Partie geht weiter, jetzt bist du dran').toEqual({ name: 'Spieler 1', ich: true })
    expect(result.current.verlauf.ausgesetzt, 'bis zu deiner nächsten Aktion steht es da').toBe(true)
    act(() => result.current.fuehreAus(result.current.ansicht.aktionen.find(farbkarte)!))
    expect(result.current.verlauf.ausgesetzt).toBe(false)
  })
})

/** Drei Spieler: KI-Gegner 1 hat eine Schlangenblockade in die Schlange von KI-Gegner 2 angesagt; KI-Gegner 2 entscheidet. */
function blockadeGegenKi(handVonKi2: Kartenwahl[]): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(73) })
    .hand(2, handVonKi2)
    .schlange(2, ['Gelb', 'Gelb'])
    .schwebend(1, 'Schlangenblockade', (karteId, spielerId) => ({ typ: 'BlockadeLegen', spielerId, karteId, schlangenId: 'schlange-1', position: 1 }), [2])
    .haendeAuffuellen()
    .amZug(1)
    .zustand()
}

/** Eine KI, die 300 ms rechnet, sobald sie abwehren könnte, und immer durchlässt. */
function langsamMitSchutz(): Ki {
  return {
    name: 'Rechnet mit Farbenschutz',
    waehle: (_sicht, aktionen) => {
      if (aktionen.length > 1) vi.setSystemTime(Date.now() + 300)
      return aktionen.find((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null) ?? aktionen[0]
    },
  }
}

/** Wie lange nach dem Start der Schritt sichtbar wird, gemessen an der Uhr des Browsers, und was danach zu sehen ist. */
function messeEntscheidung(start: Spielzustand) {
  const beginn = Date.now()
  const { result, unmount } = renderHook(() => useSpiel(start, { pause: KI_PAUSE }))
  let dauer: number | null = null
  for (let tick = 0; tick < 2 * KI_PAUSE && dauer === null; tick += 1) {
    warte(1)
    if (gespeichert() !== null) dauer = Date.now() - beginn
  }
  const gemessen = { dauer, eintraege: texte(result.current.verlauf.eintraege), ansicht: result.current.ansicht }
  unmount()
  window.localStorage.clear()
  return gemessen
}

describe('O6 K5: Wird eine KI angegriffen, sieht der Ablauf gleich aus, ob sie einen Farbenschutz hält oder nicht', () => {
  it('O6 K5/D33: gleiche Pause bis zur Entscheidung, auch wenn die KI mit Farbenschutz länger rechnet; gleiches Protokoll', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(langsamMitSchutz)
    const mit = messeEntscheidung(blockadeGegenKi(['Farbenschutz', 'Blau', 'Rot', 'Braun', 'Violett']))
    const ohne = messeEntscheidung(blockadeGegenKi(['Grün', 'Blau', 'Rot', 'Braun', 'Violett']))
    expect(mit.dauer, 'mit Farbenschutz: sichtbar nach genau der Pause').toBe(KI_PAUSE)
    expect(ohne.dauer, 'ohne Farbenschutz: sichtbar nach genau der Pause').toBe(KI_PAUSE)
    expect(mit.eintraege).toEqual(ohne.eintraege)
    expect(mit.eintraege).toEqual(['KI-Gegner 2 lässt Schlangenblockade durch.', 'Schlangenblockade wirkt.'])
    expect(mit.ansicht.gegner[1].handkarten).toBe(ohne.ansicht.gegner[1].handkarten)
  })

  it('O6 K5/A7.2: nur eine tatsächliche Abwehr steht im Protokoll', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null))
    const { result } = renderHook(() => useSpiel(blockadeGegenKi(['Farbenschutz', 'Blau', 'Rot', 'Braun', 'Violett']), { pause: 0 }))
    warte(0)
    expect(texte(result.current.verlauf.eintraege)).toEqual(['KI-Gegner 2 wehrt Schlangenblockade mit Farbenschutz ab.', 'Schlangenblockade bleibt ohne Wirkung.'])
    expect(result.current.ansicht.gegner[1].handkarten, 'A6: die Hand des Abwehrenden ist eine Karte kleiner').toBe(4)
  })
})

describe('O6/O3 K4: Die KI-Gegner spielen die solide KI, jeder mit eigener Instanz und eigener Zufallsquelle', () => {
  it('O6: die Strategie der Gegner ist solideKi aus der Registry', () => {
    expect(GEGNER_STRATEGIE).toBe('solideKi')
    const gegner = erstelleGegner(erzeugeSzenario('schlussrunde-ohne-dich'))
    expect([...gegner.values()].map((ki) => ki.name)).toEqual(['Solide KI', 'Solide KI', 'Solide KI'])
    expect(new Set(gegner.values()).size).toBe(3)
  })

  it('O6: mit derselben Saatquelle spielen die Gegner dieselbe Partie (Testhooks, Z1, K5)', () => {
    const spiele = () => {
      let zaehler = 0
      const saatquelle = () => ((zaehler += 1) * 0.137) % 1
      const { unmount } = renderHook(() => useSpiel(erzeugeSzenario('schlussrunde-ohne-dich'), { pause: 0, saatquelle }))
      const staende: string[] = []
      for (let schritt = 0; schritt < 6; schritt += 1) {
        warte(0)
        staende.push(serialisiere(gespeichert()!))
      }
      unmount()
      window.localStorage.clear()
      return staende
    }
    expect(spiele()).toEqual(spiele())
  })
})
