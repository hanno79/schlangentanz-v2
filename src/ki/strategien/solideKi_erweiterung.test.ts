// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erzeugeZufall, pruefeInvarianten } from '../../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { legeAufgabenAus } from '../../engine/testing/aufgaben'
import type { Aufgabenauslage } from '../../engine/testing/aufgaben'
import { erzeugeSzenario as szenario } from '../../entwicklung/szenarien'
import { naechsterKiSchritt } from '../schritt'
import { entscheiderVon } from '../sicht'
import { gruppenzahl } from '../__tests__/stellungen'
import { erstelleSolideKi } from './solideKi'

/*
K4, Kriterien 1 bis 3, als Szenariotests: dieselben Szenarien stehen am
Entwicklertisch (`src/entwicklung/szenarienKiErweiterung.ts`). In jedem ist
KI-Gegner 1 (Stelle 1) am Beginn seines Zuges; gespielt wird sein Zug bis „Zug
beenden“. Spieler 1 lässt jede angesagte Karte durch und nimmt bei einer Wahl die
erste. Die Eigenschaften in Partien stehen in `solideKi_erweiterung_partien.test.ts`.
*/

const KI = 1

interface Zug {
  /** Was KI-Gegner 1 in diesem Zug gewählt hat, auch über Risiko-Entscheidungen. */
  aktionen: SpielAktion[]
  /** Der Stand nach seinem „Zug beenden“. */
  zustand: Spielzustand
}

/** Spielt den ersten Teilzug von KI-Gegner 1 mit der soliden KI bis „Zug beenden“. */
function spieleZug(start: Spielzustand, saat = 1): Zug {
  const ki = erstelleSolideKi(erzeugeZufall(saat))
  const aktionen: SpielAktion[] = []
  let zustand = start
  for (let schritt = 0; schritt < 20; schritt += 1) {
    const entscheider = entscheiderVon(zustand)
    if (entscheider === null) break
    const angeboten = ermittleAktionen(zustand)
    const aktion =
      entscheider.steuerung === 'KI' ? naechsterKiSchritt(zustand, ki) : (angeboten.find((eintrag) => eintrag.typ === 'Reagieren' && eintrag.farbenschutzId === null) ?? angeboten[0])
    if (aktion == null) throw new Error(`Testaufbau: ${entscheider.name} entscheidet ohne Aktion.`)
    if (entscheider.index === KI) aktionen.push(aktion)
    zustand = anwendeAktion(zustand, aktion).zustand
    if (entscheider.index === KI && aktion.typ === 'ZugBeenden') return { aktionen, zustand }
  }
  throw new Error(`Testaufbau: Der Zug von KI-Gegner 1 endet nicht, gespielt ${JSON.stringify(aktionen)}`)
}

/** Die Karte der Hand von KI-Gegner 1 nach Farbe oder Name. */
function handkarte(zustand: Spielzustand, art: string): Spielkarte {
  const karte = zustand.spieler[KI].hand.find((eintrag) => (eintrag.typ === 'Farbkarte' ? eintrag.farbe : eintrag.name) === art)
  if (karte === undefined) throw new Error(`Testaufbau: ${art} liegt nicht auf der Hand von KI-Gegner 1`)
  return karte
}

const typen = (zug: Zug) => zug.aktionen.map((aktion) => aktion.typ)
const farben = (zustand: Spielzustand) => zustand.spieler[KI].schlangen.map((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))
const erfuellte = (zustand: Spielzustand) => zustand.spieler[KI].erfuellteAufgaben.map((aufgabe) => aufgabe.name)

/** Dieselbe Stellung mit anders ausgelegten Aufgaben, als Gegenprobe. */
function mitAufgaben(start: Spielzustand, auslage: Aufgabenauslage): Spielzustand {
  const anders = structuredClone(start)
  legeAufgabenAus(anders, auslage)
  expect(pruefeInvarianten(anders).filter((befund) => befund.verletzt), 'Testaufbau: die Gegenprobe erfüllt jede Invariante').toEqual([])
  return anders
}

