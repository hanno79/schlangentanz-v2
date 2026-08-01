/*
Author: Claude Code (G-12)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Die KI wehrt selbst ab — das Reaktionsfenster gehört dem Verteidiger.

Gemeldet am 01.08.2026: Nach einem Farbendieb gegen einen KI-Gegner fragte das
Brett **den Menschen**, ob Farbenschutz eingesetzt werden soll. Das ist die
Entscheidung des Angegriffenen, nicht des Angreifers — und der Farbenschutz ist
eine Karte auf *dessen* Hand.

Die Lücke saß zwischen zwei richtigen Annahmen: `spieleKiZuegeBisZumMenschen`
löst Reaktionen nur, solange die KI **am Zug** ist (`kiZug.ts:103`), und der
automatische Nachlauf in `usePartie` springt nur an, wenn die KI am Zug ist.
Greift der Mensch an, ist er selbst am Zug — also fühlte sich niemand zuständig,
und das Brett bot die Knöpfe dem Nächstbesten an.

`spieleKiReaktionenAus` schließt sie: Es löst jede offene Reaktion, deren
Verteidiger eine KI ist, unabhängig davon, wer am Zug ist. Bei einem
menschlichen Verteidiger hält es an — dessen Entscheidung darf ihm niemand
abnehmen.

Welche Reaktion die KI wählt, ist bewusst schlicht: abwehren, wenn sie kann.
Klügeres Abwägen ist ein eigener Schritt; erst muss sie überhaupt reagieren.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'
import { spieleKiReaktionenAus } from './kiZug'

/**
 * Mensch (0) greift an, KI (1) muss sich entscheiden.
 *
 * Die Zieldaten stehen vollständig in der Reaktion, weil das Durchlassen den
 * Diebstahl wirklich ausführt — eine halb gefüllte Reaktion prüfte nur die
 * Zuständigkeit und nicht die Wirkung.
 */
function menschGreiftKiAn(mitFarbenschutz: boolean): Spielzustand {
  const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  return {
    ...basis,
    aktiverSpielerIndex: 0,
    pendingReaktion: {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'ki-schlange',
      zielKartenId: 'beute',
      eigeneSchlangenId: 'meine-schlange',
      einfügeIndex: 0,
    },
    spieler: basis.spieler.map((spieler, index) => {
      if (index === 0) {
        return {
          ...spieler,
          steuerung: 'Mensch' as const,
          schlangen: [
            { id: 'meine-schlange', karten: [farbkarte('m1', 'Blau')], zustand: 'aktiv' as const },
          ],
        }
      }
      return {
        ...spieler,
        steuerung: 'KI' as const,
        hand: mitFarbenschutz ? [sonderkarte('schutz', 'Farbenschutz')] : [],
        schlangen: [
          { id: 'ki-schlange', karten: [farbkarte('beute', 'Rot')], zustand: 'aktiv' as const },
        ],
      }
    }),
  }
}

describe('spieleKiReaktionenAus', () => {
  it('löst die Reaktion eines KI-Verteidigers, obwohl der Mensch am Zug ist', () => {
    const { zustand } = spieleKiReaktionenAus(menschGreiftKiAn(true))

    expect(zustand.pendingReaktion).toBeNull()
  })

  it('setzt den Farbenschutz ein, wenn die KI einen hat', () => {
    const { zustand, protokoll } = spieleKiReaktionenAus(menschGreiftKiAn(true))

    expect(zustand.spieler[1].hand).toHaveLength(0)
    expect(protokoll.join(' ')).toMatch(/abwehren|Farbenschutz/i)
  })

  it('lässt durch, wenn die KI keinen Farbenschutz hat', () => {
    const { zustand, protokoll } = spieleKiReaktionenAus(menschGreiftKiAn(false))

    expect(zustand.pendingReaktion).toBeNull()
    expect(protokoll.join(' ')).toMatch(/durchlassen/i)
  })

  it('rührt eine Reaktion nicht an, deren Verteidiger ein Mensch ist', () => {
    const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const menschIstZiel: Spielzustand = {
      ...basis,
      aktiverSpielerIndex: 1,
      pendingReaktion: {
        typ: 'FarbendiebAbwehr',
        angreifenderSpielerIndex: 1,
        zielSpielerIndex: 0,
        zielSchlangenId: 'mensch-schlange',
        zielKartenId: 'beute',
        eigeneSchlangenId: 'ki-schlange',
        einfügeIndex: 0,
      },
      spieler: basis.spieler.map((spieler, index) => ({
        ...spieler,
        steuerung: index === 0 ? ('Mensch' as const) : ('KI' as const),
        hand: index === 0 ? [sonderkarte('schutz', 'Farbenschutz')] : spieler.hand,
      })),
    }

    const { zustand, protokoll } = spieleKiReaktionenAus(menschIstZiel)

    expect(zustand.pendingReaktion).not.toBeNull()
    expect(protokoll).toEqual([])
  })

  it('lässt einen Zustand ohne offene Reaktion unverändert', () => {
    const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    const { zustand, protokoll } = spieleKiReaktionenAus(basis)

    expect(zustand).toBe(basis)
    expect(protokoll).toEqual([])
  })
})
