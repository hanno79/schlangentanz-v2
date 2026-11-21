// Prüferskript K2 Iteration 3: Szenarien ki-* und Saat 5 am Entwicklertisch mit Playwright, Desktop 1280×900.
import { chromium } from 'file:///E:/Work/Privat/Schlangentanz_v2/.claude/worktrees/agent-a04f885fdf9d8dda5/node_modules/playwright/index.mjs'
import { appendFileSync } from 'node:fs'

const [, , basis, log, bilder] = process.argv
const schreibe = (t) => appendFileSync(log, t + '\n')
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const fehler = []
seite.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()) })
seite.on('pageerror', (e) => fehler.push(String(e)))

const solide = () => seite.getByRole('button', { name: 'KI-Schritt (solide)', exact: true })
async function klickeBisGesperrt(max = 20) {
  let n = 0
  while (n < max && (await solide().isEnabled())) { await solide().click(); n++ }
  return n
}
async function lies() {
  return seite.evaluate(() => {
    const t = document.body.innerText
    const v = t.lastIndexOf('\nVerlauf')
    const r = t.indexOf('Rohzustand', v)
    const e = t.indexOf('Endwertung, wenn')
    return {
      schritt: (t.match(/Schritt \d+/) || [])[0],
      inv: (t.match(/Invarianten[^\n]*/) || [])[0],
      verlauf: t.slice(v + 1, r).trim().split('\n').slice(1).join(' | '),
      end: t.slice(e, e + 260).replace(/­/g, '').split('\n').slice(2, 7).join(' / '),
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }
  })
}

for (const name of ['ki-dreiergruppe', 'ki-dreiergruppe-joker', 'ki-dreiergruppe-ausnahme', 'ki-farbe-und-sonderkarte', 'ki-regenbogen-eigene', 'ki-fusion-senkt', 'ki-grube-ohne-zug', 'ki-grube-schlussrunde', 'ki-wirkungslos', 'ki-verdoppler']) {
  await seite.goto(`${basis}/dev?szenario=${name}`)
  await solide().waitFor()
  const klicks = await klickeBisGesperrt()
  const l = await lies()
  schreibe(`${name}: ${klicks} Klicks, ${l.schritt}, ${l.inv}; Verlauf: ${l.verlauf}; Endwertung: ${l.end}; scrollWidth ${l.sw} / clientWidth ${l.cw}`)
  if (name === 'ki-farbe-und-sonderkarte') {
    await seite.getByRole('heading', { name: 'Wertung', exact: true }).scrollIntoViewIfNeeded()
    await seite.evaluate(() => window.scrollBy(0, -10))
    await seite.screenshot({ path: `${bilder}/K2-it3-ki-farbe-und-sonderkarte-wertung.png` })
  }
}

// Saat 5 zu dritt (TF-DEV-037)
await seite.goto(`${basis}/dev?seed=5&spieler=3&erweiterung=0`)
await solide().waitFor()
await seite.locator('button', { hasText: '"karteId":"gelb-15","ziel":{"art":"neueSchlange"}' }).first().click().catch(async () => {
  await seite.getByRole('button', { name: /gelb-15.*neueSchlange|gelb-15\) → neue Schlange/ }).first().click()
})
await seite.getByRole('button', { name: /ZugBeenden/ }).first().click()
const klicks5 = await klickeBisGesperrt()
const l5 = await lies()
schreibe(`Saat 5: ${klicks5} Klicks, ${l5.schritt}, ${l5.inv}; Verlauf: ${l5.verlauf}`)
schreibe(`Konsolenfehler: ${fehler.length}${fehler.length ? ' ' + fehler.join(' || ') : ''}`)
await browser.close()
