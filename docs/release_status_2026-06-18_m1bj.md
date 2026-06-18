# Release-Status — M1bj Waldtanz-Spielerbänke

## Scope

M1bj ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die bisher primär text-/debugartige `Spielerübersicht` bekommt vor den bestehenden Spielerstatus-Entwicklungsdaten körperliche `Waldtanz-Spielerbänke` mit Sitzplätzen für alle Spieler, aktivem Sitz, Handkarten-, Schlangen-, Aufgaben- und Punktewerten.

Keine Engine-Regeln, Aktionsenumeration, Zuglogik, Handkarten, Schlangenbereiche oder bestehenden Board-Interaktionen wurden geändert.

## Warum mittlerer Vertical

Der Slice ist mehr als eine Mikro-A11y-/Copy-Änderung, weil ein dauerhaft sichtbarer Seitenbereich vom Statuslisten-Look in ein spielbrettnahes Tischrundenobjekt verschoben wird und der Browser-Smoke den real berechneten Spielerbänke-Stil prüft. Er ist kein Big-Bang, weil nur die Spielerübersicht extrahiert und erweitert wurde; Spielerstatus-Entwicklungsdaten, Wertung, Material, Aktionen und Board-Interaktionen bleiben erhalten.

## Umsetzung

- `src/components/SpieleruebersichtPanel.tsx` kapselt die bestehende `Spielerübersicht`, hält Überschrift, `aria-live`, `DebugGruppe` und alte Spielerstatus-Copy stabil und ergänzt die `Waldtanz-Spielerbänke`.
- `src/App.tsx` nutzt die neue Komponente und sinkt von 432 auf 397 Zeilen.
- `src/App.css` ergänzt die Spielerbänke als chunky HUD-Objekt mit 3px Dark-Forest-Rand, `var(--st-radius-xl)`, Hard Shadow, Sitzkarten und aktivem Sitz.
- `src/App.m1bj_waldtanz_spielerbaenke.test.tsx` schützt Struktur, Reihenfolge vor Entwicklungsdaten und CSS-Vertrag.
- `scripts/live_smoke.mjs` prüft den Browser-/Production-Vertrag computed: Spielerbänke sichtbar, 3px Border, Hard Shadow, aktiver Sitz, Reihenfolge vor Debugdaten. Der Smoke bleibt mit 499 Zeilen unter der aktuellen Skriptgrenze, ist aber für den nächsten Slice knapp.

## Verifikation

- RED: `npm test -- --run src/App.m1bj_waldtanz_spielerbaenke.test.tsx` schlug initial fehl, weil die Gruppe `Waldtanz-Spielerbänke` fehlte.
- Targeted/Adjacent: `npm test -- --run src/App.m1bj_waldtanz_spielerbaenke.test.tsx src/App.r167_spieleruebersicht_live_region_atomic.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r127_spieleruebersicht_copy.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- Lokaler Browser-Smoke gegen Vite (`SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/live_smoke.mjs`) bestätigt `/`, `/game`, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1bi/M1ba/M1bb-Verträge und `M1bj Spielerbänke: 2 Sitzplätze vor Debugdaten mit 3px-Rand und aktivem Sitz sichtbar`.
- Full Gates: `npm test -- --run` → 275 Testdateien / 851 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün. Build-Artefakte: `dist/assets/index-DbpCYBQ-.css`, `dist/assets/index-D1QKu0xG.js`.
- Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-/Line-Budget-Simplify-Prüfung wurde genutzt.
- Codex Review: Review-only auf uncommitted Worktree inklusive untracked Test/Komponente; `BLOCKERS: None`. Non-Blocker: `scripts/live_smoke.mjs` hat nur noch eine Zeile Headroom, CSS-Source-Test ist durch computed Smoke abgesichert, Spielerübersicht-Live-Region kann langfristig lauter werden, Punkte/Aufgaben überlappen bewusst mit Wertung, Desktop-Smoke deckt die visuelle Oberfläche ab.

## Release

Feature-Commit `584a50c — M1bj: Spielerübersicht als Waldtanz-Spielerbänke zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Der Alias-Smoke `node scripts/live_smoke.mjs` bestätigt `/`, `/game`, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1bi/M1ba/M1bb-Verträge, `M1bj Spielerbänke: 2 Sitzplätze vor Debugdaten mit 3px-Rand und aktivem Sitz sichtbar` und keine Console-/Page-Errors.

## Nächste mittlere Lücke

Vor dem nächsten sichtbaren Board-Vertical sollte der Production-Smoke aus `scripts/live_smoke.mjs` heraus modularisiert oder entlastet werden, weil die Datei mit 499 Zeilen praktisch keinen Spielraum mehr hat. Danach bietet sich wieder ein spielwertiger Vertical an: entweder mehr echte Mehrzug-/Endgame-Playability im M5-Strang oder ein weiteres Google-Stitch Brettobjekt, das Debug-/Listenflächen in physische Spielobjekte verwandelt.
