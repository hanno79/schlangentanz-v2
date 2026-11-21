import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { berechneEndwertung } from '../../engine'
import type { Spielzustand } from '../../engine'
import { gibErfuellteAufgabe, legeGeheimeAufgabe } from '../../engine/testing/aufgaben'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { endstaende } from '../spiel/__tests__/endstaende'
import { ergebnisAnsicht } from '../spiel/ergebnisAnsicht'
import { Ergebnis } from './Ergebnis'

/*
O8: Die Wertung nach Spielende. Sie zeigt je Spieler getrennt Farbgruppen je
Schlange, die Farbe jedes Jokers, die längste Farbkette und mit Erweiterung
Vielfaltbonus und Aufgaben (Kriterien 1 und 2), alle Sieger (Kriterium 3) und
die Wege „Noch einmal“ und „Zur Lobby“ (Kriterium 4). Jede Zahl stammt aus der
Endwertung der Engine; die Seite rechnet nichts nach.
*/

afterEach(cleanup)

function zeige(zustand: Spielzustand, nochEinmal: () => void = () => {}) {
  return render(<Ergebnis ergebnis={ergebnisAnsicht(zustand)} nochEinmal={nochEinmal} />)
}

/** Der Eintrag eines Spielers in der Rangliste; der Mensch heisst dort „Du“. */
const eintrag = (name: string) => screen.getByRole('listitem', { name })

/** Die Zahl eines Postens („farbgruppen“, „vielfalt“, „kette“, „aufgaben“) oder die Gesamtpunkte. */
function zahl(element: HTMLElement, testId: string): number {
  const text = within(element).getByTestId(testId).textContent ?? ''
  const treffer = /-?\d+/.exec(text)
  if (treffer === null) throw new Error(`zahl: In ${testId} steht keine Zahl, sondern „${text}“.`)
  return Number(treffer[0])
}

const schlange = (spieler: HTMLElement, nummer: number) => within(spieler).getByRole('region', { name: new RegExp(`^Schlange ${nummer}\\b`) })

describe('O8 K1: Wertung je Spieler getrennt', () => {
  it('O8 K1/A11: Farbgruppen je Schlange mit Farbe, Länge und Punkten, dazu Vielfalt, Kette, Aufgaben und Summe', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    const ki2 = eintrag('KI-Gegner 2')
    expect(zahl(ki2, 'gesamt')).toBe(28)
    expect(zahl(ki2, 'posten-farbgruppen')).toBe(26)
    expect(zahl(ki2, 'posten-vielfalt')).toBe(2)
    expect(zahl(ki2, 'posten-kette')).toBe(0)
    expect(zahl(ki2, 'posten-aufgaben')).toBe(0)

    const erste = schlange(ki2, 1)
    expect(within(erste).getByRole('heading')).toHaveTextContent('Schlange 1: 15 Punkte')
    expect(erste).toHaveTextContent('Rot × 3: 3 Punkte')
    expect(erste).toHaveTextContent('Violett × 3: 6 Punkte')
    expect(erste).toHaveTextContent('Braun × 3: 6 Punkte')
    expect(erste).toHaveTextContent('Vielfalt: Rot, Violett, Braun')
    expect(within(schlange(ki2, 2)).getByRole('heading')).toHaveTextContent('Schlange 2: 11 Punkte')
  })

  it('O8 K1: jede Schlange steht mit ihren Karten da, die Gruppen in Worten im Namen der Reihe', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    const reihe = within(eintrag('KI-Gegner 1')).getByRole('list', { name: /^KI-Gegner 1, Schlange 1:/ })
    expect(reihe).toHaveAccessibleName('KI-Gegner 1, Schlange 1: 8 Karten, Farbgruppen Rot (3), Rot (4)')
    expect(within(reihe).getAllByRole('img')).toHaveLength(8)
  })

  it('O8 K1/A11/D24: die längste Kette nennt ihre Länge; ohne Kette ab 3 Farbkarten steht das da', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    const ki1 = eintrag('KI-Gegner 1')
    expect(zahl(ki1, 'posten-kette')).toBe(5)
    expect(ki1).toHaveTextContent('Längste Kette: 4 Karten')
    expect(eintrag('Du')).toHaveTextContent('Keine Kette ab 3 Farbkarten')
  })

  it('O8 K1: ohne Erweiterung gibt es weder Vielfalt noch Aufgaben', () => {
    zeige(erzeugeSzenario('wertung-beispiele-kette'))
    const du = eintrag('Du')
    expect(within(du).queryByTestId('posten-vielfalt')).toBeNull()
    expect(within(du).queryByTestId('posten-aufgaben')).toBeNull()
    expect(du).not.toHaveTextContent('Vielfalt')
    expect(zahl(du, 'posten-farbgruppen')).toBe(7)
    expect(zahl(du, 'posten-kette')).toBe(5)
  })

  it('O8 K1/A11 Abschnitt 4: erfüllte offene Aufgaben und die geheime Aufgabe mit Namen und Punkten', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: true })
      .schlange(0, ['Blau', 'Blau', 'Blau'])
      .aendere((stand) => {
        gibErfuellteAufgabe(stand, 0, 'Farbkombination')
        legeGeheimeAufgabe(stand, 1, 'Gelber Schatz', true)
      })
      .beendet(0)
      .zustand()
    zeige(zustand)
    const du = eintrag('Du')
    expect(zahl(du, 'posten-aufgaben')).toBe(5)
    expect(du).toHaveTextContent('Farbkombination: 5 Punkte')
    const ki1 = eintrag('KI-Gegner 1')
    expect(zahl(ki1, 'posten-aufgaben')).toBe(5)
    expect(ki1).toHaveTextContent('Gelber Schatz (geheim): 5 Punkte')
    expect(ki1).toHaveTextContent('Keine Schlange')
  })

  it('O8 K1: 50 Endstände echter Partien: Gesamt und Posten stimmen mit berechneEndwertung überein', () => {
    for (const { saat, zustand } of endstaende(50)) {
      const endwertung = berechneEndwertung(zustand)
      zeige(zustand)
      const eintraege = within(screen.getByRole('list', { name: 'Wertung' })).getAllByRole('listitem', { name: /./ })
      expect(eintraege, `Saat ${saat}: ein Eintrag je Spieler`).toHaveLength(endwertung.spieler.length)
      for (const wertung of endwertung.spieler) {
        const zeile = eintrag(wertung.spielerId === 'spieler-1' ? 'Du' : wertung.name)
        const posten = [
          zahl(zeile, 'posten-farbgruppen'),
          zahl(zeile, 'posten-kette'),
          ...(zustand.erweiterung ? [zahl(zeile, 'posten-vielfalt'), zahl(zeile, 'posten-aufgaben')] : []),
        ]
        expect(zahl(zeile, 'gesamt'), `Saat ${saat}, ${wertung.name}: Gesamt`).toBe(wertung.summe)
        expect(posten.reduce((summe, wert) => summe + wert, 0), `Saat ${saat}, ${wertung.name}: Posten ergeben die Summe`).toBe(wertung.summe)
        expect(zahl(zeile, 'posten-farbgruppen'), `Saat ${saat}, ${wertung.name}: Farbgruppen`).toBe(wertung.gruppenPunkte)
      }
      cleanup()
    }
  }, 120_000)
})

