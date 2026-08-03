/*
Author: Claude Code (1b)
Datum: 03.08.2026
Version: 1.0
Beschreibung: Guard — die Namensgebung `*.hooks.spec.ts` und der Test-Hook-Bedarf
              eines Layout-Vertrags müssen übereinstimmen.

Seit Punkt 1b fährt `npm run test:layout` zwei Playwright-Projekte
(`playwright.config.ts`): `chromium` misst den Produktionsbuild, und
`chromium-testhooks` misst einen Build mit `VITE_TEST_HOOKS=1`. Zugeordnet wird
allein über den Dateinamen.

Die Zuordnung fällt in eine Richtung laut aus und in die andere still — und die
stille ist die gefährliche:

- Verliert eine Hook-Datei ihren Suffix, läuft sie gegen `dist`, der Hook greift
  nicht, und die Vorbedingung im `beforeEach` schlägt fehl. **Laut.**
- Trägt eine Datei den Suffix, ohne den Hook zu brauchen, misst sie für immer
  `dist-testhooks` statt des ausgelieferten Builds — und bleibt grün. Ihr Urteil
  gilt dann für einen Build, den niemand bekommt. **Still.**

Dieser Guard schließt die stille Richtung, nach dem Vorbild von
`App.hooks_production_guard.test.ts`: Er liest die Quelltexte, statt sich auf
eine gepflegte Liste zu verlassen.
*/
/// <reference types="node" />

import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const VERZEICHNIS = 'tests/layout'
const SUFFIX = '.hooks.spec.ts'

/** Merkmale, an denen ein Vertrag den Test-Hook tatsächlich benutzt. */
const HOOK_MERKMALE = ['?phase=', '__schlangentanzFixture']

function vertragsDateien(): string[] {
  return readdirSync(VERZEICHNIS).filter((datei) => datei.endsWith('.spec.ts'))
}

function nutztTestHook(datei: string): boolean {
  const quelltext = readFileSync(`${VERZEICHNIS}/${datei}`, 'utf8')
  return HOOK_MERKMALE.some((merkmal) => quelltext.includes(merkmal))
}

describe('Layout-Verträge: Namensgebung und Hook-Bedarf stimmen überein', () => {
  it('findet überhaupt Verträge', () => {
    // Ohne diese Zusicherung wären die beiden Prüfungen unten leer und grün —
    // genau die Sorte Test, die nichts misst.
    expect(vertragsDateien().length).toBeGreaterThan(0)
  })

  it('jeder Vertrag, der den Test-Hook benutzt, heißt `*.hooks.spec.ts`', () => {
    const falschBenannt = vertragsDateien().filter((datei) => nutztTestHook(datei) && !datei.endsWith(SUFFIX))
    expect(
      falschBenannt,
      `Diese Verträge benutzen den Test-Hook, laufen aber gegen den Produktionsbuild, wo er aus ist: ${falschBenannt.join(', ')}`,
    ).toEqual([])
  })

  it('jeder `*.hooks.spec.ts` benutzt den Test-Hook auch', () => {
    const ohneBedarf = vertragsDateien().filter((datei) => datei.endsWith(SUFFIX) && !nutztTestHook(datei))
    expect(
      ohneBedarf,
      'Diese Verträge messen den Build mit VITE_TEST_HOOKS=1, brauchen ihn aber nicht — ' +
        `sie gehören an den Produktionsbuild: ${ohneBedarf.join(', ')}`,
    ).toEqual([])
  })
})
