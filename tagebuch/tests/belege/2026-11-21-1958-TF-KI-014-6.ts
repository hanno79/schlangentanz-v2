// @vitest-environment node
// Probe des Prüfers K2, Iteration 4. Liegt nur während des Laufs unter tests/.
import { appendFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import {
  anwendeAktion,
  berechneEndwertung,
  ermittleAktionen,
  ermittleEntscheider,
  erstellePartie,
  erzeugeZufall,
  pruefeAktion,
  werteSchlangen,
} from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { entscheiderVon, sichtFuer } from '../src/ki/sicht'
import type { Sicht } from '../src/ki/sicht'
import { STRATEGIEN } from '../src/ki/strategien'

const zaehler = { n: 0 }
vi.mock('../src/ki/strategien/bewertung', async (original) => {
  const echt = await original<typeof import('../src/ki/strategien/bewertung')>()
  return {
    ...echt,
    bewerte: (...args: Parameters<typeof echt.bewerte>) => {
      zaehler.n += 1
      return echt.bewerte(...args)
    },
  }
})

const { bewerte, wertschluessel } = await import('../src/ki/strategien/bewertung')
const { planeZug, GRENZE_SUCHE } = await import('../src/ki/strategien/zugsuche')

const LOG = process.env.PRUEFER_LOG ?? 'pruefer_k2_it4.log'
const SPIELER = (process.env.PRUEFER_SPIELER ?? '2,3,4').split(',').map(Number)
const PARTIEN = Number(process.env.PRUEFER_PARTIEN ?? '6')
const GLEICH = 1e-9

function log(zeile: string): void {
  appendFileSync(LOG, zeile + '\n')
}

function gruppen(z: Spielzustand, sitz: number): number {
  return werteSchlangen(z.spieler[sitz].schlangen, z.erweiterung).schlangen.reduce((s, sch) => s + sch.gruppen.length, 0)
}

function endwertung(z: Spielzustand): number[] {
  return berechneEndwertung(z).spieler.map((s) => s.summe)
}

function bew(z: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(z, sitz))
}

function durchlassen(z: Spielzustand, aktion: SpielAktion, sitz: number): { zustand: Spielzustand; abgewehrt: boolean } {
  let jetzt = anwendeAktion(z, aktion).zustand
  for (let gefragt = ermittleEntscheider(jetzt); jetzt.schwebend !== null && gefragt !== null && gefragt !== sitz; gefragt = ermittleEntscheider(jetzt)) {
    jetzt = anwendeAktion(jetzt, { typ: 'Reagieren', spielerId: jetzt.spieler[gefragt].id, farbenschutzId: null }).zustand
  }
  return { zustand: jetzt, abgewehrt: false }
}

function imAusspielen(z: Spielzustand, sitz: number, teilzug: number): boolean {
  return ermittleEntscheider(z) === sitz && z.schwebend === null && z.zug.spielerIndex === sitz && z.zug.teilzug === teilzug && z.zug.abschnitt === 'Ausspielen' && z.partiephase !== 'Beendet'
}

/** Bester Wert nach `karte` samt bester zweiter Karte desselben Teilzugs (gefragte Gegner lassen durch). */
function besteMitZweiter(z: Spielzustand, karte: SpielAktion, sitz: number): { wert: number; ende: number; beschreibung: string } {
  const s1 = durchlassen(z, karte, sitz).zustand
  let best = { wert: bew(s1, sitz), ende: endwertung(s1)[sitz], beschreibung: kurz(karte) }
  if (imAusspielen(s1, sitz, z.zug.teilzug)) {
    for (const zweite of ermittleAktionen(s1)) {
      if (zweite.typ === 'ZugBeenden') continue
      const s2 = durchlassen(s1, zweite, sitz).zustand
      const w = bew(s2, sitz)
      if (w > best.wert + GLEICH) best = { wert: w, ende: endwertung(s2)[sitz], beschreibung: `${kurz(karte)} + ${kurz(zweite)}` }
    }
  }
  return best
}

