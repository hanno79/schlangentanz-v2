// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { berechneEndwertung, ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { naechsterKiSchritt } from '../schritt'
import { sichtFuer } from '../sicht'
import { entscheidungenVon, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'

/*
K2, Kriterien 1 und 2 und die Vorgabe des Autors „ernsthaft gewinnen“
(Prüfprotokoll K2, Iteration 1, Mangel 1): Beendet die solide KI ihren Zug,
liegt keine Karte mehr auf der Hand, die ihre Punkte hebt, keinem Gegner nützt
und die eigene Bewertung verbessert. Gezählt wird jede Karte, auch
Schlangenfrass, Fusion und Farbendieb, und ein Gegner lässt eine angesagte
Karte durch.
*/

function endpunkte(zustand: Spielzustand): number[] {
  return berechneEndwertung(zustand).spieler.map((spieler) => spieler.summe)
}

/** Die solide KI an Stelle `sitz` gegen Zufalls-KIs, 2 bis 4 Spieler, mit und ohne Erweiterung. */
const PARTIEN = [
  ...[9100, 9101, 9102, 9103, 9104, 9105, 9106].map((saat) => ({ spielerzahl: 2, erweiterung: false, saat })),
  ...[9200, 9201, 9202, 9203, 9204, 9205, 9206].map((saat) => ({ spielerzahl: 3, erweiterung: false, saat })),
  ...[9300, 9301, 9302].map((saat) => ({ spielerzahl: 4, erweiterung: false, saat })),
  ...[9420, 9421, 9440].map((saat) => ({ spielerzahl: saat === 9440 ? 4 : 2, erweiterung: true, saat })),
]

/** Ein Zugende, an dem eine Karte liegen blieb, die ihr genützt hätte: die beste davon und was sie gebracht hätte. */
interface Verschenkt {
  saat: number
  aktion: SpielAktion
  gewinn: number
}

function verschenkteKarten(): { zugenden: number; verschenkt: Verschenkt[] } {
  let zugenden = 0
  const verschenkt: Verschenkt[] = []
  for (const [nummer, partie] of PARTIEN.entries()) {
    const sitz = nummer % partie.spielerzahl
    const kis = Array.from({ length: partie.spielerzahl }, (_, platz) =>
      platz === sitz ? erstelleSolideKi(erzeugeZufall(partie.saat * 17 + 999)) : erstelleZufallsKi(erzeugeZufall(partie.saat * 31 + platz + 5)),
    )
    for (const { vorher, aktion } of entscheidungenVon(partie, kis, sitz)) {
      const andere = ermittleAktionen(vorher).filter((angeboten) => angeboten.typ !== 'ZugBeenden')
      if (aktion.typ !== 'ZugBeenden' || andere.length === 0) continue
      zugenden += 1
      const jetzt = endpunkte(vorher)
      const wertJetzt = bewerte(sichtFuer(vorher, sitz))
      const nuetzlich = andere.flatMap((karte) => {
        const danach = nachDurchlassen(vorher, karte, sitz)
        const punkte = endpunkte(danach)
        const nuetztGegner = punkte.some((wert, platz) => platz !== sitz && wert > jetzt[platz])
        const besser = punkte[sitz] > jetzt[sitz] && !nuetztGegner && bewerte(sichtFuer(danach, sitz)) > wertJetzt + 1e-9
        return besser ? [{ saat: partie.saat, aktion: karte, gewinn: punkte[sitz] - jetzt[sitz] }] : []
      })
      const beste = nuetzlich.sort((a, b) => b.gewinn - a.gewinn)[0]
      if (beste !== undefined) verschenkt.push(beste)
    }
  }
  return { zugenden, verschenkt }
}

describe('K2, Kriterien 1 und 2: am Zugende liegt keine Karte mehr, die ihr nützt', () => {
  it('K2.1, K2.2: in 20 Partien beendet sie keinen Zug, solange eine Karte ihre Punkte hebt, keinem Gegner nützt und ihre Bewertung verbessert', () => {
    const { zugenden, verschenkt } = verschenkteKarten()
    expect(zugenden, 'K2: genug Zugenden mit einer anderen Wahl').toBeGreaterThan(200)
    expect(verschenkt.map(({ saat, aktion, gewinn }) => `Saat ${saat}: +${gewinn} mit ${JSON.stringify(aktion)}`)).toEqual([])
  }, 240_000)

  it('K2.1, Prüfprotokoll Saat 9206: nach einer Farbkarte frisst sie das Gelb zwischen ihren Braun und vollendet Braun×4 (+13)', () => {
    const start = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(9206) })
      .schlange(1, ['Schlangenblockade', { fusion: ['Rot', 'Rot'] }, 'Braun', 'Gelb', 'Braun', 'Violett', 'Blau', 'Gelb', 'Violett'])
      .schlange(2, ['Gelb', 'Violett', 'Regenbogenschlange', 'Blau', 'Blau'])
      .schlange(2, ['Braun', 'Braun', 'Gelb', 'Braun', 'Braun', 'Grün', 'Rot', 'Blau'])
      .schlange(0, ['Blau', 'Violett', 'Rot'])
      .hand(2, ['Violett', 'Rot', 'Schlangenfrass', 'Schlangenfrass'])
      .amZug(2)
      .aendere((zustand) => (zustand.zug.gespielteFarbkarten = 1))
      .zustand()
    const gelb = start.spieler[2].schlangen[1].karten[2]
    const aktion = naechsterKiSchritt(start, erstelleSolideKi(erzeugeZufall(1)))
    expect(aktion, 'K2.1: Schlangenfrass a) auf das Gelb').toMatchObject({ typ: 'SchlangenfrassSpielen', option: 'eigeneKarte', ziele: [{ karteId: gelb.id }] })
    expect(endpunkte(nachDurchlassen(start, aktion!, 2))[2] - endpunkte(start)[2], 'A11: Braun×4 (8) und der Kettenbonus (5)').toBe(13)
  })
})
