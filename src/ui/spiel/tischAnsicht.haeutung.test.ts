import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneZwischenstand, ermittleAktionen, serialisiere } from '../../engine'
import type { SchlangenhaeutungSpielenAktion, SpielAktion, Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { tischAnsicht } from './tischAnsicht'

/*
O7, Kriterium 3: Die Punkte vorher und nachher stammen aus der Engine. Die
Sicht des Menschen rechnet sie nicht selbst, sondern spielt die aufgezählte
Häutung auf einer Abschrift des Zustands und liest den Zwischenstand der
Engine davor und danach.
*/

const istHaeutung = (aktion: SpielAktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen'

const summe = (zustand: Spielzustand, spieler: number) => berechneZwischenstand(zustand, 'spieler-1').spieler[spieler].summe

/** Der Stand, nachdem der Besitzer der Schlange die Häutung durchgelassen hat (A6, D33). */
function durchgelassen(zustand: Spielzustand, aktion: SchlangenhaeutungSpielenAktion): Spielzustand {
  const angesagt = anwendeAktion(zustand, aktion).zustand
  const durchlassen = ermittleAktionen(angesagt).find((eintrag) => eintrag.typ === 'Reagieren' && eintrag.farbenschutzId === null)
  if (durchlassen === undefined) throw new Error('Testaufbau: der Besitzer kann die Häutung nicht durchlassen')
  return anwendeAktion(angesagt, durchlassen).zustand
}

describe('O7 K3: Punkte vorher und nachher stammen aus der Engine', () => {
  it('O7 K3/A11: in deiner Schlange sind vorher und nachher die Summen deines Zwischenstands vor und nach der Häutung', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    const ansicht = tischAnsicht(zustand)
    const haeutungen = ansicht.aktionen.filter(istHaeutung).filter((aktion) => aktion.schlangenId === 'schlange-1')
    expect(haeutungen.length).toBeGreaterThan(0)
    const punkte = new Set<number>()
    for (const aktion of haeutungen) {
      const vorschau = ansicht.haeutungsVorschau('schlange-1', aktion)
      const danach = anwendeAktion(zustand, aktion).zustand
      expect(vorschau.besitzer).toEqual({ name: zustand.spieler[0].name, ich: true })
      expect(vorschau.vorher).toBe(summe(zustand, 0))
      expect(vorschau.nachher?.punkte, JSON.stringify(aktion.neueReihenfolge)).toBe(summe(danach, 0))
      expect(vorschau.nachher?.schlange.karten.map((glied) => glied.karte.id)).toEqual(danach.spieler[0].schlangen[0].karten.map((karte) => karte.id))
      punkte.add(vorschau.nachher!.punkte)
    }
    expect(punkte.size, 'manche Häutungen bringen Punkte, andere nicht').toBeGreaterThan(1)
  })

  it('O7 K3/A6: in der Schlange eines Gegners zählen seine Punkte, nachher so, als liesse er die Häutung durch', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    const ansicht = tischAnsicht(zustand)
    const haeutungen = ansicht.aktionen.filter(istHaeutung).filter((aktion) => aktion.schlangenId === 'schlange-2')
    expect(haeutungen.length).toBeGreaterThan(0)
    let gesunken = false
    for (const aktion of haeutungen) {
      const vorschau = ansicht.haeutungsVorschau('schlange-2', aktion)
      expect(vorschau.besitzer).toEqual({ name: zustand.spieler[1].name, ich: false })
      expect(vorschau.vorher).toBe(summe(zustand, 1))
      const danach = durchgelassen(zustand, aktion)
      expect(vorschau.nachher?.punkte).toBe(summe(danach, 1))
      expect(vorschau.nachher?.schlange.karten.map((glied) => glied.karte.id)).toEqual(danach.spieler[1].schlangen[0].karten.map((karte) => karte.id))
      if (vorschau.nachher!.punkte < vorschau.vorher) gesunken = true
    }
    expect(gesunken, 'eine Häutung kann die Gruppe des Gegners zerstören').toBe(true)
  })

  it('O7 K3: die Farbgruppen der Schlange danach kommen aus der Wertung der Engine', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    const ansicht = tischAnsicht(zustand)
    const aktion = ansicht.aktionen.filter(istHaeutung).find((eintrag) => eintrag.schlangenId === 'schlange-1' && summe(anwendeAktion(zustand, eintrag).zustand, 0) > 0)!
    const nachher = ansicht.haeutungsVorschau('schlange-1', aktion).nachher!
    const erwartet = tischAnsicht(anwendeAktion(zustand, aktion).zustand).ich.schlangen[0]
    expect(nachher.schlange).toEqual(erwartet)
    expect(nachher.schlange.farbgruppen.length).toBeGreaterThan(0)
  })

  it('O7 K3: ohne Aktion nur der Stand vorher; eine unbekannte Schlange oder eine Häutung einer anderen Schlange ist ein Fehler', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    const ansicht = tischAnsicht(zustand)
    expect(ansicht.haeutungsVorschau('schlange-2', null)).toEqual({ besitzer: { name: zustand.spieler[1].name, ich: false }, vorher: summe(zustand, 1), nachher: null })
    expect(() => ansicht.haeutungsVorschau('schlange-9', null)).toThrow(/schlange-9/)
    const fremd = ansicht.aktionen.filter(istHaeutung).find((aktion) => aktion.schlangenId === 'schlange-1')!
    expect(() => ansicht.haeutungsVorschau('schlange-2', fremd)).toThrow(/schlange-1/)
  })

  it('O7/B2: die Vorschau lässt den Spielstand unverändert', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    const vorher = serialisiere(zustand)
    const ansicht = tischAnsicht(zustand)
    for (const aktion of ansicht.aktionen.filter(istHaeutung)) ansicht.haeutungsVorschau(aktion.schlangenId, aktion)
    expect(serialisiere(zustand)).toBe(vorher)
  })
})
