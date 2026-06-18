# Release-Status 18.06.2026 — M2q Regenbogenschlange-Wildpfad

## Status

Feature-Release abgeschlossen auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M2q ist ein mittlerer sichtbarer Spielwert-Vertical innerhalb des Waldtanz-Boards: `Regenbogenschlange`-Karten in eigenen und gegnerischen Schlangenpfaden erscheinen nicht mehr als generische Sonderkarte mit ✨, sondern als körperliche `Regenbogenschlange-Wildpfad`-Karte mit 🌈-Symbol, Wildfarben-Chip, `Farbgruppen-Joker`-Hinweis und 0-Punkte-Wildkartenwert. Das ist kein A11y-/Copy-Mikroslice, weil es eine bestehende Wertungsregel direkt im Brett lesbar macht; es ist aber kein Big-Bang, weil Engine-Aktionen, Zugfluss, Layout, Lobby, Regeln, Ergebnisansicht und Sonderkarten-Ziele unverändert bleiben.

## Umsetzung

- `src/engine/scoring.ts` exportiert `ermittleRegenbogenWildfarben(...)` als kleine UI-fähige Sicht auf dieselbe positionsbasierte Wildcard-Zuordnung, die auch `berechneFarbgruppenPunkte(...)` nutzt.
- `src/components/Schlangenbereich.tsx` und `src/components/GegnerSchlangenListe.tsx` reichen die Wildfarbe pro Karten-ID an `SchlangenPfadKarte` weiter.
- `src/components/SchlangenPfadKarte.tsx` rendert Regenbogenschlangen mit `schlangekarte__karte--regenbogenpfad`, 🌈-Symbol, `Wildfarbe <Farbe>`, `Farbgruppen-Joker` und `0 Punkte · verbindet <Farbe>`.
- `src/App.css` ergänzt den Google-Stitch-Wildkartenstil mit 3px Dark-Forest-Rand, Conic-Gradient, Hard Shadow und pillförmigem Chip.
- `src/App.m2q_regenbogenschlange_wildpfad.test.tsx` beweist eigene und gegnerische Schlangenpfade sowie den CSS-Vertrag.

## Verifikation

- RED: `npm test -- --run src/App.m2q_regenbogenschlange_wildpfad.test.tsx` schlug initial fehl, weil Regenbogenschlangen noch generische `schlangekarte__karte--sonderkarte`-Karten und kein CSS-Vertrag waren.
- Claude Code / `/simplify`: Beide geforderten Claude-Code-Aufrufe mit `--model opusplan` waren durch `401 Invalid authentication credentials` blockiert. Die Umsetzung erfolgte als enger manueller Fallback; anschließend wurden Diff, Guards, Datei-Budgets und Gates von Hermes/Codex geprüft.
- Codex Review/Re-Review: Initial `BLOCKERS: None`; der Non-Blocker zum robusteren gemeinsamen Guard für Klasse/Chip/Hinweis wurde behoben. Re-Review: `BLOCKERS: None`, Guard-Finding resolved.
- Targeted/Adjacent: `npm test -- --run src/App.m2q_regenbogenschlange_wildpfad.test.tsx src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx src/App.m1az_waldtanz_schlangenwertung.test.tsx src/App.m2n_farbenfusion_rankenring.test.tsx src/App.m2m_schlangenfrass_bissspur.test.tsx src/engine/__tests__/player_scoring.test.ts` → 6 Testdateien / 26 Tests bestanden. Nach Full-Gate-Fund wurde zusätzlich `src/App.m1k_waldtanz_aufgabentafel.test.tsx` gegen verbotene alte CSS-Token grün verifiziert.
- Full Gates: `npm test -- --run` → 268 Testdateien / 837 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Build-Artefakte: `dist/assets/index-e6gkN_p6.css`, `dist/assets/index-0pry7xB2.js`.

## Deploy und Smoke

- Feature-Commit: `7bf7aaa — M2q: Regenbogenschlange als Wildpfad zeigen`.
- Production-Deploy: Vercel Production `READY`, stabiler Alias `https://schlangentanz-v2.vercel.app`.
- Generic Production-Smoke: `npm run smoke:production` bestätigt `/` und `/game` HTTP 200, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1ba/M1bb-Verträge und keine Console-/Page-Errors.
- Slice-Smoke: Der Produktionsbundle-Vertrag auf dem Alias enthält `.schlangekarte__karte--regenbogenpfad`, `conic-gradient`, `regenbogenpfad-chip`, `regenbogenpfad-hinweis`, `Regenbogenschlange`, `Wildfarbe`, `Farbgruppen-Joker`, `0 Punkte · verbindet` und `schlangekarte__karte--regenbogenpfad`. Der exakte Wildpfad-DOM ist lokal fixturiert regressionsgetestet, weil `Regenbogenschlange` in der aktuellen Legal-Action-Enumeration nicht als direkt spielbare Schlangenbaukarte aus dem Produktionsstartdeck erreichbar ist.

## Nächste mittlere Lücke

Der nächste sinnvolle mittlere Schritt Richtung echtes Browser-Spiel ist nicht noch ein Styling-Mikroslice, sondern ein Regel-/Playability-Vertical: entweder klären und sichtbar machen, wie `Regenbogenschlange` tatsächlich in den Schlangenpfad gelangt (wenn die Regelquelle das vorsieht), oder den nächsten Endspurt-/Sieger-Feedback-Vertical liefern, der den aktuellen Brettentscheidungen noch mehr Spielgefühl gibt.
