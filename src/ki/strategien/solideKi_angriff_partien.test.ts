// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine'
import { sichtFuer } from '../sicht'
import { entscheidungenVon, nachDurchlassen } from '../__tests__/stellungen'
import type { Entscheidung } from '../__tests__/stellungen'
import { erstelleSolideKiK2 } from '../__tests__/k2stand/solideKi'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'

/*
K3, Kriterien 2, 3 und 5 in Partien: die solide KI an Stelle 0 gegen die solide KI im
Stand von K2, 2 bis 4 Spieler, mit und ohne Erweiterung. Gezählt wird jede
Entscheidung der soliden KI. „Führend“ ist der Gegner mit der höchsten Endwertung
(A11) im Moment der Entscheidung; Punkte zählen, wie die Engine sie rechnet.
*/

const PARTIEN = Array.from({ length: 18 }, (_, nummer) => ({ spielerzahl: 2 + (nummer % 3), erweiterung: nummer % 2 === 1, saat: 42_000 + nummer }))
const ENTSCHEIDUNGEN: Entscheidung[][] = PARTIEN.map(({ spielerzahl, erweiterung, saat }) =>
  entscheidungenVon(
    { spielerzahl, erweiterung, saat },
    Array.from({ length: spielerzahl }, (_, sitz) => (sitz === 0 ? erstelleSolideKi(erzeugeZufall(saat * 3 + 1)) : erstelleSolideKiK2(erzeugeZufall(saat * 5 + sitz)))),
    0,
  ),
)
const ALLE = ENTSCHEIDUNGEN.flat()

const end = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].summe
/** Die eigenen Punkte ohne Aufgaben: Gruppen, Vielfaltbonus, Kettenbonus (A11). */
const punkte = (zustand: Spielzustand, sitz: number) => {
  const wertung = berechneEndwertung(zustand).spieler[sitz]
  return wertung.summe - wertung.aufgabenPunkte
}
const gegner = (zustand: Spielzustand) => zustand.spieler.map((_, sitz) => sitz).filter((sitz) => sitz !== 0)
/** Die Gegner mit der höchsten Endwertung, bei Gleichstand alle. */
function fuehrende(zustand: Spielzustand): number[] {
  const hoechste = Math.max(...gegner(zustand).map((sitz) => end(zustand, sitz)))
  return gegner(zustand).filter((sitz) => end(zustand, sitz) === hoechste)
}
/** Wie weit der stärkste Gegner vor der KI liegt (Endwertung). */
const vorsprung = (zustand: Spielzustand) => Math.max(...gegner(zustand).map((sitz) => end(zustand, sitz))) - end(zustand, 0)
/** Die Gegner, die eine Sonderkarte der KI fragt (A6, D33); leer für alles, was keinen Gegner trifft. */
function getroffen(zustand: Spielzustand, aktion: SpielAktion): number[] {
  if (aktion.typ === 'ZugBeenden' || aktion.typ === 'UeberhandAbwerfen' || aktion.typ === 'Reagieren' || aktion.typ === 'FarbkarteLegen') return []
  return anwendeAktion(zustand, aktion).zustand.schwebend?.ausstehend ?? []
}

