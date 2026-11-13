import { describe, expect, it } from 'vitest'
import { werteSchlangen } from '../jokerGruppen'
import type { Farbe, FarbkarteInfo, Schlange, Spielkarte } from '../index'
import { erzeugeZufall } from '../testing/zufall'
import { endwertung, jokerfarben } from './wertung_hilfe'

/*
E10, Kriterien 3 und 8 mit Kombinatorik: Mehrere Joker in einem oder zwei
Schlangen. Ein unabhängiger Vergleich probiert jede Farbbelegung aller Joker
durch (6^k) und nimmt die mit der höchsten Summe (A11: Gruppenpunkte, mit
Erweiterung plus Vielfaltbonus); bei gleicher Summe die mit mehr Jokern in einer
Gruppe, dann die erste in fester Reihenfolge (Kriterium 8). Die Wertung muss
dieselbe Summe und dieselben Jokerfarben liefern. Die Schlangen sind hier frei
erfunden, nicht aus dem Material: Die Wertung einer Schlange hängt nicht davon ab.
*/

const FARBEN: Farbe[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün']
const PUNKTE: Record<Farbe, number> = { Blau: 1, Rot: 1, Gelb: 1, Violett: 2, Braun: 2, Grün: 3 }

type Glied = Farbe | 'R' | 'B' | { f: Farbe }

function baue(glieder: Glied[][]): Schlange[] {
  let nr = 0
  const farbkarte = (farbe: Farbe): FarbkarteInfo => ({ typ: 'Farbkarte', id: `k${nr++}`, farbe, punkte: PUNKTE[farbe] })
  return glieder.map((liste, s) => {
    const schlange: Schlange = { id: `s${s}`, karten: [], fusionen: [] }
    for (const glied of liste) {
      if (glied === 'R') schlange.karten.push({ typ: 'Sonderkarte', id: `k${nr++}`, name: 'Regenbogenschlange' })
      else if (glied === 'B') schlange.karten.push({ typ: 'Sonderkarte', id: `k${nr++}`, name: 'Schlangenblockade' })
      else if (typeof glied === 'object') {
        const karte: Spielkarte = { typ: 'Sonderkarte', id: `k${nr++}`, name: 'Farbenfusion' }
        schlange.karten.push(karte)
        schlange.fusionen.push({ karteId: karte.id, unter: [farbkarte(glied.f), farbkarte(glied.f)] })
      } else schlange.karten.push(farbkarte(glied))
    }
    return schlange
  })
}

function vielfalt(anzahl: number): number {
  return anzahl >= 5 ? 4 : Math.max(0, anzahl - 1)
}

/** Gruppen ab 3 gleichfarbigen Gliedern; `null` heisst: unterbricht. */
function scanne(farben: Array<Farbe | null>, punkte: number[]): { punkte: number; farben: Set<Farbe>; inGruppe: boolean[] } {
  let summe = 0
  const gefunden = new Set<Farbe>()
  const inGruppe = farben.map(() => false)
  let i = 0
  while (i < farben.length) {
    const farbe = farben[i]
    let j = i
    while (j < farben.length && farbe !== null && farben[j] === farbe) j++
    if (farbe !== null && j - i >= 3) {
      for (let k = i; k < j; k++) {
        summe += punkte[k]
        inGruppe[k] = true
      }
      gefunden.add(farbe)
    }
    i = Math.max(j, i + 1)
  }
  return { punkte: summe, farben: gefunden, inGruppe }
}

function durchprobieren(schlangen: Schlange[], mitVielfalt: boolean): { summe: number; joker: Array<Farbe | null> } {
  const joker = schlangen.flatMap((s) => s.karten.filter((k) => k.typ === 'Sonderkarte' && k.name !== 'Schlangenblockade'))
  let beste: { summe: number; inGruppe: number; joker: Array<Farbe | null> } | null = null
  for (let n = 0; n < 6 ** joker.length; n++) {
    const wahl = new Map<string, Farbe>()
    joker.forEach((karte, index) => wahl.set(karte.id, FARBEN[Math.floor(n / 6 ** (joker.length - 1 - index)) % 6]))
    let punkte = 0
    let bonus = 0
    const jokerInGruppe = new Map<string, boolean>()
    for (const schlange of schlangen) {
      const farben = schlange.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe : (wahl.get(k.id) ?? null)))
      const werte = schlange.karten.map((k) => {
        if (k.typ === 'Farbkarte') return k.punkte
        const fusion = schlange.fusionen.find((f) => f.karteId === k.id)
        return fusion === undefined ? 0 : fusion.unter[0].punkte + fusion.unter[1].punkte
      })
      const ergebnis = scanne(farben, werte)
      punkte += ergebnis.punkte
      bonus = Math.max(bonus, vielfalt(ergebnis.farben.size))
      schlange.karten.forEach((k, i) => jokerInGruppe.set(k.id, ergebnis.inGruppe[i]))
    }
    const summe = punkte + (mitVielfalt ? bonus : 0)
    const inGruppe = joker.filter((k) => jokerInGruppe.get(k.id)).length
    if (beste === null || summe > beste.summe || (summe === beste.summe && inGruppe > beste.inGruppe)) {
      beste = { summe, inGruppe, joker: joker.map((k) => (jokerInGruppe.get(k.id) ? (wahl.get(k.id) as Farbe) : null)) }
    }
  }
  if (beste === null) throw new Error('keine Belegung')
  return { summe: beste.summe, joker: beste.joker }
}

