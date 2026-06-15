# Release-Status 2026-06-15 — M1al Waldtanz-Farbgruppenband

## Slice

M1al liefert einen mittleren, sichtbaren Google-Stitch/Waldtanz-Vertical im `M1 Waldtanz Game Board`: Farbgruppen und die Nähe zur Quest `Farbkombination` erscheinen direkt in der `Schlangenlichtung` an den eigenen Schlangen, statt nur indirekt in Aufgaben-/Debuglisten sichtbar zu sein.

## Umsetzung

- Neue Komponente `WaldtanzFarbgruppenband` rendert pro eigener Schlange eine chunky Brettplakette mit Farbgruppen-Chips, Leerzustand und Farbkombination-Hinweis.
- Das Band liegt außerhalb der klickbaren Schlangen-`role="button"`-Karten, direkt nach der eigenen Schlangenliste im Bereich `Eigene Schlangen`.
- `ermittleFarbkombinationFortschritt` teilt die Farbkombination-Regellogik zwischen Engine-Regelprüfung und UI-Hinweis, inklusive nicht-zusammenhängender gleichfarbiger Karten.
- CSS ergänzt 3px Dark-Forest-Border, Hard Shadow, pillige Chips und Waldtanz-Farbflächen.

## Verifikation

- RED/GREEN: `npm test -- --run src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` — 1 Testdatei / 3 Tests grün.
- Adjacent: `npm test -- --run src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` — 2 Testdateien / 14 Tests grün.
- Full Gates: `npm test -- --run` — 245 Testdateien / 790 Tests grün; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Zeilenbudget: `src/components/WaldtanzFarbgruppenband.tsx` 50, `src/components/Schlangenbereich.tsx` 489, `src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` 80, `src/engine/aufgabenPruefung.ts` 232.

## Review

- Claude Code Implementierung und `/simplify` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review/Re-Review auf uncommitted Worktree inklusive untracked Test/Komponente: `BLOCKERS: None`. Priorisierte Checks: Engine-Quelle für Farbkombination, reale `aufgabenPool`-Quest plus Split-Farbkarten-Regressionsfall, keine verschachtelte `role="group"` in `role="button"`.

## Release

- Feature-Commit: `b3ed0e3 — M1al: Farbgruppenband in der Schlangenlichtung zeigen`.
- Push: `main -> origin/main` erfolgreich.
- Production Deploy: Vercel Production alias `https://schlangentanz-v2.vercel.app` auf READY.
- Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200 sowie Kernregionen.
- M1al-Browser-Smoke: bounded randomized Smoke erreichte eine offene `Farbkombination`-Quest nach 2 Versuchen, startete eine echte Schlange über den Startkreis und bestätigte sichtbares `Farbgruppenband` mit `Farbkombination: noch 4 Karten`, 3px Border, Hard Shadow, Wald-Gradient, kein verschachteltes `role=button`, keine Console-/Page-Errors.

## Nächste mittlere Lücke

Die Lichtung zeigt nun Gruppenziele und Questnähe direkt am Schlangenpfad. Der nächste sinnvolle mittlere Vertical ist eine sichtbare Entscheidungsführung für das gezielte Weiterbauen dieser Gruppen: z. B. `M1am` mit board-nahen Farbzielen/Anlege-Hinweisen für die aktuell ausgewählte Handkarte, ohne neue Engine-Regeln und ohne reine A11y-Mikroslices.
