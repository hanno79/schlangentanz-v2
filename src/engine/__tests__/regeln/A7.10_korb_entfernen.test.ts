import { describe, expect, it } from 'vitest'
import { ermittleEntscheider, pruefeAktion } from '../../index'
import type { SchlangenkorbSpielenAktion, Spielzustand } from '../../index'
import { ablage, aktionen, durchlassen, ereignisseVom, reaktion } from '../zugablauf_hilfen'
import { angeboteneBoni, aufEinemAblagestapel, KORB, korb, korbAktionen, korbId, korbtisch, schlangenIds, spiele } from '../korb_hilfen'

/*
X6, Kriterium 3, Bonus 3 des Schlangenkorbs (A7.10): „Entferne eine
Schlangenblockade aus deiner Schlange ODER entferne eine Sonderkarte aus einer
gegnerischen Schlange.“ Nach D45 darf beim Gegner jede Sonderkarte weg, auch
eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion, deren
Karten dann wieder einzeln liegen. Der Gegner wird gefragt und darf mit
Farbenschutz abwehren (D10, D33). Die entfernte Karte kommt auf den
Ablagestapel dessen, der den Korb nutzt, wie gefressene Karten; der Korb
selbst kommt aus dem Spiel (D54), auch wenn der Gegner abwehrt.
*/

function entfernen(zustand: Spielzustand, karteId: string): SchlangenkorbSpielenAktion {
  return korb(zustand, 'entfernen', (aktion) => aktion.bonus.art === 'entfernen' && aktion.bonus.ziel.karteId === karteId)
}

function zielIds(zustand: Spielzustand): string[] {
  return korbAktionen(zustand, 'entfernen').map((aktion) => (aktion.bonus.art === 'entfernen' ? aktion.bonus.ziel.karteId : ''))
}

describe('A7.10/D45: eine Schlangenblockade aus der eigenen Schlange', () => {
  it('A7.10: die eigene Blockade kommt weg, auf den eigenen Ablagestapel; niemand wird gefragt', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Schlangenblockade', 'Rot']).zustand()
    const [rot, blockade, rot2] = schlangenIds(start, 0)
    const { zustand, ereignisse } = spiele(start, entfernen(start, blockade))
    expect(schlangenIds(zustand, 0)).toEqual([rot, rot2])
    expect(ablage(zustand, 0)).toEqual([blockade])
    expect(ereignisseVom(ereignisse, 'KarteAngesagt')).toEqual([])
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual([korbId(start)])
  })

  it('A7.10: in der eigenen Schlange nur eine Blockade, keine andere Sonderkarte und keine Farbkarte', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Regenbogenschlange', { fusion: ['Gelb', 'Gelb'] }]).zustand()
    const [rot, regenbogen, fusion] = schlangenIds(start, 0)
    expect(zielIds(start)).toEqual([])
    for (const karteId of [rot, regenbogen, fusion]) {
      const aktion: SchlangenkorbSpielenAktion = { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'entfernen', ziel: { schlangenId: start.spieler[0].schlangen[0].id, karteId } } }
      expect(pruefeAktion(start, aktion), `ziel ${karteId}`).toEqual({ erlaubt: false, grund: expect.stringMatching(/eigenen Schlange.*Schlangenblockade.*A7\.10/) })
    }
  })
})

