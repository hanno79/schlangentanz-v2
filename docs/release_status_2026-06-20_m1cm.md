# Release-Status — 20.06.2026 — M1cm Waldtanz-Zielwahl-Fährten

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cm ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Nach einer Handkartenwahl zeigt die board-nahe `Waldtanz-Zielspur` nicht mehr nur eine abstrakte Zielanzahl, sondern konkrete `Spielbare Brettwege` als körperliche Fährten-Chips für Startkreis, Wachstumsenden und Sonderkarten-/Gegnerziele.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verbessert eine echte Entscheidungssituation im Spiel — die Spielerin sieht, welche Brettobjekt-Familien auf die ausgewählte Karte reagieren, statt in der Buttonliste nach Zielen zu suchen.
- Kein Big-Bang: Engine-Regeln, Legal-Actions, Drag-and-drop, Handkarten, Schlangenobjekte, Lobby, Regeln und Ergebnisansicht bleiben unverändert. Die Änderung aggregiert bereits enumerierte Aktionen nur für die sichtbare Zielwahl.

## Umsetzung

- `src/components/waldtanzZielspurLogik.ts`: bündelt bereits vorhandene legale Aktionen in sichtbare Ziel-Familien (`Startkreis`, `Wachstumsenden`, `Eigene Zauberziele`, `Gegnerziele`) und zählt `Farbendieb` pro sichtbarer Beutekarte statt pro Einfügeplatz.
- `src/components/WaldtanzZielspur.tsx`: rendert unter dem bestehenden Rankenpfad eine beschriftete Liste `Spielbare Brettwege` mit Stitch-artigen Fährten-Chips.
- `src/components/Schlangenbereich.tsx`: übergibt die neuen Familien an die vorhandene Zielspur; Aktionsausführung bleibt bei den bestehenden Brettobjekten.
- `src/App.css`: route-scoped Google-Stitch-Stil für die Zielwahl-Fährten: 3px Waldgrün-Rand, Hard Shadow, pillförmige Chips, sonniger Verlauf.
- `src/App.m1cm_waldtanz_zielwahl_faehrten.test.tsx`: schützt Startkreis+Wachstumsenden nach Handkartenwahl sowie den review-gefundenen `Farbendieb`-Dedup-Fall.
- `scripts/m1cm_zielwahl_faehrten_smoke.mjs` + `package.json`: neuer dauerhaft verdrahteter Browser-Smoke in `npm run smoke:production`.

## Workflow

- RED/GREEN: Der neue M1cm-Test fiel initial wegen fehlendem Smoke/fehlender Zielwahl-Fährten fehl. Nach Codex-Review wurde der `Farbendieb`-Overcount test-first reproduziert (`2` Einfügeplätze für eine Beutekarte) und auf `1` sichtbares Gegnerziel korrigiert.
- Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert; der Slice wurde deshalb als enger manueller Fallback mit objektivem RED-Test, manueller Simplify-/Diff-Prüfung, Browser-Smoke und Codex-Review umgesetzt.
- Codex Review/Re-Review: Initiale Blocker zu `Farbendieb`-Aggregation und fehlender Special-Action-Regression wurden behoben. Finales Re-Review: `BLOCKERS: None`.

## Verifikation

- RED-Proof: `npm test -- --run src/App.m1cm_waldtanz_zielwahl_faehrten.test.tsx` schlug initial wegen fehlendem `scripts/m1cm_zielwahl_faehrten_smoke.mjs` fehl; der review-getriebene `Farbendieb`-Regressionstest schlug vor dem Fix mit `2 Brettziele leuchten` fehl.
- Targeted/Adjacent: `npm test -- --run src/App.m1cm_waldtanz_zielwahl_faehrten.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.m2k_farbendieb_beutekorb.test.tsx src/App.m1cb_waldtanz_zielranken.test.tsx src/App.m1ck_waldtanz_wachstumsfaehrten.test.tsx` → 5 Testdateien / 12 Tests bestanden.
- Full Gates: `npm test -- --run` → 303 Testdateien / 915 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4182 npm run smoke:production` grün; bestätigt `/` und `/game` HTTP 200, bestehende Waldtanz-Verträge M1bw–M1cl und neu `M1cm Zielwahl-Fährten: Startkreis1neue Schlange | Wachstumsenden2Schlangenpfad; Zielspur 584-900px.`
- Production Deploy/Smoke: finaler `origin/main`-HEAD wurde per Vercel Production auf die stabile Alias bereitgestellt; Smoke bestätigt `/` und `/game` HTTP 200, keine Console-/Page-Errors und die M1cm-Zielwahl-Fährten.

## Sichtbar spielbarer

Nach der Kartenwahl führt die Zielspur jetzt von der Handkarte zu konkreten Brettweg-Familien: Startkreis für neue Schlangen, Wachstumsenden für bestehende Schlangenpfade und Gegner-/Zauberziele für Sonderkarten. Die Buttonliste bleibt Fallback, aber die Entscheidung liest sich als Brettaktion.

## Nächste mittlere Lücke

Als nächster sichtbarer Vertical bietet sich an, Sonderkarten-Zielauswahl und Zielwahl-Fährten stärker zusammenzuführen: Wenn eine Sonderkarte ausgewählt ist, sollten Beutekorb/Bissspur/Fusionspaar und Zielspur als ein zusammenhängender Zugpfad wirken, ohne neue Engine-Regeln oder ein Drag-and-drop-Big-Bang einzuführen.
