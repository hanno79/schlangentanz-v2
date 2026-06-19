# Release Status — 19.06.2026 — M1bv Waldtanz-Waldtaschen

## Status

M1bv ist als mittlerer Google-Stitch/Waldtanz-Vertical für `M1 Waldtanz Game Board` nach `origin/main` gebracht und per Vercel Production auf der stabilen Alias <https://schlangentanz-v2.vercel.app> bereitgestellt. Die dauerhafte Release-Dokumentation verwendet bewusst die stabile Alias statt ephemerer Deployment-URLs.

## Slice

Auf `/game` werden die bisherigen `Waldobjekte` rechts neben der Lichtung zu kompakten, körperlichen `Waldtaschen`: ein eigener Taschenkopf rahmt Ziehstapel, Ablage, Zugspur und Quests; die Spalte bekommt mehr spielbrettnahe Breite, 3px-Waldgrün-Ränder, Hard Shadows und hit-testbare Taschen statt hoher Debug-/Materialkarten. Engine-Regeln, Aktionsausführung, Drag-and-drop und Sonderkartenpfade bleiben unverändert.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Die sichtbare rechte Brettspalte wird im 1280×900-Spielbild messbar von langen Materialobjekten zu einer kompakten Spielbrett-Taschenleiste umgebaut.
- Kein Big-Bang: Es werden keine Regeln, Aktionspfade oder Komponentenverantwortlichkeiten ersetzt; die Änderung ist route-sicher auf `/game`-Markup/CSS plus Tests und einen exakten Browser-Smoke begrenzt.
- Der Slice folgt der Google-Stitch-Richtung: weniger Panel-/Listen-Dominanz, mehr chunky Saturday-morning-cartoon-Brettobjekte direkt neben der Waldlichtung.

## Umsetzung

- `src/App.tsx`: `Waldobjekte` behält seine semantische Rolle, erhält auf `/game` aber den `Waldtaschen`-Kopf vor Nachziehstapel, Ablage, Zugspur und Aufgabentafel.
- `src/App.css`: Die Desktop-`/game`-Spielfeldspalte wird auf `2.55fr / 0.65fr` balanciert; `.waldtanz-waldtaschen` erhält 11.5rem Breite, eigene Stapelreihenfolge, z-index-/Hit-Test-Schutz, kompakte Kartenhöhen und route-sichere Ausblendungen langer Hilfstexte.
- `src/App.m1bv_waldtanz_waldtaschen.test.tsx`: Neuer RED/GREEN-Vertrag schützt Markup-Reihenfolge, CSS-Route-Vertrag und den Smoke-Script-Vertrag.
- `src/App.m1ao_waldtanz_fokusbrett.test.tsx`, `src/App.m1as_waldtanz_erstzug_lichtung.test.tsx`, `src/App.m1bf_waldtanz_nachziehstapel.test.tsx`: Stale Nachbarschaftserwartungen wurden test-erhaltend auf die neue Waldtaschen-Geometrie und den neuen Kopf vor dem Nachziehstapel aktualisiert.
- `scripts/m1bv_waldtaschen_smoke.mjs`: Prüft `/game` im echten Browser auf rechte Position neben der Lichtung, Taschenbreite 145–220px, maximale Taschenhöhe 150px, 3px-Ränder, Hard Shadow, `overflow-x: visible` und normalen `elementFromPoint`-Hit-Test.

## Verifikation

- RED: `src/App.m1bv_waldtanz_waldtaschen.test.tsx` schlug initial auf fehlendem Waldtaschen-Kopf, altem Spielfeldverhältnis, fehlenden Kompakt-CSS-Regeln und fehlendem Smoke-Script fehl.
- Claude Code / `/simplify`: `claude --model opusplan` und separate `/simplify`-Vorprüfung sind durch `401 Invalid authentication credentials` blockiert. Der Slice wurde deshalb als enger manueller Fallback mit Diff-/Cascade-/Line-Budget-Prüfung umgesetzt.
- Codex Review: Review-only auf dem uncommitted Worktree inklusive untracked Test-, Smoke- und Release-Doc-Dateien. Initial fand Codex zwei echte Blocker: Die `/game`-Kompakt-CSS versteckte die physische Nachziehstapel-Deckreihe, und die Release-Doku behauptete schon Push/Deploy. Beide wurden test-/doc-gestützt behoben; Codex-Re-Review: `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1bv_waldtanz_waldtaschen.test.tsx src/App.m1as_waldtanz_erstzug_lichtung.test.tsx src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1bf_waldtanz_nachziehstapel.test.tsx src/App.m1bu_waldtanz_steinplakette.test.tsx src/App.m1bt_waldtanz_startlichtung.test.tsx src/App.m1bs_waldtanz_tischkartenaltar.test.tsx src/App.m1br_waldtanz_magiekreise_lichtung.test.tsx src/App.m1bd_waldtanz_lichtungsbrett.test.tsx` → 9 Testdateien / 19 Tests bestanden.
- Full Gates: `npm test -- --run` → 287 Testdateien / 879 Tests bestanden; `npm run check:test-lines`; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check`; `node scripts/live_smoke.mjs --self-test` jeweils grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 node scripts/m1bv_waldtaschen_smoke.mjs` → `M1bv Waldtaschen: 174px rechts neben Lichtung, Kartenhoehen 73/73/73/73px, hit-testbar`.
- Production-Smoke-Blocker: Der erste Alias-Smoke nach `b97081c` deckte auf, dass `scripts/live_smoke.mjs` für M1bf noch die alte Waldobjekte-Kindposition `0,1,2,3` erwartete; seit dem Waldtaschen-Kopf ist `1,2,3,4` korrekt. Fix-Commit `f041df8` akzeptiert beide strukturellen Verträge, ohne den 3px-/Hard-Shadow-/Kartenrücken-Nachweis abzuschwächen.

## Release

Der finale M1bv-Stand ist über Feature-Commit `b97081c — M1bv: Waldobjekte als Waldtaschen verdichten` plus Smoke-Fix `f041df8 — M1bv: Production-Smoke an Waldtaschen anpassen` nach `origin/main` gepusht und per Vercel Production auf die stabile Alias <https://schlangentanz-v2.vercel.app> bereitgestellt. Finaler Alias-Smoke bestätigt `/` und `/game` HTTP 200, `R107 Production-Smoke bestanden`, den M1bf-Nachziehstapel mit Waldtaschen-Kopf und den exakten M1bv-Vertrag: `M1bv Waldtaschen: 174px rechts neben Lichtung, Kartenhoehen 73/73/73/73px, hit-testbar`.

## Nächste mittlere Lücke

Nach den Waldtaschen sollte der nächste autonome Slice weiter sichtbaren Spielwert liefern statt wieder Geometrie-Mikrofixes zu wiederholen: sinnvoll ist entweder ein weiterer board-naher Sonderkarten-Ziel-Vertical in M2 oder eine echte Mehrzug-/Entscheidungsfluss-Verbesserung, die die Waldtaschen als kompakte Nebenobjekte stabil lässt.
