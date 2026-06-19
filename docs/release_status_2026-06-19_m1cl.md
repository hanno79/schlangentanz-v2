# Release-Status — 19.06.2026 — M1cl Waldtanz-Erstbild-Zugknopf

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cl ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Nach einem ersten Brettzug bleibt die board-nahe `Waldtanz-Zugaktion` als großer `End Turn`-Zugknopf im ersten 900px-Spielbild sichtbar und hit-testbar, statt unter Handbank/Unterholzleiste oder unter die Falz zu rutschen.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verbessert die reale Spielkamera und den nächsten Zugschritt im Browser. Spieler sehen nach der ersten Brettaktion sofort den nächsten Phasenknopf am Spielbrett statt wieder in die Button-/Debugfläche zu fallen.
- Kein Big-Bang: Engine-Regeln, Aktionspfade, Kartenlogik, Drag-and-drop, Lobby, Regeln und Ergebnisansicht bleiben unverändert. Die Korrektur beschränkt sich auf die `/game`-Layout-/Hit-Test-Verträge und angrenzende Browser-Smokes.

## Umsetzung

- `scripts/m1cl_erstbild_zugknopf_smoke.mjs`: neuer Browser-Smoke für 1280×900, der eine Startfährte spielt, `Weiter zur Aufgabenprüfung` abwartet und Waldsteinhöhe, Hand/Unterholzleiste im Erstbild, Zugknopf-Hit-Testbarkeit und Spielbrettkamera prüft.
- `src/App.css`: hält die Waldtanz-Arena groß, hebt die Handbank leicht aus der Unterholzleiste, lässt die wartende Arenazug-Fläche Klicks auf darunterliegende Brettobjekte durch und vergrößert den Zielranken-Abstand gegen Handbank-Überlappung.
- `src/App.m1cl_waldtanz_erstbild_zugknopf.test.tsx`: schützt DOM-Reihenfolge, route-sichere Layoutwerte und Smoke-Wiring.
- Angrenzende stale Tests wurden mit dem echten Browservertrag synchronisiert: `M1bp`, `M1bx`, `M1cb`, `M1cf`.

## Workflow

- RED/GREEN: Der M1cl-Smoke deckte die neue sichtbare Zugknopf-Anforderung ab; die kanonische Smoke-Kette fand danach echte Nachbarschaftsblocker (`M1cb` Zielranken/Handbank und `M1cf` Unterholzleiste/Bonuszauber gegen wartende Arenazug-Fläche), die im selben Release-Stand behoben wurden.
- Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; der Slice und der Smoke-Blocker-Fix wurden deshalb als enger manueller Fallback umgesetzt und offen dokumentiert.
- Codex Review/Re-Review: Review-only auf dem uncommitted Worktree inklusive angrenzender stale Tests. Final: `BLOCKERS: None`; Codex bestätigte die enge `waldtanz-arenazug--wartet`-Pointer-Regel, unveränderte bereite Zugknopf-Klickbarkeit und ausreichende adjacent Test-Synchronisierung.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1bp_waldtanz_handflaeche.test.tsx src/App.m1bx_waldtanz_spielkartenfaecher.test.tsx src/App.m1cf_waldtanz_unterholzleiste.test.tsx src/App.m1cb_waldtanz_zielranken.test.tsx src/App.m1cl_waldtanz_erstbild_zugknopf.test.tsx` → 5 Testdateien / 11 Tests bestanden.
- Full Gates: `npm test -- --run` → 302 Testdateien / 912 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke gegen Vite Preview: `SMOKE_BASE_URL=http://127.0.0.1:4181 npm run smoke:production` grün; bestätigt `/` und `/game` HTTP 200, bestehende Waldtanz-Verträge M1bw–M1ck sowie neu `M1cl Erstbild-Zugknopf: Waldstein 585px, Zugknopf endet bei 893px und ist hit-testbar.`
- Production Deploy/Smoke: finaler `origin/main`-HEAD wurde per Vercel Production auf die stabile Alias bereitgestellt; Smoke bestätigt `/` und `/game` HTTP 200, keine Console-/Page-Errors und die M1cl-Erstbild-Zugknopf-Geometrie.

## Sichtbar spielbarer

Nach einer direkten Brettaktion führt der sichtbare Spielfluss jetzt weiter über den großen board-nahen `End Turn`-Knopf. Die Handbank bleibt klickbar, die Unterholzleiste bleibt als kompakter Support-Rail bedienbar, und die Zielranken kollidieren nicht mehr mit der Handkante.

## Nächste mittlere Lücke

Als nächster M1-Vertical bietet sich ein weiterer Spielkamera-/Entscheidungsfluss-Slice an: Nach Start- und Wachstumsfährten sollte die sichtbare Auswahl zwischen mehreren echten Brettzielen noch klarer als zusammenhängender Zugpfad wirken, ohne in weitere reine A11y-/Mikroattribute abzurutschen.
