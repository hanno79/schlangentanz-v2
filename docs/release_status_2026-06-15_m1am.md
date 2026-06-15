# Release-Status — 15.06.2026 M1am Waldtanz-Questfährten

## Status

Release abgeschlossen. Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1am ergänzt die `Waldtanz-Aufgabentafel` um sichtbare Quest-Fährten: offene Questkarten zeigen jetzt direkt auf der Karte, wie nah die aktuelle Schlangenlichtung an konkreten Aufgaben ist. Der Slice ist ein mittlerer Google-Stitch-Spielerlebnis-Vertical: Er macht Ziele spielbarer und board-näher, ohne Engine-Regeln, Aktionen, Schlangenbereich, Lobby, Regeln oder Ergebnisansicht umzubauen.

## Umsetzung

- `src/components/WaldtanzAufgabentafel.tsx` rendert pro offener Questkarte eine `waldtanz-questkarte__faehrte`.
- `src/components/questFaehrte.ts` berechnet Präsentations-Fährten für Farbenpracht, Farbharmonie, Farbkombination und Farbwechsler; unbekannte Questtypen bekommen eine generische Schlangenlichtung-Fährte.
- `src/App.css` gestaltet die Fährte als chunky Stitch-Plakette mit gestricheltem Dark-Forest-Rand, Pill-Chips und hellem Waldhintergrund.
- `src/App.m1am_questfaehrten_aufgabentafel.test.tsx` schützt sichtbare Fortschrittskopplung und CSS-Vertrag.

## Verifikation

- RED: `npm test -- --run src/App.m1am_questfaehrten_aufgabentafel.test.tsx` fiel initial wegen fehlender Quest-Fährte und CSS-Regeln fehl.
- Targeted/Adjacent nach GREEN und manueller Simplify-Prüfung: `npm test -- --run src/App.m1am_questfaehrten_aufgabentafel.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx src/App.m1t_questkarte_einsammeln.test.tsx src/App.m1s_questfortschritt.test.tsx src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` → 5 Testdateien / 9 Tests bestanden.
- Full Gates: `npm test -- --run` → 246 Testdateien / 792 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Codex Review: `BLOCKERS: None`; Non-Blocker nur zukünftiges Drift-Risiko für Präsentations-Fortschrittslogik.
- Claude Code / `/simplify`: beide Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und von Codex reviewt.

## Release

- Feature-Commit: `c6b6a03 — M1am: Questfaehrten auf Aufgabentafel zeigen`.
- Push: `origin/main` aktualisiert.
- Vercel Production: Stable Alias `https://schlangentanz-v2.vercel.app` ist READY.
- Production-Smoke: `/` und `/game` HTTP 200, Kernregionen sichtbar, 3 Questkarten mit 3 Quest-Fährten, 2px dashed Border, Hintergrund `rgba(236, 255, 227, 0.72)`, keine Console-/Page-Errors.

## Nächste mittlere Lücke

Die Aufgabentafel zeigt jetzt sichtbare Ziele; als nächster spielwertiger Vertical bietet sich an, mehr Quest-Fährten-Familien aus der Engine-Quelle zu teilen oder die Quest-Fährten als Lichtungs-/Schlangen-Highlights mit konkreten nächsten Kartenentscheidungen zu verbinden, ohne wieder in reine A11y-/Copy-Mikroslices zu fallen.
