/*
Author: Claude Code (1b)
Datum: 03.08.2026
Version: 1.0
Beschreibung: Layout-Vertrag für die Sieger-Party (`/game?phase=spielende`).

**Warum diese Datei ein `.hooks.spec.ts` ist.** Der Bildschirm ist nur über den
`?phase=`-Test-Hook erreichbar, und der ist im Produktionsbuild aus. Der Vertrag
läuft deshalb im zweiten Playwright-Auftrag gegen `dist-testhooks` — einen Build,
der sich von Production um genau eine Flagge unterscheidet. Siehe den Kopf von
`playwright.config.ts`.

**Warum es ihn gibt.** Bis 03.08.2026 deckte kein Vertrag diesen Bildschirm ab.
In der Lücke saßen vier Fehler, alle alt, alle an einem Tag gefunden, als ihn zum
ersten Mal jemand ansah:

| Fehler | Vertrag hier |
|---|---|
| Party begann bei `y=900` — Sieger nur nach Scrollen sichtbar | „im Erstbild" |
| `--st-color-surface-dim` undefiniert → gar kein Hintergrund | „hat einen Hintergrund" |
| Titel „Schlangentanz!" lief unter das Portrait, stand als „Schlangent" da | Wächter „abgeschnitten" |
| Punktetafel mit 1,06 : 1 Kontrast | (nicht hier — Kontrast ist keine Geometrie) |

Drei der vier hätte dieser Vertrag gefunden. Der vierte bleibt Sichtprüfung.

**Selbstprüfung zuerst.** Ein Vertrag, der den Bildschirm gar nicht erreicht,
wäre grün und wertlos — genau die Falle, in die zwei Tests dieser Sitzung
gelaufen sind. Die Vorbedingung im `beforeEach` hängt deshalb *jeden* Test dieser
Datei daran, dass der Hook gegriffen hat; die Begründung steht dort.
*/

import { expect, test } from '@playwright/test'
import {
  befundListe,
  berechneterStil,
  findeStillgelegteBedienelemente,
  oberkanteVon,
  seitenHoehe,
  unterkanteVon,
} from './messung'
import { waechterVertraege } from './waechter'

