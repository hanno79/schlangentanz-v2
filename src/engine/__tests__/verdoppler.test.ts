import { describe, expect, it } from 'vitest'
import { ermittleAktionen, ermittleEntscheider } from '../index'
import type { Aktionstyp, Ereignis, SpielAktion, Spielzustand } from '../index'
import { KARTENREGISTER } from '../karten/register'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { ablage, aktionFuer, aktionen, ereignisseVom, fuehreAus, grund, hand, spieleZug, typen, zugBeenden } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
E3, Verdoppler: A5 (der Verdoppler im Zug, Wichtig), A7.8 (Text, Beispiel,
Wichtige Regeln), D11, D12, D23; dazu A6 (wer abwehren darf, wohin gespielte
Sonderkarten kommen) und A10 (Spielende). Der Wortlaut von A5 und A7.8 ist der
der Website vom 13.11.2026: „zusammen mit höchstens einer Farbkarte“, der
zweite Zug „läuft wie ein normaler Zug ab“, „Im zweiten Zug darfst du keinen
weiteren Verdoppler spielen“, nach D23 heisst das: keinen mit Wirkung.
*/

const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']

/** Spieler 1 am Zug mit genau dieser Hand, die Mitspieler halten `gegner` (Standard: fünf Farbkarten). */
function tisch(hand0: Kartenwahl[], spielerzahl = 2, gegner: Kartenwahl[] = FUENF): Baukasten {
  const bau = baukasten({ spielerzahl, erweiterung: false }).hand(0, hand0)
  for (let index = 1; index < spielerzahl; index += 1) bau.hand(index, gegner)
  return bau
}

/** Die Id der ersten Handkarte dieser Farbe oder Sonderkarte, standardmässig beim Spieler am Zug. */
function karte(zustand: Spielzustand, art: string, spieler = zustand.zug.spielerIndex): string {
  const gefunden = zustand.spieler[spieler].hand.find((handkarte) => (handkarte.typ === 'Farbkarte' ? handkarte.farbe : handkarte.name) === art)
  if (gefunden === undefined) throw new Error(`Testaufbau: ${art} liegt nicht auf der Hand von Spieler ${spieler}`)
  return gefunden.id
}

/** Spielt die erste aufgezählte Aktion dieses Typs mit der ersten Handkarte dieser Art. */
function spiele(zustand: Spielzustand, typ: Aktionstyp, art: string): Schritt {
  return fuehreAus(zustand, aktionFuer(zustand, typ, karte(zustand, art)))
}

function verdoppler(zustand: Spielzustand): Schritt {
  return spiele(zustand, 'VerdopplerSpielen', 'Verdoppler')
}

function beenden(zustand: Spielzustand): Schritt {
  return fuehreAus(zustand, zugBeenden(zustand))
}

function wirkungslos(zustand: Spielzustand, art: string): SpielAktion {
  return { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: karte(zustand, art) }
}

/** Erster Zug mit Verdoppler und dieser Farbkarte, dann „Zug beenden“: liefert den Beginn des zweiten Zugs. */
function ersterZug(zustand: Spielzustand, farbe: string): Schritt {
  const nachFarbe = spiele(verdoppler(zustand).zustand, 'FarbkarteLegen', farbe).zustand
  return beenden(nachFarbe)
}

