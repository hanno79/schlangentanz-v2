// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { berechneEndwertung, ermittleAktionen, ermittleEntscheider, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { abwehren, durchlassen, waehle } from '../../entwicklung/szenarienTesthilfe'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { mischeVerborgenes } from '../__tests__/verborgenes'
import { nachDurchlassen, partieZustaende } from '../__tests__/stellungen'
import { endpunkte, kisK3gegenK2, partienK3gegenK2 } from '../__tests__/k3partien'
import { wehrtAb } from './abwehr'
import type { Angriffslage } from './abwehr'
import { bewerte, eigeneGruppen, gruppenwert, haltewert } from './bewertung'
import { erstelleSolideKi } from './solideKi'

/*
K3, Kriterien 4 und 6: Die Abwehr der soliden KI in Partien. Sie beruht nur auf der
Sicht.

Gesammelt wird jede Stellung, in der ein Spieler mit Farbenschutz gefragt ist, in
Partien der soliden KI (Stelle 0) gegen die solide KI im Stand von K2. Über jede
dieser Stellungen entscheidet die solide KI für den Gefragten, gleich wer an seiner
Stelle sitzt; sie sieht ja nur dessen Sicht.
*/

/** Jede Stellung der Partien, in der ein Gefragter Farbenschutz hält. */
const GEFRAGT: Spielzustand[] = partienK3gegenK2(36, 41_000).flatMap((partie) =>
  partieZustaende(partie, kisK3gegenK2(partie)).filter((zustand) => zustand.schwebend !== null && ermittleAktionen(zustand).some(abwehren)),
)

/** Punkte aus Farbgruppen und Vielfaltbonus (A11), ohne Kettenbonus und Aufgaben. */
function gruppenpunkte(zustand: Spielzustand, sitz: number): number {
  const wertung = berechneEndwertung(zustand).spieler[sitz]
  return wertung.gruppenPunkte + (wertung.vielfaltBonus ?? 0)
}
const gruppenzahl = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0)

/** Was der Gefragte vom echten Zustand aus erreicht: durchlassen oder abwehren, danach lassen weitere Gefragte durch. */
function ausgaenge(zustand: Spielzustand) {
  const gefragt = ermittleEntscheider(zustand)!
  const schutz = waehle(zustand, abwehren)
  return { gefragt, schutz, durch: nachDurchlassen(zustand, waehle(zustand, durchlassen), gefragt), abgewehrt: nachDurchlassen(zustand, schutz, gefragt) }
}

describe('K3 Kriterium 4: Abwehr in Partien', () => {
  it('K3.4: genug Stellungen, in denen jemand mit Farbenschutz gefragt ist, auch in der Schlussrunde', () => {
    expect(GEFRAGT.length, 'K3.4: Stellungen mit Farbenschutz').toBeGreaterThan(80)
    // Angriffe in der Schlussrunde sind selten; den Fall zeigt dazu das Szenario `ki-abwehr-schlussrunde`.
    expect(GEFRAGT.filter((zustand) => zustand.partiephase === 'Schlussrunde').length, 'K3.4: davon in der Schlussrunde').toBeGreaterThanOrEqual(3)
  })

  it('K3.4: zerstört ein Angriff eine eigene Gruppe oder kostet er die Gruppen mindestens 3 Punkte, wehrt sie mit Farbenschutz ab', () => {
    let geprueft = 0
    for (const zustand of GEFRAGT) {
      const { gefragt, durch } = ausgaenge(zustand)
      if (gruppenzahl(durch, gefragt) >= gruppenzahl(zustand, gefragt) && gruppenpunkte(zustand, gefragt) - gruppenpunkte(durch, gefragt) < 3) continue
      geprueft += 1
      const wahl = kiWahl(zustand, erstelleSolideKi(erzeugeZufall(geprueft)))
      expect(wahl, `K3.4: ${zustand.schwebend?.karte.name}, Gruppenpunkte ${gruppenpunkte(zustand, gefragt)} → ${gruppenpunkte(durch, gefragt)}`).toMatchObject({ typ: 'Reagieren', farbenschutzId: expect.any(String) })
    }
    expect(geprueft, 'K3.4: genug Angriffe auf Gruppen').toBeGreaterThan(20)
  }, 60_000)

  it('K3.4: sie wehrt genau dann ab, wenn der Schaden den Farbenschutz aufwiegt, in der Schlussrunde bei jedem Schaden; gerechnet auf dem echten Zustand', () => {
    const zaehlung = { abgewehrt: 0, durchgelassen: 0 }
    for (const [nummer, zustand] of GEFRAGT.entries()) {
      const { gefragt, schutz, durch, abgewehrt } = ausgaenge(zustand)
      const sicht = sichtFuer(zustand, gefragt)
      const nachher = sichtFuer(durch, gefragt)
      const lage: Angriffslage = {
        durchgelassen: bewerte(nachher),
        abgewehrt: bewerte(sichtFuer(abgewehrt, gefragt)),
        schutzwert: haltewert(sicht.hand.find((karte) => schutz.typ === 'Reagieren' && karte.id === schutz.farbenschutzId)!, sicht),
        schlussrunde: zustand.partiephase === 'Schlussrunde',
        gruppenpunkte: { vorher: gruppenwert(sicht.spieler[gefragt], sicht.erweiterung), nachher: gruppenwert(nachher.spieler[gefragt], sicht.erweiterung) },
        gruppen: { vorher: eigeneGruppen(sicht), nachher: eigeneGruppen(nachher) },
      }
      const erwartet = wehrtAb(lage)
      const wahl = kiWahl(zustand, erstelleSolideKi(erzeugeZufall(nummer)))
      expect(wahl?.typ === 'Reagieren' && wahl.farbenschutzId !== null, `K3.4: Stellung ${nummer}, ${zustand.schwebend?.karte.name}, ${JSON.stringify(lage)}`).toBe(erwartet)
      if (erwartet) zaehlung.abgewehrt += 1
      else zaehlung.durchgelassen += 1
      if (lage.schlussrunde && (endpunkte(durch, gefragt) < endpunkte(zustand, gefragt) || zustand.schwebend?.karte.name === 'Schlangengrube')) {
        expect(erwartet, `K3.4: Schlussrunde, Stellung ${nummer}: Punkte oder Zug verloren, also abwehren`).toBe(true)
      }
    }
    expect(zaehlung.abgewehrt, 'K3.4: sie wehrt ab').toBeGreaterThan(10)
    expect(zaehlung.durchgelassen, 'K3.4: sie lässt auch durch').toBeGreaterThan(0)
  }, 60_000)
})

