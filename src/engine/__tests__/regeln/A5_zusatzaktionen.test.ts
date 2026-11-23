import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, serialisiere } from '../../index'
import type { Spielzustand } from '../../index'
import { KARTENREGISTER } from '../../karten/register'
import { baukasten } from '../../testing/szenario'
import type { Kartenwahl } from '../../testing/szenario'
import { darfZugBeenden, meldeZugerweiterung, zaehleZusatzaktion, zusatzaktionGrenze } from '../../zuggrenzen'
import type { Zusatzaktion } from '../../zuggrenzen'
import { aktionen, fuehreAus, grund, typen, zugBeenden } from '../zugablauf_hilfen'

/*
X3, Kriterium 1: Ein Zug kann zusätzliche Aktionen haben, und alle Grenzen
eines Zuges stehen an einer Stelle (`zuggrenzen.ts`). Die Grundregel bleibt:
höchstens eine Farbkarte und eine Sonderkarte (A5, D12). Zusatzaktionen kommen
obendrauf, auch zweimal dieselbe Art (A8.1, D46); eine zweite Farbenfusion
gibt es auch dann nicht (A7.7, D27, D46), und neben einer anderen
Zugerweiterung wirkt kein Verdoppler (A7.8, D46, D47).

Comeback und Schlangenkorb gibt es in X3 noch nicht (X4, X6). Die Tests melden
deshalb Test-Zusatzaktionen direkt im Rahmen an, so wie es die Karten später tun.
*/

const FREI: Zusatzaktion = { quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte', 'Testaktion'], nurKarten: null }

/** Spieler 1 am Zug mit dieser Hand; mit `zusatz` hat er diese Zusatzaktionen, wie nach einer Comeback-Karte (A8.1). */
function tisch(hand: Kartenwahl[], zusatz: Zusatzaktion[] = [], schlange: Kartenwahl[] = []): Spielzustand {
  const bau = baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, hand).hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
  if (schlange.length > 0) bau.schlange(0, schlange)
  if (zusatz.length > 0) bau.aendere((zustand) => meldeZugerweiterung(zustand.zug, 'Comeback', zusatz))
  return bau.zustand()
}

/** Spielt die erste aufgezählte Aktion, die diese Handkarte mit Wirkung spielt. */
function spiele(zustand: Spielzustand, karteId: string): Spielzustand {
  const angebot = ermittleAktionen(zustand).find((aktion) => aktion.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in aktion && aktion.karteId === karteId)
  if (angebot === undefined) throw new Error(`Testaufbau: ${karteId} ist nicht mit Wirkung aufgezählt.`)
  return fuehreAus(zustand, angebot).zustand
}

function karteVon(zustand: Spielzustand, art: string, nummer = 0): string {
  const passend = zustand.spieler[0].hand.filter((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name) === art)
  if (passend[nummer] === undefined) throw new Error(`Testaufbau: ${art} Nummer ${nummer} fehlt.`)
  return passend[nummer].id
}

function mitWirkung(zustand: Spielzustand, karteId: string): boolean {
  return ermittleAktionen(zustand).some((aktion) => aktion.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in aktion && aktion.karteId === karteId)
}

function anlegen(karteId: string): { typ: 'FarbkarteLegen'; spielerId: string; karteId: string; ziel: { art: 'neueSchlange' } } {
  return { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId, ziel: { art: 'neueSchlange' } }
}

describe('A5/D12: ohne Zusatzaktion bleibt die Grenze, wie sie war', () => {
  it('A5/D12: nach einer Farbkarte geht keine zweite; der Grund ist derselbe wie vor X3', () => {
    const start = tisch(['Blau', 'Rot'])
    const nach = spiele(start, karteVon(start, 'Blau'))
    expect(mitWirkung(nach, karteVon(nach, 'Rot'))).toBe(false)
    expect(grund(nach, anlegen(karteVon(nach, 'Rot')))).toBe('In diesem Zug ist schon eine Farbkarte gespielt; je Zug höchstens eine Farbkarte und eine Sonderkarte (A5, D12).')
  })
})

