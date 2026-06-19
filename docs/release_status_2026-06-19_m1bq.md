# Release Status — 19.06.2026 — M1bq Waldtanz-Spielkamera

## Status

Feature-Commit `b3e6cd5 — M1bq: Waldtanz-Spielkamera verbreitern` ist auf `origin/main` und per Vercel Production auf der stabilen Alias <https://schlangentanz-v2.vercel.app> bereitgestellt. Dieser Dokumentationsstand ist als finaler Release-Nachweis ebenfalls auf die stabile Alias deployt.

## Slice

M1bq ist ein mittlerer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf `/game` wird der breite linke Spielrahmen zur kompakten Spielkamera, damit `Spieltisch`, `Waldtanz-Arenastein`, Zugleiste und Handkarten im ersten 1280×900-Browserbild deutlich mehr Raum bekommen.

## Warum weder Mikro-Slice noch Big-Bang

- Kein reiner A11y-/IDREF-/Copy-Slice: Die sichtbare Brettgeometrie ändert sich messbar und spielwertig.
- Kein Big-Bang: Keine Engine-Regeln, Aktionspfade, Drag-and-drop-Logik oder Komponentenstruktur wurden ersetzt; die Änderung bleibt route-scoped auf `/game`-Layout/CSS plus Tests/Smoke.
- Das Ziel folgt der Google-Stitch-Referenz: weniger Menü-/Panel-Dominanz, mehr breite zentrale Waldlichtung mit board-naher Hand.

## Sichtbarer Spielwert

- Der `Waldtanz-Spielrahmen` schrumpft im Produktions-Smoke auf 171px.
- Der `Spieltisch` wächst auf 1020px und der `Waldtanz-Arenastein` auf 708px Breite bei 1280×900.
- Die erste Handkarte bleibt vollständig im ersten Viewport (`bottom 878px`) und per Mittelpunkt-Hit-Test klickbar.
- `Waldtanz-Spielhilfe`, Zugpfad und Zugleiste bleiben board-nah rechts neben dem Waldstein; es gibt kein horizontales Clipping.

## Verifikation

- RED: `npm test -- --run src/App.m1bq_waldtanz_spielkamera.test.tsx` schlug initial auf dem alten `/game`-CSS-Vertrag fehl (`minmax(220px, 0.48fr)`, schmalerer Spieltisch).
- GREEN + stale Nachbarschaftstests: `src/App.css` kompaktierte die Route-Kamera; `src/App.m1ao_waldtanz_fokusbrett.test.tsx`, `src/App.m1ae_waldtanz_erstbild.test.tsx` und `src/App.m1aw_waldtanz_handkante.test.tsx` wurden auf die neue bewusst breitere Geometrie aktualisiert.
- Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert. Der Slice wurde als enger manueller Fallback umgesetzt und anschließend durch Codex reviewt.
- Codex Review/Re-Review: Initialer Blocker waren nur untracked lokale Screenshot-/Probe-Artefakte; diese wurden entfernt. Full-Suite-Stale-Erwartungen wurden korrigiert. Finaler Re-Review: `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1bq_waldtanz_spielkamera.test.tsx src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m1aw_waldtanz_handkante.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 282 Testdateien / 868 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` grün; `SMOKE_BASE_URL=http://127.0.0.1:4179 node scripts/m1bq_spielkamera_smoke.mjs` bestätigt Seitenrahmen 171px, Spieltisch 1020px, Waldstein 708px, Handkarte klickbar.
- Production-Smoke: `npm run smoke:production` grün auf <https://schlangentanz-v2.vercel.app>; `node scripts/m1bq_spielkamera_smoke.mjs` bestätigt denselben M1bq-Geometrievertrag auf der Alias.

## Commits

- `b3e6cd5 — M1bq: Waldtanz-Spielkamera verbreitern`

## Nächste mittlere Lücke

Der nächste Schritt sollte weiter sichtbaren Spielwert liefern: entweder die noch scrollige rechte Zug-/Hilfsleiste stärker als klare Brettobjekt-Spalte rhythmisieren oder in `M2` die nächsten Sonderkarten-Zielentscheidungen board-nah machen, ohne wieder in mechanische A11y-Mikroslices zurückzufallen.