function zufallsSchlangen(zufall: () => number): Glied[][] {
  const wahl = <T,>(liste: readonly T[]): T => liste[Math.floor(zufall() * liste.length)]
  let joker = 0
  return Array.from({ length: 1 + Math.floor(zufall() * 2) }, () =>
    Array.from({ length: 1 + Math.floor(zufall() * 10) }, (): Glied => {
      const r = zufall()
      if (r < 0.2 && joker < 4) {
        joker += 1
        return zufall() < 0.5 ? 'R' : { f: wahl(FARBEN) }
      }
      if (r < 0.25) return 'B'
      return wahl(FARBEN.slice(0, 2 + Math.floor(zufall() * 4)))
    }),
  )
}

describe('A11/A7.3/A7.7: mehrere Joker, gegen vollständiges Durchprobieren geprüft', () => {
  it.each([false, true])('A11: 400 zufällige Auslagen mit bis zu 4 Jokern, Vielfaltbonus %s: gleiche Summe, gleiche Jokerfarben', (mitVielfalt) => {
    const zufall = erzeugeZufall(mitVielfalt ? 1010 : 2020)
    for (let fall = 0; fall < 400; fall++) {
      const glieder = zufallsSchlangen(zufall)
      const schlangen = baue(glieder)
      const ergebnis = werteSchlangen(schlangen, mitVielfalt)
      const erwartet = durchprobieren(schlangen, mitVielfalt)
      const beschreibung = JSON.stringify(glieder)
      expect(ergebnis.gruppenPunkte + (ergebnis.vielfaltBonus ?? 0), beschreibung).toBe(erwartet.summe)
      expect(ergebnis.schlangen.flatMap((s) => s.joker.map((j) => j.farbe)), beschreibung).toEqual(erwartet.joker)
    }
  })

  it('A11: drei Joker nebeneinander zwischen zwei Gruppen werden gemeinsam am besten verteilt', () => {
    const schlangen = baue([['Grün', 'Grün', 'R', { f: 'Blau' }, 'R', 'Violett', 'Violett']])
    const ergebnis = werteSchlangen(schlangen, false)
    expect(ergebnis.gruppenPunkte).toBe(durchprobieren(schlangen, false).summe)
    expect(ergebnis.gruppenPunkte).toBe(6 + 2 + 4)
    expect(ergebnis.schlangen[0].joker.map((j) => j.farbe)).toEqual(['Grün', 'Violett', 'Violett'])
  })

  it('A11: ein Spieler mit allen 8 Jokern in zwei langen Schlangen wird schnell gewertet', () => {
    const lang = (start: number): Glied[] =>
      Array.from({ length: 40 }, (_, i): Glied => FARBEN[Math.floor((i + start) / 2) % 6])
    const eins = lang(0)
    const zwei = lang(3)
    ;[5, 13, 21, 29].forEach((stelle) => (eins[stelle] = 'R'))
    ;[6, 14, 22, 30].forEach((stelle, i) => (zwei[stelle] = { f: FARBEN[i] }))
    const schlangen = baue([eins, zwei])
    const anfang = performance.now()
    for (let i = 0; i < 10; i++) werteSchlangen(schlangen, true)
    const dauer = (performance.now() - anfang) / 10
    expect(dauer, `eine Wertung dauerte ${dauer.toFixed(1)} ms`).toBeLessThan(100)
  })

  it('A11: aus echtem Material, alle 4 Regenbogenschlangen und 4 Farbenfusionen bei einem Spieler', () => {
    const wertung = endwertung(true, [
      [
        ['Rot', 'Rot', 'Regenbogenschlange', 'Regenbogenschlange', 'Gelb', 'Gelb', 'Regenbogenschlange', 'Blau', 'Regenbogenschlange', 'Blau'],
        ['Violett', { fusion: ['Rot', 'Rot'] }, { fusion: ['Gelb', 'Gelb'] }, 'Braun', 'Braun', { fusion: ['Blau', 'Blau'] }, { fusion: ['Grün', 'Grün'] }, 'Grün'],
      ],
    ]).spieler[0]
    expect(wertung.schlangen.flatMap((s) => s.joker)).toHaveLength(8)
    // Schlange 1: Rot-Rot-R-R, Gelb-Gelb-R, Blau-R-Blau (6 Punkte, 3 Farben, Bonus 2); die zweite Regenbogenschlange
    // bringt nichts, verlängert aber die rote Gruppe (feste Wahl: möglichst viele Joker in Gruppen). Schlange 2: zwei Fusionen mit Braun-Braun (2 + 2 + 4 = 8), zwei Fusionen mit Grün
    // (2 + 6 + 3 = 11); Violett bleibt allein. Violett mit zwei Fusionen und Braun mit zwei Fusionen brächte nur 18.
    expect(jokerfarben(wertung)).toEqual(['Rot', 'Rot', 'Gelb', 'Blau', 'Braun', 'Braun', 'Grün', 'Grün'])
    expect(wertung.schlangen.map((s) => s.vielfaltFarben)).toEqual([
      ['Blau', 'Rot', 'Gelb'],
      ['Braun', 'Grün'],
    ])
    expect(wertung.schlangen.map((s) => s.gruppenPunkte)).toEqual([6, 19])
    expect(wertung.vielfaltBonus).toBe(2)
  })
})
