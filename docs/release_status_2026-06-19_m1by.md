# Release Status — 19.06.2026 — M1by Waldtanz-Spielbrettweite

## Slice

M1by ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der `/game`-Spieltisch gibt dem zentralen `Waldtanz-Arenastein` wieder die volle Brettbreite, statt ihn durch eine rechte Zugleisten-Spalte zusammenzudrücken. Die Zugleiste bleibt als kompakter Unter-dem-Brett-Rail erhalten; Engine-Regeln, Legal-Actions, Drag-and-drop, Handkarten-Auswahl und Aktionsfallback bleiben unverändert.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verändert die erste sichtbare Brettkomposition im echten Browser — Waldstein, Gartenkopf, Handkarten und Zugleiste wirken weniger wie gequetschte Debug-/Buttonspalten und mehr wie ein breiter Waldtanz-Spieltisch.
- Kein Big-Bang: Es wird keine React-Struktur umgebaut und keine Spielregel geändert; die Änderung bleibt auf route-sichere `/game`-CSS, stale Layout-Verträge und Browser-Smoke-Beweise begrenzt.
- Der Slice folgt der Google-Stitch-Richtung: mehr zentrale Waldlichtung/Spielmatte, kompaktere Hilfsrails, weniger rechte Spalte als optisches Zentrum.

## Umsetzung

- `src/App.css`: Auf `/game` wird `.spielbrett--waldtanz` ein einspaltiges Brett (`minmax(0, 1fr)`); der `Waldtanz-Arenastein` erhält volle Breite, der obere Spielerrahmen wird transparenter/kompakter, und `.waldtanz-zugseitenleiste` wandert als vierteiliger kompakter Rail unter den Waldstein.
- `src/App.m1by_waldtanz_spielbrettweite.test.tsx`: Neuer focused Test schützt Struktur, route-sichere CSS-Verträge und Smoke-Wiring.
- `scripts/m1by_spielbrettweite_smoke.mjs`: Neuer Playwright-Smoke prüft `/` und `/game` HTTP 200, 1280×900-Geometrie, Waldstein ≥820px, Zugleiste darunter, kompakter Gartenkopf, klickbare Handkarte, keine Console-/Page-Errors.
- `package.json`: `npm run smoke:production` führt jetzt zusätzlich den exakten M1by-Smoke aus.
- Stale Nachbarschaftsverträge `M1ae`, `M1ao`, `M1bq`, `M1bn/R107` und der ältere M1bq-Smoke wurden auf die neue Unter-dem-Brett-Zugleiste aktualisiert, ohne ihre alten Schutzpunkte zu entfernen.

## Verifikation

- RED/GREEN: Neuer Test `src/App.m1by_waldtanz_spielbrettweite.test.tsx` fiel initial erwartungsgemäß auf altem zweispaltigem Brett-/Zugleisten-Vertrag und fehlender Smoke-Wiring-Erwartung; danach wurden CSS, Tests und Smoke minimal grün gemacht.
- Claude Code / `/simplify`: `claude --model opusplan` und separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert. Der Slice wurde deshalb als enger manueller Fallback mit expliziter Diff-/Cascade-/Line-Budget-Prüfung umgesetzt.
- Codex Review/Re-Review: Review-only auf dem uncommitted Worktree inklusive untracked Test-/Smoke-Dateien. Codex fand stale M1ao/M1bq-Verträge; diese wurden test-erhaltend behoben. Finales Review nach Smoke-Blocker-Fix: `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1by_waldtanz_spielbrettweite.test.tsx src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1bq_waldtanz_spielkamera.test.tsx` → 4 Testdateien / 6 Tests bestanden. Nach Smoke-Fix zusätzlich `npm test -- --run src/App.m1by_waldtanz_spielbrettweite.test.tsx tests/r107_live_smoke_script.test.ts` → 2 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 289 Testdateien / 883 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` bestätigt `/` und `/game` HTTP 200, alle bestehenden Waldtanz-Live-Verträge, `M1bx Spielkartenfächer` und neu `M1by Spielbrettweite: Waldstein 976px breit, Zugleiste darunter 976x162px, Handkarte klickbar.`

## Release

Der finale M1by-Stand ist nach `origin/main` gebracht und per Vercel Production auf die stabile Alias <https://schlangentanz-v2.vercel.app> bereitgestellt. Der finale Alias-Smoke prüft `/`, `/game`, die generischen Waldtanz-Verträge, den M1bx-Spielkartenfächer und den exakten M1by-Spielbrettweiten-Vertrag ohne Console-/Page-Errors. Dauerhafte Doku verweist bewusst auf die stabile Alias statt auf ephemere Deployment-URLs.

## Nächste mittlere Lücke

Nach der breiteren Spielmatte sollte der nächste autonome Slice wieder echten Spielwert liefern: entweder die board-nahe Zugleiste visuell als lesbare Spielhilfe unterhalb des Bretts nachschärfen, ohne die Waldsteinbreite zu verlieren, oder in M2 ein weiteres Sonderkarten-Zielobjekt aus der Fallbackliste auf den Spieltisch holen.
