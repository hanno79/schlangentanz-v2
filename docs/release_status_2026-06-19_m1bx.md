# Release Status — 19.06.2026 — M1bx Waldtanz-Spielkartenfächer

## Slice

M1bx ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die untere aktive Hand wird auf `/game` vom flachen Karten-/Panelrand zu einem benannten, körperlichen `Waldtanz-Spielkartenfächer` mit größeren, chunky Kartenflächen, sichtbarem Spielbar-Chip und stabilen Mittelpunkt-Hit-Tests. Engine-Regeln, legal actions, Drag-and-drop, Auswahl-Logik, Board-Ziele und Aktionsfallback bleiben unverändert.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verändert die wichtigste Spieleroberfläche im ersten Spielbild — die Handkarten — sichtbar und browser-geometrisch: fünf große Karten bleiben vollständig im 900px-Erstviewport, alle Mittelpunkte sind hit-testbar, und ein realer Klick hebt eine Karte aus dem Fächer.
- Kein Big-Bang: Es wird kein neues Interaktionsmodell eingeführt und keine Engine-Regel verändert; die Änderung bleibt auf `HandkartenPanel`, route-sichere `/game`-CSS, bestehende Nachbarschaftsverträge und einen dedizierten Browser-Smoke begrenzt.
- Der Slice folgt der Google-Stitch-Richtung: weniger transparente Panelkante/Debuglisten-Gefühl, mehr greifbare Saturday-morning-cartoon-Spielkarten mit 3px-Waldgrün-Rand und Hard Shadow direkt am Brett.

## Umsetzung

- `src/components/HandkartenPanel.tsx`: Die Handkartenliste erhält zusätzlich die Klasse `handkartenleiste--spielkartenfaecher` und das Listenlabel `Waldtanz-Spielkartenfächer`; Kartenbuttons, Drag-Handler, Auswahl-Handler und bestehende zugängliche Kartennamen bleiben erhalten.
- `src/App.css`: Auf `/game` wird die Handbank höher, aber weiter board-nah gehalten (`max-height: clamp(10.25rem, 23vh, 12.1rem)`, `translateY(2rem)`). Die Handbühne wird zur kompakten physischen Fächer-Basis, der Spielbar-Chip bleibt sichtbar, und die Fächerkarten werden breiter/höher (`6.5rem` Mindesthöhe), runder und mit 3px-Rand/Hard Shadow gezeichnet.
- `scripts/m1bx_spielkartenfaecher_smoke.mjs`: Neuer Browser-Smoke prüft `/game` im 1280×900-Viewport auf genau 5 Fächerkarten, Label, alle Karten-Mittelpunkte per `elementFromPoint`, 3px-Rand, Hard Shadow, Erstviewport-Grenze, Abstand zur Startlichtung und realen Klick auf die dritte Karte.
- `package.json`: `npm run smoke:production` führt jetzt den generischen `scripts/live_smoke.mjs` plus den exakten M1bx-Fächer-Smoke aus.
- Stale Nachbarschaftstests `M1aw`, `M1ax`, `M1bp` und `R107` wurden auf den neuen, bewusst größeren Handkarten-/Smoke-Vertrag aktualisiert, ohne ihre alten Schutzpunkte zu entfernen.

## Verifikation

- RED/GREEN: Neuer Test `src/App.m1bx_waldtanz_spielkartenfaecher.test.tsx` fiel initial erwartungsgemäß auf fehlender Fächerklasse, fehlendem Listenlabel, alten CSS-Werten und fehlender Smoke-Wiring-Erwartung. Ein zusätzlicher RED-Schritt bewies den Codex-Blocker, dass `npm run smoke:production` den neuen Browser-Smoke nicht ausführte.
- Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert. Der Slice wurde deshalb als enger manueller Fallback mit expliziter Diff-/Cascade-/Line-Budget-Prüfung umgesetzt und mehrfach durch Codex reviewt.
- Codex Review/Re-Review: Review-only auf dem uncommitted Worktree inklusive untracked Test- und Smoke-Dateien. Gefundene Blocker wurden behoben: fehlende Smoke-Wiring und anschließend zu strenger/inkonsistenter Höhenvertrag. Full-Suite-Stale-Tests (`R107`, `M1aw`, `M1ax`) wurden test-erhaltend angepasst. Finaler Codex-Re-Review: `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run tests/r107_live_smoke_script.test.ts src/App.m1aw_waldtanz_handkante.test.tsx src/App.m1ax_waldtanz_freie_lichtung.test.tsx src/App.m1bp_waldtanz_handflaeche.test.tsx src/App.m1bx_waldtanz_spielkartenfaecher.test.tsx` → 5 Testdateien / 9 Tests bestanden.
- Full Gates: `npm test -- --run` → 288 Testdateien / 881 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` bestätigt `/` und `/game` HTTP 200, alle bestehenden Waldtanz-Live-Verträge und neu `M1bx Spielkartenfächer: 5 große Karten (112x124px), alle hit-testbar, Klick hebt Karte aus dem Fächer.`

## Release

Der finale M1bx-Stand ist nach `origin/main` gebracht und per Vercel Production auf die stabile Alias <https://schlangentanz-v2.vercel.app> bereitgestellt. Der finale Alias-Smoke prüft `/`, `/game`, die generischen Waldtanz-Verträge und den exakten M1bx-Spielkartenfächer-Vertrag ohne Console-/Page-Errors. Dauerhafte Doku verweist bewusst auf die stabile Alias statt auf ephemere Deployment-URLs.

## Nächste mittlere Lücke

Nach dem körperlicheren Handfächer sollte der nächste autonome Slice weiter spielwertig bleiben: entweder die ausgewählte Karte noch stärker als Brett-zu-Ziel-Flow mit sichtbarem Snap-/Drop-Feedback führen, oder ein M2-Sonderkarten-Zielobjekt ausbauen, damit der Spieler weniger in fallbackartigen Aktionslisten suchen muss.
