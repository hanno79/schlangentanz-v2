# Release-Status — M1bg Waldtanz-Sonnenstand

## Scope

M1bg ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der bisher primär text-/debugartige `Spielstatus` bekommt eine sonnige, chunky `Waldtanz-Sonnenstand`-Leiste mit aktueller Phase, aktivem Spieler, Tischrunde, Zugkarten-Fortschritt und Partiestatus direkt vor den Entwicklungsdetails.

Keine Engine-Regeln, Aktionsenumeration, Zuglogik, Handkarten, Schlangenbereiche oder bestehenden Board-Interaktionen wurden geändert.

## Warum mittlerer Vertical

Der Slice ist mehr als eine Mikro-A11y-/Copy-Änderung, weil ein dauerhaft sichtbarer Haupt-HUD-Bereich vom Debuglisten-Gefühl in eine spielbrettartige Statusplakette verschoben wird und der Produktions-Smoke den real berechneten Stil prüft. Er ist kein Big-Bang, weil nur `SpielstatusPanel` plus sein CSS-/Smoke-Vertrag erweitert wird; DebugGruppe und `Zugfortschritt` bleiben bewusst erhalten.

## Umsetzung

- `src/components/SpielstatusPanel.tsx` rendert vor den Entwicklungsdetails die `Waldtanz-Sonnenstand`-Gruppe.
- `src/App.css` ergänzt 3px-Dark-Forest-Rand, Rubik-Phase, sunny radial/linear background, pill chips und Hard Shadow.
- `src/App.m1bg_waldtanz_sonnenstand.test.tsx` schützt Struktur, Reihenfolge und CSS-Vertrag.
- `scripts/live_smoke.mjs` prüft den Browser-/Production-Vertrag computed: sichtbare Sonnenstand-Texte, 3px Border, Hard Shadow, Rubik und Chip-Border.

## Verifikation

- RED: `npm test -- --run src/App.m1bg_waldtanz_sonnenstand.test.tsx` schlug initial fehl, weil `Waldtanz-Sonnenstand` und der CSS-Vertrag fehlten.
- Targeted/Adjacent: `npm test -- --run src/App.m1bg_waldtanz_sonnenstand.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r166_spielstatus_live_region_atomic.test.tsx` → 4 Testdateien / 9 Tests bestanden.
- Lokaler Browser-Smoke gegen Vite (`SMOKE_BASE_URL=http://127.0.0.1:5174 node scripts/live_smoke.mjs`) bestätigt `/`, `/game`, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1ba/M1bb-Verträge und `M1bg Sonnenstand: Spielstatus als sonniges 3px-HUD vor Debugdetails sichtbar`.
- Full Gates: `npm test -- --run` → 272 Testdateien / 847 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün. Build-Artefakte: `dist/assets/index-DovhqC8k.css`, `dist/assets/index-CEKxfvNX.js`.
- Claude Code / `/simplify`: Beide `claude --model opusplan`-Aufrufe waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-/Line-Budget-Simplify-Prüfung wurde genutzt.
- Codex Review/Re-Review: Initialer Review fand TypeScript-Blocker in der neuen Testdatei; diese wurden behoben. Re-Review und finales Review inklusive `scripts/live_smoke.mjs`: `BLOCKERS: None`.

## Release

Der finale Stand ist per Commit/Push auf `main` und Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` ausgeliefert. Der Alias-Smoke `node scripts/live_smoke.mjs` ist der dauerhafte Nachweis für den M1bg-Vertrag; diese Datei hält bewusst den stabilen Alias statt ephemerer Deploy-URLs fest.

## Nächste mittlere Lücke

Als nächster sichtbarer M1-Vertical bietet sich an, die übrigen äußeren HUD-/Materialbereiche weiter vom Textlisten-Look in board-nahe Spielobjekte zu überführen, ohne neue Regeln zu bauen — etwa eine kompaktere Aufgaben-/Material-Seitenfläche oder ein weiterer boardnaher Zugfluss-Hinweis.
