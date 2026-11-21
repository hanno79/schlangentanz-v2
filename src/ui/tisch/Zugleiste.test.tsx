import { describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { anwendeAktion, ermittleAktionen, serialisiere } from '../../engine'
import type { Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { starteEntwicklerPartie } from '../../entwicklung/partie'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { roh } from '../spiel/__tests__/steuerung'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { angriffAufMich, mittelspiel, volltisch, zehnHandkarten } from './__tests__/szenarien'
import { aktionMit, ausfuehren, gespieltWurde, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'
import { Tisch } from './Tisch'

/*
O5, Kriterien 5 und 6: „Zug beenden“ ist bedienbar, wenn und nur wenn die
Engine es anbietet, und nach einem Verdoppler sagt die Statuszeile, dass der
zweite Zug läuft.
*/

/** Jeder dritte Zustand einer Partie mit gleichverteilter Wahl, bis zu `bis` Schritte. */
function partie(saat: number, spieler: number, bis: number): Spielzustand[] {
  const zufall = erzeugeZufall(saat * 131)
  let zustand = starteEntwicklerPartie(saat, spieler, false)
  const gesammelt: Spielzustand[] = []
  for (let schritt = 0; schritt < bis && zustand.partiephase !== 'Beendet'; schritt += 1) {
    if (schritt % 3 === 0) gesammelt.push(zustand)
    const aktionen = ermittleAktionen(zustand)
    zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
  }
  return gesammelt
}

const zugBeenden = () => screen.queryByRole('button', { name: 'Zug beenden' }) as HTMLButtonElement | null

describe('O5 K5: „Zug beenden“ ist genau dann bedienbar, wenn die Engine es erlaubt', () => {
  it('O5 K5/U3: in Szenarien und gespielten Partien, ob du entscheidest oder nicht', () => {
    const zustaende = [
      mittelspiel(),
      volltisch(),
      angriffAufMich(),
      zehnHandkarten(),
      ...['farbkarte-beim-gegner', 'nur-farbenschutz', 'verdoppler', 'schlussrunde-2', 'stapel-fast-leer'].map(erzeugeSzenario),
      ...partie(4, 2, 90),
      ...partie(5, 3, 90),
    ]
    let erlaubtGesehen = 0
    for (const zustand of zustaende) {
      render(<Tisch ansicht={tischAnsicht(zustand)} fuehreAus={() => {}} ablehnung={null} />)
      const erlaubt = tischAnsicht(zustand).aktionen.some((aktion) => aktion.typ === 'ZugBeenden')
      const knopf = zugBeenden()
      expect(knopf !== null && !knopf.disabled, `${serialisiere(zustand).slice(0, 60)}…: Zug beenden erlaubt ${erlaubt}`).toBe(erlaubt)
      if (erlaubt) erlaubtGesehen += 1
      cleanup()
    }
    expect(erlaubtGesehen, 'mindestens ein Zustand, in dem du den Zug beenden darfst').toBeGreaterThan(0)
  })

  it('O5 K5/A5: zu Beginn gesperrt mit Grund, nach einer Karte bedienbar, und es beendet den Zug', () => {
    const start = erzeugeSzenario('farbkarte-beim-gegner')
    spieleAm(start)
    expect(zugBeenden()).toBeDisabled()
    expect(zugleiste().getByText('Du musst immer mindestens eine Karte spielen.')).toBeInTheDocument()
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    tippeZiel('Deine Schlange 1: Ende')
    ausfuehren()
    const nachKarte = aktionMit(start, (a) => a.typ === 'FarbkarteLegen' && a.karteId === start.spieler[0].hand[0].id && a.ziel.art === 'schlange' && a.ziel.schlangenId === 'schlange-1' && a.ziel.seite === 'ende')
    const mitte = anwendeAktion(start, nachKarte).zustand
    expect(zugBeenden()).toBeEnabled()
    tippe(zugBeenden()!)
    expect(gespieltWurde(mitte, aktionMit(mitte, (a) => a.typ === 'ZugBeenden'))).toBe(true)
  })
})

describe('O5 K6: Nach einem Verdoppler zeigt die Statuszeile den zweiten Zug', () => {
  it('O5 K6/A7.8: Verdoppler, Farbkarte, Zug beenden: „Zweiter Zug nach dem Verdoppler“', () => {
    const start = erzeugeSzenario('verdoppler')
    spieleAm(start)
    expect(screen.getByRole('status')).not.toHaveTextContent('Zweiter Zug')
    tippe(handkarte('Sonderkarte Verdoppler'))
    ausfuehren()
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    tippeZiel('Neue Schlange')
    ausfuehren()
    tippe(zugBeenden()!)
    expect(screen.getByRole('status')).toHaveTextContent('Zweiter Zug nach dem Verdoppler')
    expect(roh()).not.toBe(serialisiere(start))
  })
})
