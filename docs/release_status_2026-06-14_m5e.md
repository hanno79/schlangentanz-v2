# Release Status — 14.06.2026 M5e Partiefortschritt

## Milestone / Slice

M5e ist ein mittlerer sichtbarer Playability-Vertical nach M5d: Der `Spieltisch` bekommt eine board-nahe Region `Partiefortschritt`, die Endspurt-Distanz, aktuelle Führung, eigenen Punktestand und Endrunden-/Sieger-Party-Ausblick direkt zwischen `Zugkompass` und `Schlangenbereich` zeigt.

Warum weder Mikro-Slice noch Big-Bang:
- Mehr als reine A11y-/Copy-Politur: Spieler sehen jetzt am Brett, wie weit die Partie bis Endspurt/Sieger-Party ist und wer führt.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Fallback-Aktionsdock bleiben unverändert.
- Google-Stitch-Richtung: chunky Waldtanz-Karte mit 3px Dark-Forest-Border, 2rem-Radius, hard shadow, radialer Waldlichtung und responsiver Fortschrittsspur.

## Änderungen

- `src/components/Partiefortschritt.tsx` neu: berechnet Anzeige aus bestehendem `Spielzustand` und Engine-Wertung.
- `src/App.tsx`: hängt `Partiefortschritt` board-nah nach `ZugKompass` und vor `Schlangenbereich` ein; bleibt bei 490 Zeilen.
- `src/App.css`: ergänzt Waldtanz-Styling für `.partiefortschritt` und eine responsive `.partiefortschritt__spur`.
- `src/App.m5e_partiefortschritt.test.tsx` neu: beweist Normalspiel- und Endspurt-Vertrag, DOM-Reihenfolge und responsive CSS-Spur.

## Workflow / Review

- RED: `npm test -- --run src/App.m5e_partiefortschritt.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Partiefortschritt` fehlte.
- Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- Codex Review: initialer Blocker zur starren 3-Spalten-Spur auf 320px wurde test-first behoben; Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted: `npm test -- --run src/App.m5e_partiefortschritt.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx` → 5 Testdateien / 8 Tests bestanden.
- Full Gates: `npm test -- --run` → 202 Testdateien / 704 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Feature-Commit/Push: `35cdb43 — M5e: Partiefortschritt boardnah sichtbar machen` auf `origin/main`.
- Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt.
- Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200. M5e-Browser-Smoke: `/` und `/game` HTTP 200; `Partiefortschritt` sichtbar im `Spieltisch`, DOM-Reihenfolge `ZugKompass < Partiefortschritt < Schlangenbereich`, 3px Border, hard shadow, responsive Spur (Desktop 2 Spalten im Live-Viewport, Mobile 1 Spalte bei 320px), keine Console-/Page-Errors.

## Sichtbarer Spielwert

Der Game-Screen erklärt den Weg zur Endrunde jetzt am Spielbrett selbst: Spieler müssen nicht mehr in Material-/Debuglisten nach Nachziehstapel, Punktestand oder Endspurtstatus suchen. Der Fortschritt sitzt dort, wo die nächste Entscheidung getroffen wird — zwischen Zugführung und Schlangenbereich.

## Nächste mittlere Lücke

M5f sollte den Endspurt-/Spielende-Pfad weiter spielbar machen: ein bounded Browser-Flow, der die Partiefortschritt-Anzeige über mehrere Mensch-/KI-Züge bis Endspurt oder Spielende verändert, oder alternativ eine kleine Engine-/UI-Härtung, die einen solchen Live-Pfad gezielt ermöglicht, ohne neue Buttonlisten zu bauen.