describe('A8.1/D46: Zusatzaktionen kommen obendrauf', () => {
  it('A8.1/D46: zwei Zusatzaktionen erlauben zwei weitere Karten, auch zweimal dieselbe Art: drei Farbkarten in einem Zug', () => {
    let zustand = tisch(['Blau', 'Rot', 'Gelb', 'Grün'], [FREI, FREI])
    for (const farbe of ['Blau', 'Rot', 'Gelb']) zustand = spiele(zustand, karteVon(zustand, farbe))
    expect(zustand.zug.gespielteFarbkarten).toBe(3)
    expect(mitWirkung(zustand, karteVon(zustand, 'Grün')), 'D46: eine vierte Farbkarte geht nicht mehr').toBe(false)
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karteVon(zustand, 'Grün'), ziel: { art: 'schlange', schlangenId: zustand.spieler[0].schlangen[0].id, seite: 'ende' } })).toMatch(/D46/)
    expect(typen(zustand)).toEqual(['ZugBeenden'])
  })

  it('D46: neben der Farbkarte gehen so auch drei Sonderkarten, zusammen vier Karten', () => {
    let zustand = tisch(['Rot', 'Schlangenblockade', 'Schlangenblockade', 'Schlangenblockade', 'Blau'], [FREI, FREI], ['Grün'])
    zustand = spiele(zustand, karteVon(zustand, 'Rot'))
    for (let nummer = 0; nummer < 3; nummer += 1) zustand = spiele(zustand, karteVon(zustand, 'Schlangenblockade'))
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 1, gespielteSonderkarten: 3 })
    expect(typen(zustand)).toEqual(['ZugBeenden'])
  })

  it('A7.7/D27/D46: eine zweite Farbenfusion geht auch mit freier Zusatzaktion nicht; sie lässt sich nur wirkungslos ablegen', () => {
    let zustand = tisch(['Farbenfusion', 'Farbenfusion'], [FREI, FREI], ['Rot', 'Rot', 'Blau', 'Blau'])
    zustand = spiele(zustand, karteVon(zustand, 'Farbenfusion'))
    const zweite = karteVon(zustand, 'Farbenfusion')
    expect(mitWirkung(zustand, zweite)).toBe(false)
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toEqual([zweite])
    const blau = zustand.spieler[0].schlangen[0].karten.filter((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau').map((karte) => karte.id) as [string, string]
    expect(grund(zustand, { typ: 'FusionLegen', spielerId: 'spieler-1', karteId: zweite, schlangenId: zustand.spieler[0].schlangen[0].id, kartenIds: blau })).toBe(
      'Pro Zug nur eine Farbenfusion (A7.7); in diesem Zug ist schon eine gespielt.',
    )
  })

  it('A7.8/D46/D47: neben einer anderen Zugerweiterung wirkt kein Verdoppler, auch nicht als Zusatzaktion; er lässt sich nur wirkungslos ablegen', () => {
    let zustand = tisch(['Verdoppler', 'Schlangenblockade', 'Verdoppler'], [FREI, FREI], ['Grün'])
    expect(mitWirkung(zustand, karteVon(zustand, 'Verdoppler')), 'D47: als Sonderkarte des Zuges').toBe(false)
    zustand = spiele(zustand, karteVon(zustand, 'Schlangenblockade'))
    expect(mitWirkung(zustand, karteVon(zustand, 'Verdoppler')), 'D46: als Zusatzaktion').toBe(false)
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toHaveLength(2)
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karteVon(zustand, 'Verdoppler') })).toMatch(/Comeback.*D47/)
  })
})

