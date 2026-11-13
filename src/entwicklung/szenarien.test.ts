import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, serialisiere } from '../engine'
import type { Ereignis, Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { findeSzenario, SZENARIEN } from './szenarien'

function erzeuge(name: string) {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

describe('E1: Szenarien des Entwicklertischs', () => {
  it('E1: die Szenarien des Tasks sind da: start-2, start-4, start-erweiterung', () => {
    const namen = SZENARIEN.map((szenario) => szenario.name)
    expect(namen).toEqual(expect.arrayContaining(['start-2', 'start-4', 'start-erweiterung']))
  })

  it('P0.4: jedes Szenario hat einen eindeutigen, adressierbaren Namen, Beschreibung und erwartetes Verhalten', () => {
    expect(new Set(SZENARIEN.map((s) => s.name)).size).toBe(SZENARIEN.length)
    for (const szenario of SZENARIEN) {
      expect(szenario.name).toMatch(/^[a-z0-9-]+$/)
      expect(szenario.beschreibung.length, szenario.name).toBeGreaterThan(10)
      expect(szenario.erwartet.length, szenario.name).toBeGreaterThan(10)
    }
  })

  it('P0.4: findeSzenario kennt nur vorhandene Namen', () => {
    expect(findeSzenario('gibtsnicht')).toBeUndefined()
    expect(findeSzenario(SZENARIEN[0].name)).toBe(SZENARIEN[0])
  })

  it('P0.4: jedes Szenario ist reproduzierbar', () => {
    for (const szenario of SZENARIEN) {
      expect(serialisiere(szenario.erzeuge()), szenario.name).toBe(serialisiere(szenario.erzeuge()))
    }
  })

  it('P0.4: nur das absichtlich kaputte Szenario verletzt eine Invariante', () => {
    for (const szenario of SZENARIEN) {
      const verletzt = pruefeInvarianten(szenario.erzeuge()).filter((i) => i.verletzt).map((i) => i.name)
      if (szenario.name === 'kaputt-doppelte-karte') {
        expect(verletzt).toEqual([
          'Jede Spielkarte liegt genau einmal an genau einem Ort',
          'Alle Ids sind eindeutig',
          'Der Spielstand übersteht Speichern und Laden unverändert',
        ])
      } else {
        expect(verletzt, szenario.name).toEqual([])
      }
    }
  })

  it('E1: die Startszenarien stehen dort, wo ihr Name es verspricht', () => {
    const zwei = erzeuge('start-2')
    expect(zwei.spieler).toHaveLength(2)
    expect(zwei.erweiterung).toBe(false)
    expect(zwei.spieler.every((spieler) => spieler.hand.length === 5)).toBe(true)
    expect(erzeuge('start-4').spieler).toHaveLength(4)
    const erweitert = erzeuge('start-erweiterung')
    expect(erweitert.erweiterung).toBe(true)
    expect(erweitert.offeneAufgaben).toHaveLength(3)
    expect(erweitert.spieler.every((spieler) => spieler.comeback !== null && spieler.risikoKarten.length === 2)).toBe(true)
  })

  it('E1: alle-orte legt Karten an jeden Ort, den der Zustand kennt', () => {
    const zustand = erzeuge('alle-orte')
    expect(zustand.spieler.some((spieler) => spieler.schlangen.some((schlange) => schlange.fusionen.length > 0))).toBe(true)
    expect(zustand.spieler.some((spieler) => spieler.ablagestapel.length > 0)).toBe(true)
    expect(zustand.ausliegendeGruben.length).toBeGreaterThan(0)
    expect(zustand.schwebend).not.toBeNull()
    expect(zustand.ausDemSpiel.length).toBeGreaterThan(0)
  })
})

/** Spielt die erste aufgezählte Karte (falls es eine gibt) und beendet den Zug, wie zwei Klicks am Tisch. */
function spieleZug(zustand: Spielzustand): { zustand: Spielzustand; ereignisse: Ereignis[] } {
  const karte = ermittleAktionen(zustand).find((aktion) => aktion.typ !== 'ZugBeenden')
  const nachKarte = karte === undefined ? { zustand, ereignisse: [] } : anwendeAktion(zustand, karte)
  const ende = ermittleAktionen(nachKarte.zustand).find((aktion) => aktion.typ === 'ZugBeenden')
  if (ende === undefined) throw new Error('Testaufbau: „Zug beenden“ ist nicht aufgezählt')
  const nachEnde = anwendeAktion(nachKarte.zustand, ende)
  return { zustand: nachEnde.zustand, ereignisse: [...nachKarte.ereignisse, ...nachEnde.ereignisse] }
}

describe('E2: Szenarien des Zugablaufs', () => {
  it('E2: die Szenarien des Tasks sind da', () => {
    const namen = SZENARIEN.map((szenario) => szenario.name)
    expect(namen).toEqual(
      expect.arrayContaining(['stapel-fast-leer', 'schlussrunde-2', 'schlussrunde-4', 'aussetzen', 'nur-farbenschutz', 'nur-sonderkarten']),
    )
  })

  it('A10: stapel-fast-leer: KI-Gegner 1 zieht zu Zugbeginn die letzte Karte, spielt seinen Zug, dann folgt der letzte Zug von Spieler 1', () => {
    let zustand = erzeuge('stapel-fast-leer')
    expect(zustand.nachziehstapel).toHaveLength(2)
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 2])
    zustand = spieleZug(zustand).zustand
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 1, nachziehstapel: [] })
    expect(zustand.spieler[1].hand).toHaveLength(3)
    zustand = spieleZug(zustand).zustand
    expect(zustand.zug.spielerIndex).toBe(0)
    expect(spieleZug(zustand).zustand.partiephase).toBe('Beendet')
  })

  it.each([
    ['schlussrunde-2', 2, 0, [1]],
    ['schlussrunde-4', 4, 2, [3, 0, 1]],
  ] as const)('A10: %s: nach dem Auslöser hat jeder andere genau einen letzten Zug ohne Nachziehen', (name, spielerzahl, ausloeser, folge) => {
    let zustand = erzeuge(name)
    expect(zustand.spieler).toHaveLength(spielerzahl)
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: ausloeser, zug: { spielerIndex: ausloeser } })
    const reihe: number[] = []
    for (let zug = 0; zustand.partiephase !== 'Beendet'; zug += 1) {
      if (zug > spielerzahl) throw new Error(`${name}: Die Partie endet nicht nach ${spielerzahl} Zügen.`)
      const schritt = spieleZug(zustand)
      expect(schritt.ereignisse.some((ereignis) => ereignis.typ === 'KartenGezogen')).toBe(false)
      zustand = schritt.zustand
      if (zustand.partiephase !== 'Beendet') reihe.push(zustand.zug.spielerIndex)
    }
    expect(reihe).toEqual(folge)
  })

  it('A7.6: aussetzen: KI-Gegner 1 setzt aus, ohne nachzuziehen; die Grube geht auf den Ablagestapel von Spieler 1', () => {
    const zustand = erzeuge('aussetzen')
    const grube = zustand.ausliegendeGruben[0]
    expect(grube).toMatchObject({ gespieltVon: 0, vor: 1 })
    const { zustand: nach, ereignisse } = spieleZug(zustand)
    expect(ereignisse).toContainEqual({ typ: 'Ausgesetzt', spielerIndex: 1 })
    expect(nach.zug.spielerIndex).toBe(2)
    expect(nach.spieler[1].hand).toEqual(zustand.spieler[1].hand)
    expect(nach.spieler[0].ablagestapel.map((karte) => karte.id)).toContain(grube.karte.id)
  })

  it('A5: nur-farbenschutz: angeboten wird nur das wirkungslose Ablegen, danach nur „Zug beenden“ mit Auffüllen auf 5', () => {
    const zustand = erzeuge('nur-farbenschutz')
    const angeboten = ermittleAktionen(zustand)
    expect(zustand.spieler[0].hand.every((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz')).toBe(true)
    expect(new Set(angeboten.map((aktion) => aktion.typ))).toEqual(new Set(['SonderkarteWirkungslosAblegen']))
    const nach = anwendeAktion(zustand, angeboten[0]).zustand
    expect(ermittleAktionen(nach).map((aktion) => aktion.typ)).toEqual(['ZugBeenden'])
    expect(anwendeAktion(nach, ermittleAktionen(nach)[0]).zustand.spieler[0].hand).toHaveLength(5)
  })

  it('A5/D13: nur-sonderkarten: fünf Sonderkarten ohne Ziel, jede wirkungslos ablegbar, „Zug beenden“ erst danach', () => {
    const zustand = erzeuge('nur-sonderkarten')
    expect(zustand.spieler[0].hand.every((karte) => karte.typ === 'Sonderkarte')).toBe(true)
    expect(zustand.spieler.flatMap((spieler) => spieler.schlangen)).toEqual([])
    const angeboten = ermittleAktionen(zustand)
    expect(angeboten.map((aktion) => aktion.typ)).toEqual(Array(5).fill('SonderkarteWirkungslosAblegen'))
    expect(ermittleAktionen(anwendeAktion(zustand, angeboten[0]).zustand).map((aktion) => aktion.typ)).toEqual(['ZugBeenden'])
  })
})
