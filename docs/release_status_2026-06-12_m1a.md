# Release Status — 12.06.2026 M1a Waldtanz-Arena-Spielbrett

## Slice

M1a innerhalb des Google-Stitch-Meilensteins `M1 Waldtanz Game Board`.

Ziel: Der `/game`-Screen soll sichtbar weniger wie eine Debug-/Buttonliste und mehr wie ein modernes Browser-Spielbrett wirken, ohne Engine-Regeln oder bestehende Aktionen umzubauen.

## Scope

- `Spielbereich` erhält eine Stitch-/Waldtanz-Layoutklasse und wird auf Desktop als zentrale Arena mit kompakten Nebenbereichen angeordnet.
- `Aktiver Spieler` wird als zentrales Arena-Panel markiert.
- `Spieltisch` wird zur `spielbrett--waldtanz`-Bühne mit Forest-/Stone-Arena-Gradient, großem Pill-Radius und harter Waldkante.
- `Schlangenbereich` steht strukturell vor `Handkarten`; die Hand bleibt im Spieltisch und sitzt board-nah unten.
- `Aktionen` bleibt direkt nach dem Spieltisch als kontextuelle Steuerung erhalten.
- Status, Spielerübersicht, Material/Aufgaben und Wertung bleiben sichtbar, werden aber über Grid-Areas als Nebenbereiche führbar.

## Bewusst ausgeschlossen

- Keine Engine-/Regeländerungen.
- Keine neue Sonderkarten-Zielinteraktion.
- Keine Drag-and-drop-Erweiterung.
- Kein Lobby-/Regelbuch-/Ergebnis-Screen.
- Keine rein mechanische A11y-/Live-Region-Härtung.

## Workflow-Evidenz

- RED: `npm test -- --run src/App.m1a_waldtanz_arena_layout.test.tsx` fiel initial erwartungsgemäß fehl, weil Waldtanz-Klassen/Layoutvertrag und board-nahe Handstruktur fehlten.
- Claude Code GREEN: blockiert durch `401 Invalid authentication credentials`; manueller enger Fallback gemäß Workflow genutzt.
- Claude `/simplify`: ebenfalls durch `401 Invalid authentication credentials` blockiert; manuelle Simplify-Prüfung + Tests.
- Codex Review: initiale Blocker gefunden und behoben:
  - horizontale Zentrierung nach Shell-Umbau wiederhergestellt (`justify-items: center`),
  - CSS-Selector-Reihenfolge korrigiert, damit bestehender F13-Layouttest den Basisblock `.schlangenbereich` trifft,
  - direkter Token-Vertrag `background: var(--st-color-background)` erhalten, Dots über `background-image` ergänzt.
- Finaler Codex Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.

## Lokale Gates

- Targeted/Regression: `npm test -- --run src/App.m1a_waldtanz_arena_layout.test.tsx src/App.f31_spieltisch_layout.test.tsx src/App.f13_spielbrett_layout.test.tsx src/App.r172_spieltisch_live_region_atomic.test.tsx src/App.r159_handkarten_idref.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx` → 10 Testdateien / 34 Tests bestanden.
- Full tests: `npm test -- --run` → 188 Testdateien / 679 Tests bestanden.
- Test-Line-Gate: `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.
- Diff hygiene: `git diff --check` bestanden.

## Commit / Deploy / Smoke

- Feature-Commit: `2236659 — M1a: Waldtanz-Arena-Spielbrett anlegen`.
- Production-Deploy: Vercel `READY`, Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke:
  - `/` HTTP 200.
  - `/game` HTTP 200.
  - Browser-Smoke ohne Console-/Page-Errors.
  - Sichtbar: `Spielbereich`, `Aktiver Spieler`, `Spieltisch`, `Schlangenbereich`, `Handkarten`, `Aktionen`.
  - DOM-/Layoutvertrag live bestätigt: `spielbereich--waldtanz`, `info-panel--waldtanz-arena`, `spielbrett--waldtanz`, radialer Arena-Gradient, Schlangenbereich vor Handkarten, Handkarten visuell unter der Schlangenfläche, Aktionen direkt nach dem Spieltisch.

## Ergebnis

Der Game-Screen ist jetzt ein erster mittlerer Google-Stitch-Vertical: zentrale Waldarena statt gleichrangiger Debugpanelen, Hand unten am Board, Schlangen als primäre Spielfläche, Nebenbereiche kompakter leitbar. Das ist mehr als ein Mikro-Attributslice, aber kein Big-Bang: Engine und bestehende Interaktionen bleiben unverändert und verifiziert.

## Nächste mittlere Lücke

M1b: Das Aktionspanel weiter in Richtung kontextueller Board-Steuerung verschieben — dominante Buttonlisten reduzieren, ohne Fallback-Aktionen zu verlieren. Danach M1c: Nebenbereiche noch stärker als kompakte Plaketten/Sidebars im Stitch-Stil ausprägen.
