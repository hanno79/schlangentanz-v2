// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { findeSzenario } from '../../entwicklung/szenarien'
import { naechsterKiSchritt } from '../schritt'
import { entscheiderVon } from '../sicht'
import { nachDurchlassen } from '../__tests__/stellungen'
import { erstelleSolideKi } from './solideKi'

/*
K3, Kriterien 1 bis 5, als Szenariotests: dieselben Szenarien stehen am
Entwicklertisch (`src/entwicklung/szenarienKiAngriff.ts`). Bei den Angriffen spielt
KI-Gegner 1 (Stelle 1) seinen ganzen Zug, ein gefragter Mensch lässt durch; bei der
Abwehr entscheidet KI-Gegner 1 über eine Karte, die Spieler 1 angesagt hat.
*/

const KI = 'spieler-2'

function szenario(name: string): Spielzustand {
  const gefunden = findeSzenario(name)
  if (gefunden === undefined) throw new Error(`Testaufbau: Szenario ${name} fehlt`)
  return gefunden.erzeuge()
}

/** Spielt den Zug von KI-Gegner 1 im Szenario mit der soliden KI; gefragte KI-Gegner entscheiden selbst, ein gefragter Mensch lässt durch. */
function spieleZug(name: string, saat = 1): { aktionen: SpielAktion[]; start: Spielzustand; zustand: Spielzustand } {
  const start = szenario(name)
  let zustand = start
  const ki = erstelleSolideKi(erzeugeZufall(saat))
  const aktionen: SpielAktion[] = []
  while (zustand.partiephase !== 'Beendet' && zustand.zug.spielerIndex === 1) {
    const entscheider = entscheiderVon(zustand)
    const aktion =
      entscheider?.steuerung === 'KI' ? naechsterKiSchritt(zustand, ki) : ermittleAktionen(zustand).find((angeboten) => angeboten.typ === 'Reagieren' && angeboten.farbenschutzId === null)
    if (aktion == null) throw new Error(`Testaufbau: In ${name} entscheidet ${entscheider?.name ?? 'niemand'} ohne Aktion.`)
    if (aktion.spielerId === KI) aktionen.push(aktion)
    zustand = anwendeAktion(zustand, aktion).zustand
  }
  return { aktionen, start, zustand }
}

/** Was KI-Gegner 1 auf die angesagte Karte im Szenario antwortet. */
function reaktion(name: string, saat = 1): SpielAktion | null {
  return naechsterKiSchritt(szenario(name), erstelleSolideKi(erzeugeZufall(saat)))
}

const end = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].summe
const farben = (zustand: Spielzustand, sitz: number) =>
  zustand.spieler[sitz].schlangen.map((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))
const SAATEN = [1, 2, 3]

describe('K3 Kriterium 1: Schlangenfrass auf die eigene Blockade oder beim Führenden', () => {
  it('K3.1: ki-frass-blockade: kein Gegner hat ein lohnendes Ziel, sie frisst ihre eigene Blockade (A7.4 b), Grün ×3 bringt 9', () => {
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-frass-blockade', saat)
      // A7.4 a) und b) entfernen beide die eigene Blockade; welche Option die Engine dafür anbietet, ändert die Schlange nicht.
      expect(zug.aktionen.find((aktion) => aktion.typ === 'SchlangenfrassSpielen'), `K3.1: Saat ${saat}`).toMatchObject({
        option: expect.stringMatching(/^eigene/),
        ziele: [{ schlangenId: 'schlange-1', karteId: expect.stringMatching(/^schlangenblockade-/) }],
      })
      expect(farben(zug.zustand, 1)[0], `K3.1: Saat ${saat}`).toEqual(['Grün', 'Grün', 'Grün'])
      expect(farben(zug.zustand, 0), 'K3.1: die Schlange von Spieler 1 bleibt').toEqual([['Rot', 'Gelb', 'Blau']])
    }
  })

  it('K3.1: ki-frass-fuehrender: der Führende hat eine wertvolle Gruppe, sie frisst dort zwei grüne Karten (A7.4 c) statt ihrer Blockade', () => {
    const start = szenario('ki-frass-fuehrender')
    expect(end(start, 0), 'K3.1: Grün ×4 und Kettenbonus').toBe(17)
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-frass-fuehrender', saat)
      const frass = zug.aktionen.find((aktion) => aktion.typ === 'SchlangenfrassSpielen')
      expect(frass, `K3.1: Saat ${saat}`).toMatchObject({ option: 'gegnerischeKarten', ziele: [{ schlangenId: 'schlange-2' }, { schlangenId: 'schlange-2' }] })
      expect(farben(zug.zustand, 0), `K3.1: Saat ${saat}`).toEqual([['Grün', 'Grün']])
      expect(farben(zug.zustand, 1)[0], 'K3.1: ihre Blockade bleibt').toContain('Schlangenblockade')
    }
  })
})

