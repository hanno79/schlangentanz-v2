/*
Author: Claude Code (1b)
Datum: 03.08.2026
Version: 1.0
Beschreibung: Die generischen Wächter als ein Block, den jeder Vertrag ruft.

`waechterVertraege` registriert **vier** Prüfungen: abgeschnitten, außerhalb des
Bildes, verdeckt, unter eine Zeilenhöhe gedrückt. Das Elementbudget gehört
bewusst nicht dazu — es gilt für das Brett, nicht für jede Route
(`brett_waechter.spec.ts` hängt es selbst an).

Die Zählung ist historisch verwirrend, deshalb einmal ausgeschrieben: Die
Spezifikation spricht von „vier Fragen" (abgeschnitten, außerhalb, verdeckt,
Budget). Am 02.08.2026 kam „zusammengedrückt" als *fünfter* Wächter dazu. Hier
stehen daher vier Prüfungen, aber es sind nicht dieselben vier.

Bis hierher standen sie wörtlich in `brett_waechter.spec.ts` und noch einmal in
`sieger_party.hooks.spec.ts` — gleiche Namen, gleiche Aufrufe, gleiche
Meldungstexte. Dass das nicht trägt, ist belegt: Der fünfte Wächter musste
bereits in zwei Dateien nachgetragen werden, und `brett_dauerlauf.spec.ts` ist
dabei abgedriftet (`expect.soft(...).toHaveLength(0)` statt `toEqual([])`). Ein
sechster hätte an drei Stellen gepflegt werden müssen, und eine vergessene
Stelle wäre still grün.

Die Fragen selbst sind bewusst **nicht** an Klassennamen gebunden: Sie überleben
jeden Umbau und gelten für jede Route (docs/SPIELBRETT_SPEC.md).
*/

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  befundListe,
  findeAbgeschnittenes,
  findeAusserhalbDesBildes,
  findeSchwacheKontraste,
  findeStillgelegteBedienelemente,
  findeVerdeckteBedienelemente,
  findeZusammengedruecktes,
  kontrastAbdeckung,
} from './messung'

/**
 * Registriert die vier Wächter-Prüfungen im umgebenden `describe`.
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

  /* ÄNDERUNG [04.08.2026]: Sechster Wächter — Kontrast.

     Die fünf davor fragen, ob Inhalt *da* ist. Dieser fragt, ob man ihn lesen
     kann. Der Anlass: Auf dem Siegerbildschirm standen die Punktzahlen mit
     1,42 : 1 und die Überschrift mit 1,34 : 1 auf hellen Pillen — praktisch
     unsichtbar, gefunden von diesem Wächter am Tag seiner Einführung. Die
     Beschriftungen daneben waren am Vortag per Auge behoben worden, mit der
     Begründung, die Zahlen seien durch eine Textkontur abgesichert; gemessen war
     dort `stroke=0px`. Genau deshalb ist Augenmaß hier keine Prüfung. */
  pruefe('kein Text steht unter 4,5 : 1 Kontrast', async ({ page }: { page: Page }) => {
    const befunde = await findeSchwacheKontraste(page)
    expect(
      befunde,
      `${befunde.length} Textelement(e) unter der WCAG-AA-Schwelle:${befundListe(befunde)}`,
    ).toEqual([])
  })

  /* Der Kontrastwächter überspringt Text über einem Verlauf — dort gibt es keinen
     *einen* Kontrastwert. Das ist richtig, aber es ist ein stummer Filter: Läge
     über allem ein Verlauf, meldete der Wächter nichts und bliebe grün. Dieselbe
     Falle wie beim `inert`-Filter, dieselbe Antwort. */
  pruefe('der Kontrastwächter hat wirklich etwas gemessen', async ({ page }: { page: Page }) => {
    const { geprueft, uebersprungen } = await kontrastAbdeckung(page)
    expect(
      geprueft,
      `Kein einzelnes Textelement war messbar (${uebersprungen} wegen Verlauf übersprungen) — ` +
        'der Kontrastwächter urteilt hier über nichts.',
    ).toBeGreaterThan(0)
  })
}

/**
 * Zusicherung, dass **nichts** stillgelegt ist — das Gegenstück zum stummen
 * `inert`-Filter der beiden Erreichbarkeits-Wächter.
 *
 * Jeder Vertrag sagt damit ausdrücklich, welchen Zustand er erwartet: Auf dem
 * Brett und in der Lobby ist alles bedienbar, unter der Siegerehrung ist das
 * Brett stillgelegt (`sieger_party.hooks.spec.ts` prüft die andere Richtung).
 * Ohne diese Zusicherung könnte ein versehentliches `inert` beide Wächter
 * leerlaufen lassen, ohne dass etwas rot wird.
 */
export function nichtsIstStillgelegt(pruefe: typeof test | typeof test.fail = test): void {
  pruefe('kein Bedienelement ist stillgelegt', async ({ page }: { page: Page }) => {
    const befunde = await findeStillgelegteBedienelemente(page)
    expect(
      befunde,
      `${befunde.length} Bedienelement(e) sind \`inert\` — die Erreichbarkeits-Wächter ` +
        `überspringen sie und messen insoweit nichts:${befundListe(befunde)}`,
    ).toEqual([])
  })
}
