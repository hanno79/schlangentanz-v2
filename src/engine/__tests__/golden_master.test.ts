import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { protokolliere } from '../testing/partieprotokoll'

/*
E11, Kriterium 5: der Golden Master der Basis-Engine. Drei Zufallspartien mit
fester Saat, ohne Erweiterung, zu zweit, zu dritt und zu viert. Ihr Protokoll
(`testing/partieprotokoll.ts`) liegt lesbar unter `golden/`; vor dem Einfrieren
liest ein Prüfer die Partie zu zweit Zug für Zug gegen Teil A.

Ändert eine Regel den Verlauf, wird der Test rot und zeigt die Stelle im Text.
Ist die Änderung gewollt, liest man den neuen Verlauf wieder gegen Teil A und
schreibt ihn mit `npx vitest run src/engine/__tests__/golden_master.test.ts -u`.
*/

const PARTIEN = [
  { saat: 5, spielerzahl: 2, datei: 'golden/partie-2-spieler-saat-5.txt' },
  { saat: 3, spielerzahl: 3, datei: 'golden/partie-3-spieler-saat-3.txt' },
  { saat: 2, spielerzahl: 4, datei: 'golden/partie-4-spieler-saat-2.txt' },
]

describe('A4/A5/A6/A7/A10/A11: Golden Master, drei Partien mit fester Saat (E11, Kriterium 5)', () => {
  it.each(PARTIEN)('A10: $spielerzahl Spieler, Saat $saat: der Verlauf gleicht Zug für Zug dem eingefrorenen Protokoll', async ({ saat, spielerzahl, datei }) => {
    const pfad = new URL(datei, import.meta.url)
    expect(existsSync(pfad), `protokolliere: ${datei} fehlt; eingefroren wird erst nach der Lektüre gegen Teil A`).toBe(true)
    await expect(protokolliere({ saat, spielerzahl, erweiterung: false }).text).toMatchFileSnapshot(datei)
  })

  it.each(PARTIEN)('A6/A7.2/A7.8/A10: $spielerzahl Spieler, Saat $saat: eine Abwehr, ein zweiter Zug nach dem Verdoppler, und die Schlussrunde hat N−1 Züge', ({ saat, spielerzahl }) => {
    const protokoll = protokolliere({ saat, spielerzahl, erweiterung: false })
    expect(protokoll.abwehren, 'A7.2: Abwehren mit Farbenschutz in der Partie').toBeGreaterThan(0)
    expect(protokoll.zweiteZuege, 'A7.8: zweite Züge nach einem Verdoppler in der Partie').toBeGreaterThan(0)
    expect(protokoll.letzteZuege, 'A10: letzte Züge in der Schlussrunde, gespielt oder ausgesetzt').toBe(spielerzahl - 1)
  })

  it('A10: gleiche Saat, gleiches Protokoll; andere Saat, anderes Protokoll', () => {
    const erste = protokolliere({ saat: 5, spielerzahl: 2, erweiterung: false }).text
    expect(protokolliere({ saat: 5, spielerzahl: 2, erweiterung: false }).text).toBe(erste)
    expect(protokolliere({ saat: 6, spielerzahl: 2, erweiterung: false }).text).not.toBe(erste)
  })
})
