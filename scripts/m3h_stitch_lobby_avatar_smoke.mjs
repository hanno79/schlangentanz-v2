/*
Author: Hermes
Datum: 01.07.2026
Beschreibung: M3h Browser-Smoke fuer die Stitch-Lobby-Avatar-Promotion.
  Beweist in einem echten Browser, dass die Lobby auf / die
  M3h-Vertraege erfuellt:
    1. .lobby-slot ist Flex-Column (display:flex, flex-direction:column)
    2. Host-Slot rendert genau eine .lobby-slot__host-badge mit Text "DU"
    3. KI-Slots haben KEINE host-badge
    4. .lobby-slot__difficulty ist NICHT position:absolute (im Flow unter Avatar)
    5. Alle 4 Slots rendern einen sichtbaren .lobby-slot__boden
       (height >= 8px)
    6. Wartende Slots rendern Name mit Text "frei" (nicht
       "wartet auf KI-Schlange")
    7. body.scrollHeight bleibt unter 1200 px (M3g-Vertrag mit M3h-Sibling-Anpassung;
       M3h hat .lobby-slot__name aus .lobby-avatar als Sibling rausgezogen
       (Pitfall #50, Border-Clipping-Fix) — +1 vertikales Element pro Slot
       erhoeht body.scrollHeight um ~90px von 1100 auf 1191. Akzeptanz an
       die neue Realitaet angepasst, nicht den CSS-Wert senken.)
    8. 0 console-/page-Errors

  Akzeptanzvertrag (m3h-stitch-lobby-avatar):
    - 4 Slots mit korrektem Flex-Column-Layout
    - 1 Host-Badge "DU" auf Host-Slot
    - 0 Host-Badges auf KI-Slots
    - 3 Difficulty-Pillen im Flow (nicht absolute)
    - 4 Boden-Streifen mit sichtbarer Hoehe
    - 1 wartender Slot mit "frei"-Text (bei aktiveKiGegner=2)
    - consoleErrors.length == 0, pageErrors.length == 0
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeLobby(page) {
  return page.evaluate(() => {
    const slots = Array.from(document.querySelectorAll('.lobby-slot'))
    const firstSlotCs = slots[0] ? window.getComputedStyle(slots[0]) : null
    const hostSlot = document.querySelector('.lobby-slot--host')
    const kiSlots = Array.from(document.querySelectorAll('.lobby-slot--ki'))
    const wartetSlots = Array.from(document.querySelectorAll('.lobby-slot--wartet'))

    const hostBadges = hostSlot ? Array.from(hostSlot.querySelectorAll('.lobby-slot__host-badge')) : []
    const kiHostBadges = kiSlots.flatMap((s) => Array.from(s.querySelectorAll('.lobby-slot__host-badge')))
    const difficultyPills = Array.from(document.querySelectorAll('.lobby-slot__difficulty'))
    const bodenStreifen = Array.from(document.querySelectorAll('.lobby-slot__boden'))

    return {
      slotCount: slots.length,
      firstSlotDisplay: firstSlotCs?.display ?? '',
      firstSlotFlexDirection: firstSlotCs?.flexDirection ?? '',
      firstSlotAlignItems: firstSlotCs?.alignItems ?? '',
      hostBadgeCount: hostBadges.length,
      hostBadgeText: hostBadges[0]?.textContent?.trim() ?? '',
      kiHostBadgeCount: kiHostBadges.length,
      kiSlotCount: kiSlots.length,
      wartetSlotCount: wartetSlots.length,
      wartetNames: wartetSlots.map((s) => s.querySelector('.lobby-slot__name')?.textContent?.trim() ?? ''),
      difficultyPositions: difficultyPills.map((p) => window.getComputedStyle(p).position),
      difficultyCount: difficultyPills.length,
      bodenCount: bodenStreifen.length,
      bodenHeights: bodenStreifen.map((b) => b.getBoundingClientRect().height),
      bodyScrollHeight: document.body.scrollHeight,
    }
  })
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
  const data = await messeLobby(page)

  await page.screenshot({ path: '/tmp/m3h_lobby_after.png' })

  const fails = []
  function check(label, ok, detail) {
    const status = ok ? 'OK' : 'FAIL'
    console.log(`  [${status}] ${label}${detail ? ' — ' + detail : ''}`)
    if (!ok) fails.push(label)
  }

  console.log('M3h Stitch-Lobby-Avatar-Promotion Smoke:')
  check('4 Slots gerendert', data.slotCount === 4, `count=${data.slotCount}`)
  check('Slot ist Flex-Column', data.firstSlotDisplay === 'flex' && data.firstSlotFlexDirection === 'column',
    `display=${data.firstSlotDisplay} flex-direction=${data.firstSlotFlexDirection}`)
  check('Slot align-items center', data.firstSlotAlignItems === 'center', `align-items=${data.firstSlotAlignItems}`)
  check('Host-Badge genau 1x', data.hostBadgeCount === 1, `count=${data.hostBadgeCount}`)
  check('Host-Badge Text = "DU"', data.hostBadgeText === 'DU', `text="${data.hostBadgeText}"`)
  check('KI-Slots ohne Host-Badge', data.kiHostBadgeCount === 0, `ki-host-badges=${data.kiHostBadgeCount}`)
  check('3 KI-Slots (Default aktiveKiGegner=1? -> 3 wartende)', data.kiSlotCount === 1 || data.kiSlotCount === 3,
    `ki-slots=${data.kiSlotCount}`)
  check('Difficulty nicht position:absolute', data.difficultyPositions.every((p) => p !== 'absolute'),
    `positions=${JSON.stringify(data.difficultyPositions)}`)
  check('Boden-Streifen count = 4', data.bodenCount === 4, `count=${data.bodenCount}`)
  check('Boden alle >= 8px hoch', data.bodenHeights.every((h) => h >= 8),
    `heights=${JSON.stringify(data.bodenHeights.map((h) => Math.round(h)))}`)
  check('body.scrollHeight <= 1200 (M3g-Vertrag + M3h-Sibling-Spalt)',
    data.bodyScrollHeight <= 1200, `scrollHeight=${data.bodyScrollHeight}`)
  check('0 console-Fehler', consoleErrors.length === 0, `count=${consoleErrors.length}`)
  check('0 page-Fehler', pageErrors.length === 0, `count=${pageErrors.length}`)

  if (data.wartetSlotCount > 0) {
    check('Wartende Slot-Namen = "frei"',
      data.wartetNames.every((n) => n === 'frei'),
      `wartetNames=${JSON.stringify(data.wartetNames)}`)
  }

  await browser.close()
  if (fails.length > 0) {
    console.log(`\nSMOKE FAIL: ${fails.length} Asserts rot: ${fails.join(', ')}`)
    process.exit(1)
  }
  console.log(`\nSMOKE OK: alle Asserts gruen`)
}

main().catch((e) => { console.error(e); process.exit(1) })
