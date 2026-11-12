import { expect, test } from '@playwright/test'
import { oeffne } from './oeffnen'
import { nichtsIstStillgelegt, waechterVertraege } from './waechter'

/* P0.4: Bis O2 zeigt `/` im ausgelieferten Build einen schlichten Platzhalter. */
test.describe('P0.4: Platzhalter auf /', () => {
  test.beforeEach(async ({ page }) => {
    await oeffne(page, '/')
  })

  test('P0.4: / nennt das Spiel und bietet nichts zum Bedienen an', async ({ page }) => {
    await expect(page.getByTestId('platzhalter')).toContainText('Schlangentanz')
    await expect(page.getByRole('button')).toHaveCount(0)
  })

  waechterVertraege()
  nichtsIstStillgelegt()
})