describe('A7.8/A5: der Verdoppler im ersten Zug', () => {
  it('A7.8: der Verdoppler zählt als Sonderkarte des Zuges: danach keine weitere Sonderkarte, aber noch eine Farbkarte', () => {
    const { zustand } = verdoppler(tisch(['Verdoppler', 'Blau', 'Farbenschutz', 'Rot']).zustand())
    expect(zustand.zug).toMatchObject({ teilzug: 1, gespielteSonderkarten: 1, gespielteFarbkarten: 0, verdopplerGespielt: true })
    expect(typen(zustand)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(grund(zustand, wirkungslos(zustand, 'Farbenschutz'))).toMatch(/schon eine Sonderkarte.*\(A5, D12\)/)
  })

  it('A7.8: höchstens eine Farbkarte nach dem Verdoppler; danach bleibt nur „Zug beenden“', () => {
    const nachVerdoppler = verdoppler(tisch(['Verdoppler', 'Blau', 'Rot']).zustand()).zustand
    const { zustand } = spiele(nachVerdoppler, 'FarbkarteLegen', 'Blau')
    expect(typen(zustand)).toEqual(['ZugBeenden'])
    const rot: SpielAktion = { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karte(zustand, 'Rot'), ziel: { art: 'neueSchlange' } }
    expect(grund(zustand, rot)).toMatch(/schon eine Farbkarte.*\(A5, D12\)/)
  })

  it('A7.8: die Reihenfolge ist frei: die Farbkarte darf vor dem Verdoppler kommen', () => {
    const nachFarbe = spiele(tisch(['Blau', 'Verdoppler', 'Rot']).zustand(), 'FarbkarteLegen', 'Blau').zustand
    expect(typen(nachFarbe)).toContain('VerdopplerSpielen')
    const nachVerdoppler = verdoppler(nachFarbe).zustand
    expect(typen(nachVerdoppler)).toEqual(['ZugBeenden'])
    expect(beenden(nachVerdoppler).zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
  })

  it('A7.8/D12: der Verdoppler allein genügt als Karte des ersten Zuges', () => {
    const { zustand } = verdoppler(tisch(['Verdoppler', 'Blau', 'Rot']).zustand())
    expect(typen(zustand)).toContain('ZugBeenden')
    expect(beenden(zustand).zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
  })

  it('A6/A7.8: der gespielte Verdoppler kommt auf den eigenen Ablagestapel; das Ereignis nennt ihn und den Ort', () => {
    const start = tisch(['Verdoppler', 'Blau']).zustand()
    const id = karte(start, 'Verdoppler')
    const { zustand, ereignisse } = verdoppler(start)
    expect(ereignisse).toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: id, aktion: 'VerdopplerSpielen', nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(ablage(zustand, 0)).toEqual([id])
    expect(hand(zustand, 0)).not.toContain(id)
  })

  it('D25: im ersten Zug hat der Verdoppler ein Ziel: aufgezählt wird er mit Wirkung, wirkungslos ablegen wird abgelehnt', () => {
    const zustand = tisch(['Verdoppler', 'Blau']).zustand()
    const id = karte(zustand, 'Verdoppler')
    expect(aktionen(zustand, 'VerdopplerSpielen')).toEqual([{ typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: id }])
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toEqual([])
    expect(grund(zustand, wirkungslos(zustand, 'Verdoppler'))).toMatch(/Verdoppler hat ein mögliches Ziel.*\(D25\)/)
  })
})

describe('A7.8/A5: Auffüllen und der zweite Zug', () => {
  it('A7.8: beim Beenden des ersten Zuges füllt er auf 5 auf und spielt sofort einen zweiten Zug; das Ereignis nennt Teilzug 2', () => {
    const start = tisch(['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün'], 3).zustand()
    const { zustand, ereignisse } = ersterZug(start, 'Blau')
    expect(ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 },
      { typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 },
    ])
    expect(zustand.zug).toEqual({
      spielerIndex: 0,
      teilzug: 2,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
      verdopplerGespielt: false,
      farbenfusionGespielt: false,
      abschnitt: 'Ausspielen',
    })
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 5, 5])
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(hand(zustand, 1)).toEqual(hand(start, 1))
  })

  it('A7.8/D12: der zweite Zug läuft wie ein normaler Zug: ohne Karte kein „Zug beenden“', () => {
    const { zustand } = ersterZug(tisch(['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün']).zustand(), 'Blau')
    expect(typen(zustand)).not.toContain('ZugBeenden')
    expect(grund(zustand, zugBeenden(zustand))).toMatch(/mindestens eine Karte.*\(A5, D12\)/)
  })

  it('A7.8/D12: im zweiten Zug höchstens eine Farbkarte und eine Sonderkarte, in beliebiger Reihenfolge', () => {
    const hand0: Kartenwahl[] = ['Verdoppler', 'Blau', 'Farbenschutz', 'Rot', 'Farbenschutz']
    let { zustand } = ersterZug(tisch(hand0).stapelOben(['Gelb', 'Grün']).zustand(), 'Blau')
    zustand = fuehreAus(zustand, wirkungslos(zustand, 'Farbenschutz')).zustand
    expect(grund(zustand, wirkungslos(zustand, 'Farbenschutz'))).toMatch(/schon eine Sonderkarte.*\(A5, D12\)/)
    zustand = spiele(zustand, 'FarbkarteLegen', 'Rot').zustand
    const gelb: SpielAktion = { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karte(zustand, 'Gelb'), ziel: { art: 'neueSchlange' } }
    expect(grund(zustand, gelb)).toMatch(/schon eine Farbkarte.*\(A5, D12\)/)
    expect(typen(zustand)).toEqual(['ZugBeenden'])
  })

  it('A7.8/A5: nach dem zweiten Zug füllt er auf 5 auf, dann beginnt der Nächste seinen ersten Zug', () => {
    let { zustand } = ersterZug(tisch(['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün'], 3).zustand(), 'Blau')
    zustand = spiele(zustand, 'FarbkarteLegen', 'Rot').zustand
    const { zustand: nach, ereignisse } = beenden(zustand)
    expect(ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
    ])
    expect(nach.zug).toMatchObject({ spielerIndex: 1, teilzug: 1, verdopplerGespielt: false })
    expect(nach.spieler[0].hand).toHaveLength(5)
  })

  it('A7.8 Beispiel: Verdoppler und Rot, auffüllen, dann Blau und Schlangenfrass: neben dem Verdoppler drei Karten', () => {
    const start = tisch(['Verdoppler', 'Rot', 'Blau', 'Schlangenfrass', 'Gelb']).stapelOben(['Grün', 'Violett']).zustand()
    const gespielt: Ereignis[] = []
    let schritt = verdoppler(start)
    gespielt.push(...schritt.ereignisse)
    schritt = spiele(schritt.zustand, 'FarbkarteLegen', 'Rot')
    gespielt.push(...schritt.ereignisse)
    schritt = beenden(schritt.zustand)
    expect(schritt.zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(schritt.zustand.spieler[0].hand).toHaveLength(5)
    schritt = spiele(schritt.zustand, 'FarbkarteLegen', 'Blau')
    gespielt.push(...schritt.ereignisse)
    // Schlangenfrass so, wie die Engine ihn anbietet: heute ohne Ziel wirkungslos (D13), mit E6 mit Wirkung.
    const frass = karte(schritt.zustand, 'Schlangenfrass')
    const mitFrass = ermittleAktionen(schritt.zustand).find((aktion) => 'karteId' in aktion && aktion.karteId === frass)
    expect(mitFrass, 'Schlangenfrass ist im zweiten Zug nicht aufgezählt').toBeDefined()
    schritt = fuehreAus(schritt.zustand, mitFrass!)
    gespielt.push(...schritt.ereignisse)
    expect(typen(schritt.zustand)).toEqual(['ZugBeenden'])
    const karten = ereignisseVom(gespielt, 'KarteGespielt')
    expect(karten.map((ereignis) => ereignis.spielerIndex)).toEqual([0, 0, 0, 0])
    expect(karten.filter((ereignis) => ereignis.aktion !== 'VerdopplerSpielen')).toHaveLength(3)
    expect(beenden(schritt.zustand).zustand.zug).toMatchObject({ spielerIndex: 1, teilzug: 1 })
  })

  it('D11: im Zug danach darf der Nächste selbst wieder einen Verdoppler mit Wirkung spielen', () => {
    let { zustand } = ersterZug(tisch(['Verdoppler', 'Blau', 'Rot'], 2, ['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün']).zustand(), 'Blau')
    zustand = beenden(spiele(zustand, 'FarbkarteLegen', 'Rot').zustand).zustand
    expect(zustand.zug).toMatchObject({ spielerIndex: 1, teilzug: 1 })
    expect(aktionen(zustand, 'VerdopplerSpielen')).toHaveLength(1)
  })
})

