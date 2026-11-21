// @vitest-environment node
// Prüferprobe K2 Iteration 2, Kriterium 7: Spion und Störprobe; liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { kiWahl } from '../src/ki/schritt'
import { bestimmeZustand, sichtFuer, simuliere } from '../src/ki/sicht'
import type { Sicht } from '../src/ki/sicht'
import type { Ki } from '../src/ki/strategien/strategie'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import { erstelleSolideKi } from '../src/ki/strategien/solideKi'
import { bewerte, neuerMerker } from '../src/ki/strategien/bewertung'
import { vorauswahl } from '../src/ki/strategien/vorauswahl'
import { planeZug } from '../src/ki/strategien/zugsuche'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')

/** Eigener Generator, nicht der der Engine. */
function lcg(saat: number) {
  let s = saat >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Eigene Störung: fremde Hände und Stapel zusammen, umgedreht und gemischt; fremde geheime Aufgaben mit dem Aufgabenstapel neu; ihr Erfüllt-Status umgekehrt. */
function stoere(z: Spielzustand, fuer: number, saat: number): Spielzustand {
  const n = structuredClone(z)
  const r = lcg(saat)
  const fremde = n.spieler.filter((_, i) => i !== fuer)
  const pool = [...fremde.flatMap((s) => s.hand), ...n.nachziehstapel].reverse()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  for (const s of fremde) s.hand = pool.splice(0, s.hand.length)
  n.nachziehstapel = pool
  const mit = fremde.filter((s) => s.geheimeAufgabe !== null)
  const aufg = [...mit.map((s) => s.geheimeAufgabe!), ...n.aufgabenStapel].reverse()
  for (let i = aufg.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[aufg[i], aufg[j]] = [aufg[j], aufg[i]]
  }
  for (const s of mit) s.geheimeAufgabe = aufg.shift()!
  n.aufgabenStapel = aufg
  for (const s of fremde) s.geheimeAufgabeErfuellt = !s.geheimeAufgabeErfuellt
  return n
}

function objekte(wert: unknown, menge = new Set<object>()): Set<object> {
  if (typeof wert !== 'object' || wert === null || menge.has(wert)) return menge
  menge.add(wert)
  if (wert instanceof Map) for (const [k, v] of wert) { objekte(k, menge); objekte(v, menge) }
  else for (const k of Object.getOwnPropertyNames(wert)) objekte((wert as Record<string, unknown>)[k], menge)
  return menge
}

/** Stellungen der soliden KI aus Partien gegen Zufalls-KIs, jede dritte Entscheidung. */
function stellungen(): Array<{ z: Spielzustand; sitz: number; art: string }> {
  const out: Array<{ z: Spielzustand; sitz: number; art: string }> = []
  const konf: Array<[number, number, boolean]> = [[8101, 2, false], [8102, 2, true], [8103, 2, false], [8201, 3, false], [8202, 3, true], [8203, 3, false], [8301, 4, false], [8302, 4, true], [8303, 4, false], [8304, 4, true], [8104, 2, true], [8105, 2, false], [8204, 3, true], [8205, 3, false], [8305, 4, false], [8306, 4, true]]
  for (const [saat, n, erw] of konf) {
    const sitz = saat % n
    const kis = Array.from({ length: n }, (_, i) => (i === sitz ? erstelleSolideKi(erzeugeZufall(saat + 77)) : erstelleZufallsKi(erzeugeZufall(saat * 3 + i))))
    let z = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(saat) })
    let zaehler = 0
    for (let s = 0; s < 5000; s++) {
      const e = ermittleEntscheider(z)
      if (e === null) break
      if (e === sitz && ermittleAktionen(z).length > 1 && zaehler++ % 3 === 0) {
        const art = z.schwebend !== null ? 'Reaktion' : z.partiephase !== 'Laufend' ? 'Schlussrunde' : z.zug.teilzug === 2 ? 'zweiter Teilzug' : 'Zug'
        out.push({ z, sitz, art })
      }
      z = anwendeAktion(z, kiWahl(z, kis[e])!).zustand
    }
  }
  return out
}

