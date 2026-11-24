// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../engine'
import type { Aktionstyp, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { spielePartie } from '../turnier'
import { erstelleSolideKi } from './solideKi'
import type { Fabrik } from './strategie'
import { erstelleZufallsKi } from './zufallsKi'

/*
X4: Die KI muss die Comeback-Karte noch nicht klug nutzen (das ist K4), aber sie
darf an ihr nicht scheitern. Die Zufalls-KI spielt Partien mit Erweiterung zu
Ende und setzt dabei Comeback-Karten ein, auch „Zwei Karten abwerfen, drei
ziehen“; die solide KI wählt in einer Lage mit Comeback eine aufgezählte Aktion
und spielt Partien mit Erweiterung zu Ende. Die Sicht eines Gegners nennt keine
Karte, die beim Abwerfen und Ziehen verdeckt auf die Hand kam (B2).
*/

/** Spielt Partien mit Erweiterung allein mit dieser KI (Invarianten je Schritt, `spielePartie`) und zählt, welche Aktionen sie wählte. */
function spielePartien(fabrik: Fabrik, saaten: number[]): { gezaehlt: Map<Aktionstyp, number>; beendet: number } {
  const gezaehlt = new Map<Aktionstyp, number>()
  let beendet = 0
  saaten.forEach((saat, index) => {
    const start = erstellePartie({ spielerzahl: 2 + (index % 3), erweiterung: true, zufall: erzeugeZufall(saat) })
    const ki = fabrik(erzeugeZufall(saat * 7 + 3))
    const { ausgang, verlauf } = spielePartie(start, start.spieler.map(() => ki), 5000, `X4, Saat ${saat}`)
    for (const aktion of verlauf) gezaehlt.set(aktion.typ, (gezaehlt.get(aktion.typ) ?? 0) + 1)
    if (ausgang === 'beendet') beendet += 1
  })
  return { gezaehlt, beendet }
}

/** Spieler 1 liegt 5 Karten zurück und ist am Zug, mit gemischter Hand. */
function rueckstand(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: true })
    .hand(0, ['Blau', 'Rot', 'Schlangenblockade', 'Gelb', 'Verdoppler'])
    .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .schlange(0, ['Grün'])
    .schlange(1, ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau'])
    .zugbeginn()
    .zustand()
}

describe('X4/K1: die Zufalls-KI spielt die Comeback-Karte', () => {
  it('X4: in 40 Partien mit Erweiterung setzt sie Comeback-Karten ein, wirft zwei ab und zieht drei, und jede Partie endet', () => {
    const { gezaehlt, beendet } = spielePartien(erstelleZufallsKi, Array.from({ length: 40 }, (_, index) => 91001 + index))
    expect(beendet, 'X4: beendete Partien').toBe(40)
    expect(gezaehlt.get('ComebackEinsetzen') ?? 0, 'X4: eingesetzte Comeback-Karten').toBeGreaterThan(0)
    expect(gezaehlt.get('ZweiAbwerfenDreiZiehen') ?? 0, 'X4: „Zwei Karten abwerfen, drei ziehen“').toBeGreaterThan(0)
  }, 120_000)
})

describe('X4/K2: die solide KI scheitert an der Comeback-Karte nicht', () => {
  it('X4: mit Comeback in der Hand wählt sie eine aufgezählte Aktion, auch nach dem Einsatz', () => {
    const start = rueckstand()
    const ki = erstelleSolideKi(erzeugeZufall(5))
    const erste = kiWahl(start, ki)
    expect(ermittleAktionen(start)).toContainEqual(erste)
    const comeback = ermittleAktionen(start).find((aktion) => aktion.typ === 'ComebackEinsetzen')
    if (comeback === undefined) throw new Error('Testaufbau: ComebackEinsetzen ist nicht aufgezählt.')
    let zustand = anwendeAktion(start, comeback).zustand
    for (let schritt = 0; schritt < 12 && zustand.zug.spielerIndex === 0; schritt += 1) {
      const aktion = kiWahl(zustand, ki)
      if (aktion === null) break
      expect(ermittleAktionen(zustand)).toContainEqual(aktion)
      zustand = anwendeAktion(zustand, aktion).zustand
    }
    expect(zustand.zug.spielerIndex, 'X4: Spieler 1 hat seinen Zug beendet').toBe(1)
  }, 60_000)

  it('X4: drei Partien mit Erweiterung spielt sie zu Ende', () => {
    expect(spielePartien(erstelleSolideKi, [92001, 92002, 92003]).beendet).toBe(3)
  }, 180_000)
})

describe('B2: die Sicht nach „Zwei Karten abwerfen, drei ziehen“', () => {
  it('B2: die Sicht des Gegners nennt keine der verdeckt gezogenen Karten, die eigene schon', () => {
    const start = anwendeAktion(rueckstand(), { typ: 'ComebackEinsetzen', spielerId: 'spieler-1', comebackId: 'comeback-01' }).zustand
    const tausch = ermittleAktionen(start).find((aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen')
    if (tausch === undefined) throw new Error('Testaufbau: ZweiAbwerfenDreiZiehen ist nicht aufgezählt.')
    const gezogen = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    const nach = anwendeAktion(start, tausch).zustand
    const gegner = JSON.stringify(sichtFuer(nach, 1))
    expect(gezogen.filter((id) => gegner.includes(id)), 'B2: Sicht von KI-Gegner 1').toEqual([])
    expect(sichtFuer(nach, 0).hand.map((karte) => karte.id)).toEqual(expect.arrayContaining(gezogen))
  })
})
