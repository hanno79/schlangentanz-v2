// @vitest-environment node
// Prüferprobe K2 Iteration 2; liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, hatNochLetztenZug, pruefeAktion } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { kiWahl } from '../src/ki/schritt'
import { sichtFuer } from '../src/ki/sicht'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import { planeZug } from '../src/ki/strategien/zugsuche'
import { bewerte } from '../src/ki/strategien/bewertung'
import { planeZug as planeZugAlt } from './pruefer_alt/zugsuche'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')
const zeige = (z: Spielzustand, i: number) => z.spieler[i].schlangen.map((s) => s.id + ':' + s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join('-')).join(' | ')

/** Eigene Fassung: Aktion anwenden, danach jeden gefragten Gegner durchlassen. */
function mitDurchlassen(z: Spielzustand, a: SpielAktion, sitz: number): Spielzustand {
  let n = anwendeAktion(z, a).zustand
  for (let i = 0; i < 10; i++) {
    const e = ermittleEntscheider(n)
    if (n.schwebend === null || e === null || e === sitz) break
    const durch = ermittleAktionen(n).find((x) => x.typ === 'Reagieren' && x.farbenschutzId === null)
    if (durch === undefined) break
    n = anwendeAktion(n, durch).zustand
  }
  return n
}

const summen = (z: Spielzustand) => berechneEndwertung(z).spieler.map((s) => s.summe)
const ohneAufgaben = (z: Spielzustand) => berechneEndwertung(z).spieler.map((s) => s.summe - s.aufgabenPunkte)
const kurz = (a: SpielAktion) => a.typ + ('karteId' in a ? ':' + a.karteId : '')

interface Partie { spielerzahl: number; erweiterung: boolean; saat: number }
const PARTIEN: Partie[] = [
  ...[7101, 7102, 7103, 7104, 7105, 7106, 7107, 7108].map((saat) => ({ spielerzahl: 2, erweiterung: false, saat })),
  ...[7151, 7152, 7153, 7154].map((saat) => ({ spielerzahl: 2, erweiterung: true, saat })),
  ...[7201, 7202, 7203, 7204, 7205, 7206, 7207].map((saat) => ({ spielerzahl: 3, erweiterung: false, saat })),
  ...[7251, 7252, 7253, 7254].map((saat) => ({ spielerzahl: 3, erweiterung: true, saat })),
  ...[7301, 7302, 7303, 7304, 7305, 7306].map((saat) => ({ spielerzahl: 4, erweiterung: false, saat })),
  ...[7351, 7352, 7353, 7354].map((saat) => ({ spielerzahl: 4, erweiterung: true, saat })),
]

