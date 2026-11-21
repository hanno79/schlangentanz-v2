// @vitest-environment node
// Prüferprobe K2 Iteration 3: KI-Saat am Tisch an den Fixpunkten aus Iteration 2. Liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { kiSaatAmTisch } from '../src/entwicklung/partie'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'

it('Fixpunkte', () => {
  const faelle: Array<[number, number]> = [[22, 3736942547], [30, 4006315519], [60, 4210738748], [64, 4273669358], [80, 4278506630]]
  for (const [schritt, saat] of faelle) {
    const ki = kiSaatAmTisch(schritt, saat)
    appendFileSync(LOG, `Schritt ${schritt}, Partiesaat ${saat}: KI-Saat ${ki}, gleich der Partiesaat: ${ki === saat}, Abstand ${ki ^ saat}\n`)
  }
})
