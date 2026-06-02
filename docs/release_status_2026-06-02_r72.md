# Release-Status R72 — Erweiterungssonderkarten im Materialbereich sichtbar

- Datum: 02.06.2026
- Ziel: Die benannten Erweiterungssonderkarten als sichtbaren Materialhinweis im UI-Materialbereich anzeigen, ohne die bestehende Kartenlogik oder den Basisspielstapel zu verändern.
- Ergebnis: `src/App.tsx` zeigt im Bereich `Material und Aufgaben` zusätzlich die Zeile `Erweiterungssonderkarten: 4 Schlangenhäutung, 1 Schlangenkorb des Glücks, 4 Comeback, 8 Risiko-Belohnung`.
- Tests: `src/App.r72.test.tsx` prüft die vollständige Anzeige; die bestehende Engine-Fabrik bleibt über den Barrel exportiert.
- Verifikation:
  - `npm test -- --run src/App.r72.test.tsx` ✅
  - `npm test -- --run` ✅ — 50 Testfiles, 295 Tests
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
- Hinweis: Die Erweiterungskarten werden nur sichtbar referenziert; das Basisspiel-Deck und die laufende Spiellogik bleiben unverändert.
