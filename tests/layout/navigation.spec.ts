import { expect, test, type Page } from '@playwright/test'
import { oeffne } from './oeffnen'

/** Die Gegner, die der Spieltisch zeigt (O4). */
const gegnerAmTisch = (page: Page) => page.getByRole('region', { name: 'Gegner' }).getByRole('article')

/*
O2 K3: Vor und Zurück im Browser wechseln die Ansicht richtig.

Gemessen im Produktionsbuild, in jeder Geräteklasse, mit den echten
Verlaufsknöpfen des Browsers (`goBack`, `goForward`) und einem echten Neuladen.
Neu laden und direkt aufrufen geht nur, wenn der Server jede Seite auf die App
umleitet; `vite preview` tut das wie die Umschreibungen in `vercel.json`.
*/

test.describe('O2 K3: Vor und Zurück', () => {
  test('O2 K3: Lobby → Neue Partie → Zurück → Vor → neu laden', async ({ page }) => {
    await oeffne(page, '/')
    await page.getByText('2 Gegner').click()
    await expect(page.getByRole('radio', { name: '2 Gegner' })).toBeChecked()
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page).toHaveURL(/\/spiel$/)
    await expect(gegnerAmTisch(page)).toHaveCount(2)

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('lobby')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toBeVisible()

    await page.goForward()
    await expect(page).toHaveURL(/\/spiel$/)
    await expect(gegnerAmTisch(page)).toHaveCount(2)

    await page.reload()
    await expect(page.getByTestId('spiel')).toBeVisible()
    await expect(gegnerAmTisch(page)).toHaveCount(2)
  })

  test('O2 K3: Lobby → Regeln → Zurück → Vor', async ({ page }) => {
    await oeffne(page, '/')
    await page.getByRole('link', { name: 'Regeln' }).click()
    await expect(page).toHaveURL(/\/regeln$/)
    await expect(page.getByTestId('regeln')).toBeVisible()

    await page.goBack()
    await expect(page.getByTestId('lobby')).toBeVisible()

    await page.goForward()
    await expect(page.getByTestId('regeln')).toBeVisible()
  })

  test('O2 K3: Weiterspielen führt zur gespeicherten Partie, Zurück wieder in die Lobby', async ({ page }) => {
    await oeffne(page, '/')
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page.getByTestId('spiel')).toBeVisible()

    await oeffne(page, '/')
    await page.getByRole('button', { name: 'Weiterspielen' }).click()
    await expect(page).toHaveURL(/\/spiel$/)
    await expect(gegnerAmTisch(page).first()).toBeVisible()

    await page.goBack()
    await expect(page.getByTestId('lobby')).toBeVisible()
  })

  for (const pfad of ['/spiel', '/regeln']) {
    test(`O2 K3: ${pfad} lässt sich direkt aufrufen`, async ({ page }) => {
      await oeffne(page, pfad)
    })
  }
})