describe('A7.8/D11/D23: kein weiterer Verdoppler im zweiten Zug', () => {
  it('A7.8/D11: im zweiten Zug wird ein Verdoppler mit Wirkung nicht angeboten und mit Grund abgelehnt', () => {
    const { zustand } = ersterZug(tisch(['Verdoppler', 'Blau', 'Verdoppler', 'Rot']).zustand(), 'Blau')
    expect(aktionen(zustand, 'VerdopplerSpielen')).toEqual([])
    const zweiter: SpielAktion = { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karte(zustand, 'Verdoppler') }
    const meldung = grund(zustand, zweiter)
    expect(meldung).toMatch(/zweiten Zug.*keinen weiteren Zug.*\(A7\.8, D11\)/)
    expect(meldung).toMatch(/wirkungslos.*\(D23\)/)
  })

  it('D23: im zweiten Zug darf der Verdoppler wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte, ein weiterer Zug folgt nicht', () => {
    let { zustand } = ersterZug(tisch(['Verdoppler', 'Blau', 'Verdoppler', 'Rot', 'Farbenschutz']).zustand(), 'Blau')
    const zweiter = karte(zustand, 'Verdoppler')
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toContain(zweiter)
    zustand = fuehreAus(zustand, wirkungslos(zustand, 'Verdoppler')).zustand
    expect(zustand.zug).toMatchObject({ teilzug: 2, gespielteSonderkarten: 1, verdopplerGespielt: false })
    expect(ablage(zustand, 0)).toContain(zweiter)
    expect(grund(zustand, wirkungslos(zustand, 'Farbenschutz'))).toMatch(/schon eine Sonderkarte/)
    const { zustand: nach, ereignisse } = beenden(zustand)
    expect(ereignisseVom(ereignisse, 'ZugBegonnen')).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }])
    expect(nach.zug.spielerIndex).toBe(1)
  })

  it('D23: wer im zweiten Zug nur Verdoppler hält, legt einen wirkungslos ab; „Zug beenden“ erst danach, ein dritter Zug folgt nicht', () => {
    let zustand = tisch(['Verdoppler', 'Verdoppler', 'Verdoppler']).schlussrunde(1).amZug(0).zustand()
    zustand = beenden(verdoppler(zustand).zustand).zustand
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(zustand.spieler[0].hand.every((handkarte) => handkarte.typ === 'Sonderkarte' && handkarte.name === 'Verdoppler')).toBe(true)
    expect(aktionen(zustand).map((aktion) => aktion.typ)).toEqual(['SonderkarteWirkungslosAblegen', 'SonderkarteWirkungslosAblegen'])
    zustand = fuehreAus(zustand, aktionen(zustand)[0]).zustand
    expect(typen(zustand)).toEqual(['ZugBeenden'])
    expect(beenden(zustand).ereignisse).toEqual([{ typ: 'PartieBeendet' }])
  })
})

