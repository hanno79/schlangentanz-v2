import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { deserialisiere } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { verrateneIds } from '../../src/ui/tisch/__tests__/szenarien'
import { erwarteGrundlagen, erwarteSichtbarenFokus, tabBis } from './barrierefreiheit_messung'
import { befundListe, findeAbgeschnittenes, findeKleineTippflaechen, findeTextAusserhalbVonKnoepfen, waagrechterUeberstand } from './messung'
import { ausserhalbDesFensters, unerreichbareZiele } from './ziele_messung'

/*
O10 im echten Browser, in jeder Geräteklasse: Comeback-Karte, Risiko-Karte,
Schlangenkorb und die Entscheidungen der Erweiterung mit Maus und Finger
(Kriterium 3) und allein mit der Tastatur (O11 K1). Bei jedem Schritt ist jedes
angebotene Ziel erreichbar und frei, die Knöpfe der Zugleiste liegen im Bild,
nichts ist abgeschnitten und die Seite wird nicht breiter. Nach jedem Schritt
steht keine Id einer fremden Handkarte im Seitenquelltext (B2). Die Stände
kommen über `/spiel?szenario=` aus dem Testhook-Build.
*/

async function oeffneSzenario(page: Page, name: string): Promise<void> {
  await page.goto(`/spiel?szenario=${name}&tempo=sofort`)
  await expect(page.getByRole('region', { name: 'Zugleiste' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)
const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })

function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

/** Was bei jedem Schritt gelten muss. */
async function pruefeSchritt(page: Page, schritt: string): Promise<void> {
  const { gezaehlt, befunde } = await unerreichbareZiele(page)
  expect(befunde, `${schritt}: ${befunde.length} von ${gezaehlt} Zielen nicht frei erreichbar:${befundListe(befunde)}`).toEqual([])
  expect(await waagrechterUeberstand(page), `${schritt}: Seite breiter als das Fenster`).toBe(0)
  expect(await ausserhalbDesFensters(page, '[aria-label="Zugleiste"] button'), `${schritt}: Knöpfe der Zugleiste`).toEqual([])
  const klein = await findeKleineTippflaechen(page)
  expect(klein, `${schritt}: zu kleine Tippflächen:${befundListe(klein)}`).toEqual([])
  const abgeschnitten = await findeAbgeschnittenes(page)
  expect(abgeschnitten, `${schritt}: abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
  const stand = await gespeichert(page)
  if (stand !== null) expect(verrateneIds(deserialisiere(stand), await page.content()), `${schritt}: fremde Handkarten im Seitenquelltext`).toEqual([])
}

type Schritt = { zugleiste: string | RegExp } | { hand: string | RegExp } | { ziel: string }

/*
Je Weg die Schritte bis vor „Ausführen“, mit den zugänglichen Namen der Knöpfe
und Ziele. `vorbereitung` sind Schritte davor, die schon etwas spielen, etwa
eine Risiko-Karte, deren Entscheidung der Weg dann trifft; gemessen wird auch
nach ihnen.
*/
const WEGE: { name: string; szenario: string; vorbereitung?: Schritt[]; schritte: Schritt[] }[] = [
  { name: 'Comeback-Karte', szenario: 'comeback-bedingung', schritte: [{ zugleiste: 'Comeback einsetzen' }] },
  { name: 'Risiko-Aktion 2', szenario: 'risiko-erfolg', schritte: [{ zugleiste: 'Risiko spielen' }, { zugleiste: /^Aktion 2/ }, { hand: /^Farbkarte Rot/ }] },
  { name: 'Risiko-Aktion 3', szenario: 'risiko-erfolg', schritte: [{ zugleiste: 'Risiko spielen' }, { zugleiste: /^Aktion 3/ }, { ziel: 'Deine Schlange 1, Karte 2' }] },
  { name: 'Korb: Tausch', szenario: 'korb-tauschen', schritte: [{ hand: 'Sonderkarte Schlangenkorb des Glücks' }, { zugleiste: /^Tausche/ }, { ziel: 'Deine Schlange 1, Karte 2' }, { hand: /^Farbkarte Gelb/ }] },
  { name: 'Korb: Entfernen', szenario: 'korb-entfernen', schritte: [{ hand: 'Sonderkarte Schlangenkorb des Glücks' }, { zugleiste: /^Entferne/ }, { ziel: 'KI-Gegner 1, Schlange 1, Karte 2' }] },
  { name: 'Korb allein', szenario: 'korb-allein', schritte: [{ hand: 'Sonderkarte Schlangenkorb des Glücks' }, { zugleiste: /^Zwei zusätzliche Aktionen/ }] },
  // Die Karten deiner Ablage als Möglichkeiten nach Risiko-Aktion 4 mit Erfolg (D54).
  {
    name: 'Risiko-Aktion 4, Ablage',
    szenario: 'risiko-erfolg',
    vorbereitung: [{ zugleiste: 'Risiko spielen' }, { zugleiste: /^Aktion 4/ }, { zugleiste: 'Ausführen' }],
    schritte: [{ zugleiste: 'Sonderkarte Farbendieb von deiner Ablage' }],
  },
  { name: 'begünstigt', szenario: 'risiko-du-beguenstigt', schritte: [{ zugleiste: /von KI-Gegner 1$/ }] },
]

function knopfFuer(page: Page, schritt: Schritt): Locator {
  if ('zugleiste' in schritt) return zugleiste(page).getByRole('button', { name: schritt.zugleiste })
  if ('hand' in schritt) return hand(page).getByRole('button', { name: schritt.hand }).first()
  return page.getByRole('button', { name: new RegExp(`^${schritt.ziel}`) }).first()
}

test.describe('O10 K3: die Erweiterung mit Maus und Finger', () => {
  for (const weg of WEGE) {
    test(`O10 K3: ${weg.name} in „${weg.szenario}“: jeder Schritt erreichbar, Ansage, Ausführen`, async ({ page }, info) => {
      const tippe = bediene(info)
      await oeffneSzenario(page, weg.szenario)
      await pruefeSchritt(page, 'Start')
      for (const [nummer, schritt] of (weg.vorbereitung ?? []).entries()) {
        await tippe(knopfFuer(page, schritt))
        await pruefeSchritt(page, `Vorbereitung ${nummer + 1}`)
      }
      const start = await gespeichert(page)
      for (const [nummer, schritt] of weg.schritte.entries()) {
        const knopf = knopfFuer(page, schritt)
        await knopf.scrollIntoViewIfNeeded()
        await tippe(knopf)
        await pruefeSchritt(page, `Schritt ${nummer + 1}`)
      }
      await expect(zugleiste(page)).toContainText('Ansage:')
      expect(await gespeichert(page), 'vor „Ausführen“ ist nichts gespielt').toBe(start)
      await tippe(zugleiste(page).getByRole('button', { name: 'Ausführen' }))
      await expect.poll(() => gespeichert(page), { message: 'nach „Ausführen“ ist gespielt' }).not.toBe(start)
      await pruefeSchritt(page, 'nach Ausführen')
    })
  }

  test('O10 K3/A8.2: Risiko-Aktion 1 scheitert, du wählst den Gegner; Ergebnis und Wahl stehen im Protokoll', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'risiko-misserfolg')
    await tippe(zugleiste(page).getByRole('button', { name: 'Risiko spielen' }))
    await tippe(zugleiste(page).getByRole('button', { name: /^Aktion 1/ }))
    await tippe(zugleiste(page).getByRole('button', { name: 'Ausführen' }))
    await expect(zugleiste(page)).toContainText('Ersatzbelohnung')
    await pruefeSchritt(page, 'Gegner wählen')
    await tippe(zugleiste(page).getByRole('button', { name: 'KI-Gegner 2', exact: true }))
    await tippe(zugleiste(page).getByRole('button', { name: 'Ausführen' }))
    const protokoll = page.getByRole('log')
    await expect(protokoll).toContainText('Misserfolg')
    await expect(protokoll).toContainText('Du wählst KI-Gegner 2 als begünstigten Gegner.')
    await expect(protokoll).not.toContainText('verdeckte Karte')
    await pruefeSchritt(page, 'nach der Wahl')
  })

  test('O10 K3/K1, O11 K3: Lagen der Erweiterung ohne schweren axe-Befund und mit Kontrast', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'risiko-erfolg')
    await tippe(zugleiste(page).getByRole('button', { name: 'Risiko spielen' }))
    await erwarteGrundlagen(page, 'Risiko-Aktionen')
    await oeffneSzenario(page, 'risiko-du-beguenstigt')
    await erwarteGrundlagen(page, 'begünstigt')
    await oeffneSzenario(page, 'korb-tauschen')
    await tippe(hand(page).getByRole('button', { name: 'Sonderkarte Schlangenkorb des Glücks' }))
    await erwarteGrundlagen(page, 'Boni des Korbs')
  })
})

/*
Prüfprotokoll O10, Mangel 2, unter den Geräteklassen: Bei 568 × 320 scrollt die
Seite (DESIGN.md), deshalb gilt dort nicht jede Messung aus `pruefeSchritt`.
Text darf aber auch dort nicht aus einem Knopf ragen. In den fünf Klassen misst
das schon `pruefeSchritt` über `findeAbgeschnittenes`.
*/
test.describe('O10 K3 (Prüfprotokoll O10, Mangel 2): Text bleibt in den Knöpfen, auch bei 568 × 320', () => {
  test.use({ viewport: { width: 568, height: 320 } })

  test('O10 K3: auf jedem Weg der Erweiterung ragt kein Text aus einem Knopf (568 × 320)', async ({ page }, info) => {
    const tippe = bediene(info)
    for (const weg of WEGE) {
      await oeffneSzenario(page, weg.szenario)
      for (const [nummer, schritt] of [null, ...(weg.vorbereitung ?? []), ...weg.schritte].entries()) {
        if (schritt !== null) {
          const knopf = knopfFuer(page, schritt)
          await knopf.scrollIntoViewIfNeeded()
          await tippe(knopf)
        }
        const ragt = await findeTextAusserhalbVonKnoepfen(page)
        expect(ragt, `${weg.name}, Schritt ${nummer}: Text ausserhalb des Knopfs:${befundListe(ragt)}`).toEqual([])
      }
    }
  })
})

test.describe('O10 K3, O11 K1: die Erweiterung allein mit der Tastatur', () => {
  test('O11 K1: Risiko-Karte, Aktion 2, Karte ansagen, ausführen, zusätzliche Farbkarte anlegen', async ({ page }) => {
    await oeffneSzenario(page, 'risiko-erfolg')
    const start = await gespeichert(page)
    await tabBis(page, 'Risiko spielen')
    await page.keyboard.press('Enter')
    await tabBis(page, /^Aktion 2/)
    await page.keyboard.press('Enter')
    await tabBis(page, /^Farbkarte Rot/)
    await page.keyboard.press('Enter')
    await expect(zugleiste(page)).toContainText('Ansage:')
    await tabBis(page, 'Ausführen', { rueckwaerts: true })
    await page.keyboard.press('Enter')
    await expect.poll(() => gespeichert(page)).not.toBe(start)
    await erwarteSichtbarenFokus(page, 'nach dem Aufdecken')
    // Erfolg (oben liegt Blau): die zusätzliche Farbkarte wie sonst, Karte dann Ende.
    await tabBis(page, /^Farbkarte Rot/)
    await page.keyboard.press('Enter')
    await tabBis(page, 'Deine Schlange 1: Ende')
    await page.keyboard.press('Enter')
    await tabBis(page, 'Ausführen', { rueckwaerts: true })
    const vorher = await gespeichert(page)
    await page.keyboard.press('Enter')
    await expect.poll(() => gespeichert(page)).not.toBe(vorher)
    await erwarteSichtbarenFokus(page, 'nach dem Anlegen')
  })

  test('O11 K1: Schlangenkorb, Tausch mit zwei Tipps, ausführen', async ({ page }) => {
    await oeffneSzenario(page, 'korb-tauschen')
    const start = await gespeichert(page)
    await tabBis(page, 'Sonderkarte Schlangenkorb des Glücks')
    await page.keyboard.press('Enter')
    await tabBis(page, /^Tausche/)
    await page.keyboard.press('Enter')
    await tabBis(page, /^Deine Schlange 1, Karte 2/)
    await page.keyboard.press('Enter')
    await tabBis(page, /^Farbkarte Gelb/)
    await page.keyboard.press('Enter')
    await expect(zugleiste(page)).toContainText('Ansage:')
    await tabBis(page, 'Ausführen', { rueckwaerts: true })
    await page.keyboard.press('Enter')
    await expect.poll(() => gespeichert(page)).not.toBe(start)
    await erwarteSichtbarenFokus(page, 'nach dem Tausch')
  })
})
