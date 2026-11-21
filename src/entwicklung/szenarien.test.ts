import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, serialisiere } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { findeSzenario, SZENARIEN } from './szenarien'
import { erzeuge } from './szenarienTesthilfe'

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
      if (zug > 2 * spielerzahl) throw new Error(`${name}: Die Partie endet nicht nach ${2 * spielerzahl} Zügen.`)
      const schritt = spieleZug(zustand)
      expect(schritt.ereignisse.some((ereignis) => ereignis.typ === 'KartenGezogen')).toBe(false)
      zustand = schritt.zustand
      // A7.8: Ein zweiter Zug nach einem Verdoppler gehört zum selben letzten Zug.
      if (zustand.partiephase !== 'Beendet' && zustand.zug.teilzug === 1) reihe.push(zustand.zug.spielerIndex)
    }
    expect(reihe).toEqual(folge)
  })

  it('A7.6: aussetzen: KI-Gegner 1 setzt aus, ohne nachzuziehen; die Grube geht auf den Ablagestapel von Spieler 1', () => {
    const zustand = erzeuge('aussetzen')
    const grube = zustand.ausliegendeGruben[0]
    expect(grube).toMatchObject({ gespieltVon: 0, vor: 1 })
    const { zustand: nach, ereignisse } = spieleZug(zustand)
    expect(ereignisse).toContainEqual({ typ: 'Ausgesetzt', spielerIndex: 1, karteId: grube.karte.id, ablagestapelVon: 0 })
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

function artVon(karte: Spielzustand['spieler'][number]['hand'][number]): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
}

/** Die erste aufgezählte Aktion dieses Typs, auf Wunsch mit einer Handkarte dieser Art, wie ein Klick am Tisch. */
function erste(zustand: Spielzustand, typ: SpielAktion['typ'], art?: string): SpielAktion {
  const hand = zustand.spieler[zustand.zug.spielerIndex].hand
  const passend = ermittleAktionen(zustand).find(
    (aktion) => aktion.typ === typ && (art === undefined || ('karteId' in aktion && hand.some((karte) => karte.id === aktion.karteId && artVon(karte) === art))),
  )
  if (passend === undefined) throw new Error(`Testaufbau: ${typ} ${art ?? ''} ist nicht aufgezählt`)
  return passend
}

describe('E3: Szenarien des Verdopplers', () => {
  it('E3: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['verdoppler', 'verdoppler-schlussrunde']))
  })

  it('A7.8/A6/D23: verdoppler: niemand wird gefragt, Auffüllen, im zweiten Zug kein Verdoppler mit Wirkung, dann KI-Gegner 1', () => {
    let zustand = erzeuge('verdoppler')
    expect(zustand.spieler).toHaveLength(3)
    expect(zustand.spieler.slice(1).every((spieler) => spieler.hand.some((karte) => artVon(karte) === 'Farbenschutz'))).toBe(true)
    const zuBeginn = ermittleAktionen(zustand)
    expect(zuBeginn.filter((aktion) => aktion.typ === 'VerdopplerSpielen')).toHaveLength(2)
    expect(zuBeginn.some((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen' && aktion.karteId.startsWith('verdoppler'))).toBe(false)

    const nachVerdoppler = anwendeAktion(zustand, erste(zustand, 'VerdopplerSpielen'))
    zustand = nachVerdoppler.zustand
    expect(nachVerdoppler.ereignisse).toMatchObject([{ typ: 'KarteGespielt', spielerIndex: 0, nach: { ort: 'Ablagestapel', spielerIndex: 0 } }])
    expect(zustand.schwebend).toBeNull()
    expect(new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))).toEqual(new Set(['FarbkarteLegen', 'ZugBeenden']))
    zustand = anwendeAktion(zustand, erste(zustand, 'FarbkarteLegen', 'Rot')).zustand
    expect(ermittleAktionen(zustand).map((aktion) => aktion.typ)).toEqual(['ZugBeenden'])

    const wechsel = anwendeAktion(zustand, erste(zustand, 'ZugBeenden'))
    expect(wechsel.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 },
      { typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 },
    ])
    zustand = wechsel.zustand
    expect(ermittleAktionen(zustand).some((aktion) => aktion.typ === 'VerdopplerSpielen')).toBe(false)
    zustand = anwendeAktion(zustand, erste(zustand, 'FarbkarteLegen', 'Blau')).zustand
    zustand = anwendeAktion(zustand, erste(zustand, 'SonderkarteWirkungslosAblegen', 'Verdoppler')).zustand
    expect(ermittleAktionen(zustand).map((aktion) => aktion.typ)).toEqual(['ZugBeenden'])
    const ende = anwendeAktion(zustand, erste(zustand, 'ZugBeenden'))
    expect(ende.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
    ])
    expect(ende.zustand.spieler[0].hand).toHaveLength(5)
  })

  it('A10/A7.8: verdoppler-schlussrunde: zweiter Zug ohne Auffüllen, dann genau ein letzter Zug für KI-Gegner 1 und Spielende', () => {
    let zustand = erzeuge('verdoppler-schlussrunde')
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 2, nachziehstapel: [], zug: { spielerIndex: 0, teilzug: 1 } })
    zustand = anwendeAktion(zustand, erste(zustand, 'VerdopplerSpielen')).zustand
    zustand = anwendeAktion(zustand, erste(zustand, 'FarbkarteLegen', 'Grün')).zustand
    const wechsel = anwendeAktion(zustand, erste(zustand, 'ZugBeenden'))
    expect(wechsel.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 }])
    zustand = wechsel.zustand
    expect(zustand.spieler[0].hand.map(artVon)).toEqual(['Gelb', 'Farbenschutz'])
    zustand = anwendeAktion(zustand, erste(zustand, 'FarbkarteLegen', 'Gelb')).zustand
    zustand = anwendeAktion(zustand, erste(zustand, 'SonderkarteWirkungslosAblegen', 'Farbenschutz')).zustand
    const nachZweitem = anwendeAktion(zustand, erste(zustand, 'ZugBeenden'))
    expect(nachZweitem.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }])
    const letzter = spieleZug(nachZweitem.zustand)
    expect(letzter.ereignisse.filter((ereignis) => ereignis.typ === 'ZugBegonnen' || ereignis.typ === 'KartenGezogen')).toEqual([])
    expect(letzter.zustand.partiephase).toBe('Beendet')
  })
})
