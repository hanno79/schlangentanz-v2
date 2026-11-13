import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { serialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import {
  GEHEIME_KARTENARTEN,
  geheimeHaende,
  langeSchlange,
  mittelspiel,
  neuePartie,
  zehnHandkarten,
  verrateneIds,
  volltisch,
} from '../../src/ui/tisch/__tests__/szenarien'
import { befundListe, kasten } from './messung'
import { oeffne } from './oeffnen'
import { abgeschnitteneEigeneSchlangen, lesbareStapelzahlen, ueberdeckendeBalken, unerreichbareKarten, verborgenOhneHinweis } from './tisch_messung'
import { bedienbarkeitsVertraege, nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O4: Der Spieltisch unter /spiel im Produktionsbuild, in jeder Geräteklasse.
Der Spielstand kommt aus den Szenarien von `src/ui/tisch/__tests__/szenarien.ts`
und steht vor dem Öffnen im Speicher des Browsers, so wie ihn die Lobby
hinterlässt.

Die Verträge fragen nach keiner Geräteklasse: Was hier steht, gilt auf dem
Desktop wie auf dem Handy quer.
*/

/* `karten`: so viele Kartenbilder stehen mindestens am Tisch. Im Volltisch 88
   Schlangenkarten, 2 unter der Fusion, 5 Handkarten, Ablage, Grube, 3 offene
   Aufgaben und 4 Karten Auslage; in der neuen Partie 5 Handkarten und der Stapel.
   `eigeneBilder`: Bilder in deinen Schlangen (Volltisch 22 + 2 unter der Fusion,
   Mittelspiel 4 + 3 + 2). `gruppenBalken`: Glieder in Farbgruppen am ganzen Tisch,
   mindestens. `stapel`: wie der Nachziehstapel angesagt wird. */
const SZENARIEN: { name: string; erzeuge: () => Spielzustand; karten: number; eigeneBilder: number; gruppenBalken: number; stapel: string }[] = [
  { name: 'Volltisch', erzeuge: volltisch, karten: 104, eigeneBilder: 24, gruppenBalken: 40, stapel: 'leer' },
  { name: 'Mittelspiel', erzeuge: mittelspiel, karten: 25, eigeneBilder: 9, gruppenBalken: 13, stapel: String(mittelspiel().nachziehstapel.length) },
  { name: 'neue Partie', erzeuge: neuePartie, karten: 6, eigeneBilder: 0, gruppenBalken: 0, stapel: String(neuePartie().nachziehstapel.length) },
  { name: 'lange Schlange', erzeuge: langeSchlange, karten: 40, eigeneBilder: 22, gruppenBalken: 30, stapel: String(langeSchlange().nachziehstapel.length) },
  { name: 'zehn Handkarten', erzeuge: zehnHandkarten, karten: 35, eigeneBilder: 9, gruppenBalken: 13, stapel: String(zehnHandkarten().nachziehstapel.length) },
]

async function oeffneMitPartie(page: Page, zustand: Spielzustand): Promise<void> {
  await page.addInitScript(
    ([schluessel, wert]) => window.localStorage.setItem(schluessel, wert),
    [SPIELSTAND_SCHLUESSEL, serialisiere(zustand)] as const,
  )
  await oeffne(page, '/spiel')
  await expect(page.getByRole('region', { name: 'Deine Hand' }), '/spiel zeigt keinen Tisch').toBeVisible()
}

/** Tippen mit Touch-Geräten, sonst klicken. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

/** Bilder, die nicht geladen sind oder kein Pixel haben. */
async function kaputteBilder(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const bilder = Array.from(document.images)
    await Promise.all(bilder.map((bild) => (bild.complete ? null : bild.decode().catch(() => null))))
    return bilder.filter((bild) => !bild.complete || bild.naturalWidth === 0).map((bild) => bild.currentSrc || bild.src)
  })
}

