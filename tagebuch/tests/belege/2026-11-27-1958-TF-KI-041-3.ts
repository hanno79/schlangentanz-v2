// @vitest-environment node
// Probe des Prüfers K4, nicht für das Repo: Erster Zug mit verschiedenen Händen, spielt die solide KI eine Risiko-Karte?
import { appendFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import { legeAufgabenAus } from '../../engine/testing/aufgaben'
import { baukasten } from '../../engine/testing/szenario'
import { STRATEGIEN } from './index'
import { sichtFuer } from '../sicht'

const AUSLAGE = { offen: ['Symmetriemeister', 'Lila Riese', 'Gelber Schatz'], stapelOben: ['Farbharmonie', 'Vielfaltskönig'], geheim: [[0, 'Schlangentanz'], [1, 'Fusionsexperte']] } as const

function erster(hand: string[]) {
  return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(4108) })
    .hand(1, hand as never)
    .haendeAuffuellen()
    .aendere((zustand) => legeAufgabenAus(zustand, AUSLAGE as never))
    .amZug(1)
    .zugbeginn()
    .zustand()
}

const HAENDE: Record<string, string[]> = {
  'Beschreibung des Szenarios': ['Verdoppler', 'Farbendieb', 'Regenbogenschlange', 'Farbenschutz', 'Farbenschutz'],
  'Szenario im Code': ['Blau', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz'],
  'fünf Farbkarten': ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'],
  'drei Farben, zwei Sonder': ['Blau', 'Blau', 'Rot', 'Farbendieb', 'Schlangenfrass'],
}

describe('Prüfer K4 Szene', () => {
  it('erster Zug', () => {
    for (const [name, hand] of Object.entries(HAENDE)) {
      const zustand = erster(hand)
      const aktionen = ermittleAktionen(zustand)
      const wahlen = [1, 2, 3, 4, 5].map((saat) => {
        const aktion = STRATEGIEN.solideKi(erzeugeZufall(saat)).waehle(sichtFuer(zustand, 1), aktionen)
        return aktion.typ === 'RisikoKarteSpielen' ? `Risiko ${aktion.risikoAktion}` : aktion.typ
      })
      appendFileSync(process.env.K4_SZENE_AUSGABE ?? 'szene.txt', `SZENE ${name}: Risiko angeboten ${aktionen.some((a) => a.typ === 'RisikoKarteSpielen')}; Wahlen ${wahlen.join(', ')}
`)
    }
  }, 120_000)
})
