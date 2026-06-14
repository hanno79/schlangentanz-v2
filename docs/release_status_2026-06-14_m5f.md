# Release Status — 14.06.2026 M5f Waldtanz-Tischrunde

## Milestone / Slice

M5f ist ein mittlerer sichtbarer Playability-Vertical nach M1e/M5e: Der `Waldtanz-Spielerrahmen` zeigt nicht mehr nur eine einzelne Gegnerhand, sondern die komplette Tischrunde mit allen Gegnerplaketten, verdeckten Händen, nächstem Zug und KI-Rückkehrstatus direkt oberhalb von Zugpfad/Kompass/Fortschritt.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Der Mehrspielerfluss wird am Brett selbst sichtbar, inklusive 3-KI-Tischrunde und Rückkehr nach vorgespulten Gegnerzügen.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Zugpfad, Zugkompass, Partiefortschritt und Aktionsdock bleiben erhalten.
- Google-Stitch-Richtung: Gegnerplätze, Kartenrücken, Statusband, nächster-Zug-Plakette und aktive Spielerplakette bleiben chunky mit 3px Dark-Forest-Borders und hard-shadow/pill-Optik.

## Änderungen

- `src/components/WaldtanzSpielerrahmen.tsx`: leitet aktive/nächste Spieler aus `Spielzustand` ab, rendert eine semantische Gegnerliste für alle nicht aktiven Spieler und zeigt `Gegnerzug zurück bei dir` nach KI-Vorspulen.
- `src/App.tsx`: reicht `zustand`, `spielerwertungen` und `kiZugProtokoll` an den Spielerrahmen; bleibt bei 494 Zeilen.
- `src/App.css`: ergänzt Statusband, responsive Gegnerliste, nächster-Zug-Plakette und aktive Plakettenmarkierung; CSS-Fallback für `--st-color-tertiary-container` ist regressionsgesichert.
- `src/App.m5f_waldtanz_tischrunde.test.tsx`: neuer sichtbarer Flow-Test über Startzustand → erster Menschenzug → KI-Vorspulen zurück zum Menschen.
- `src/App.m1e_waldtanz_spielerrahmen.test.tsx`: vorhandener Spielerrahmen-Vertrag wurde auf drei Gegnerhände/15 Kartenrücken erweitert statt abgeschwächt.

## Workflow / Review

- RED: `npm test -- --run src/App.m5f_waldtanz_tischrunde.test.tsx` fiel initial erwartungsgemäß fehl, weil Gegnerliste, Tischrundenstatus und KI-Rückkehrstatus im Spielerrahmen fehlten.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- Codex Review/Re-Review: Initial `BLOCKERS: None` plus CSS-Non-Blocker; nach Fix fand Codex einen Blocker zu undefiniertem `--st-color-tertiary-container`, der mit Fallback und Testassertion behoben wurde. Finales Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: No new issues`.

## Verifikation

- Targeted: `npm test -- --run src/App.m5f_waldtanz_tischrunde.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m5e_partiefortschritt.test.tsx` → 5 Testdateien / 6 Tests bestanden.
- Full Gates: `npm test -- --run` → 206 Testdateien / 708 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Geänderte Skriptdateien unter 500 Zeilen: `src/App.tsx` 494, `src/components/WaldtanzSpielerrahmen.tsx` 83, `src/App.m1e_waldtanz_spielerrahmen.test.tsx` 50, `src/App.m5f_waldtanz_tischrunde.test.tsx` 75.

## Sichtbarer Spielwert

Der Waldtanz-Tisch liest sich jetzt stärker wie ein Mehrspieler-Brettspiel: Bei 3 KI-Gegnern liegen alle verdeckten Gegnerhände als eigene Tischplätze aus, der nächste Halt ist direkt im Spielerrahmen sichtbar, und nach dem KI-Vorspulen meldet der Rahmen die Rückkehr zum Menschen. Spieler müssen dafür nicht mehr in Spielerübersicht oder Debugstatus schauen.

## Nächste mittlere Lücke

M5g sollte den bounded Mehrzug-/Endspurt-Pfad weiter anheben: entweder ein Browser-Flow, der Partiefortschritt/Tischrunde über mehrere komplette Runden bis kurz vor Endspurt beweist, oder ein kleiner Engine-/Fixture-Hebel für zuverlässige Endspurt-Smokes, ohne neue dominante Buttonlisten einzubauen.