for (const { name, erzeuge, karten, eigeneBilder, gruppenBalken, stapel } of SZENARIEN) {
  test.describe(`O4: Spieltisch, ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await oeffneMitPartie(page, erzeuge())
    })

    test('O4: jedes Bild ist geladen', async ({ page }) => {
      expect(await kaputteBilder(page), 'nicht geladene Bilder').toEqual([])
    })

    test('O4 K3: jede Karte am Tisch ist erreichbar', async ({ page }) => {
      const { gezaehlt, befunde } = await unerreichbareKarten(page)
      expect(gezaehlt, 'Karten am Tisch').toBeGreaterThanOrEqual(karten)
      expect(befunde, `${befunde.length} von ${gezaehlt} Karten nicht erreichbar:${befundListe(befunde)}`).toEqual([])
    })

    test('O4 K1: deine Hand steht ganz im Bild am unteren Rand, deine Schlangen darüber', async ({ page }) => {
      const fenster = page.viewportSize()!
      const hand = await kasten(page.getByRole('region', { name: 'Deine Hand' }))
      const schlangen = await kasten(page.getByRole('region', { name: 'Deine Schlangen' }))
      expect(hand.oben, 'Oberkante der Hand').toBeGreaterThanOrEqual(0)
      expect(hand.unten, 'Unterkante der Hand').toBeLessThanOrEqual(fenster.height)
      expect(fenster.height - hand.unten, 'Abstand der Hand zum unteren Rand').toBeLessThanOrEqual(24)
      expect(schlangen.oben, 'Oberkante deiner Schlangen').toBeGreaterThanOrEqual(0)
      expect(schlangen.unten, 'Unterkante deiner Schlangen').toBeLessThanOrEqual(hand.oben + 1)
    })

    // Iteration 2: ersetzt „Höhe deiner Schlangen ≥ 40 px“, das zu schwach war (Prüfprotokoll O4, Mangel 1).
    test('O4 K1/K4: deine Schlangen stehen ohne Scrollen ganz da, mit den Karten unter der Fusion und den Balken', async ({ page }) => {
      const { bilder, befunde } = await abgeschnitteneEigeneSchlangen(page)
      expect(bilder, 'Bilder in deinen Schlangen').toBe(eigeneBilder)
      expect(befunde, `deine Schlangen sind ohne Scrollen nicht ganz zu sehen:${befundListe(befunde)}`).toEqual([])
    })

    test('O4 K4: kein Gruppenbalken liegt auf einer Karte, auch wenn eine Schlange umbricht', async ({ page }) => {
      const { balken, befunde } = await ueberdeckendeBalken(page)
      expect(balken, 'Balken unter Farbgruppen').toBeGreaterThanOrEqual(gruppenBalken)
      expect(befunde, `Balken auf Karten:${befundListe(befunde)}`).toEqual([])
    })

    // Iteration 3: dieselbe Blindstelle wie bei „jede Karte erreichbar“, allgemein für jeden scrollenden Bereich.
    test('O4 K3: wo ein Bereich weitergeht, ist es ohne Scrollen zu erkennen', async ({ page }) => {
      const { befunde } = await verborgenOhneHinweis(page)
      expect(befunde, `Bereiche, die ohne Hinweis weitergehen:${befundListe(befunde)}`).toEqual([])
    })

    test('O4 K3: ist die Tischfläche halb gescrollt, zeigt sie oben und unten, dass es weitergeht', async ({ page }) => {
      await page.locator('.st-flaeche').evaluate((flaeche) => flaeche.scrollTo(0, (flaeche.scrollHeight - flaeche.clientHeight) / 2))
      await expect(async () => {
        const { befunde } = await verborgenOhneHinweis(page)
        expect(befunde, `Bereiche, die ohne Hinweis weitergehen:${befundListe(befunde)}`).toEqual([])
      }).toPass({ timeout: 2000 })
    })

    test('O4: die Zahl des Nachziehstapels ist ohne Scrollen zu lesen', async ({ page }) => {
      const lesbar = await lesbareStapelzahlen(page, stapel)
      expect(lesbar, `„Nachziehstapel ${stapel}“ oder „Stapel ${stapel}“ ganz im Bild und frei`).not.toEqual([])
    })

    test('O4 K1: wer die Tischfläche scrollt, verschiebt deine Hand und deine Schlangen nicht', async ({ page }) => {
      const hand = page.getByRole('region', { name: 'Deine Hand' })
      const schlangen = page.getByRole('region', { name: 'Deine Schlangen' })
      const vorher = [await kasten(hand), await kasten(schlangen)]
      await page.locator('.st-flaeche').evaluate((flaeche) => flaeche.scrollTo(0, flaeche.scrollHeight))
      expect([await kasten(hand), await kasten(schlangen)]).toEqual(vorher)
    })

    test('O4: die Gegner stehen über deiner Hand und sind in der Tischfläche zu sehen', async ({ page }) => {
      const gegner = await kasten(page.getByRole('region', { name: 'Gegner' }))
      const hand = await kasten(page.getByRole('region', { name: 'Deine Hand' }))
      const flaeche = await kasten(page.locator('.st-flaeche'))
      expect(gegner.oben, 'Gegner oben').toBeLessThan(hand.oben)
      // Handy quer war im Entwurf die Tischfläche 28 px hoch (O1, Hinweis 1).
      expect(flaeche.hoehe, 'Höhe der Tischfläche').toBeGreaterThanOrEqual(Math.min(240, page.viewportSize()!.height * 0.5))
    })

    test('O4: kleine Karten laden die kleine Bildfassung, keine grosse', async ({ page }) => {
      await kaputteBilder(page)
      const gross = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .map((eintrag) => new URL(eintrag.name).pathname)
          .filter((pfad) => /^\/karten\/[^/]+\.webp$/.test(pfad)),
      )
      expect(gross, 'grosse Kartenbilder geladen').toEqual([])
    })

    bedienbarkeitsVertraege()
    waechterVertraege()
    nichtsIstStillgelegt()
  })
}

test.describe('O4 K2: Fremde Handkarten stehen nicht im Seitenquelltext', () => {
  test('O4 K2: weder Name noch Id einer fremden Handkarte oder geheimen Aufgabe steht im HTML', async ({ page }) => {
    const zustand = geheimeHaende()
    await oeffneMitPartie(page, zustand)
    await expect(page.getByRole('article', { name: 'KI-Gegner 1' })).toContainText('5 Handkarten')
    const html = await page.content()
    const verraten = verrateneIds(zustand, html)
    expect(verraten, 'Ids aus fremden Händen oder geheimen Aufgaben').toEqual([])
    for (const art of GEHEIME_KARTENARTEN) {
      expect(html.toLowerCase(), `„${art}“ steht im HTML`).not.toContain(art.toLowerCase())
    }
    for (const spieler of zustand.spieler.slice(1)) {
      expect(html, `geheime Aufgabe von ${spieler.name}`).not.toContain(spieler.geheimeAufgabe!.name)
    }
  })
})

test.describe('O4: Grossansicht einer offenen Aufgabe', () => {
  test('O4: eine offene Aufgabe öffnet sich gross, ganz im Bild, und schliesst wieder', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneMitPartie(page, volltisch())
    const aufgabe = page.getByRole('region', { name: 'Offene Aufgaben' }).getByRole('button').first()
    await aufgabe.scrollIntoViewIfNeeded()
    await tippe(aufgabe)
    const lupe = page.getByRole('dialog')
    await expect(lupe).toBeVisible()
    const karte = await kasten(lupe.getByRole('img'))
    const fenster = page.viewportSize()!
    expect(karte.unten, 'Karte in der Grossansicht unten im Bild').toBeLessThanOrEqual(fenster.height)
    expect(karte.breite, 'Karte in der Grossansicht').toBeGreaterThanOrEqual(Math.min(280, (fenster.height - 140) * 0.6))
    await tippe(lupe.getByRole('button', { name: 'Schliessen' }))
    await expect(lupe).toBeHidden()
  })
})
