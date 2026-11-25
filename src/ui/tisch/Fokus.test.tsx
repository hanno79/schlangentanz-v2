import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { SpielAktion } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { warte } from '../spiel/__tests__/steuerung'
import { GEGNER_STRATEGIE, KI_PAUSE } from '../spiel/useSpiel'
import { handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'

/*
O11, Kriterium 1: Wer nur mit der Tastatur spielt, verliert den Fokus nie an
die leere Seite. Verschwindet der Knopf mit dem Fokus („Ausführen“ nach dem
Spielen, deine Handkarten, wenn ein Gegner dran ist), springt der Fokus auf
den nächsten sinnvollen Knopf: zuerst in der Zugleiste, sonst auf deine erste
spielbare Handkarte. Beim Öffnen der Seite stiehlt der Tisch den Fokus nicht.
*/

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Drückt den Knopf so, wie es die Tastatur tut: erst den Fokus darauf, dann auslösen. */
function druecke(knopf: HTMLElement): void {
  knopf.focus()
  expect(document.activeElement, 'Testaufbau: der Knopf nimmt den Fokus').toBe(knopf)
  tippe(knopf)
}

const fokus = () => document.activeElement

describe('O11 K1: Der Fokus bleibt am Tisch', () => {
  it('O11 K1: beim Öffnen der Seite nimmt der Tisch den Fokus nicht an sich', () => {
    spieleAm(erzeugeSzenario('farbkarte-beim-gegner'))
    expect(fokus()).toBe(document.body)
  })

  it('O11 K1: nach „Ausführen“ springt der Fokus auf „Zug beenden“', () => {
    spieleAm(erzeugeSzenario('farbkarte-beim-gegner'))
    druecke(handkarte('Farbkarte Rot, 1 Punkt'))
    tippeZiel('KI-Gegner 1, Schlange 1: Ende')
    druecke(zugleiste().getByRole('button', { name: 'Ausführen' }))
    expect(fokus(), 'nach „Ausführen“ steht der Fokus auf der leeren Seite').not.toBe(document.body)
    expect(fokus()).toBe(zugleiste().getByRole('button', { name: 'Zug beenden' }))
  })

  it('O11 K1: nach „Zug beenden“ steht der Fokus auf „Schneller“, danach auf deiner ersten spielbaren Handkarte', () => {
    const ki: Ki = { name: 'Test-KI', waehle: (_sicht, aktionen) => aktionen.find((aktion: SpielAktion) => aktion.typ === 'ZugBeenden') ?? aktionen[0] }
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => ki)
    spieleAm(
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(83) })
        .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
        .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
        .schlange(0, ['Rot', 'Rot'])
        .schlange(1, ['Blau', 'Blau'])
        .haendeAuffuellen()
        .amZug(0)
        .zustand(),
    )
    druecke(handkarte('Farbkarte Blau, 1 Punkt'))
    tippeZiel('Deine Schlange 1: Ende')
    druecke(zugleiste().getByRole('button', { name: 'Ausführen' }))
    druecke(zugleiste().getByRole('button', { name: 'Zug beenden' }))
    expect(fokus()).toBe(zugleiste().getByRole('button', { name: 'Schneller' }))
    warte(KI_PAUSE)
    warte(KI_PAUSE)
    const hand = within(screen.getByRole('region', { name: 'Deine Hand' }))
    expect(hand.getAllByRole('button')[0], 'Testaufbau: du bist wieder dran').toBeEnabled()
    expect(fokus()).toBe(hand.getAllByRole('button').find((knopf) => !(knopf as HTMLButtonElement).disabled && knopf.hasAttribute('aria-pressed')))
  })

  it('O11 K1: nach der Abwehr steht der Fokus nicht auf der leeren Seite', () => {
    spieleAm(erzeugeSzenario('angriff-auf-dich'))
    druecke(zugleiste().getByRole('button', { name: 'Abwehren' }))
    expect(fokus()).not.toBe(document.body)
    expect(screen.getByTestId('spiel').contains(fokus())).toBe(true)
  })
})
