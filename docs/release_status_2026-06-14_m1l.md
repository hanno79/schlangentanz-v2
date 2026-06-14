# Release Status — 14.06.2026 M1l Waldtanz-Schlangenpfad

## Status

Release complete auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Milestone/Slice

M1l ist ein mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Schlangenreihen lesen sich jetzt nicht mehr nur als nebeneinanderliegende Kartenchips, sondern als zusammenhängender Waldtanz-Pfad mit sichtbarer Kopf-/Körper-/Schwanz-Logik und einer organischen Verbindungslinie. Engine-Regeln, Aktionshandler, Drag-and-drop, Aktionsdock, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.

Warum kein Mikro-Slice und kein Big-Bang:

- Kein isoliertes ARIA-/Copy-Hardening: Die sichtbare Brettoberfläche wird spielerischer und objektbezogener.
- Kein riskanter Rewrite: Nur Kartenreihen-Markup/CSS für eigene und gegnerische Schlangen plus fokussierte Regressionen; alle bestehenden Board-Aktionen bleiben erhalten.

## Änderungen

- `src/components/Schlangenbereich.tsx`: eigene Schlangen-Kartenreihen erhalten `schlangekarte__kartenreihe--pfad`; Karten bekommen Pfadrollenklassen `--kopf`, `--koerper`, `--schwanz`; Ein-Karten-Schlangen zeigen eine einzige Marke `Kopf & Schwanz`.
- `src/components/GegnerSchlangenListe.tsx`: gleiche Pfadsemantik für gegnerische Schlangen, ohne Farbendieb-/Schlangenfrass-/Blockade-Buttons zu verändern.
- `src/App.css`: ergänzt die Waldpfad-Verbindungslinie, chunky Pfadmarken und spezifische Transform-Selektoren, die alte nth-child-Versätze überschreiben.
- `src/App.m1l_waldtanz_schlangenpfad.test.tsx`: neuer RED/GREEN-Test für eigene/gegnerische Pfade, Ein-Karten-Schlangen und CSS-Vertrag.

## Workflow

- RED: `npm test -- --run src/App.m1l_waldtanz_schlangenpfad.test.tsx` fiel zunächst erwartungsgemäß fehl, weil Pfadklasse, Kopf-/Schwanzklassen und CSS fehlten.
- Claude Code / `/simplify`: Beide `claude --model opusplan`-Läufe waren durch `401 Invalid authentication credentials` blockiert. Der enge manuelle Fallback wurde genutzt und offen dokumentiert.
- Codex Review: erstes Review fand zwei echte Blocker (Transform-Spezifität gegen nth-child und noisy Ein-Karten-Schlangen mit separaten `Kopf`/`Schwanz`-Marken). Beide wurden test-first gehärtet und behoben. Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted nach Review-Fix: `npm test -- --run src/App.m1l_waldtanz_schlangenpfad.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 6 Testdateien / 20 Tests bestanden.
- Codex-Re-Review-Regressionssatz: 11 Testdateien / 40 Tests bestanden; `npm run typecheck` und `npm run check:test-lines` bestanden.
- Full Gates: `npm test -- --run` → 216 Testdateien / 726 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Geänderte Skriptdateien bleiben unter 500 Zeilen: `src/components/Schlangenbereich.tsx` 481, `src/components/GegnerSchlangenListe.tsx` 189, neuer Test 84.

## Release / Smoke

- Feature-Commit/Push: `eebb2eb — M1l: Waldtanz-Schlangenpfad sichtbar machen` auf `origin/main`.
- Vercel Production: stable Alias `https://schlangentanz-v2.vercel.app` wurde bereitgestellt (`READY`).
- Standard-Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200.
- M1l-Browser-Smoke: `/` und `/game` HTTP 200; nach echter board-naher Startaktion erscheint eine Pfadreihe mit `schlangekarte__kartenreihe--pfad`, erster Ein-Karten-Schlange als `schlangekarte__karte--kopf schlangekarte__karte--schwanz`, sichtbarer Marke `Kopf & Schwanz`, ohne separate `Kopf`-/`Schwanz`-Duplikate, `::before`-Gradient-Verbindungslinie, sichtbare Karten-Transform und keine Console-/Page-Errors.

## Sichtbarer Spielwert

Die zentrale Waldtanz-Fläche wirkt stärker wie ein Brettspielobjekt: Schlangen haben nun Kopf, Körper und Schwanz statt anonymer Kartenchips. Neue Ein-Karten-Schlangen starten als kompakter `Kopf & Schwanz`, mehrteilige Schlangen entwickeln eine lesbare Richtung und Verbindungslinie. Dadurch wirkt das Bauen der Schlangen weniger wie Button-/Listenverwaltung und mehr wie ein physischer Kartentisch.

## Nächste mittlere Lücke

Als nächster sichtbarer Vertical bietet sich ein echter Mehrzug-/Aufgabenabschluss-Flow an: Aufgabe board-nah erkennen/beanspruchen und Endspurt-Fortschritt in einer bounded Playability-Sequenz beweisen, statt weitere reine Oberflächenmarkierungen zu stapeln.
