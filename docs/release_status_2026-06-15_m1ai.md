# Release-Status — 15.06.2026 M1ai Magiekreis-Brettwege

## Slice

M1ai ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die `Waldtanz-Magiekreise` sind nicht mehr nur ein Aggregat-Hinweis, sondern führen ausgewählte Handkarten direkt über klickbare Startkreis- und Schlangenende-Brettwege aus.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Ein zentrales Brettobjekt wird vom Anzeigeelement zum spielbaren Ziel; der Spieler kann die Karte im Waldstein direkt in einen Kreis legen.
- Kein Big-Bang: Engine-Regeln, Aktionsenumeration, Drag-and-drop, Schlangenbereich-Direktziele, Sonderkarten-Ziele, Lobby, Regeln und Sieger-Party bleiben unverändert.
- Die Buttons delegieren ausschließlich an bereits enumerierte `NeueSchlangeStarten`-/`KarteAnlegen`-Aktionen und ersetzen keine bestehenden Board-Ziele.

## Geänderte Dateien

- `src/components/WaldtanzMagiekreise.tsx`: rendert je ausgewählter Handkarte direkte Magiekreis-Buttons für Startkreis und Schlangenende.
- `src/App.tsx`: reicht den bestehenden Aktionshandler an die Magiekreise weiter.
- `src/App.css`: ergänzt drückbare, pillige Stitch-Spielobjekt-Buttons mit 3px Border, Hard Shadow, `box-sizing: border-box` und Press-State.
- `src/App.m1ai_magiekreis_brettwege.test.tsx`: RED/GREEN-Test für Startkreis-Ausführung, Schlangenende-Ausführung und CSS-Vertrag.
- `docs/PLAYABILITY_GATE.md`: ergänzt M1ai-Evidence.

## Verifikation

- RED: `npm test -- --run src/App.m1ai_magiekreis_brettwege.test.tsx` schlug initial erwartungsgemäß fehl, weil Magiekreis-Buttons und CSS-Vertrag fehlten.
- Targeted: `npm test -- --run src/App.m1ai_magiekreis_brettwege.test.tsx src/App.m1ah_waldtanz_magiekreise.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 3 Testdateien / 15 Tests bestanden.
- Full Gates: `npm test -- --run` → 242 Testdateien / 782 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- `git diff --check` → grün.
- Zeilenbudget: `src/App.tsx` 484, `src/components/WaldtanzMagiekreise.tsx` 88, M1ai-Test 74.

## Review

- Claude Code / `/simplify`: `claude --model opusplan` und der separate `/simplify`-Lauf waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review/Re-Review: initial `BLOCKERS: None`; der Non-Blocker zum möglichen Button-Overflow wurde mit `box-sizing: border-box` test-abgesichert. Finales Re-Review: `BLOCKERS: None`.

## Release / Smoke

- Feature-Commit: `f4f4585 — M1ai: Magiekreis-Brettwege klickbar machen`.
- Production: stabile Alias `https://schlangentanz-v2.vercel.app`.
- Vercel Production Deploy: `READY`.
- Generic Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200, Kernregionen sichtbar, keine Console-/Page-Errors.
- M1ai-Browser-Smoke: deterministischer `/game`-Erstzug bestätigt `Magiekreise aktiv`, klickbaren Startkreis-Button `Magiekreis: Karte ... als neue Schlange starten`, computed `box-sizing: border-box`, 3px solid Border, Pill-Radius `999px`, Dark-Forest-Hard-Shadow, `cursor: pointer`, sichtbare Copy `In den Kreis legen`, erfolgreiche `Neue Schlange starten`-Aktion und keine Console-/Page-Errors.
- Hinweis zur bounded Production-Verifikation: Der Schlangenende-Magiekreis ist lokal fixtured mit echter Engine-Ausführung getestet; im Production-Erstzug führt die erste Karte erwartungsgemäß zum nächsten Pflichtschritt, sodass Schlangenende nicht zuverlässig in einer kurzen Alias-Smoke-Session erreichbar ist.

## Nächste mittlere Lücke

Als nächster mittlerer Stitch-Board-Vertical bietet sich an, die Magiekreis-Brettwege enger mit bereits vorhandenen Sonderkarten-Zielen zu verbinden oder die nach einem ersten Zug sichtbare Spielerführung stärker auf „Ausspielphase beenden / nächster sinnvoller Schritt“ direkt am Waldstein zu setzen, ohne wieder in reine A11y-/Copy-Mikroslices zu verfallen.