describe('K3 Kriterium 2: Schlangenblockade und Farbendieb treffen die Gruppe mit dem höchsten Punktverlust für den Führenden', () => {
  /** Wie viele Punkte der Führende (Stelle 0) bei jeder angebotenen Karte dieses Typs verliert, wenn er durchlässt. */
  function verluste(start: Spielzustand, typ: SpielAktion['typ']): number[] {
    return ermittleAktionen(start)
      .filter((aktion) => aktion.typ === typ)
      .map((aktion) => end(start, 0) - end(nachDurchlassen(start, aktion, 1), 0))
  }

  it('K3.2: ki-blockade-fuehrender: die Blockade kommt in die grüne Gruppe des Führenden, 9 Punkte Verlust, mehr geht nicht', () => {
    const start = szenario('ki-blockade-fuehrender')
    expect(Math.max(...verluste(start, 'BlockadeLegen')), 'K3.2: höchster möglicher Verlust').toBe(9)
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-blockade-fuehrender', saat)
      const blockade = zug.aktionen.find((aktion) => aktion.typ === 'BlockadeLegen')
      expect(blockade, `K3.2: Saat ${saat}`).toMatchObject({ schlangenId: 'schlange-2' })
      expect(blockade?.typ === 'BlockadeLegen' && [1, 2].includes(blockade.position), `K3.2: mitten in die Gruppe, Saat ${saat}`).toBe(true)
      expect(end(start, 0) - end(zug.zustand, 0), `K3.2: Verlust des Führenden, Saat ${saat}`).toBe(9)
    }
  })

  it('K3.2: ki-farbendieb-fuehrender: der Farbendieb nimmt eine grüne Karte aus der Gruppe des Führenden', () => {
    const start = szenario('ki-farbendieb-fuehrender')
    expect(Math.max(...verluste(start, 'FarbendiebSpielen')), 'K3.2: höchster möglicher Verlust').toBe(9)
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-farbendieb-fuehrender', saat)
      const dieb = zug.aktionen.find((aktion) => aktion.typ === 'FarbendiebSpielen')
      expect(dieb, `K3.2: Saat ${saat}`).toMatchObject({ quelle: { schlangenId: 'schlange-2', karteId: expect.stringMatching(/^gruen-/) } })
      expect(end(start, 0) - end(nachDurchlassen(start, dieb!, 1), 0), `K3.2: Verlust des Führenden durch den Farbendieb, Saat ${saat}`).toBe(9)
    }
  })
})

