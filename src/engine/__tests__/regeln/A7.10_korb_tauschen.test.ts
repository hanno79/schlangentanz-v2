import { describe, expect, it } from 'vitest'
import { pruefeAktion } from '../../index'
import type { SchlangenkorbSpielenAktion, Spielzustand } from '../../index'
import { ereignisseVom, hand } from '../zugablauf_hilfen'
import { angeboteneBoni, handIds, KORB, korbAktionen, korbId, korbtisch, schlangenIds, spiele, spieleKorb } from '../korb_hilfen'

/*
X6, Kriterium 3, Bonus 2 des Schlangenkorbs (A7.10): „Tausche bis zu 2 Karten
aus deiner Schlange mit Karten aus deiner Hand.“ Nach D44 werden nur
Farbkarten gegen Farbkarten getauscht. Die Handkarte kommt an den Platz der
getauschten Karte, die getauschte Karte auf die Hand; die Handgrösse bleibt
gleich. Getauscht wird in den eigenen Schlangen; das trifft keinen Mitspieler,
also gibt es keine Abwehr.
*/

/** Spieler 1 hält Korb, Gelb und Grün und hat die Schlange Blau, Rot, Blau. */
function tisch(): Spielzustand {
  return korbtisch([KORB, 'Gelb', 'Grün']).schlange(0, ['Blau', 'Rot', 'Blau']).schlange(1, ['Violett', 'Violett']).zustand()
}

function tausch(zustand: Spielzustand, ...paare: Array<[string, string]>): SchlangenkorbSpielenAktion {
  const [schlange] = zustand.spieler[0].schlangen
  return {
    typ: 'SchlangenkorbSpielen',
    spielerId: 'spieler-1',
    karteId: korbId(zustand),
    bonus: { art: 'tauschen', tausch: paare.map(([karteId, handkarteId]) => ({ schlangenId: schlange.id, karteId, handkarteId })) },
  }
}

