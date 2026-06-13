# Release Status — 13.06.2026 M2c Schlangenblockade-Boardziel

## Slice

M2c innerhalb des Google-Stitch-/Waldtanz-Interaktionsstrangs.

Ziel: Schlangenblockade soll sich nicht mehr wie eine abstrakte Fallbacklisten-Aktion anfühlen. Nach Auswahl der Schlangenblockade-Handkarte wird die gegnerische Zielschlange direkt im Schlangenbereich markiert und board-nah ausführbar.

## Warum mittlerer Vertical

- Mehr als Mikro-Slice: Eine weitere relevante Angriffskarte wandert vom Buttonlisten-Gefühl auf das Spielobjekt selbst.
- Kein Big-Bang: Engine-Regeln, Reaktionslogik, Drag-and-drop, Aktionsdock, Handkarten und bestehende R180–R183 Sonderkarten-Ziele bleiben erhalten.
- Sichtbar gegen die Google-Stitch-Richtung: Die gegnerische Schlange wird als warnendes Waldtanz-Ziel mit chunky Zielstil und direkter Spielaktion dargestellt.

## Scope

- `App.tsx` filtert vorhandene `SchlangenblockadeSpielen`-Aktionen aus der Engine-Aktionsliste.
- `Schlangenbereich` reicht Gegnerdarstellung in `GegnerSchlangenListe` aus, damit die Datei unter 500 Zeilen bleibt.
- `GegnerSchlangenListe` erhält die bestehenden Farbendieb-Ziele und ergänzt Schlangenblockade-Zielschlangen.
- `App.css` ergänzt `.schlangekarte--blockade-ziel` als sichtbaren Waldtanz-Zielstil.
- `App.m2c_schlangenblockade_boardziel.test.tsx` beweist Markierung, Nicht-Markierung eigener Schlangen, board-lokalen Button und Ausführung über den bestehenden Engine-Pfad.

## Bewusst ausgeschlossen

- Keine Engine-/Regeländerung.
- Keine neue Reaktions-UI für Farbenschutz-Abwehr.
- Kein Mehrfachziel-Picker für Schlangenfrass.
- Kein Lobby-/Regelbuch-/Ergebnis-Screen.

## Workflow-Evidenz

- RED: `npm test -- --run src/App.m2c_schlangenblockade_boardziel.test.tsx` fiel initial mit 2 erwarteten Fehlern fehl (`schlangekarte--blockade-ziel` und CSS-Vertrag fehlten).
- Claude Code GREEN: blockiert durch `401 Invalid authentication credentials`; enger manueller Fallback gemäß Workflow genutzt.
- Claude `/simplify`: ebenfalls durch `401 Invalid authentication credentials` blockiert; manuelle Simplify-Prüfung plus gezielte Tests.
- Codex Review: `BLOCKERS: None`; Codex bestätigte Testintegrität, Engine-Autorität, Datei-Limits, erhaltene R180–R183-Regressionen, eindeutige Labels, keine nested-button-Probleme und mittleren Slice-Scope.

## Lokale Gates

- Targeted/Regression: `npm test -- --run src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 10 Testdateien / 34 Tests bestanden.
- Full tests: `npm test -- --run` → 193 Testdateien / 687 Tests bestanden.
- Test-Line-Gate: `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.
- Diff hygiene: `git diff --check` bestanden.
- Geänderte Skriptdateien: `src/App.tsx` 491 Zeilen, `src/components/Schlangenbereich.tsx` 464 Zeilen, `src/components/GegnerSchlangenListe.tsx` 120 Zeilen, neuer Test 81 Zeilen.

## Commit / Deploy / Smoke

- Feature-Commit: `32bff47 — M2c: Schlangenblockade boardnah spielbar machen`.
- Production-Deploy: Vercel `READY`, Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke nach Feature-Commit:
  - `/` HTTP 200.
  - `/game` HTTP 200.
  - Browser-Smoke ohne Console-/Page-Errors.
  - Deterministischer Playwright-Smoke mit `Math.random = 0.6` spielt bis zu einer gegnerischen Schlange, wählt `schlangenblockade-04`, bestätigt `.schlangekarte--blockade-ziel` auf `schlange-spieler-2-1`, `backgroundHasGradient: true`, board-lokalen Button `Schlangenblockade hier spielen`, führt ihn aus und sieht `schlangenblockade-04` auf der Zielschlange.

## Ergebnis

Schlangenblockade ist jetzt als direkter Angriff auf eine sichtbare gegnerische Schlange spielbar. Das stärkt den Spielbrett-/Arena-Charakter weiter: Spieler wählen das Zielobjekt auf dem Brett statt eine lange Fallback-Aktion in der Liste zu suchen.

## Nächste mittlere Lücke

M2d: Schlangengrube board-nah auf Gegner-Spieler/HUD-Plaketten spielbar machen oder M2e: Zwei-Ziel-Schlangenfrass als expliziter board-naher Auswahlmodus. Beide Optionen würden weiter Spielentscheidungen aus der Buttonliste auf konkrete Spielobjekte verlagern.
