import { expect, test, type Page } from '@playwright/test'
import { duldeBekannteAusnahmen } from './ausnahmen'
import { oeffne } from './oeffnen'
import { bedienbarkeitsVertraege, nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O2: Lobby, vorläufiger Spieltisch und Regelseite im Produktionsbuild, in jeder
Geräteklasse. Jeder Zustand bekommt dieselben Messungen: die generischen
Wächter (nichts abgeschnitten, ausserhalb, verdeckt, zu blass), kein
waagrechtes Scrollen und Tippflächen von mindestens 44 px.
*/

// Bekannte Befunde in den neuen Geräteklassen (P0.3c): tests/layout/geraeteklassen_ausnahmen.json.
// Die drei Einträge zur Lobby in Handy quer hat O2b behoben; für diese Datei steht dort nichts mehr.
duldeBekannteAusnahmen()

/** Startet über die Lobby eine Partie; danach steht ein Spielstand im Browser. */
async function startePartie(page: Page): Promise<void> {
  await oeffne(page, '/')
  await page.getByRole('button', { name: 'Neue Partie' }).click()
  await expect(page.getByTestId('spiel')).toBeVisible()
}

function alleVertraege(): void {
  bedienbarkeitsVertraege()
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

  alleVertraege()
})

test.describe('O2: Lobby mit laufender Partie', () => {
  test.beforeEach(async ({ page }) => {
    await startePartie(page)
    await oeffne(page, '/')
  })

  test('O2 K2: die Lobby bietet „Weiterspielen“', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toBeVisible()
  })

  alleVertraege()
})

test.describe('O2 K4: Lobby nach einem unlesbaren Spielstand', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/')
    await page.evaluate(() => window.localStorage.setItem('schlangentanz-v2:partie', '{"version":2,"kaputt":true}'))
    await page.reload()
    await expect(page.getByTestId('spielstand-verworfen')).toBeVisible()
  })

  test('O2 K4: die Lobby sagt, dass die Partie verworfen wurde, und bietet kein „Weiterspielen“', async ({ page }) => {
    await expect(page.getByTestId('spielstand-verworfen')).toContainText('beschädigt')
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0)
  })

  alleVertraege()
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

  alleVertraege()
})

/*
O2b, TF-APP-016: Das Gerät wird bei offener Rückfrage gedreht. Jede Klasse
dreht ihr eigenes Fenster (Breite und Höhe getauscht); Handy hochkant landet
so in Handy quer, dem Fall aus dem Testregister. Danach gelten dieselben
Messungen wie in jedem anderen Zustand der Lobby.
*/
test.describe('O2b TF-APP-016: Lobby mit offener Rückfrage nach dem Drehen', () => {
  test.beforeEach(async ({ page }) => {
    await startePartie(page)
    await oeffne(page, '/')
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    const fenster = page.viewportSize()
    if (fenster === null) throw new Error('TF-APP-016: Das Fenster hat keine feste Grösse.')
    await page.setViewportSize({ width: fenster.height, height: fenster.width })
  })

  test('O2b TF-APP-016: die Rückfrage liegt nach dem Drehen ganz im Bild', async ({ page }) => {
    await expect(page.getByRole('alertdialog')).toBeInViewport({ ratio: 1 })
  })

  alleVertraege()
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

  alleVertraege()
})

test.describe('O2: vorläufiger Spieltisch ohne Partie', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/spiel')
  })

  test('O2: ohne Spielstand sagt der Spieltisch, dass keine Partie läuft', async ({ page }) => {
    await expect(page.getByTestId('spiel')).toContainText('Es läuft keine Partie')
  })

  alleVertraege()
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

  alleVertraege()
})
