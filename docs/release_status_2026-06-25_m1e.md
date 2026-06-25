# M1e — Waldtanz-Spieluhr als visueller Countdown-Ring im Brettschritt

> **Status:** Release-Fertig (cron-run 25.06.2026 02:11 lokal).
> **Typ:** Sichtbarer Brettschritt-Indikator (kein Engine-Touchpoint).
> **Vorgänger:** M1d3 (Status-HUD-Reconcile, kanonische Smoke-Kette repariert).
> **Nachfolger:** offen — nächster sichtbarer Waldtanz-Board-Vertical auf /game (M1f / M1g-Kandidaten aus dem M1-Backlog).

## Was sichtbar/strukturell besser wurde

Auf `/game` atmet jetzt eine eigene **Waldtanz-Spieluhr** mit dem Spielzustand:

- **Nachziehphase:** SVG-Countdown-Ring mit Prozentanzeige der verbleibenden
  Karten im Nachziehstapel. Text: `N Karten bis zur Sieger-Party`.
- **Endspurt:** pulsierender Ring (CSS-Keyframe mit reducedMotion-Override),
  Text: `M Züge bis zur Sieger-Party`. Anzeige wechselt von Karten zu
  Endrundenzügen.
- **Sieger-Party:** gelber Stern auf rundem Pill statt Ring, Phase abgeschlossen.

Die Spieluhr ersetzt die textuelle Partiefortschritt-Anzeige im Brettschritt
(nicht den kompakten Status in den Ranken-Chips — der bleibt als zweite
Quelle erhalten) und macht den Endspurt-Übergang erstmals sichtbar-atmend
auf dem Brett.

## Slice-Scope

### Rein

- `src/components/WaldtanzPartieUhr.tsx` (neu, 117 Zeilen): zustandsabhängiger
  SVG-Countdown-Ring + Stern, drei Phasen, aria-label/data-partie-uhr-phase,
  Pulse-Animation mit reducedMotion-Guard.
- `src/App.css` (+106 Zeilen): `.waldtanz-partie-uhr` mit chunky Stitch-Rahmen
  (3px forest-green, 4px hard shadow, pill-radius 2rem), SVG-Track und
  Progress-Kreis, Stern-Pille mit radial-gradient, `partie-uhr-puls`
  Keyframe-Animation, `prefers-reduced-motion`-Override.
- `src/App.css` `:root`-Block (+3 Token + Kommentar): drei bisher unbenutzte
  Custom-Properties ergänzt (`--st-color-on-surface-variant`,
  `--st-color-inverse-surface`, `--st-color-secondary-fixed-dim`), die in der
  Slice-CSS verwendet werden — siehe Kimi-Review-Blocker unten.
- `src/App.tsx` (5 Zeilen): Import + `leseTestPhaseAusUrl()` als optionaler
  `useState`-Initializer (nur wirksam mit `?phase=…` im Smoke) +
  `<WaldtanzPartieUhr zustand={zustand} />` im Spieltisch.
- `src/testPhaseHook.ts` (neu, 35 Zeilen, untracked): `leseTestPhaseAusUrl()`
  liefert deterministische Phasen-Fixtures (nur `spielende` / `endspurt`)
  für Browser-Smoke-Tests. Liest nur `window.location.search`, schreibt
  nie `window.location`.
- `scripts/m1e_waldtanz_spieluhr_smoke.mjs` (neu, 153 Zeilen): Playwright-Smoke
  beweist im echten Browser die drei Phasen auf `/game`,
  `/game?phase=endspurt`, `/game?phase=spielende`, mit reducedMotion,
  pageerror/console-error-Cleanup, Geometrie + Sichtbarkeits-Asserts.
- `package.json`: M1e-Smoke in `smoke:production`-Kette aufgenommen
  (zwischen M1dd und M1d1, konsistente Reihenfolge).

### Tests

- `src/App.m1e_partie_uhr.test.tsx` (neu, 107 Zeilen): 4 RED-Tests.
  - SVG-Countdown-Ring im Spieltisch mit `data-partie-uhr-phase=nachziehphase`
    und „8 Karten bis zur Sieger-Party".
  - Endspurt wechselt zu „2 Züge bis zur Sieger-Party" + `.waldtanz-partie-uhr--puls`.
  - Spielende zeigt Sieger-Party-Stern statt Countdown-Kreis.
  - Chunky Stitch-Brettrahmen + zentrale Kreisbahn (CSS-source-Asserts).
- `src/App.m1e_waldtanz_spieluhr_smoke_wiring.test.ts` (neu, 34 Zeilen):
  3 Smoke-Wiring-Tests (Kette-Bindung, Slice-Reihenfolge, Skript-Existenz)
  + 3 Token-Guard-Tests, die prüfen, dass die drei oben ergänzten
  Custom-Properties tatsächlich in `:root` definiert sind (Kimi-Blocker
  B1 fix + Regression-Schutz).

### Raus (explizit)

- Keine Engine-Änderung.
- Keine Layout-/Viewport-Schirurgie (Arena-Cap, Grid-Order, Height-Tuning
  bleiben unangetastet — bleiben in M1d0/M1d1/M1d2).
- Keine neuen Brettobjekte (WaldtanzPartieUhr ist ein Status-Indikator,
  kein klickbares Spielelement).
- Keine Änderung am Partiefortschritt-Panel (das parallel in den
  Ranken-Chips existiert).