describe('K4 Kriterium 1: Fehlt ihr eine Karte zu einer offenen oder ihrer geheimen Aufgabe und hält sie sie, spielt sie sie', () => {
  it('K4.1, A9 Farbvielfalt: ki-aufgabe-offen: sie legt das Grün an die Kette und erfüllt die offene Aufgabe; ohne die Aufgabe legte sie das Braun', () => {
    const start = szenario('ki-aufgabe-offen')
    const gruen = handkarte(start, 'Grün')
    expect(start.offeneAufgaben.map((aufgabe) => aufgabe.name), 'Testaufbau: Farbvielfalt liegt offen').toContain('Farbvielfalt')
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(zug.aktionen[0], `K4.1: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toMatchObject({ typ: 'FarbkarteLegen', karteId: gruen.id, ziel: { schlangenId: 'schlange-1' } })
      expect(erfuellte(zug.zustand), `K4.1: Saat ${saat}, Farbvielfalt geht an KI-Gegner 1`).toContain('Farbvielfalt')
    }
    const ohne = mitAufgaben(start, { offen: ['Lila Riese', 'Gelber Schatz', 'Symmetriemeister'] })
    const braun = handkarte(start, 'Braun')
    expect(spieleZug(ohne).aktionen[0], 'K4.1, Gegenprobe: ohne die Aufgabe vollendet sie Braun ×3').toMatchObject({ typ: 'FarbkarteLegen', karteId: braun.id, ziel: { schlangenId: 'schlange-2' } })
  })

  it('K4.1, A9 Farbenpracht, D59: ki-aufgabe-geheim: sie legt das zweite Grün statt des Gelb, nach „Zug beenden“ ist ihre geheime Aufgabe erfüllt; mit einer anderen geheimen Aufgabe legte sie das Gelb', () => {
    const start = szenario('ki-aufgabe-geheim')
    expect(start.spieler[KI].geheimeAufgabe?.name, 'Testaufbau: ihre geheime Aufgabe').toBe('Farbenpracht')
    const gruen = handkarte(start, 'Grün')
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      const farbkarten = zug.aktionen.filter((aktion) => aktion.typ === 'FarbkarteLegen')
      expect(farbkarten, `K4.1: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toEqual([expect.objectContaining({ karteId: gruen.id })])
      expect(zug.zustand.spieler[KI].geheimeAufgabeErfuellt, `K4.1, D35: Saat ${saat}, die geheime Aufgabe steht auf erfüllt`).toBe(true)
    }
    const ohne = mitAufgaben(start, { geheim: [[KI, 'Vielfaltskönig']] })
    const gelb = handkarte(start, 'Gelb')
    expect(spieleZug(ohne).aktionen.filter((aktion) => aktion.typ === 'FarbkarteLegen'), 'K4.1, Gegenprobe: mit Vielfaltskönig vollendet sie Gelb ×3').toEqual([expect.objectContaining({ karteId: gelb.id })])
  })
})

