# Release Status — 14.06.2026 M1j Waldtanz-Zugspur

## Milestone / Slice

M1j ist ein mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` zeigt jetzt eine board-nahe `Waldtanz-Zugspur` direkt zwischen `Waldtanz-Ablage` und `Schlangenbereich`. Der letzte Spielzug, der nächste Pflichtschritt und der Ablagestatus stehen damit auf der Waldlichtung statt nur in Debug-/Entwicklungsdaten.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Nach einer echten Board-Aktion sieht der Spieler die Wirkung unmittelbar am Brett.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Aktionsdock bleiben unverändert.
- Google-Stitch-Richtung: chunky/pill Zugplakette mit 3px Dark-Forest-Border, sunny Waldlichtung, hard shadow und board-naher Reihenfolge.

## Änderungen

- `src/components/WaldtanzZugspur.tsx`: neue passive Spielzug-Komponente für `letzteAktion`, nächsten Pflichtschritt und `zustand.ablagestapel`.
- `src/App.tsx`: hängt die Zugspur nach `Waldtanz-Ablage` und vor `Schlangenbereich` ein; `App.tsx` bleibt mit 498 Zeilen unter dem 500-Zeilen-Budget.
- `src/App.css`: ergänzt Stitch-Styles für die Zugspur-Plakette.
- `src/App.m1j_waldtanz_zugspur.test.tsx`: neuer RED/GREEN-Test für initiale Copy, board-nahe DOM-Reihenfolge, echten Board-Startzug und CSS-Vertrag.
- `src/App.test.tsx`: broad R30-Regressionsassertion auf den echten Schlangenbereich-Button gescopt, damit die neue Zugspur-Textkopie keine falschen Positives erzeugt.

## Workflow / Review

- RED: `npm test -- --run src/App.m1j_waldtanz_zugspur.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Zugspur` fehlte.
- Claude Code / `/simplify`: `claude --model opusplan` war wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- Codex Review/Re-Review: initial `BLOCKERS: None`; nach Full-Gate-Fund wurde die stale broad `App.test.tsx`-Assertion im selben Slice behoben. Finales Re-Review: `BLOCKERS: None`; Codex bestätigte die neue App-Test-Scope-Integrität.

## Verifikation

- Targeted: `npm test -- --run src/App.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 5 Testdateien / 34 Tests bestanden.
- Full Gates: `npm test -- --run` → 210 Testdateien / 714 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Geänderte Skriptdateien unter 500 Zeilen: `src/App.tsx` 498, `src/components/WaldtanzZugspur.tsx` 43, `src/App.m1j_waldtanz_zugspur.test.tsx` 54.

## Sichtbarer Spielwert

Nach einer Brettaktion ist das Spiel nicht mehr auf einen Debugsatz angewiesen: Die Waldtanz-Zugspur zeigt im Spieltisch `Letzter Spielzug`, die konkret ausgeführte Aktion, den nächsten Pflichtschritt und den aktuellen Ablagestatus. Dadurch entsteht eine zusammenhängendere Tisch-Erzählung zwischen Ablage, Zielauswahl und Schlangenbereich.

## Commit / Deploy / Smoke

- Feature-Commit/Push: `0392364 — M1j: Waldtanz-Zugspur sichtbar machen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M1j-Browser-Smoke bestätigt `/` und `/game` HTTP 200, initiale Zugspur-Copy, DOM-Reihenfolge `Waldtanz-Ablage < Waldtanz-Zugspur < Schlangenbereich`, echte randomized Startkarte über Handkarte → Startzone, `Letzter Spielzug`, `Neue Schlange starten mit Karte …`, `Nächster Schritt: Ausspielphase beenden.`, 3px Dark-Forest-Border, Hard Shadow und keine Console-/Page-Errors. Feature- und finaler Dokumentations-HEAD wurden erneut auf die stabile Production-Alias bereitgestellt und gesmoked.

## Nächste mittlere Lücke

Als nächstes sollte die Zugspur/Ablage-Erzählung für Sonderkarten vertieft werden: z.B. ein M2/M5-Vertical, der eine Sonderkarte board-nah ausführt und die Ablage-/Zugspur-Änderung sichtbar als echte Brettsequenz beweist, ohne zur dominanten Buttonliste zurückzufallen.