describe('K3 Kriterium 2 in Partien: Schlangenblockade und Farbendieb treffen dort, wo der Führende am meisten verliert', () => {
  it('K3.2: jede Blockade und jeder Farbendieb gegen einen Gegner lässt dem stärksten Gegner den kleinsten Vorsprung, den diese Karte zulässt, oder ist nachweislich besser bewertet', () => {
    let geprueft = 0
    const ausnahmen: string[] = []
    for (const { vorher, aktion } of ALLE) {
      if ((aktion.typ !== 'BlockadeLegen' && aktion.typ !== 'FarbendiebSpielen') || getroffen(vorher, aktion).length === 0) continue
      geprueft += 1
      const varianten = ermittleAktionen(vorher)
        .filter((angeboten) => 'karteId' in angeboten && angeboten.karteId === aktion.karteId && getroffen(vorher, angeboten).length > 0)
        .map((angeboten) => {
          const danach = nachDurchlassen(vorher, angeboten, 0)
          return { angeboten, vorsprung: vorsprung(danach), wert: bewerte(sichtFuer(danach, 0)) }
        })
      const kleinster = varianten.reduce((beste, variante) => (variante.vorsprung < beste.vorsprung ? variante : beste))
      const gewaehlt = varianten.find((variante) => JSON.stringify(variante.angeboten) === JSON.stringify(aktion))!
      if (gewaehlt.vorsprung === kleinster.vorsprung) continue
      // Ausnahme wie in K2.1: Die eigene Bewertung (Aussichten, Hand, alle Gegner) stellt den gewählten Zug strikt höher.
      const zahlen = `${aktion.typ}: Vorsprung ${gewaehlt.vorsprung} statt ${kleinster.vorsprung}, Bewertung ${gewaehlt.wert.toFixed(2)} gegen ${kleinster.wert.toFixed(2)}`
      expect(gewaehlt.wert, `K3.2: ${zahlen}`).toBeGreaterThan(kleinster.wert + 1e-9)
      ausnahmen.push(zahlen)
    }
    expect(geprueft, 'K3.2: genug Blockaden und Farbendiebe gegen Gegner').toBeGreaterThan(30)
    expect(ausnahmen.length, `K3.2: Ausnahmen ${ausnahmen.join(' | ')}`).toBeLessThanOrEqual(Math.floor(0.2 * geprueft))
  }, 120_000)
})

describe('K3 Kriterium 3 in Partien: eine Farbkarte beim Gegner nur, wenn die eigene Hand nichts Besseres hergibt', () => {
  it('K3.3: legt sie eine Farbkarte in eine gegnerische Schlange, hebt keine angebotene Farbkarte in eine eigene Schlange ihre Punkte', () => {
    const gestoert = ALLE.filter(
      ({ vorher, aktion }) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && !vorher.spieler[0].schlangen.some((schlange) => aktion.ziel.art === 'schlange' && schlange.id === aktion.ziel.schlangenId),
    )
    for (const { vorher, aktion } of gestoert) {
      const eigene = new Set(vorher.spieler[0].schlangen.map((schlange) => schlange.id))
      const besser = ermittleAktionen(vorher).filter(
        (angeboten) =>
          angeboten.typ === 'FarbkarteLegen' &&
          (angeboten.ziel.art === 'neueSchlange' || eigene.has(angeboten.ziel.schlangenId)) &&
          punkte(anwendeAktion(vorher, angeboten).zustand, 0) > punkte(vorher, 0),
      )
      expect(besser, `K3.3: statt ${JSON.stringify(aktion)}`).toEqual([])
    }
    expect(gestoert.length, 'K3.3: genug störende Farbkarten').toBeGreaterThan(20)
  })
})

describe('K3 Kriterium 5 in Partien: bei 3 und 4 Spielern greift sie bevorzugt den Führenden an', () => {
  it('K3.5: die meisten ihrer Sonderkarten gegen Gegner treffen einen Führenden, und mehr als jeden anderen Gegner', () => {
    let angriffe = 0
    let aufFuehrende = 0
    let aufAndere = 0
    for (const { vorher, aktion } of ALLE.filter(({ vorher }) => vorher.spieler.length >= 3)) {
      const ziele = getroffen(vorher, aktion)
      if (ziele.length === 0) continue
      angriffe += 1
      if (ziele.some((sitz) => fuehrende(vorher).includes(sitz))) aufFuehrende += 1
      else aufAndere += 1
    }
    expect(angriffe, 'K3.5: genug Angriffe zu dritt und zu viert').toBeGreaterThan(30)
    expect(aufFuehrende, `K3.5: ${aufFuehrende} von ${angriffe} Angriffen auf einen Führenden`).toBeGreaterThan(0.75 * angriffe)
    expect(aufFuehrende).toBeGreaterThan(aufAndere)
  }, 120_000)
})