describe('K3 Kriterium 3: eine störende Farbkarte beim Gegner nur, wenn die eigene Hand nichts Besseres hergibt', () => {
  const gegnerische = (aktionen: SpielAktion[]) =>
    aktionen.filter((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId !== 'schlange-1' && aktion.ziel.schlangenId !== 'schlange-2')

  it('K3.3: ki-farbe-eigene: das Blau vollendet ihre Gruppe; keine Farbkarte geht an die Schlange von Spieler 1', () => {
    const start = szenario('ki-farbe-eigene')
    expect(ermittleAktionen(start).some((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-2'), 'D9: stören ginge').toBe(true)
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-farbe-eigene', saat)
      expect(zug.aktionen.filter((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-2'), `K3.3: Saat ${saat}`).toEqual([])
      expect(farben(zug.zustand, 1), `K3.3: Saat ${saat}`).toEqual([['Blau', 'Blau', 'Blau']])
    }
  })

  it('K3.3: ki-farbe-stoeren: die eigene Hand bringt nichts, sie stellt das grüne Paar von Spieler 1 mit einem Braun zu', () => {
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-farbe-stoeren', saat)
      expect(gegnerische(zug.aktionen), `K3.3: Saat ${saat}`).toMatchObject([{ ziel: { schlangenId: 'schlange-3', seite: 'ende' } }])
      expect(farben(zug.zustand, 0), `K3.3: Saat ${saat}`).toEqual([['Rot', 'Grün', 'Grün', 'Braun']])
    }
  })
})

describe('K3 Kriterium 4: Abwehr bei einem Angriff auf eine Dreiergruppe, Harmloses geht durch, in der Schlussrunde jeder Schaden', () => {
  it('K3.4: ki-abwehr-dreiergruppe: sie wehrt die Blockade in ihrer grünen Gruppe mit Farbenschutz ab', () => {
    for (const saat of SAATEN) expect(reaktion('ki-abwehr-dreiergruppe', saat), `K3.4: Saat ${saat}`).toMatchObject({ typ: 'Reagieren', farbenschutzId: expect.stringMatching(/^farbenschutz-/) })
    const ohne = nachDurchlassen(szenario('ki-abwehr-dreiergruppe'), { typ: 'Reagieren', spielerId: KI, farbenschutzId: null }, 1)
    expect(end(ohne, 1), 'K3.4: durchgelassen wäre die Gruppe zerstört').toBe(0)
  })

  it('K3.4: ki-abwehr-harmlos: eine Blockade, die nur ein Paar zustellt, lässt sie in laufender Partie durch', () => {
    const start = szenario('ki-abwehr-harmlos')
    expect(start.partiephase).toBe('Laufend')
    for (const saat of SAATEN) expect(reaktion('ki-abwehr-harmlos', saat), `K3.4: Saat ${saat}`).toEqual({ typ: 'Reagieren', spielerId: KI, farbenschutzId: null })
  })

  it('K3.4: ki-abwehr-schlussrunde: dieselbe Blockade wehrt sie in der Schlussrunde ab, weil sie noch ihren letzten Zug hat', () => {
    const start = szenario('ki-abwehr-schlussrunde')
    expect(start.partiephase).toBe('Schlussrunde')
    for (const saat of SAATEN) expect(reaktion('ki-abwehr-schlussrunde', saat), `K3.4: Saat ${saat}`).toMatchObject({ typ: 'Reagieren', farbenschutzId: expect.stringMatching(/^farbenschutz-/) })
  })
})

describe('K3 Kriterium 5: bei 3 und 4 Spielern greift sie bevorzugt den Führenden an', () => {
  it('K3.5: ki-angriff-fuehrender: zwei gleich wertvolle grüne Gruppen, sie blockiert die des Führenden', () => {
    const start = szenario('ki-angriff-fuehrender')
    expect([0, 1, 2, 3].map((sitz) => end(start, sitz)), 'K3.5: Spieler 1 führt unter den Gegnern').toEqual([12, 10, 9, 6])
    for (const saat of SAATEN) {
      const zug = spieleZug('ki-angriff-fuehrender', saat)
      expect(zug.aktionen.find((aktion) => aktion.typ === 'BlockadeLegen'), `K3.5: Saat ${saat}`).toMatchObject({ schlangenId: 'schlange-2' })
      expect(farben(zug.zustand, 2), 'K3.5: die Gruppe von KI-Gegner 2 bleibt').toEqual([['Grün', 'Grün', 'Grün']])
    }
  })
})
