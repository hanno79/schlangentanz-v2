// @vitest-environment node
import { appendFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleEntscheider, erstellePartie, erzeugeZufall, pruefeInvarianten } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl } from '../__tests__/stellungen'
import { mischeVerborgenes } from '../__tests__/verborgenes'
import { bewerte } from './bewertung'
import { ERSTZUG_HALTEN, imErstenZug, setztAuslageEin } from './eroeffnung'
import { STRATEGIEN } from './index'
import { ziehtVerdeckt } from './ziehen'

/*
Prüfer K4, Iteration 2, Kriterium 2 an Zufallsstarthänden mit eigenen Saaten
(P2_ERSTE .. +P2_ANZAHL), solide KI an allen Sitzen, ganze Partien. Erster Zug nach dem
echten Zugverlauf. Dazu: Abgleich `imErstenZug` gegen die Wahrheit über alle Entscheidungen
und Störprobe K2.7 (verdeckte Teile neu mischen) an allen Entscheidungen im ersten Zug und
an jeder Schlangenhäutung. Temporäre Probe, wird nach der Messung gelöscht.
*/

const ERSTE = Number(process.env.P2_ERSTE ?? '0')
const ANZAHL = Number(process.env.P2_ANZAHL ?? '0')
const AUSGABE = process.env.P2_AUSGABE ?? ''

interface Schritt { vorher: Spielzustand; aktion: SpielAktion; nachher: Spielzustand; erster: boolean; am: number; entscheider: number }

function wert(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

describe('Prüfer K4 Iteration 2: erster Zug', () => {
  it('misst', () => {
    expect(AUSGABE, 'P2_AUSGABE fehlt').not.toBe('')
    for (let saat = ERSTE; saat < ERSTE + ANZAHL; saat += 1) {
      const spielerzahl = 2 + (saat % 3)
      let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
      const kis = Array.from({ length: spielerzahl }, (_, sitz) => STRATEGIEN.solideKi(erzeugeZufall((saat * 13 + sitz * 101 + 5) >>> 0)))
      const erster = Array<boolean>(spielerzahl).fill(true)
      const begonnen = Array<boolean>(spielerzahl).fill(false)
      let letzterAm = -1
      const schritte: Schritt[] = []
      for (let n = 0; n < 5000; n += 1) {
        const verletzt = pruefeInvarianten(zustand).filter((b) => b.verletzt)
        if (verletzt.length > 0) throw new Error(`Invariante Saat ${saat}`)
        const entscheider = entscheiderVon(zustand)
        if (entscheider === null) break
        const am = zustand.zug.spielerIndex
        if (am !== letzterAm) {
          if (letzterAm >= 0 && begonnen[letzterAm]) erster[letzterAm] = false
          begonnen[am] = true
          letzterAm = am
        }
        const aktion = kiWahl(zustand, kis[entscheider.index])!
        const nachher = anwendeAktion(zustand, aktion).zustand
        schritte.push({ vorher: zustand, aktion, nachher, erster: erster[am], am, entscheider: entscheider.index })
        // Derselbe Spieler kann gleich wieder dran sein, wenn eine Grube den Gegner aussetzen lässt: Zugende, danach Teilzug 1 ohne gespielte Karte.
        if (entscheider.index === am && nachher.zug.spielerIndex === am && (aktion.typ === 'ZugBeenden' || aktion.typ === 'UeberhandAbwerfen') && nachher.zug.teilzug === 1 && nachher.zug.abschnitt === 'Ausspielen' && nachher.zug.verwendet.length === 0) erster[am] = false
        zustand = nachher
      }
      // 1) imErstenZug gegen die Wahrheit, nur eigene Entscheidungen im eigenen Zug
      const eigene = schritte.filter((s) => s.entscheider === s.am)
      const falschNegativ = eigene.filter((s) => s.erster && !imErstenZug(sichtFuer(s.vorher, s.am))).length
      const falschPositiv = eigene.filter((s) => !s.erster && imErstenZug(sichtFuer(s.vorher, s.am))).length
      const spaeter = eigene.filter((s) => !s.erster).length
      // 2) Einsätze im ersten Zug
      const einsaetze: unknown[] = []
      for (let sitz = 0; sitz < spielerzahl; sitz += 1) {
        const zug = eigene.filter((s) => s.am === sitz && s.erster)
        const stelle = zug.findIndex((s) => setztAuslageEin(s.aktion))
        if (stelle < 0) continue
        const start = zug[stelle].vorher
        const rest = zug.slice(stelle)
        const schluss = rest.findIndex((s, i) => i > 0 && (s.aktion.typ === 'ZugBeenden' || s.aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(s.aktion)))
        const ende = schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher
        const gruppe = gruppenzahl(ende, sitz) > gruppenzahl(start, sitz)
        const aufgabe = ende.spieler[sitz].erfuellteAufgaben.length > start.spieler[sitz].erfuellteAufgaben.length || (ende.spieler[sitz].geheimeAufgabeErfuellt && !start.spieler[sitz].geheimeAufgabeErfuellt)
        const steigt = wert(start, ende, sitz) - wert(start, start, sitz)
        const a = zug[stelle].aktion
        einsaetze.push({ sitz, typ: a.typ, bonus: a.typ === 'SchlangenkorbSpielen' ? a.bonus.art : a.typ === 'RisikoKarteSpielen' ? a.risikoAktion : null, verdeckt: a.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(a), gruppe, aufgabe, steigt: Number(steigt.toFixed(3)), ok: gruppe || aufgabe || steigt > ERSTZUG_HALTEN, folge: rest.map((s) => s.aktion.typ) })
      }
      // 3) Störprobe: erste Züge und Häutungen, auch Abwehrentscheidungen im ersten Zug eines anderen
      const proben = schritte.filter((s) => s.erster || s.aktion.typ === 'SchlangenhaeutungSpielen')
      const abweichend: string[] = []
      let veraendert = 0
      for (const [nummer, s] of proben.entries()) {
        const wer = ermittleEntscheider(s.vorher)!
        const gemischt = mischeVerborgenes(s.vorher, wer, erzeugeZufall(saat * 1000 + nummer))
        if (JSON.stringify(gemischt) !== JSON.stringify(s.vorher)) veraendert += 1
        const w = (stand: Spielzustand) => JSON.stringify(kiWahl(stand, STRATEGIEN.solideKi(erzeugeZufall(nummer + 77))))
        if (w(gemischt) !== w(s.vorher)) abweichend.push(`${nummer}:${s.aktion.typ}`)
      }
      const ersteZuege = Array.from({ length: spielerzahl }, (_, sitz) => eigene.some((s) => s.am === sitz && s.erster)).filter(Boolean).length
      appendFileSync(AUSGABE, JSON.stringify({ saat, spielerzahl, ersteZuege, entscheidungenErster: eigene.filter((s) => s.erster).length, falschNegativ, falschPositiv, spaeter, einsaetze, proben: proben.length, veraendert, abweichend, haeutungen: schritte.filter((s) => s.aktion.typ === 'SchlangenhaeutungSpielen').length }) + '\n')
    }
  }, 6 * 3600_000)
})