function kurz(a: SpielAktion): string {
  return JSON.stringify(a).replace(/"spielerId":"[^"]*",?/, '')
}

/** Nachbau des Folgeschlüssels aus zugsuche.ts (fe5d534). */
function folgeschluessel(sicht: Sicht): string {
  const schlangen = sicht.spieler.map((spieler) => wertschluessel(spieler.schlangen)).join('/')
  const hand = sicht.hand.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)).sort().join(',')
  const gruben = sicht.ausliegendeGruben.map((grube) => grube.vor).join(',')
  return `${schlangen}#${hand}#${gruben}#${JSON.stringify(sicht.zug)}`
}

/** Die ganze Sicht ohne Ids: Unterscheidet sich das bei gleichem Folgeschlüssel, sieht der Schlüssel etwas nicht. */
function vollschluessel(sicht: Sicht): string {
  return JSON.stringify(sicht, (schluessel, wert) => (['id', 'karteId', 'schlangenId', 'schlangenZaehler'].includes(schluessel) ? undefined : wert))
}

/** Eigene Störung: fremde Hände und Stapel umgedreht und mit xorshift gemischt, fremde Aufgaben neu verteilt, Erfüllt umgedreht. */
function stoere(z: Spielzustand, sitz: number, saat: number): Spielzustand {
  let x = saat >>> 0 || 1
  const rnd = () => {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    return x / 4294967296
  }
  const mische = <T,>(liste: T[]): T[] => {
    const l = [...liste].reverse()
    for (let i = l.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1))
      ;[l[i], l[j]] = [l[j], l[i]]
    }
    return l
  }
  const neu = structuredClone(z)
  const fremde = neu.spieler.filter((_, i) => i !== sitz)
  const pool = mische([...fremde.flatMap((s) => s.hand), ...neu.nachziehstapel])
  for (const s of fremde) s.hand = pool.splice(0, s.hand.length)
  neu.nachziehstapel = pool
  const mitAufgabe = fremde.filter((s) => s.geheimeAufgabe !== null)
  const aufgaben = mische([...mitAufgabe.map((s) => s.geheimeAufgabe!), ...neu.aufgabenStapel])
  for (const s of mitAufgabe) s.geheimeAufgabe = aufgaben.splice(0, 1)[0]
  neu.aufgabenStapel = aufgaben
  for (const s of fremde) s.geheimeAufgabeErfuellt = !s.geheimeAufgabeErfuellt
  return neu
}

const felder = new Map<string, number>()

/** Welche Felder der Sicht sich zwischen Varianten mit gleichem Schlüssel unterscheiden. */
function unterschied(voll: string[]): string[] {
  const teile = voll.map((v) => JSON.parse(v) as Record<string, unknown>)
  const namen = new Set<string>()
  for (const k of Object.keys(teile[0])) {
    if (k === 'spieler') {
      const sp = teile.map((t) => t.spieler as Array<Record<string, unknown>>)
      sp[0].forEach((s, i) => {
        for (const f of Object.keys(s)) if (new Set(sp.map((x) => JSON.stringify(x[i][f]))).size > 1) namen.add(`spieler.${f}`)
      })
    } else if (new Set(teile.map((t) => JSON.stringify(t[k]))).size > 1) namen.add(k)
  }
  return [...namen]
}

interface Summe {
  partien: number
  schritte: number
  k21Moeglich: number
  k21Vollendet: number
  k21Versucht: number
  k21Ausnahme: number
  k21Abgewehrt: number
  k21Verstoss: number
  zugenden: number
  zugendenLiegen: number
  zugendenHaltenBesser: number
  k8Abweichung: number
  k8MaxSuche: number
  k8MaxVorauswahl: number
  k8VorauswahlUeber: number
  k8MaxMs: number
  k8Unerlaubt: number
  k7Stellungen: number
  k7Abweichung: number
  k7SichtAnders: number
  k7Unveraendert: number
  schluesselGruppen: number
  schluesselKollision: number
  schluesselRelevant: number
  punkte: string[]
}

