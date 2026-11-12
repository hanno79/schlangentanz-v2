import { expect, test, type Page } from '@playwright/test'
import { serialisiere, starteAusspielphase } from '../../src/engine'
import { aufgezaehlteAktionen, starteEntwicklerPartie } from '../../src/entwicklung/partie'
import { findeSzenario } from '../../src/entwicklung/szenarien'
import { berechneterStil } from './messung'

/*
Verträge für den Entwicklertisch (P0.4, Kriterien 1 und 2). Sie laufen gegen den
Testhook-Build auf :4174; nur dort gibt es `/dev`.

Die Erwartung kommt jeweils aus der Engine selbst, im Testprozess berechnet:
Die Seite soll zeigen, was die Engine aufzählt, nicht was sie über sich selbst
behauptet.
*/

async function oeffneTisch(page: Page, adresse: string): Promise<void> {
  await page.goto(adresse)
  await expect(page.getByTestId('entwicklertisch'), `${adresse} zeigt keinen Entwicklertisch`).toBeVisible()
}

async function zustandsText(page: Page): Promise<string> {
  return (await page.getByTestId('zustand-json').textContent()) ?? ''
}

async function aktionsKnoepfe(page: Page): Promise<string[]> {
  return page.locator('button[data-aktion]').evaluateAll((knoepfe) =>
    knoepfe.map((knopf) => knopf.getAttribute('data-aktion') ?? ''),
  )
}

test.describe('P0.4 K1: Partie aus Saat', () => {
  test('P0.4 K1: /dev?seed=1&spieler=2 zeigt die Partie aus Saat 1, zweimal geladen identisch', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=2')
    const erstesLaden = await zustandsText(page)
    expect(erstesLaden).toBe(serialisiere(starteEntwicklerPartie(1, 2)))
    await expect(page.getByTestId('spieler')).toHaveCount(2)

    await page.reload()
    await expect(page.getByTestId('entwicklertisch')).toBeVisible()
    expect(await zustandsText(page)).toBe(erstesLaden)
  })

  test('P0.4 K1 Gegenprobe: eine andere Saat zeigt eine andere Partie', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=2&spieler=2')
    expect(await zustandsText(page)).not.toBe(serialisiere(starteEntwicklerPartie(1, 2)))
  })

  test('P0.4: alle Hände liegen offen', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=4')
    const zustand = starteEntwicklerPartie(1, 4)
    const haende = page.getByTestId('hand')
    await expect(haende).toHaveCount(4)
    for (const [index, spieler] of zustand.spieler.entries()) {
      for (const karte of spieler.hand) {
        await expect(haende.nth(index)).toContainText(karte.id)
      }
    }
  })
})

test.describe('P0.4 K2: jede aufgezählte Aktion ist ein Knopf', () => {
  test('P0.4 K2: in der Ausspielphase stehen genau die Aktionen der Engine als Knöpfe, ein Klick ändert den Zustand', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=2')
    expect(await aktionsKnoepfe(page)).toEqual([])

    await page.getByRole('button', { name: 'Ausspielphase starten' }).click()
    await expect(page.getByTestId('zugphase')).toHaveText('Ausspielphase')
    const erwartet = aufgezaehlteAktionen(starteAusspielphase(starteEntwicklerPartie(1, 2)))
    expect(erwartet.length).toBeGreaterThan(0)
    expect(await aktionsKnoepfe(page)).toEqual(erwartet.map((aktion) => JSON.stringify(aktion)))

    for (let klick = 0; klick < 2; klick += 1) {
      const vorher = await zustandsText(page)
      await page.locator('button[data-aktion]').first().click()
      await expect.poll(() => zustandsText(page)).not.toBe(vorher)
    }
  })

  test('P0.4 K2: im Reaktionsfenster stehen die Reaktionen der Engine als Knöpfe', async ({ page }) => {
    await oeffneTisch(page, '/dev?szenario=reaktionsfenster')
    const zustand = findeSzenario('reaktionsfenster')!.erzeuge()
    expect(await aktionsKnoepfe(page)).toEqual(aufgezaehlteAktionen(zustand).map((aktion) => JSON.stringify(aktion)))

    const vorher = await zustandsText(page)
    await page.locator('button[data-aktion]').last().click()
    await expect.poll(() => zustandsText(page)).not.toBe(vorher)
  })

  test('P0.4: lehnt die Engine einen Schritt ab, steht der Grund da und der Zustand bleibt', async ({ page }) => {
    await oeffneTisch(page, '/dev?szenario=ausspielphase')
    const vorher = await zustandsText(page)
    await page.getByRole('button', { name: 'Ausspielphase beenden' }).click()
    await expect(page.getByTestId('fehlermeldung')).toContainText('mindestens einer gespielten Karte')
    expect(await zustandsText(page)).toBe(vorher)
  })
})

test.describe('P0.4: Szenarien und Invarianten', () => {
  test('P0.4: /dev/szenarien verlinkt jedes Szenario, und der Link lädt es', async ({ page }) => {
    await oeffneTisch(page, '/dev/szenarien')
    const zeilen = page.getByTestId('szenario')
    expect(await zeilen.count()).toBeGreaterThanOrEqual(6)
    await page.getByRole('link', { name: 'spielende' }).click()
    await expect(page.getByTestId('zugphase')).toHaveText('Spielende')
  })

  test('P0.4: eine verletzte Invariante ist rot', async ({ page }) => {
    await oeffneTisch(page, '/dev?szenario=kaputt-doppelte-karte')
    const verletzt = page.locator('[data-testid="invariante"][data-verletzt="ja"]')
    await expect(verletzt).toHaveCount(1)
    const [rot, gruen, blau] = (await berechneterStil(verletzt, 'color')).match(/\d+/g)!.map(Number)
    expect(rot, 'Textfarbe der verletzten Invariante ist nicht rot').toBeGreaterThan(150)
    expect(gruen).toBeLessThan(80)
    expect(blau).toBeLessThan(80)

    const erfuellt = page.locator('[data-testid="invariante"][data-verletzt="nein"]').first()
    const [rotErfuellt] = (await berechneterStil(erfuellt, 'color')).match(/\d+/g)!.map(Number)
    expect(rotErfuellt, 'Auch erfüllte Invarianten sind rot').toBeLessThan(150)
  })
})
