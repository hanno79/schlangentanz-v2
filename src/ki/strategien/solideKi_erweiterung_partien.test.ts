// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { aufgabenwert, entscheidungenVon, gruppenzahl, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import type { Entscheidung } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'
import { ziehtVerdeckt } from './ziehen'
import { erstelleZufallsKi } from './zufallsKi'

/*
K4, Kriterien 1 bis 3, als Eigenschaften in Partien mit Erweiterung: die solide KI an
Stelle 0 gegen Zufalls-KIs, 2 bis 4 Spieler. Bewertet wird wie in der Zugsuche, mit den
Aufgaben, die sie erfüllt und noch nicht hat (`aufgabenwert`). Was eine verdeckte Karte
entscheidet (Risiko-Prüfung, verdecktes Ziehen), sieht die KI bei ihrer Wahl nicht (B2);
gemessen wird deshalb ab dem Stand nach einer Risiko-Karte und nur bis vor das nächste
verdeckte Ziehen.
*/

const PARTIEN = [2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 4].map((spielerzahl, nummer) => ({ spielerzahl, erweiterung: true, saat: 4400 + nummer }))
const ENTSCHEIDUNGEN: Entscheidung[][] = PARTIEN.map((partie, nummer) =>
  entscheidungenVon(
    partie,
    Array.from({ length: partie.spielerzahl }, (_, sitz) => (sitz === 0 ? erstelleSolideKi(erzeugeZufall(nummer + 40)) : erstelleZufallsKi(erzeugeZufall(300 * nummer + sitz)))),
    0,
  ),
)

/** Die Entscheidungen einer Partie, Zug für Zug: ein Zug endet mit „Zug beenden“ oder dem Abwerfen danach. */
function zuege(entscheidungen: readonly Entscheidung[]): Entscheidung[][] {
  const ergebnis: Entscheidung[][] = [[]]
  for (const entscheidung of entscheidungen) {
    if (entscheidung.aktion.typ === 'Reagieren') continue
    ergebnis[ergebnis.length - 1].push(entscheidung)
    if (entscheidung.nachher.zug.spielerIndex !== 0 || entscheidung.nachher.partiephase === 'Beendet') ergebnis.push([])
  }
  return ergebnis.filter((zug) => zug.length > 0 && zug[0].vorher.zug.spielerIndex === 0)
}

const ZUEGE = ENTSCHEIDUNGEN.flatMap(zuege)

/** Ob eine verdeckte Karte über die Aktion entscheidet: Risiko-Prüfung (A8.2) oder verdecktes Ziehen (D43, D49), wie die Zugsuche es sieht. */
function verdeckt(aktion: SpielAktion): boolean {
  return aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)
}

/** Die Bewertung der Zugsuche ab `start`, auf dem echten Zustand. */
function wert(start: Spielzustand, zustand: Spielzustand): number {
  return bewerte(sichtFuer(zustand, 0)) + aufgabenwert(start, zustand, 0)
}

/** Die Punkte der Aufgaben, die in `start` bekannt sind und die Stelle 0 in `zustand` hat oder noch einlösen kann (A9, D35). */
function aufgaben(start: Spielzustand, zustand: Spielzustand): number {
  const { erfuellteAufgaben, geheimeAufgabe, geheimeAufgabeErfuellt } = zustand.spieler[0]
  const geheim = geheimeAufgabeErfuellt && geheimeAufgabe !== null ? geheimeAufgabe.punkte : 0
  return erfuellteAufgaben.reduce((summe, aufgabe) => summe + aufgabe.punkte, 0) + geheim + aufgabenwert(start, zustand, 0)
}

/** Der Teil des Zuges, über den sie ohne verdeckte Karte entschied: nach einer Risiko-Karte samt Wahlen, bis vor das nächste verdeckte Ziehen oder „Zug beenden“. */
function sichererTeil(zug: readonly Entscheidung[]): { teil: Entscheidung[]; ende: Spielzustand } | null {
  const beginn = zug.findIndex(({ aktion }) => aktion.typ !== 'RisikoKarteSpielen' && aktion.typ !== 'Entscheiden')
  if (beginn < 0) return null
  const rest = zug.slice(beginn)
  const schluss = rest.findIndex(({ aktion }) => aktion.typ === 'ZugBeenden' || verdeckt(aktion))
  const teil = schluss < 0 ? rest : rest.slice(0, schluss)
  return { teil, ende: schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher }
}

