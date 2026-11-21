import { isDeepStrictEqual } from 'node:util'
import { describe, expect, it } from 'vitest'
import { AUFGABENREGISTER, definitionFuerAufgabe } from '../../aufgabenKarten'
import type { Ereignis, Spielzustand } from '../../index'
import { dauerlauf, dauerlaufPartien } from '../../testing/dauerlauf'
import type { SchrittPruefer } from '../../testing/dauerlauf'
import { setzeTestbedingungen } from '../../testing/testaufgaben'
import type { Testbedingung } from '../../testing/testaufgaben'
import { aufgabenEreignisse, aufgabenTisch, erste, legeAn, schlangeAb } from '../aufgaben_hilfen'
import { lageVon, spieleNach, verrateneGeheimeAufgaben, verrateneHandkarten } from '../nachrechnen'
import { folge, zugBeenden } from '../zugablauf_hilfen'

/*
X1: Was beim Einlösen geschieht, steht in den Ereignissen (E2, Kriterium 11):
eingelöste Aufgabe (`AufgabeErfuellt`), aufgedeckte neue (`AufgabeAufgedeckt`)
und leerer Aufgabenstapel (`AufgabenstapelLeer`). Die Oberfläche rechnet daraus
nach, ohne zwei Zustände zu vergleichen. Die geheime Aufgabe verrät kein
Ereignis (B2, D35). Dazu ein Dauerlauf mit Testbedingungen, in dem Aufgaben
wirklich eingelöst werden, auch in Ketten und bis der Stapel leer ist.
*/

function nachrechenbar(vorher: Spielzustand, ereignisse: Ereignis[], nachher: Spielzustand): void {
  expect(spieleNach(lageVon(vorher), ereignisse), 'E2 Kriterium 11: der Schritt lässt sich aus den Ereignissen nicht nachrechnen').toEqual(lageVon(nachher))
}

describe('A9/E2: Einlösen, Aufdecken und leerer Stapel lassen sich aus den Ereignissen nachrechnen', () => {
  it('A9/D5: eine Kette aus Einlösen und Aufdecken', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3), 'Gelber Schatz': schlangeAb(3), 'Lila Riese': schlangeAb(3) })
    const start = aufgabenTisch().zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(aufgabenEreignisse(ereignisse)).toHaveLength(6)
    nachrechenbar(start, ereignisse, zustand)
  })

  it('A9: der Platz bleibt leer, wenn der Stapel leer ist', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3), 'Lila Riese': schlangeAb(3) })
    const start = aufgabenTisch()
      .aendere((jetzt) => {
        jetzt.spieler[1].erfuellteAufgaben.push(...jetzt.aufgabenStapel.splice(1))
      })
      .zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(aufgabenEreignisse(ereignisse).map((ereignis) => ereignis.typ)).toContain('AufgabenstapelLeer')
    nachrechenbar(start, ereignisse, zustand)
  })

  it('A9: ohne erfüllte Aufgabe ändert sich an den Aufgaben nichts, und nachrechnen geht wie vorher', () => {
    const start = aufgabenTisch().zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(aufgabenEreignisse(ereignisse)).toEqual([])
    nachrechenbar(start, ereignisse, zustand)
  })
})

