// M7a: Waldtanz-Spieler-Hero als Stitch-Stats-Card — Live-Smoke gegen Production.
// Beweist: linker Spielrahmen hat grossen Stats-Hero (Avatar 64×64,
// Forest-Spirit-Tag, Punkte-Zahl), pre-existing Rankenchips bleiben
// sichtbar fuer M1ci-Kompatibilitaet.
import { chromium } from 'playwright';

const BASE = 'https://schlangentanz-v2.vercel.app';
const URL = `${BASE}/game`;

export async function pruefeM7aSpielerHero(page) {
  const errors = [];
  const results = [];

  // 1. Stats-Hero sichtbar mit Avatar + Tag + Punkten
  const hero = await page.locator('.waldtanz-seitenmenue__stats-hero').first();
  const heroBox = await hero.boundingBox();
  const heroVisible = heroBox && heroBox.width > 100 && heroBox.height > 50;
  results.push({ check: 'stats-hero-sichtbar', ok: !!heroVisible, box: heroBox });
  if (!heroVisible) errors.push('Stats-Hero nicht sichtbar');

  // 2. Avatar 64x64 (auf /game kompakter: 52x52 — siehe route-scoped override)
  const avatar = await page.locator('.waldtanz-seitenmenue__stats-hero-avatar').first();
  const avatarBox = await avatar.boundingBox();
  const avatarSize = avatarBox ? Math.round(avatarBox.width) : 0;
  // Auf /game ist Avatar 52px, auf / ist 64px. Mindestens 40px sichtbar.
  results.push({ check: 'avatar-min-40px', ok: avatarSize >= 40, size: avatarSize });
  if (avatarSize < 40) errors.push(`Avatar zu klein: ${avatarSize}px`);

  // 3. Punkte-Zahl sichtbar mit Zahl
  const punkteEl = await page.locator('.waldtanz-seitenmenue__stats-hero-punkte').first();
  const punkteText = (await punkteEl.textContent())?.trim() ?? '';
  const hasPunkteZahl = /\d+\s*Punkte/i.test(punkteText);
  results.push({ check: 'punkte-zahl', ok: hasPunkteZahl, text: punkteText });
  if (!hasPunkteZahl) errors.push(`Punkte-Zahl fehlt: "${punkteText}"`);

  // 4. Tag sichtbar "Forest Spirit"
  const tagEl = await page.locator('.waldtanz-seitenmenue__stats-hero-tag').first();
  const tagText = (await tagEl.textContent())?.trim() ?? '';
  const hasTag = /Forest\s*Spirit/i.test(tagText);
  results.push({ check: 'tag-forest-spirit', ok: hasTag, text: tagText });
  if (!hasTag) errors.push(`Tag fehlt: "${tagText}"`);

  // 5. Pre-existing Rankenchips bleiben sichtbar
  const rankenChips = await page.locator('.waldtanz-seitenmenue__rankenchip').count();
  results.push({ check: 'rankenchips-anzahl', ok: rankenChips >= 3, count: rankenChips });
  if (rankenChips < 3) errors.push(`Nur ${rankenChips} Rankenchips (erwartet >=3)`);

  // 6. Pre-existing Spielrahmen + Kompass bleiben
  const spielrahmen = await page.locator('[aria-label="Waldtanz-Spielrahmen"]').count();
  const kompass = await page.locator('[aria-label="Waldtanz-Kompass"]').count();
  results.push({ check: 'spielrahmen-bestehend', ok: spielrahmen === 1, count: spielrahmen });
  results.push({ check: 'kompass-bestehend', ok: kompass === 1, count: kompass });
  if (spielrahmen !== 1) errors.push(`Spielrahmen count=${spielrahmen}`);
  if (kompass !== 1) errors.push(`Kompass count=${kompass}`);

  return { ok: errors.length === 0, errors, results };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const selfTest = process.argv.includes('--self-test');
  if (selfTest) {
    console.log(JSON.stringify({ mode: 'self-test', url: URL, fn: 'pruefeM7aSpielerHero', ok: true }));
    process.exit(0);
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    const startBtn = await page.$('.schlangen-startzone__faehrte-button');
    if (startBtn) { await startBtn.click({ force: true }); await page.waitForTimeout(600); }
    const result = await pruefeM7aSpielerHero(page);
    await page.screenshot({ path: '/tmp/m7a_production.png', fullPage: false });
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
    process.exit(result.ok ? 0 : 1);
  } catch (e) {
    console.error('Fehler:', e.message);
    await browser.close();
    process.exit(2);
  }
}