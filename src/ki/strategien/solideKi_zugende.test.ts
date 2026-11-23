// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { berechneEndwertung, ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl, naechsterKiSchritt } from '../schritt'
import { sichtFuer } from '../sicht'
import { entscheidungenVon, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'

/*
K2, Kriterien 1 und 2 und die Vorgabe des Autors „ernsthaft gewinnen“
(Prüfprotokoll K2, Iteration 1, Mangel 1, und Iteration 2, Hinweis 1): Beendet
die solide KI ihren Zug, liegt keine Karte mehr auf der Hand, die ihre Punkte
hebt, keinem Gegner nützt und nicht schlechter bewertet ist als das Halten. Bei
Gleichstand gewinnt der sichere Punkt (Entscheidung des Orchestrators: die KI
spielt auf Sieg). Gezählt wird jede Karte, auch Schlangenfrass, Fusion und
Farbendieb, und ein Gegner lässt eine angesagte Karte durch.
*/

function endpunkte(zustand: Spielzustand): number[] {
  return berechneEndwertung(zustand).spieler.map((spieler) => spieler.summe)
}

/** Wie `endpunkte`, aber ohne Aufgaben: Seit X2 löst jede aufgelöste Aktion eine schon erfüllte offene Aufgabe ein (A9). */
function punkteOhneAufgaben(zustand: Spielzustand): number[] {
  return berechneEndwertung(zustand).spieler.map((spieler) => spieler.summe - spieler.aufgabenPunkte)
}

interface Partie {
  spielerzahl: number
  erweiterung: boolean
  saat: number
  /** Wo die solide KI sitzt. */
  sitz: number
  /** Die Saat der KI an Stelle `platz`. */
  kiSaat: (platz: number) => number
}

/** Die solide KI an Stelle `sitz` gegen Zufalls-KIs, 2 bis 4 Spieler, mit und ohne Erweiterung. */
const EIGENE: Partie[] = [
  ...[9100, 9101, 9102, 9103, 9104, 9105, 9106].map((saat) => ({ spielerzahl: 2, erweiterung: false, saat })),
  ...[9200, 9201, 9202, 9203, 9204, 9205, 9206].map((saat) => ({ spielerzahl: 3, erweiterung: false, saat })),
  ...[9300, 9301, 9302].map((saat) => ({ spielerzahl: 4, erweiterung: false, saat })),
  ...[9420, 9421, 9440].map((saat) => ({ spielerzahl: saat === 9440 ? 4 : 2, erweiterung: true, saat })),
].map((partie, nummer) => {
  const sitz = nummer % partie.spielerzahl
  return { ...partie, sitz, kiSaat: (platz: number) => (platz === sitz ? partie.saat * 17 + 999 : partie.saat * 31 + platz + 5) }
})

/** Die Partien des Prüfprotokolls K2, Iteration 2, mit seinen Saaten, in denen die KI +1 oder +2 liegen liess. */
const AUS_DEM_PROTOKOLL: Partie[] = [
  { spielerzahl: 2, erweiterung: false, saat: 7101 },
  { spielerzahl: 2, erweiterung: true, saat: 7154 },
  { spielerzahl: 3, erweiterung: false, saat: 7203 },
  { spielerzahl: 3, erweiterung: false, saat: 7205 },
  { spielerzahl: 3, erweiterung: true, saat: 7253 },
  { spielerzahl: 4, erweiterung: true, saat: 7354 },
].map((partie) => {
  const sitz = partie.saat % partie.spielerzahl
  return { ...partie, sitz, kiSaat: (platz: number) => (platz === sitz ? partie.saat * 13 + 3 : partie.saat * 7 + platz + 11) }
})

const PARTIEN = [...EIGENE, ...AUS_DEM_PROTOKOLL]

/** Ein Zugende, an dem eine Karte liegen blieb, die ihr genützt hätte: die beste davon und was sie gebracht hätte. */
interface Verschenkt {
  saat: number
  aktion: SpielAktion
  gewinn: number
}

function verschenkteKarten(): { zugenden: number; verschenkt: Verschenkt[] } {
  let zugenden = 0
  const verschenkt: Verschenkt[] = []
  for (const partie of PARTIEN) {
    const { sitz } = partie
    const kis = Array.from({ length: partie.spielerzahl }, (_, platz) =>
      platz === sitz ? erstelleSolideKi(erzeugeZufall(partie.kiSaat(platz))) : erstelleZufallsKi(erzeugeZufall(partie.kiSaat(platz))),
    )
    for (const { vorher, aktion } of entscheidungenVon(partie, kis, sitz)) {
      // X5: Risiko-Karten spielt die solide KI erst ab K4; sie zählen hier nicht als liegen gebliebene Karte.
      const andere = ermittleAktionen(vorher).filter((angeboten) => angeboten.typ !== 'ZugBeenden' && angeboten.typ !== 'RisikoKarteSpielen')
      if (aktion.typ !== 'ZugBeenden' || andere.length === 0) continue
      zugenden += 1
      const jetzt = endpunkte(vorher)
      const wertJetzt = bewerte(sichtFuer(vorher, sitz))
      const nuetzlich = andere.flatMap((karte) => {
        const danach = nachDurchlassen(vorher, karte, sitz)
        const punkte = endpunkte(danach)
        const nuetztGegner = punkte.some((wert, platz) => platz !== sitz && wert > jetzt[platz])
        const nichtSchlechter = bewerte(sichtFuer(danach, sitz)) >= wertJetzt - 1e-9
        return punkte[sitz] > jetzt[sitz] && !nuetztGegner && nichtSchlechter ? [{ saat: partie.saat, aktion: karte, gewinn: punkte[sitz] - jetzt[sitz] }] : []
      })
      const beste = nuetzlich.sort((a, b) => b.gewinn - a.gewinn)[0]
      if (beste !== undefined) verschenkt.push(beste)
    }
  }
  return { zugenden, verschenkt }
}

describe('K2, Kriterien 1 und 2: am Zugende liegt keine Karte mehr, die ihr nützt', () => {
  it(`K2.1, K2.2: in ${PARTIEN.length} Partien beendet sie keinen Zug, solange eine Karte ihre Punkte hebt, keinem Gegner nützt und nicht schlechter bewertet ist als das Halten`, () => {
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
      .gespielt(1, 0)
      .zustand()
    const gelb = start.spieler[2].schlangen[1].karten[2]
    const aktion = naechsterKiSchritt(start, erstelleSolideKi(erzeugeZufall(1)))
    expect(aktion, 'K2.1: Schlangenfrass a) auf das Gelb').toMatchObject({ typ: 'SchlangenfrassSpielen', option: 'eigeneKarte', ziele: [{ karteId: gelb.id }] })
    expect(endpunkte(nachDurchlassen(start, aktion!, 2))[2] - endpunkte(start)[2], 'A11: Braun×4 (8) und der Kettenbonus (5)').toBe(13)
  })

  it('K2.1, Prüfprotokoll Iteration 2, Saat 7154: Halten und Spielen sind gleich bewertet; sie spielt den Schlangenfrass auf die Blockade, der einen Punkt sicher bringt', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(7154) })
      .schlange(0, ['Blau', 'Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot', 'Schlangenblockade', 'Gelb', 'Gelb', 'Gelb', 'Schlangenblockade', 'Gelb', 'Braun', 'Braun'])
      .schlange(0, ['Violett', 'Violett', 'Violett', 'Regenbogenschlange', 'Gelb', 'Gelb', 'Grün', 'Grün'])
      .schlange(1, ['Rot', 'Grün', 'Braun'])
      .hand(0, ['Gelb', 'Rot', 'Gelb', 'Schlangenfrass'])
      .amZug(0)
      .gespielt(1, 0)
      .zustand()
    const blockade = start.spieler[0].schlangen[0].karten[12]
    const frass = ermittleAktionen(start).find((aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'eigeneKarte' && aktion.ziele[0].karteId === blockade.id)
    if (frass === undefined) throw new Error('Testaufbau: kein Schlangenfrass auf die zweite Blockade')
    const danach = nachDurchlassen(start, frass, 0)
    expect(bewerte(sichtFuer(danach, 0)) - bewerte(sichtFuer(start, 0)), 'K2: Testaufbau, Halten und Spielen sind gleich bewertet').toBeCloseTo(0, 9)
    expect(punkteOhneAufgaben(danach)[0] - punkteOhneAufgaben(start)[0], 'A11: Gelb×4 statt Gelb×3, ein Punkt').toBe(1)

    const aktion = kiWahl(start, erstelleSolideKi(erzeugeZufall(1)))
    expect(aktion, 'K2: bei Gleichstand gewinnt der sichere Punkt').toMatchObject({ typ: 'SchlangenfrassSpielen', ziele: [{ karteId: blockade.id }] })
  })
})