describe('B2/D35: die geheime Aufgabe verrät kein Ereignis', () => {
  it('B2/D35: kein Ereignis nennt eine geheime Aufgabe, und die Ereignisse sind gleich, ob sie erfüllt wird oder nicht', () => {
    const start = aufgabenTisch().zustand()
    const ohne = legeAn(start, 'Blau')
    setzeTestbedingungen({ Schlangentanz: schlangeAb(3) })
    const mit = legeAn(start, 'Blau')
    expect(mit.zustand.spieler[0].geheimeAufgabeErfuellt, 'Testaufbau: die geheime Aufgabe ist erfüllt').toBe(true)
    expect(mit.ereignisse).toEqual(ohne.ereignisse)
    expect(verrateneGeheimeAufgaben(mit.zustand, mit.ereignisse)).toEqual([])
  })

  it('B2/D35: auch zu Beginn des eigenen Zuges, wenn die geheime und eine offene Aufgabe zugleich erfüllt sind, nennt kein Ereignis die geheime', () => {
    setzeTestbedingungen({ Symmetriemeister: schlangeAb(3), Fusionsexperte: schlangeAb(3) })
    const start = aufgabenTisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const neueSchlange = erste(start, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange')
    const { zustand, ereignisse } = folge(start, () => neueSchlange, zugBeenden)
    expect(zustand.spieler[1].geheimeAufgabeErfuellt).toBe(true)
    expect(aufgabenEreignisse(ereignisse)).toEqual([{ typ: 'AufgabeErfuellt', spielerIndex: 1, aufgabeId: 'aufgabe-07' }, expect.objectContaining({ typ: 'AufgabeAufgedeckt' })])
    expect(verrateneGeheimeAufgaben(zustand, ereignisse)).toEqual([])
    nachrechenbar(start, ereignisse, zustand)
  })
})

/** Was der Dauerlauf mit Testbedingungen gesehen hat. */
interface Aufgabenzaehler {
  erfuellt: number
  aufgedeckt: number
  leer: number
  kette: number
  geheim: number
}

/**
 * Testbedingungen für den Dauerlauf: Aufgabe Nr. n ist erfüllt, sobald der
 * Spieler zusammen so viele Karten in seinen Schlangen hat, wie die Liste
 * nennt. Gleiche Schwellen ergeben Ketten (D5); die letzte erreicht kaum jemand.
 */
const SCHWELLEN = [3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10, 12, 14, 40]
const DAUERLAUF_BEDINGUNGEN: Record<string, Testbedingung> = Object.fromEntries(
  [...AUFGABENREGISTER.keys()].map((name, index) => [
    name,
    (zustand: Spielzustand, spielerIndex: number) => zustand.spieler[spielerIndex].schlangen.reduce((summe, schlange) => summe + schlange.karten.length, 0) >= SCHWELLEN[index],
  ]),
)

/** Prüft jeden Schritt: nachrechenbar, nichts verraten, eingelöst nur vom Spieler am Zug, und danach ist nichts mehr einzulösen. */
function aufgabenPruefer(zaehler: Aufgabenzaehler): SchrittPruefer {
  return (vorher, _aktion, { zustand, ereignisse }) => {
    const gerechnet = spieleNach(lageVon(vorher), ereignisse)
    const erwartet = lageVon(zustand)
    const abweichend = (Object.keys(erwartet) as Array<keyof typeof erwartet>).filter((feld) => !isDeepStrictEqual(gerechnet[feld], erwartet[feld]))
    if (abweichend.length > 0) return `E2 Kriterium 11: nicht nachrechenbar (${abweichend.map((feld) => `${feld}: ${JSON.stringify(gerechnet[feld])} statt ${JSON.stringify(erwartet[feld])}`).join('; ')}).`
    const verraten = [...verrateneGeheimeAufgaben(zustand, ereignisse), ...verrateneHandkarten(zustand, ereignisse)]
    if (verraten.length > 0) return `B2: Ereignisse nennen ${verraten.join(', ')}.`
    const amZug = zustand.zug.spielerIndex
    for (const [stelle, ereignis] of ereignisse.entries()) {
      if (ereignis.typ === 'AufgabeErfuellt') {
        zaehler.erfuellt += 1
        if (ereignis.spielerIndex !== amZug || zustand.schwebend !== null) return `A9: Spieler ${ereignis.spielerIndex} löst ein, am Zug ist ${amZug}.`
      }
      if (ereignis.typ === 'AufgabeAufgedeckt') {
        zaehler.aufgedeckt += 1
        const folgt = ereignisse[stelle + 1]
        if (folgt?.typ === 'AufgabeErfuellt' && folgt.aufgabeId === ereignis.aufgabeId) zaehler.kette += 1
      }
      if (ereignis.typ === 'AufgabenstapelLeer') zaehler.leer += 1
    }
    for (const [index, spieler] of zustand.spieler.entries()) {
      const bisher = vorher.spieler[index].geheimeAufgabeErfuellt
      if (bisher && !spieler.geheimeAufgabeErfuellt) return `D35: Die erfüllte geheime Aufgabe von Spieler ${index} zählt nicht mehr.`
      if (!bisher && spieler.geheimeAufgabeErfuellt) {
        zaehler.geheim += 1
        if (index !== amZug) return `D35: Die geheime Aufgabe von Spieler ${index} zählt, am Zug ist ${amZug}.`
      }
    }
    if (zustand.schwebend !== null || zustand.partiephase === 'Beendet') return null
    const offen = zustand.offeneAufgaben.find((aufgabe) => definitionFuerAufgabe(aufgabe).istErfuellt(zustand, amZug))
    if (offen !== undefined) return `A9/D5: ${offen.name} ist für den Spieler am Zug erfüllt, liegt aber noch offen.`
    const { geheimeAufgabe, geheimeAufgabeErfuellt } = zustand.spieler[amZug]
    if (geheimeAufgabe !== null && !geheimeAufgabeErfuellt && definitionFuerAufgabe(geheimeAufgabe).istErfuellt(zustand, amZug)) {
      return `D35: Die geheime Aufgabe von Spieler ${amZug} ist erfüllt, aber nicht vermerkt.`
    }
    return null
  }
}

describe('A9/D5/D35: Dauerlauf mit Testbedingungen', () => {
  it('A9/D5/D35: 30 Zufallspartien mit Erweiterung enden alle; eingelöst wird nur vom Spieler am Zug, in Ketten und bis der Stapel leer ist', () => {
    setzeTestbedingungen(DAUERLAUF_BEDINGUNGEN)
    const zaehler: Aufgabenzaehler = { erfuellt: 0, aufgedeckt: 0, leer: 0, kette: 0, geheim: 0 }
    const ergebnisse = dauerlauf(dauerlaufPartien(30, true, 4001), { neuerPruefer: () => aufgabenPruefer(zaehler) })
    expect(ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet').map((ergebnis) => ergebnis.detail).slice(0, 3), 'Partien, die nicht regulär endeten').toEqual([])
    expect(zaehler.erfuellt, 'A9: eingelöste Aufgaben').toBeGreaterThan(100)
    expect(zaehler.kette, 'D5: sofort eingelöste aufgedeckte Aufgaben').toBeGreaterThan(10)
    expect(zaehler.leer, 'A9: Plätze, die leer blieben').toBeGreaterThan(10)
    expect(zaehler.geheim, 'D35: erfüllte geheime Aufgaben').toBeGreaterThan(10)
  }, 300_000)
})