describe('A6: der Verdoppler betrifft keinen Mitspieler (Plan E3, Kriterium 4)', () => {
  it('A6: auch wer Farbenschutz hält, wird nicht gefragt; es entscheidet weiter der Spieler am Zug', () => {
    const start = tisch(['Verdoppler', 'Blau'], 3, ['Farbenschutz', 'Farbenschutz', 'Rot', 'Gelb', 'Blau']).zustand()
    const aktion = aktionFuer(start, 'VerdopplerSpielen', karte(start, 'Verdoppler'))
    expect(KARTENREGISTER.Verdoppler.betroffene(start, aktion as Parameters<typeof KARTENREGISTER.Verdoppler.betroffene>[1])).toEqual([])
    const { zustand, ereignisse } = fuehreAus(start, aktion)
    expect(zustand.schwebend).toBeNull()
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(ermittleAktionen(zustand).every((angeboten) => angeboten.spielerId === 'spieler-1' && angeboten.typ !== 'Reagieren')).toBe(true)
    expect(ereignisseVom(ereignisse, 'Abgewehrt')).toEqual([])
    expect([hand(zustand, 1), hand(zustand, 2)]).toEqual([hand(start, 1), hand(start, 2)])
    const zweiterZug = beenden(zustand)
    expect(ereignisseVom(zweiterZug.ereignisse, 'ZugBegonnen')).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 }])
  })
})

