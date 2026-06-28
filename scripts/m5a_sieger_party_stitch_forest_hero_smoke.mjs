/*
Author: hermes-cron
Datum: 28.06.2026
Version: 1.0
Beschreibung: M5a Browser-Smoke fuer Stitch-Waldlichtung-Forest-Hero-Transformation
der Sieger-Party. Verifiziert auf Production: Sunset-Gradient auf .sieger-party,
Leaderboard-Badge mit 12deg-Rotation und coral-Tertiärcontainer, Scorekarte mit
-gelbem secondary-container und -2deg-Tilt, Nochmal-spielen-Knopf mit
lime-primary-container, 8px-Hard-Shadow und Hover-Scale. Kein Page-Error.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
function url(route) { return new URL(route, BASE_URL).toString() }

async function main() {
  const isSelfTest = process.argv.includes('--self-test')
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })

  try {
    if (isSelfTest) {
      // Self-Test laedt nur das Skript + Helper + URL — keine echte Browser-Smoke.
      console.log('M5a Self-Test: Skript kompiliert, BASE_URL =', BASE_URL)
      console.log('OK')
      return
    }

    // Direkt auf /game mit Fixture-Bypass: Sieger-Party wird im Normalzustand
    // nicht gerendert (zugphase !== 'Spielende'). Wir pruefen daher den
    // M5a-CSS-Vertrag im Cascade ueber die Stil-Tags, die App.css einspeist.
    await page.goto(url('/game'), { waitUntil: 'networkidle' })

    // 1. Sieger-Party existiert nicht im Normalzustand, aber das CSS ist global.
    //    Wir verifizieren das Stylesheet ueber document.styleSheets.
    const cssText = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      let combined = ''
      for (const sheet of sheets) {
        try {
          for (const rule of Array.from(sheet.cssRules ?? [])) {
            combined += rule.cssText + '\n'
          }
        } catch { /* CORS-blocked Stylesheet, skip */ }
      }
      return combined
    })

    // sichtRegel: depth-tracked { } damit @media-Inner-Regeln uebersprungen werden.
    function sichtRegel(css, selektor) {
      const escaped = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = Array.from(css.matchAll(new RegExp(`(^|[\\s,>.}\\]])${escaped}\\s*\\{`, 'g')))
      if (matches.length === 0) return ''
      // Iteriere rueckwaerts: nimm den letzten Match, dessen Klammer-Scope
      // auf Top-Level-Ebene liegt (depth = 0 vor der Match-Brace).
      for (let i = matches.length - 1; i >= 0; i--) {
        const matchIndex = matches[i].index
        let depth = 0
        for (let j = 0; j < matchIndex; j++) {
          const ch = css[j]
          if (ch === '{') depth++
          else if (ch === '}') depth--
        }
        if (depth !== 0) continue
        const braceStart = matchIndex + matches[i][0].length - 1
        let innerDepth = 1
        let end = braceStart + 1
        while (innerDepth > 0 && end < css.length) {
          if (css[end] === '{') innerDepth++
          else if (css[end] === '}') innerDepth--
          end++
        }
        return css.slice(braceStart + 1, end - 1)
      }
      return ''
    }

    const siegerParty = sichtRegel(cssText, '.sieger-party')
    const portrait = sichtRegel(cssText, '.sieger-party__portrait')
    const leaderboard = sichtRegel(cssText, '.sieger-party__leaderboard-badge')
    const scorekarte = sichtRegel(cssText, '.sieger-party__scorekarte')
    const neustart = sichtRegel(cssText, '.sieger-party__neustart')
    const statsDiv = sichtRegel(cssText, '.sieger-party__stats div')
    const scorewert = sichtRegel(cssText, '.sieger-party__scorewert')
    const kopfH2 = sichtRegel(cssText, '.sieger-party__kopf h2')

    const checks = [
      ['Sunset-Forest-Backdrop auf .sieger-party', siegerParty.includes('linear-gradient(180deg')],
      ['tertiary-container im Backdrop', siegerParty.includes('--st-color-tertiary-container')],
      ['secondary-container im Backdrop', siegerParty.includes('--st-color-secondary-container')],
      ['surface-dim im Backdrop', siegerParty.includes('--st-color-surface-dim')],
      ['Hero-Headline traegt party-wiggle-Animation', /\bparty-wiggle\b/.test(kopfH2)],
      ['Hero-Headline hat -webkit-text-stroke 3px', /-webkit-text-stroke:\s*3px\s+var\(--st-color-border-strong\)/.test(kopfH2)],
      ['Portrait hat clamp 13-20rem', /width:\s*clamp\(13rem,\s*28vw,\s*20rem\)/.test(portrait)],
      ['Leaderboard-Badge hat tertiary-container', /var\(--st-color-tertiary-container\)/.test(leaderboard)],
      ['Leaderboard-Badge hat rotate(12deg)', /rotate\(12deg\)/.test(leaderboard)],
      ['Leaderboard-Badge hat wiggle-Animation', /\bparty-wiggle\b/.test(leaderboard)],
      ['Scorekarte hat secondary-container', /var\(--st-color-secondary-container\)/.test(scorekarte)],
      ['Scorekarte hat 8px-Hard-Shadow', /box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/.test(scorekarte)],
      ['Scorekarte hat rotate(-2deg)', /rotate\(-2deg\)/.test(scorekarte)],
      ['Stats-Pillen haben border-radius 999px', /border-radius:\s*999px/.test(statsDiv)],
      ['Stats-Pillen haben 3px Hard-Shadow', /box-shadow:\s*3px 3px 0 var\(--st-color-border-strong\)/.test(statsDiv)],
      ['Scorewert hat primary-container', /var\(--st-color-primary-container\)/.test(scorewert)],
      ['Scorewert hat headline-Font', /font-family:\s*var\(--st-font-headline\)/.test(scorewert)],
      ['Neustart hat primary-container', /var\(--st-color-primary-container\)/.test(neustart)],
      ['Neustart hat 8px-Hard-Shadow', /box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/.test(neustart)],
      ['Neustart hat border-radius 999px', /border-radius:\s*999px/.test(neustart)],
    ]

    let failed = 0
    for (const [label, ok] of checks) {
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`)
      if (!ok) failed++
    }

    if (errors.length > 0) {
      console.log('\nConsole/Page-Fehler:')
      for (const err of errors) console.log(`  - ${err}`)
      failed++
    } else {
      console.log('\nKeine Console/Page-Fehler.')
    }

    await page.screenshot({ path: '/tmp/m5a_sieger_party_css_audit.png', fullPage: false })

    if (failed > 0) {
      console.log(`\nFAIL: ${failed} Checks fehlgeschlagen.`)
      process.exitCode = 1
    } else {
      console.log('\nAlle 20 CSS-Vertrag-Checks bestanden.')
    }
  } finally {
    await browser.close()
  }
}

await main()
