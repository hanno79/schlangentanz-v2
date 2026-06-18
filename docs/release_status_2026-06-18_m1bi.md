# Release-Status — M1bi Waldtanz-Materialrucksack

## Scope

M1bi ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der bisher primär text-/debugartige Bereich `Material und Aufgaben` bekommt vor Aufgabenkarten und Entwicklungsdetails einen körperlichen `Waldtanz-Materialrucksack` mit echten Partie-Werten für Nachziehstapel, Ablage, Aufgabenstapel, offene Aufgaben und Sonderkarten-Zauber.

Keine Engine-Regeln, Aktionsenumeration, Zuglogik, Handkarten, Schlangenbereiche oder bestehenden Board-Interaktionen wurden geändert.

## Warum mittlerer Vertical

Der Slice ist mehr als eine Mikro-A11y-/Copy-Änderung, weil eine dauerhaft sichtbare Seitenfläche vom Debuglisten-Look in ein spielbrettnahes Materialobjekt verschoben wird und der Browser-Smoke den real berechneten Materialrucksack-Stil prüft. Er ist kein Big-Bang, weil nur der Material-/Aufgaben-HUD-Bereich extrahiert und erweitert wurde; Aufgabenkarten, Debugdetails und bestehende Material-Copy bleiben erhalten.

## Umsetzung

- `src/components/MaterialUndAufgabenPanel.tsx` kapselt die bestehende `Material und Aufgaben`-Region, hält Heading, `aria-live`, Aufgabenkarten und DebugGruppe stabil und ergänzt den `Waldtanz-Materialrucksack`.
- `src/App.tsx` nutzt die neue Komponente und sinkt von 500 auf 432 Zeilen.
- `src/App.css` ergänzt Stitch-Materialrucksack, Icon und Chips mit 3px/2px Dark-Forest-Rändern, `var(--st-radius-xl)`, Hard Shadow und sonnigen Wald-Farben.
- `src/App.m1bi_waldtanz_materialrucksack.test.tsx` schützt Struktur, Reihenfolge und CSS-Vertrag.
- `scripts/live_smoke.mjs` prüft den Browser-/Production-Vertrag computed: Materialrucksack sichtbar, Reihenfolge vor Aufgabenkarten/Debug, 3px Border, Hard Shadow, 2px Chips und gelbes Rucksack-Icon.

## Verifikation

- RED: `npm test -- --run src/App.m1bi_waldtanz_materialrucksack.test.tsx` schlug initial fehl, weil die Region `Waldtanz-Materialrucksack` fehlte.
- Targeted/Adjacent: `npm test -- --run src/App.m1bi_waldtanz_materialrucksack.test.tsx src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.r171_aufgabenkarten_live_region_atomic.test.tsx src/App.f7_aufgabenkarten.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r122_material_aufgaben_copy.test.tsx` → 6 Testdateien / 6 Tests bestanden.
- Lokaler Browser-Smoke gegen Vite (`SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/live_smoke.mjs`) bestätigt `/`, `/game`, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1ba/M1bb-Verträge und `M1bi Materialrucksack: Rucksack-Chips vor Aufgabenkarten mit 3px-Rand und Hard Shadow sichtbar`.
- Full Gates: `npm test -- --run` → 274 Testdateien / 850 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün. Build-Artefakte: `dist/assets/index-DaPPpnfR.css`, `dist/assets/index-BJvo_76G.js`.
- Claude Code / `/simplify`: Beide `claude --model opusplan`-Aufrufe waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-/Line-Budget-Prüfung wurde genutzt.
- Codex Review: Review-only auf uncommitted Worktree inklusive untracked Test/Komponente; `BLOCKERS: None`, `NON-BLOCKERS: None`. Codex verifizierte targeted Tests, Typecheck, Lint, Build, Test-Line-Budget, `git diff --check` und Smoke-Selftest; lokaler Port-Smoke war in Codex' Sandbox durch `listen EPERM` blockiert und wurde anschließend von Hermes real ausgeführt.

## Release

Feature-Commit `2161fff — M1bi: Materialrucksack im Waldtanz-HUD zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Der Alias-Smoke `node scripts/live_smoke.mjs` bestätigt `/`, `/game`, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1ba/M1bb-Verträge, `M1bi Materialrucksack: Rucksack-Chips vor Aufgabenkarten mit 3px-Rand und Hard Shadow sichtbar` und keine Console-/Page-Errors.

## Nächste mittlere Lücke

Als nächster sichtbarer M1/M5-Vertical bietet sich an, die `Spielerübersicht` weiter von Status-/Debugzeilen zu einer spielbrettnahen Tischrunde/Score-Leiste zu verdichten oder den nächsten boardnahen Zugfluss-/Mehrzug-Schritt Richtung echte Mehrzug-Playability zu liefern — weiterhin ohne A11y-Mikroslice und ohne Big-Bang.
