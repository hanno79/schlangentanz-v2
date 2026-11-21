// @vitest-environment node
// Diagnose des Prüfers K2, Iteration 4: Zugbeginne, an denen ein Gegner eine andere Karte abwehrte.
import { appendFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, werteSchlangen } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { entscheiderVon, sichtFuer } from '../src/ki/sicht'
import { STRATEGIEN } from '../src/ki/strategien'
import { bewerte } from '../src/ki/strategien/bewertung'
import { planeZug } from '../src/ki/strategien/zugsuche'

const LOG = process.env.PRUEFER_LOG ?? 'diag.log'
const log = (z: string) => appendFileSync(LOG, z + '\n')
const gruppen = (z: Spielzustand, s: number) => werteSchlangen(z.spieler[s].schlangen, z.erweiterung).schlangen.reduce((a, b) => a + b.gruppen.length, 0)
const bew = (z: Spielzustand, s: number) => bewerte(sichtFuer(z, s))
const ende = (z: Spielzustand, s: number) => berechneEndwertung(z).spieler[s].summe
function durch(z: Spielzustand, a: SpielAktion, s: number): Spielzustand {
  let j = anwendeAktion(z, a).zustand
  for (let g = ermittleEntscheider(j); j.schwebend !== null && g !== null && g !== s; g = ermittleEntscheider(j)) {
    j = anwendeAktion(j, { typ: 'Reagieren', spielerId: j.spieler[g].id, farbenschutzId: null }).zustand
  }
  return j
}
const kurz = (a: SpielAktion) => JSON.stringify(a).replace(/"spielerId":"[^"]*",?/, '')

function fall(n: number, erw: boolean, saat: number, beginn: number): void {
  const sitz = saat % n
  const kiZufall = erzeugeZufall(saat * 31 + 11)
  const zufallsKis = Array.from({ length: n }, (_, i) => STRATEGIEN.zufallsKi(erzeugeZufall(saat * 17 + i + 1)))
  let z = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(saat) })
  const verlauf: string[] = []
  for (let schritt = 0; schritt < beginn + 30; schritt += 1) {
    const e = entscheiderVon(z)!
    const aktionen = ermittleAktionen(z)
    if (schritt === beginn) {
      const g0 = gruppen(z, sitz)
      let best = { w: -Infinity, e: 0, d: '' }
      for (const v of aktionen.filter((a) => a.typ !== 'ZugBeenden' && gruppen(durch(z, a, sitz), sitz) > g0)) {
        const s1 = durch(z, v, sitz)
        const kands = [{ w: bew(s1, sitz), e: ende(s1, sitz), d: kurz(v) }]
        if (ermittleEntscheider(s1) === sitz && s1.zug.spielerIndex === sitz && s1.zug.teilzug === 1 && s1.zug.abschnitt === 'Ausspielen') {
          for (const b of ermittleAktionen(s1)) if (b.typ !== 'ZugBeenden') { const s2 = durch(s1, b, sitz); kands.push({ w: bew(s2, sitz), e: ende(s2, sitz), d: `${kurz(v)} + ${kurz(b)}` }) }
        }
        for (const k of kands) if (k.w > best.w + 1e-9) best = k
      }
      // Plan der KI unter Durchlassen, wie sie ihn beim Entscheiden rechnet
      let p = z
      const plan: string[] = []
      for (let i = 0; i < 10; i += 1) {
        const a = planeZug(sichtFuer(p, sitz), ermittleAktionen(p), erzeugeZufall(5)).aktion
        plan.push(kurz(a))
        if (a.typ === 'ZugBeenden') break
        p = durch(p, a, sitz)
      }
      log(`DIAG n=${n} erw=${erw} saat=${saat} Beginn ${beginn}: Plan der KI unter Durchlassen: ${plan.join(' ; ')}; Gruppen ${g0}->${gruppen(p, sitz)}, Bewertung ${bew(p, sitz).toFixed(4)}, End ${ende(p, sitz)}; beste Vollendung ${best.w.toFixed(4)} End ${best.e} (${best.d}); Abstand ${(bew(p, sitz) - best.w).toFixed(4)}`)
    }
    let aktion: SpielAktion
    if (e.index === sitz) {
      const abschriften = structuredClone(aktionen)
      aktion = aktionen[abschriften.indexOf(planeZug(sichtFuer(z, sitz), abschriften, kiZufall).aktion)]
    } else {
      const w = zufallsKis[e.index].waehle(sichtFuer(z, e.index), structuredClone(aktionen))
      aktion = aktionen[aktionen.findIndex((x) => JSON.stringify(x) === JSON.stringify(w))]
    }
    if (schritt >= beginn && schritt < beginn + 6) verlauf.push(`${schritt}:${e.index === sitz ? 'KI' : 'G' + e.index} ${kurz(aktion)}`)
    z = anwendeAktion(z, aktion).zustand
  }
  log(`  echt: ${verlauf.join(' | ')}`)
}

describe('Diagnose', () => {
  it('abgewehrte Fälle', () => {
    fall(2, true, 12254, 115)
    fall(3, false, 12301, 97)
  }, 600_000)
})