it('Turnier und Zählung der Zugenden', () => {
  const tabelle = new Map<string, { partien: number; siege: number; allein: number; solide: number; zufall: number; schritte: number; maxMs: number; maxBew: number; maxAkt: number }>()
  let zugenden = 0
  let verschenktStreng = 0
  let verschenktOhneAufgaben = 0
  let unerlaubt = 0
  let wirkungslosTrotzAnderem = 0
  let gruben = 0
  let grubenOhneWirkung = 0
  let fusionen = 0
  let fusionSenkt = 0
  let regenbogenGegner = 0
  let zweiterTeilzug = 0
  let zweiterLeer = 0
  const faelle: string[] = []
  for (const p of PARTIEN) {
    const sitz = p.saat % p.spielerzahl
    const zk = Array.from({ length: p.spielerzahl }, (_, i) => erstelleZufallsKi(erzeugeZufall(p.saat * 7 + i + 11)))
    const kz = erzeugeZufall(p.saat * 13 + 3)
    let z = erstellePartie({ spielerzahl: p.spielerzahl, erweiterung: p.erweiterung, zufall: erzeugeZufall(p.saat) })
    const schluessel = `${p.spielerzahl}/${p.erweiterung ? 'E' : 'B'}`
    const zeile = tabelle.get(schluessel) ?? { partien: 0, siege: 0, allein: 0, solide: 0, zufall: 0, schritte: 0, maxMs: 0, maxBew: 0, maxAkt: 0 }
    for (let schritt = 0; schritt < 5000; schritt++) {
      const e = ermittleEntscheider(z)
      if (e === null) break
      let a: SpielAktion
      if (e === sitz) {
        const aufgezaehlt = ermittleAktionen(z)
        const kopien = structuredClone(aufgezaehlt)
        const t0 = performance.now()
        const plan = planeZug(sichtFuer(z, sitz), [...kopien], kz)
        const ms = performance.now() - t0
        const stelle = kopien.indexOf(plan.aktion)
        if (stelle < 0) throw new Error('gewählte Aktion nicht aus der Liste')
        a = aufgezaehlt[stelle]
        if (!pruefeAktion(z, a).erlaubt) unerlaubt++
        zeile.schritte++
        zeile.maxMs = Math.max(zeile.maxMs, ms)
        zeile.maxBew = Math.max(zeile.maxBew, plan.bewertungen)
        zeile.maxAkt = Math.max(zeile.maxAkt, aufgezaehlt.length)
        const andere = aufgezaehlt.filter((x) => x.typ !== 'ZugBeenden' && x.typ !== 'Reagieren' && x.typ !== 'UeberhandAbwerfen')
        if (a.typ === 'SonderkarteWirkungslosAblegen' && aufgezaehlt.some((x) => x.typ !== 'SonderkarteWirkungslosAblegen' && x.typ !== 'ZugBeenden')) wirkungslosTrotzAnderem++
        if (a.typ === 'FusionLegen') {
          fusionen++
          if (summen(mitDurchlassen(z, a, sitz))[sitz] < summen(z)[sitz]) fusionSenkt++
        }
        const eigeneIds = new Set(z.spieler[sitz].schlangen.map((s) => s.id))
        if (a.typ === 'RegenbogenschlangeLegen' && !eigeneIds.has(a.schlangenId) && aufgezaehlt.some((x) => x.typ === 'RegenbogenschlangeLegen' && eigeneIds.has(x.schlangenId))) regenbogenGegner++
        if (z.schwebend === null && z.zug.spielerIndex === sitz && z.zug.teilzug === 2 && z.zug.gespielteFarbkarten === 0 && z.zug.gespielteSonderkarten === 0) {
          zweiterTeilzug++
          if (a.typ === 'ZugBeenden' || a.typ === 'SonderkarteWirkungslosAblegen') zweiterLeer++
        }
        if (a.typ === 'SchlangengrubeSpielen') {
          gruben++
          const nach = anwendeAktion(z, a)
          if (nach.ereignisse.some((x) => x.typ === 'GrubeOhneWirkung')) grubenOhneWirkung++
        }
        if (a.typ === 'ZugBeenden' && andere.length > 0) {
          zugenden++
          const jetzt = summen(z)
          const jetztOA = ohneAufgaben(z)
          const wertJetzt = bewerte(sichtFuer(z, sitz))
          let besterStreng: { a: SpielAktion; g: number; gOA: number; bew: number } | null = null
          for (const x of andere) {
            const n = mitDurchlassen(z, x, sitz)
            const s = summen(n)
            const sOA = ohneAufgaben(n)
            const nuetzt = s.some((w, i) => i !== sitz && w > jetzt[i])
            if (s[sitz] > jetzt[sitz] && !nuetzt) {
              const kand = { a: x, g: s[sitz] - jetzt[sitz], gOA: sOA[sitz] - jetztOA[sitz], bew: bewerte(sichtFuer(n, sitz)) - wertJetzt }
              if (besterStreng === null || kand.g > besterStreng.g) besterStreng = kand
            }
          }
          if (besterStreng !== null) {
            verschenktStreng++
            if (besterStreng.gOA > 0) verschenktOhneAufgaben++
            const letzter = z.partiephase !== 'Laufend' && !hatNochLetztenZug({ ...z, zug: { ...z.zug } }, sitz)
            faelle.push(`Saat ${p.saat} (${schluessel}) Schritt ${schritt} phase ${z.partiephase}: +${besterStreng.g} (ohne Aufgaben +${besterStreng.gOA}), Bewertung ${besterStreng.bew >= 0 ? '+' : ''}${besterStreng.bew.toFixed(2)}, ${JSON.stringify(besterStreng.a)}; Hand ${z.spieler[sitz].hand.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join(',')}; letzterZug? ${letzter}`)
          }
        }
      } else {
        const w = kiWahl(z, zk[e])
        if (w === null) throw new Error('keine Wahl')
        a = w
      }
      z = anwendeAktion(z, a).zustand
    }
    if (z.partiephase !== 'Beendet') throw new Error(`Partie ${p.saat} endet nicht`)
    const end = berechneEndwertung(z)
    const s = end.spieler.map((x) => x.summe)
    zeile.partien++
    if (end.gewinner.includes(z.spieler[sitz].id)) zeile.siege++
    if (end.gewinner.length === 1 && end.gewinner[0] === z.spieler[sitz].id) zeile.allein++
    zeile.solide += s[sitz]
    zeile.zufall += s.filter((_, i) => i !== sitz).reduce((a2, b) => a2 + b, 0) / (p.spielerzahl - 1)
    tabelle.set(schluessel, zeile)
  }
  log('TURNIER')
  for (const [k, v] of tabelle) log(`${k}: Partien ${v.partien}, Siege ${v.siege} (allein ${v.allein}), Ø solide ${(v.solide / v.partien).toFixed(2)}, Ø Zufall ${(v.zufall / v.partien).toFixed(2)}, Schritte ${v.schritte}, max ms ${v.maxMs.toFixed(1)}, max Bewertungen ${v.maxBew}, max Aktionen ${v.maxAkt}`)
  log(`Zugenden mit anderer Karte: ${zugenden}; verschenkt (Endwertung steigt, kein Gegner steigt): ${verschenktStreng}; davon ohne Aufgaben: ${verschenktOhneAufgaben}`)
  log(`Fusionen ${fusionen}, davon Endwertung gesunken ${fusionSenkt}; Regenbogenschlange zum Gegner trotz eigener ${regenbogenGegner}; zweite Teilzüge nach Verdoppler (erste Entscheidung) ${zweiterTeilzug}, davon ohne Karte ${zweiterLeer}`)
  log(`unerlaubt ${unerlaubt}; wirkungslos trotz anderem Zug ${wirkungslosTrotzAnderem}; Gruben ${gruben}, ohne Wirkung ${grubenOhneWirkung}`)
  for (const f of faelle) log('FALL', f)
}, 1_200_000)

