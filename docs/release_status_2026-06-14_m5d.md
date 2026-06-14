# Release Status — 14.06.2026 M5d Zugkompass

## Slice

M5d ist ein mittlerer Playability-Vertical nach M5c: Der `Spieltisch` bekommt einen board-nahen `Zugkompass`, der den nächsten sinnvollen Phasenschritt als Spielablauf direkt zwischen Waldpfad und Schlangenbereich führt.

## Warum mittlerer Vertical

- Mehr als Mikro-Slice: Der Zugfluss wird sichtbar vom entfernten Button-/Debuglisten-Gefühl auf ein Brett-nahes Führungsinstrument gehoben.
- Kein Big-Bang: Engine-Regeln, Karten-/Schlangen-Interaktionen, Aktionsdock-Fallback, KI-Vorspulen, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- Google-Stitch-Richtung: Chunky Waldtanz-Panel mit 3px Dark-Forest-Border, Pill-Elementen, radialer Waldlichtung und hard shadow.

## Umsetzung

- `src/components/ZugKompass.tsx` neu: zeigt `Du bist dran` / `KI ist am Zug` / `Reaktion steht aus`, die spielerfreundliche Phase und genau die passende primäre Weiter-Aktion.
- `src/App.tsx` hängt den Zugkompass im `Spieltisch` nach `Zugpfad` und vor `Schlangenbereich` ein.
- `src/components/AktionenPanel.tsx` blockiert normale Phasenbuttons und KI-Vorspulen, solange Reaktionen ausstehen; Reaktionsbuttons bleiben verfügbar.
- `src/App.css` ergänzt das Waldtanz-Styling für `.zugkompass` und `.zugkompass__aktionen`.
- `src/App.m5d_zugkompass.test.tsx` beweist den kompletten sichtbaren Pfad: Startzustand ohne Weiter-Button, Karte spielen, Weiter zur Aufgabenprüfung, Weiter zum Zugabschluss, Zug an KI übergeben, Gegnerzüge zurück zum Menschen vorspulen, plus Pending-Reaktion-Guards für Zugkompass, AktionenPanel und Spielerführung.

## Workflow und Review

- RED: `npm test -- --run src/App.m5d_zugkompass.test.tsx` fiel initial erwartungsgemäß fehl, weil `Zugkompass` noch nicht existierte.
- Claude Code: Coding- und `/simplify`-Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt.
- Codex Review: initiale Pending-Reaktion-Blocker wurden test-first gehärtet und behoben; finaler Re-Review: `BLOCKERS: Keine`.

## Verifikation lokal

- Targeted: `npm test -- --run src/App.m5d_zugkompass.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.r53.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r176_phasenaktion_live_region_atomic.test.tsx` → 6 Testdateien / 8 Tests bestanden.
- Spielerführung/Review-Regressionssatz: `npm test -- --run src/App.m5d_zugkompass.test.tsx src/App.f14_spielerfuehrung.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.r176_phasenaktion_live_region_atomic.test.tsx` → 5 Testdateien / 12 Tests bestanden.
- Full Gates: `npm test -- --run` → 201 Testdateien / 702 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Geänderte Skriptdateien unter 500 Zeilen: `src/App.tsx` 488, `src/components/AktionenPanel.tsx` 300, `src/components/ZugKompass.tsx` 87, neuer Test 125.

## Release

- Commit/Push: `670811e M5d: Zugkompass boardnah führen` wurde nach `origin/main` gepusht.
- Deploy: Vercel Production wurde auf `https://schlangentanz-v2.vercel.app` bereitgestellt; Deployment-URL `https://schlangentanz-v2-be0xpqvob-alfreds-projects-7e9df1b4.vercel.app`, final aliasiert auf die stabile Production-Alias.
- Smoke: `npm run smoke:production` meldete `/game` und `/` HTTP 200 sowie die Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar.
- M5d-Browser-Smoke: `/` und `/game` HTTP 200, 3-KI-Lobby gestartet, `Zugkompass` zwischen `Zugpfad` und `Schlangenbereich` gefunden, 3px Dark-Forest-Border/hard shadow/radiale Waldlichtung bestätigt, board-nah eine Startkarte gespielt, per Zugkompass zur Aufgabenprüfung und zum Zugabschluss gewechselt, Zug an KI übergeben, Gegnerzüge zurück zum Menschen vorgespult, keine Console-/Page-Errors.

## Nächste mittlere Lücke

M5e sollte den Mehrzug-/Endgame-Pfad weiter spielwertig machen: bounded Browser-Flow vom Lobby-Start über mehrere Mensch-/KI-Züge bis in Endspurt/Spielende oder eine klar dokumentierte, lokal abgesicherte Grenze, falls die vollständige Endgame-Automation noch zu fragil ist.
