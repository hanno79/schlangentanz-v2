// @vitest-environment node
// Prüferprobe K2 Iteration 3, Kriterium 8: Aufrufe von bewerte selbst gezählt, getrennt nach Vorauswahl und Suche; Zeit je Schritt. Liegt nur während des Laufs hier.
import { it, vi } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall, pruefeAktion } from '../src/engine'
import type { Spielzustand } from '../src/engine'
import { baukasten } from '../src/engine/testing/szenario'
import type { Kartenwahl, Schlangenglied } from '../src/engine/testing/szenario'
import { kiWahl } from '../src/ki/schritt'
import { entscheiderVon, sichtFuer } from '../src/ki/sicht'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import { planeZug } from '../src/ki/strategien/zugsuche'

const z = vi.hoisted(() => ({ alle: 0, inVorauswahl: 0, tiefe: 0, angeboten: 0, vorauswahlAufrufe: 0 }))
vi.mock('../src/ki/strategien/bewertung', async (orig) => {
  const m = await orig<typeof import('../src/ki/strategien/bewertung')>()
  return { ...m, bewerte: (...a: Parameters<typeof m.bewerte>) => { z.alle++; if (z.tiefe > 0) z.inVorauswahl++; return m.bewerte(...a) } }
})
vi.mock('../src/ki/strategien/vorauswahl', async (orig) => {
  const m = await orig<typeof import('../src/ki/strategien/vorauswahl')>()
  return {
    ...m,
    vorauswahl: (...a: Parameters<typeof m.vorauswahl>) => {
      z.tiefe++; z.vorauswahlAufrufe++; z.angeboten += a[1].length
      try { return m.vorauswahl(...a) } finally { z.tiefe-- }
    },
  }
})

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')
const null0 = () => { z.alle = 0; z.inVorauswahl = 0; z.angeboten = 0; z.vorauswahlAufrufe = 0 }

