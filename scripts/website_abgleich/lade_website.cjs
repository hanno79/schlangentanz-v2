/*
Author: Claude Code
Datum: 12.11.2026
Version: 1.0
Beschreibung: Lädt https://schlangentanz.ch/rules im Browser und legt zwei Fassungen ab:
- Markdown von Seite und allen Karten-Dialogen (`seite.md`, `dialoge.json`), aus dem
  Teil A der Spec gebaut wird;
- den reinen Bildschirmtext von Seite und Dialogen (`seite.txt`, `dialoge_text.json`),
  gegen den die Abdeckung geprüft wird. Er ist bewusst unabhängig vom Konverter.

Aufruf: node scripts/website_abgleich/lade_website.cjs <ausgabeordner>
Umgebung: PW_CHROMIUM_PFAD (optional, eigener Chromium), HTTPS_PROXY (optional).
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { KONVERTER } = require('./konverter.cjs');

const ADRESSE = 'https://schlangentanz.ch/rules';

async function main() {
  const ausgabe = process.argv[2];
  if (!ausgabe) throw new Error('Aufruf: lade_website.cjs <ausgabeordner>');
  fs.mkdirSync(ausgabe, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM_PFAD || undefined,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });
  const seite = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'de-CH' })).newPage();
  await seite.goto(ADRESSE, { waitUntil: 'load', timeout: 45000 });
  await seite.waitForFunction(() => {
    const wurzel = document.querySelector('#root');
    return wurzel && wurzel.innerText.trim().length > 500;
  }, null, { timeout: 20000 });
  await seite.waitForTimeout(1500);
  // Langsam durchscrollen, damit nachgeladene Bereiche erscheinen.
  await seite.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await seite.evaluate(`window.__md = (${KONVERTER.toString()})()`);

  const seiteMd = await seite.evaluate(() => window.__md(document.querySelector('main') || document.querySelector('#root')));
  const seiteText = await seite.evaluate(() => document.body.innerText);
  const bundle = await seite.evaluate(() =>
    [...document.querySelectorAll('script[src]')].map((s) => s.src).find((s) => /\/assets\/index-[^/]+\.js$/.test(s)) || '');

  const dialogeMd = [];
  const dialogeText = [];
  const knoepfe = seite.locator('button[aria-haspopup="dialog"]');
  const anzahl = await knoepfe.count();
  for (let i = 0; i < anzahl; i += 1) {
    const knopf = knoepfe.nth(i);
    const name = (await knopf.getAttribute('aria-label')).replace('Details zu ', '').replace(' anzeigen', '');
    await knopf.scrollIntoViewIfNeeded();
    await knopf.click();
    const dialog = seite.locator('[role=dialog]');
    await dialog.first().waitFor({ state: 'visible', timeout: 5000 });
    await seite.waitForTimeout(400);
    dialogeMd.push({ label: name, md: await seite.evaluate(() => window.__md(document.querySelector('[role=dialog]'))) });
    dialogeText.push({ label: name, text: await dialog.first().innerText() });
    await seite.keyboard.press('Escape');
    await dialog.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await seite.waitForTimeout(200);
  }
  await browser.close();

  fs.writeFileSync(path.join(ausgabe, 'seite.md'), seiteMd + '\n');
  fs.writeFileSync(path.join(ausgabe, 'seite.txt'), seiteText);
  fs.writeFileSync(path.join(ausgabe, 'dialoge.json'), JSON.stringify(dialogeMd, null, 1));
  fs.writeFileSync(path.join(ausgabe, 'dialoge_text.json'), JSON.stringify(dialogeText, null, 1));
  fs.writeFileSync(path.join(ausgabe, 'bundle.txt'), path.basename(bundle) + '\n');
  console.log(`Website geladen: ${seiteMd.length} Zeichen Markdown, ${anzahl} Karten-Dialoge, Bundle ${path.basename(bundle)}`);
}

main().catch((fehler) => {
  console.error('FEHLER beim Laden der Website:', fehler.message);
  process.exit(1);
});
