import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import * as engine from '../../engine'
import { serialisiere } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { roh } from '../spiel/__tests__/steuerung'
import { ausfuehren, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'

/*
O5, Kriterium 7: Lehnt die Engine eine Aktion des Menschen ab, zeigt die
Oberfläche ihren deutschen Grund (B2, U12). Angeboten wird nur, was die Engine
aufzählt; eine Ablehnung entsteht also erst, wenn Aufzählen und Prüfen
auseinanderliegen. Der Test stellt das nach, indem die Prüfung der Engine hier
einmal ablehnt.
*/

vi.mock('../../engine', async (original) => {
  const echt = await original<typeof import('../../engine')>()
  return { ...echt, pruefeAktion: vi.fn(echt.pruefeAktion) }
})

describe('O5 K7: Eine abgelehnte Aktion zeigt den deutschen Grund', () => {
  it('O5 K7/U12: der Grund der Engine steht in der Zugleiste, gespielt ist nichts, die Auswahl bleibt', () => {
    const grund = 'Diese Farbkarte darf hier nicht liegen (A5).'
    vi.mocked(engine.pruefeAktion).mockReturnValueOnce({ erlaubt: false, grund })
    const start = erzeugeSzenario('farbkarte-beim-gegner')
    spieleAm(start)
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    tippeZiel('KI-Gegner 1, Schlange 1: Ende')
    ausfuehren()
    expect(screen.getByRole('alert')).toHaveTextContent(grund)
    expect(zugleiste().getByRole('alert')).toHaveTextContent(grund)
    expect(roh()).toBe(serialisiere(start))
    expect(handkarte('Farbkarte Rot, 1 Punkt')).toHaveAttribute('aria-pressed', 'true')
  })
})
