import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { serialisiere } from '../../engine'
import { kartenname } from '../karten/kartentexte'
import { roh } from '../spiel/__tests__/steuerung'
import { zehnHandkarten } from './__tests__/szenarien'
import { aktionMit, gespieltWurde, spieleAm, tippe, zugleiste } from './__tests__/bedienen'

/*
O5, Kriterium 8: Hält der Mensch am Zugende mehr als 5 Karten, wählt er selbst,
welche er auf seinen Ablagestapel legt (A5). Wie viele es sind und welche
Auswahl gilt, sagt die Engine: Sie zählt jede erlaubte Auswahl als eigene
Aktion auf.
*/

const dialog = () => screen.getByRole('dialog', { name: 'Zu viele Handkarten' })
/** Die Handkarten im Dialog, in der Reihenfolge der Hand. */
const karten = () => within(dialog()).getAllByRole<HTMLButtonElement>('button').filter((knopf) => knopf.hasAttribute('aria-pressed'))
const ablegen = () => within(dialog()).getByRole<HTMLButtonElement>('button', { name: 'Ablegen' })

describe('O5 K8: Mehr als 5 Handkarten am Zugende: Der Mensch wählt, was er ablegt', () => {
  it('O5 K8/A5: der Dialog nennt die Zahl, „Ablegen“ geht erst mit genau so vielen Karten, und es legt genau die gewählten ab', () => {
    const start = zehnHandkarten()
    const hand = start.spieler[0].hand
    spieleAm(start)
    expect(dialog()).toHaveTextContent('10 Karten')
    expect(dialog()).toHaveTextContent('5')
    expect(karten().map((knopf) => knopf.getAttribute('aria-label')), 'alle zehn in der Reihenfolge der Hand').toEqual(hand.map(kartenname))
    expect(ablegen()).toBeDisabled()

    for (const stelle of [9, 0, 4, 2]) tippe(karten()[stelle])
    expect(ablegen(), 'vier von fünf').toBeDisabled()
    expect(dialog()).toHaveTextContent('Wähle noch 1 Karte.')

    const fuenfte = karten()[7]
    tippe(fuenfte)
    expect(ablegen()).toBeEnabled()
    const frei = karten().filter((knopf) => knopf.getAttribute('aria-pressed') === 'false')
    expect(frei.every((knopf) => knopf.disabled), 'mit fünf gewählten ist keine weitere Karte wählbar').toBe(true)

    tippe(fuenfte)
    expect(ablegen(), 'eine wieder abgewählt').toBeDisabled()
    tippe(fuenfte)
    expect(roh(), 'vor „Ablegen“ ist nichts geschehen').toBe(serialisiere(start))
    tippe(ablegen())

    const ids = [hand[0], hand[2], hand[4], hand[7], hand[9]].map((karte) => karte.id).sort().join()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'UeberhandAbwerfen' && [...a.karteIds].sort().join() === ids))).toBe(true)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('O5 K8: „Zum Tisch“ schliesst den Dialog, die Zugleiste öffnet ihn wieder, die Wahl bleibt', () => {
    const start = zehnHandkarten()
    spieleAm(start)
    tippe(karten()[0])
    tippe(within(dialog()).getByRole('button', { name: 'Zum Tisch' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(zugleiste().getByText(/Lege 5 überzählige Karten ab/)).toBeInTheDocument()
    tippe(zugleiste().getByRole('button', { name: 'Karten wählen' }))
    expect(karten()[0]).toHaveAttribute('aria-pressed', 'true')
    expect(karten().filter((knopf) => knopf.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
  })
})
