# Release-Status — 15.06.2026 M1ah Waldtanz-Magiekreise

## Slice

M1ah ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die Schlangenlichtung bekommt zwischen `Waldtanz-Tischkarte` und `Schlangenbereich` eine eigene `Waldtanz-Magiekreise`-Zieloberfläche. Nach Auswahl einer Handkarte leuchten Startkreis und Schlangenende als echte Brettobjekte mit Zielkarte und Brettwege-Zähler.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Spieler sieht eine neue zentrale Board-Oberfläche, die Handkartenwahl und Brettziele visuell verbindet.
- Kein Big-Bang: Engine-Regeln, Drag-and-drop, direkte Boardbuttons, Fallback-Aktionsdock, Lobby, Regeln und Sieger-Party bleiben unverändert.
- Die Änderung ist ein Normal-Flow-Spielbrettobjekt, kein Overlay; dadurch bleibt das bestehende Anklicken/Drop auf Startzone und Schlangenbereich erhalten.

## Geänderte Dateien

- `src/components/WaldtanzMagiekreise.tsx`: neue display-only Zieloberfläche für bereits enumerierte Start-/Anlegeaktionen.
- `src/App.tsx`: bindet die Magiekreise in der `Schlangenlichtung` zwischen Tischkarte und Schlangenbereich ein.
- `src/App.css`: ergänzt Stitch-artige 3px dashed Border, Hard Shadow, Gold-/Lime-Radialflächen, runde Zielkreise und Pulsanimation.
- `src/App.m1ah_waldtanz_magiekreise.test.tsx`: RED/GREEN-Test für Struktur, DOM-Reihenfolge und CSS-Vertrag.
- `src/App.m1ag_waldtanz_tischkarte.test.tsx`: aktualisiert den Lichtungs-Zeilenvertrag auf die zusätzliche Magiekreis-Zeile.
- `docs/PLAYABILITY_GATE.md`: ergänzt M1ah-Evidence.

## Verifikation

- RED: `npm test -- --run src/App.m1ah_waldtanz_magiekreise.test.tsx` schlug initial erwartungsgemäß fehl.
- Targeted: `npm test -- --run src/App.m1ah_waldtanz_magiekreise.test.tsx src/App.m1ag_waldtanz_tischkarte.test.tsx` → 2 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 241 Testdateien / 779 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- `git diff --check` → grün.
- Zeilenbudget: `src/App.tsx` 483, `src/components/WaldtanzMagiekreise.tsx` 70, M1ah-Test 55.

## Review

- Claude Code / `/simplify`: `claude --model opusplan` war durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review: `BLOCKERS: None`. Bestätigt wurden Testintegrität, Typecheck/Lint, App-Zeilenbudget, display-only Engine-Erhalt, benannte Region/Listitems, niedrige Pointer-Risiken und sichtbare Stitch-Ausrichtung.

## Release / Smoke

- Feature-Commit: `ed07a30 — M1ah: Magiekreise in die Waldtanz-Lichtung legen`.
- Production: stabile Alias `https://schlangentanz-v2.vercel.app`.
- Vercel Production Deploy: `READY`.
- Generic Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200.
- M1ah-Browser-Smoke: nach Klick auf eine spielbare Handkarte sind `Magiekreise aktiv`, Zielkarte, Brettwege-Zähler, Startkreis-/Schlangenende-Listitems, DOM-Reihenfolge `Tischkarte < Magiekreise < Schlangenbereich`, computed 3px dashed Border, Dark-Forest-Hard-Shadow, 1:1-Kreis, Radius `999px`, Animation `waldtanz-zielkreis-puls` und keine Console-/Page-Errors bestätigt.

## Nächste mittlere Lücke

Als nächster mittlerer Stitch-Board-Vertical bietet sich an, die Aggregat-Magiekreise aus M1ah enger mit konkreten Schlangenenden/Sonderkarten-Zielen zu verbinden: nicht nur „Brettwege leuchten“, sondern der relevante Kreis soll den konkreten Board-Target-Flow stärker führen, ohne die bestehenden direkten Zielbuttons oder Drag-and-drop zu ersetzen.
