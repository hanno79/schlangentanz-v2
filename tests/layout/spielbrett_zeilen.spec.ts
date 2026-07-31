/*
Author: Claude Code (S-2)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Layout-Vertrag für die Zeilenaufteilung des Waldtanz-Spielbretts
              (Fixplan G2).

Ersetzt zwei CSS-Quelltext-Asserts, die den *Mechanismus* festhielten statt der
*Wirkung*:

- `src/App.m1d0_waldtanz_layout_konsolidierung.test.tsx` prüfte, dass die
  Arena-Zeile irgendeinen aus sieben erlaubten `clamp()`-Werten trägt. Die
  Kommentarhistorie darüber zählt fünf Nachjustierungen — jedes Mal, wenn ein
  Slice die Caps verschob, wurde die erlaubte Werteliste erweitert.
- `src/App.m9_hand_erstbild.test.ts` (M9:2) zählte, wie oft
  `clamp(1.6rem, 3vh, 2rem)` im Block vorkommt.

Beide waren grün, während der eigentliche Vertrag gebrochen war: Die Zeile
`zugseitenleiste` war auf 29 px gedeckelt, ihr Inhalt aber 90 px hoch. Als
Grid-Item mit `min-height: auto` konnte sie nicht unter ihre Inhaltsgröße
schrumpfen — der Cap griff also gar nicht. Sie lief 61 px in die Handzeile
hinein, wo das Handpanel (`z-index: 4`) darüberlag und die Klicks auf den
Gegnerzug-Knopf abfing: `elementFromPoint` lieferte dort `.handkarten-buehne`
statt des Knopfes. Vier Production-Smokes scheiterten daran.

Geprüft wird deshalb hier, was zählt: dass sich die Bereiche nicht überlappen
und die Hand im Erstbild liegt.
*/

import { expect, test } from '@playwright/test'
import { kasten } from './messung'

const VIEWPORT_HOEHE = 900

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
  })
  await page.goto('/game', { waitUntil: 'networkidle' })
})

test.describe('Spielbrett-Zeilen', () => {
  test('Zugleiste und Handbereich überlappen sich nicht', async ({ page }) => {
    const zugleiste = await kasten(page.locator('.waldtanz-zugseitenleiste'))
    const hand = await kasten(page.locator('.handkarten-panel'))

    expect(
      hand.oben,
      `Handbereich beginnt bei ${hand.oben}px und überlappt die Zugleiste (endet ${zugleiste.unten}px)`,
    ).toBeGreaterThanOrEqual(zugleiste.unten)
  })

  test('der Gegnerzug-Knopf nimmt Klicks entgegen', async ({ page }) => {
    // Bis zum Zugende durchspielen, damit die Gegnerzug-Bühne erscheint.
    for (const name of [
      'Startfährte blau-01 als neue Schlange starten',
      'Weiter zur Aufgabenprüfung',
      'Weiter zum Zugabschluss',
      'Zug an nächsten Spieler geben',
    ]) {
      await page.getByRole('button', { name }).click()
    }

    const knopf = page.getByRole('button', { name: 'Gegnerzug am Brett abspielen' })
    await expect(knopf).toBeVisible()

    // Der eigentliche Vertrag: Der Knopf liegt oben auf und ist nicht verdeckt.
    const obenAuf = await knopf.evaluate((element) => {
      const r = element.getBoundingClientRect()
      const treffer = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return element.contains(treffer) || element === treffer
    })
    expect(obenAuf, 'Ein anderes Element liegt über dem Gegnerzug-Knopf und fängt die Klicks ab').toBe(true)
  })

  test('die erste Handkarte liegt im 1280×900-Erstbild', async ({ page }) => {
    const karte = await kasten(page.locator('.handkarte__button--karte').first())
    expect(
      karte.unten,
      `Unterkante der ersten Handkarte bei ${karte.unten}px — die Hand rutscht aus dem Erstbild`,
    ).toBeLessThanOrEqual(VIEWPORT_HOEHE)
  })

  test('keine Grid-Zeile wird von ihrem Inhalt gesprengt', async ({ page }) => {
    // Ein Grid-Item, das höher ist als seine Zeile, läuft in die nächste hinein.
    // Genau so entstand die Überlappung oben.
    const ueberlaeufe = await page.evaluate(() => {
      const gitter = document.querySelector('.spielbrett--waldtanz')
      if (!gitter) return ['Spielbrett-Gitter fehlt']
      const zeilen = getComputedStyle(gitter)
        .gridTemplateRows.split(' ')
        .map((wert) => parseFloat(wert))
      const bereiche = ['spielerrahmen', 'gegner-plakette', 'aktionsdock', 'arenastein', 'zugseitenleiste', 'hand']
      const befunde: string[] = []
      for (const kind of Array.from(gitter.children)) {
        const bereich = getComputedStyle(kind).gridArea.split(' / ')[0]
        const index = bereiche.indexOf(bereich)
        if (index < 0) continue
        const hoehe = kind.getBoundingClientRect().height
        // 1 px Toleranz für Subpixel-Rundung.
        if (hoehe > zeilen[index] + 1) {
          befunde.push(`${bereich}: Inhalt ${Math.round(hoehe)}px > Zeile ${Math.round(zeilen[index])}px`)
        }
      }
      return befunde
    })

    expect(ueberlaeufe, 'Grid-Zeilen werden von ihrem Inhalt gesprengt').toEqual([])
  })
})
