# Release Status — 14.06.2026 M2e Schlangengrube-Spielerziel

## Milestone / Slice

M2e ist ein mittlerer board-naher Interaktions-Vertical innerhalb der Google-Stitch-Waldtanz-Arena: Eine ausgewählte `Schlangengrube` wird nicht mehr nur als Fallback-Buttonliste angeboten, sondern direkt an den Gegnerplaketten im `Waldtanz-Spielerrahmen` sichtbar und ausführbar.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Ein echtes Sonderkarten-Ziel wandert auf die Brett-/Spieleroberfläche.
- Kein Big-Bang: Engine-Regeln, Aktionsvalidierung, Drag-and-drop, Schlangenbereich-Ziele, Aktionsdock, Lobby, Schlangenbuch, Sieger-Party und KI-Vorspulen bleiben erhalten.
- Google-Stitch-Richtung: Gegnerplaketten erhalten eine sunny/chunky Zielmarkierung mit 3px Dark-Forest-Border und Hard-Shadow-Button.

## Änderungen

- `src/App.tsx`: filtert vorhandene Engine-`SonderkarteSpielen`-Aktionen und reicht sie nur in menschlichen Einzelaktionszügen an den Spielerrahmen weiter.
- `src/components/WaldtanzSpielerrahmen.tsx`: markiert passende Gegnerplätze nach Handkarten-Auswahl als Schlangengrube-Ziel und führt den bestehenden Engine-Aktionspfad über `onAktion` aus.
- `src/App.css`: ergänzt Waldtanz-Zielstil und chunky Spielerrahmen-Button.
- `src/App.m2e_schlangengrube_spielerziel.test.tsx`: neuer sichtbarer UI-Test für Auswahl → Gegnerplaketten-Ziele → Ausführung sowie KI-Gating und CSS-Vertrag.

## Workflow / Review

- RED: Die uncommitted Slice-Arbeit war bereits vorhanden; der neue Test beweist den vormals fehlenden Spielerrahmen-Zielpfad und wurde vor Release als enger Akzeptanzvertrag verifiziert.
- Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; der vorhandene enge manuelle Fallback wurde objektiv geprüft und offengelegt.
- Codex Review: Review-only auf uncommitted Diff inklusive untracked Testdatei; `BLOCKERS: None`. Codex bestätigte Engine-Autorität (`SonderkarteSpielen` ist aktuell Schlangengrube), KI-Gating, ausgewählte Handkarte + Zielspieler-Bindung, eindeutigen Buttonnamen, keine Pointer-Interception und Zeilenbudget.

## Verifikation

- Targeted: `npm test -- --run src/App.m2e_schlangengrube_spielerziel.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 5 Testdateien / 8 Tests bestanden.
- Full Gates: `npm test -- --run` → 213 Testdateien / 720 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Geänderte Skriptdateien bleiben unter 500 Zeilen: `src/App.tsx` exakt 500, `src/components/WaldtanzSpielerrahmen.tsx` 101, neuer Test 88.

## Sichtbarer Spielwert

Die `Schlangengrube` ist jetzt direkt an den Gegnerplaketten im Waldtanz-Tisch spielbar. Der Spieler wählt die Sonderkarte in der Hand, sieht die gegnerischen Tischplätze als Zielbereiche aufleuchten und kann die Karte dort ausführen, statt das Ziel in einer langen allgemeinen Buttonliste zu suchen.

## Commit / Deploy / Smoke

- Feature-Commit/Push: `7ae86eb — M2e: Schlangengrube am Spielerrahmen spielbar machen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M2e-Browser-Smoke mit deterministischer Start-RNG: `/` und `/game` HTTP 200; Handkarte `schlangengrube-02` auswählbar; `Waldtanz-Spielerrahmen` zeigt Button `Schlangengrube hier spielen` am Gegnerplatz `Spieler 2`; Zielplatz trägt `waldtanz-spielerrahmen__gegnerplatz--grubenziel`; Button hat 3px Border und Hard Shadow; Klick erzeugt `Zuletzt ausgeführt: Schlangengrube mit Karte schlangengrube-02 auf Spieler 2 spielen`; keine Console-/Page-Errors.

## Nächste mittlere Lücke

M2f/M5g sollte die nächsten direkten Spieler-/Board-Ziele oder den bounded Mehrzug-Endspurt weiter ausbauen: entweder weitere Sonderkarten-Zielentscheidungen direkt am Tisch konsolidieren oder einen robusten Browser-Flow bis nahe Endspurt/Spielende schaffen, ohne neue dominante Buttonlisten einzubauen.
