// @vitest-environment node
import { appendFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { imErstenZug, setztAuslageEin } from './eroeffnung'
import { STRATEGIEN } from './index'
import { planeZug } from './zugsuche'

/* Prüfer K4, Iteration 2: Diagnose erster Zug (falsch negative Erkennung, Einsätze ohne Nutzen). Temporär. */

const SAATEN = (process.env.P2_SAATEN ?? '').split(',').filter(Boolean).map(Number)
const AUSGABE = process.env.P2_AUSGABE ?? 'x.txt'
const kurz = (a: SpielAktion) => JSON.stringify(a).slice(0, 220)
const karten = (z: Spielzustand, s: number) => z.spieler[s].hand.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join(', ')

describe('Diagnose 2', () => {
  it('erster Zug', () => {
    for (const saat of SAATEN) {
      const spielerzahl = 2 + (saat % 3)
      let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
      const kis = Array.from({ length: spielerzahl }, (_, sitz) => STRATEGIEN.solideKi(erzeugeZufall((saat * 13 + sitz * 101 + 5) >>> 0)))
      const erster = Array<boolean>(spielerzahl).fill(true)
      const begonnen = Array<boolean>(spielerzahl).fill(false)
      let letzterAm = -1
      const zeilen: string[] = [`Saat ${saat}, ${spielerzahl} Spieler`]
      for (let n = 0; n < 5000; n += 1) {
        const entscheider = entscheiderVon(zustand)
        if (entscheider === null) break
        const am = zustand.zug.spielerIndex
        if (am !== letzterAm) {
          if (letzterAm >= 0 && begonnen[letzterAm]) erster[letzterAm] = false
          begonnen[am] = true
          letzterAm = am
        }
        if (erster.every((e) => !e)) break
        const sicht = sichtFuer(zustand, am)
        const aktion = kiWahl(zustand, kis[entscheider.index])!
        if (erster[am] && entscheider.index === am) {
          const eigen = sicht.spieler[am]
          const info = `teilzug ${sicht.zug.teilzug}, verwendet ${JSON.stringify(sicht.zug.verwendet)}, runde ${JSON.stringify(sicht.zug.runde)}, Farbkarten in Schlangen ${eigen.schlangen.flatMap((s) => s.karten).filter((k) => k.typ === 'Farbkarte').length}, ausgespielt ${JSON.stringify(eigen.ausgespielteSonderkarten)}`
          zeilen.push(`Sitz ${am} erkannt=${imErstenZug(sicht)} Hand [${karten(zustand, am)}] Gruppen ${gruppenzahl(zustand, am)} Wert ${(bewerte(sicht) + aufgabenwert(zustand, zustand, am)).toFixed(2)} → ${kurz(aktion)} | ${info}`)
          if (setztAuslageEin(aktion)) {
            const wahlen = [1, 2, 3, 4, 5].map((s) => planeZug(sicht, ermittleAktionen(zustand), erzeugeZufall(s)).aktion.typ)
            zeilen.push(`  planeZug mit fünf frischen Saaten: ${wahlen.join(', ')}`)
          }
        }
        zustand = anwendeAktion(zustand, aktion).zustand
      }
      appendFileSync(AUSGABE, zeilen.join('\n') + '\n\n')
    }
  }, 600_000)
})
