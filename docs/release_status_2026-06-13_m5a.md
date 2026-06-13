# Release Status — M5a Boardziele vor Aktionsdock schützen

Datum: 13.06.2026  
Production: https://schlangentanz-v2.vercel.app  
Feature-Commit: `ef53f98 — M5a: Boardziele vor Aktionsdock schützen`

## Scope

Mittlerer Playability-Vertical nach M4b: Beim echten Browser-Durchspielen blockierte der sticky Waldtanz-Aktionsdock sichtbare Start-/Anlegeziele im `Schlangenbereich` (`subtree intercepts pointer events`). Dieser Slice macht die zentrale Spielfläche wieder zur primären, direkt anklickbaren Board-Oberfläche, ohne Engine-Regeln, Aktionslabels, Drag-and-drop oder das Aktionsdock zu ersetzen.

## Warum mittlerer Slice

- Kein Mikro-Slice: Der Fix beseitigt einen realen Klickblocker im Hauptspielbrett; Spieler können board-nahe Schlangenziele wieder direkt nutzen statt auf die Buttonliste auszuweichen.
- Kein Big-Bang: Nur ein gezielter CSS-/Smoke-Vertrag wurde angepasst; Engine, React-State und UI-Struktur bleiben unverändert.

## Umsetzung

- `src/App.css`: `spielbrett--waldtanz` liegt als eigene Stacking-Ebene über dem sticky Aktionsdock, wenn beide geometrisch überlappen.
- `src/App.css`: `.schlangekarte__anlegebutton` erhält `scroll-margin-bottom: 18rem`, analog zum bereits geschützten Handkarten-Button.
- `src/App.m5a_board_targets_dock_clearance.test.tsx`: neuer RED/GREEN-Vertrag für sticky Dock, Pointer-Events, Board-Z-Index und Boardziel-Scroll-Abstand.
- `scripts/live_smoke.mjs`: Production-Smoke reconciliert sichtbare Kernbereiche robuster über exakte Region, exakte sichtbare Überschrift und exakten sichtbaren Text. Anlass war ein gesunder Live-DOM, bei dem der alte Smoke fälschlich `Spielstatus` nicht als exakt benannte Region fand.
- `tests/r107_live_smoke_script.test.ts`: Smoke-Skriptvertrag aktualisiert.

## Verifikation

- RED: `npm test -- --run src/App.m5a_board_targets_dock_clearance.test.tsx` fiel erwartungsgemäß wegen fehlendem Board-Ziel-Scroll-/Stacking-Vertrag.
- Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- Codex Review: M5a-Diff `BLOCKERS: None`; nach Smoke-Skript-Reconciliation erneuter Review `BLOCKERS: None`.
- Targeted: `npm test -- --run src/App.m5a_board_targets_dock_clearance.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.m1b_aktionsdock_layout.test.tsx` → 3 Testdateien / 4 Tests bestanden.
- Smoke-Script Targeted: `npm test -- --run tests/r107_live_smoke_script.test.ts src/App.m5a_board_targets_dock_clearance.test.tsx` → 2 Testdateien / 4 Tests bestanden.
- Full Gates: `npm test -- --run` → 197 Testdateien / 696 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Production Deploy/Smoke: Feature-Commit wurde per Vercel Production auf die stabile Alias bereitgestellt; nach Smoke-Skript-/Doku-Finalisierung wird der finale HEAD erneut deployt und gesmoked.
- Production Board-Smoke: `/` und `/game` HTTP 200; Playwright klickt ein sichtbares `Schlangenbereich-Start`-Boardziel auf der Production-Alias, sieht `Zuletzt ausgeführt: Neue Schlange starten`, eine neue eigene Schlange, `dockPointerEvents: none`, `dockButtonPointerEvents: auto`, `boardPosition: relative`, `boardZIndex: 3`, `startScrollMarginBottom: 324px`, keine Console-/Page-Errors.

## Was spielbarer wurde

Der Waldtanz-Spieltisch ist wieder die primäre Interaktionsfläche: sichtbare Start-/Anlegeziele lassen sich im Browser direkt anklicken, auch wenn der sticky Aktionsdock beim Scrollen in die Nähe kommt. Die Buttonliste bleibt als Fallback/Context-Dock verfügbar, verdrängt aber nicht mehr das Spielbrett.

## Nächste mittlere Lücke

M5b: Aus dem jetzt reparierten Board-Smoke einen deterministischeren Mehrzug-/Endgame-Pfad machen: von Lobby über Mensch- und KI-Züge bis Endspurt/Spielende, mit sichtbarer Sieger-Party als Zielzustand oder mit klar dokumentierter Grenze, falls die aktuelle Engine-Enumeration einen bounded Live-Pfad blockiert.
