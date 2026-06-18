# Release-Status 18.06.2026 — M1bc Waldtanz-Handbank

## Status

Feature-Release abgeschlossen auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1bc ist ein mittlerer, sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die aktive Hand bleibt board-nah am unteren Waldstein, aber die bisherige milchige Panel-Fläche verdeckt nicht mehr die Schlangenlichtung. Stattdessen schweben Spielerplakette und Karten auf einer chunky, klicksicheren `Waldtanz-Handbank` mit 3px-Dark-Forest-Border, Pill-Form und Hard Shadow.

Warum kein Mikro-Slice: Der Slice verändert sichtbar das erste `/game`-Spielbild und reduziert das Overlay-/Debugpanel-Gefühl. Warum kein Big-Bang: Engine, Aktionen, Handkarten-Komponente, Startkreis-/Schlangenende-Flows und andere Brettobjekte bleiben unverändert; der Eingriff ist auf route-scoped CSS, einen fokussierten Test und den bestehenden Production-Smoke begrenzt.

## Umsetzung

- `src/App.css` entfernt auf der fokussierten `/game`-Route die opaque Handkarten-Panel-Fläche (`background: transparent`, `border-color: transparent`, `box-shadow: none`, `backdrop-filter: none`).
- Die sichtbare Hand wird als `handkarten-buehne::before` zur Waldtanz-Handbank: Pill, chunky Border, grün-goldener Verlauf, Hard Shadow und `pointer-events: none`, damit das Brett weiterhin erreichbar bleibt.
- Der sichtbare Text „Handkarten als Kartenleiste" wird auf `/game` visuell aus dem Brett genommen, bleibt aber als Label/Region-Name erhalten.
- `scripts/live_smoke.mjs` prüft M1bc im echten Browser: Panel frei, Handbank 72px, darunter der Waldstein per `elementFromPoint`, Handkarten per normalem Playwright-Trial-Click klickbar.
- `src/App.m1bc_waldtanz_handbank.test.tsx` schützt DOM-Reihenfolge, Route-CSS-Vertrag, Handbank-Pseudo-Element, visuell versteckte Überschrift und Smoke-Verankerung.

## Verifikation

- RED: `npm test -- --run src/App.m1bc_waldtanz_handbank.test.tsx` scheiterte initial, weil Route-CSS und Smoke-Vertrag fehlten; nach zusätzlicher Erwartung scheiterte er erneut, weil der sichtbare Handkarten-Titel noch über dem Brett stand.
- Targeted/Adjacent: `npm test -- --run src/App.m1bc_waldtanz_handbank.test.tsx src/App.m1aw_waldtanz_handkante.test.tsx src/App.m1ax_waldtanz_freie_lichtung.test.tsx src/App.m1ay_waldtanz_waldkulisse.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/live_smoke.mjs` → `/` und `/game` HTTP 200; M1as/M1aw/M1ax/M1ay/M1bc/M1ba/M1bb grün; M1bc meldet `Panel frei, Handbank 72px und Karten klickbar`.
- Full Gates: `npm test -- --run` → 266 Testdateien / 831 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün.
- Build-Artefakte: `dist/assets/index-BMBJyaqa.css`, `dist/assets/index-DFwf-IFj.js`.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und durch Codex reviewt.
- Codex Review: Review-only auf uncommitted Worktree inklusive untracked Test; `BLOCKERS: None`. Ein Non-Blocker zu toter Smoke-Variable wurde behoben; der Hinweis zur CSS-Source-Abdeckung ist durch den realen Browser-Smoke für Desktop-`/game` abgedeckt.

## Deploy und Smoke

- Feature-Commit: `62b3c5d — M1bc: Handkante als Waldtanz-Handbank freilegen`.
- Production-Deploy: Vercel Production `READY`, stabiler Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke: `npm run smoke:production` bestätigt `/` und `/game` HTTP 200, Kernregionen sichtbar, M1as/M1aw/M1ax/M1ay/M1bc/M1ba/M1bb-Verträge grün, keine Console-/Page-Errors.

## Nächste mittlere Lücke

Nächster sinnvoller Waldtanz-Vertical: Die zentrale `Schlangenlichtung` selbst breiter/spielerischer machen, damit Startkreis, eigene Schlangen und Waldobjekte weniger wie kleine verschachtelte Panels wirken — z. B. ein `Lichtungsbrett` mit klareren Drop-Zonen und weniger Textdichte, ohne neue Engine-Regeln oder A11y-Mikroslice.
