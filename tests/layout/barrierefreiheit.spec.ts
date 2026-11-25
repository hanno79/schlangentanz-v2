import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { deserialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import { baukasten } from '../../src/engine/testing/szenario'
import { erzeugeZufall } from '../../src/engine/testing/zufall'
import { langeSchlange, mittelspiel, neuePartie, volltisch, zehnHandkarten } from '../../src/ui/tisch/__tests__/szenarien'
import { bewegungen, erwarteGrundlagen, erwarteSichtbarenFokus, merkmaleOhneFarbe, tabBis, unterschiedOhneFarbe } from './barrierefreiheit_messung'
import { halteUhrAn, legeSpielstand, oeffne } from './oeffnen'

/*
O11 im Produktionsbuild, in jeder Geräteklasse: Lobby, Regeln und der Tisch in
festen Ständen. Je Seite meldet axe keinen schweren Befund (Kriterium 3), kein
Text steht unter 4,5 : 1 (gemessen), bei „weniger Bewegung“ bewegt sich nichts
(Kriterium 4, playwright.config.ts stellt es für alle Verträge ein), und jeder
Tab-Halt zeigt den Fokus (Kriterium 1).
*/

/**
 * Öffnet den Tisch mit diesem Stand. In den Ständen, die axe prüft, bist du am
 * Zug; dort spielt keine KI, und die Uhr muss laufen, weil axe selbst Zeitgeber
 * braucht. Ist eine KI am Zug (Volltisch), steht die Uhr, damit sie nicht spielt.
 */
async function oeffneTisch(page: Page, zustand: Spielzustand, uhrAnhalten = false): Promise<void> {
  if (uhrAnhalten) await halteUhrAn(page)
  await legeSpielstand(page, zustand)
  await oeffne(page, '/spiel')
}

test.describe('O11 K3/K4: Lobby und Regeln', () => {
  test('O11 K3/K4: die leere Lobby', async ({ page }) => {
    await oeffne(page, '/')
    await erwarteGrundlagen(page, 'Lobby')
  })

  test('O11 K3/K4: die Lobby mit laufender Partie und offener Rückfrage', async ({ page }) => {
    await legeSpielstand(page, neuePartie())
    await oeffne(page, '/')
    await erwarteGrundlagen(page, 'Lobby mit Partie')
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await erwarteGrundlagen(page, 'Lobby mit Rückfrage')
  })

  test('O11 K3/K4: die Regelseite', async ({ page }) => {
    await oeffne(page, '/regeln')
    await erwarteGrundlagen(page, 'Regeln')
  })

  test('O11 K1: in der Lobby zeigt jeder Tab-Halt den Fokus, bis „Neue Partie“', async ({ page }) => {
    await legeSpielstand(page, neuePartie())
    await oeffne(page, '/')
    await tabBis(page, 'Neue Partie')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await erwarteSichtbarenFokus(page, 'Rückfrage geöffnet')
  })
})

/**
 * Ein Stand aus einer vollen Tastaturpartie des Prüfers (TF-TISCH-044, Beleg
 * 2026-11-25-1122-3): Du bist am Zug, KI-Gegner 1 hat Schlangen mit 15 und 11,
 * KI-Gegner 2 mit 6 und 9 Karten. In Handy quer lag das Ziel am Ende der
 * Schlange 2 von KI-Gegner 2 mit Fokus hinter dem Rand.
 */
const langeGegnerschlangen = (): Spielzustand => deserialisiere(readFileSync(new URL('./stand_tf_tisch_044.json', import.meta.url), 'utf8'))

test.describe('O11 K1 (TF-TISCH-044): Fokus an langen Gegnerschlangen', () => {
  test('O11 K1: mit gewählter Karte ist jeder Tab-Halt einer ganzen Runde ganz zu sehen, auch an den Enden langer Zeilen', async ({ page }) => {
    await legeSpielstand(page, langeGegnerschlangen())
    await oeffne(page, '/spiel')
    await tabBis(page, 'Farbkarte Rot, 1 Punkt')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('region', { name: 'Deine Hand' }).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' })).toHaveAttribute('aria-pressed', 'true')
    await tabBis(page, 'Farbkarte Rot, 1 Punkt', { hoechstens: 120 })
  })

  /**
   * Hinweis 1 der Prüfung O11, Iteration 2: In einer Gegnerschlange mit über
   * 20 Karten trägt das Zeichen am Rand eine Zahl („Ziel +19 ›“) und ist
   * breiter als ohne. Auch dann liegt kein Tab-Halt unter ihm. Die Lücken der
   * langen Schlange sind die Ziele einer Schlangenblockade.
   */
  const sehrLangeGegnerschlange = (): Spielzustand =>
    baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(44) })
      .hand(0, ['Schlangenblockade', 'Rot', 'Blau', 'Gelb', 'Grün'])
      .schlange(1, [
        'Rot', 'Blau', 'Gelb', 'Grün', 'Braun', 'Violett', 'Rot', 'Blau', 'Gelb', 'Grün', 'Braun', 'Violett',
        'Rot', 'Blau', 'Gelb', 'Grün', 'Braun', 'Violett', 'Rot', 'Blau', 'Gelb', 'Grün', 'Braun',
      ])
      .haendeAuffuellen()
      .amZug(0)
      .zustand()

  test('O11 K1 (Hinweis O11 Iteration 2): Zeichen mit Zahl verdecken keinen Tab-Halt in einer Gegnerschlange mit 23 Karten', async ({ page }) => {
    await legeSpielstand(page, sehrLangeGegnerschlange())
    await oeffne(page, '/spiel')
    await tabBis(page, 'Sonderkarte Schlangenblockade')
    await page.keyboard.press('Enter')
    // Der Knopf „Schlange wählen“ liegt über der ganzen Zeile und reicht unter das Zeichen; das verdeckt nichts (Prüfung O11, Iteration 2).
    await page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1 wählen' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: vor Karte 1' })).toBeVisible()
    // Eine ganze Runde durch die 24 Lücken und zurück zur Karte, vorwärts und rückwärts.
    await tabBis(page, 'Sonderkarte Schlangenblockade', { hoechstens: 120 })
    await tabBis(page, 'Sonderkarte Schlangenblockade', { rueckwaerts: true, hoechstens: 120 })
  })
})

