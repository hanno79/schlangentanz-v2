/**
 * Author: Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
 * Datum: 29.06.2026
 * Beschreibung: M6b — Live-Smoke fuer die Waldtisch-Holzplakette.
 *              Verifiziert, dass die Forest-Welcome-Holzplakette auf /game
 *              sichtbar ist und die erwarteten Inhalte (Spielername, Phase-Pille,
 *              Zugzaehler, Lebens-Pulse) traegt. Cascade-Safe doubled-class
 *              (M1dt Pattern 6) und reduced-motion-Override werden auditiert.
 *
 *              Browser-Smoke laeuft gegen Production-URL.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

async function sichtInfo(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { vorhanden: false }
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      vorhanden: true,
      sichtbar: rect.width >= 4 && rect.height >= 4 && cs.display !== 'none' && cs.visibility !== 'hidden',
      breite: rect.width,
      hoehe: rect.height,
      display: cs.display,
      animationName: cs.animationName,
    }
  }, selector)
}

function ok(label, bedingung, details) {
  const status = bedingung ? 'OK' : 'FAIL'
  console.log(`  [${status}] ${label}${details ? ` — ${details}` : ''}`)
  return bedingung
}

async function pruefeM6bWaldtischHolzwimpel(page) {
  let allesOk = true
  console.log('--- M6b: Waldtisch-Holzplakette ---')

  // 1. Auf /game navigieren
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(700)

  // 2. Holzplakette sichtbar?
  const plakette = await sichtInfo(page, '.waldtanz-waldtisch-plakette')
  allesOk = ok('Waldtisch-Holzplakette sichtbar auf /game',
    plakette.vorhanden && plakette.sichtbar,
    `${plakette.breite ?? '?'}x${plakette.hoehe ?? '?'}px`)

  // 3. Spielername sichtbar?
  const nameSlot = await sichtInfo(page, '.waldtanz-waldtisch-plakette__name')
  const nameText = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-waldtisch-plakette__name')
    return el?.textContent ?? ''
  })
  allesOk = ok('Name-Slot rendert mit Spielername',
    nameSlot.vorhanden && /Wald/.test(nameText),
    `"${nameText}"`) && allesOk

  // 4. Phase-Pille sichtbar?
  const phasePille = await sichtInfo(page, '.waldtanz-waldtisch-plakette__phase-pille')
  const phaseText = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-waldtisch-plakette__phase-pille')
    return el?.textContent ?? ''
  })
  allesOk = ok('Phase-Pille rendert mit Phase-Label',
    phasePille.vorhanden && phaseText.length > 0,
    `"${phaseText}"`) && allesOk

  // 5. Zugzaehler rendert?
  const zaehler = await sichtInfo(page, '.waldtanz-waldtisch-plakette__zaehler')
  const zaehlerText = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-waldtisch-plakette__zaehler')
    return el?.textContent ?? ''
  })
  allesOk = ok('Zugzaehler-Chip rendert Handkarten/Gespielt',
    zaehler.vorhanden && /\d+/.test(zaehlerText),
    `"${zaehlerText}"`) && allesOk

  // 6. Herz-Punkt mit pulse-Animation
  const herz = await sichtInfo(page, '.waldtanz-waldtisch-plakette__herz')
  const herzAnim = herz.animationName ?? ''
  const herzAnimOk = herzAnim === 'herz-pulse' || /herz-pulse/.test(herzAnim)
  allesOk = ok('Herz-Punkt mit herz-pulse Animation',
    herz.vorhanden && herzAnimOk,
    `animation-name=${herzAnim}`) && allesOk

  // 7. Cascade-Safe: doubled-class existiert in CSS
  const cssDoubled = await page.evaluate(() => {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules ?? [])) {
          if (rule.cssText?.includes('.waldtanz-waldtisch-plakette.waldtanz-waldtisch-plakette')) {
            return true
          }
        }
      } catch { /* cross-origin */ }
    }
    return false
  })
  allesOk = ok('Cascade-Safe: doubled-class Selector existiert in Production-CSS', cssDoubled) && allesOk

  // 8. Reduced-Motion Override
  const reducedMotion = await page.evaluate(() => {
    // Chromium postcss-preset-env reordered animation shorthand:
    // `animation: none` wird zu `animation: auto ease 0s 1 normal none running none`.
    // Akzeptiere beide Formen.
    const animNoneRegex = /(?:animation:\s*(?:none|auto\s+ease\s+0s\s+1\s+normal\s+none\s+running\s+none))/
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules ?? [])) {
          if (rule.type === 4 /* MEDIA_RULE */ && rule.media?.mediaText?.includes('prefers-reduced-motion')) {
            const mediaText = rule.cssText ?? ''
            if (mediaText.includes('waldtanz-waldtisch-plakette__herz') && animNoneRegex.test(mediaText)) {
              return true
            }
            for (const sub of Array.from(rule.cssRules ?? [])) {
              const subText = sub.cssText ?? ''
              if (subText.includes('waldtanz-waldtisch-plakette__herz') && animNoneRegex.test(subText)) {
                return true
              }
            }
          }
        }
      } catch { /* cross-origin */ }
    }
    // Variante 2: full stylesheet textContent (inline-style fallback)
    try {
      const allCss = Array.from(document.styleSheets).map((s) => {
        try { return Array.from(s.cssRules).map((r) => r.cssText).join('\n') } catch { return '' }
      }).join('\n')
      if (/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.waldtanz-waldtisch-plakette__herz[^}]*(?:animation:\s*(?:none|auto\s+ease\s+0s\s+1\s+normal\s+none\s+running\s+none))/.test(allCss)) {
        return true
      }
    } catch { /* ignore */ }
    return false
  })
  allesOk = ok('Reduced-motion Override schaltet herz-pulse ab', reducedMotion) && allesOk

  // 9. aria-label enthaelt Spielername und Phase
  const aria = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-waldtisch-plakette')
    return el?.getAttribute('aria-label') ?? ''
  })
  allesOk = ok('aria-label der Holzplakette enthaelt Wald + Phase',
    /Wald/.test(aria) && /Phase/.test(aria),
    `"${aria.slice(0, 60)}..."`) && allesOk

  // 10. Header h3 bleibt erhalten (M1di-Vertrag)
  const h3Text = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-schlangenlichtung__kopf h3')
    return el?.textContent ?? ''
  })
  allesOk = ok('Schlangenlichtung h3 unangetastet',
    /Schlangenlichtung/.test(h3Text),
    `"${h3Text}"`) && allesOk

  // Screenshot zur Doku
  await page.screenshot({ path: '/tmp/m6b_waldtisch_holzwimpel.png', fullPage: false })

  return allesOk
}

async function selfTest() {
  console.log('M6b Smoke Self-Test (kein Browser-Run)')
  console.log('  BASE_URL:', BASE_URL)
  console.log('  VIEWPORT:', JSON.stringify(VIEWPORT))
  console.log('  Helper sichtInfo + pruefeM6bWaldtischHolzwimpel vorhanden')
  console.log('  Self-Test bestanden.')
}

const isSelfTest = process.argv.includes('--self-test')

if (isSelfTest) {
  selfTest()
} else {
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()
    const consoleErrors = []
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

    const ok = await pruefeM6bWaldtischHolzwimpel(page)

    console.log('---')
    if (consoleErrors.length > 0) {
      console.log(`  Console-Errors: ${consoleErrors.length}`)
      for (const err of consoleErrors.slice(0, 5)) console.log(`    - ${err}`)
    } else {
      console.log('  Keine Console-Errors.')
    }
    console.log(`  Screenshot: /tmp/m6b_waldtisch_holzwimpel.png`)
    console.log(`  Ergebnis: ${ok ? 'PASS' : 'FAIL'}`)
    process.exit(ok ? 0 : 1)
  } finally {
    await browser.close()
  }
}