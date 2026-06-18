# Release-Status 18.06.2026 — M2p Schlangenhäutung-Häutungsring

## Status

Release abgeschlossen auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M2p ist ein mittlerer board-naher Interaktions-Vertical im `M1/M2 Waldtanz Game Board`: Eine ausgewählte `Schlangenhäutung` verwandelt die eigene Zielschlange nicht mehr in einen flachen Textblock, sondern zeigt einen körperlichen `Schlangenhäutung-Häutungsring` mit Icon, Chip `Kartenhaut lösen`, sichtbaren Reihenfolge-Vorschauen und zwei bestehenden Engine-Aktionspfaden. Das ist kein A11y-Mikroslice, weil es die konkrete Spielentscheidung direkt am Brett sichtbar macht; es ist aber auch kein Big-Bang, weil Engine, Legalitätsprüfung, Handkarten, Gegnerbereiche und globale Layoutstruktur unverändert bleiben.

## Umsetzung

- `src/components/SchlangenhaeutungBrettziel.tsx` erhält den neuen Spielobjekt-Layer `schlangenhaeutung-haeutungsring`, behält aber die bestehende Gruppenbenennung und die vorhandenen Button-`aria-label`s/Aktionspfade.
- `src/App.css` ergänzt den Stitch-Vertrag: 3px Dark-Forest-Border über `--st-border-width-chunky`, `--st-radius-xl`, `--st-shadow-hard`, radialen Sunny/Lime-Hintergrund, rundes Icon und einen kaskadengesicherten sekundären Button.
- `src/App.m2d_schlangenhaeutung_brettziel.test.tsx` wurde zur M2p-Regression erweitert: sichtbarer Häutungsring statt alter Copy, CSS-Vertrag, KI-Gating und beide Engine-Pfade (`Schlange umkehren`, `Erste Karte ans Ende`) sind getestet.

## Verifikation

- RED: `npm test -- --run src/App.m2d_schlangenhaeutung_brettziel.test.tsx` scheiterte initial, weil `schlangenhaeutung-haeutungsring` und der CSS-Vertrag fehlten.
- Claude Code / `/simplify`: Beide Versuche mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; umgesetzt wurde ein enger manueller Fallback mit dokumentierter Abweichung.
- Codex Review/Re-Review: Initial `BLOCKERS: None`, Non-Blocker zur fehlenden Ausführung der zweiten Ring-Option wurde durch einen zusätzlichen Engine-Pfad-Test behoben. Re-Review: `BLOCKERS: None`, Prior-Coverage-Finding resolved.
- Targeted/Adjacent: `npm test -- --run src/App.m2d_schlangenhaeutung_brettziel.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx` → 7 Testdateien / 12 Tests bestanden.
- Full Gates: `npm test -- --run` → 267 Testdateien / 835 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Build-Artefakte: `dist/assets/index-sGW7dESh.css`, `dist/assets/index-DhzFO0HC.js`.

## Deploy und Smoke

- Feature-Commit: `c80c88b — M2p: Schlangenhäutung als Häutungsring zeigen`.
- Production-Deploy: Vercel `READY` in 29s, stabiler Alias `https://schlangentanz-v2.vercel.app`.
- Generic Production-Smoke: `npm run smoke:production` bestätigt `/` und `/game` HTTP 200, Kernregionen, M1as/M1aw/M1ax/M1ay/M1bc/M1ba/M1bb-Verträge und keine Console-/Page-Errors.
- Slice-Smoke (Bundle-Vertrag, weil `Schlangenhäutung` nicht im aktuellen Produktions-Startdeck enthalten und der bedingte Ring im bounded Live-Spiel nicht zuverlässig erreichbar ist): Production-CSS-Bundle `index-sGW7dESh.css` enthält `.schlangenhaeutung-haeutungsring`, `__icon`, `__button`, `--st-border-width-chunky`, `--st-radius-xl`, `--st-shadow-hard`; Production-JS-Bundle `index-DhzFO0HC.js` enthält `Schlangenhäutung-Häutungsring`, `Kartenhaut lösen`, `schlangenhaeutung-haeutungsring` und `erste Karte von Schlange`. Der vollständige Klick-/Engine-Flow ist lokal fixturiert durch die M2p-Regressionen bewiesen.

## Nächste mittlere Lücke

Der nächste sinnvolle Schritt Richtung echtes Browser-Spiel ist ein weiterer sichtbarer Spielwert-Vertical statt Mikro-A11y: entweder die verbleibenden Schlangenhäutung-/Sonderkarten-Sonderfälle konsolidiert als einheitliche Brett-Zauberwerkzeuge, oder ein Endspurt-/Sieger-Feedback-Objekt, das den aktuellen Brettentscheidungen unmittelbar mehr Spielgefühl gibt.
