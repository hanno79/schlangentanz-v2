import { describe, expect, it } from 'vitest'
import { ermittleEntscheider } from '../index'
import type { Ereignis, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { ablage, aktionen, ereignisseVom, fuehreAus, grund, spieleZug, typen, zugBeenden } from './zugablauf_hilfen'

/*
E2, Spielende und Aussetzen: A10 (Schlussrunde), A7.6 (der ausgesetzte Zug),
D14 (zwei Gruben, zwei Züge), D18 (kein Auffüllen beim Aussetzen) und D21
(in der Schlussrunde verfällt der letzte Zug).

Die Schlangengruben liegen hier schon vor dem Spieler (Baukasten); wie sie
gespielt und abgewehrt werden, bringt E4.
*/

const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']

function tisch(spielerzahl: number, haende: Kartenwahl[][] = []): Baukasten {
  const bau = baukasten({ spielerzahl, erweiterung: false })
  for (let index = 0; index < spielerzahl; index += 1) bau.hand(index, haende[index] ?? FUENF)
  return bau
}

/** Spielt Züge mit `spieleZug`, bis die Partie beendet ist; liefert alle Ereignisse. */
function spieleBisZumEnde(zustand: Spielzustand): { zustand: Spielzustand; ereignisse: Ereignis[] } {
  const ereignisse: Ereignis[] = []
  let jetzt = zustand
  for (let zug = 0; jetzt.partiephase !== 'Beendet'; zug += 1) {
    if (zug > 20) throw new Error('Testaufbau: Die Partie endet nicht.')
    const schritt = spieleZug(jetzt)
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}

describe('A10: Spielende und Schlussrunde', () => {
  it('A10: wer die letzte Karte zu Beginn seines Zuges zieht, beginnt die Schlussrunde und spielt seinen Zug normal zu Ende', () => {
    let zustand = tisch(2, [FUENF, ['Rot', 'Farbenschutz']]).stapelOben(['Grün', 'Violett', 'Braun']).stapelBehalten(3).zustand()
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    const wechsel = fuehreAus(zustand, zugBeenden(zustand))
    expect(wechsel.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 2 },
      { typ: 'SchlussrundeBegonnen', ausloeser: 1 },
    ])
    zustand = wechsel.zustand
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 1, nachziehstapel: [] })
    expect(zustand.spieler[1].hand).toHaveLength(4)
    // Sein Zug läuft normal: eine Farbkarte und eine Sonderkarte.
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    zustand = fuehreAus(zustand, aktionen(zustand, 'SonderkarteWirkungslosAblegen')[0]).zustand
    expect(zustand.zug).toMatchObject({ spielerIndex: 1, gespielteFarbkarten: 1, gespielteSonderkarten: 1 })
    const ende = fuehreAus(zustand, zugBeenden(zustand))
    expect(ende.ereignisse).toEqual([{ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 1 }])
    expect(ende.zustand.spieler[1].hand).toHaveLength(2)
  })

  it('A10: wer die letzte Karte am Zugende zieht, beendet seinen Zug; danach je ein letzter Zug ohne Nachziehen', () => {
    let zustand = tisch(3, [FUENF, ['Blau', 'Rot', 'Gelb', 'Grün'], FUENF]).stapelBehalten(1).zustand()
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    const wechsel = fuehreAus(zustand, zugBeenden(zustand))
    expect(wechsel.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'SchlussrundeBegonnen', ausloeser: 0 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
    ])
    zustand = wechsel.zustand
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 4, 5])
    const { zustand: ende, ereignisse } = spieleBisZumEnde(zustand)
    expect(ereignisseVom(ereignisse, 'KartenGezogen')).toEqual([])
    expect(ereignisseVom(ereignisse, 'ZugBegonnen').map((ereignis) => ereignis.spielerIndex)).toEqual([2])
    expect(ereignisse[ereignisse.length - 1]).toEqual({ typ: 'PartieBeendet' })
    expect(ende.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 3, 4])
  })

  it.each([
    [2, 0],
    [3, 0],
    [4, 0],
    [2, 1],
    [3, 2],
    [4, 2],
  ])('A10: mit %i Spielern und Auslöser %i hat jeder andere genau einen letzten Zug; der Auslöser kommt nicht mehr dran', (spielerzahl, ausloeser) => {
    let zustand = tisch(spielerzahl).amZug(ausloeser).stapelBehalten(1).zustand()
    zustand = spieleZug(zustand).zustand
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: ausloeser })
    const erster = zustand.zug.spielerIndex
    const { zustand: ende, ereignisse } = spieleBisZumEnde(zustand)
    const letzteZuege = [erster, ...ereignisseVom(ereignisse, 'ZugBegonnen').map((ereignis) => ereignis.spielerIndex)]
    const erwartet = Array.from({ length: spielerzahl - 1 }, (_, schritt) => (ausloeser + 1 + schritt) % spielerzahl)
    expect(letzteZuege).toEqual(erwartet)
    expect(ende.partiephase).toBe('Beendet')
    expect(ermittleEntscheider(ende)).toBeNull()
    expect(aktionen(ende)).toEqual([])
    expect(grund(ende, { typ: 'ZugBeenden', spielerId: ende.spieler[ausloeser].id })).toMatch(/Partie ist beendet/)
  })

  it('A10: in der Schlussrunde darf ein Spieler mit leerer Hand seinen Zug beenden', () => {
    const zustand = tisch(3, [FUENF, [], FUENF]).schlussrunde(0).amZug(1).zustand()
    expect(aktionen(zustand)).toEqual([zugBeenden(zustand)])
    expect(fuehreAus(zustand, zugBeenden(zustand)).zustand.zug.spielerIndex).toBe(2)
  })

  it('A10/A5: auch in der Schlussrunde legt ab, wer am Zugende mehr als 5 Karten hält', () => {
    const sieben: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Blau']
    let zustand = tisch(2, [FUENF, sieben]).schlussrunde(0).amZug(1).zustand()
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    zustand = fuehreAus(zustand, zugBeenden(zustand)).zustand
    expect(zustand.zug.abschnitt).toBe('Abwerfen')
    expect(typen(zustand)).toEqual(['UeberhandAbwerfen'])
    expect(aktionen(zustand)).toHaveLength(6)
    const { zustand: ende, ereignisse } = fuehreAus(zustand, aktionen(zustand)[0])
    expect(ende.spieler[1].hand).toHaveLength(5)
    expect(ereignisse[ereignisse.length - 1]).toEqual({ typ: 'PartieBeendet' })
  })
})