function neueSumme(): Summe {
  return {
    partien: 0, schritte: 0, k21Moeglich: 0, k21Vollendet: 0, k21Versucht: 0, k21Ausnahme: 0, k21Abgewehrt: 0, k21Verstoss: 0,
    zugenden: 0, zugendenLiegen: 0, zugendenHaltenBesser: 0, k8Abweichung: 0, k8MaxSuche: 0, k8MaxVorauswahl: 0, k8VorauswahlUeber: 0,
    k8MaxMs: 0, k8Unerlaubt: 0, k7Stellungen: 0, k7Abweichung: 0, k7SichtAnders: 0, k7Unveraendert: 0,
    schluesselGruppen: 0, schluesselKollision: 0, schluesselRelevant: 0, punkte: [],
  }
}

function pruefeSchluessel(z: Spielzustand, sitz: number, summe: Summe, wo: string): void {
  const gruppenNach = new Map<string, Array<{ voll: string; zustand: Spielzustand; aktion: SpielAktion }>>()
  for (const a of ermittleAktionen(z)) {
    if (a.typ === 'ZugBeenden') continue
    const s1 = durchlassen(z, a, sitz).zustand
    if (!imAusspielen(s1, sitz, z.zug.teilzug)) continue
    const sicht = sichtFuer(s1, sitz)
    const k = folgeschluessel(sicht)
    const liste = gruppenNach.get(k) ?? []
    liste.push({ voll: vollschluessel(sicht), zustand: s1, aktion: a })
    gruppenNach.set(k, liste)
  }
  for (const liste of gruppenNach.values()) {
    if (liste.length < 2) continue
    summe.schluesselGruppen += 1
    if (new Set(liste.map((e) => e.voll)).size < 2) continue
    summe.schluesselKollision += 1
    for (const feld of unterschied(liste.map((e) => e.voll))) felder.set(feld, (felder.get(feld) ?? 0) + 1)
    const werte = liste.map((e) => {
      let best = bew(e.zustand, sitz)
      for (const zweite of ermittleAktionen(e.zustand)) {
        if (zweite.typ === 'ZugBeenden') continue
        best = Math.max(best, bew(durchlassen(e.zustand, zweite, sitz).zustand, sitz))
      }
      return best
    })
    const spanne = Math.max(...werte) - Math.min(...werte)
    if (spanne > GLEICH) {
      summe.schluesselRelevant += 1
      log(`SCHLUESSEL relevant ${wo}: Spanne ${spanne.toFixed(4)}; ${liste.map((e, i) => `${kurz(e.aktion)} -> ${werte[i].toFixed(4)}`).join(' | ')}`)
    } else {
      log(`SCHLUESSEL gleichwertig ${wo}: ${liste.length} Varianten, Unterschied nur ausserhalb des Schlüssels`)
    }
  }
}

