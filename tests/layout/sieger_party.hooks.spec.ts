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
import { berechneterStil, oberkanteVon, seitenHoehe, unterkanteVon } from './messung'
import { brettIstInert, waechterVertraege } from './waechter'

test.describe('Sieger-Party auf /game?phase=spielende', () => {
  /* Die Vorbedingung steht bewusst im `beforeEach` und nicht nur im ersten Test.

     Gemessen am 03.08.2026 gegen den Produktionsbuild (also ohne Hook, ohne
     Sieger-Party): Von acht Tests fielen **drei**, fünf blieben grün — die vier
     Wächter und „die Seite scrollt nicht". Sie fragen die ganze Seite ab und
     finden auf einem Bildschirm ohne Sieger-Party erwartungsgemäß nichts zu
     beanstanden. Als Vertrag für diesen Bildschirm waren sie damit wertlos: Sie
     wären auch dann grün geblieben, wenn die Siegerehrung gar nicht mehr
     erschiene.

     Mit dieser Zeile hängen alle acht am selben Faden. Gegenprobe wiederholt:
     acht von acht fallen gegen den Produktionsbuild. */
  test.beforeEach(async ({ page }) => {
    await page.goto('/game?phase=spielende', { waitUntil: 'networkidle' })
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
     `brett_waechter.spec.ts`. Dort darf das Brett *nicht* `inert` sein, hier
     *muss* es das — sonst tabbt man am Ende der Partie durch sechs unsichtbare
     Brett-Knöpfe, bevor „Noch einmal spielen" an der Reihe ist (gemessen, genau
     so). Ohne diesen Test wäre der `inert`-Filter der Wächter ein stummer
     Schalter: Er würde die beiden Erreichbarkeits-Wächter unten leerlaufen
     lassen, ohne dass irgendetwas rot wird. */
  test('das Brett unter der Party ist stillgelegt', async ({ page }) => {
    expect(
      await brettIstInert(page),
      'Das Brett unter der Siegerehrung ist bedienbar — es liegt im Tab-Weg zum Neustart-Knopf.',
    ).toBe(true)
  })

  /* Dieselben vier Fragen wie auf dem Brett — bewusst nicht an Klassennamen
     gebunden und für jede Route gültig. Auf diesem Bildschirm hätte der erste
     Wächter den abgeschnittenen Titel „Schlangent" gemeldet. */
  waechterVertraege()
})