describe('A7.6/D18: aussetzen', () => {
  function mitGrube(): Spielzustand {
    return tisch(3, [FUENF, ['Blau', 'Rot', 'Gelb'], FUENF]).grube(0, 1).zustand()
  }

  it('A7.6: wer eine Schlangengrube vor sich hat, setzt seinen nächsten Zug komplett aus', () => {
    const { zustand, ereignisse } = spieleZug(mitGrube())
    expect(ereignisse.slice(-3)).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'Ausgesetzt', spielerIndex: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 },
    ])
    expect(zustand.zug.spielerIndex).toBe(2)
    expect(ermittleEntscheider(zustand)).toBe(2)
  })

  it('A7.6/D18: während des Aussetzens zieht er keine Karte und spielt keine aus', () => {
    const vorher = mitGrube()
    const { zustand, ereignisse } = spieleZug(vorher)
    expect(zustand.spieler[1].hand).toEqual(vorher.spieler[1].hand)
    expect(zustand.spieler[1].schlangen).toEqual([])
    expect(ereignisse.filter((ereignis) => 'spielerIndex' in ereignis && ereignis.spielerIndex === 1)).toEqual([
      { typ: 'Ausgesetzt', spielerIndex: 1 },
    ])
  })

  it('A7.6/A6: nach dem ausgesetzten Zug liegt die Schlangengrube auf dem Ablagestapel dessen, der sie gespielt hat', () => {
    const vorher = mitGrube()
    const grube = vorher.ausliegendeGruben[0].karte.id
    const { zustand } = spieleZug(vorher)
    expect(zustand.ausliegendeGruben).toEqual([])
    expect(ablage(zustand, 0)).toEqual([grube])
    expect(ablage(zustand, 1)).toEqual([])
  })

  it('D18: in seinem nächsten gespielten Zug füllt er wieder auf 5 auf und spielt normal', () => {
    let zustand = spieleZug(mitGrube()).zustand
    zustand = spieleZug(zustand).zustand
    const { zustand: nach, ereignisse } = spieleZug(zustand)
    expect(nach.zug.spielerIndex).toBe(1)
    expect(nach.spieler[1].hand).toHaveLength(5)
    expect(ereignisse.slice(-2)).toEqual([
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 2 },
    ])
    expect(typen(nach)).toContain('FarbkarteLegen')
  })

  it('D14: zwei Schlangengruben kosten zwei Züge, jede geht danach an ihren Spieler', () => {
    let zustand = tisch(3).grube(0, 1).grube(2, 1).zustand()
    const [vonA, vonC] = zustand.ausliegendeGruben.map((grube) => grube.karte.id)
    const ausgesetzt: number[] = []
    const gespielt: number[] = []
    for (let zug = 0; zug < 5; zug += 1) {
      gespielt.push(zustand.zug.spielerIndex)
      const schritt = spieleZug(zustand)
      ausgesetzt.push(...ereignisseVom(schritt.ereignisse, 'Ausgesetzt').map((ereignis) => ereignis.spielerIndex))
      zustand = schritt.zustand
    }
    expect(gespielt).toEqual([0, 2, 0, 2, 0])
    expect(ausgesetzt).toEqual([1, 1])
    expect(zustand.zug.spielerIndex).toBe(1)
    expect(ablage(zustand, 0)).toContain(vonA)
    expect(ablage(zustand, 2)).toContain(vonC)
  })

  it('A7.6: setzen alle anderen aus, ist der Spieler am Zug gleich wieder dran', () => {
    const vorher = tisch(3).grube(0, 1).grube(0, 2).zustand()
    const { zustand, ereignisse } = spieleZug(vorher)
    expect(ereignisse.slice(-4)).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'Ausgesetzt', spielerIndex: 1 },
      { typ: 'Ausgesetzt', spielerIndex: 2 },
      { typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 1 },
    ])
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0 })
  })

  it('A7.6: zu zweit ist nach dem Aussetzen des Gegners wieder der Spieler dran, der die Grube gespielt hat', () => {
    const { zustand, ereignisse } = spieleZug(tisch(2).grube(0, 1).zustand())
    expect(ereignisseVom(ereignisse, 'Ausgesetzt')).toEqual([{ typ: 'Ausgesetzt', spielerIndex: 1 }])
    expect(zustand.zug.spielerIndex).toBe(0)
  })
})