function spielePartie(n: number, erw: boolean, saat: number, summe: Summe): void {
  const sitz = saat % n
  const kiZufall = erzeugeZufall(saat * 31 + 11)
  const zufallsKis = Array.from({ length: n }, (_, i) => STRATEGIEN.zufallsKi(erzeugeZufall(saat * 17 + i + 1)))
  let z = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(saat) })
  let offen: null | { g0: number; best: { wert: number; ende: number; beschreibung: string }; schritt: number; versucht: boolean; abgewehrt: boolean } = null
  let kiSchritt = 0
  for (let schritt = 0; schritt < 6000; schritt += 1) {
    const e = entscheiderVon(z)
    if (e === null) break
    const aktionen = ermittleAktionen(z)
    const wo = `n=${n} erw=${erw} saat=${saat} schritt=${schritt}`
    let aktion: SpielAktion
    if (e.index === sitz) {
      kiSchritt += 1
      // K2.1: Zugbeginn
      if (imAusspielen(z, sitz, 1) && z.zug.gespielteFarbkarten === 0 && z.zug.gespielteSonderkarten === 0 && offen === null) {
        const g0 = gruppen(z, sitz)
        const vollendungen = aktionen.filter((a) => a.typ !== 'ZugBeenden' && gruppen(durchlassen(z, a, sitz).zustand, sitz) > g0)
        if (vollendungen.length > 0) {
          let best = { wert: -Infinity, ende: 0, beschreibung: '' }
          for (const v of vollendungen) {
            const b = besteMitZweiter(z, v, sitz)
            if (b.wert > best.wert + GLEICH) best = b
          }
          offen = { g0, best, schritt, versucht: false, abgewehrt: false }
        }
      }
      if (imAusspielen(z, sitz, z.zug.teilzug)) pruefeSchluessel(z, sitz, summe, wo)
      // K7: jede vierte Entscheidung
      if (kiSchritt % 4 === 0) {
        const gestoert = stoere(z, sitz, saat * 1000 + schritt)
        summe.k7Stellungen += 1
        if (JSON.stringify(gestoert) === JSON.stringify(z)) summe.k7Unveraendert += 1
        if (JSON.stringify(sichtFuer(gestoert, sitz)) !== JSON.stringify(sichtFuer(z, sitz))) summe.k7SichtAnders += 1
        const a1 = planeZug(sichtFuer(z, sitz), ermittleAktionen(z), erzeugeZufall(4242)).aktion
        const a2 = planeZug(sichtFuer(gestoert, sitz), ermittleAktionen(gestoert), erzeugeZufall(4242)).aktion
        if (JSON.stringify(a1) !== JSON.stringify(a2)) {
          summe.k7Abweichung += 1
          log(`K7 ABWEICHUNG ${wo}: ${kurz(a1)} gegen ${kurz(a2)}`)
        }
      }
      // K8 mit eigener Zählung
      const abschriften = structuredClone(aktionen)
      zaehler.n = 0
      const t0 = performance.now()
      const plan = planeZug(sichtFuer(z, sitz), abschriften, kiZufall)
      const ms = performance.now() - t0
      const gezaehlt = zaehler.n
      const { suche, vorauswahl, angeboten } = plan.bewertungen
      if (gezaehlt !== suche + vorauswahl) {
        summe.k8Abweichung += 1
        log(`K8 ZAEHLER ${wo}: eigen ${gezaehlt}, Plan ${suche}+${vorauswahl}`)
      }
      summe.k8MaxSuche = Math.max(summe.k8MaxSuche, suche)
      summe.k8MaxVorauswahl = Math.max(summe.k8MaxVorauswahl, vorauswahl)
      if (vorauswahl > angeboten) summe.k8VorauswahlUeber += 1
      if (suche > 64 || suche > GRENZE_SUCHE) log(`K8 GRENZE ${wo}: Suche ${suche}`)
      summe.k8MaxMs = Math.max(summe.k8MaxMs, ms)
      if (ms >= 500) log(`K8 ZEIT ${wo}: ${ms.toFixed(1)} ms`)
      const stelle = abschriften.indexOf(plan.aktion)
      if (stelle < 0 || !pruefeAktion(z, aktionen[stelle]).erlaubt) {
        summe.k8Unerlaubt += 1
        log(`K8 UNERLAUBT ${wo}`)
      }
      aktion = aktionen[Math.max(stelle, 0)]
      // Zugende
      if (aktion.typ === 'ZugBeenden' && z.zug.abschnitt === 'Ausspielen') {
        summe.zugenden += 1
        const halten = bew(z, sitz)
        const vorher = endwertung(z)
        for (const b of aktionen) {
          if (b.typ === 'ZugBeenden') continue
          const s = durchlassen(z, b, sitz).zustand
          const nach = endwertung(s)
          if (nach[sitz] < vorher[sitz] + 1) continue
          if (nach.some((p, i) => i !== sitz && p > vorher[i])) continue
          const w = bew(s, sitz)
          if (w >= halten - GLEICH) {
            summe.zugendenLiegen += 1
            log(`ZUGENDE LIEGEN ${wo}: ${kurz(b)} ${vorher[sitz]}->${nach[sitz]}, Bewertung ${w.toFixed(4)} gegen Halten ${halten.toFixed(4)}`)
            break
          } else {
            summe.zugendenHaltenBesser += 1
          }
        }
      }
      // K2.1 auswerten
      if (offen !== null && z.zug.teilzug === 1 && z.zug.spielerIndex === sitz) {
        if (aktion.typ !== 'ZugBeenden' && gruppen(durchlassen(z, aktion, sitz).zustand, sitz) > gruppen(z, sitz)) offen.versucht = true
        if (aktion.typ === 'ZugBeenden') {
          summe.k21Moeglich += 1
          const g = gruppen(z, sitz)
          if (g > offen.g0) summe.k21Vollendet += 1
          else if (offen.versucht) {
            summe.k21Versucht += 1
            log(`K2.1 versucht ${wo} (Beginn ${offen.schritt}): Vollendung gespielt, abgewehrt`)
          } else if (offen.abgewehrt) {
            summe.k21Abgewehrt += 1
            log(`K2.1 abgewehrt ${wo} (Beginn ${offen.schritt}): andere Karte abgewehrt, Plan nicht nachrechenbar`)
          } else {
            const gewaehlt = bew(z, sitz)
            const differenz = gewaehlt - offen.best.wert
            if (differenz > GLEICH) {
              summe.k21Ausnahme += 1
              log(`K2.1 ok ${wo} (Beginn ${offen.schritt}): gewählt ${gewaehlt.toFixed(4)} End ${endwertung(z)[sitz]}, Vollendung ${offen.best.wert.toFixed(4)} End ${offen.best.ende} (${offen.best.beschreibung}), Abstand ${differenz.toFixed(4)}`)
            } else {
              summe.k21Verstoss += 1
              log(`K2.1 VERSTOSS ${wo} (Beginn ${offen.schritt}): gewählt ${gewaehlt.toFixed(6)} End ${endwertung(z)[sitz]}, Vollendung ${offen.best.wert.toFixed(6)} End ${offen.best.ende} (${offen.best.beschreibung}), Differenz ${differenz.toExponential(3)}`)
            }
          }
          offen = null
        }
      }
    } else {
      aktion = STRATEGIEN.zufallsKi === undefined ? aktionen[0] : zufallsKis[e.index].waehle(sichtFuer(z, e.index), structuredClone(aktionen))
      const stelle = aktionen.findIndex((x) => JSON.stringify(x) === JSON.stringify(aktion))
      aktion = aktionen[stelle]
      if (offen !== null && aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null) offen.abgewehrt = true
    }
    // Zug der KI zu Ende ohne Zugbeenden in Teilzug 1 (etwa Partieende)
    z = anwendeAktion(z, aktion).zustand
    summe.schritte += 1
    if (offen !== null && z.zug.spielerIndex !== sitz) {
      log(`K2.1 ohne Zugende ${wo}`)
      offen = null
    }
  }
  const ende = endwertung(z)
  summe.partien += 1
  summe.punkte.push(`n=${n} erw=${erw} saat=${saat} sitz=${sitz}: solide ${ende[sitz]}, andere ${ende.filter((_, i) => i !== sitz).join('/')}, Phase ${z.partiephase}`)
  log(summe.punkte[summe.punkte.length - 1])
}

describe('Prüfer K2 Iteration 4', () => {
  it('eigenes Turnier', () => {
    writeFileSync(LOG, '')
    const summe = neueSumme()
    for (const n of SPIELER) {
      for (const erw of [false, true]) {
        for (let i = 0; i < PARTIEN; i += 1) spielePartie(n, erw, 12000 + 100 * n + (erw ? 50 : 0) + i, summe)
      }
    }
    const { punkte, ...rest } = summe
    log('SUMME ' + JSON.stringify(rest))
    log('FELDER ' + JSON.stringify([...felder.entries()]))
    expect(summe.partien).toBeGreaterThan(0)
  }, 3_600_000)
})