describe('O8 K2: Joker nennen ihre gewertete Farbe', () => {
  it('O8 K2/A11: Regenbogenschlange und Farbenfusion stehen mit der Farbe, als die sie gewertet wurden', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    const du = eintrag('Du')
    expect(schlange(du, 1)).toHaveTextContent('Farbenfusion als Violett')
    expect(schlange(du, 2)).toHaveTextContent('Farbenfusion als Blau')
    expect(schlange(eintrag('KI-Gegner 2'), 2)).toHaveTextContent('Regenbogenschlange als Rot')
    expect(schlange(eintrag('KI-Gegner 3'), 1)).toHaveTextContent('Regenbogenschlange als Blau')
    expect(schlange(eintrag('KI-Gegner 3'), 2)).toHaveTextContent('Regenbogenschlange als Braun')
  })

  it('O8 K2: ein Joker in keiner Gruppe sagt das, statt eine Farbe zu nennen', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Rot', 'Regenbogenschlange', 'Blau']).beendet(0).zustand()
    zeige(zustand)
    expect(schlange(eintrag('Du'), 1)).toHaveTextContent('Regenbogenschlange in keiner Gruppe')
  })
})

describe('O8 K3/D22: Sieger', () => {
  it('O8 K3/D22: bei Gleichstand stehen alle Sieger im Titel und tragen das Abzeichen', () => {
    zeige(erzeugeSzenario('wertung-beispiele-kette'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gleichstand: Du und KI-Gegner 1 gewinnen!')
    expect(within(eintrag('Du')).getByText('Sieger')).toBeInTheDocument()
    expect(within(eintrag('KI-Gegner 1')).getByText('Sieger')).toBeInTheDocument()
    expect(within(eintrag('KI-Gegner 2')).queryByText('Sieger')).toBeNull()
  })

  it('O8 K3: ein Sieger allein, dazu dein Platz', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('KI-Gegner 2 gewinnt!')
    expect(screen.getByTestId('ergebnis')).toHaveTextContent('Mit 28 Punkten. Du bist auf Platz 3 mit 10 Punkten.')
    expect(within(screen.getByRole('list', { name: 'Wertung' })).getAllByText('Sieger')).toHaveLength(1)
  })

  it('O8 K3: gewinnst du allein, sagt der Titel es dir', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Grün', 'Grün', 'Grün']).beendet(0).zustand()
    zeige(zustand)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Du gewinnst!')
    expect(screen.getByTestId('ergebnis')).toHaveTextContent('Mit 14 Punkten.')
  })
})

describe('O8 K4: Noch einmal und Zur Lobby', () => {
  it('O8 K4: „Noch einmal“ ruft den Neustart genau einmal, „Zur Lobby“ führt auf die Lobby', () => {
    const nochEinmal = vi.fn()
    zeige(erzeugeSzenario('wertung-beispiele'), nochEinmal)
    fireEvent.click(screen.getByRole('button', { name: 'Noch einmal' }))
    expect(nochEinmal).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: 'Zur Lobby' })).toHaveAttribute('href', '/')
  })
})
