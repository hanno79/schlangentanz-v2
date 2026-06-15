# Release-Status — 15.06.2026 M1ad Waldtanz-Spielbahnen

## Status

Release complete auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1ad ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Waldtanz-Arenastein` wird vom Sammelpanel zur zweispaltigen Spielfläche. `Schlangenbereich` liegt jetzt als primäre `Schlangenlichtung` links im Arenastein; `Waldtanz-Ablage`, `Waldtanz-Zugspur`, `Waldtanz-Kartenpop` und `Waldtanz-Aufgabentafel` sind rechts als kompakte `Waldobjekte` gebündelt. Die Handkarten bleiben danach board-nah; `Aktionen` bleibt direkt nach dem `Spieltisch` als Fallback.

Nicht geändert: Engine-Regeln, Aktionsausführung, Drag-and-drop-Handler, Handkartenfächer, Fallback-Aktionsdock, Lobby, Schlangenbuch und Sieger-Party.

## Verifikation

- RED: `npm test -- --run src/App.m1ad_waldtanz_spielbahnen.test.tsx` fiel initial erwartungsgemäß fehl, weil `Schlangenlichtung`, `Waldobjekte` und der zweispaltige CSS-Vertrag fehlten.
- GREEN: `src/App.tsx` gruppiert die vorhandenen Brettobjekte in `Schlangenlichtung` und `Waldobjekte`; `src/App.css` ergänzt zweispaltiges Spielfeld, breitere Schlangenlichtung, radialen Waldlichtungs-Hintergrund, kompakte scrollbare Nebenobjekte und mobilen Einspalten-Fallback.
- Review-Fix: Codex fand stale M1i/M1j/M1k DOM-Order-Erwartungen; diese wurden test-first auf das neue `Schlangenlichtung`/`Waldobjekte`-Containment umgestellt. Der erste Production-Smoke zeigte, dass 16rem Nebenobjekte die Lichtung live zu schmal machten; Fix-Commit verbreitert die Lichtung auf `minmax(0, 1.7fr) minmax(12rem, 0.6fr)`.
- Claude Code / `/simplify`: Durch `401 Invalid authentication credentials` blockiert (`expires_at=2026-06-08`); enger manueller Fallback wurde genutzt und durch Codex geprüft.
- Codex Review/Re-Review: initialer Blocker zu M1i/M1j/M1k stale Tests behoben; finales Re-Review `BLOCKERS: None`, inklusive untracked M1ad-Test.
- Targeted: `npm test -- --run src/App.m1ad_waldtanz_spielbahnen.test.tsx src/App.m1ac_waldtanz_arenastein.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- Full Gates: `npm test -- --run` → 237 Testdateien / 770 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Production Deploy: Vercel Production `READY`, stable alias https://schlangentanz-v2.vercel.app.
- Generic Production-Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200, Kernregionen sichtbar.
- M1ad Browser-Smoke: `/` und `/game` HTTP 200; keine Console-/Page-Errors; `Waldtanz-Arenastein` enthält `Schlangenlichtung` und `Waldobjekte`; `Schlangenlichtung` enthält `Schlangenbereich`; `Waldobjekte` enthält `Waldtanz-Ablage`, `Waldtanz-Zugspur` und `Waldtanz-Aufgabentafel`; `Schlangenlichtung` steht vor `Waldobjekte`; Handkarten bleiben nach dem Arenastein; `Aktionen` bleibt direkt nach `Spieltisch`; computed `gridTemplateColumns: 323.656px 216px`, Lichtung breiter als Nebenobjekte, `minHeight: 468px`, radial-gradient-Hintergrund und `overflowY: auto` für Waldobjekte.

## Commits

- `e3cc333 — M1ad: Waldtanz-Spielbahnen formen`
- `9cdd747 — M1ad: Schlangenlichtung im Live-Layout verbreitern`

## Nächste mittlere Lücke

Weiter Stitch-Spielwert statt Mikro-A11y: Nach dem zweispaltigen Arenastein sollte der nächste Slice entweder die zentralen Schlangenobjekte selbst weiter verdichten/beleben (mehr „echte Schlangenpfade“ im neuen Lichtungsraum) oder eine board-nahe Sonderkarten-Zielentscheidung sichtbar aus der Fallback-Liste in den Arenastein ziehen.