describe('A10: Verdoppler und Spielende', () => {
  it('A10/A7.8: wird der Stapel beim Auffüllen zwischen den Zügen leer, spielt er den zweiten Zug noch; danach hat jeder andere genau einen letzten Zug', () => {
    const start = tisch(['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün'], 3).stapelBehalten(1).zustand()
    const zwischen = ersterZug(start, 'Blau')
    expect(zwischen.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'SchlussrundeBegonnen', ausloeser: 0 },
      { typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 },
    ])
    let zustand = zwischen.zustand
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0, nachziehstapel: [] })
    expect(zustand.spieler[0].hand).toHaveLength(4)
    zustand = spiele(zustand, 'FarbkarteLegen', 'Rot').zustand
    const ende = beenden(zustand)
    expect(ende.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }])
    zustand = ende.zustand
    const ereignisse: Ereignis[] = []
    for (let zug = 0; zustand.partiephase !== 'Beendet'; zug += 1) {
      if (zug > 5) throw new Error('Testaufbau: Die Partie endet nicht.')
      const schritt = spieleZug(zustand)
      zustand = schritt.zustand
      ereignisse.push(...schritt.ereignisse)
    }
    expect(ereignisseVom(ereignisse, 'KartenGezogen')).toEqual([])
    expect(ereignisseVom(ereignisse, 'ZugBegonnen')).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 }])
    expect(ereignisse[ereignisse.length - 1]).toEqual({ typ: 'PartieBeendet' })
  })

  it('A10/A7.8: Verdoppler in der Schlussrunde: der zweite Zug folgt ohne Auffüllen, beide zusammen sind sein letzter Zug', () => {
    let zustand = baukasten({ spielerzahl: 3, erweiterung: false })
      .hand(0, FUENF)
      .hand(1, ['Verdoppler', 'Blau', 'Rot', 'Gelb'])
      .hand(2, FUENF)
      .schlussrunde(0)
      .amZug(1)
      .zustand()
    zustand = verdoppler(zustand).zustand
    zustand = spiele(zustand, 'FarbkarteLegen', 'Blau').zustand
    const zwischen = beenden(zustand)
    expect(zwischen.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 2 }])
    zustand = zwischen.zustand
    expect(zustand.spieler[1].hand).toHaveLength(2)
    zustand = spiele(zustand, 'FarbkarteLegen', 'Rot').zustand
    const nachZweitem = beenden(zustand)
    expect(nachZweitem.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 }])
    const letzter = spieleZug(nachZweitem.zustand).ereignisse
    expect(ereignisseVom(letzter, 'ZugBegonnen')).toEqual([])
    expect(letzter[letzter.length - 1]).toEqual({ typ: 'PartieBeendet' })
  })

  it('A10/A7.8: leere Hand im zweiten Zug: angeboten ist nur „Zug beenden“, und es ist erlaubt', () => {
    let zustand = tisch(['Verdoppler', 'Blau'], 3).schlussrunde(2).amZug(0).zustand()
    zustand = ersterZug(zustand, 'Blau').zustand
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(zustand.spieler[0].hand).toEqual([])
    expect(aktionen(zustand)).toEqual([zugBeenden(zustand)])
    expect(beenden(zustand).ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }])
  })

  it('A10/A7.8: in der Schlussrunde mit dem Verdoppler als einziger Karte folgt ein zweiter Zug mit leerer Hand', () => {
    let zustand = tisch(['Verdoppler']).schlussrunde(1).amZug(0).zustand()
    zustand = verdoppler(zustand).zustand
    expect(typen(zustand)).toEqual(['ZugBeenden'])
    const zwischen = beenden(zustand)
    expect(zwischen.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 }])
    expect(aktionen(zwischen.zustand)).toEqual([zugBeenden(zwischen.zustand)])
    expect(beenden(zwischen.zustand).ereignisse).toEqual([{ typ: 'PartieBeendet' }])
  })
})

describe('A7.8/A5: Grenzfälle der Hand', () => {
  it('A7.8: Verdoppler als einzige Handkarte: allein gespielt, aufgefüllt auf 5, dann der zweite Zug', () => {
    const { zustand } = verdoppler(tisch(['Verdoppler']).zustand())
    expect(zustand.spieler[0].hand).toEqual([])
    expect(typen(zustand)).toEqual(['ZugBeenden'])
    const { zustand: zweiter, ereignisse } = beenden(zustand)
    expect(ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 5 },
      { typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 },
    ])
    expect(zweiter.spieler[0].hand).toHaveLength(5)
    expect(typen(zweiter)).not.toContain('ZugBeenden')
  })

  it('A5/A7.8: hält er nach dem Auffüllen des ersten Zuges mehr als 5 Karten, wirft er erst ab, dann folgt der zweite Zug', () => {
    const acht: Kartenwahl[] = ['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Rot']
    const nachKarten = spiele(verdoppler(tisch(acht).zustand()).zustand, 'FarbkarteLegen', 'Blau').zustand
    const abwerfen = beenden(nachKarten)
    expect(abwerfen.ereignisse).toEqual([{ typ: 'AbwerfenVerlangt', spielerIndex: 0, anzahl: 1 }])
    expect(typen(abwerfen.zustand)).toEqual(['UeberhandAbwerfen'])
    const { zustand, ereignisse } = fuehreAus(abwerfen.zustand, aktionen(abwerfen.zustand)[0])
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenAbgeworfen', 'ZugBegonnen'])
    expect(ereignisse[1]).toEqual({ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 })
    expect(zustand.spieler[0].hand).toHaveLength(5)
  })
})
