// @vitest-environment node
// Probe des Prüfers K4, nicht für das Repo: Bringt die Risiko-Karte im ersten Zug messbar etwas?
// Spiegelpartien zu zweit: solide KI gegen dieselbe solide KI, der im ersten eigenen Zug die Risiko-Karten nicht angeboten werden.
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion } from '../../engine'
import { STRATEGIEN } from './index'
import type { Ki } from './strategie'
import { spielePartie } from '../turnier'

const AUSGABE = process.env.K4_SPIEGEL_AUSGABE ?? 'k4-spiegel.json'
const SAATEN = Number(process.env.K4_SPIEGEL_SAATEN ?? 200)
const ERSTE = Number(process.env.K4_SPIEGEL_ERSTE ?? 88_000)

function ohneRisikoImErstenZug(ki: Ki): Ki {
  let beendet = 0
  return {
    name: `${ki.name} ohne Risiko im ersten Zug`,
    waehle(sicht, aktionen) {
      const erlaubt = beendet === 0 ? aktionen.filter((aktion) => aktion.typ !== 'RisikoKarteSpielen') : aktionen
      const wahl: SpielAktion = ki.waehle(sicht, erlaubt.length > 0 ? erlaubt : aktionen)
      if (wahl.typ === 'ZugBeenden' && sicht.zug.spielerIndex === sicht.ich) beendet += 1
      return wahl
    },
  }
}

describe('Prüfer K4 Spiegel', () => {
  it('Risiko im ersten Zug', () => {
    const punkte = { original: 0, ohne: 0, partien: 0, unentschieden: 0, risikoErsterZugOriginal: 0 }
    for (let n = 0; n < SAATEN; n += 1) {
      for (const originalSitz of [0, 1]) {
        const start = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(ERSTE + n) })
        const kis = [0, 1].map((sitz) => {
          const ki = STRATEGIEN.solideKi(erzeugeZufall(5_000 + 2 * n + sitz))
          return sitz === originalSitz ? ki : ohneRisikoImErstenZug(ki)
        })
        const verlauf = spielePartie(start, kis)
        expect(verlauf.ausgang).toBe('beendet')
        punkte.partien += 1
        const sieger = verlauf.siegerSitze
        if (sieger.length > 1) { punkte.unentschieden += 1; punkte.original += 0.5; punkte.ohne += 0.5 }
        else if (sieger[0] === originalSitz) punkte.original += 1
        else punkte.ohne += 1
      }
    }
    writeFileSync(AUSGABE, JSON.stringify(punkte, null, 2))
  }, 3_600_000)
})