test.describe('Sieger-Party auf /game?phase=spielende', () => {
  /* Die Vorbedingung steht bewusst im `beforeEach` und nicht nur im ersten Test.

     Gemessen am 03.08.2026 gegen den Produktionsbuild (also ohne Hook, ohne
     Sieger-Party): Von den damals acht Tests fielen **drei**, fünf blieben grün
     — die vier Wächter und „die Seite scrollt nicht". Sie fragen die ganze Seite
     ab und finden auf einem Bildschirm ohne Sieger-Party erwartungsgemäß nichts
     zu beanstanden. Als Vertrag für diesen Bildschirm waren sie damit wertlos:
     Sie wären auch dann grün geblieben, wenn die Siegerehrung gar nicht mehr
     erschiene.

     Mit dieser Zeile hängt jeder Test dieser Datei am selben Faden. Gegenprobe
     wiederholt: alle acht fielen. Seither sind zwei dazugekommen (Fokus,
     Stilllegung), die ohnehin an der Region hängen. */
  test.beforeEach(async ({ page }) => {
    /* Kein `waitUntil: 'networkidle'` — Playwright rät davon ab, und hier wartet
       es auf nichts: Die App lädt keine Webfonts (nur ein System-Stack), keine
       Bilder und keine `url()`-Ressourcen; Geometrie kann also nicht nachrutschen.
       Die Bereitschaft prüft die Zusicherung darunter. Mit `retries: 0` wäre ein
       Hänger im gemeinsamen `beforeEach` ein harter Fehlschlag für alle acht
       Verträge dieser Datei. Der Bestand in `tests/layout/` benutzt es noch. */
    await page.goto('/game?phase=spielende')
    await expect(
      page.getByRole('region', { name: 'Sieger-Party' }),
      'Der `?phase=spielende`-Hook hat nicht gegriffen — dieser Vertrag misst nichts.',
    ).toBeVisible()
  })

  test('Gewinner, Punktetafel und Neustart stehen im Erstbild', async ({ page }) => {
    /* Die Erstbildhöhe wird gemessen, nicht als Konstante wiederholt: Der
       Viewport steht in `playwright.config.ts`, und drei Verträge trugen bereits
       je eine eigene Kopie der 900. Wer ihn dort ändert, macht sonst still
       mehrere Verträge falsch. */
    const erstbildHoehe = await page.evaluate(() => window.innerHeight)

    /* Der eigentliche Befund vom 03.08.2026: Die Party begann bei `y=900`, also
       exakt unter dem Erstbild. Wer eine Partie beendete, las „Partie beendet."
       und musste scrollen, um zu erfahren, wer gewonnen hat. */
    const partieOben = await oberkanteVon(page.getByRole('region', { name: 'Sieger-Party' }))
    expect(partieOben, `Die Sieger-Party beginnt bei y=${partieOben}, also unterhalb des Erstbilds`).toBeLessThan(
      erstbildHoehe,
    )

    for (const [name, locator] of [
      ['Titel „Schlangentanz!"', page.getByRole('heading', { name: 'Schlangentanz!' })],
      ['Punktetafel', page.getByRole('heading', { name: 'Finale Punktetafel' })],
      ['Neustart-Knopf', page.getByRole('button', { name: /Noch einmal spielen/ })],
    ] as const) {
      const unten = await unterkanteVon(locator)
      expect(unten, `${name} endet bei y=${unten} und liegt damit außerhalb des Erstbilds`).toBeLessThanOrEqual(
        erstbildHoehe,
      )
    }
  })

  test('die Seite scrollt nicht', async ({ page }) => {
    const erstbildHoehe = await page.evaluate(() => window.innerHeight)
    const hoehe = await seitenHoehe(page)
    expect(hoehe, `Dokument ist ${hoehe}px hoch — das Erstbild ist ${erstbildHoehe}px`).toBeLessThanOrEqual(
      erstbildHoehe,
    )
  })

  /* Der zweite Fehler vom 03.08.2026 war kein Geometriefehler: `background`
     verwies auf ein nirgends definiertes Token, und ein undefiniertes Token
     macht die ganze Deklaration ungültig. Die Siegerehrung hatte deshalb **nie**
     einen eigenen Hintergrund — unsichtbar geblieben ist das nur, weil sie unter
     dem Brett lag und der dunkle `body` durchschien. Gemessen wird der
     aufgelöste Wert, nicht der Quelltext: Genau die Auflösung ist der Schritt,
     an dem das Token verschwand.

     Geprüft werden **beide** Kanäle, und das ist nicht Gründlichkeit, sondern
     nötig: Die Party zeichnet ihren Hintergrund heute ausschließlich als
     Verlauf, `background-color` steht dort auf `rgba(0, 0, 0, 0)`. Ein Vertrag
     nur auf die Farbe wäre rot, obwohl der Bildschirm in Ordnung ist — ein
     erster Entwurf dieses Tests war es. Der Fehlerfall traf dagegen die ganze
     Kurzschreibweise und damit beide Kanäle zugleich. */
  test('die Sieger-Party hat einen eigenen Hintergrund', async ({ page }) => {
    const partie = page.getByRole('region', { name: 'Sieger-Party' })
    const farbe = await berechneterStil(partie, 'background-color')
    const verlauf = await berechneterStil(partie, 'background-image')
    const durchsichtig = farbe === 'rgba(0, 0, 0, 0)' || farbe === 'transparent'
    const hatHintergrund = !durchsichtig || verlauf !== 'none'
    expect(
      hatHintergrund,
      `Die Sieger-Party hat keinen eigenen Hintergrund (background-color: ${farbe}, background-image: ${verlauf}) — ` +
        'ein undefiniertes Token macht die ganze `background`-Deklaration ungültig.',
    ).toBe(true)
  })

  /* ÄNDERUNG [03.08.2026, Punkt 1b]: Das Gegenstück zur Erwartung in
     `brett_waechter.spec.ts`. Dort darf nichts `inert` sein, hier *muss* das
     Brett es sein — sonst tabbt man am Ende der Partie durch sechs unsichtbare
     Brett-Haltepunkte, bevor „Noch einmal spielen" an der Reihe ist (gemessen,
     genau so). Ohne diesen Test wäre der `inert`-Filter der Wächter ein stummer
     Schalter: Er würde die beiden Erreichbarkeits-Wächter unten leerlaufen
     lassen, ohne dass irgendetwas rot wird.

     Geprüft wird zusätzlich, dass das Stillgelegte **unter dem Brett** liegt —
     ein `inert` an der Siegerehrung selbst wäre derselbe stumme Filter mit
     umgekehrtem Vorzeichen und käme sonst durch. */
  test('das Brett unter der Party ist stillgelegt', async ({ page }) => {
    const stillgelegt = await findeStillgelegteBedienelemente(page)
    expect(
      stillgelegt.length,
      'Unter der Siegerehrung ist nichts stillgelegt — das Brett liegt im Tab-Weg zum Neustart-Knopf.',
    ).toBeGreaterThan(0)
    expect(
      stillgelegt.every((befund) => befund.detail.includes('spielbrett')),
      `Stillgelegt ist etwas anderes als das Brett:${befundListe(stillgelegt)}`,
    ).toBe(true)

    // Der Neustart-Knopf selbst darf davon niemals erfasst sein.
    await expect(page.getByRole('button', { name: /Noch einmal spielen/ })).toBeEnabled()
  })

  /* Der Fokus muss mitkommen. Wird das Brett `inert`, während der Fokus dort
     steht, wirft der Browser ihn auf `<body>` — die Siegerehrung stünde sichtbar
     da, während Tastatur und Screenreader wieder am Dokumentanfang beginnen.
     Gefunden im Codex-Review (Gate 7), nicht von den Tests. */
  test('der Fokus steht in der Siegerehrung', async ({ page }) => {
    const fokus = await page.evaluate(() => {
      const el = document.activeElement
      if (el === null || el === document.body) return 'BODY'
      return el.closest('.sieger-party') === null ? `ausserhalb: ${el.tagName}` : `drin: ${el.tagName}`
    })
    expect(fokus, 'Der Fokus liegt nicht in der Siegerehrung').toMatch(/^drin:/)
  })

  /* Dieselben vier Fragen wie auf dem Brett — bewusst nicht an Klassennamen
     gebunden und für jede Route gültig. Auf diesem Bildschirm hätte der erste
     Wächter den abgeschnittenen Titel „Schlangent" gemeldet. */
  waechterVertraege()
})
