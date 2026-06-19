# Release-Status — 19.06.2026 M1bl Waldtanz-Bühnenrahmen

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf `/game` wird der äußere `Aktiver Spieler`-Panel-Chrome visuell transparent, während der `Spieltisch` als primäre chunky Waldtanz-Bühne mit 4px-Dark-Forest-Rand und Hard Shadow hervortritt. Die semantischen Regionen `Aktiver Spieler` und `Spieltisch` bleiben über ihre vorhandenen Überschriften benannt; nur die Wrapper-Überschriften werden visuell versteckt. Engine-Regeln, Aktionsenumeration, Board-Interaktionen, Debug-/Entwicklungsdaten, Lobby, Regeln und Ergebnisansicht bleiben unverändert.

Warum kein Mikro-Slice: Die Änderung entfernt einen dominanten gelben Wrapper und verschiebt die sichtbare Wahrnehmung des `/game`-Screens klar vom Formular-/Panelgefühl zum eigentlichen Spielbrett. Warum kein Big-Bang: Es ist eine route-gescopedte Bühnenrahmen-Änderung mit unverändertem DOM-Vertrag und unveränderten Engine-/Interaktionspfaden.

## TDD / Umsetzung

- RED: `src/App.m1bl_waldtanz_buehnenrahmen.test.tsx` fiel initial erwartungsgemäß, weil der `/game`-Chrome von `info-panel--waldtanz-arena` noch gelb/gerahmt war und die Wrapper-Headings sichtbar blieben.
- GREEN: `src/App.css` setzt im Desktop-`/game`-Layout `info-panel--waldtanz-arena` auf `padding: 0`, `background: transparent`, `border-color: transparent`, `box-shadow: none`; `Aktiver Spieler`/`Spieltisch`-Headings bleiben im DOM, werden aber visuell versteckt; `spielbrett--waldtanz` bekommt im route-gescopedten Block einen 4px-Bühnenrand und Hard Shadow.
- Production-Smoke-Erweiterung: `scripts/live_smoke.mjs` prüft jetzt den computed Bühnenrahmen-Vertrag (`M1bl Bühnenrahmen`) auf der stabilen Alias. Das Script bleibt exakt bei 500 Zeilen.

## Review

- Claude Code / `/simplify`: `claude --model opusplan` ist weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-/Line-Budget-Simplify-Prüfung wurde genutzt.
- Codex Review: Review-only auf uncommitted Worktree inklusive untracked Testdatei; `BLOCKERS: None`. Non-Blocker: `scripts/live_smoke.mjs` ist exakt bei 500 Zeilen, der transparente Wrapper behält noch eine transparente Border-Box, CSS-Source-Test wird durch computed Smoke ergänzt.

## Verifikation

- RED-Nachweis: `npm test -- --run src/App.m1bl_waldtanz_buehnenrahmen.test.tsx` fiel vor der Umsetzung auf dem fehlenden transparenten Chrome-Vertrag.
- Targeted/Adjacent: `npm test -- --run src/App.m1bl_waldtanz_buehnenrahmen.test.tsx src/App.m1bk_waldtanz_zugtafel.test.tsx src/App.m1bd_waldtanz_lichtungsbrett.test.tsx src/App.m1bc_waldtanz_handbank.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/live_smoke.mjs` → `/` und `/game` HTTP 200; Kernregionen; M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1bi/M1bj/M1ba/M1bb/M1bk/M1bl grün; keine Console-/Page-Errors.
- Full Gates: `npm test -- --run` → 277 Testdateien / 855 Tests bestanden; `npm run check:test-lines`; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check`; `node scripts/live_smoke.mjs --self-test` jeweils grün. Build-Artefakte: `dist/assets/index-IQ9kQcsu.css`, `dist/assets/index-30EPlRSx.js`.

## Release

- Feature-Commit: `0e2b621 — M1bl: Spieltisch als Waldtanz-Buehne fokussieren`.
- Production-Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` (`READY`, 17s) mit Auto-Alias.
- Production-Smoke: `npm run smoke:production` bestätigt `/` und `/game` HTTP 200, Kernregionen, bestehende M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1bg/M1bi/M1bj/M1ba/M1bb/M1bk-Verträge und neu `M1bl Bühnenrahmen: Aktiver-Spieler-Chrome transparent, Spieltisch als primäre 4px-Waldtanz-Bühne sichtbar`; keine Console-/Page-Errors.
- Finaler Dokumentations-HEAD: Nach diesem Status-Dokument wurde `origin/main` erneut per Vercel Production auf dieselbe stabile Alias deployt und mit demselben Production-Smoke verifiziert, damit `origin/main`/HEAD und Production übereinstimmen.

## Sichtbarer Spielwert

Der `/game`-Screen liest sich weniger wie ein gelbes Formularpanel mit Überschrift und stärker wie ein echtes Spielbrett: Links bleibt der Stitch-Seitenrahmen, oben die Gegner-/Zugfläche, unten die Handbank, und in der Mitte dominiert nun der `Spieltisch` selbst als greifbare Waldtanz-Bühne.

## Nächste mittlere Lücke

Als nächster spielwertiger Vertical sollte nicht wieder ein Wrapper-/A11y-Mikroslice folgen. Sinnvoll ist entweder ein konkreter Board-Interaktions-Vertical für eine verbleibende Sonderkarten-/Zielentscheidung oder ein M5-Mehrzug-/Endgame-Playability-Slice, der einen längeren echten Spielablauf bis Endspurt/Sieger-Party stärker live absichert.
