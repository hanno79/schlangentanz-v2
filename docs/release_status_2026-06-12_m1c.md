# Release Status — 12.06.2026 M1c Stitch-Sidebar-HUD

## Slice

M1c innerhalb des Google-Stitch-Meilensteins `M1 Waldtanz Game Board`.

Ziel: Nach M1a (Arena) und M1b (Aktionsdock) sollen die Nebenbereiche nicht mehr wie große Debug-/Textlisten wirken. `Spielstatus`, `Spielerübersicht`, `Material und Aufgaben` und `Wertung` rahmen das zentrale Waldtanz-Brett jetzt als kompakte, chunky Wald-HUD-Plaketten. Entwicklungsdaten bleiben verfügbar, treten aber visuell zurück.

## Warum mittlerer Vertical

- Mehr als Mikro-Slice: Vier spielrelevante Sidebars werden gemeinsam in eine sichtbare HUD-Rahmung überführt; das verändert den `/game`-Gesamteindruck.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Board-Ziele, Handkarten, Schlangenbereich, Aktionsdock, Routing und Debug-Inhalte bleiben erhalten.
- Direkt gegen die Google-Stitch-Richtung: kräftige Pill-/Badge-Optik, Sidebars um eine größere Arena, weniger Debuglisten-Zentrum.

## Scope

- `Spielstatus`, `Spielerübersicht`, `Material und Aufgaben` und `Wertung` erhalten gemeinsame `waldtanz-hud`-Klassen plus rollenbezogene Varianten.
- Desktop-Grid gewichtet die mittlere Arena stärker (`arena` bleibt zwischen linken/rechten HUD-Plaketten).
- HUD-Panels werden scroll-contained, rund/chunky und bekommen sichtbare Icon-Plaketten an den Überschriften.
- `Aufgabenkarten` und `Punktetafel` stehen vor den jeweiligen Entwicklungsdaten, damit die spielerrelevanten Karten/Scoreboards zuerst sichtbar sind.
- Die Waldtanz-Arena erhält mehr vertikale Präsenz.

## Bewusst ausgeschlossen

- Keine Engine-/Regeländerung.
- Keine neue Sonderkarten-Zielauswahl.
- Kein Drag-and-drop-Umbau.
- Kein Lobby-/Regelbuch-/Ergebnis-Screen.
- Keine rein mechanische ARIA-/IDREF-/Live-Region-Härtung.

## Workflow-Evidenz

- RED: `npm test -- --run src/App.m1c_stitch_sidebars.test.tsx` fiel initial erwartungsgemäß fehl, weil die HUD-Klassen/CSS-Verträge fehlten.
- Claude Code GREEN: blockiert durch `401 Invalid authentication credentials`; enger manueller Fallback gemäß Workflow genutzt.
- Claude `/simplify`: ebenfalls durch `401 Invalid authentication credentials` blockiert; manuelle Simplify-Prüfung + gezielte Tests.
- Codex Review: initialer Blocker erkannt — in scroll-limitierten Material-/Wertungs-HUDs standen Entwicklungsdaten vor `Aufgabenkarten`/`Punktetafel`. Der Blocker wurde test-first reproduziert und durch Umordnung behoben.
- Codex Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.

## Lokale Gates

- Targeted/Regression nach Review-Fix: `npm test -- --run src/App.m1c_stitch_sidebars.test.tsx src/App.f10_debuggruppen.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.r169_wertung_live_region_atomic.test.tsx src/App.r170_punktetafel_live_region_atomic.test.tsx src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` → 8 Testdateien / 8 Tests bestanden.
- Full tests: `npm test -- --run` → 190 Testdateien / 681 Tests bestanden.
- Test-Line-Gate: `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.
- Diff hygiene: `git diff --check` bestanden.

## Commit / Deploy / Smoke

- Feature-Commit: `fa2a33b — M1c: Waldtanz-Sidebars als HUD verdichten`.
- Production-Deploy: Vercel `READY`, Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke nach Feature-Commit:
  - `/` HTTP 200.
  - `/game` HTTP 200.
  - Browser-Smoke ohne Console-/Page-Errors.
  - Live bestätigt: Desktop-Grid `"status arena spieler" / "material arena wertung"`, `spielbrett--waldtanz`, Arena-MinHeight ca. `702px`, alle vier Sidebars mit `waldtanz-hud`, `overflow: auto`, runden Plaketten-Überschriften (`🌿`, `🐍`, `🎒`, `⭐`), Entwicklungsdaten-Opacity `0.72`, `Aufgabenkarten` vor Material-Entwicklungsdaten und `Punktetafel` vor Wertungs-Entwicklungsdaten.

## Ergebnis

Der Game-Screen wirkt stärker wie ein Waldtanz-Spielbrett mit HUD: Das Board hat sichtbar mehr Gewicht, die vier Nebenbereiche sind kompakte Spielplaketten und die wichtigsten Karten-/Score-Inhalte erscheinen vor den Entwicklungsdaten. Das verschiebt die Erfahrung weiter weg vom Debuglisten-/Buttonsimulator, ohne bestehende Spielmechaniken zu riskieren.

## Nächste mittlere Lücke

M2a/M2b: Die bereits begonnenen board-nahen Sonderkarten-Ziele weiter ausbauen — insbesondere Mehrfachziel-/Gegner-Zielauswahl für Schlangenfrass/Farbendieb/Farbenschutz — damit Entscheidungen noch stärker direkt auf Karten und Schlangen statt in Fallbacklisten stattfinden.