const OHNE_VERDECKTES = (aktion: SpielAktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen' && !verdeckt(aktion)

describe('K4 Kriterium 1 in Partien: Fehlt ihr eine Karte zu einer Aufgabe und hält sie sie, spielt sie sie', () => {
  it('K4.1: in jedem Zug, in dem eine Handkarte eine offene oder ihre geheime Aufgabe erfüllte, erfüllt sie eine, versucht es gegen eine Abwehr, oder ihr Zug ist strikt besser bewertet als jede Erfüllung samt zweiter Karte', () => {
    let geprueft = 0
    let erfuellt = 0
    for (const zug of ZUEGE) {
      const sicher = sichererTeil(zug)
      if (sicher === null || sicher.teil.length === 0) continue
      const start = sicher.teil[0].vorher
      const vorher = aufgaben(start, start)
      const erfuellend = ermittleAktionen(start)
        .filter(OHNE_VERDECKTES)
        .map((aktion) => nachDurchlassen(start, aktion, 0))
        .filter((danach) => aufgaben(start, danach) > vorher)
      if (erfuellend.length === 0) continue
      geprueft += 1
      // Eine Erfüllung, die ein Gegner mit Farbenschutz abwehrte, zählt als versucht (A6, A7.2).
      const versucht = sicher.teil.some(({ aktion, vorher: davor }) => OHNE_VERDECKTES(aktion) && aufgaben(start, nachDurchlassen(davor, aktion, 0)) > aufgaben(start, davor))
      if (aufgaben(start, sicher.ende) > vorher || versucht) {
        erfuellt += 1
        continue
      }
      const beste = Math.max(...erfuellend.flatMap((danach) => mitZweiterKarte(danach, 0)).map((danach) => wert(start, danach)))
      expect(wert(start, sicher.ende), `K4.1: Zug ab ${JSON.stringify(sicher.teil[0].aktion)}, beste Erfüllung ${beste.toFixed(2)}`).toBeGreaterThan(beste + 1e-9)
    }
    expect(geprueft, 'K4.1: genug Züge mit einer Aufgabe in Reichweite').toBeGreaterThan(15)
    expect(erfuellt, 'K4.1: in den meisten erfüllt sie die Aufgabe selbst').toBeGreaterThan(0.5 * geprueft)
  }, 240_000)
})

describe('K4 Kriterium 2 in Partien: Comeback-Karte, Risiko-Karte und Schlangenkorb, wenn die Bewertung steigt', () => {
  const eingesetzt = ZUEGE.flatMap((zug) =>
    zug.flatMap((entscheidung, stelle) => (entscheidung.aktion.typ === 'ComebackEinsetzen' || entscheidung.aktion.typ === 'SchlangenkorbSpielen' || entscheidung.aktion.typ === 'RisikoKarteSpielen' ? [{ zug, stelle, entscheidung }] : [])),
  )

  it('K4.2: sie setzt in den Partien Comeback-Karten, Risiko-Karten und den Schlangenkorb ein', () => {
    const zahl = (typ: SpielAktion['typ']) => eingesetzt.filter(({ entscheidung }) => entscheidung.aktion.typ === typ).length
    expect(zahl('ComebackEinsetzen'), 'K4.2: Comeback-Karten').toBeGreaterThan(0)
    expect(zahl('RisikoKarteSpielen'), 'K4.2: Risiko-Karten').toBeGreaterThan(5)
    expect(zahl('SchlangenkorbSpielen'), 'K4.2: Schlangenkörbe').toBeGreaterThan(0)
  })

  it('K4.2: nach jeder Comeback-Karte und jedem Korb, über den keine verdeckte Karte entscheidet, ist sie bis zum Ende des Zuges besser bewertet als beim Beenden davor', () => {
    let geprueft = 0
    for (const { zug, stelle, entscheidung } of eingesetzt) {
      if (verdeckt(entscheidung.aktion)) continue
      const rest = zug.slice(stelle)
      const schluss = rest.findIndex(({ aktion }, index) => index > 0 && (aktion.typ === 'ZugBeenden' || verdeckt(aktion)))
      const ende = schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher
      const start = entscheidung.vorher
      geprueft += 1
      expect(wert(start, ende), `K4.2: ${JSON.stringify(entscheidung.aktion)} bis ${JSON.stringify(rest.map(({ aktion }) => aktion.typ))}`).toBeGreaterThan(wert(start, start) + 1e-9)
    }
    expect(geprueft, 'K4.2: genug Einsätze ohne verdeckte Karte').toBeGreaterThan(0)
  })
})

describe('K4 Kriterium 3 in Partien: Schlangenhäutungen bilden neue Gruppen', () => {
  it('K4.3: keine Schlangenhäutung in einer eigenen Schlange senkt ihre Bewertung; kostet sie eine Gruppe, erfüllt sie dafür eine Aufgabe; in den Partien bilden ihre Häutungen neue Gruppen', () => {
    const haeutungen = ZUEGE.flat().filter(({ aktion, vorher }) => aktion.typ === 'SchlangenhaeutungSpielen' && vorher.spieler[0].schlangen.some((schlange) => schlange.id === aktion.schlangenId))
    for (const { aktion, vorher } of haeutungen) {
      const danach = nachDurchlassen(vorher, aktion, 0)
      expect(wert(vorher, danach), `K4.3: ${JSON.stringify(aktion)}`).toBeGreaterThanOrEqual(wert(vorher, vorher) - 1e-9)
      if (gruppenzahl(danach, 0) < gruppenzahl(vorher, 0)) expect(aufgaben(vorher, danach), `K4.3, A9: ${JSON.stringify(aktion)} kostet eine Gruppe`).toBeGreaterThan(aufgaben(vorher, vorher))
    }
    const mitNeuer = haeutungen.filter(({ aktion, vorher }) => gruppenzahl(nachDurchlassen(vorher, aktion, 0), 0) > gruppenzahl(vorher, 0))
    expect(mitNeuer.length, `K4.3: Häutungen mit neuer Gruppe, von ${haeutungen.length} in eigenen Schlangen`).toBeGreaterThan(0)
  })
})
