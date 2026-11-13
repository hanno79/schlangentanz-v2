import { expect, test, type Page } from '@playwright/test'
import { oeffne } from './oeffnen'
import { befundListe, findeKleineTippflaechen, waagrechterUeberstand } from './messung'
import { nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O2: Lobby, vorläufiger Spieltisch und Regelseite im Produktionsbuild, in jeder
Geräteklasse. Jeder Zustand bekommt dieselben Messungen: die generischen
Wächter (nichts abgeschnitten, ausserhalb, verdeckt, zu blass), kein
waagrechtes Scrollen und Tippflächen von mindestens 44 px.
*/

/** Startet über die Lobby eine Partie; danach steht ein Spielstand im Browser. */
async function startePartie(page: Page): Promise<void> {
  await oeffne(page, '/')
  await page.getByRole('button', { name: 'Neue Partie' }).click()
  await expect(page.getByTestId('spiel')).toBeVisible()
}

function bedienbarkeitsVertraege(): void {
  test('O2: die Seite ist nicht breiter als das Fenster', async ({ page }) => {
    const ueberstand = await waagrechterUeberstand(page)
    expect(ueberstand, `Die Seite ist ${ueberstand} px breiter als das Fenster`).toBe(0)
  })

  test('O2: jede Tippfläche misst mindestens 44 × 44 px', async ({ page }) => {
    const befunde = await findeKleineTippflaechen(page)
    expect(befunde, `${befunde.length} Tippfläche(n) zu klein:${befundListe(befunde)}`).toEqual([])
  })

  waechterVertraege()
  nichtsIstStillgelegt()
}

test.describe('O2: Lobby ohne Spielstand', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/')
  })

  test('O2 K1: die Lobby zeigt Gegnerwahl, Erweiterung und „Neue Partie“, aber kein „Weiterspielen“', async ({ page }) => {
    await expect(page.getByRole('radio')).toHaveCount(3)
    await expect(page.getByRole('checkbox', { name: /Erweiterung/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Neue Partie' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0)
  })

  test('O2 K1: ein Tipp auf „3 Gegner“ wählt diese Zahl', async ({ page }) => {
    await page.getByText('3 Gegner').click()
    await expect(page.getByRole('radio', { name: '3 Gegner' })).toBeChecked()
  })

  bedienbarkeitsVertraege()
})

test.describe('O2: Lobby mit laufender Partie', () => {
  test.beforeEach(async ({ page }) => {
    await startePartie(page)
    await oeffne(page, '/')
  })

  test('O2 K2: die Lobby bietet „Weiterspielen“', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toBeVisible()
  })

  bedienbarkeitsVertraege()
})

test.describe('O2: Lobby mit offener Rückfrage vor einer neuen Partie', () => {
  test.beforeEach(async ({ page }) => {
    await startePartie(page)
    await oeffne(page, '/')
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
  })

  test('O2 K2: die Rückfrage bietet Bestätigen und Abbrechen', async ({ page }) => {
    const frage = page.getByRole('alertdialog')
    await expect(frage.getByRole('button', { name: /neue Partie/i })).toBeVisible()
    await expect(frage.getByRole('button', { name: 'Abbrechen' })).toBeVisible()
  })

  bedienbarkeitsVertraege()
})

test.describe('O2: vorläufiger Spieltisch mit Partie', () => {
  test.beforeEach(async ({ page }) => {
    await startePartie(page)
  })

  test('O2: der Spieltisch nennt die Einstellungen und führt zurück', async ({ page }) => {
    await expect(page.getByTestId('einstellung-gegner')).toBeVisible()
    await expect(page.getByTestId('einstellung-erweiterung')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Zurück zur Lobby' })).toBeVisible()
  })

  bedienbarkeitsVertraege()
})

test.describe('O2: vorläufiger Spieltisch ohne Partie', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/spiel')
  })

  test('O2: ohne Spielstand sagt der Spieltisch, dass keine Partie läuft', async ({ page }) => {
    await expect(page.getByTestId('spiel')).toContainText('Es läuft keine Partie')
  })

  bedienbarkeitsVertraege()
})

test.describe('O2: Regelseite', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/regeln')
  })

  test('O2: die Regelseite verweist auf die Website', async ({ page }) => {
    await expect(page.getByRole('link', { name: /schlangentanz\.ch/i })).toHaveAttribute(
      'href',
      'https://schlangentanz.ch/rules',
    )
  })

  bedienbarkeitsVertraege()
})
