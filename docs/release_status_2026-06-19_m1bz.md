# Release Status — M1bz Waldtanz-Gegner-HUD

Datum: 19.06.2026
Status: Release complete, Production-Alias verifiziert (`https://schlangentanz-v2.vercel.app`)

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der obere `Waldtanz-Spielerrahmen` auf `/game` wird vom scrollenden Spieler-/Statuslistenpanel zu einem kompakten Gegner-HUD über dem Waldstein. Sichtbar bleiben Gegnerfokus, Top-Laubkarten und Zugtempo; Statusband, eigene Reihe und die volle Gegnerliste dominieren das Brett nicht mehr. Wenn eine ausgewählte Schlangengrube ein Spielerziel braucht, öffnet der Rahmen wieder genug Raum für die physischen Grubenfallen-Ziele.

Nicht geändert: Engine-Regeln, Aktionsenumeration, Drag-and-drop, Handkarten-Auswahl, Schlangengrube-Ausführung und bestehende Board-Zielpfade.

## Umsetzung

- `src/App.css`: `/game`-Route verdichtet `waldtanz-spielerrahmen`/`gartenkopf`, blendet schwere Listenreste aus und ergänzt eine `:has(.waldtanz-spielerrahmen__gegnerplatz--grubenziel)`-Ausnahme mit `max-height`, `overflow:auto`, Padding und `scrollbar-gutter` für Schlangengrube-Zielzustände.
- `src/App.m1bz_waldtanz_gegner_hud.test.tsx`: Neuer RED/GREEN-Vertrag für kompaktes Gegner-HUD, CSS-/Smoke-Wiring und Schlangengrube-Ausnahme.
- `scripts/m1bz_gegner_hud_smoke.mjs`: Neuer Playwright-Smoke für normales kompaktes HUD plus deterministische Schlangengrube-Ausnahme (`Math.random = 0.01`) mit computed Overflow/Max-Height, Waldstein-No-Overlap und Hit-Test für den Grubenknopf.
- `package.json`: `npm run smoke:production` führt den M1bz-Smoke dauerhaft nach M1by aus.
- `src/App.m1by_waldtanz_spielbrettweite.test.tsx` und `src/App.m1ao_waldtanz_fokusbrett.test.tsx`: Stale Nachbarschaftsverträge auf den neuen bewusst nicht-scrollenden oberen Gegner-HUD-Vertrag aktualisiert.

## Workflow / Review

- Claude Code / `/simplify`: Weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback mit expliziter Diff-/Cascade-/Line-Budget-Prüfung wurde genutzt.
- Codex Review: Initialer Blocker zur fehlenden browser-computed Schlangengrube-Ausnahme wurde test-/smoke-first behoben. Finales Re-Review nach M1ao-Stale-Sweep: `BLOCKERS: None`.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1bz_waldtanz_gegner_hud.test.tsx src/App.m1by_waldtanz_spielbrettweite.test.tsx` → 3 Testdateien / 6 Tests bestanden.
- Full Gates: `npm test -- --run` → 290 Testdateien / 886 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Lokaler Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` → `/` und `/game` HTTP 200, bestehende Waldtanz-Smokes plus `M1bz Gruben-Ausnahme: Gegnerliste sichtbar, Rahmen 310px/288px, Grubenknopf hit-testbar` und `M1bz Gegner-HUD: Rahmen 107px, Gartenkopf 162px, 3 Top-Laubkarten, Waldstein ab 192px`.
- Production Deploy/Smoke: Feature-Commit `0928199 — M1bz: Gegner-HUD kompakt verdichten` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias bereitgestellt (`READY`, 18s). Production-Smoke gegen `https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200, bestehende Waldtanz-Verträge, M1bx/M1by sowie die M1bz-Gegner-HUD- und Schlangengrube-Ausnahme-Verträge ohne Console-/Page-Errors.

## Nächste mittlere Lücke

Der Spieltisch ist jetzt breiter und der obere Gegnerbereich kompakt. Als nächster mittlerer Vertical bietet sich ein sichtbarer Board-Interaktions-Slice an: die nächsten Sonderkarten-/Zielzustände weiter aus der Fallback-Liste auf physische Brettobjekte ziehen, ohne ein neues Interaktionsmodell oder Drag-and-drop-Big-Bang zu starten.