describe('K3 Kriterium 6 (K2.7): die Abwehr beruht nur auf der Sicht', () => {
  it('K3.6: in jeder gesammelten Stellung bleibt die Abwehrentscheidung gleich, wenn fremde Hände, Stapel und fremde geheime Aufgaben neu gemischt werden', () => {
    let veraendert = 0
    const abweichend: number[] = []
    for (const [nummer, zustand] of GEFRAGT.entries()) {
      const gemischt = mischeVerborgenes(zustand, ermittleEntscheider(zustand)!, erzeugeZufall(9000 + nummer))
      if (JSON.stringify(gemischt) !== JSON.stringify(zustand)) veraendert += 1
      const wahl = (stand: Spielzustand) => JSON.stringify(kiWahl(stand, erstelleSolideKi(erzeugeZufall(nummer))))
      if (wahl(gemischt) !== wahl(zustand)) abweichend.push(nummer)
    }
    expect(veraendert, 'K3.6: das Mischen verändert fast jede Stellung').toBeGreaterThan(0.9 * GEFRAGT.length)
    expect(abweichend, 'K3.6: hier hinge die Abwehr vom Verdeckten ab').toEqual([])
  }, 60_000)
})

describe('K3 Kriterium 4: die Abwehrregel', () => {
  /** Laufend: Durchlassen bewertet mit 10, der Farbenschutz ist 1.2 wert. */
  function lage(abgewehrt: number, schlussrunde: boolean, gruppenpunkte = { vorher: 5, nachher: 5 }, gruppen = { vorher: 1, nachher: 1 }): Angriffslage {
    return { durchgelassen: 10, abgewehrt, schutzwert: 1.2, schlussrunde, gruppenpunkte, gruppen }
  }

  it('K3.4: wehrtAb: eine Gruppe immer; sonst laufend, wenn das Abwehren trotz verlorenem Farbenschutz besser steht, in der Schlussrunde bei jedem Schaden, bei Gleichstand nie', () => {
    expect(wehrtAb(lage(9.9, false)), 'K3.4: Schaden 1.1 wiegt den Farbenschutz (1.2) nicht auf').toBe(false)
    expect(wehrtAb(lage(10.1, false)), 'K3.4: Schaden 1.3 wiegt ihn auf').toBe(true)
    expect(wehrtAb(lage(10, false)), 'K3.4: Gleichstand').toBe(false)
    expect(wehrtAb(lage(8.9, true)), 'K3.4: Schlussrunde, Schaden 0.1').toBe(true)
    expect(wehrtAb(lage(8.8, true)), 'K3.4: Schlussrunde, kein Schaden').toBe(false)
    expect(wehrtAb(lage(7.8, true)), 'K3.4: Schlussrunde, der Angriff nützt').toBe(false)
    expect(wehrtAb(lage(0, false, { vorher: 5, nachher: 3 }, { vorher: 1, nachher: 0 })), 'K3.4: Gruppe verloren').toBe(true)
    expect(wehrtAb(lage(0, false, { vorher: 9, nachher: 6 })), 'K3.4: drei Gruppenpunkte verloren').toBe(true)
    expect(wehrtAb(lage(0, false, { vorher: 9, nachher: 7 })), 'K3.4: zwei Punkte, keine Gruppe').toBe(false)
  })
})
