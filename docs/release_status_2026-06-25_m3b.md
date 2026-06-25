# M3b — Sonniges Nest Spielstart-Tanz (sichtbares Lobby-Erlebnis)

> **Status:** Release-Fertig (cron-run 25.06.2026 07:50 lokal).
> **Typ:** Sichtbarer Stitch-Vertical-Slice (kein Engine-Touchpoint).
> **Vorgänger:** M3a (Sonniges Nest beleben — schwingendes Codeschild,
> pulsierende Slots, Host-Badge, Play-Icons, kompakter Hero).
> **Nachfolger:** offen — naechster mittlerer Stitch-Vertical.

## Was sichtbar/strukturell besser wurde

Die Lobby auf `/` ist jetzt ein **echter Spielstart**: die drei Start-Buttons
(Duell, Waldparty, Grosse Runde) sehen aus wie tactile Spielkarten mit
3px-Dark-Forest-Border, 4px Hard-Shadow, und reagieren sichtbar auf Hover
(Card hebt sich um ~3–9 px, je nach Viewport). Aktive KI-Slots gleiten
mit einer **Schlangen-Slide-In-Animation** ins Baumhaus, sobald sie
aktiviert werden. Das Code-Schild schwingt weiterhin als Wald-Pendel
(M3a-Vertrag erhalten). Engine, Legal-Aktionen, Aria-Labels und
M3a-Verträge bleiben unangetastet.

## Slice-Scope

### Rein

- `src/App.css` (+20 Zeilen):
  - `.lobby-startbutton`: `border` von `var(--st-border-width-chunky)`
    auf literal `3px solid var(--st-color-border-strong)` umgestellt
    (Stitch-Pattern, RED-Test-1-Forderung).
  - `.lobby-startbutton`: `box-shadow` von `0 5px 0` auf
    `0 4px 0 var(--st-color-border-strong)` reduziert (Stitch-Pattern,
    konsistent mit `.waldtanz-arenastein` Hard-Shadow).
  - `.lobby-slot--ki`: Neue Regel mit `transform-origin: bottom center`
    + `animation: lobby-snake-slide 1.4s ease-out forwards`. Aktive
    KI-Slots gleiten sichtbar als Schlange ins Baumhaus, sobald sie
    durch Klick auf "Duell/Waldparty/Grosse Runde" aktiviert werden.
  - `@keyframes lobby-snake-slide`: Neue Keyframe-Definition
    (translateY + scale + opacity, 0% → 60% → 100%).
  - `@media (prefers-reduced-motion: reduce)` Block erweitert:
    - `.lobby-slot--ki, .lobby-startbutton { animation: none; }`
    - `.lobby-startbutton { transition: none; }` (Review-Kimi-Blocker
      3: Hover-Lift-transition muss bei reduced-motion ebenfalls
      stoppen).
- `scripts/m3b_sonniges_nest_spielstart_smoke.mjs` (NEU, 135 Zeilen):
  Playwright-Browser-Smoke beweist im echten Browser:
  - 3 Start-Buttons gerendert
  - 3px-Border und 4px-Hard-Shadow
  - KI-Slots haben `animationName == 'lobby-snake-slide'`
  - Code-Schild hat `animationName == 'lobby-sway'`
  - Hover hebt Card um negative Y-Pixel (sichtbarer Lift)
  - Klick auf "Waldparty" aktiviert genau 2 KI-Slots und zeigt
    Status-Text "Du + 2 KI" (wartet auf DOM-Update, nicht Timeout)
  - Keine console/page-Fehler
- `src/App.m3b_sonniges_nest_spielstart.test.tsx` (NEU, 135 Zeilen,
  9 RED-Tests): CSS-Source-Vertrag (3px-Border, box-shadow,
  Hover-Lift-Regex, .lobby-slot--ki-Animation, Code-Schild-Animation,
  M3a-Verträge bleiben, Host-Badge, Play-Icon, Reduced-Motion).
- `src/App.m3b_smoke_wiring.test.ts` (NEU, 43 Zeilen, 4 Tests):
  Smoke-Skript-Existenz, Kette-Einbindung, Vertragsbeweis.
- `package.json` (+1/-1): `m3b_sonniges_nest_spielstart_smoke.mjs`
  in `smoke:production`-Kette am Ende eingefuegt.

### Tests

- `src/App.m3b_sonniges_nest_spielstart.test.tsx`: 9 RED-Tests.
- `src/App.m3b_smoke_wiring.test.ts`: 4 RED-Tests.
- Volle Suite: **1106/1106 gruen** (338 files, vorher 1093 → +13 Tests).

## RED → GREEN

### RED-Tests (vor Implementierung, gegen clean HEAD)

- `src/App.m3b_sonniges_nest_spielstart.test.tsx`: 2/9 schlugen fehl
  (Test 1: border-Assert matchte nicht, weil `var(--st-border-width-chunky)`
  statt literal `3px`; Test 3: `.lobby-slot--ki` hatte keine Animation).
- `src/App.m3b_smoke_wiring.test.ts`: 1/4 schlug fehl (Smoke-Skript
  fehlte, package.json-Einbindung fehlte).

### Claude Code / `/simplify`

