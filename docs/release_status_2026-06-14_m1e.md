# Release Status — 14.06.2026 M1e Waldtanz-Spielerrahmen

## Milestone / Slice

M1e ist ein mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` erhält einen board-nahen `Waldtanz-Spielerrahmen` mit Gegnerhand-Rückseiten, Punkteplaketten und aktiver Spieleridentität direkt oberhalb der Arena-Führung.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Der Screen liest sich stärker wie ein echtes Kartenspielbrett mit Gegnerhand und Spielerplaketten statt nur Listen/Statusdaten.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Zugpfad/-kompass, Partiefortschritt und Aktionsdock bleiben unverändert.
- Google-Stitch-Richtung: runde Plaketten, 3px Dark-Forest-Borders, hard shadows, verdeckte Kartenrücken, leichte Rotation und handnahe Identität.

## Änderungen

- `src/components/WaldtanzSpielerrahmen.tsx` neu: rendert nächste Gegnerplakette, verdeckte Gegnerhand und aktive Spielerplakette aus bestehendem `Spielzustand`/Engine-Wertung.
- `src/App.tsx`: hängt den Spielerrahmen im `Spieltisch` vor `Zugpfad`, `Zugkompass`, `Partiefortschritt`, `Schlangenbereich` und `Handkarten` ein; bleibt bei 492 Zeilen.
- `src/App.css`: ergänzt Stitch-Spielerrahmen-Styling mit 3px Border, pill Plaketten, harten Schatten, Kartenrücken und Rotationen.
- `src/App.m1e_waldtanz_spielerrahmen.test.tsx` neu: beweist Spielerrahmen, Gegnerhand, Spielerplakette, DOM-Reihenfolge und CSS-Vertrag.

## Workflow / Review

- RED: `npm test -- --run src/App.m1e_waldtanz_spielerrahmen.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Spielerrahmen` fehlte.
- Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- Codex Review: initial `BLOCKERS: None`; Copy-Non-Blocker `Gegner-Spieler 2` wurde zu `Gegner: Spieler 2` korrigiert. Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted: `npm test -- --run src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 204 Testdateien / 706 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Feature-Commit/Push: `274aadf — M1e: Waldtanz-Spielerrahmen anlegen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt.
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M1e-Browser-Smoke: `/` und `/game` HTTP 200; `Waldtanz-Spielerrahmen` sichtbar im `Spieltisch`, `Gegner: Spieler 2`, `5 verdeckte Karten`, `Du — Spieler 1`, `5 Handkarten bereit`, genau 5 Kartenrücken, 3px Plakettenborder, Hard Shadow, rotierte Du-Plakette, DOM-Reihenfolge `Spielerrahmen < Schlangenbereich < Handkarten`, keine Console-/Page-Errors.

## Sichtbarer Spielwert

Der `/game`-Screen bekommt jetzt die in der Google-Stitch-Referenz zentrale Brettspiel-Rahmung: oben eine verdeckte Gegnerhand mit Punkteplakette und unten/board-nah die eigene Spieleridentität. Dadurch wirkt die Partie weniger wie eine Debugliste und mehr wie ein echter Kartentisch, ohne die bestehende Engine-Bedienbarkeit zu gefährden.

## Nächste mittlere Lücke

M1f/M5f sollte den Rahmen stärker mit dem tatsächlichen Mehrspielerfluss verbinden: etwa Gegnerplaketten/verdeckt-Karten visuell an den `Zugpfad` und KI-Vorspulstatus koppeln oder einen bounded Mehrzug-Smoke bauen, der zeigt, wie Spielerrahmen, Zugpfad und Partiefortschritt über Mensch- und KI-Züge zusammen aktualisieren.
