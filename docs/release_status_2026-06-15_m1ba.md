# Release-Status — 15.06.2026 — M1ba Startkreis-Vorschau

## Slice

M1ba ergänzt im Waldtanz-Game-Board eine körperliche Startkreis-Vorschau: Nach Auswahl einer Farb-Handkarte zeigt der board-nahe Startkreis die Karte als eigenes Stitch-Spielobjekt. Der Klick auf die Brettfläche startet weiterhin die neue Schlange; die alte Startkreis-Buttonliste bleibt als Fallback erhalten, ist auf `/game` nach Auswahl aber nicht mehr das primäre Zentrum.

## Warum mittlerer Vertical

- Kein Mikro-A11y-Slice: Die Änderung macht eine reale Spielentscheidung direkt auf dem Brett sichtbar und ausführbar.
- Kein Big-Bang: Nur Startkreis/Startaktion, angrenzende Regressionen, CSS und Production-Smoke wurden angepasst; Engine-Regeln, Handlogik und andere Sonderkartenflächen bleiben unverändert.

## Umsetzung

- Neuer `SchlangenStartzone`-Baustein kapselt Startkreis-Markup, Drag/Drop/Keyboard/Click-Anbindung und die sichtbare Vorschau.
- Die Vorschau nutzt vorhandene Stitch-Tokens, 3px-Border und harten Schatten; kein nicht definiertes `--st-color-surface-bright`.
- `aria-describedby` referenziert die sichtbare Vorschau ohne eigenes `aria-label`, damit die sichtbare Anleitung als Beschreibung erhalten bleibt.
- Der Live-Smoke wählt eine sichtbare Farb-Handkarte, prüft die Startkreis-Vorschau, die untergeordnete Startlisten-Darstellung, `elementFromPoint()`-Klickbarkeit und führt den Startkreis mit einem normalen Browser-Click aus.

## Verifikation

- RED/GREEN fokussiert: `npm test -- --run src/App.m1ba_startkreis_vorschau.test.tsx src/App.m1u_waldtanz_startkreis.test.tsx src/App.r178_board_zielmarkierungen.test.tsx` → 3 Dateien / 6 Tests grün.
- Full Gates final: `npm test -- --run` → 260 Dateien / 819 Tests grün; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün.
- Lokaler Browser-Smoke gegen `/` und `/game` mit `SMOKE_BASE_URL=http://127.0.0.1:5173 npm run smoke:production` grün; M1ba-Nachweis: sichtbare Farbkarte im Startkreis und normale Brettflächen-Ausführung.
- Codex Re-Review nach Blockerfixes: `BLOCKERS: None`.

## Release-Kette

- Feature-Commit: `38ecc32 — M1ba: Startkreis-Vorschau als Brettobjekt zeigen`.
- Release-Dokumentation und Feature-Commit wurden nach `origin/main` gepusht.
- Vercel Production ist auf die stabile Alias `https://schlangentanz-v2.vercel.app` deployt (`READY`).
- Production-Smoke bestätigt `/` und `/game` HTTP 200, Kernregionen, M1as/M1aw/M1ax/M1ay-Verträge sowie `M1ba Startkreis-Vorschau: gelb-04 im Startkreis sichtbar und per Brettfläche gestartet`; keine Console-/Page-Errors.
- Ephemere Deploy-/Inspect-URLs werden nicht dauerhaft festgeschrieben.

## Nächste mittlere Lücke

M1bb sollte die nächste sichtbare Brettentscheidung vertiefen: nach der Startkreis-Vorschau die Anlegeplätze/Schlangenenden weiter als card-game-artige Drop-/Klickflächen mit klarer Vorschau und weniger Fallback-Button-Dominanz ausbauen.
