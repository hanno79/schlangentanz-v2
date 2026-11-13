/*
Lädt https://schlangentanz.ch/rules im Browser und liefert zwei Fassungen:
- Markdown von Seite und allen Karten-Dialogen (`seiteMd`, `dialogeMd`), aus dem
  Teil A der Spec gebaut wird;
- den reinen Bildschirmtext von Seite und Dialogen (`seiteText`, `dialogeText`),
  gegen den die Abdeckung geprüft wird. Er ist bewusst unabhängig vom Konverter.

Aufruf als Skript legt beide Fassungen zum Nachlesen in einem Ordner ab:
  node scripts/website_abgleich/lade_website.cjs <ausgabeordner>
Umgebung: PW_CHROMIUM_PFAD (optional, eigener Chromium), HTTPS_PROXY (optional).
*/
const { chromium, errors } = require('playwright');
const fs = require('fs');
const path = require('path');
const { chromiumPfad } = require('../pruefung/geraeteklassen.mjs');
const { KONVERTER } = require('./konverter.cjs');

const ADRESSE = 'https://schlangentanz.ch/rules';

function startOptionen() {
  return {
    executablePath: chromiumPfad(),
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    // Die Website liegt hinter Cloudflare und bietet HTTP/3 an (`alt-svc: h3`). Nach den
    // ersten Antworten wechselt Chromium für weitere Anfragen auf QUIC über UDP. Wo UDP
    // 443 nicht durchkommt, bleiben diese Anfragen im Headless-Lauf ohne Fehler offen;
    // das nachgeladene Bundle der Spielanleitung kommt nie an, und `#root` bleibt leer.
    // Ohne QUIC lädt Chromium alles über HTTP/2.
    args: ['--disable-quic'],
  };
}

/** Merkt sich, welche Anfragen der Seite noch ohne Antwort sind; liefert eine Abfrage. */
function beobachteAnfragen(seite) {
  const offen = new Set();
  seite.on('request', (anfrage) => offen.add(anfrage));
  seite.on('requestfinished', (anfrage) => offen.delete(anfrage));
  seite.on('requestfailed', (anfrage) => offen.delete(anfrage));
  return () => [...offen].map((anfrage) => anfrage.url());
}

/** Wartet, bis die Anleitung Text zeigt; sonst ein Fehler, der die offenen Anfragen nennt. */
async function warteAufText(seite, mindestText, wartezeit, offeneAnfragen) {
  try {
    await seite.waitForFunction((mindestens) => {
      const wurzel = document.querySelector('main') || document.querySelector('#root');
      return Boolean(wurzel) && wurzel.innerText.trim().length >= mindestens;
    }, mindestText, { timeout: wartezeit });
  } catch (fehler) {
    if (!(fehler instanceof errors.TimeoutError)) throw fehler;
    const offen = offeneAnfragen();
    throw new Error(`Die Seite zeigt nach ${wartezeit / 1000} s keinen Text (weniger als ${mindestText} Zeichen in main oder #root). `
      + `Offene Anfragen: ${offen.length ? offen.join(', ') : 'keine'}`);
  }
}

/**
 * Liest eine geladene Seite der Spielanleitung aus: Markdown und Bildschirmtext der
 * Seite, Name des Haupt-Bundles und jeden Karten-Dialog (öffnen, lesen, Escape).
 */
async function liesSeite(seite, { mindestText = 500, wartezeit = 20000, nachlauf = 1500, offeneAnfragen = () => [] } = {}) {
  await warteAufText(seite, mindestText, wartezeit, offeneAnfragen);
  await seite.waitForTimeout(nachlauf);
  // Langsam durchscrollen, damit nachgeladene Bereiche erscheinen.
  await seite.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await seite.evaluate(`window.__md = (${KONVERTER.toString()})()`);

  const { seiteMd, seiteText, bundle } = await seite.evaluate(() => ({
    seiteMd: window.__md(document.querySelector('main') || document.querySelector('#root')),
    seiteText: document.body.innerText,
    bundle: [...document.querySelectorAll('script[src]')].map((s) => s.src).find((s) => /\/assets\/index-[^/]+\.js$/.test(s)) || '',
  }));

  const dialogeMd = [];
  const dialogeText = [];
  const knoepfe = seite.locator('button[aria-haspopup="dialog"]');
  const anzahl = await knoepfe.count();
  for (let i = 0; i < anzahl; i += 1) {
    const knopf = knoepfe.nth(i);
    const label = (await knopf.getAttribute('aria-label')).replace('Details zu ', '').replace(' anzeigen', '');
    await knopf.scrollIntoViewIfNeeded();
    await knopf.click();
    const dialog = seite.locator('[role=dialog]:visible').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    const { md, text } = await dialog.evaluate((el) => ({ md: window.__md(el), text: el.innerText }));
    dialogeMd.push({ label, md });
    dialogeText.push({ label, text });
    await seite.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
  return { seiteMd, seiteText, bundle: path.basename(bundle), dialogeMd, dialogeText };
}

/** Öffnet die Spielanleitung in einem eigenen Chromium und liest sie aus. */
async function ladeWebsite() {
  const browser = await chromium.launch(startOptionen());
  try {
    const seite = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'de-CH' })).newPage();
    const offeneAnfragen = beobachteAnfragen(seite);
    await seite.goto(ADRESSE, { waitUntil: 'load', timeout: 45000 });
    const website = await liesSeite(seite, { offeneAnfragen });
    console.log(`Website geladen: ${website.seiteMd.length} Zeichen Markdown, ${website.dialogeMd.length} Karten-Dialoge, Bundle ${website.bundle}`);
    return website;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const ausgabe = process.argv[2];
  if (!ausgabe) {
    console.error('Aufruf: lade_website.cjs <ausgabeordner>');
    process.exit(2);
  }
  ladeWebsite().then((website) => {
    fs.mkdirSync(ausgabe, { recursive: true });
    fs.writeFileSync(path.join(ausgabe, 'seite.md'), website.seiteMd + '\n');
    fs.writeFileSync(path.join(ausgabe, 'seite.txt'), website.seiteText);
    fs.writeFileSync(path.join(ausgabe, 'dialoge.json'), JSON.stringify(website.dialogeMd, null, 1));
    fs.writeFileSync(path.join(ausgabe, 'dialoge_text.json'), JSON.stringify(website.dialogeText, null, 1));
  }).catch((fehler) => {
    console.error('FEHLER beim Laden der Website:', fehler.message);
    process.exit(1);
  });
}

module.exports = { startOptionen, beobachteAnfragen, liesSeite, ladeWebsite };
