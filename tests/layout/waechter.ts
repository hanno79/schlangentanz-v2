/*
Author: Claude Code (1b)
Datum: 03.08.2026
Version: 1.0
Beschreibung: Die vier generischen Wächter als ein Block, den jeder Vertrag ruft.

Bis hierher standen sie wörtlich in `brett_waechter.spec.ts` und noch einmal in
`sieger_party.hooks.spec.ts` — gleiche Namen, gleiche Aufrufe, gleiche
Meldungstexte. Dass das nicht trägt, ist belegt: Der fünfte Wächter
(`findeZusammengedruecktes`, 02.08.2026) musste bereits in zwei Dateien
nachgetragen werden, und `brett_dauerlauf.spec.ts` ist dabei abgedriftet
(`expect.soft(...).toHaveLength(0)` statt `toEqual([])`). Ein sechster hätte an
drei Stellen gepflegt werden müssen, und eine vergessene Stelle wäre still grün.

Die Fragen selbst sind bewusst **nicht** an Klassennamen gebunden: Sie überleben
jeden Umbau und gelten für jede Route (docs/SPIELBRETT_SPEC.md).
*/

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  befundListe,
  findeAbgeschnittenes,
  findeAusserhalbDesBildes,
  findeVerdeckteBedienelemente,
  findeZusammengedruecktes,
} from './messung'

/**
 * Registriert die vier Wächter-Verträge im umgebenden `describe`.
 *
 * @param pruefe `test` oder `test.fail` — mit `test.fail` bleibt der Anspruch
 *   sichtbar, ohne die Suite rot zu färben, und Playwright meldet „unerwartet
 *   grün", sobald die Lücke geschlossen ist.
 */
export function waechterVertraege(pruefe: typeof test | typeof test.fail = test): void {
  pruefe('kein sichtbares Element schneidet seinen Inhalt ab', async ({ page }: { page: Page }) => {
    const befunde = await findeAbgeschnittenes(page)
    expect(befunde, `${befunde.length} Element(e) schneiden ihren Inhalt ab:${befundListe(befunde)}`).toEqual([])
  })

  pruefe('kein Bedienelement liegt außerhalb des Bildes', async ({ page }: { page: Page }) => {
    const befunde = await findeAusserhalbDesBildes(page)
    expect(befunde, `${befunde.length} Bedienelement(e) außerhalb des Bildes:${befundListe(befunde)}`).toEqual([])
  })

  pruefe('kein Bedienelement ist vollständig verdeckt', async ({ page }: { page: Page }) => {
    const befunde = await findeVerdeckteBedienelemente(page)
    expect(befunde, `${befunde.length} Bedienelement(e) vollständig verdeckt:${befundListe(befunde)}`).toEqual([])
  })

  /* ÄNDERUNG [02.08.2026]: Fünfter Wächter — siehe `findeZusammengedruecktes`.
     Dass er im Erstbild nichts findet, ist sein Normalzustand und kein Grund, ihn
     wegzulassen: Die anderen vier finden dort auch nichts, solange das Brett in
     Ordnung ist. Er läuft zusätzlich nach acht Runden
     (`brett_dauerlauf.spec.ts`), weil der Fehler, für den es ihn gibt, erst im
     Spielverlauf entstand. */
  pruefe('kein Textinhalt ist unter eine Zeilenhöhe gedrückt', async ({ page }: { page: Page }) => {
    const befunde = await findeZusammengedruecktes(page)
    expect(befunde, `${befunde.length} Element(e) zeigen nicht einmal eine ganze Zeile:${befundListe(befunde)}`).toEqual(
      [],
    )
  })
}

/**
 * Ist das Brett für den Spieler bedienbar — oder als `inert` stillgelegt?
 *
 * ÄNDERUNG [03.08.2026, Punkt 1b]: Die Wächter überspringen seit heute
 * `inert`-Teilbäume, weil ein Knopf darin keine Bedienung mehr ist. Das ist
 * richtig, aber es ist ein **stummer** Filter: Bliebe das Brett versehentlich
 * `inert`, lieferten `findeAusserhalbDesBildes` und
 * `findeVerdeckteBedienelemente` leere Listen — und beide Brett-Verträge wären
 * grün, ohne noch irgendetwas zu messen. Genau diese Sorte Fehler ist der Grund,
 * warum es diese Testfamilie gibt.
 *
 * Deshalb sagt jeder Vertrag ausdrücklich, welchen Zustand er erwartet.
 */
export async function brettIstInert(page: Page): Promise<boolean> {
  return page.evaluate(() => document.querySelector('main.spielbrett')?.matches('[inert]') ?? false)
}
