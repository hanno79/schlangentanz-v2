// @vitest-environment node
// Prüferprobe K2 Iteration 3: eigenes Turnier, Zugenden, K2.1 strikt, Zeit je Schritt, Störprobe. Liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, pruefeAktion, werteSchlangen } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { baukasten } from '../src/engine/testing/szenario'
import { kiWahl } from '../src/ki/schritt'
import { entscheiderVon, sichtFuer } from '../src/ki/sicht'
import { bewerte } from '../src/ki/strategien/bewertung'
import { erstelleSolideKi } from '../src/ki/strategien/solideKi'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import type { Ki } from '../src/ki/strategien/strategie'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')

/** Eigener Generator (xorshift32), unabhängig vom Zufall der Engine. */
function meinZufall(saat: number): () => number {
  let x = (saat >>> 0) || 1
  return () => {
    x ^= x << 13; x >>>= 0
    x ^= x >>> 17
    x ^= x << 5; x >>>= 0
    return x / 4294967296
  }
}
function mische<T>(liste: T[], z: () => number): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(z() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Wendet an und lässt jeden anderen Gefragten durch, bis wieder `sitz` entscheidet oder keiner gefragt ist. */
function meinDurchlassen(z: Spielzustand, a: SpielAktion, sitz: number): Spielzustand {
  let n = anwendeAktion(z, a).zustand
  for (let k = 0; k < 10; k++) {
    const e = ermittleEntscheider(n)
    if (n.schwebend === null || e === null || e === sitz) break
    n = anwendeAktion(n, { typ: 'Reagieren', spielerId: n.spieler[e].id, farbenschutzId: null }).zustand
  }
  return n
}
const summen = (z: Spielzustand) => berechneEndwertung(z).spieler.map((s) => s.summe)
const gruppen = (z: Spielzustand, i: number) => werteSchlangen(z.spieler[i].schlangen, z.erweiterung).schlangen.reduce((s, x) => s + x.gruppen.length, 0)
const wert = (z: Spielzustand, i: number) => bewerte(sichtFuer(z, i))

/** Störung: fremde Hände und Stapel zusammen neu gemischt (Grössen bleiben), fremde geheime Aufgaben mit dem Aufgabenstapel neu verteilt, Erfüllt-Status umgedreht. */
function stoere(z: Spielzustand, sitz: number, zz: () => number): Spielzustand {
  const n = structuredClone(z)
  const fremde = n.spieler.map((_, i) => i).filter((i) => i !== sitz)
  const pool = mische([...fremde.flatMap((i) => n.spieler[i].hand), ...n.nachziehstapel].reverse(), zz)
  let p = 0
  for (const i of fremde) {
    const g = n.spieler[i].hand.length
    n.spieler[i].hand = pool.slice(p, p + g)
    p += g
  }
  n.nachziehstapel = pool.slice(p)
  const mitAufgabe = fremde.filter((i) => n.spieler[i].geheimeAufgabe !== null)
  if (mitAufgabe.length > 0) {
    const ap = mische([...mitAufgabe.map((i) => n.spieler[i].geheimeAufgabe!), ...n.aufgabenStapel], zz)
    mitAufgabe.forEach((i, k) => {
      n.spieler[i].geheimeAufgabe = ap[k]
      n.spieler[i].geheimeAufgabeErfuellt = !n.spieler[i].geheimeAufgabeErfuellt
    })
    n.aufgabenStapel = ap.slice(mitAufgabe.length)
  }
  return n
}

interface Partie { spielerzahl: number; erweiterung: boolean; saat: number; sitz: number; soSaat: number; zuSaat: (i: number) => number }
const EIGENE: Partie[] = []
const LISTE: Array<[number, boolean, number[]]> = [[2, false, [7101, 7102, 7103, 7104, 7105, 7106, 7107, 7108]], [2, true, [7151, 7152, 7153]], [3, false, [7201, 7202, 7203, 7204, 7205, 7206, 7207]], [3, true, [7251, 7252, 7253, 7254]], [4, false, [7301, 7302, 7303, 7304, 7305, 7306]], [4, true, [7351, 7352, 7353, 7354]]]
for (const [n, erw, saaten] of LISTE) for (const saat of saaten) EIGENE.push({ spielerzahl: n, erweiterung: erw, saat, sitz: saat % n, soSaat: saat * 13 + 3, zuSaat: (i) => saat * 7 + i + 11 })
// Die Partie aus Iteration 2 mit ihren Saaten.
const P7154: Partie = { spielerzahl: 2, erweiterung: true, saat: 7154, sitz: 0, soSaat: 7154 * 13 + 3, zuSaat: (i) => 7154 * 7 + i + 11 }

interface Stoerfall { z: Spielzustand; sitz: number; kiSaat: number }

it('K2 Iteration 3: eigenes Turnier', () => {
  const stoerfaelle: Stoerfall[] = []
  const zeilen = new Map<string, { partien: number; siege: number; allein: number; so: number; zu: number; schritte: number; maxMs: number; maxAkt: number }>()
  let unerlaubt = 0, zugenden = 0, verschenkt = 0, haltenHoeher = 0, haltenHoeherMax = 0, gleichstandGespielt = 0
  let k21geprueft = 0, k21vollendet = 0, k21ausnahmen = 0, k21verstoss = 0
  let maxMs = 0, maxMsAkt = 0, schritteGesamt = 0
  let fusionSenkt = 0, regenbogenGegner = 0, wirkungslosTrotz = 0, verdoppler = 0, zweiterOhneKarte = 0
  const faelle: string[] = []
  const zeitliste: number[] = []

  for (const p of [...EIGENE, P7154]) {
    const kis: Ki[] = Array.from({ length: p.spielerzahl }, (_, i) => (i === p.sitz ? erstelleSolideKi(erzeugeZufall(p.soSaat)) : erstelleZufallsKi(erzeugeZufall(p.zuSaat(i)))))
    let z = erstellePartie({ spielerzahl: p.spielerzahl, erweiterung: p.erweiterung, zufall: erzeugeZufall(p.saat) })
    const schluessel = `${p.spielerzahl}/${p.erweiterung ? 'E' : 'B'}`
    const zeile = zeilen.get(schluessel) ?? { partien: 0, siege: 0, allein: 0, so: 0, zu: 0, schritte: 0, maxMs: 0, maxAkt: 0 }
    let zugstart: Spielzustand | null = null
    let zugstartVollendend: Spielzustand[] = []
    let zugstartGruppen = 0
    let k21offen = false
    let soSchritt = 0
    for (let schritt = 0; schritt < 6000; schritt++) {
      const e = entscheiderVon(z)
      if (e === null) break
      if (e.index !== p.sitz) { z = anwendeAktion(z, kiWahl(z, kis[e.index])!).zustand; continue }
      const sitz = p.sitz
      const aktionen = ermittleAktionen(z)
      // Beginn eines Zuges der soliden KI: K2.1 vorbereiten.
      if (z.schwebend === null && z.zug.spielerIndex === sitz && z.zug.teilzug === 1 && z.zug.abschnitt === 'Ausspielen' && z.zug.gespielteFarbkarten === 0 && z.zug.gespielteSonderkarten === 0 && !z.zug.verdopplerGespielt) {
        zugstart = z
        zugstartGruppen = gruppen(z, sitz)
        zugstartVollendend = aktionen.filter((a) => a.typ !== 'ZugBeenden' && a.typ !== 'UeberhandAbwerfen').map((a) => meinDurchlassen(z, a, sitz)).filter((n) => gruppen(n, sitz) > zugstartGruppen)
        k21offen = zugstartVollendend.length > 0
      }
      const t0 = performance.now()
      const aktion = kiWahl(z, kis[sitz])!
      const ms = performance.now() - t0
      zeitliste.push(ms)
      schritteGesamt++; zeile.schritte++; soSchritt++
      if (ms > maxMs) { maxMs = ms; maxMsAkt = aktionen.length }
      zeile.maxMs = Math.max(zeile.maxMs, ms); zeile.maxAkt = Math.max(zeile.maxAkt, aktionen.length)
      if (!pruefeAktion(z, aktion).erlaubt) unerlaubt++
      if (soSchritt % 7 === 0 || aktion.typ === 'Reagieren' || z.zug.teilzug === 2 || z.partiephase === 'Schlussrunde') stoerfaelle.push({ z, sitz, kiSaat: p.soSaat + schritt })

      // Feste Regeln stichprobenartig (K2.3 bis K2.6).
      if (aktion.typ === 'FusionLegen' && summen(meinDurchlassen(z, aktion, sitz))[sitz] < summen(z)[sitz]) fusionSenkt++
      if (aktion.typ === 'RegenbogenschlangeLegen') {
        const eigene = new Set(z.spieler[sitz].schlangen.map((s) => s.id))
        if (!eigene.has(aktion.schlangenId) && aktionen.some((a) => a.typ === 'RegenbogenschlangeLegen' && eigene.has(a.schlangenId))) regenbogenGegner++
      }
      if (aktion.typ === 'SonderkarteWirkungslosAblegen' && aktionen.some((a) => a.typ !== 'SonderkarteWirkungslosAblegen')) wirkungslosTrotz++
      if (aktion.typ === 'VerdopplerSpielen') verdoppler++
      if (z.schwebend === null && z.zug.spielerIndex === sitz && z.zug.teilzug === 2 && z.zug.gespielteFarbkarten === 0 && z.zug.gespielteSonderkarten === 0 && aktion.typ === 'ZugBeenden' && aktionen.some((a) => a.typ !== 'ZugBeenden' && a.typ !== 'SonderkarteWirkungslosAblegen')) zweiterOhneKarte++

      // Zugende: liegt eine Karte, die die eigenen Punkte hebt, keinem Gegner nützt und nicht schlechter bewertet ist?
      if (aktion.typ === 'ZugBeenden') {
        const andere = aktionen.filter((a) => a.typ !== 'ZugBeenden')
        if (andere.length > 0) {
          zugenden++
          const jetzt = summen(z)
          const wJetzt = wert(z, sitz)
          let bestV: { g: number; d: number; a: SpielAktion } | null = null
          let bestH: { g: number; d: number } | null = null
          for (const a of andere) {
            const n = meinDurchlassen(z, a, sitz)
            const s = summen(n)
            if (s[sitz] <= jetzt[sitz] || s.some((w, i) => i !== sitz && w > jetzt[i])) continue
            const d = wert(n, sitz) - wJetzt
            if (d >= -1e-9) { if (bestV === null || s[sitz] - jetzt[sitz] > bestV.g) bestV = { g: s[sitz] - jetzt[sitz], d, a } }
            else if (bestH === null || s[sitz] - jetzt[sitz] > bestH.g) bestH = { g: s[sitz] - jetzt[sitz], d }
          }
          if (bestV !== null) { verschenkt++; faelle.push(`VERSCHENKT Saat ${p.saat} Schritt ${schritt}: +${bestV.g}, Bewertung ${bestV.d.toFixed(4)}, ${JSON.stringify(bestV.a)}`) }
          else if (bestH !== null) { haltenHoeher++; haltenHoeherMax = Math.max(haltenHoeherMax, bestH.g) }
        }
        // K2.1: erster ZugBeenden des Zuges.
        if (k21offen && zugstart !== null && z.zug.teilzug === 1) {
          k21offen = false
          k21geprueft++
          if (gruppen(z, sitz) > zugstartGruppen) k21vollendet++
          else {
            k21ausnahmen++
            const mitZweiter = zugstartVollendend.flatMap((n) => {
              if (n.schwebend !== null || n.zug.spielerIndex !== sitz || n.zug.abschnitt !== 'Ausspielen' || n.zug.teilzug !== 1) return [n]
              return [n, ...ermittleAktionen(n).filter((a) => a.typ !== 'ZugBeenden' && a.typ !== 'UeberhandAbwerfen').map((a) => meinDurchlassen(n, a, sitz))]
            })
            let beste = mitZweiter[0]
            for (const n of mitZweiter) if (wert(n, sitz) > wert(beste, sitz)) beste = n
            const wEnde = wert(z, sitz), wBeste = wert(beste, sitz)
            const strikt = wEnde > wBeste + 1e-9
            if (!strikt) k21verstoss++
            faelle.push(`K2.1 ${strikt ? 'ok' : 'VERSTOSS'} Saat ${p.saat} Schritt ${schritt}: Bewertung Zug ${wEnde.toFixed(3)} gegen beste Vollendung samt zweiter Karte ${wBeste.toFixed(3)} (Δ ${(wEnde - wBeste).toFixed(3)}); Endwertung ${summen(z)[sitz]} gegen ${summen(beste)[sitz]} (Start ${summen(zugstart)[sitz]}); Varianten ${mitZweiter.length}`)
          }
        }
      }
      // Gleichstand: gespielte Karte mit gleicher Bewertung wie das Halten und mehr Punkten.
      if (aktion.typ !== 'ZugBeenden' && aktion.typ !== 'Reagieren' && aktion.typ !== 'UeberhandAbwerfen' && aktionen.some((a) => a.typ === 'ZugBeenden')) {
        const n = meinDurchlassen(z, aktion, sitz)
        if (Math.abs(wert(n, sitz) - wert(z, sitz)) <= 1e-9 && summen(n)[sitz] > summen(z)[sitz]) gleichstandGespielt++
      }
      z = anwendeAktion(z, aktion).zustand
    }
    if (z.partiephase !== 'Beendet') throw new Error(`Partie ${p.saat} endet nicht`)
    const end = berechneEndwertung(z)
    const s = end.spieler.map((x) => x.summe)
    zeile.partien++
    if (end.gewinner.includes(z.spieler[p.sitz].id)) zeile.siege++
    if (end.gewinner.length === 1 && end.gewinner[0] === z.spieler[p.sitz].id) zeile.allein++
    zeile.so += s[p.sitz]
    zeile.zu += s.filter((_, i) => i !== p.sitz).reduce((a, b) => a + b, 0) / (p.spielerzahl - 1)
    if (p === P7154) log(`Saat 7154: Endwertung ${s.join(' : ')}, solide an Sitz 0`)
    else zeilen.set(schluessel, zeile)
  }
  log('TURNIER (Saaten des Testfalls TF-KI-013, 32 + Saat 7154)')
  for (const [k, v] of zeilen) log(`${k}: Partien ${v.partien}, Siege ${v.siege} (allein ${v.allein}), Ø solide ${(v.so / v.partien).toFixed(2)}, Ø Zufall ${(v.zu / v.partien).toFixed(2)}, Schritte ${v.schritte}, max ms ${v.maxMs.toFixed(1)}, max Aktionen ${v.maxAkt}`)
  const sortiert = [...zeitliste].sort((a, b) => a - b)
  log(`Schritte gesamt ${schritteGesamt} (mit Saat 7154); max ms ${maxMs.toFixed(1)} bei ${maxMsAkt} Aktionen; Median ${sortiert[Math.floor(sortiert.length / 2)].toFixed(2)} ms; 99. Perzentil ${sortiert[Math.floor(sortiert.length * 0.99)].toFixed(1)} ms; über 500 ms: ${zeitliste.filter((x) => x >= 500).length}`)
  log(`unerlaubt ${unerlaubt}; Fusion senkt ${fusionSenkt}; Regenbogen zum Gegner trotz eigener ${regenbogenGegner}; wirkungslos trotz anderem ${wirkungslosTrotz}; Verdoppler ${verdoppler}; zweiter Teilzug ohne Karte trotz Möglichkeit ${zweiterOhneKarte}`)
  log(`Zugenden mit anderer Karte ${zugenden}; VERSCHENKT (hebt Punkte, nützt keinem Gegner, nicht schlechter bewertet) ${verschenkt}; Halten höher bewertet (legitim) ${haltenHoeher}, höchstens +${haltenHoeherMax}; Karte bei Gleichstand gespielt ${gleichstandGespielt}`)
  log(`K2.1: geprüft ${k21geprueft}, vollendet ${k21vollendet} (${((100 * k21vollendet) / Math.max(1, k21geprueft)).toFixed(1)} %), Ausnahmen ${k21ausnahmen}, davon nicht strikt besser bewertet ${k21verstoss}`)
  for (const f of faelle) log(f)

  // Störprobe (Kriterium 7).
  const zz = meinZufall(424242)
  let geaendert = 0, sichtGleich = 0, abweichend = 0
  const arten = new Map<string, number>()
  const auswahl = stoerfaelle.filter((_, i) => i % 3 === 0)
  for (const f of auswahl) {
    const g = stoere(f.z, f.sitz, zz)
    if (JSON.stringify(g) !== JSON.stringify(f.z)) geaendert++
    if (JSON.stringify(sichtFuer(g, f.sitz)) === JSON.stringify(sichtFuer(f.z, f.sitz))) sichtGleich++
    const a1 = kiWahl(f.z, erstelleSolideKi(erzeugeZufall(f.kiSaat)))
    const a2 = kiWahl(g, erstelleSolideKi(erzeugeZufall(f.kiSaat)))
    if (JSON.stringify(a1) !== JSON.stringify(a2)) abweichend++
    const art = f.z.schwebend !== null ? 'Reaktion' : f.z.zug.teilzug === 2 ? 'zweiter Teilzug' : f.z.partiephase === 'Schlussrunde' ? 'Schlussrunde' : 'Zug'
    arten.set(art, (arten.get(art) ?? 0) + 1)
  }
  log(`STÖRPROBE: Stellungen ${auswahl.length} (${[...arten].map(([k, v]) => `${k} ${v}`).join(', ')}), verändert ${geaendert}, Sicht gleich ${sichtGleich}, abweichende Wahl ${abweichend}`)
}, 1_800_000)

it('K2 Iteration 3: Gleichstand Saat 7154 gestört', () => {
  const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(7154) })
    .schlange(0, ['Blau', 'Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot', 'Schlangenblockade', 'Gelb', 'Gelb', 'Gelb', 'Schlangenblockade', 'Gelb', 'Braun', 'Braun'])
    .schlange(0, ['Violett', 'Violett', 'Violett', 'Regenbogenschlange', 'Gelb', 'Gelb', 'Grün', 'Grün'])
    .schlange(1, ['Rot', 'Grün', 'Braun'])
    .hand(0, ['Gelb', 'Rot', 'Gelb', 'Schlangenfrass'])
    .amZug(0)
    .aendere((zustand) => (zustand.zug.gespielteFarbkarten = 1))
    .zustand()
  const zz = meinZufall(777)
  const wahlen = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const a = kiWahl(i === 0 ? start : stoere(start, 0, zz), erstelleSolideKi(erzeugeZufall(1000 + (i % 5))))!
    const k = JSON.stringify(a)
    wahlen.set(k, (wahlen.get(k) ?? 0) + 1)
  }
  log(`GLEICHSTAND 7154 gestört (30 Läufe, 5 KI-Saaten): ${[...wahlen].map(([k, v]) => `${v}× ${k}`).join(' | ')}`)
}, 120_000)
