import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { berechneEndwertung, berechneZwischenstand } from '../engine'
import type { Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { findeSzenario } from './szenarien'
import { WertungsAnsicht } from './WertungsAnsicht'

/*
E10: Die Szenarien `wertung-beispiele`, `wertung-beispiele-kette` und
`wertung-joker` legen die Rechenbeispiele der Website und die Grenzfälle mit
Jokern auf den Entwicklertisch. Die Zahlen hier sind von Hand nachgerechnet; das
erwartete Verhalten jedes Szenarios nennt dieselben Zahlen.
*/

function szenario(name: string): { zustand: Spielzustand; erwartet: string } {
  const gefunden = findeSzenario(name)
  if (gefunden === undefined) throw new Error(`Szenario ${name} fehlt`)
  return { zustand: gefunden.erzeuge(), erwartet: gefunden.erwartet }
}

function summen(zustand: Spielzustand): number[] {
  return berechneEndwertung(zustand).spieler.map((s) => s.summe)
}

describe('E10: Szenarien der Wertung am Entwicklertisch', () => {
  it('A11/A7.3/A7.7: wertung-beispiele legt die Beispiele aus A11, A7.3 und A7.7 als Schlangen aus', () => {
    const { zustand, erwartet } = szenario('wertung-beispiele')
    expect(pruefeInvarianten(zustand).filter((i) => i.verletzt)).toEqual([])
    expect(zustand.partiephase).toBe('Beendet')
    const wertung = berechneEndwertung(zustand)
    expect(wertung.spieler.map((s) => s.schlangen.map((schlange) => schlange.gruppenPunkte))).toEqual([[6, 4], [7], [15, 11], [2, 4]])
    expect(wertung.spieler.map((s) => s.schlangen.map((schlange) => schlange.vielfaltBonus))).toEqual([[0, 0], [0], [2, 2], [0, 0]])
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 0, bonus: 0 },
      { laenge: 4, bonus: 5 },
      { laenge: 3, bonus: 0 },
      { laenge: 0, bonus: 0 },
    ])
    expect(summen(zustand)).toEqual([10, 12, 28, 6])
    expect(wertung.gewinner).toEqual([zustand.spieler[2].id])
    for (const zahl of ['6', '4', '7', '15', '11', '2', '28']) expect(erwartet).toContain(zahl)
  })

  it('A11/D22: wertung-beispiele-kette zeigt das Kettenbeispiel, Gleichstand beim Kettenbonus und beim Sieg', () => {
    const { zustand, erwartet } = szenario('wertung-beispiele-kette')
    expect(pruefeInvarianten(zustand).filter((i) => i.verletzt)).toEqual([])
    const wertung = berechneEndwertung(zustand)
    expect(wertung.spieler.map((s) => s.kette?.laenge)).toEqual([4, 4, 0])
    expect(wertung.spieler.map((s) => s.gruppenPunkte)).toEqual([7, 7, 4])
    expect(summen(zustand)).toEqual([12, 12, 4])
    expect(wertung.gewinner).toEqual([zustand.spieler[0].id, zustand.spieler[1].id])
    expect(erwartet).toContain('12')
  })

  it('A11/A7.3/A7.7: wertung-joker zeigt Vielfaltbonus, Gleichstand der Jokerfarben, verbundene Gruppen und Aufgaben', () => {
    const { zustand, erwartet } = szenario('wertung-joker')
    expect(pruefeInvarianten(zustand).filter((i) => i.verletzt)).toEqual([])
    expect(zustand.partiephase).toBe('Laufend')
    const wertung = berechneEndwertung(zustand)
    expect(wertung.spieler.map((s) => s.schlangen.flatMap((schlange) => schlange.joker.map((j) => j.farbe)))).toEqual([
      ['Rot', 'Blau'],
      ['Gelb', 'Violett', 'Violett'],
      [],
      [],
    ])
    expect(wertung.spieler.map((s) => s.gruppenPunkte)).toEqual([9, 14, 0, 51])
    expect(wertung.spieler.map((s) => s.vielfaltBonus)).toEqual([1, 0, 0, 4])
    expect(wertung.spieler[3].schlangen.map((s) => s.vielfaltBonus)).toEqual([4, 4])
    expect(wertung.spieler.map((s) => s.kette?.bonus)).toEqual([5, 0, 0, 5])
    expect(wertung.spieler.map((s) => s.aufgabenPunkte)).toEqual([5, 5, 0, 0])
    expect(summen(zustand)).toEqual([20, 19, 0, 60])
    const zwischenstand = berechneZwischenstand(zustand, zustand.spieler[0].id)
    expect(zwischenstand.spieler.map((s) => s.summe)).toEqual([15, 14, 0, 55])
    for (const zahl of ['20', '19', '60', '15', '14', '55']) expect(erwartet).toContain(zahl)
  })
})

describe('E10: Wertungsansicht am Entwicklertisch', () => {
  it('A11: zeigt Zwischenstand aus Sicht von Spieler 1 und Endwertung mit Aufschlüsselung je Spieler', () => {
    const { zustand } = szenario('wertung-joker')
    render(<WertungsAnsicht zustand={zustand} />)
    const zwischenstand = screen.getByTestId('zwischenstand')
    expect(zwischenstand).toHaveTextContent(`Sicht ${zustand.spieler[0].name}`)
    expect(within(zwischenstand).getAllByTestId('summe').map((zelle) => zelle.textContent)).toEqual(['15', '14', '0', '55'])
    const endwertung = screen.getByTestId('endwertung')
    expect(within(endwertung).getAllByTestId('summe').map((zelle) => zelle.textContent)).toEqual(['20', '19', '0', '60'])
    const aufschluesselung = screen.getAllByTestId('aufschluesselung')
    expect(aufschluesselung).toHaveLength(4)
    expect(aufschluesselung[0]).toHaveTextContent('Regenbogenschlange')
    expect(aufschluesselung[0]).toHaveTextContent('als Rot')
    expect(aufschluesselung[0]).toHaveTextContent('Farbenfusion')
    expect(aufschluesselung[0]).toHaveTextContent('als Blau')
    expect(aufschluesselung[0]).toHaveTextContent('Vielfaltbonus 1')
    expect(aufschluesselung[0]).toHaveTextContent('Farbkombination')
    expect(aufschluesselung[1]).toHaveTextContent('Gelber Schatz')
    expect(aufschluesselung[1]).toHaveTextContent('geheim')
    expect(aufschluesselung[2]).toHaveTextContent('keine Schlange')
    expect(screen.getByTestId('gewinner')).toHaveTextContent(zustand.spieler[3].name)
  })

  it('A11: ohne Erweiterung zeigt die Ansicht weder Vielfaltbonus noch Aufgaben als Zahl', () => {
    const { zustand } = szenario('wertung-beispiele-kette')
    render(<WertungsAnsicht zustand={zustand} />)
    const aufschluesselung = screen.getAllByTestId('aufschluesselung')
    expect(aufschluesselung[0]).toHaveTextContent('Vielfaltbonus: ohne Erweiterung')
    expect(aufschluesselung[0]).toHaveTextContent('Aufgaben: ohne Erweiterung')
    expect(aufschluesselung[0]).toHaveTextContent('Kette 4, Bonus 5')
    expect(screen.getByTestId('gewinner')).toHaveTextContent(`${zustand.spieler[0].name} (12), ${zustand.spieler[1].name} (12)`)
  })
})
