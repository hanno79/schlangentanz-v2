// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { mischeVerborgenes } from '../__tests__/verborgenes'
import { nachDurchlassen } from '../__tests__/stellungen'
import { erstelleSolideKiK2 } from '../__tests__/k2stand/solideKi'
import type { Ki } from './strategie'
import { wehrtAb } from './abwehr'
import { bewerte, eigeneGruppen, eigenePunkte, haltewert } from './bewertung'
import { erstelleSolideKi } from './solideKi'

/*
K3, Kriterien 4 und 6: Die Abwehr der soliden KI in Partien. Sie beruht nur auf der
Sicht.

Gesammelt wird jede Stellung, in der ein Spieler mit Farbenschutz gefragt ist, in
Partien der soliden KI (Stelle 0) gegen die solide KI im Stand von K2. Über jede
dieser Stellungen entscheidet die solide KI für den Gefragten, gleich wer an seiner
Stelle sitzt; sie sieht ja nur dessen Sicht.
*/

/** Partien mit 2 bis 4 Spielern, mit und ohne Erweiterung. */
const PARTIEN = Array.from({ length: 36 }, (_, nummer) => ({ spielerzahl: 2 + (nummer % 3), erweiterung: nummer % 2 === 1, saat: 41_000 + nummer }))

function kisFuer(spielerzahl: number, saat: number): Ki[] {
  return Array.from({ length: spielerzahl }, (_, sitz) => (sitz === 0 ? erstelleSolideKi(erzeugeZufall(saat * 3 + 1)) : erstelleSolideKiK2(erzeugeZufall(saat * 5 + sitz))))
}

const haeltSchutz = (zustand: Spielzustand) => ermittleAktionen(zustand).some((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null)

/** Jede Stellung der Partien, in der ein Gefragter Farbenschutz hält. */
const GEFRAGT: Spielzustand[] = PARTIEN.flatMap(({ spielerzahl, erweiterung, saat }) => {
  const kis = kisFuer(spielerzahl, saat)
  const gesammelt: Spielzustand[] = []
  let zustand = erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
  for (let schritt = 0; schritt < 5000 && zustand.partiephase !== 'Beendet'; schritt += 1) {
    const entscheider = ermittleEntscheider(zustand)
    if (entscheider === null) break
    if (zustand.schwebend !== null && haeltSchutz(zustand)) gesammelt.push(zustand)
    zustand = anwendeAktion(zustand, kiWahl(zustand, kis[entscheider])!).zustand
  }
  return gesammelt
})

const end = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].summe
const gruppen = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0)

