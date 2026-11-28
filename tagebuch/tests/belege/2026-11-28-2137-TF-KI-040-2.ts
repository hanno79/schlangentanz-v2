// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall, offeneHandkarteDer } from '../../engine'
import type { Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { STRATEGIEN } from '../strategien'

// Prüfer K4 Iteration 3, Störprobe K2.7 mit Erweiterung: eigenes Mischen des Verdeckten.
const BASIS = Number(process.env.PRUEF_BASIS ?? 7_300_000)
const ANZAHL = Number(process.env.PRUEF_ANZAHL ?? 12)
const AUS = process.env.PRUEF_AUS ?? 'stoerprobe.json'

/** Eigener Zufall (mulberry32), unabhängig vom Projekt. */
function rng(saat: number): () => number {
  let a = saat >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function mische<T>(liste: T[], z: () => number): T[] {
  const l = [...liste]
  for (let i = l.length - 1; i > 0; i -= 1) {
    const j = Math.floor(z() * (i + 1))
    ;[l[i], l[j]] = [l[j], l[i]]
  }
  return l
}

/** Mischt fremde verdeckte Handkarten mit dem Stapel, fremde geheime Aufgaben mit dem Aufgabenstapel und deren Erfüllt-Stand. */
function mischeFremdes(zustand: Spielzustand, fuer: number, z: () => number): Spielzustand {
  const neu = structuredClone(zustand)
  const bekannt = new Set<string>([...neu.zug.verwendet.flatMap((e) => (e.karteId === null ? [] : [e.karteId]))])
  const genannt = offeneHandkarteDer(neu.entscheidung)
  if (genannt !== null) bekannt.add(genannt.karteId)
  const fremde = neu.spieler.filter((_, i) => i !== fuer)
  const verdeckt = fremde.map((sp) => sp.hand.filter((k) => !bekannt.has(k.id)))
  const pool = mische([...verdeckt.flat(), ...neu.nachziehstapel], z)
  fremde.forEach((sp, i) => {
    sp.hand = [...sp.hand.filter((k) => bekannt.has(k.id)), ...pool.splice(0, verdeckt[i].length)]
  })
  neu.nachziehstapel = pool
  const mit = fremde.filter((sp) => sp.geheimeAufgabe !== null)
  const aufgaben = mische([...mit.map((sp) => sp.geheimeAufgabe!), ...neu.aufgabenStapel], z)
  for (const sp of mit) sp.geheimeAufgabe = aufgaben.shift()!
  neu.aufgabenStapel = aufgaben
  for (const sp of fremde) sp.geheimeAufgabeErfuellt = z() < 0.5
  return neu
}

it('Störprobe K2.7 mit Erweiterung', () => {
  let stellungen = 0
  let uebersprungen = 0
  let abweichungen = 0
  const beispiele: string[] = []
  const typen: Record<string, number> = {}
  for (let n = 0; n < ANZAHL; n += 1) {
    const saat = BASIS + n
    const spielerzahl = 2 + (n % 3)
    const kis = Array.from({ length: spielerzahl }, (_, sitz) => STRATEGIEN.solideKi(erzeugeZufall(saat * 3 + sitz)))
    let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
    for (let k = 0; k < 5000; k += 1) {
      const e = entscheiderVon(zustand)
      if (e === null) break
      const aktionen = ermittleAktionen(zustand)
      if (aktionen.length > 1 && k % 3 === 0) {
        const fuer = e.index
        const original = sichtFuer(zustand, fuer)
        const ref = kiWahl(zustand, STRATEGIEN.solideKi(erzeugeZufall(424_242 + k)))
        for (let m = 0; m < 2; m += 1) {
          const gemischt = mischeFremdes(zustand, fuer, rng(saat * 1000 + k * 7 + m))
          if (process.env.PRUEF_OHNE_SICHTPRUEFUNG !== '1' && JSON.stringify(sichtFuer(gemischt, fuer)) !== JSON.stringify(original)) {
            uebersprungen += 1
            continue
          }
          stellungen += 1
          typen[aktionen[0].typ] = (typen[aktionen[0].typ] ?? 0) + 1
          const wahl = kiWahl(gemischt, STRATEGIEN.solideKi(erzeugeZufall(424_242 + k)))
          if (JSON.stringify(wahl) !== JSON.stringify(ref)) {
            abweichungen += 1
            if (beispiele.length < 10) beispiele.push(`Saat ${saat} Schritt ${k}: ${JSON.stringify(ref)} gegen ${JSON.stringify(wahl)}`)
          }
        }
      }
      zustand = anwendeAktion(zustand, kiWahl(zustand, kis[e.index])!).zustand
    }
  }
  writeFileSync(AUS, JSON.stringify({ stellungen, uebersprungen, abweichungen, typen, beispiele }, null, 1))
  console.log(`Störprobe: ${stellungen} gemischte Stellungen, übersprungen ${uebersprungen}, Abweichungen ${abweichungen}`)
  expect(stellungen).toBeGreaterThan(0)
}, 3_600_000)