test.describe('O11 K3/K4: der Tisch in festen Ständen', () => {
  const STAENDE: { name: string; erzeuge: () => Spielzustand }[] = [
    { name: 'lange Schlange', erzeuge: langeSchlange },
    { name: 'Mittelspiel', erzeuge: mittelspiel },
    { name: 'neue Partie', erzeuge: neuePartie },
  ]

  for (const stand of STAENDE) {
    test(`O11 K3/K4: ${stand.name}`, async ({ page }) => {
      await oeffneTisch(page, stand.erzeuge())
      await erwarteGrundlagen(page, stand.name)
    })
  }

  test('O11 K3/K4: der Dialog „Zu viele Handkarten“', async ({ page }) => {
    await oeffneTisch(page, zehnHandkarten())
    await expect(page.getByRole('dialog', { name: 'Zu viele Handkarten' })).toBeVisible()
    await erwarteGrundlagen(page, 'Dialog Zu viele Handkarten')
  })

  test('O11 K1: im Volltisch zeigt jeder Tab-Halt den Fokus, auch in scrollenden Bereichen', async ({ page }) => {
    await oeffneTisch(page, volltisch(), true)
    await tabBis(page, 'Zur Lobby')
    // Einmal durch die ganze Reihe, bis „Zur Lobby“ wieder den Fokus hat.
    await tabBis(page, 'Zur Lobby', { hoechstens: 120 })
  })

  test('O11 K3: „Schneller“ sieht eingeschaltet auch ohne Farbe anders aus', async ({ page }, info) => {
    await oeffneTisch(page, volltisch(), true)
    const schneller = page.getByRole('region', { name: 'Zugleiste' }).getByRole('button', { name: 'Schneller' })
    await expect(schneller).toHaveAttribute('aria-pressed', 'false')
    const aus = await merkmaleOhneFarbe(schneller)
    await (info.project.use.hasTouch ? schneller.tap() : schneller.click())
    await expect(schneller).toHaveAttribute('aria-pressed', 'true')
    expect(unterschiedOhneFarbe(aus, await merkmaleOhneFarbe(schneller)), '„Schneller“ an und aus unterscheiden sich nur in der Farbe').not.toEqual([])
  })
})

test.describe('O11 K4: die Messung erkennt Bewegung', () => {
  test('O11 K4: ohne „weniger Bewegung“ haben die Karten der Regelseite einen Übergang, mit nicht', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await oeffne(page, '/regeln')
    const ohne = await bewegungen(page)
    expect(ohne.length, 'ohne „weniger Bewegung“ muss die Messung Übergänge finden, sonst misst sie nichts').toBeGreaterThan(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await bewegungen(page)).toEqual([])
  })
})