const LANG: Schlangenglied[][] = [
  ['Gelb', 'Gelb', 'Rot', 'Rot', 'Blau', 'Blau', 'Violett', 'Violett', 'Braun', 'Braun'],
  ['Braun', 'Grün', 'Grün', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Blau', 'Blau', 'Violett'],
  ['Violett', 'Blau', 'Blau', 'Gelb', 'Rot', 'Rot', 'Grün', 'Braun', 'Braun', 'Gelb'],
  ['Rot', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Braun', 'Grün', 'Grün', 'Blau', 'Rot'],
]
const MITTEL: Schlangenglied[][] = [
  ['Grün', 'Violett', 'Grün', 'Violett', 'Rot', 'Blau'],
  ['Blau', 'Braun', 'Blau', 'Violett', 'Gelb', 'Gelb'],
  ['Rot', 'Grün', 'Rot', 'Violett', 'Violett', 'Braun'],
  ['Braun', 'Blau', 'Braun', 'Gelb', 'Rot', 'Grün'],
]

function stellung(n: number, erw: boolean, hand: Kartenwahl[], art: 'offen' | 'nachFarbe' | 'schluss' | 'teilzug2'): Spielzustand {
  let b = baukasten({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(3300 + n + (erw ? 10 : 0)) })
  for (let i = 0; i < n; i++) b = n === 4 && i < 2 ? b.schlange(i, LANG[i]) : b.schlange(i, LANG[i]).schlange(i, MITTEL[i])
  b = b.hand(n - 1, hand)
  for (let i = 0; i < n - 1; i++) b = b.hand(i, ['Gelb', 'Braun'])
  if (art === 'schluss') b = b.schlussrunde(0)
  b = b.amZug(n - 1, art === 'teilzug2' ? 2 : 1)
  if (art === 'nachFarbe') b = b.aendere((s) => (s.zug.gespielteFarbkarten = 1))
  return b.zustand()
}

function miss(name: string, zu: Spielzustand, ergebnis: { abw: number; maxMs: number; maxSuche: number; maxVor: number; maxAlle: number; n: number }) {
  const e = entscheiderVon(zu)!
  const aktionen = ermittleAktionen(zu)
  null0()
  const t0 = performance.now()
  const plan = planeZug(sichtFuer(zu, e.index), structuredClone(aktionen), erzeugeZufall(17))
  const ms = performance.now() - t0
  const suche = z.alle - z.inVorauswahl
  const ok = plan.bewertungen.suche === suche && plan.bewertungen.vorauswahl === z.inVorauswahl && plan.bewertungen.angeboten === z.angeboten && z.inVorauswahl <= z.angeboten
  if (!ok) ergebnis.abw++
  ergebnis.n++
  ergebnis.maxMs = Math.max(ergebnis.maxMs, ms)
  ergebnis.maxSuche = Math.max(ergebnis.maxSuche, suche)
  ergebnis.maxVor = Math.max(ergebnis.maxVor, z.inVorauswahl)
  ergebnis.maxAlle = Math.max(ergebnis.maxAlle, z.alle)
  const erlaubt = pruefeAktion(zu, plan.aktion).erlaubt
  if (name !== '') log(`${name}: ${aktionen.length} Aktionen; ${ms.toFixed(1)} ms; selbst gezählt: alle ${z.alle}, in der Vorauswahl ${z.inVorauswahl} (Aufrufe der Vorauswahl ${z.vorauswahlAufrufe}, angeboten ${z.angeboten}), Suche ${suche}; Zugplan: suche ${plan.bewertungen.suche}, vorauswahl ${plan.bewertungen.vorauswahl}, angeboten ${plan.bewertungen.angeboten}; ${ok ? 'gleich' : 'ABWEICHUNG'}; gewählt ${plan.aktion.typ}, erlaubt ${erlaubt}`)
  return erlaubt
}

it('K2.8 Iteration 3: Zähler gegen eigene Zählung, späte Baukasten-Stellungen', () => {
  const erg = { abw: 0, maxMs: 0, maxSuche: 0, maxVor: 0, maxAlle: 0, n: 0 }
  let unerlaubt = 0
  for (const n of [4, 2, 3]) for (const erw of [false, true]) for (const art of ['offen', 'nachFarbe', 'schluss', 'teilzug2'] as const) for (const mitFarbe of [false, true]) {
    const hand: Kartenwahl[] = mitFarbe
      ? ['Farbendieb', 'Schlangenfrass', 'Farbenfusion', 'Rot', 'Gelb']
      : ['Farbendieb', 'Schlangenfrass', erw ? 'Schlangenhäutung' : 'Schlangenblockade', 'Farbenfusion', 'Regenbogenschlange']
    if (!miss(`${n}/${erw ? 'E' : 'B'} ${art}${mitFarbe ? ' mit Farbkarten' : ''}`, stellung(n, erw, hand, art), erg)) unerlaubt++
  }
  log(`BAUKASTEN: ${erg.n} Stellungen, Abweichungen ${erg.abw}, höchstens ${erg.maxMs.toFixed(1)} ms (erster Aufruf je Stellung, mit Zählern), Suche höchstens ${erg.maxSuche}, Vorauswahl höchstens ${erg.maxVor}, alle höchstens ${erg.maxAlle}, unerlaubt ${unerlaubt}`)
}, 600_000)

it('K2.8 Iteration 3: Zähler gegen eigene Zählung, jeder Schritt in Partien', () => {
  const erg = { abw: 0, maxMs: 0, maxSuche: 0, maxVor: 0, maxAlle: 0, n: 0 }
  let unerlaubt = 0
  for (const [k, n] of [2, 3, 4, 2, 3, 4].entries()) {
    const erw = k >= 3
    let zu = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(6100 + k) })
    const zufall = Array.from({ length: n }, (_, i) => erstelleZufallsKi(erzeugeZufall(6200 + 10 * k + i)))
    for (let s = 0; s < 4000; s++) {
      const e = entscheiderVon(zu)
      if (e === null) break
      if (e.index === 0) {
        if (!miss('', zu, erg)) unerlaubt++
        // gespielt wird die Wahl der soliden KI über planeZug (dieselbe Sicht und Saat wie oben)
        const plan = planeZug(sichtFuer(zu, 0), ermittleAktionen(zu), erzeugeZufall(17 + s))
        zu = anwendeAktion(zu, plan.aktion).zustand
      } else zu = anwendeAktion(zu, kiWahl(zu, zufall[e.index])!).zustand
    }
  }
  log(`PARTIEN: ${erg.n} Schritte der soliden KI, Abweichungen ${erg.abw}, höchstens ${erg.maxMs.toFixed(1)} ms, Suche höchstens ${erg.maxSuche}, Vorauswahl höchstens ${erg.maxVor}, alle höchstens ${erg.maxAlle}, unerlaubt ${unerlaubt}`)
}, 900_000)
