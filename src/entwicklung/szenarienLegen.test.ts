import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, werteSchlangen } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { findeSzenario, SZENARIEN } from './szenarien'

/*
E5: Die Szenarien `farbkarte-beim-gegner`, `regenbogen` und `blockade-abwehr`
lassen sich am Entwicklertisch so durchklicken, wie ihre Erwartung es sagt.
Jeder Schritt hier ist ein Knopf, den die Engine aufzählt.
*/

function erzeuge(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

type Wahl = (aktion: SpielAktion) => boolean

const anEnde = (schlangenId: string): Wahl => (aktion) =>
  aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === schlangenId && aktion.ziel.seite === 'ende'
const einfuegen = (typ: 'RegenbogenschlangeLegen' | 'BlockadeLegen', schlangenId: string, position: number): Wahl => (aktion) =>
  aktion.typ === typ && aktion.schlangenId === schlangenId && aktion.position === position
const abwehren: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null
const durchlassen: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'

/** Klickt nacheinander die erste aufgezählte Aktion, die zur Wahl passt, und sammelt die Ereignisse. */
function klicke(zustand: Spielzustand, ...wahlen: Wahl[]): { zustand: Spielzustand; ereignisse: Ereignis[] } {
  let jetzt = zustand
  const ereignisse: Ereignis[] = []
  for (const wahl of wahlen) {
    const aktion = ermittleAktionen(jetzt).find(wahl)
    if (aktion === undefined) throw new Error(`Testaufbau: kein passender Knopf unter ${JSON.stringify(ermittleAktionen(jetzt))}`)
    const schritt = anwendeAktion(jetzt, aktion)
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}

const ereignistypen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const aktionstypen = (zustand: Spielzustand) => [...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))]
const namen = (zustand: Spielzustand, spieler: number, schlange = 0) =>
  zustand.spieler[spieler].schlangen[schlange].karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name))
const punkte = (zustand: Spielzustand, spieler: number) => werteSchlangen(zustand.spieler[spieler].schlangen, false).gruppenPunkte

describe('E5: Szenarien zum Legen', () => {
  it('E5: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['farbkarte-beim-gegner', 'regenbogen', 'blockade-abwehr']))
  })

  it('D9/D10/D19: farbkarte-beim-gegner: keine dritte eigene Schlange, Rot an Rot-Rot von KI-Gegner 1 ohne Rückfrage, Rot×3 zählt für ihn', () => {
    const start = erzeuge('farbkarte-beim-gegner')
    const farbkarten = ermittleAktionen(start).filter((aktion) => aktion.typ === 'FarbkarteLegen')
    expect(farbkarten, 'A5: fünf Farbkarten an je sechs Enden').toHaveLength(30)
    expect(farbkarten.some((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange'), 'A5: keine dritte eigene Schlange').toBe(false)
    const rot = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!
    const gelegt = klicke(start, (aktion) => anEnde('schlange-3')(aktion) && 'karteId' in aktion && aktion.karteId === rot.id)
    expect(gelegt.ereignisse).toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: rot.id, aktion: 'FarbkarteLegen', nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-3', position: 2 } },
    ])
    expect(ermittleEntscheider(gelegt.zustand), 'D10: niemand wird gefragt').toBe(0)
    expect(gelegt.zustand.spieler[1].hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz')).toBe(true)
    expect(namen(gelegt.zustand, 1)).toEqual(['Rot', 'Rot', 'Rot'])
    expect(punkte(gelegt.zustand, 1)).toBe(3)
  })

  it('A7.3 Beispiel 3/D10: regenbogen: in die eigene Schlange ohne Rückfrage (4 Punkte), in die von KI-Gegner 1 abwehrbar', () => {
    const start = erzeuge('regenbogen')
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'RegenbogenschlangeLegen'), 'A7.3: 5 Lücken bei Spieler 1, 3 bei KI-Gegner 1').toHaveLength(8)
    const eigen = klicke(start, einfuegen('RegenbogenschlangeLegen', 'schlange-1', 2))
    expect(ereignistypen(eigen.ereignisse)).toEqual(['KarteGespielt'])
    expect(namen(eigen.zustand, 0)).toEqual(['Rot', 'Rot', 'Regenbogenschlange', 'Braun', 'Braun'])
    expect(punkte(eigen.zustand, 0)).toBe(4)
    expect(aktionstypen(eigen.zustand)).toEqual(['FarbkarteLegen', 'ZugBeenden'])

    const angesagt = klicke(start, einfuegen('RegenbogenschlangeLegen', 'schlange-2', 2))
    expect(ereignistypen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleEntscheider(angesagt.zustand)).toBe(1)
    const abgewehrt = klicke(angesagt.zustand, abwehren)
    expect(ereignistypen(abgewehrt.ereignisse)).toEqual(['Abgewehrt', 'AnsageEntschieden'])
    expect(abgewehrt.zustand.spieler[0].ablagestapel.map((karte) => karte.typ === 'Sonderkarte' && karte.name)).toEqual(['Regenbogenschlange'])
    expect(namen(abgewehrt.zustand, 1)).toEqual(['Gelb', 'Gelb'])
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(namen(durch.zustand, 1)).toEqual(['Gelb', 'Gelb', 'Regenbogenschlange'])
    expect(punkte(durch.zustand, 1), 'D9: sie nützt KI-Gegner 1').toBe(2)
  })

  it('A6 Beispiel 1/A7.5: blockade-abwehr: KI-Gegner 1 wehrt ab, keine zweite Blockade im Zug, Auffüllen erst zu seinem Zugbeginn', () => {
    const start = erzeuge('blockade-abwehr')
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'BlockadeLegen'), 'A7.5: zwei Blockaden an je 9 Lücken').toHaveLength(18)
    const angesagt = klicke(start, einfuegen('BlockadeLegen', 'schlange-2', 1))
    expect(ereignistypen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleAktionen(angesagt.zustand).map((aktion) => aktion.typ)).toEqual(['Reagieren', 'Reagieren'])
    const abgewehrt = klicke(angesagt.zustand, abwehren)
    expect(abgewehrt.ereignisse[1]).toMatchObject({ typ: 'AnsageEntschieden', ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0 } })
    expect(namen(abgewehrt.zustand, 1)).toEqual(['Rot', 'Rot', 'Rot'])
    expect(aktionstypen(abgewehrt.zustand), 'A6 Beispiel 1: nicht gegen einen anderen Spieler').toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(abgewehrt.zustand.spieler[1].hand).toHaveLength(4)
    const ende = klicke(abgewehrt.zustand, beenden)
    expect(ende.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 1 },
    ])

    const durch = klicke(angesagt.zustand, durchlassen)
    expect(namen(durch.zustand, 1)).toEqual(['Rot', 'Schlangenblockade', 'Rot', 'Rot'])
    expect(punkte(durch.zustand, 1)).toBe(0)
  })
})