## RED → GREEN

### RED-Tests (vor Implementierung, gegen clean HEAD)

- `src/App.m1e_partie_uhr.test.tsx`: 3/4 schlugen fehl (Spieluhr existierte
  nicht, Phasenumschaltung nicht implementiert, Stern nicht vorhanden).
- `src/App.m1e_waldtanz_spieluhr_smoke_wiring.test.ts`: 3/6 schlugen fehl
  (Smoke-Skript nicht in Kette, Token nicht in :root).
- `npm run typecheck` / `lint` / `build`: grün nach GREEN.

### Claude Code / `/simplify`

- `claude --model opusplan` blieb durch den bekannten 401-Blocker
  unbenutzbar (siehe M1d3-Doku). Enger manueller Fallback mit objektivem
  RED-Test, Diff-/CSS-Cascade-/Line-Budget-Selbstcheck vor Review.

### Code-Review: Kimi Code CLI (statt Codex)

- Codex OAuth hatte `usage limit` (gültig bis 25.06.2026 19:07 UTC);
  Kimi Code CLI `0.18.x` (k2p7) als Review-Fallback, review-only, mit
  identischem Kontext wie Codex.
- **Befund B1 (BLOCKER):** Drei CSS-Custom-Properties
  (`--st-color-on-surface-variant`, `--st-color-inverse-surface`,
  `--st-color-secondary-fixed-dim`) waren in der Slice-CSS verwendet,
  aber **nirgends in `:root` definiert**. Sie fielen still auf
  inherited black zurück.
  **Fix:** Token in `:root` ergänzt mit Werten aus der bestehenden
  Container-Token-Familie (siehe `src/App.css` Kommentar-Block am 24.06.2026).
  Regression-Tests in `m1e_waldtanz_spieluhr_smoke_wiring.test.ts`
  verhindern Wiederholung.
- NON-BLOCKERS: 9 bestätigte, keine Aktion erforderlich
  (Phase-Logik, Accessibility-Attribute, Cascade-Reihenfolge, App.tsx
  bleibt mit 497 Zeilen unter 500, keine Tailwind-Imports,
  Test-Suite grün, Smoke-Skript-Logik korrekt, testPhaseHook sauber
  isoliert, Build-Qualität grün).

### Re-Review

- Nicht erforderlich — B1-Fix war ein 3-Zeilen-Token-Add in `:root`
  + drei regression-Tests, Kimi-Befund exakt reproduziert durch RED-Test
  gegen clean HEAD bestätigt. Token-Guard-Tests decken exakt die
  Kimi-Aussage ab.

## Gates

| Gate | Resultat |
|---|---|
| `npx vitest run src/App.m1e_partie_uhr.test.tsx` | 4/4 grün |
| `npx vitest run src/App.m1e_waldtanz_spieluhr_smoke_wiring.test.ts` | 6/6 grün |
| `npx vitest run` (full suite) | 1074/1074 grün (332 files) |
| `npm run typecheck` | grün |
| `npm run lint` | grün |
| `npm run build` | grün (197.74 kB CSS, 401.32 kB JS) |
| `npm run check:test-lines` | grün (alle Test-Dateien < 500) |
| `git diff --check` | grün |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` (lokal gegen 127.0.0.1:4173) | 3/3 Phasen grün |
| `npm run smoke:production` (lokal) | grün (alle 35 Skripte) |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` (live) | 3/3 Phasen grün |
| `node scripts/m1dd_…_smoke.mjs` (live) | grün |
| `node scripts/m1d1_…_smoke.mjs` (live) | grün |
| `node scripts/live_smoke.mjs` (live) | grün |

## Release

- Commit: `38db3c5 M1e: Waldtanz-Spieluhr als visueller Countdown-Ring im Brettschritt`
- 8 files, +586 / -2
- Push: `main` → `origin/main` (94426a6 → 38db3c5)
- Vercel Production Deploy: `https://schlangentanz-v2-m5xlwgu64-alfreds-projects-7e9df1b4.vercel.app`
- Production-Alias bestätigt: `https://schlangentanz-v2.vercel.app`
- M1e-Live-Smoke auf Production-Alias: Phasen-Wechsel bestanden, keine console/page-errors.

## Anmerkungen für den nächsten Slice

- App.tsx liegt mit 497 Zeilen nur noch 3 Zeilen unter dem 500er-Budget.
  Der nächste M1-Slice, der App.tsx anfasst, sollte Komponenten-Extraktion
  mitbringen (z.B. ein Brettschritt-Container-Component, das den
  WaldtanzPartieUhr + Spielstatus-Chips + Brettschritt-Stempel bündelt).
- M1e ist ein **reiner Sichtbarkeits-Slice** — keine Interaktion. Der
  nächste sinnvolle Vertikalschritt auf /game ist eine **Aktionskopplung**
  (Phase-Button oder End-Turn neben der Spieluhr) oder eine **echte
  Mehrzug-Endgame-E2E-Playability** gegen die Spec (M5-Cluster).
- Token-Guard-Pattern hat sich bewährt (3 Token, alle per :root-Block +
  drei regression-tests abgesichert). Für die nächsten CSS-Slices
  lohnt sich ein vorgeschalteter `rg "var\(--" src/ | sort -u` und
  Abgleich gegen `:root`, bevor der Slice committed wird.
