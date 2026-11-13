import { test } from '@playwright/test'
import { readFileSync } from 'node:fs'

/*
P0.3c: bekannte Befunde in den neuen Geräteklassen.

Ein Vertrag, der in Tablet hochkant oder Handy quer rot ist, steht mit Befund in
`geraeteklassen_ausnahmen.json`. Für genau dieses Paar aus Vertrag und
Geräteklasse erwartet Playwright ein Scheitern (`test.fail`), im Produktions-
wie im Testhook-Projekt der Klasse. Wird der Vertrag grün, meldet Playwright
„expected to fail, but passed“, und der Eintrag muss gehen: Die Liste kann nur
schrumpfen. Dass sie nicht wächst, prüft `tests/geraeteklassen_ausnahmen.test.ts`.
*/

export type Ausnahme = { datei: string; vertrag: string; klasse: string; befund: string }

const { ausnahmen } = JSON.parse(
  readFileSync(new URL('./geraeteklassen_ausnahmen.json', import.meta.url), 'utf8'),
) as { ausnahmen: Ausnahme[] }

/** Gilt für jeden Vertrag der aufrufenden Datei; einmal auf oberster Ebene aufrufen. */
export function duldeBekannteAusnahmen(): void {
  // eslint-disable-next-line no-empty-pattern -- Playwright verlangt als erstes Argument ein Objektmuster, auch ohne Fixture.
  test.beforeEach(({}, info) => {
    const klasse = info.project.name.replace(/-testhooks$/, '')
    // titlePath beginnt mit der Spec-Datei relativ zu tests/layout; `info.file` wäre bei
    // Verträgen aus waechter.ts deren Datei, nicht die Spec, die sie aufruft.
    const [spec = '', ...gruppeUndTest] = info.titlePath
    const datei = `tests/layout/${spec.replaceAll('\\', '/')}`
    const vertrag = gruppeUndTest.join(' › ')
    const ausnahme = ausnahmen.find(
      (eintrag) => eintrag.klasse === klasse && eintrag.vertrag === vertrag && eintrag.datei === datei,
    )
    if (ausnahme !== undefined) test.fail(true, `P0.3c, bekannter Befund in ${ausnahme.klasse}: ${ausnahme.befund}`)
  })
}