describe('D21: aussetzen in der Schlussrunde', () => {
  it('D21: wer in der Schlussrunde aussetzen muss, verliert seinen letzten Zug', () => {
    const vorher = tisch(3).grube(2, 1).stapelBehalten(1).zustand()
    const grube = vorher.ausliegendeGruben[0].karte.id
    const wechsel = spieleZug(vorher)
    expect(wechsel.ereignisse.slice(-4)).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'SchlussrundeBegonnen', ausloeser: 0 },
      { typ: 'Ausgesetzt', spielerIndex: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 },
    ])
    expect(ablage(wechsel.zustand, 2)).toContain(grube)
    const { zustand: ende, ereignisse } = spieleZug(wechsel.zustand)
    expect(ereignisse[ereignisse.length - 1]).toEqual({ typ: 'PartieBeendet' })
    expect(ende.partiephase).toBe('Beendet')
  })

  it('D21: setzen in der Schlussrunde alle anderen aus, endet die Partie gleich nach dem Zug des Auslösers', () => {
    const { zustand, ereignisse } = spieleZug(tisch(3).grube(0, 1).grube(0, 2).stapelBehalten(1).zustand())
    expect(ereignisse.slice(-5)).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'SchlussrundeBegonnen', ausloeser: 0 },
      { typ: 'Ausgesetzt', spielerIndex: 1 },
      { typ: 'Ausgesetzt', spielerIndex: 2 },
      { typ: 'PartieBeendet' },
    ])
    expect(zustand).toMatchObject({ partiephase: 'Beendet', ausliegendeGruben: [] })
  })
})