describe('A7.10/D44: Tausche bis zu 2 Karten', () => {
  it('D44: eine Farbkarte der Schlange gegen eine Farbkarte der Hand; die Handkarte liegt am selben Platz, die getauschte auf der Hand', () => {
    const start = tisch()
    const [blau, rot] = schlangenIds(start, 0)
    const [gelb] = handIds(start, 0, 'Gelb')
    const { zustand, ereignisse } = spiele(start, tausch(start, [rot, gelb]))
    expect(schlangenIds(zustand, 0)).toEqual([blau, gelb, schlangenIds(start, 0)[2]])
    expect(hand(zustand, 0)).toEqual(expect.arrayContaining([rot]))
    expect(hand(zustand, 0), 'D44: die Handgrösse bleibt, ohne den Korb').toHaveLength(start.spieler[0].hand.length - 1)
    expect(ereignisseVom(ereignisse, 'KarteAngesagt'), 'in der eigenen Schlange keine Abwehr').toEqual([])
  })

  it('D44: bis zu 2: zwei Karten in einem Zug, jede an ihrem Platz', () => {
    const start = tisch()
    const [blau, rot, blau2] = schlangenIds(start, 0)
    const [gelb] = handIds(start, 0, 'Gelb')
    const [gruen] = handIds(start, 0, 'Grün')
    const { zustand } = spiele(start, tausch(start, [blau, gruen], [blau2, gelb]))
    expect(schlangenIds(zustand, 0)).toEqual([gruen, rot, gelb])
    expect(hand(zustand, 0).sort()).toEqual([blau, blau2].sort())
  })

  it('D44: die Engine bietet jeden einzelnen Tausch und jedes Paar an, jedes einmal', () => {
    const tausche = korbAktionen(tisch(), 'tauschen')
    // 3 Schlangenkarten × 2 Handkarten einzeln; 3 Paare von Schlangenkarten × 2 Zuordnungen der Handkarten.
    expect(tausche).toHaveLength(3 * 2 + 3 * 2)
    expect(new Set(tausche.map((aktion) => JSON.stringify(aktion))).size).toBe(tausche.length)
  })

  it('D44: nur Farbkarte gegen Farbkarte: keine Sonderkarte der Schlange und keine der Hand', () => {
    const start = korbtisch([KORB, 'Gelb', 'Schlangenblockade']).schlange(0, ['Blau', 'Regenbogenschlange']).zustand()
    const [blau, regenbogen] = schlangenIds(start, 0)
    const [gelb] = handIds(start, 0, 'Gelb')
    const [blockade] = handIds(start, 0, 'Schlangenblockade')
    expect(korbAktionen(start, 'tauschen').map((aktion) => aktion.bonus)).toEqual([{ art: 'tauschen', tausch: [{ schlangenId: start.spieler[0].schlangen[0].id, karteId: blau, handkarteId: gelb }] }])
    expect(pruefeAktion(start, tausch(start, [regenbogen, gelb]))).toEqual({ erlaubt: false, grund: expect.stringMatching(/Farbkarten.*D44/) })
    expect(pruefeAktion(start, tausch(start, [blau, blockade]))).toEqual({ erlaubt: false, grund: expect.stringMatching(/Farbkarten.*D44/) })
  })

  it('D44: nur in einer eigenen Schlange, nicht in der eines Mitspielers', () => {
    const start = tisch()
    const fremd = start.spieler[1].schlangen[0]
    const aktion: SchlangenkorbSpielenAktion = {
      typ: 'SchlangenkorbSpielen',
      spielerId: 'spieler-1',
      karteId: korbId(start),
      bonus: { art: 'tauschen', tausch: [{ schlangenId: fremd.id, karteId: fremd.karten[0].id, handkarteId: handIds(start, 0, 'Gelb')[0] }] },
    }
    expect(korbAktionen(start, 'tauschen').every((eintrag) => eintrag.bonus.art === 'tauschen' && eintrag.bonus.tausch.every((paar) => paar.schlangenId !== fremd.id))).toBe(true)
    expect(pruefeAktion(start, aktion)).toEqual({ erlaubt: false, grund: expect.stringMatching(/eigenen Schlange.*D44/) })
  })

  it('D44: eine Karte unter einer Farbenfusion liegt nicht offen in der Schlange und lässt sich nicht tauschen', () => {
    const start = korbtisch([KORB, 'Gelb']).schlange(0, [{ fusion: ['Rot', 'Rot'] }, 'Blau']).zustand()
    const [fusion, blau] = schlangenIds(start, 0)
    const unter = start.spieler[0].schlangen[0].fusionen[0].unter[0].id
    expect(korbAktionen(start, 'tauschen').flatMap((aktion) => (aktion.bonus.art === 'tauschen' ? aktion.bonus.tausch.map((paar) => paar.karteId) : []))).toEqual([blau])
    expect(pruefeAktion(start, tausch(start, [unter, handIds(start, 0, 'Gelb')[0]])).erlaubt).toBe(false)
    expect(pruefeAktion(start, tausch(start, [fusion, handIds(start, 0, 'Gelb')[0]])).erlaubt).toBe(false)
  })

  it('D44: dieselbe Karte zweimal geht nicht, weder aus der Schlange noch aus der Hand', () => {
    const start = tisch()
    const [blau, rot] = schlangenIds(start, 0)
    const [gelb] = handIds(start, 0, 'Gelb')
    const [gruen] = handIds(start, 0, 'Grün')
    expect(pruefeAktion(start, tausch(start, [blau, gelb], [blau, gruen]))).toEqual({ erlaubt: false, grund: expect.stringMatching(/höchstens einmal/) })
    expect(pruefeAktion(start, tausch(start, [blau, gelb], [rot, gelb]))).toEqual({ erlaubt: false, grund: expect.stringMatching(/höchstens einmal/) })
  })

  it('D44: ohne Farbkarte auf der Hand oder ohne eigene Schlange gibt es den Tausch nicht', () => {
    expect(angeboteneBoni(korbtisch([KORB, 'Schlangenblockade']).schlange(0, ['Blau']).zustand())).not.toContain('tauschen')
    expect(angeboteneBoni(korbtisch([KORB, 'Blau']).schlange(1, ['Rot']).zustand())).not.toContain('tauschen')
  })

  it('D44: der Tausch erweitert den Zug nicht; im zweiten Zug nach einem Verdoppler geht er (D47)', () => {
    const start = korbtisch([KORB, 'Gelb']).schlange(0, ['Blau']).amZug(0, 2).zustand()
    expect(angeboteneBoni(start)).toEqual(['tauschen'])
    const { zustand } = spieleKorb(start, 'tauschen')
    expect(zustand.zug.runde).toEqual(['Verdoppler'])
    expect(zustand.zug.zusatzaktionen).toEqual([])
  })

  it('B2: das Ereignis nennt die Karte nicht, die jetzt auf der Hand liegt; die gelegte Handkarte liegt offen', () => {
    const start = tisch()
    const [, rot] = schlangenIds(start, 0)
    const [gelb] = handIds(start, 0, 'Gelb')
    const { ereignisse } = spiele(start, tausch(start, [rot, gelb]))
    const [versetzt] = ereignisseVom(ereignisse, 'KartenVersetzt')
    expect(versetzt.karten).toEqual([
      { karteId: gelb, von: { ort: 'Hand', spielerIndex: 0 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: start.spieler[0].schlangen[0].id, position: 1 } },
      { karteId: null, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: start.spieler[0].schlangen[0].id, position: 1 }, nach: { ort: 'Hand', spielerIndex: 0 } },
    ])
  })
})
