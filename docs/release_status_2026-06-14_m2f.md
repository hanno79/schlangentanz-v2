/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für M2f — Schlangenfrass mit zwei gegnerischen Brettzielen ist board-nah spielbar.
*/

# Release-Status M2f — Schlangenfrass-Zweiziel am Brett

## Status

Release komplett auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Scope

M2f ist ein mittlerer board-naher Interaktions-Vertical nach M2e/M1k: Wenn `Schlangenfrass` als Engine-Aktion bereits zwei gegnerische Zielkarten erlaubt, müssen Spieler diese zwei Karten direkt im `Schlangenbereich` wählen und ausführen können. Der Slice ersetzt keine Engine-Regel, kein Drag-and-drop und keinen Aktionsdock-Fallback; er verlagert nur die bereits enumerierte Entscheidung von der langen Buttonliste auf konkrete gegnerische Brettkarten.

## Umsetzung

- `src/components/GegnerSchlangenListe.tsx` rendert für ausgewählte `Schlangenfrass`-Handkarten zuerst `Ziel 1 wählen` direkt auf legalen gegnerischen Karten.
- Nach dem ersten Pick erscheint ein sichtbarer `Schlangenfrass`-Zielkompass mit Reset und auf passenden zweiten Karten der Ausführungsbutton `Schlangenfrass mit 2 Zielen ausführen`.
- Die Ausführung nutzt ausschließlich die existierende `SchlangenfrassSpielen`-Aktion aus `legaleAktionen`; es wird keine UI-eigene Aktion konstruiert.
- `src/App.css` ergänzt die ausgewählte Zielkarte und den Zwei-Ziel-Kompass im Google-Stitch-Waldtanz-Stil mit bestehenden CSS-Tokens.
- `src/App.r181_schlangenfrass_boardziel.test.tsx` wurde von „noch nicht vorhanden“ auf den neuen vorbereitenden Zwei-Ziel-Pfad aktualisiert.

## Verifikation

- Targeted: `npm test -- --run src/App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 5 Testdateien / 10 Tests bestanden.
- Full Gates: `npm test -- --run` → 214 Testdateien / 722 Tests bestanden.
- `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden.
- `git diff --check` → bestanden.

## Review

Claude Code und `/simplify` mit `--model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; der enge manuelle Fallback wurde genutzt. Codex prüfte den uncommitted Diff inklusive untracked M2f-Testdatei. Initiale Blocker zu `react-hooks/set-state-in-effect` und undefinierten CSS-Tokens wurden behoben; finales Re-Review: `BLOCKERS: None`.

## Release

- Feature-Commit: `ede0ba6 — M2f: Schlangenfrass-Zweiziel am Brett spielbar machen`.
- Push: `origin/main` aktualisiert.
- Deploy: Vercel Production auf stabile Alias <https://schlangentanz-v2.vercel.app> (`READY`).
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200.
- M2f-Browser-Smoke: deterministische 3-KI-Partie; Spieler startet eine eigene Schlange, KI-Gegner bauen drei gegnerische Schlangen, Mensch startet den nächsten Zug, wählt `schlangenfrass-04`, sieht 3 `Schlangenfrass-Ziel 1`-Buttons, wählt ein erstes Ziel, sieht den Zwei-Ziel-Kompass und 2 Ausführungsbuttons, führt `Schlangenfrass` auf zwei gegnerische Karten aus und erhält `Zuletzt ausgeführt`-Feedback. Vor Ausführung bestätigt: ausgewählte Zielkarte `outline-style: solid`, `outline-width: 4px`, Kompass `border-top-width: 3px`, Hard Shadow; keine Console-/Page-Errors.

## Nächste mittlere Lücke

M2g sollte die nächsten verbliebenen Sonderkarten-Ziele oder eine zusammenhängende Mehrzug-/Endspurt-Playability vertikalisieren: weiterhin konkrete Spielobjekte und Entscheidungen am Brett statt neue Debug- oder Buttonlistenflächen.