describe('D56: gespielt ist gespielt', () => {
  it('D56: wehrt der Gegner die Farbenfusion mit Farbenschutz ab, ist die Fusion des Zuges trotzdem verbraucht; eine zweite geht auch über eine Zusatzaktion nicht', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true })
      .hand(0, ['Farbenfusion', 'Farbenfusion'])
      .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
      .schlange(0, ['Rot', 'Rot'])
      .schlange(1, ['Blau', 'Blau'])
      .aendere((zustand) => meldeZugerweiterung(zustand.zug, 'Comeback', [FREI, FREI]))
      .zustand()
    const gegnerSchlange = start.spieler[1].schlangen[0].id
    const angriff = aktionen(start, 'FusionLegen').find((aktion) => aktion.typ === 'FusionLegen' && aktion.schlangenId === gegnerSchlange)!
    const angesagt = fuehreAus(start, angriff).zustand
    const abgewehrt = fuehreAus(angesagt, aktionen(angesagt, 'Reagieren').find((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null)!).zustand
    expect(abgewehrt.spieler[1].schlangen[0].fusionen, 'die Fusion ist abgewehrt').toEqual([])
    const zweite = karteVon(abgewehrt, 'Farbenfusion')
    expect(mitWirkung(abgewehrt, zweite), 'D56: keine zweite Fusion mit Wirkung').toBe(false)
    const rot = abgewehrt.spieler[0].schlangen[0].karten.map((karte) => karte.id) as [string, string]
    expect(grund(abgewehrt, { typ: 'FusionLegen', spielerId: 'spieler-1', karteId: zweite, schlangenId: abgewehrt.spieler[0].schlangen[0].id, kartenIds: rot })).toBe(
      'Pro Zug nur eine Farbenfusion (A7.7); in diesem Zug ist schon eine gespielt.',
    )
  })
})

describe('A8.1: eine Zusatzaktion, die keine Karte spielt', () => {
  it('A8.1/D46: eine benannte Zusatzaktion (wie „zwei abwerfen, drei ziehen“) verbraucht eine Zusatzaktion; zweimal geht, ein drittes Mal nicht', () => {
    const zustand = structuredClone(tisch(['Blau'], [FREI, FREI]))
    expect(zusatzaktionGrenze(zustand.zug, 'Testaktion')).toBeNull()
    zaehleZusatzaktion(zustand.zug, 'Testaktion')
    zaehleZusatzaktion(zustand.zug, 'Testaktion')
    expect(zusatzaktionGrenze(zustand.zug, 'Testaktion')).toMatch(/D46/)
    expect(() => zaehleZusatzaktion(zustand.zug, 'Testaktion')).toThrow(/D46/)
    expect(zusatzaktionGrenze(tisch(['Blau']).zug, 'Testaktion'), 'ohne Zusatzaktion gibt es sie nicht').toMatch(/zusätzliche Aktion/)
  })

  it('A5/A8.1: sie zählt nicht als Karte des Zuges: danach muss noch eine Karte gespielt werden, die normale Farbkarte bleibt frei', () => {
    const zustand = structuredClone(tisch(['Blau'], [FREI, FREI]))
    zaehleZusatzaktion(zustand.zug, 'Testaktion')
    zaehleZusatzaktion(zustand.zug, 'Testaktion')
    expect(darfZugBeenden(zustand.zug, zustand.spieler[0])).toBe(false)
    expect(typen(zustand)).toEqual(['FarbkarteLegen'])
    const gelegt = spiele(zustand, karteVon(zustand, 'Blau'))
    expect(typen(gelegt)).toEqual(['ZugBeenden'])
  })
})

describe('A7.10/D43: Zusatzaktionen nur für bestimmte Karten', () => {
  /** Zwei Zusatzaktionen nur für die drei genannten Karten, wie nach „Ziehe 3, spiele bis zu 2 davon“. */
  function mitKorb(): Spielzustand {
    const bau = baukasten({ spielerzahl: 2, erweiterung: true })
      .hand(0, ['Schlangenblockade', 'Schlangenblockade', 'Blau', 'Rot', 'Gelb'])
      .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
      .schlange(0, ['Grün'])
    return bau
      .aendere((zustand) => {
        const [blockade1, blockade2, , rot] = zustand.spieler[0].hand
        const gezogen = [blockade1.id, blockade2.id, rot.id]
        meldeZugerweiterung(zustand.zug, 'Schlangenkorb', [
          { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: gezogen },
          { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: gezogen },
        ])
      })
      .zustand()
  }

  it('D43: jede Reihenfolge, die sich auf die Plätze des Zuges verteilen lässt, ist erlaubt: Blockade, Blockade, Blau, Rot', () => {
    let zustand = mitKorb()
    zustand = spiele(zustand, karteVon(zustand, 'Schlangenblockade'))
    zustand = spiele(zustand, karteVon(zustand, 'Schlangenblockade'))
    zustand = spiele(zustand, karteVon(zustand, 'Blau'))
    expect(mitWirkung(zustand, karteVon(zustand, 'Rot')), 'Rot ist gezogen und nimmt die zweite Zusatzaktion').toBe(true)
    zustand = spiele(zustand, karteVon(zustand, 'Rot'))
    expect(typen(zustand)).toEqual(['ZugBeenden'])
  })

  it('D43: eine Karte, die nicht gezogen ist, bekommt keine Zusatzaktion: nach Blau geht Gelb nicht mehr', () => {
    let zustand = mitKorb()
    zustand = spiele(zustand, karteVon(zustand, 'Blau'))
    expect(mitWirkung(zustand, karteVon(zustand, 'Gelb'))).toBe(false)
    expect(mitWirkung(zustand, karteVon(zustand, 'Rot'))).toBe(true)
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karteVon(zustand, 'Gelb'), ziel: { art: 'schlange', schlangenId: zustand.spieler[0].schlangen[0].id, seite: 'ende' } })).toMatch(/D46/)
  })
})