it('Kriterium 7: Spion und Störprobe', () => {
  const liste = stellungen()
  const arten = new Map<string, number>()
  for (const { art } of liste) arten.set(art, (arten.get(art) ?? 0) + 1)
  log(`Stellungen ${liste.length}: ${[...arten].map(([a, k]) => `${a} ${k}`).join(', ')}`)

  // 1. Spion: erreicht er über Sicht, Aktionen, Vorauswahl, Merker oder Simulation ein Objekt des echten Zustands?
  let echtErreicht = 0
  let fremdeHandInSicht = 0
  let treffer = 0
  let erwartet = 0
  let stapelTreffer = 0
  let stapelFaelle = 0
  for (const [nummer, { z, sitz }] of liste.entries()) {
    const echte = objekte(z)
    const spion: Ki = {
      name: 'Spion',
      waehle(sicht: Sicht, aktionen: readonly SpielAktion[]) {
        const merker = neuerMerker()
        const karten = aktionen.filter((a) => a.typ !== 'ZugBeenden')
        const reihe = vorauswahl(sicht, karten, 4, merker)
        bewerte(sicht, merker)
        const st = simuliere(sicht, lcg(nummer))
        const folge = st.nach(reihe[0] ?? aktionen[0])
        const weiter = folge.entscheider !== null ? folge.aktionen() : []
        const geraten = bestimmeZustand(sicht, lcg(nummer + 1))
        const erreicht = objekte([sicht, aktionen, reihe, merker.werte, st.sicht, st.aktionen(), folge.sicht, weiter, geraten])
        for (const o of erreicht) if (echte.has(o)) echtErreicht++
        for (const [i, s] of sicht.spieler.entries()) if (i !== sitz && 'hand' in s) fremdeHandInSicht++
        geraten.spieler.forEach((s, i) => {
          if (i === sitz) return
          const echt = new Set(z.spieler[i].hand.map((k) => k.id))
          treffer += s.hand.filter((k) => echt.has(k.id)).length
          const unbekannt = z.spieler.filter((_, j) => j !== sitz).reduce((a, x) => a + x.hand.length, 0) + z.nachziehstapel.length
          erwartet += unbekannt === 0 ? 0 : (s.hand.length * z.spieler[i].hand.length) / unbekannt
        })
        if (z.nachziehstapel.length > 0) {
          stapelFaelle++
          if (geraten.nachziehstapel[0]?.id === z.nachziehstapel[0].id) stapelTreffer++
        }
        return planeZug(sicht, aktionen, lcg(nummer)).aktion
      },
    }
    kiWahl(z, spion)
  }
  log(`Spion: echte Objekte erreicht ${echtErreicht}; fremde Hand in einer Sicht ${fremdeHandInSicht}; fremde Handkarten richtig geraten ${treffer} (Raten erwartet ${erwartet.toFixed(1)}); oberste Stapelkarte ${stapelTreffer} von ${stapelFaelle}`)

  // 2. Störprobe: gleiche KI-Saat, Verdecktes neu gemischt.
  let veraendert = 0
  let sichtGleich = 0
  let abweichend = 0
  const abw: string[] = []
  for (const [nummer, { z, sitz }] of liste.entries()) {
    const g = stoere(z, sitz, 1000 + nummer)
    if (JSON.stringify(g) !== JSON.stringify(z)) veraendert++
    if (JSON.stringify(sichtFuer(g, sitz)) === JSON.stringify(sichtFuer(z, sitz))) sichtGleich++
    const a = kiWahl(z, erstelleSolideKi(lcg(nummer)))
    const b = kiWahl(g, erstelleSolideKi(lcg(nummer)))
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      abweichend++
      abw.push(`${nummer}: ${JSON.stringify(a)} / ${JSON.stringify(b)}`)
    }
  }
  log(`Störprobe: ${liste.length} Stellungen, verändert ${veraendert}, Sicht gleich ${sichtGleich}, abweichende Wahl ${abweichend}`)
  for (const x of abw) log('  ', x)

  // 3. Gegenprobe der Störprobe: eine Strategie, die über die Hintertür des Tests den echten Stapel liest.
  let betrugAbweichend = 0
  for (const [nummer, { z, sitz }] of liste.entries()) {
    const g = stoere(z, sitz, 1000 + nummer)
    const betrug = (zustand: Spielzustand): Ki => ({
      name: 'Betrug',
      waehle(_s, aktionen) {
        const oben = zustand.nachziehstapel[0]?.id ?? ''
        const h = [...oben].reduce((a, c) => a + c.charCodeAt(0), 0)
        return aktionen[h % aktionen.length]
      },
    })
    if (JSON.stringify(kiWahl(z, betrug(z))) !== JSON.stringify(kiWahl(g, betrug(g)))) betrugAbweichend++
  }
  log(`Gegenprobe Betrug: abweichende Wahl ${betrugAbweichend} von ${liste.length}`)

  // 4. Hängt die Wahl überhaupt vom Erratenen ab? Andere KI-Saat, gleiche Stellung.
  let saatAbweichend = 0
  for (const [nummer, { z }] of liste.entries()) {
    if (JSON.stringify(kiWahl(z, erstelleSolideKi(lcg(nummer)))) !== JSON.stringify(kiWahl(z, erstelleSolideKi(lcg(nummer + 500000))))) saatAbweichend++
  }
  log(`Andere KI-Saat: abweichende Wahl ${saatAbweichend} von ${liste.length}`)
}, 900_000)
