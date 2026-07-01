#!/usr/bin/env node
/**
 * M3f Brettrund-Waldobjekte Smoke
 *
 * Vertrag: Auf https://schlangentanz-v2.vercel.app/game @ 1280x900 ist der
 * .waldtanz-arenasstein__waldobjekte-Container eine horizontale Stitch-Pill-
 * Reihe mit display:flex + flex-direction:row + align-self:center + 4
 * sichtbaren Pill-Children (Nachziehstapel, Ablage, Zugspur, Aufgabentafel)
 * im Brettrund-Zentrum (y < 720, bottom <= 720).
 *
 * Author: rahn
 * Datum: 2026-07-01
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app';

async function sichtInfo(page, sel) {
  return await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { vorhanden: false };
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      vorhanden: true,
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      bottom: Math.round(r.bottom),
      display: cs.display,
      flexDirection: cs.flexDirection,
      alignSelf: cs.alignSelf,
      order: cs.order,
      maxHeight: cs.maxHeight,
      border: cs.border,
      boxShadow: cs.boxShadow,
      borderRadius: cs.borderRadius,
    };
  }, sel);
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });

  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const container = await sichtInfo(page, '.waldtanz-arenastein__waldobjekte');
  if (!container.vorhanden) {
    throw new Error('M3f: Container .waldtanz-arenastein__waldobjekte fehlt im DOM');
  }
  console.log(`M3f: Container bei (x=${container.x}, y=${container.y}, w=${container.w}, h=${container.h}) display=${container.display} flexDirection=${container.flexDirection} alignSelf=${container.alignSelf}`);

  // Contract 1: display:flex
  if (container.display !== 'flex') {
    throw new Error(`M3f: Container display MUSS flex sein, ist ${container.display}`);
  }

  // Contract 2: flex-direction:row
  if (container.flexDirection !== 'row') {
    throw new Error(`M3f: Container flex-direction MUSS row sein, ist ${container.flexDirection}`);
  }

  // Contract 3: align-self:stretch
  if (container.alignSelf !== 'stretch') {
    throw new Error(`M3f: Container align-self MUSS stretch sein, ist ${container.alignSelf}`);
  }
  // Contract 3b: order:-1 (visuell oberhalb der Schlangenlichtung)
  if (container.order !== '-1') {
    throw new Error(`M3f: Container order MUSS -1 sein, ist ${container.order}`);
  }

  // Contract 4: y im Brettrund-Zentrum (y < 720)
  if (container.y >= 720) {
    throw new Error(`M3f: Container y MUSS < 720 sein (im Brettrund-Zentrum), ist ${container.y}`);
  }
  if (container.bottom > 720) {
    throw new Error(`M3f: Container bottom MUSS <= 720 sein (komplett im Brettrund-Zentrum), ist ${container.bottom}`);
  }

  // Contract 5: 4 Pill-Children sichtbar
  const children = await page.evaluate(() => {
    const container = document.querySelector('.waldtanz-arenasstein__waldobjekte');
    if (!container) return [];
    return Array.from(container.querySelectorAll('section')).map((c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return {
        cls: c.className.split(' ').filter(x => x).join(' '),
        y: Math.round(r.y),
        x: Math.round(r.x),
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
        maxHeight: cs.maxHeight,
        border: cs.border.slice(0, 60),
        boxShadow: cs.boxShadow.slice(0, 60),
      };
    });
  });
  console.log(`M3f: ${children.length} Pill-Children gefunden`);
  for (const c of children) {
    console.log(`  - ${c.cls} (x=${c.x}, y=${c.y}, w=${c.w}, h=${c.h})`);
  }

  if (children.length !== 4) {
    throw new Error(`M3f: Erwarte 4 Pill-Children, gefunden ${children.length}`);
  }

  const expectedPillClasses = ['waldtanz-nachziehstapel', 'waldtanz-ablage', 'waldtanz-zugspur', 'waldtanz-aufgabentafel'];
  for (const expected of expectedPillClasses) {
    const found = children.find(c => c.cls.includes(expected));
    if (!found) {
      throw new Error(`M3f: Pill-Children-Klasse fehlt: ${expected}`);
    }
    if (found.w < 80) {
      throw new Error(`M3f: Pill ${expected} zu schmal (w=${found.w} < 80)`);
    }
  }

  // Contract 6: 0 Errors
  if (errs.length > 0) {
    throw new Error(`M3f: Page/Console-Errors vorhanden: ${errs.join('; ')}`);
  }

  console.log('M3f: 6/6 Asserts gruen — Brettrund-Waldobjekte als horizontale Stitch-Pill-Reihe im Brettrund sichtbar.');
  await browser.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(`M3f: FAIL — ${e.message}`);
  process.exit(1);
});