it('Saat 9206 wie in Iteration 1 nachgespielt (alte KI bis Schritt 68)', () => {
  const saat = 9206
  const sitz = 2
  let z = erstellePartie({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(saat) })
  const zk = Array.from({ length: 3 }, (_, i) => erstelleZufallsKi(erzeugeZufall(saat * 31 + i + 5)))
  const kz = erzeugeZufall(saat * 17 + 999)
  for (let s = 0; s < 68; s++) {
    const e = ermittleEntscheider(z)!
    const a = e === sitz ? planeZugAlt(sichtFuer(z, e), ermittleAktionen(z), kz).aktion : kiWahl(z, zk[e])!
    z = anwendeAktion(z, a).zustand
  }
  log('S9206 Entscheider', ermittleEntscheider(z), 'zug', JSON.stringify(z.zug))
  log('S9206 eigene', zeige(z, sitz))
  for (let i = 0; i < 3; i++) if (i !== sitz) log('S9206 Gegner', i, zeige(z, i))
  log('S9206 Hand', z.spieler[sitz].hand.map((k) => k.id).join(','))
  const aktionen = ermittleAktionen(z)
  const alt = planeZugAlt(sichtFuer(z, sitz), structuredClone(aktionen), erzeugeZufall(1)).aktion
  const neu = planeZug(sichtFuer(z, sitz), structuredClone(aktionen), erzeugeZufall(1))
  const vor = summen(z)
  const nachNeu = neu.aktion.typ === 'ZugBeenden' ? vor : summen(mitDurchlassen(z, aktionen.find((x) => JSON.stringify(x) === JSON.stringify(neu.aktion))!, sitz))
  log('S9206 alte KI wählt', JSON.stringify(alt))
  log('S9206 neue KI wählt', JSON.stringify(neu.aktion), 'Bewertungen', neu.bewertungen, 'Endwertung', vor[sitz], '->', nachNeu[sitz], 'Gegner', vor.join('/'), '->', nachNeu.join('/'))
  // Den ganzen Zug der neuen KI ab hier weiterspielen
  let w = z
  for (let k = 0; k < 6 && ermittleEntscheider(w) === sitz && w.zug.spielerIndex === sitz; k++) {
    const a = kiWahl(w, { name: 'neu', waehle: (sicht, akt) => planeZug(sicht, akt, erzeugeZufall(1)).aktion })!
    w = anwendeAktion(w, a).zustand
    log('S9206 Zug weiter:', kurz(a), 'Endwertung', summen(w).join('/'))
  }
}, 300_000)
