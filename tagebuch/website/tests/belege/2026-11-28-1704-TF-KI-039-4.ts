// @vitest-environment node
import { appendFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { aufgabenwert, entscheidungenVon, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import type { Entscheidung } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { STRATEGIEN } from './index'
import { ziehtVerdeckt } from './ziehen'

/*
Prüfer K4, Iteration 2, Kriterium 1 mit eigenen Saaten. Anders als der Test der Umsetzung
an JEDER Entscheidung im sicheren Teil eines Zuges (nicht nur am Anfang): Gibt es eine
Aktion ohne verdeckte Karte, die eine offene oder die eigene geheime Aufgabe erfüllt, und
erfüllt die KI im Rest des Zuges keine (und versucht es nicht gegen eine Abwehr), muss ihr
Zugende strikt besser bewertet sein als jede Erfüllung samt zweiter Karte.
Temporäre Probe, wird nach der Messung gelöscht.
*/

const ERSTE = Number(process.env.P2_ERSTE ?? '0')
const ANZAHL = Number(process.env.P2_ANZAHL ?? '0')
const AUSGABE = process.env.P2_AUSGABE ?? ''
const MODUS = process.env.P2_MODUS ?? 'zufall'

const verdeckt = (aktion: SpielAktion) => aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)
const OHNE = (aktion: SpielAktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen' && !verdeckt(aktion)

function wert(start: Spielzustand, zustand: Spielzustand): number {
  return bewerte(sichtFuer(zustand, 0)) + aufgabenwert(start, zustand, 0)
}
function aufgaben(start: Spielzustand, zustand: Spielzustand): number {
  const { erfuellteAufgaben, geheimeAufgabe, geheimeAufgabeErfuellt } = zustand.spieler[0]
  return erfuellteAufgaben.reduce((s, a) => s + a.punkte, 0) + (geheimeAufgabeErfuellt && geheimeAufgabe !== null ? geheimeAufgabe.punkte : 0) + aufgabenwert(start, zustand, 0)
}

function zuege(entscheidungen: readonly Entscheidung[]): Entscheidung[][] {
  const ergebnis: Entscheidung[][] = [[]]
  for (const e of entscheidungen) {
    if (e.aktion.typ === 'Reagieren') continue
    ergebnis[ergebnis.length - 1].push(e)
    if (e.nachher.zug.spielerIndex !== 0 || e.nachher.partiephase === 'Beendet') ergebnis.push([])
  }
  return ergebnis.filter((zug) => zug.length > 0 && zug[0].vorher.zug.spielerIndex === 0)
}

describe('Prüfer K4 Iteration 2: Kriterium 1', () => {
  it('misst', () => {
    expect(AUSGABE, 'P2_AUSGABE fehlt').not.toBe('')
    for (let saat = ERSTE; saat < ERSTE + ANZAHL; saat += 1) {
      const spielerzahl = 2 + (saat % 3)
      const kis = Array.from({ length: spielerzahl }, (_, sitz) =>
        sitz === 0 || MODUS === 'solide' ? STRATEGIEN.solideKi(erzeugeZufall((saat * 17 + sitz) >>> 0)) : STRATEGIEN.zufallsKi(erzeugeZufall((saat * 19 + sitz) >>> 0)),
      )
      let geprueft = 0
      let erfuellt = 0
      let ausnahme = 0
      const verstoesse: unknown[] = []
      const ausnahmen: unknown[] = []
      for (const zug of zuege(entscheidungenVon({ spielerzahl, erweiterung: true, saat }, kis, 0))) {
        const beginn = zug.findIndex(({ aktion }) => aktion.typ !== 'RisikoKarteSpielen' && aktion.typ !== 'Entscheiden')
        if (beginn < 0) continue
        const rest = zug.slice(beginn)
        const schluss = rest.findIndex(({ aktion }) => aktion.typ === 'ZugBeenden' || verdeckt(aktion))
        const teil = schluss < 0 ? rest : rest.slice(0, schluss)
        const ende = schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher
        for (let i = 0; i < teil.length; i += 1) {
          const start = teil[i].vorher
          if (start.zug.spielerIndex !== 0 || start.schwebend !== null || start.entscheidung !== null) continue
          const vorher = aufgaben(start, start)
          const erfuellend = ermittleAktionen(start).filter(OHNE).map((a) => ({ a, danach: nachDurchlassen(start, a, 0) })).filter(({ danach }) => aufgaben(start, danach) > vorher)
          if (erfuellend.length === 0) continue
          geprueft += 1
          const versucht = teil.slice(i).some(({ aktion, vorher: davor }) => OHNE(aktion) && aufgaben(start, nachDurchlassen(davor, aktion, 0)) > aufgaben(start, davor))
          if (aufgaben(start, ende) > vorher || versucht) {
            erfuellt += 1
            break
          }
          const beste = Math.max(...erfuellend.flatMap(({ danach }) => mitZweiterKarte(danach, 0)).map((d) => wert(start, d)))
          const gewaehlt = wert(start, ende)
          const eintrag = { saat, stelle: i, gewaehlt: Number(gewaehlt.toFixed(3)), beste: Number(beste.toFixed(3)), kiZug: teil.slice(i).map((t) => t.aktion.typ), erfuellend: [...new Set(erfuellend.map(({ a }) => a.typ))] }
          if (gewaehlt > beste + 1e-9) {
            ausnahme += 1
            ausnahmen.push(eintrag)
          } else verstoesse.push(eintrag)
          break
        }
      }
      appendFileSync(AUSGABE, JSON.stringify({ saat, spielerzahl, modus: MODUS, geprueft, erfuellt, ausnahme, verstoesse, ausnahmen }) + '\n')
    }
  }, 6 * 3600_000)
})
