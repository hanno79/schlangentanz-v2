# Release-Status 15.06.2026 — M2k Farbendieb-Beutekorb

## Status

Release abgeschlossen auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M2k ist ein mittlerer, sichtbarer Board-Interaktions-Vertical im `M1/M2 Waldtanz Game Board`: Eine ausgewählte `Farbendieb`-Karte erzeugt auf der gegnerischen Beutekarte einen körperlichen `Farbendieb-Beutekorb` mit Zielschlange und Einfügeplätzen. Die Engine-Aktion bleibt Quelle der Wahrheit; die bisherige generische Positionstext-Buttonfläche wurde durch ein Spielobjekt ersetzt.

## Umsetzung

- Neuer Komponenten-Slice: `src/components/FarbendiebBeutekorb.tsx`.
- `src/components/GegnerSchlangenListe.tsx` rendert den Beutekorb auf passenden gegnerischen Zielkarten.
- `src/App.css` ergänzt Stitch-Spielobjekt-Stil: 3px Dark-Forest-Border, 2rem-Radius, Sunny/Orange-Beuteverlauf, Hard Shadow und pillförmige Einfügeplätze.
- `src/App.m2k_farbendieb_beutekorb.test.tsx` beweist sichtbaren Beutekorb, eindeutige Einfügeplatz-Buttons und echte Engine-Ausführung.
- `src/App.r183_farbendieb_boardziel.test.tsx` bleibt als Nachbarschaftsregression für Farbendieb-Boardziel erhalten und wurde auf den Beutekorb-Vertrag aktualisiert.

## Verifikation

- RED: `npm test -- --run src/App.m2k_farbendieb_beutekorb.test.tsx` scheiterte initial, weil Beutekorb und CSS-Vertrag fehlten.
- Targeted/Adjacent: `npm test -- --run src/App.m2k_farbendieb_beutekorb.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.m1aj_magiekreis_sonderzauber.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 4 Testdateien / 9 Tests bestanden.
- Codex Review: initial `BLOCKERS: None`; Non-Blocker zum semantisch wirkungslosen inneren `aria-label` wurde behoben. Re-Review: `BLOCKERS: None`, keine neuen Non-Blocker.
- Full Gates: `npm test -- --run` → 263 Testdateien / 825 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Build-Artefakte: `dist/assets/index-Bn_s4cz8.css`, `dist/assets/index-B0pXrfhW.js`.

## Deploy und Smoke

- Feature-Commit: `e315bbf — M2k: Farbendieb als Beutekorb zeigen`.
- Production-Deploy: Vercel `READY`, stabile Alias https://schlangentanz-v2.vercel.app.
- Generic Production-Smoke: `/` und `/game` HTTP 200, Kernregionen sichtbar, M1as/M1aw/M1ax/M1ay/M1ba/M1bb-Verträge weiter grün, keine Console-/Page-Errors.
- Slice-Smoke: Bounded Production-Flow auf `/game` startete eine eigene Schlange, spielte den KI-Zug zurück zum Menschen, wählte `farbendieb-04` und bestätigte den Beutekorb auf `braun-12`: `Farbendieb-Beutekorb mit Karte farbendieb-04: braun-12 in schlange-spieler-1-1 an Platz 1 legen`; Beutekorb sichtbar mit `Beutekarte braun-12`, Zielschlange, zwei Einfügeplätzen, 3px Border, chunky Radius und Hard Shadow.

## Nächste mittlere Lücke

Weiter Richtung echtes Spielgefühl: Die nächste sinnvolle mittlere Lücke ist ein weiterer spielwertiger Board-Interaktions-Vertical, z. B. Schlangenblockade als körperliches Sperrholz/Blockade-Objekt auf gegnerischen Schlangen oder eine zusammenhängende Sonderkarten-Zielhilfe, die die bereits vorhandenen Beutekorb/Schutzschild/Frass/Fusion-Objekte visuell stärker als Zauberwerkzeuge bündelt — ohne neue Engine-Regeln oder A11y-Mikroslice.
