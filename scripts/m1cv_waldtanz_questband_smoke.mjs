/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1cv Browser-Smoke fuer das Waldtanz-Questband unter dem
Waldtanz-Arenenstein. Verifiziert die sichtbaren Quest-Pillen auf /game,
das 3px-Waldgruen-Border-Stitch-Token, die Lage unter dem Waldstein-Kopf
und das Ausbleiben des Questbands auf /. Lokal unter SMOKE_BASE_URL laufen
lassen.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cv Questband: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    const lobbyQuestband = await page.evaluate(() => Boolean(document.querySelector('.waldtanz-questband')))
    if (lobbyQuestband) {
      throw new Error('M1cv Questband: Waldtanz-Questband unerwartet sichtbar auf /')
    }

    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const beweis = await page.evaluate(() => {
      const boxData = (rect) => rect ? ({
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height),
        top: Math.round(rect.top), bottom: Math.round(rect.bottom),
      }) : null
      const arenenstein = document.querySelector('.waldtanz-arenastein')
      if (!(arenenstein instanceof HTMLElement)) throw new Error('M1cv Questband: Waldtanz-Arenenstein fehlt')
      const questband = arenenstein.querySelector('.waldtanz-questband')
      if (!(questband instanceof HTMLElement)) throw new Error('M1cv Questband: Waldtanz-Questband fehlt')
      const kopf = arenenstein.querySelector('.waldtanz-arenastein__kopf')
      const lichtung = arenenstein.querySelector('.waldtanz-arenastein__schlangenlichtung')
      const pillen = Array.from(arenenstein.querySelectorAll('.waldtanz-questband-pille'))
      const styles = (el) => {
        if (!el) return null
        const cs = window.getComputedStyle(el)
        return {
          borderTop: cs.borderTopWidth,
          borderStyle: cs.borderTopStyle,
          borderColor: cs.borderTopColor,
          borderRadius: cs.borderTopLeftRadius,
          backgroundImage: cs.backgroundImage,
        }
      }
      return {
        questband: boxData(questband.getBoundingClientRect()),
        kopf: boxData(kopf?.getBoundingClientRect() ?? null),
        lichtung: boxData(lichtung?.getBoundingClientRect() ?? null),
        pillCount: pillen.length,
        pillen: pillen.map((p) => ({
          name: p.querySelector('.waldtanz-questband-pille__name')?.textContent?.trim(),
          status: p.querySelector('.waldtanz-questband-pille__status')?.textContent?.trim(),
          klassen: p.className,
          chips: Array.from(p.querySelectorAll('.waldtanz-questband-pille__chip')).map((c) => c.textContent?.trim()),
          punkte: p.querySelector('.waldtanz-questband-pille__punkte')?.textContent?.trim(),
          styles: styles(p),
        })),
        questbandStyles: styles(questband),
        viewportHoehe: window.innerHeight,
        scrollHoehe: document.documentElement.scrollHeight,
      }
    })

    if (!beweis.questband) throw new Error('M1cv Questband: Questband-Box fehlt')
    if (beweis.pillCount === 0) {
      console.warn('M1cv Questband: keine offenen Quests im Smoke-Seed 0.2 — pruefe leeren Zustand separat.')
    }
    if (beweis.kopf && beweis.lichtung && beweis.questband) {
      if (!(beweis.questband.y >= beweis.kopf.bottom - 1)) {
        throw new Error(`M1cv Questband: Questband startet bei y=${beweis.questband.y}, aber Waldstein-Kopf endet bei y=${beweis.kopf.bottom}`)
      }
      if (!(beweis.lichtung.y >= beweis.questband.bottom - 1)) {
        throw new Error(`M1cv Questband: Schlangenlichtung startet bei y=${beweis.lichtung.y}, aber Questband endet bei y=${beweis.questband.bottom}`)
      }
    }
    const erstePille = beweis.pillen[0]
    if (erstePille && !(erstePille.name && erstePille.name.length > 0)) {
      throw new Error(`M1cv Questband: erste Pille ohne Quest-Namen (${erstePille.name})`)
    }
    if (erstePille?.styles) {
      if (erstePille.styles.borderTop !== '3px') {
        throw new Error(`M1cv Questband: erste Pille border-width=${erstePille.styles.borderTop}, erwartet 3px`)
      }
      if (!/(rgb\(6,\s*57,\s*7\)|var\(--st-color-border-strong\))/.test(erstePille.styles.borderColor)) {
        console.warn(`M1cv Questband: erste Pille border-color=${erstePille.styles.borderColor} (Stitch-Waldgruen erwartet)`)
      }
    }
    if (beweis.questbandStyles?.borderTop !== '3px') {
      throw new Error(`M1cv Questband: Band border-width=${beweis.questbandStyles?.borderTop}, erwartet 3px`)
    }

    const summary = beweis.pillen.map((p) => `${p.name}|${p.status}|${(p.chips ?? []).join(',')}`).join(' / ')
    console.log(`M1cv Questband: Band ${beweis.questband.width}x${beweis.questband.height}px, Pillen=${beweis.pillCount}, viewportHoehe=${beweis.viewportHoehe}, scrollHoehe=${beweis.scrollHoehe}, Beispiel: ${summary}`)
  } finally {
    await ctx.close()
  }
} finally {
  await browser.close()
}

if (consoleErrors.length > 0) {
  throw new Error(`M1cv Questband: Konsolenfehler ${consoleErrors.join(' | ')}`)
}
if (pageErrors.length > 0) {
  throw new Error(`M1cv Questband: Seitenfehler ${pageErrors.join(' | ')}`)
}