describe('K4 Kriterium 2: Comeback-Karte, Risiko-Karte und Schlangenkorb, wenn die Bewertung steigt, nicht im ersten Zug ohne Nutzen', () => {
  it('K4.2, A8.1: ki-comeback-nutzen: sie setzt die Comeback-Karte ein und vollendet beide Gruppen', () => {
    const start = szenario('ki-comeback-nutzen')
    expect(start.zug.comebackBedingung, 'Testaufbau: 5 Karten Rückstand zu Zugbeginn').toBe(true)
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(typen(zug), `K4.2: Saat ${saat}`).toContain('ComebackEinsetzen')
      expect(farben(zug.zustand), `K4.2: Saat ${saat}, beide Gruppen`).toEqual([
        ['Grün', 'Grün', 'Grün'],
        ['Blau', 'Blau', 'Blau'],
      ])
      expect(zug.zustand.spieler[KI].comeback?.verbraucht, `K4.2: Saat ${saat}`).toBe(true)
    }
  })

  it('K4.2, A8.1, D68: ki-comeback-ohne-nutzen: mit nur Grün und Farbenschutz setzt sie die Comeback-Karte nicht ein', () => {
    const start = szenario('ki-comeback-ohne-nutzen')
    expect(start.zug.comebackBedingung, 'Testaufbau: 5 Karten Rückstand zu Zugbeginn').toBe(true)
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(typen(zug), `K4.2: Saat ${saat}`).toEqual(['FarbkarteLegen', 'ZugBeenden'])
      expect(farben(zug.zustand)[0], `K4.2: Saat ${saat}`).toEqual(['Grün', 'Grün', 'Grün'])
      expect(zug.zustand.spieler[KI].comeback?.verbraucht, `K4.2: Saat ${saat}, die Comeback-Karte bleibt`).toBe(false)
    }
  })

  it('K4.2, A7.10, D44: ki-korb-tausch: sie tauscht mit dem Schlangenkorb das Rot gegen ihr Blau, Blau ×5', () => {
    const start = szenario('ki-korb-tausch')
    const [rot, blau] = [start.spieler[KI].schlangen[0].karten[2], handkarte(start, 'Blau')]
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(zug.aktionen[0], `K4.2: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toMatchObject({
        typ: 'SchlangenkorbSpielen',
        bonus: { art: 'tauschen', tausch: [{ karteId: rot.id, handkarteId: blau.id }] },
      })
      expect(farben(zug.zustand)[0], `K4.2: Saat ${saat}`).toEqual(['Blau', 'Blau', 'Blau', 'Blau', 'Blau'])
    }
  })

  it('K4.2, A7.10, D43: ki-korb-ohne-nutzen: kein Bonus bringt mehr als der Korb auf der Hand; sie vollendet Grün ×3 und hält ihn', () => {
    const start = szenario('ki-korb-ohne-nutzen')
    expect(start.nachziehstapel, 'Testaufbau: eine Karte im Nachziehstapel').toHaveLength(1)
    const korb = handkarte(start, 'Schlangenkorb des Glücks')
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(typen(zug), `K4.2: Saat ${saat}`).not.toContain('SchlangenkorbSpielen')
      expect(farben(zug.zustand)[0], `K4.2: Saat ${saat}`).toEqual(['Grün', 'Grün', 'Grün'])
      expect(zug.zustand.spieler[KI].hand.map((karte) => karte.id), `K4.2: Saat ${saat}, der Korb bleibt auf der Hand`).toContain(korb.id)
    }
  })

  it('K4.2, A8.2: ki-risiko-nutzen: vor ihren übrigen Karten spielt sie eine Risiko-Karte mit Aktion 2 oder 3', () => {
    const start = szenario('ki-risiko-nutzen')
    expect(start.spieler[KI].risikoKarten, 'Testaufbau: zwei Risiko-Karten').toHaveLength(2)
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      const erste = zug.aktionen[0]
      expect(erste?.typ === 'RisikoKarteSpielen' ? [2, 3].includes(erste.risikoAktion) : false, `K4.2: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toBe(true)
      expect(zug.zustand.spieler[KI].risikoKarten, `K4.2: Saat ${saat}, eine ist aus dem Spiel`).toHaveLength(1)
    }
  })

  it('K4.2, A8.2, D55: ki-risiko-ohne-nutzen: im ersten Zug, ohne Schlange und mit Farbenschutz auf der Hand, spielt sie keine Risiko-Karte', () => {
    const start = szenario('ki-risiko-ohne-nutzen')
    expect(ermittleAktionen(start).some((aktion) => aktion.typ === 'RisikoKarteSpielen'), 'Testaufbau: Risiko-Karten sind spielbar').toBe(true)
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(typen(zug), `K4.2: Saat ${saat}`).not.toContain('RisikoKarteSpielen')
      expect(zug.zustand.spieler[KI].risikoKarten, `K4.2: Saat ${saat}`).toHaveLength(2)
    }
  })
})

describe('K4 Kriterium 3: Sie plant eine Schlangenhäutung, die neue Gruppen bildet', () => {
  it('K4.3, A7.9, A9 Schlangentanz: ki-haeutung-tanz: die Häutung der letzten fünf Karten bildet Rot ×3 und Violett ×3, Schlangentanz geht an sie', () => {
    const start = szenario('ki-haeutung-tanz')
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(zug.aktionen[0], `K4.3: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toMatchObject({ typ: 'SchlangenhaeutungSpielen', schlangenId: 'schlange-1' })
      expect(farben(zug.zustand)[0].slice(5), `K4.3: Saat ${saat}`).toEqual(['Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
      expect(gruppenzahl(zug.zustand, KI) - gruppenzahl(start, KI), `K4.3: Saat ${saat}, zwei neue Gruppen`).toBe(2)
      expect(erfuellte(zug.zustand), `K4.3, D37, D62: Saat ${saat}`).toContain('Schlangentanz')
    }
  })

  it('K4.3, A7.9: ki-haeutung-gruppe: ohne Aufgabe ordnet sie Blau, Rot, Blau, Rot, Blau zu einer blauen Dreiergruppe', () => {
    const start = szenario('ki-haeutung-gruppe')
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug(start, saat)
      expect(zug.aktionen[0], `K4.3: Saat ${saat}, gespielt ${JSON.stringify(zug.aktionen)}`).toMatchObject({ typ: 'SchlangenhaeutungSpielen', schlangenId: 'schlange-1' })
      expect(gruppenzahl(zug.zustand, KI) - gruppenzahl(start, KI), `K4.3: Saat ${saat}, eine neue Gruppe`).toBe(1)
    }
  })
})
