// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import type { Ki } from './strategie'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'

/*
X6: Die KI muss den Schlangenkorb noch nicht klug nutzen (K4), darf aber an ihm
nicht scheitern. Zufalls-KI und solide KI spielen Partien mit Erweiterung zu
Ende, in denen der Korb gespielt wird, und wählen in Stellungen, in denen der
Korb und seine Zusatzaktionen angeboten sind, eine aufgezählte Aktion.
*/

/** Spielt eine Partie mit Erweiterung allein mit KIs aus `fabrik`; zählt, wie oft der Korb und „Zwei abwerfen, drei ziehen“ gespielt wurden. */
function partie(saat: number, spielerzahl: number, ki: (platz: number) => Ki): { korb: number; abwerfen: number } {
  let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
  const kis = Array.from({ length: spielerzahl }, (_, platz) => ki(platz))
  const gezaehlt = { korb: 0, abwerfen: 0 }
  for (let schritt = 0; zustand.partiephase !== 'Beendet'; schritt += 1) {
    if (schritt > 6000) throw new Error(`Partie ${saat} endet nicht.`)
    const aktion = kiWahl(zustand, kis[ermittleEntscheider(zustand) ?? 0])
    if (aktion === null) throw new Error(`Partie ${saat}: niemand entscheidet, die Partie läuft aber noch.`)
    if (aktion.typ === 'SchlangenkorbSpielen') gezaehlt.korb += 1
    if (aktion.typ === 'AbwerfenUndZiehen') gezaehlt.abwerfen += 1
    zustand = anwendeAktion(zustand, aktion).zustand
  }
  return gezaehlt
}

/** Spieler 1 am Zug mit dem Korb; alle vier Boni sind möglich, der Gegner hält einen Farbenschutz. */
function korbstellung(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(61) })
    .hand(0, ['Schlangenkorb des Glücks', 'Blau', 'Rot', 'Farbenfusion', 'Verdoppler'])
    .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün'])
    .schlange(0, ['Gelb', 'Schlangenblockade', 'Gelb', 'Grün', 'Grün'])
    .schlange(1, ['Braun', 'Regenbogenschlange', 'Braun'])
    .zustand()
}

describe('X6/K4: die KI scheitert nicht am Schlangenkorb', () => {
  it('X6: Zufalls-KIs spielen Partien mit Erweiterung zu Ende; der Korb und seine Zusatzaktionen kommen vor', () => {
    const summe = { korb: 0, abwerfen: 0 }
    for (let saat = 6100; saat < 6130; saat += 1) {
      const gezaehlt = partie(saat, 2 + (saat % 3), (platz) => erstelleZufallsKi(erzeugeZufall(saat * 7 + platz)))
      summe.korb += gezaehlt.korb
      summe.abwerfen += gezaehlt.abwerfen
    }
    expect(summe.korb, 'X6: der Korb wurde gespielt').toBeGreaterThan(5)
  }, 120_000)

  it('X6: die solide KI spielt Partien mit Erweiterung zu Ende', () => {
    for (const saat of [6201, 6202]) partie(saat, 2 + (saat % 3), (platz) => erstelleSolideKi(erzeugeZufall(saat * 11 + platz)))
  }, 240_000)

  it('X6: die solide KI wählt mit dem Korb auf der Hand, nach jedem Bonus und nach einer Abwehr eine aufgezählte Aktion', () => {
    const start = korbstellung()
    const boni = ermittleAktionen(start).flatMap((aktion) => (aktion.typ === 'SchlangenkorbSpielen' ? [aktion] : []))
    expect(new Set(boni.map((aktion) => aktion.bonus.art))).toEqual(new Set(['ziehen', 'tauschen', 'entfernen', 'aktionen']))
    const ki = erstelleSolideKi(erzeugeZufall(62))
    expect(ermittleAktionen(start)).toContainEqual(kiWahl(start, ki))
    for (const art of ['ziehen', 'tauschen', 'entfernen', 'aktionen']) {
      // Beim Entfernen die Regenbogenschlange des Gegners, damit er abwehren kann.
      const bonus = boni.filter((aktion) => aktion.bonus.art === art).at(-1)
      if (bonus === undefined) throw new Error(`Testaufbau: Bonus ${art} fehlt.`)
      let zustand = anwendeAktion(start, bonus).zustand
      // Bis der Zug an den Gegner geht: jede Wahl ist aufgezählt, auch die Abwehr des Gegners beim Entfernen.
      for (let schritt = 0; schritt < 12 && zustand.zug.spielerIndex === 0; schritt += 1) {
        const aktion = kiWahl(zustand, ki)
        if (aktion === null) throw new Error(`${art}: niemand entscheidet.`)
        expect(ermittleAktionen(zustand), `${art}, Schritt ${schritt}`).toContainEqual(aktion)
        zustand = anwendeAktion(zustand, aktion).zustand
      }
      expect(zustand.zug.spielerIndex, `${art}: der Zug ist beendet`).toBe(1)
    }
  }, 120_000)
})
