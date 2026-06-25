/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M3b Browser-Smoke fuer den Spielstart-Tanz im sonnigen Nest.
  Beweist in einem echten Browser, dass die Stitch-inspirierte Lobby
  auf / einen sichtbaren Spielstart-Vertrag erfuellt:
    1. Drei Start-Buttons (Duell, Waldparty, Grosse Runde) mit 3px-Border,
       Hard-Shadow und Stitch-Optik.
    2. Aktive KI-Slots haben sichtbare Schlangen-Slide-In-Animation
       (animationName != 'none' auf .lobby-slot--ki).
    3. Code-Schild schwingt weiterhin als Wald-Pendel (animation != 'none').
    4. Hover ueber Start-Button erhoeht die sichtbare Card-Position.
    5. Klick auf "Waldparty starten" schaltet sichtbar 2 KI-Slots aktiv.
    6. Keine console/page-Fehler.

  Akzeptanzvertrag (m3b-sonniges-nest-spielstart):
    - .lobby-startbutton border >= 3px, boxShadow != 'none'.
    - .lobby-slot--ki animationName != 'none'.
    - .lobby-code-schild animationName != 'none'.
    - Start-Button-Hover aendert sichtbar die Y-Position.
    - Klick erhoeht die Anzahl aktiver KI-Slots auf 2.
    - consoleErrors.length == 0, pageErrors.length == 0.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeLobby(page) {
  return page.evaluate(() => {
    const startButtons = Array.from(document.querySelectorAll('.lobby-startbutton'))
    if (startButtons.length !== 3) throw new Error(`M3b: erwartet 3 Start-Buttons, gefunden ${startButtons.length}`)
    const firstButton = startButtons[0]
    const firstButtonCs = window.getComputedStyle(firstButton)
    const borderPx = parseFloat(firstButtonCs.borderTopWidth)
    const boxShadow = firstButtonCs.boxShadow
    const kiSlots = document.querySelectorAll('.lobby-slot--ki')
    const kiSlot = kiSlots[0]
    let kiAnimation = 'none'
    if (kiSlot instanceof HTMLElement) {
      kiAnimation = window.getComputedStyle(kiSlot).animationName
    }
    const schild = document.querySelector('.lobby-code-schild')
    let schildAnimation = 'none'
    if (schild instanceof HTMLElement) {
      schildAnimation = window.getComputedStyle(schild).animationName
    }
    return {
      startButtonCount: startButtons.length,
      startButtonBorder: borderPx,
      startButtonBoxShadow: boxShadow,
      kiSlotCount: kiSlots.length,
      kiSlotAnimation: kiAnimation,
      schildAnimation,
    }
  })
}

async function messeHover(page) {
  const button = await page.locator('.lobby-startbutton').first()
  const yVorher = await button.evaluate((el) => el.getBoundingClientRect().y)
  await button.hover()
  // Animation-Transition: ~200ms (lobby-startbutton transition: transform 160ms ease)
  await page.waitForTimeout(250)
  const yNachher = await button.evaluate((el) => el.getBoundingClientRect().y)
  return { yVorher, yNachher, delta: yNachher - yVorher }
}

async function main() {
  const consoleErrors = []
  const pageErrors = []
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => { pageErrors.push(err.message) })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const daten = await messeLobby(page)
  console.log('M3b Start-Buttons:', daten.startButtonCount)
  console.log('M3b border:', daten.startButtonBorder)
  console.log('M3b boxShadow:', daten.startButtonBoxShadow)
  console.log('M3b KI-Slot-Animation:', daten.kiSlotAnimation)
  console.log('M3b Code-Schild-Animation:', daten.schildAnimation)
  const hover = await messeHover(page)
  console.log('M3b Hover Y-Delta:', hover.delta.toFixed(2), 'px (negativ = Card hebt sich)')
  await page.click('button.lobby-startbutton:has-text("Waldparty")')
  // Warten auf Status-Update (statt hartem Timeout) - die Lobby rendert
  // "Aktive Partie: Du + 2 KI" als Reaktion auf den Klick.
  await page.locator('.lobby-status', { hasText: 'Du + 2 KI' }).waitFor({ state: 'visible', timeout: 5000 })
  const kiCount = await page.evaluate(() => document.querySelectorAll('.lobby-slot--ki').length)
  console.log('M3b KI-Slots nach Klick:', kiCount)
  const browserOk = await browser.close()
  void browserOk
  if (!(daten.startButtonCount === 3)) {
    console.error('FAIL: erwartet 3 Start-Buttons')
    process.exit(1)
  }
  if (!(daten.startButtonBorder >= 3)) {
    console.error(`FAIL: border ${daten.startButtonBorder} < 3px`)
    process.exit(2)
  }
  if (!daten.startButtonBoxShadow || daten.startButtonBoxShadow === 'none') {
    console.error('FAIL: box-shadow fehlt (kein Hard-Shadow)')
    process.exit(3)
  }
  if (daten.kiSlotAnimation === 'none') {
    console.error('FAIL: KI-Slot-Animation fehlt (Stitch-Slide-In)')
    process.exit(4)
  }
  if (daten.schildAnimation === 'none') {
    console.error('FAIL: Code-Schild-Animation fehlt (Wald-Pendel)')
    process.exit(5)
  }
  if (!(hover.delta < 0)) {
    console.error(`FAIL: Hover-Y-Delta ${hover.delta} >= 0 (Card hebt sich nicht)`)
    process.exit(6)
  }
  if (kiCount !== 2) {
    console.error(`FAIL: nach Klick 2 KI-Slots aktiv, gefunden ${kiCount}`)
    process.exit(7)
  }
  if (consoleErrors.length > 0) {
    console.error('FAIL: console-Fehler:', consoleErrors)
    process.exit(8)
  }
  if (pageErrors.length > 0) {
    console.error('FAIL: page-Fehler:', pageErrors)
    process.exit(9)
  }
  console.log('OK: M3b Sonniges-Nest-Spielstart verifiziert')
}

main().catch((e) => { console.error(e); process.exit(99) })
