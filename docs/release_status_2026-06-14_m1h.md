# Release Status — 14.06.2026 M1h Waldtanz-Zielkompass

## Milestone / Slice

M1h ist ein mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Nach der Handkarten-Auswahl zeigt der `Schlangenbereich` einen board-nahen `Waldtanz-Zielkompass`, der die aktuell leuchtenden Brettziele zusammenfasst. Zusätzlich wurde ein im Production-Smoke gefundener Seitenmenü-Klickblocker behoben, damit Handkarten/Boardziele wirklich anklickbar bleiben.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Die Entscheidung „Welche Karte kann ich jetzt wohin spielen?“ ist direkt am Brett sichtbar statt in der Buttonliste versteckt.
- Kein Big-Bang: Engine-Regeln, Aktionsausführung, Legal-Action-Enumeration, Drag-and-drop, Aktionsdock, Lobby, Schlangenbuch, Sieger-Party und bestehende Boardziel-Buttons bleiben unverändert.
- Google-Stitch-Richtung: Der Kompass ist eine chunky/pill Brettplakette mit 3px Dark-Forest-Border, Hard Shadow und sunny-gold Zielchips.

## Änderungen

- `src/components/WaldtanzZielkompass.tsx`: neuer board-naher Kompass, der aus bereits gefilterten legalen UI-Aktionslisten die tatsächlich gerenderten Brettziele für die ausgewählte Handkarte zählt.
- `src/components/Schlangenbereich.tsx`: hängt den Zielkompass direkt unter dem Dragstatus und vor den eigenen/gegnerischen Schlangen ein.
- `src/App.css`: ergänzt pill/chunky Zielkompass-Styling; setzt das statische `Waldtanz-Seitenmenü` auf `pointer-events: none`, nachdem Production-Smoke zeigte, dass es Handkarten-Klicks überdecken konnte.
- `src/App.m1h_waldtanz_zielkompass.test.tsx`: neuer RED/GREEN-Test für Farbkarte → Startzone/eigene Schlange plus Regression, dass zwei-gegnerische `Schlangenfrass`-Legal-Actions nicht als gerenderte Boardziele gezählt werden.
- `src/App.m1f_waldtanz_seitenmenue.test.tsx`: härtet den statischen Seitenmenü-Vertrag gegen erneute Pointer-Interception.

## Workflow / Review

- RED: `npm test -- --run src/App.m1h_waldtanz_zielkompass.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Zielkompass` fehlte.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Eine separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- Codex Review: initiale Blocker zu Schlangenfrass-Zwei-Gegner-Zielzählung und zu überbreiter „klick- oder ziehbar“-Copy wurden test-first behoben; Re-Review `BLOCKERS: None`.
- Production-Smoke-Fund: Das statische `Waldtanz-Seitenmenü` fing Handkarten-Klicks ab. Der Smoke-Blocker wurde mit einem RED-CSS-Vertrag in `App.m1f_waldtanz_seitenmenue.test.tsx` behoben; Codex-Re-Review bestätigte `BLOCKERS: None`.

## Verifikation

- Targeted: `npm test -- --run src/App.m1h_waldtanz_zielkompass.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx` → 7 Testdateien / 12 Tests bestanden.
- Smoke-Blocker Targeted: `npm test -- --run src/App.m1f_waldtanz_seitenmenue.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 3 Testdateien / 4 Tests bestanden.
- Full Gates: `npm test -- --run` → 208 Testdateien / 711 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Geänderte Skriptdateien unter 500 Zeilen: `src/App.tsx` 494, `src/components/Schlangenbereich.tsx` 475, `src/components/WaldtanzZielkompass.tsx` 77, `src/App.m1h_waldtanz_zielkompass.test.tsx` 94, `src/App.m1f_waldtanz_seitenmenue.test.tsx` 53.

## Sichtbarer Spielwert

Nach Auswahl einer Handkarte sieht der Spieler direkt im Schlangenbereich, wie viele Brettziele bereitstehen und welche Zielart leuchtet (`Neue Schlange`, `Eigene Schlange`, `Karten-Ziel`, `Gegner-Ziel`). Das reduziert die Suche in der Fallback-Buttonliste und macht den Waldtanz-Spieltisch mehr zu einer echten Spieloberfläche. Der behobene Seitenmenü-Klickblocker stellt sicher, dass die bodennahe Handkartenleiste auf Production tatsächlich anklickbar bleibt.

## Commit / Deploy / Smoke

- Feature-Commit/Push: `d0055f9 — M1h: Waldtanz-Zielkompass sichtbar machen` auf `origin/main`.
- Smoke-Blocker-Fix/Push: `9e65ff6 — M1h: Seitenmenue Klickblocker entfernen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M1h-Browser-Smoke: `/` und `/game` HTTP 200; deterministische Farbkarte `blau-01` ausgewählt; `Waldtanz-Zielkompass` zeigt `Ausgewählt: blau-01`, `1 Brettziel bereit`, Chip `Neue Schlange`, Copy `Leuchtende Ziele sind direkt auf dem Brett spielbar.`, `schlangen-startzone--zielbereit`, `border-radius: 999px`, Hard Shadow; keine Console-/Page-Errors.

## Nächste mittlere Lücke

M1i sollte die Zielkompass-Idee in eine noch klarere Spielerentscheidung überführen: entweder zielartspezifische Reihenfolge/Icons im Kompass mit Fokus auf Spezialkarten oder ein begrenzter End-to-End-Boardflow, der Farbkarte → Schlange → Sonderkarte über mehrere sichtbare Brettziele ohne Dominanz der Buttonliste beweist.
