import { expect, test, type Page } from '@playwright/test'
import { serialisiere } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { volltisch } from '../../src/ui/tisch/__tests__/szenarien'
import { kasten } from './messung'
import { halteUhrAn, oeffne } from './oeffnen'

/*
O11, Feinschliff aus der Prüfung von O6 (Hinweis 5): Auf dem Desktop
(1280 × 900) stand das Protokoll unter Gegnern, Tischmitte und Auslage und
zeigte ohne Scrollen nur zwei bis drei Einträge. Gemessen wird im Volltisch,
dem vollsten Tisch: Das Protokoll beginnt oben in der Tischfläche, und bis zu
ihrem unteren Rand hat es Platz für mindestens acht Einträge.
*/

test.use({ viewport: { width: 1280, height: 900 }, hasTouch: false, isMobile: false })

async function oeffneVolltisch(page: Page): Promise<void> {
  await halteUhrAn(page)
  await page.addInitScript(([schluessel, wert]) => window.localStorage.setItem(schluessel, wert), [SPIELSTAND_SCHLUESSEL, serialisiere(volltisch())] as const)
  await oeffne(page, '/spiel')
}

test('O11: auf dem Desktop beginnt das Protokoll oben in der Tischfläche und hat Platz für 8 Einträge', async ({ page }) => {
  await oeffneVolltisch(page)
  const flaeche = await kasten(page.locator('.st-flaeche'))
  const protokoll = await kasten(page.getByRole('log', { name: 'Protokoll' }))
  const zeile = await page.getByRole('log', { name: 'Protokoll' }).getByRole('listitem').first().evaluate((eintrag) => {
    const stil = getComputedStyle(eintrag)
    const liste = getComputedStyle(eintrag.parentElement as Element)
    return Number.parseFloat(stil.lineHeight) + Number.parseFloat(liste.rowGap || '0')
  })
  expect(protokoll.oben - flaeche.oben, `das Protokoll beginnt ${protokoll.oben - flaeche.oben} px unter der Oberkante der Tischfläche`).toBeLessThanOrEqual(48)
  const platz = flaeche.unten - protokoll.oben
  expect(platz, `bis zum unteren Rand der Tischfläche bleiben ${platz} px, eine Zeile misst ${zeile} px`).toBeGreaterThanOrEqual(8 * zeile)
})
