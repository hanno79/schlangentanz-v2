// @vitest-environment node
// Probe des Prüfers K4, nicht für das Repo. Misst K4.1 bis K4.3 und K2.7 auf Saaten, die die Suite nicht kennt.
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, erfuelltAufgabe, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, werteSchlangen } from '../../engine'
import type { AufgabenkarteInfo, SpielAktion, Spielzustand } from '../../engine'
import { STRATEGIEN } from './index'
import type { Ki } from './strategie'
import { kiWahl } from '../schritt'
import { aufgabenwert, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { sichtFuer } from '../sicht'
import { mischeVerborgenes } from '../__tests__/verborgenes'

const AUSGABE = process.env.K4_PROBE_AUSGABE ?? 'k4-probe.json'

interface Schritt { idx: number; vorher: Spielzustand; aktion: SpielAktion; nachher: Spielzustand; sitz: number; ms: number; ereignisse: string[] }

function spiele(spielerzahl: number, saat: number, solideSitze: number[]): Schritt[] {
  let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
  const kis: Ki[] = Array.from({ length: spielerzahl }, (_, sitz) => (solideSitze.includes(sitz) ? STRATEGIEN.solideKi(erzeugeZufall(saat * 7 + sitz)) : STRATEGIEN.zufallsKi(erzeugeZufall(saat * 11 + sitz))))
  const schritte: Schritt[] = []
  for (let n = 0; n < 6000; n += 1) {
    const sitz = ermittleEntscheider(zustand)
    if (sitz === null) return schritte
    const t0 = performance.now()
    const aktion = kiWahl(zustand, kis[sitz])
    const ms = performance.now() - t0
    if (aktion === null) return schritte
    const { zustand: nachher, ereignisse } = anwendeAktion(zustand, aktion)
    schritte.push({ idx: schritte.length, vorher: zustand, aktion, nachher, sitz, ms, ereignisse: ereignisse.map((e) => e.typ) })
    zustand = nachher
  }
  throw new Error('Partie endet nicht')
}

function freieAufgaben(z: Spielzustand, sitz: number): AufgabenkarteInfo[] {
  const s = z.spieler[sitz]
  return [...z.offeneAufgaben, ...(s.geheimeAufgabeErfuellt || s.geheimeAufgabe === null ? [] : [s.geheimeAufgabe])]
}
function aufgabenstand(z: Spielzustand, sitz: number): number {
  const s = z.spieler[sitz]
  return s.erfuellteAufgaben.length + (s.geheimeAufgabeErfuellt ? 1 : 0)
}
function gruppen(z: Spielzustand, sitz: number): number {
  return werteSchlangen(z.spieler[sitz].schlangen, z.erweiterung).schlangen.reduce((summe, s) => summe + s.gruppen.length, 0)
}
const VERDECKT = (a: SpielAktion) => a.typ === 'RisikoKarteSpielen' || a.typ === 'ZweiAbwerfenDreiZiehen' || (a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'ziehen')
const KARTE = (a: SpielAktion) => a.typ !== 'ZugBeenden' && a.typ !== 'UeberhandAbwerfen' && a.typ !== 'Reagieren' && a.typ !== 'Entscheiden' && !VERDECKT(a)

/** Züge eines Sitzes: von der ersten Entscheidung im Abschnitt Ausspielen bis „Zug beenden“. */
function zuegeVon(schritte: Schritt[], sitz: number): Schritt[][] {
  const zuege: Schritt[][] = []
  let laufend: Schritt[] | null = null
  for (const s of schritte) {
    if (s.sitz !== sitz || s.aktion.typ === 'Reagieren') continue
    if (s.vorher.zug.spielerIndex !== sitz) continue
    laufend ??= []
    laufend.push(s)
    if (s.aktion.typ === 'ZugBeenden') { zuege.push(laufend); laufend = null }
  }
  if (laufend !== null) zuege.push(laufend)
  return zuege
}

const PARTIEN = Array.from({ length: 18 }, (_, n) => ({ spielerzahl: 2 + (n % 3), saat: 77_100 + n }))

describe('Prüfer K4', () => {
  it('Messung', () => {
    const bericht: Record<string, unknown> = {}
    const k41 = { gelegenheiten: 0, erfuellt: 0, verfehlt: [] as unknown[] }
    const k42 = { comeback: 0, risiko: 0, korb: 0, ersterZug: [] as unknown[], korbArten: {} as Record<string, number>, risikoArten: {} as Record<string, number> }
    const k43 = { faelle: [] as unknown[], haeutungenEigen: 0, mehrGruppen: 0, gleich: 0, weniger: 0, fremd: 0, gelegenheiten: 0, genutzt: 0 }
    let maxMs = 0
    let summeMs = 0
    let schritteKi = 0
    const langsam: unknown[] = []
    const stoerproben: Array<{ z: Spielzustand; saat: number }> = []
    for (const [nummer, partie] of PARTIEN.entries()) {
      const solide = nummer % 2 === 0 ? Array.from({ length: partie.spielerzahl }, (_, i) => i) : [0]
      const schritte = spiele(partie.spielerzahl, partie.saat, solide)
      expect(schritte[schritte.length - 1].nachher.partiephase).toBe('Beendet')
      for (const s of schritte) {
        if (!solide.includes(s.sitz)) continue
        schritteKi += 1
        summeMs += s.ms
        if (s.ms > maxMs) maxMs = s.ms
        if (s.ms > 1500) langsam.push({ saat: partie.saat, typ: s.aktion.typ, ms: Math.round(s.ms) })
        if (stoerproben.length < 400 && schritteKi % 5 === 0 && ermittleAktionen(s.vorher).length > 1) stoerproben.push({ z: s.vorher, saat: schritteKi })
      }
      for (const sitz of solide) {
        const zuege = zuegeVon(schritte, sitz)
        zuege.forEach((zug, zugNummer) => {
          const ende = zug[zug.length - 1].nachher
          // K4.1: an jeder Stelle des Zuges ohne Abhängigkeit vom Verdeckten: gibt es eine Karte, die eine freie Aufgabe erfüllt?
          const erste = zug.find((s) => s.vorher.zug.abschnitt === 'Ausspielen' && s.vorher.schwebend === null && s.vorher.entscheidung === null)
          if (erste !== undefined) {
            const start = erste.vorher
            const frei = freieAufgaben(start, sitz)
            const treffer = ermittleAktionen(start).filter(KARTE).flatMap((a) => {
              const danach = nachDurchlassen(start, a, sitz)
              const neu = aufgabenstand(danach, sitz) > aufgabenstand(start, sitz) || frei.some((auf) => erfuelltAufgabe(danach, sitz, auf))
              return neu ? [a] : []
            })
            const schonVorher = frei.some((auf) => erfuelltAufgabe(start, sitz, auf))
            if (treffer.length > 0 && !schonVorher) {
              k41.gelegenheiten += 1
              const geschafft = aufgabenstand(ende, sitz) > aufgabenstand(start, sitz)
              const abgewehrt = schritte.slice(zug[0].idx, zug[zug.length - 1].idx + 1).some((s) => s.aktion.typ === 'Reagieren' && s.aktion.farbenschutzId !== null)
              if (geschafft) k41.erfuellt += 1
              const bekannt = new Set([...start.offeneAufgaben, ...start.spieler.flatMap((x) => x.erfuellteAufgaben), ...(start.spieler[sitz].geheimeAufgabe === null ? [] : [start.spieler[sitz].geheimeAufgabe!])].map((a) => a.id))
              const pkt = (z: Spielzustand) => { const w = berechneEndwertung(z).spieler[sitz]; return w.summe - w.aufgaben.filter((a) => !bekannt.has(a.aufgabeId)).reduce((x, a) => x + a.punkte, 0) }
              const wert = (z: Spielzustand) => bewerte(sichtFuer(z, sitz)) + aufgabenwert(start, z, sitz)
              const besteWert = Math.max(...treffer.flatMap((a) => mitZweiterKarte(nachDurchlassen(start, a, sitz), sitz)).map(wert))
              const besteErf = Math.max(...treffer.map((a) => pkt(nachDurchlassen(start, a, sitz))))
              if (!geschafft) k41.verfehlt.push({ wertBesteErfuellungMitZweiter: besteWert, wertVorZugende: wert(zug[zug.length - 1].aktion.typ === 'ZugBeenden' ? zug[zug.length - 1].vorher : ende), punkteStart: pkt(start), punkteBesteErfuellung: besteErf, punkteZugende: pkt(ende), saat: partie.saat, sitz, zug: zugNummer + 1, aufgaben: frei.map((a) => a.name), treffer: treffer.slice(0, 2), gespielt: zug.map((s) => s.aktion.typ), abgewehrt, ereignisse: zug.flatMap((s) => s.ereignisse) })
            }
          }
          for (const s of zug) {
            const a = s.aktion
            if (a.typ === 'ComebackEinsetzen') k42.comeback += 1
            if (a.typ === 'RisikoKarteSpielen') { k42.risiko += 1; k42.risikoArten[a.risikoAktion] = (k42.risikoArten[a.risikoAktion] ?? 0) + 1 }
            if (a.typ === 'SchlangenkorbSpielen') { k42.korb += 1; k42.korbArten[a.bonus.art] = (k42.korbArten[a.bonus.art] ?? 0) + 1 }
            if (zugNummer === 0 && (a.typ === 'ComebackEinsetzen' || a.typ === 'RisikoKarteSpielen' || a.typ === 'SchlangenkorbSpielen')) {
              k42.ersterZug.push({ saat: partie.saat, sitz, aktion: a, schlangenVorher: s.vorher.spieler[sitz].schlangen.length, gespielt: zug.map((x) => x.aktion.typ), gruppenVorher: gruppen(zug[0].vorher, sitz), gruppenEnde: gruppen(ende, sitz), handVorher: s.vorher.spieler[sitz].hand.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)) })
            }
            if (a.typ === 'SchlangenhaeutungSpielen') {
              const eigen = s.vorher.spieler[sitz].schlangen.some((x) => x.id === a.schlangenId)
              if (!eigen) { k43.fremd += 1; continue }
              k43.haeutungenEigen += 1
              const nach = nachDurchlassen(s.vorher, a, sitz)
              const d = gruppen(nach, sitz) - gruppen(s.vorher, sitz)
              const w = (z: Spielzustand) => bewerte(sichtFuer(z, sitz)) + aufgabenwert(s.vorher, z, sitz)
              k43.faelle.push({ saat: partie.saat, sitz, gruppenDelta: d, aufgabenDelta: aufgabenstand(nach, sitz) - aufgabenstand(s.vorher, sitz), wertDelta: Number((w(nach) - w(s.vorher)).toFixed(2)), punkteDelta: berechneEndwertung(nach).spieler[sitz].summe - berechneEndwertung(s.vorher).spieler[sitz].summe, hand: s.vorher.spieler[sitz].hand.length, zugTeile: zug.map((x) => x.aktion.typ).join(',') })
              if (d > 0) k43.mehrGruppen += 1; else if (d === 0) k43.gleich += 1; else k43.weniger += 1
            }
          }
          // K4.3: Gelegenheit = eine angebotene Häutung in eigener Schlange, die mehr Gruppen bildet
          const erst = zug[0].vorher
          if (erst.zug.abschnitt === 'Ausspielen' && erst.schwebend === null && erst.entscheidung === null) {
            const haeut = ermittleAktionen(erst).filter((a) => a.typ === 'SchlangenhaeutungSpielen' && erst.spieler[sitz].schlangen.some((x) => x.id === a.schlangenId))
            const gut = haeut.some((a) => gruppen(nachDurchlassen(erst, a, sitz), sitz) > gruppen(erst, sitz))
            if (gut) {
              k43.gelegenheiten += 1
              if (zug.some((s) => s.aktion.typ === 'SchlangenhaeutungSpielen' && gruppen(nachDurchlassen(s.vorher, s.aktion, sitz), sitz) > gruppen(s.vorher, sitz))) k43.genutzt += 1
            }
          }
        })
      }
    }
    // K2.7-Störprobe auf eigenen Saaten: fremde Hände, Stapel, fremde geheime Aufgaben neu mischen
    let veraendert = 0
    const abweichend: unknown[] = []
    for (const [n, { z, saat }] of stoerproben.entries()) {
      const fuer = ermittleEntscheider(z)!
      const gemischt = mischeVerborgenes(z, fuer, erzeugeZufall(31_000 + n))
      if (JSON.stringify(gemischt) !== JSON.stringify(z)) veraendert += 1
      const wahl = (stand: Spielzustand) => JSON.stringify(kiWahl(stand, STRATEGIEN.solideKi(erzeugeZufall(saat))))
      if (wahl(gemischt) !== wahl(z)) abweichend.push({ n, typ: ermittleAktionen(z)[0].typ })
    }
    bericht.k41 = { ...k41, verfehltAnzahl: k41.verfehlt.length }
    bericht.k42 = k42
    bericht.k43 = k43
    bericht.zeit = { schritteKi, mittelMs: summeMs / schritteKi, maxMs, langsam }
    bericht.k27 = { proben: stoerproben.length, veraendert, abweichend }
    writeFileSync(AUSGABE, JSON.stringify(bericht, null, 2))
    expect(true).toBe(true)
  }, 1_800_000)
})
