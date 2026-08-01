/*
Author: Claude Code (G-5)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Spielerlage — insbesondere zwei Dinge, die das alte Brett nicht zeigte.

`setztAus` kam dort in keiner einzigen `.tsx`-Datei vor: Wer durch eine
Schlangengrube eine Runde aussetzt, erfuhr das nirgends.

Und die geheime Aufgabe darf ausschließlich die des Menschen sein. Sie eines
KI-Gegners zu zeigen wäre kein Anzeigefehler, sondern ein Regelbruch.

**ÄNDERUNG [01.08.2026]:** Die Aufgabe zu verbergen genügt nicht, wenn ihre
Punkte sie verraten. `berechneSpielerGesamtPunkte` zählt die erfüllte geheime
Aufgabe mit (`scoring.ts`); dieselbe Zahl stand am Brett neben jedem Gegner.
Erfüllte eine KI ihre geheime Aufgabe, sprang ihre angezeigte Punktzahl um genau
deren Wert — ablesbar, welche Aufgabe es war.

Während des Spiels zeigt das Brett deshalb für **jeden** Spieler nur die
öffentlich bekannten Punkte: Farbgruppen und beanspruchte *offene* Aufgaben. Die
geheimen zählen in der Schlusswertung, und dort zählen sie für alle.
*/

import { describe, expect, it } from 'vitest'
import { erstelleEinzelspielerSpielzustand, erstelleSpielzustand } from '../engine'
import type { Spielzustand } from '../engine'
import { ermittleSpielerLagen, geheimeAufgabeDesMenschen } from './spielerLage'

describe('ermittleSpielerLagen', () => {
  it('markiert genau den Spieler, der am Zug ist', () => {
    const zustand = erstelleSpielzustand(3, () => 0.5)
    zustand.aktiverSpielerIndex = 1

    const lagen = ermittleSpielerLagen(zustand)
    expect(lagen.map((lage) => lage.istAmZug)).toEqual([false, true, false])
  })

  it('meldet, wer aussetzen muss', () => {
    const zustand = erstelleSpielzustand(3, () => 0.5)
    zustand.aussetzenSpielerIndizes = [2]

    const lagen = ermittleSpielerLagen(zustand)
    expect(lagen.map((lage) => lage.setztAus)).toEqual([false, false, true])
  })

  it('meldet niemanden als aussetzend, solange die Liste leer ist', () => {
    const lagen = ermittleSpielerLagen(erstelleSpielzustand(2, () => 0.5))
    expect(lagen.some((lage) => lage.setztAus)).toBe(false)
  })

  it('unterscheidet Mensch und KI', () => {
    const lagen = ermittleSpielerLagen(erstelleEinzelspielerSpielzustand(2))
    expect(lagen.filter((lage) => lage.istMensch)).toHaveLength(1)
  })

  it('führt Punkte, Schlangen und Handkarten je Spieler', () => {
    const zustand = erstelleSpielzustand(2, () => 0.5)
    const lagen = ermittleSpielerLagen(zustand)

    expect(lagen[0].handkarten).toBe(zustand.spieler[0].hand.length)
    expect(lagen[0].schlangen).toBe(zustand.spieler[0].schlangen.length)
    expect(typeof lagen[0].punkte).toBe('number')
  })
})

describe('geheimeAufgabeDesMenschen', () => {
  it('liefert die Aufgabe des Menschen, nicht die einer KI', () => {
    const zustand = erstelleEinzelspielerSpielzustand(2)
    const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')

    const aufgabe = geheimeAufgabeDesMenschen(zustand)
    expect(aufgabe?.text).toContain(mensch!.geheimeAufgabe.name)
  })

  it('zeigt die Aufgabe auch dann, wenn eine KI am Zug ist — aber weiterhin die des Menschen', () => {
    const zustand = erstelleEinzelspielerSpielzustand(2)
    zustand.aktiverSpielerIndex = zustand.spieler.findIndex((spieler) => spieler.steuerung === 'KI')
    const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')

    expect(geheimeAufgabeDesMenschen(zustand)?.text).toContain(mensch!.geheimeAufgabe.name)
  })

  it('meldet die Erfüllung, sobald die Engine sie gesetzt hat', () => {
    const zustand = erstelleEinzelspielerSpielzustand(2)
    const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')!
    mensch.geheimeAufgabeErfuellt = true

    expect(geheimeAufgabeDesMenschen(zustand)?.erfuellt).toBe(true)
  })
})

describe('Geheime Aufgaben dürfen sich nicht über die Punkte verraten', () => {
  /** Setzt die geheime Aufgabe eines Spielers auf erfüllt. */
  function mitErfuellterGeheimAufgabe(zustand: Spielzustand, index: number): Spielzustand {
    return {
      ...zustand,
      spieler: zustand.spieler.map((spieler, i) =>
        i === index ? { ...spieler, geheimeAufgabeErfuellt: true } : spieler,
      ),
    }
  }

  it('lässt die Punktzahl eines Gegners unverändert, wenn er seine geheime Aufgabe erfüllt', () => {
    const vorher = erstelleSpielzustand(2, () => 0.5)
    const nachher = mitErfuellterGeheimAufgabe(vorher, 1)

    const punkteVorher = ermittleSpielerLagen(vorher)[1].punkte
    const punkteNachher = ermittleSpielerLagen(nachher)[1].punkte

    expect(punkteNachher).toBe(punkteVorher)
  })

  it('zählt beanspruchte offene Aufgaben weiterhin mit — die sind öffentlich', () => {
    const basis = erstelleSpielzustand(2, () => 0.5)
    const offene = basis.offeneAufgaben[0]
    const zustand: Spielzustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, i) =>
        i === 1 ? { ...spieler, erfuellteAufgaben: [offene] } : spieler,
      ),
    }

    const zuwachs = ermittleSpielerLagen(zustand)[1].punkte - ermittleSpielerLagen(basis)[1].punkte
    expect(zuwachs).toBe(offene.punkte)
  })

  it('behandelt den Menschen genauso — sonst wären die Zahlen nicht vergleichbar', () => {
    const vorher = erstelleEinzelspielerSpielzustand(1, () => 0.5)
    const nachher = mitErfuellterGeheimAufgabe(vorher, 0)

    expect(ermittleSpielerLagen(nachher)[0].punkte).toBe(ermittleSpielerLagen(vorher)[0].punkte)
  })

  it('nennt dem Menschen den Wert seiner geheimen Aufgabe, damit er selbst rechnen kann', () => {
    const zustand = erstelleEinzelspielerSpielzustand(1, () => 0.5)

    const aufgabe = geheimeAufgabeDesMenschen(zustand)
    expect(aufgabe?.punkte).toBe(zustand.spieler[0].geheimeAufgabe.punkte)
  })
})
