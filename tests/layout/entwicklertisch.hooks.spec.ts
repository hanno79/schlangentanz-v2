import { expect, test, type Page } from '@playwright/test'
import { serialisiere } from '../../src/engine'
import { starteEntwicklerPartie } from '../../src/entwicklung/partie'
import { findeSzenario } from '../../src/entwicklung/szenarien'
import { berechneterStil } from './messung'

/*
Verträge für den Entwicklertisch (P0.4, Kriterien 1 und 2; E1 Szenarien). Sie
laufen gegen den Testhook-Build auf :4174; nur dort gibt es `/dev`.

Die Erwartung kommt jeweils aus der Engine selbst, im Testprozess berechnet:
Die Seite soll zeigen, was die Engine aufbaut, nicht was sie über sich selbst
behauptet. Nach E1 zählt die Engine noch keine Aktion auf; Knöpfe gibt es erst
mit E2.
*/

async function oeffneTisch(page: Page, adresse: string): Promise<void> {
  await page.goto(adresse)
  await expect(page.getByTestId('entwicklertisch'), `${adresse} zeigt keinen Entwicklertisch`).toBeVisible()
}

async function zustandsText(page: Page): Promise<string> {
  return (await page.getByTestId('zustand-json').textContent()) ?? ''
}

test.describe('P0.4 K1: Partie aus Saat', () => {
  test('P0.4 K1: /dev?seed=1&spieler=2 zeigt die Partie aus Saat 1, zweimal geladen identisch', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=2')
    const erstesLaden = await zustandsText(page)
    expect(erstesLaden).toBe(serialisiere(starteEntwicklerPartie(1, 2, false)))
    await expect(page.getByTestId('spieler')).toHaveCount(2)

    await page.reload()
    await expect(page.getByTestId('entwicklertisch')).toBeVisible()
    expect(await zustandsText(page)).toBe(erstesLaden)
  })

  test('P0.4 K1 Gegenprobe: eine andere Saat zeigt eine andere Partie', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=2&spieler=2')
    expect(await zustandsText(page)).not.toBe(serialisiere(starteEntwicklerPartie(1, 2, false)))
  })

  test('E1: erweiterung=1 baut die Partie mit Erweiterung', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=4&erweiterung=1')
    expect(await zustandsText(page)).toBe(serialisiere(starteEntwicklerPartie(1, 4, true)))
    await expect(page.getByTestId('erweiterung')).toContainText('mit')
  })

  test('P0.4: alle Hände liegen offen', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=4')
    const zustand = starteEntwicklerPartie(1, 4, false)
    const haende = page.getByTestId('hand')
    await expect(haende).toHaveCount(4)
    for (const [index, spieler] of zustand.spieler.entries()) {
      for (const karte of spieler.hand) {
        await expect(haende.nth(index)).toContainText(karte.id)
      }
    }
  })

  test('E1: ohne aufgezählte Aktion gibt es keinen Aktionsknopf, und der Tisch sagt warum', async ({ page }) => {
    await oeffneTisch(page, '/dev?seed=1&spieler=2')
    await expect(page.locator('button[data-aktion]')).toHaveCount(0)
    await expect(page.getByTestId('keine-aktion')).toBeVisible()
  })
})

test.describe('E1: Szenarien und Invarianten', () => {
  test('E1: /dev/szenarien verlinkt jedes Szenario, und der Link lädt es', async ({ page }) => {
    await oeffneTisch(page, '/dev/szenarien')
    for (const name of ['start-2', 'start-4', 'start-erweiterung']) {
      await expect(page.getByRole('link', { name })).toBeVisible()
    }
    await page.getByRole('link', { name: 'start-erweiterung' }).click()
    await expect(page.getByTestId('erweiterung')).toContainText('mit')
    expect(await zustandsText(page)).toBe(serialisiere(findeSzenario('start-erweiterung')!.erzeuge()))
  })

  test('E1: alle-orte zeigt Fusion, Grube, schwebende Karte und Karten aus dem Spiel', async ({ page }) => {
    await oeffneTisch(page, '/dev?szenario=alle-orte')
    for (const ort of ['fusion', 'gruben', 'schwebend', 'aus-dem-spiel']) {
      await expect(page.getByTestId(ort), `Ort ${ort} fehlt`).toBeVisible()
    }
  })

  test('P0.4: eine verletzte Invariante ist rot', async ({ page }) => {
    await oeffneTisch(page, '/dev?szenario=kaputt-doppelte-karte')
    const verletzt = page.locator('[data-testid="invariante"][data-verletzt="ja"]')
    await expect(verletzt).toHaveCount(3)
    const [rot, gruen, blau] = (await berechneterStil(verletzt.first(), 'color')).match(/\d+/g)!.map(Number)
    expect(rot, 'Textfarbe der verletzten Invariante ist nicht rot').toBeGreaterThan(150)
    expect(gruen).toBeLessThan(80)
    expect(blau).toBeLessThan(80)

    const erfuellt = page.locator('[data-testid="invariante"][data-verletzt="nein"]').first()
    const [rotErfuellt] = (await berechneterStil(erfuellt, 'color')).match(/\d+/g)!.map(Number)
    expect(rotErfuellt, 'Auch erfüllte Invarianten sind rot').toBeLessThan(150)
  })
})