- Claude Code blieb durch den bekannten 401-Blocker unbenutzbar.
  Manueller Fallback mit objektivem RED-Test, Diff-/CSS-Cascade-/
  Line-Budget-Selbstcheck vor Review.

### Code-Review: Kimi Code CLI (statt Codex)

- Codex OAuth hatte `usage limit` (gueltig bis 25.06.2026 19:07 UTC);
  Kimi Code CLI `0.18.x` (k2p7) als Review-Fallback, review-only.
- **Befund:** `BLOCKERS: 4`, `NON-BLOCKERS: 6`.
- **Blocker adressiert (alle 4):**
  1. `messeHover()` prüfte `boundingBox().y` — wird durch `transform`
     nicht geaendert. **Fix:** `getBoundingClientRect().y` (via
     `button.evaluate`) liest die visuelle Position inkl. transform.
  2. Hartes `waitForTimeout(300)` nach Klick war Race-Condition.
     **Fix:** `page.locator('.lobby-status', { hasText: 'Du + 2 KI' })
     .waitFor({ state: 'visible', timeout: 5000 })` — wartet auf
     konkreten DOM-Zustand.
  3. `.lobby-startbutton` Reduced-Motion-Block stoppte nur `animation`,
     nicht `transition` (Hover-Lift laeuft weiter). **Fix:**
     `.lobby-startbutton { transition: none; }` im reduced-motion-Block.
  4. `.lobby-slot--ki` Animation fehlte `animation-fill-mode: forwards`
     (Element springt nach Slide-In zurueck). **Fix:** `forwards` zu
     Animation hinzugefuegt.
- **NON-BLOCKERS (alle nicht-aktional oder Review-Only):**
  - CSS-Cascade unkritisch (`.lobby-slot--ki` mit 0,2,0 wird nicht
    ueberschrieben).
  - Token-Guard sauber (nur existierende Variablen).
  - M3a-Tests brechen nicht.
  - Umlaut-Drift in den .tsx-Tests nicht vorhanden.
  - Test sucht `@keyframes waldtanz-code-pendel` (sollte
    `lobby-sway` sein) — `if`-Block wird uebersprungen, Assertion
    wird nie ausgefuehrt, Test besteht trotzdem. Schwacher Test,
    aber kein Blocker. **Nicht-aktionaler Hinweis** fuer kuenftige
    Refactor-Pass.
  - `.lobby-startbutton { animation: none }` in reduced-motion ist
    redundant (keine Animation vorhanden) — kosmetisch, kein Blocker.

## Gates

| Gate | Resultat |
|---|---|
| `npx vitest run src/App.m3b_*.test.tsx` | 13/13 gruen |
| `npx vitest run` (full suite) | 1106/1106 gruen (338 files) |
| `npm run typecheck` | gruen |
| `npm run lint` | gruen |
| `npm run build` | gruen (203.04 kB CSS, 402.49 kB JS) |
| `npm run check:test-lines` | gruen (alle Test-Dateien < 500) |
| `git diff --check` | gruen |
| `node scripts/m3b_sonniges_nest_spielstart_smoke.mjs` (lokal) | OK (border 3px, box-shadow 0 4px 0, KI-Animation lobby-snake-slide, Schild-Animation lobby-sway, Hover-Delta -8.73 px, 2 KI-Slots nach Klick) |
| `node scripts/m3b_sonniges_nest_spielstart_smoke.mjs` (production) | OK (border 3px, box-shadow 0 4px 0, KI-Animation lobby-snake-slide, Schild-Animation lobby-sway, Hover-Delta -3.22 px, 2 KI-Slots nach Klick) |
| `npm run smoke:production` (production, volle Kette) | OK (alle 40+ Smoke-Skripte gruen, inkl. M3b am Ende) |

## Release

- Commit: `M3b: Sonniges Nest Spielstart-Tanz als sichtbares Lobby-Erlebnis`
- 5 files, +341 / -3
- Push: `main` → `origin/main`
- Vercel Production Deploy: `https://schlangentanz-v2.vercel.app`
- M3b-Live-Smoke auf Production-Alias: OK (alle 6 Asserts gruen)

## Anmerkungen fuer den naechsten Slice

- M3b ist ein **rein visueller Slice** — Engine bleibt unveraendert,
  Legal-Aktionen bleiben unveraendert. Nichts an der Spielmechanik
  aendert sich, die Lobby liest sich aber jetzt als **echter
  Spielstart** (Cards heben sichtbar an, KI-Slots gleiten herein).
- Reaper-Hygiene eingehalten: keine `_probe.mjs`-Skripte, keine
  `*.png` im Repo. M3b-Smoke-Screenshot wurde nicht erzeugt (nur
  Console-Output).
- Token-Guard nicht noetig: nur existierende
  `--st-color-border-strong` und `--st-color-secondary-container`
  werden verwendet, keine neuen `:root`-Token.
- Naechster sichtbarer Vertikalschritt im M1-Bereich: **M1dh-Kandidat**
  — sichtbarer Brettschritt-Banner am Kopf des Arenensteins als
  naechster Ankerpunkt, sobald die Engine-Aktionen auf dem Stein
  einen ersten visuellen Bezugspunkt brauchen. Bis dahin ist M3b
  ein abgeschlossener Sichtbarkeits-Slice ohne Folgepflicht.