describe('D45: eine Sonderkarte aus einer gegnerischen Schlange', () => {
  /** Beim Gegner: Rot, Blockade, Regenbogenschlange, Fusion aus Gelb und Gelb; er hält einen Farbenschutz, wenn `schutz`. */
  function gegnertisch(schutz: boolean): Spielzustand {
    return korbtisch([KORB, 'Blau'], schutz ? ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'] : undefined)
      .schlange(1, ['Rot', 'Schlangenblockade', 'Regenbogenschlange', { fusion: ['Gelb', 'Gelb'] }])
      .zustand()
  }

  it('D45: jede Sonderkarte beim Gegner ist ein Ziel, auch Blockade, Regenbogenschlange und Farbenfusion; eine Farbkarte nicht', () => {
    const start = gegnertisch(false)
    const [rot, blockade, regenbogen, fusion] = schlangenIds(start, 1)
    expect(zielIds(start)).toEqual([blockade, regenbogen, fusion])
    const aktion: SchlangenkorbSpielenAktion = { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'entfernen', ziel: { schlangenId: start.spieler[1].schlangen[0].id, karteId: rot } } }
    expect(pruefeAktion(start, aktion)).toEqual({ erlaubt: false, grund: expect.stringMatching(/Sonderkarte.*D45/) })
  })

  it('D45/D33: der Gegner wird gefragt, auch ohne Farbenschutz; bis er entschieden hat, liegt die Karte noch', () => {
    const start = gegnertisch(false)
    const [, blockade] = schlangenIds(start, 1)
    const { zustand, ereignisse } = spiele(start, entfernen(start, blockade))
    expect(ereignisseVom(ereignisse, 'KarteAngesagt').map((ereignis) => ereignis.betroffene)).toEqual([[1]])
    expect(ermittleEntscheider(zustand)).toBe(1)
    expect(aktionen(zustand), 'D33: ohne Farbenschutz nur durchlassen').toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    expect(schlangenIds(zustand, 1)).toContain(blockade)
  })

  it('D45: lässt der Gegner durch, kommt die Karte auf den Ablagestapel dessen, der den Korb nutzt; der Korb aus dem Spiel', () => {
    const start = gegnertisch(false)
    const [rot, blockade, regenbogen, fusion] = schlangenIds(start, 1)
    const angesagt = spiele(start, entfernen(start, regenbogen)).zustand
    const { zustand, ereignisse } = spiele(angesagt, durchlassen(angesagt))
    expect(schlangenIds(zustand, 1)).toEqual([rot, blockade, fusion])
    expect(ablage(zustand, 0)).toEqual([regenbogen])
    expect(ablage(zustand, 1)).toEqual([])
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual([korbId(start)])
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')[0]).toMatchObject({ ohneWirkung: false, nach: { ort: 'AusDemSpiel' } })
  })

  it('D45/A7.7: eine entfernte Farbenfusion lässt ihre beiden Karten einzeln an ihrem Platz zurück', () => {
    const start = gegnertisch(false)
    const [rot, blockade, regenbogen, fusion] = schlangenIds(start, 1)
    const unter = start.spieler[1].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    const angesagt = spiele(start, entfernen(start, fusion)).zustand
    const { zustand } = spiele(angesagt, durchlassen(angesagt))
    expect(schlangenIds(zustand, 1)).toEqual([rot, blockade, regenbogen, ...unter])
    expect(zustand.spieler[1].schlangen[0].fusionen).toEqual([])
    expect(ablage(zustand, 0)).toEqual([fusion])
  })

  it('D45/D10/A7.2: wehrt der Gegner mit Farbenschutz ab, bleibt die Karte liegen; der Korb kommt trotzdem aus dem Spiel, nicht auf einen Ablagestapel (D54)', () => {
    const start = gegnertisch(true)
    const [, blockade] = schlangenIds(start, 1)
    const schutz = start.spieler[1].hand[0].id
    const angesagt = spiele(start, entfernen(start, blockade)).zustand
    const { zustand, ereignisse } = spiele(angesagt, reaktion(angesagt, true))
    expect(schlangenIds(zustand, 1)).toContain(blockade)
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(ablage(zustand, 0)).toEqual([])
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual([korbId(start)])
    expect(aufEinemAblagestapel(zustand, korbId(start))).toBe(false)
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')[0]).toMatchObject({ ohneWirkung: true, nach: { ort: 'AusDemSpiel' } })
    expect(zustand.spieler[0].ausgespielteSonderkarten, 'D36: auch abgewehrt ausgespielt').toEqual(['Schlangenkorb des Glücks'])
  })

  it('D45: ist die entfernte Karte die letzte der Schlange, gibt es die Schlange danach nicht mehr', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(1, ['Regenbogenschlange']).zustand()
    const [regenbogen] = schlangenIds(start, 1)
    const angesagt = spiele(start, entfernen(start, regenbogen)).zustand
    const { zustand, ereignisse } = spiele(angesagt, durchlassen(angesagt))
    expect(zustand.spieler[1].schlangen).toEqual([])
    expect(ereignisseVom(ereignisse, 'KartenVersetzt')[0].aufgeloest).toEqual([start.spieler[1].schlangen[0].id])
  })

  it('A7.10: ohne Blockade bei sich und ohne Sonderkarte beim Gegner gibt es den Bonus nicht', () => {
    expect(angeboteneBoni(korbtisch([KORB, 'Blau']).schlange(0, ['Regenbogenschlange']).schlange(1, ['Rot']).zustand())).not.toContain('entfernen')
  })

  it('D45: bei drei Spielern wird nur der Besitzer der Schlange gefragt', () => {
    const start = korbtisch([KORB, 'Blau'], undefined, 3).schlange(2, ['Rot', 'Schlangenblockade']).zustand()
    const [, blockade] = schlangenIds(start, 2)
    const { ereignisse } = spiele(start, entfernen(start, blockade))
    expect(ereignisseVom(ereignisse, 'KarteAngesagt')[0].betroffene).toEqual([2])
  })
})
