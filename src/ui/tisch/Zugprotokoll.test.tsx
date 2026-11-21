import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { SpielAktion } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { warte } from '../spiel/__tests__/steuerung'
import { GEGNER_STRATEGIE, KI_PAUSE } from '../spiel/useSpiel'
import { spieleAm, tippe, zugleiste } from './__tests__/bedienen'
import { Zugprotokoll } from './Zugprotokoll'

/*
O6 am Tisch: Das Protokoll steht in der Tischfläche, der jüngste Schritt eines
Gegners zusätzlich in der Zugleiste, solange du wartest (K1). Dort steht auch
„Schneller“. Musst du aussetzen, sagt die Zugleiste es, bis du wieder handelst
(K4).
*/

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function kiMit(...vorrang: ((aktion: SpielAktion) => boolean)[]): Ki {
  return {
    name: 'Test-KI',
    waehle: (_sicht, aktionen) => vorrang.map((passt) => aktionen.find(passt)).find((aktion) => aktion !== undefined) ?? aktionen[0],
  }
}

const anDeinEnde = (aktion: SpielAktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1' && aktion.ziel.seite === 'ende'
const beenden = (aktion: SpielAktion) => aktion.typ === 'ZugBeenden'
const farbkarte = (aktion: SpielAktion) => aktion.typ === 'FarbkarteLegen'

const protokoll = () => within(screen.getByRole('log', { name: 'Protokoll' }))

describe('O6 K1: Protokoll und jüngster Schritt am Tisch', () => {
  it('O6 K1: der Schritt von KI-Gegner 1 steht in der Zugleiste und im Protokoll; „Schneller“ steht bereit', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(anDeinEnde, beenden))
    spieleAm(
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(81) })
        .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
        .schlange(0, ['Rot', 'Rot'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
    )
    expect(protokoll().getByText('Noch kein Schritt')).toBeInTheDocument()
    expect(zugleiste().getByRole('button', { name: 'Schneller' })).toHaveAttribute('aria-pressed', 'false')
    warte(KI_PAUSE)
    expect(zugleiste().getByText('KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.')).toBeInTheDocument()
    expect(protokoll().getByText('KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.')).toBeInTheDocument()
    tippe(zugleiste().getByRole('button', { name: 'Schneller' }))
    expect(zugleiste().getByRole('button', { name: 'Schneller' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('O6 K4: Aussetzen am Tisch', () => {
  it('O6 K4/A7.6: die Zugleiste sagt, dass du ausgesetzt hast; die Partie läuft weiter bis zu deinem Zug', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(beenden, farbkarte))
    spieleAm(
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(82) })
        .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
        .grube(1, 0)
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
    )
    warte(KI_PAUSE)
    warte(KI_PAUSE)
    expect(zugleiste().getByText('Du hast wegen der Schlangengrube einen Zug ausgesetzt.')).toBeInTheDocument()
    expect(protokoll().getByText('Du setzt diesen Zug aus (Schlangengrube).')).toBeInTheDocument()
    warte(KI_PAUSE)
    warte(KI_PAUSE)
    expect(screen.getByRole('status')).toHaveTextContent('Du bist')
    expect(zugleiste().getByText('Du hast wegen der Schlangengrube einen Zug ausgesetzt.')).toBeInTheDocument()
  })
})

describe('O6 K1: Reihenfolge im Protokoll', () => {
  it('O6 K1: der jüngste Schritt oben und hervorgehoben, innerhalb eines Schritts in der Reihenfolge des Geschehens', () => {
    const eintraege = [
      { schritt: 1, text: 'KI-Gegner 1 sagt an: Schlangengrube auf dich.' },
      { schritt: 2, text: 'Du wehrst Schlangengrube mit Farbenschutz ab.' },
      { schritt: 2, text: 'Schlangengrube bleibt ohne Wirkung.' },
    ]
    render(<Zugprotokoll verlauf={{ eintraege, ausgesetzt: false, schneller: false, schalteSchneller: () => {} }} />)
    const zeilen = protokoll().getAllByRole('listitem')
    expect(zeilen.map((zeile) => zeile.textContent)).toEqual([eintraege[1].text, eintraege[2].text, eintraege[0].text])
    expect(zeilen.map((zeile) => zeile.classList.contains('st-protokoll-eintrag--neu'))).toEqual([true, true, false])
  })
})
