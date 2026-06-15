# Release-Status — 15.06.2026 — M1af Waldtanz-Schlangenkarten-Gesichter

## Status

Release vollständig auf der stabilen Production-Alias `https://schlangentanz-v2.vercel.app` verifiziert.

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Karten in eigenen und gegnerischen Schlangenpfaden werden als greifbare Mini-Spielkarten mit Eyebrow, Symbolfläche, Typzeile und Wertplakette dargestellt. Engine-Regeln, Aktionsausführung, Drag-and-drop, Sonderkarten-Ziele, Spielerrahmen, Lobby, Regeln und Sieger-Party bleiben unverändert.

## Umsetzung

- Neuer Komponentenbaustein `SchlangenPfadKarte` rendert die bisher doppelte eigene/gegnerische Kartenflächen-Logik zentral als `role="listitem"` mit unverändertem Karten-`aria-label`.
- `Schlangenbereich` und `GegnerSchlangenListe` behalten ihre board-nahen Sonderkartenbuttons als Kinder der Mini-Karten, ohne Button-in-Button-Problem.
- `App.css` ergänzt 2:3-Kartenfläche, 3px Dark-Forest-Border, Hard Shadow, Symbolgradienten pro Farbe/Sonderkarte und pillige Wertplaketten.
- Review-Fund zur späteren generischen `.schlangekarte__karte span`-Regel wurde test-first abgesichert und durch spezifische spätere Mini-Karten-Typografie-Regeln behoben.

## Verifikation

- RED: `npm test -- --run src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx` fiel initial wegen fehlender Mini-Karten-Klassen/Markup/CSS erwartungsgemäß fehl.
- Claude Code / `/simplify`: beide Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review: erstes Review fand den CSS-Kaskadenblocker; Re-Review nach Test/Fix: `BLOCKERS: None`.
- Targeted: `npm test -- --run src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx src/App.m1l_waldtanz_schlangenpfad.test.tsx src/App.f35_schlangen_kartenreihe.test.tsx src/App.r177_farbige_kartenflaechen.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m2g_farbenfusion_paarziel.test.tsx src/App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx` → 9 Testdateien / 18 Tests bestanden.
- Full Gates: `npm test -- --run` → 239 Testdateien / 774 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Zeilenbudget: `src/components/Schlangenbereich.tsx` 481, `src/components/GegnerSchlangenListe.tsx` 174, `src/components/SchlangenPfadKarte.tsx` 68, M1af-Test 70.

## Release

- Feature-Commit: `99d0565 — M1af: Schlangenkarten als Mini-Spielkarten zeigen`.
- Push: `main` nach `origin/main` erfolgreich.
- Deploy: Vercel Production `READY`, stabile Alias `https://schlangentanz-v2.vercel.app`.
- Generic Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200 sowie Kernregionen.
- M1af-Browser-Smoke: echte `/game`-Partie, spielbare Handkarte ausgewählt, Startkreis ausgeführt, neue Schlangenpfad-Mini-Karte sichtbar mit `Schlangenkarte`, Symbol `🌙`, `Farbkarte Violett`, `2 Punkte`, Klasse `schlangekarte__karte--spielkarte`, 3px Border, 2:3 Aspect-Ratio, Hard Shadow, Symbolgradient, pilliger Wertplakette, geschützter Typografie-Kaskade und ohne Console-/Page-Errors.

## Nächste mittlere Lücke

Weiter Richtung echtes Waldtanz-Spielgefühl: die Schlangenlichtung kann noch stärker als Spielfläche reagieren, z. B. mit einer mittelgroßen Sichtbarkeits-/Feedback-Vertical für entstehende Farbgruppen/Questfortschritt direkt auf der Schlangenreihe statt in Nebenlisten.
