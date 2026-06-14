# Release Status — 14.06.2026 M1i Waldtanz-Ablage

## Milestone / Slice

M1i ist ein mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` zeigt den `Ablagestapel` jetzt als board-nahe `Waldtanz-Ablage` zwischen `Partiefortschritt` und `Schlangenbereich` — wie eine zentrale gespielte Karte auf der Waldlichtung statt nur als Material-/Debugzeile.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als A11y-/Copy-Politur: Eine zentrale Kartenfläche macht sichtbar, wo Sonderkarten- und Abwurfeffekte landen.
- Kein Big-Bang: Engine-Regeln, Aktionsausführung, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Aktionsdock bleiben unverändert.
- Google-Stitch-Richtung: Die Ablage nutzt eine echte Kartenfläche mit 3px Dark-Forest-Border, 2rem-Radius, Hard Shadow, sunny Waldlichtung und leichter Kartenrotation.

## Änderungen

- `src/components/WaldtanzAblage.tsx`: neue passive Anzeige-Komponente für `zustand.ablagestapel`, inklusive leerem Ablageplatz und letzter Karte.
- `src/App.tsx`: hängt die `Waldtanz-Ablage` board-nah nach `Partiefortschritt` und vor `Schlangenbereich` ein.
- `src/App.css`: ergänzt Stitch-Styles für Ablagefläche, Kartenstapel und Sonderkarten-Fallbackfarbe.
- `src/App.m1i_waldtanz_ablage.test.tsx`: neuer RED/GREEN-Test für DOM-Reihenfolge, sichtbare Ablage-Copy, leeren Zustand und CSS-Vertrag inklusive Fallback gegen undefinierte Sonderkarten-Token.

## Workflow / Review

- RED: `npm test -- --run src/App.m1i_waldtanz_ablage.test.tsx` fiel initial erwartungsgemäß mit fehlender Region `Waldtanz-Ablage` fehl.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Eine separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- Codex Review: initialer Blocker zu `--st-color-tertiary-container` ohne Fallback wurde test-first reproduziert und behoben. Finales Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted: `npm test -- --run src/App.m1i_waldtanz_ablage.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 4 Testdateien / 7 Tests bestanden.
- Full Gates: `npm test -- --run` → 209 Testdateien / 713 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Geänderte Skriptdateien unter 500 Zeilen: `src/App.tsx` 496, `src/components/WaldtanzAblage.tsx` 55, `src/App.m1i_waldtanz_ablage.test.tsx` 70.

## Sichtbarer Spielwert

Spieler sehen nun direkt auf dem Brett, ob die Ablage leer ist oder welche Karte zuletzt in der Ablage gelandet ist. Dadurch wird der Tisch räumlicher: Handkarten, Zugkompass, Fortschritt, Ablage und Schlangenbereich bilden eine zusammenhängende Spieloberfläche statt getrennter Listen.

## Commit / Deploy / Smoke

- Feature-Commit/Push: `f56f73a — M1i: Waldtanz-Ablage sichtbar machen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M1i-Browser-Smoke bestätigt `/` und `/game` HTTP 200, `Waldtanz-Ablage` im `Spieltisch`, DOM-Reihenfolge `Partiefortschritt < Waldtanz-Ablage < Schlangenbereich`, sichtbare Copy `Ablage: 0 Karten`, 3px Dark-Forest-Border, Hard Shadow, ≥32px Radius und keine Console-/Page-Errors. Der finale Dokumentations-HEAD wurde anschließend erneut auf die stabile Production-Alias bereitgestellt und gesmoked.

## Nächste mittlere Lücke

Als nächstes sollte M5/M1 die Ablage vom passiven Tischobjekt in einen sichtbaren Mehrzug-Spielverlauf einbinden: z.B. ein begrenzter Boardflow, der eine Sonderkarte spielt und den Ablage-Wechsel live am Brett zeigt, ohne die Fallback-Buttonliste wieder zum Zentrum zu machen.