/** Was der Gefragte vom echten Zustand aus erreicht: durchlassen oder abwehren, danach lassen weitere Gefragte durch. */
function ausgaenge(zustand: Spielzustand) {
  const gefragt = ermittleEntscheider(zustand)!
  const angeboten = ermittleAktionen(zustand)
  const durchlassen = angeboten.find((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null)!
  const abwehren = angeboten.find((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null)!
  return { gefragt, durchlassen, abwehren, durch: nachDurchlassen(zustand, durchlassen, gefragt), abgewehrt: nachDurchlassen(zustand, abwehren, gefragt) }
}

describe('K3 Kriterium 4: Abwehr in Partien', () => {
  it('K3.4: genug Stellungen, in denen jemand mit Farbenschutz gefragt ist, auch in der Schlussrunde', () => {
    expect(GEFRAGT.length, 'K3.4: Stellungen mit Farbenschutz').toBeGreaterThan(80)
    // Angriffe in der Schlussrunde sind selten; den Fall zeigt dazu das Szenario `ki-abwehr-schlussrunde`.
    expect(GEFRAGT.filter((zustand) => zustand.partiephase === 'Schlussrunde').length, 'K3.4: davon in der Schlussrunde').toBeGreaterThanOrEqual(3)
  })

  it('K3.4: zerstört ein Angriff eine eigene Gruppe oder kostet er mindestens 3 Punkte, wehrt sie mit Farbenschutz ab', () => {
    let geprueft = 0
    for (const zustand of GEFRAGT) {
      const { gefragt, durch } = ausgaenge(zustand)
      if (gruppen(durch, gefragt) >= gruppen(zustand, gefragt) && end(zustand, gefragt) - end(durch, gefragt) < 3) continue
      geprueft += 1
      const wahl = kiWahl(zustand, erstelleSolideKi(erzeugeZufall(geprueft)))
      expect(wahl, `K3.4: ${zustand.schwebend?.karte.name}, Endwertung ${end(zustand, gefragt)} → ${end(durch, gefragt)}`).toMatchObject({ typ: 'Reagieren', farbenschutzId: expect.any(String) })
    }
    expect(geprueft, 'K3.4: genug Angriffe auf Gruppen').toBeGreaterThan(20)
  }, 60_000)

  it('K3.4: sie wehrt genau dann ab, wenn der Schaden den Farbenschutz aufwiegt, in der Schlussrunde bei jedem Schaden; gerechnet auf dem echten Zustand', () => {
    const zaehlung = { abgewehrt: 0, durchgelassen: 0, schlussrundeSchaden: 0 }
    for (const [nummer, zustand] of GEFRAGT.entries()) {
      const { gefragt, abwehren, durch, abgewehrt } = ausgaenge(zustand)
      const sicht = sichtFuer(zustand, gefragt)
      const schutz = sicht.hand.find((karte) => abwehren.typ === 'Reagieren' && karte.id === abwehren.farbenschutzId)!
      const schutzwert = haltewert(schutz, sicht)
      const schaden = bewerte(sichtFuer(abgewehrt, gefragt)) + schutzwert - bewerte(sichtFuer(durch, gefragt))
      const schlussrunde = zustand.partiephase === 'Schlussrunde'
      const nachher = sichtFuer(durch, gefragt)
      const erwartet = wehrtAb({
        schaden,
        schutzwert,
        schlussrunde,
        punkte: { vorher: eigenePunkte(sicht), nachher: eigenePunkte(nachher) },
        gruppen: { vorher: eigeneGruppen(sicht), nachher: eigeneGruppen(nachher) },
      })
      const wahl = kiWahl(zustand, erstelleSolideKi(erzeugeZufall(nummer)))
      expect(wahl?.typ === 'Reagieren' && wahl.farbenschutzId !== null, `K3.4: Stellung ${nummer}, ${zustand.schwebend?.karte.name}, Schaden ${schaden.toFixed(3)}, Schutz ${schutzwert}, ${zustand.partiephase}`).toBe(erwartet)
      if (erwartet) zaehlung.abgewehrt += 1
      else zaehlung.durchgelassen += 1
      if (schlussrunde && (end(durch, gefragt) < end(zustand, gefragt) || zustand.schwebend?.karte.name === 'Schlangengrube')) {
        zaehlung.schlussrundeSchaden += 1
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
      const gefragt = ermittleEntscheider(zustand)!
      const gemischt = mischeVerborgenes(zustand, gefragt, erzeugeZufall(9000 + nummer))
      if (JSON.stringify(gemischt) !== JSON.stringify(zustand)) veraendert += 1
      const wahl = (stand: Spielzustand) => JSON.stringify(kiWahl(stand, erstelleSolideKi(erzeugeZufall(nummer))))
      if (wahl(gemischt) !== wahl(zustand)) abweichend.push(nummer)
    }
    expect(veraendert, 'K3.6: das Mischen verändert fast jede Stellung').toBeGreaterThan(0.9 * GEFRAGT.length)
    expect(abweichend, 'K3.6: hier hinge die Abwehr vom Verdeckten ab').toEqual([])
  }, 60_000)
})

describe('K3 Kriterium 4: die Abwehrregel', () => {
  it('K3.4: wehrtAb: eine Gruppe immer; sonst in laufender Partie erst über dem Wert des Farbenschutzes, in der Schlussrunde bei jedem Schaden, bei Gleichstand nie', () => {
    const lage = (schaden: number, schlussrunde: boolean, punkte = { vorher: 5, nachher: 5 }, gruppen = { vorher: 1, nachher: 1 }) => ({ schaden, schutzwert: 1.2, schlussrunde, punkte, gruppen })
    expect(wehrtAb(lage(1.0, false))).toBe(false)
    expect(wehrtAb(lage(1.3, false))).toBe(true)
    expect(wehrtAb(lage(1.2, false)), 'K3.4: Gleichstand').toBe(false)
    expect(wehrtAb(lage(0.1, true))).toBe(true)
    expect(wehrtAb(lage(0, true))).toBe(false)
    expect(wehrtAb(lage(-1, true))).toBe(false)
    expect(wehrtAb(lage(0.5, false, { vorher: 5, nachher: 3 }, { vorher: 1, nachher: 0 })), 'K3.4: Gruppe verloren').toBe(true)
    expect(wehrtAb(lage(0.5, false, { vorher: 9, nachher: 6 })), 'K3.4: drei Punkte verloren').toBe(true)
    expect(wehrtAb(lage(0.5, false, { vorher: 9, nachher: 7 })), 'K3.4: zwei Punkte, keine Gruppe').toBe(false)
  })
})
