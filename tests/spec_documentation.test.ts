import { describe, expect, it } from 'vitest'
import { fehlende, spec } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`: die Rangfolge der Quellen und das Verfahren bei
Änderungen. Die Teile A bis E prüfen `spec_documentation_teil_a.test.ts` bis
`spec_documentation_teil_e.test.ts`; die gemeinsamen Hilfen und die Regeln
gegen Brüchigkeit stehen in `spec_documentation_hilfen.ts`.
*/

describe('GAME_SPEC Rangfolge der Quellen', () => {
  it('nennt die Website als einzige verbindliche Regelquelle', () => {
    expect(
      fehlende(spec, [
        'Die Website `https://schlangentanz.ch/rules` ist die einzige verbindliche Regelquelle.',
        'Dieses Dokument spiegelt die Website.',
        'Alles andere ist keine Regelquelle:',
        'Dart-Tasks und Dart-Dokumente',
      ]),
    ).toEqual([])
  })

  it('legt das Verfahren bei Änderungen fest', () => {
    expect(
      fehlende(spec, [
        'Regeln ändern sich nur auf der Website.',
        'Was die Website nicht hergibt, wird nicht geraten.',
        'Ein Widerspruch zwischen Website und Code ist ein Fehler im Code.',
      ]),
    ).toEqual([])
  })

  it('trägt genau eine Statuszeile mit dem Datum des Abgleichs', () => {
    const statuszeilen = spec.split('\n').filter((zeile) => zeile.startsWith('Status:'))
    expect(statuszeilen).toHaveLength(1)
    expect(statuszeilen[0]).toMatch(
      /^Status: \*\*Abgeglichen mit der Website am \d{2}\.\d{2}\.\d{4}\.\*\*$/,
    )
  })
})
