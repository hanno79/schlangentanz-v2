# Playability Gate Evidence — R50 Geheime Aufgabe

Datum: 01.06.2026

- Scope: UI bindet nur `aktiverSpieler.geheimeAufgabe` im Bereich `Aktiver Spieler`; keine Engine-, Regel-, Scoring- oder Turn-Logik.
- RED: `npm test -- --run src/App.r50.test.tsx` schlug korrekt wegen fehlender `Geheime Aufgabe:`-Anzeige fehl.
- GREEN/Simplify: `src/App.tsx` zeigt `Geheime Aufgabe: Name (Punkte): Bedingung` oder `Geheime Aufgabe: keine`; `/simplify` extrahierte nur `aufgabeLabel`, zweiter Lauf ohne Änderungen.
- Tests: targeted R50 → 2 Tests; full suite → 30 Testfiles / 265 Tests; Typecheck, Lint, Build und `git diff --check` grün.
- Codex Review: erster NON-BLOCKER zum fehlenden Leerzustand-Test wurde gehärtet; Re-Review `BLOCKERS: None`, `NON-BLOCKERS: None`.
- Production: Deploy `dpl_CTK8QoXNGxtLZ2mB14K3TiQFp8rv`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
- Smoke: `Geheime Aufgabe: Farbenpracht (8 Punkte): ...` sichtbar; keine Console-/Page-/Request-Fehler.
