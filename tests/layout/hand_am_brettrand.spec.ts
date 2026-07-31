/*
Author: Claude Code (S-2b)
Datum: 31.07.2026
Version: 1.1
Beschreibung: Zielgeometrie für die Hand am Viewport-Boden (Fixplan G2,
              „M3j Brettrand-Architektur-Pivot") — noch nicht erfüllt.

Zwei bewusst gebaute Produktziele sind bei 900 px Viewport-Höhe unvereinbar,
solange die Hand im Dokumentfluss hängt:

- „alles im Erstbild" (M1f, M1g, M9, M3i) — die Hand muss ohne Scrollen
  erreichbar sein.
- „Hand groß und präsent" (M2x: Bühne >= 95 px, M2i: Karte >= 100 px) — sie soll
  ein Hero-Objekt sein, kein Streifen.

M3i senkte daraufhin die Caps, bis die Hand ins Bild rutschte, und unterschritt
dabei die Hero-Größen. Beide Verträge blieben im Repo stehen, keiner wurde
entschieden — Ergebnis: Bühne 53 px statt 95, Karte 98 px statt 100.

**Gemessen am 31.07.2026 (1280x900, nach S-2).** Die Karten selbst liegen bei
895 px und damit im Bild — vor *und* nach dem ersten Zug, das Brett wächst
entgegen einer früheren Annahme nicht mit dem Spielverlauf. Was übersteht, ist
die Panel-Box: 961 px, also 66 px Bühne und Innenabstand unterhalb der Karten.
Genau daran scheitern M9/M1f/M95, die die Panel-Box messen.

Der Konflikt ist damit enger als gedacht, aber real: Die Hero-Größen (Bühne
+42 px, Karte +2 px) passen nicht mehr über den Falz, solange die Hand im Fluss
hängt.

**Der Pivot wurde umgesetzt und wieder zurückgenommen.** Die Hand allein zu
fixieren reicht nicht: Gemessen brauchen die Brettzeilen 772 px (Brett 879 px
mit Abständen), verfügbar sind über einer 252 px hohen Hand aber nur 648 px. Es
fehlen 231 px. Zugleiste (97 px) und Bodenzeile (145 px, Spielerplakette +
Arenazug) lägen hinter der Hand; die Arena müsste sonst von 378 px auf 214 px
halbiert werden und widerspräche damit M2r (Schlangenlichtung >= 55 %
Viewport).

Der tragfähige Weg ist die *ganze* Bodenzeile: Das Grid trägt sie bereits als
`"sp-plakette hand arenazug"` — eine Reihe. Fixiert man sie gemeinsam statt nur
die Hand, bleiben 71 + 81 + Arena + 97 für das Brett, und die Arena darf wachsen
statt zu schrumpfen. Das braucht einen Wrapper um diese drei Elemente in
`App.tsx`, ist also ein Struktur-Slice und kein CSS-Detail.

Bis dahin steht die Zielgeometrie hier als Messung. `test.fail()` markiert, was
heute nicht hält — dieselbe Praxis wie im Lobby-Vertrag: Der Anspruch bleibt
sichtbar, ohne die Suite rot zu färben. Erfüllt der Umbau einen Punkt, schlägt
der Test „unerwartet grün" an und der Marker fällt weg.
*/

import { expect, test } from '@playwright/test'
import { kasten } from './messung'

const VIEWPORT_HOEHE = 900

/** M2x-Hero-Vertrag: Die Handbühne ist ein Brettobjekt, kein Streifen. */
const BUEHNE_MINDESTHOEHE = 95
/** M2i-Hero-Vertrag: Handkarten sind greifbar groß. */
const KARTE_MINDESTHOEHE = 100

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
  })
  await page.goto('/game', { waitUntil: 'networkidle' })
})

/** Spielt den ersten Zug, nach dem das Brett bisher aus dem Bild wuchs. */
async function starteErsteSchlange(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Startfährte .* als neue Schlange starten/ }).first().click()
  await expect(page.locator('.schlangekarte').first()).toBeVisible()
}

test.describe('Hand am Brettrand', () => {
  /* Gemessen wird die unterste *Karte*, nicht die Panel-Box: Deren
     Innenabstand darf unter dem Falz liegen, die Karten nicht — greifen muss
     der Spieler die Karten. */
  test('die Handkarten liegen im Erstbild vollständig im Viewport', async ({ page }) => {
    const karte = await kasten(page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first())
    expect(karte.unten, `Unterkante der ersten Handkarte bei ${karte.unten}px`).toBeLessThanOrEqual(VIEWPORT_HOEHE)
  })

  test('die Handkarten bleiben auch nach dem ersten Zug im Viewport', async ({ page }) => {
    await starteErsteSchlange(page)

    const karte = await kasten(page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first())
    expect(
      karte.unten,
      `Unterkante der ersten Handkarte bei ${karte.unten}px — das Brett wächst mit dem Zug und schiebt die Hand aus dem Bild`,
    ).toBeLessThanOrEqual(VIEWPORT_HOEHE)
  })

  test('jede Handkarte ist anklickbar, nicht nur die erste', async ({ page }) => {
    const karten = page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
    const anzahl = await karten.count()
    expect(anzahl, 'keine Handkarten gefunden').toBeGreaterThan(1)

    for (let index = 0; index < anzahl; index += 1) {
      const box = await karten.nth(index).boundingBox()
      expect(box, `Handkarte ${index} hat keine Box`).not.toBeNull()
      expect(
        box!.y + box!.height,
        `Handkarte ${index} endet bei ${Math.round(box!.y + box!.height)}px außerhalb des Viewports`,
      ).toBeLessThanOrEqual(VIEWPORT_HOEHE)
    }
  })

  test.fail('die Handbühne behält ihre Hero-Größe (M2x)', async ({ page }) => {
    const buehne = await kasten(page.locator('.handkarten-buehne'))
    expect(
      buehne.hoehe,
      `Handbühne ${buehne.hoehe}px — M2x fordert mindestens ${BUEHNE_MINDESTHOEHE}px`,
    ).toBeGreaterThanOrEqual(BUEHNE_MINDESTHOEHE)
  })

  test.fail('die Handkarten behalten ihre Hero-Größe (M2i)', async ({ page }) => {
    const karte = await kasten(page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first())
    expect(
      karte.hoehe,
      `Handkarte ${karte.hoehe}px — M2i fordert mindestens ${KARTE_MINDESTHOEHE}px`,
    ).toBeGreaterThanOrEqual(KARTE_MINDESTHOEHE)
  })

  test('die Hand verdeckt das Brett nicht', async ({ page }) => {
    await starteErsteSchlange(page)

    const hand = await kasten(page.locator('.handkarten-panel'))
    const lichtung = await kasten(page.locator('.waldtanz-schlangenlichtung'))

    expect(
      lichtung.unten,
      `Die Schlangenlichtung endet bei ${lichtung.unten}px und liegt damit unter der Hand (ab ${hand.oben}px)`,
    ).toBeLessThanOrEqual(hand.oben)
  })
})