describe('A8.1/D46: Zusatzaktionen gelten im laufenden Zug und überstehen Speichern und Laden', () => {
  it('X3: nach dem Zug beginnt der Nächste ohne Zusatzaktionen und ohne gezählte Karten', () => {
    const start = tisch(['Blau'], [FREI])
    const gelegt = spiele(start, karteVon(start, 'Blau'))
    const naechster = fuehreAus(gelegt, zugBeenden(gelegt)).zustand
    expect(naechster.zug).toMatchObject({ spielerIndex: 1, zusatzaktionen: [], verwendet: [], runde: [] })
  })

  it('X3/E4 Kriterium 8: ein Zug mit Zusatzaktionen übersteht Speichern und Laden; eine kaputte Zusatzaktion lehnt das Laden mit Pfad ab', () => {
    const start = tisch(['Blau', 'Rot'], [FREI, FREI])
    const gelegt = spiele(start, karteVon(start, 'Blau'))
    expect(deserialisiere(serialisiere(gelegt))).toEqual(gelegt)
    const kaputt = JSON.parse(serialisiere(gelegt)) as { zug: { zusatzaktionen: Record<string, unknown>[] } }
    delete kaputt.zug.zusatzaktionen[0].erlaubt
    expect(() => deserialisiere(JSON.stringify(kaputt))).toThrow(/zug\.zusatzaktionen\[0\]/)
  })

  it('X3: die gezählten Karten passen zu den Zählern des Zuges; weichen sie ab, meldet die Invariante das', () => {
    const start = tisch(['Blau'], [FREI])
    const gelegt = structuredClone(spiele(start, karteVon(start, 'Blau')))
    gelegt.zug.gespielteFarbkarten = 2
    expect(() => deserialisiere(serialisiere(gelegt))).toThrow(/Zug/)
  })
})

describe('X3 Kriterium 1: die Grenzen stehen an einer Stelle, nicht in den Karten', () => {
  it('A7.7/D27: die Farbenfusion selbst nennt ihre Ziele auch nach einer Fusion; die Grenze „eine je Zug“ zieht der Rahmen', () => {
    const zustand = structuredClone(tisch(['Farbenfusion'], [FREI], ['Rot', 'Rot']))
    // Wie nach einer ersten Farbenfusion in diesem Zug; eine Zusatzaktion ist noch frei.
    zustand.zug.verwendet.push({ art: 'Sonderkarte', karteId: 'farbenfusion-erste', aktion: 'FusionLegen' })
    zustand.zug.gespielteSonderkarten = 1
    const fusion = zustand.spieler[0].hand[0]
    expect(KARTENREGISTER.Farbenfusion.ziele(zustand, 0, fusion)).toHaveLength(1)
    expect(mitWirkung(zustand, fusion.id)).toBe(false)
  })

  it('A7.8/D11: der Verdoppler selbst lehnt im zweiten Zug nichts ab; die Grenze zieht der Rahmen', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Verdoppler']).amZug(0, 2).zustand()
    const verdoppler = zustand.spieler[0].hand[0]
    expect(KARTENREGISTER.Verdoppler.ziele(zustand, 0, verdoppler)).toHaveLength(1)
    expect(KARTENREGISTER.Verdoppler.pruefe(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: verdoppler.id })).toBeNull()
    expect(mitWirkung(zustand, verdoppler.id)).toBe(false)
  })
})
