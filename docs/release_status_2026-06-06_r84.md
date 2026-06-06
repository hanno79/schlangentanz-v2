# Release Status 2026-06-06 R84 — Aufgabenprüfung aus turnState extrahieren

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R84-Refactor-Slice zur Auslagerung der Aufgabenprüfungslogik aus der Zugphasen-State-Machine.

## Scope

- Aufgabenprüfungsregeln aus `src/engine/turnState.ts` in `src/engine/aufgabenPruefung.ts` ausgelagert.
- `beendeAufgabenpruefung` bleibt in der State-Machine und delegiert an das neue Aufgabenprüfungsmodul.
- Keine neue Spielregel ergänzt; R82/R83-Aufgabenverhalten bleibt unverändert.
- Neuer Architekturtest schützt die Modulgrenze und verhindert, dass konkrete Aufgabenprüfungsregeln wieder in `turnState.ts` landen.

## TDD-/Review-Evidence

- RED: `npm test -- --run tests/architecture_r84.test.ts` schlug erwartungsgemäß fehl, weil das neue Aufgabenprüfungsmodul noch fehlte und `turnState.ts` die konkreten Aufgabenprüfungsregeln enthielt.
- GREEN: Aufgabenprüfungslogik wurde in `src/engine/aufgabenPruefung.ts` extrahiert; R84-Architekturtest und R82/R83-Aufgabentests wurden grün.
- Claude `/simplify`: ausgeführt; sichere Vereinfachungen übernommen, u. a. stabilere Verantwortungsgrenze für `zugphase: 'Zugabschluss'` im State-Machine-Caller.
- Codex Review: `BLOCKERS: Keine`.
- Codex Non-Blocker behandelt: Architekturtest prüft nicht mehr private Funktionsnamen, sondern Exporte und abgedeckte Aufgaben-IDs.

## Verifikation lokal

- Targeted: `npm test -- --run tests/architecture_r84.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts` → 2 Testfiles / 16 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 96 Testfiles / 487 Tests bestanden.

## Release

- Code-Commit/Push: `a17aa66 — R84 Aufgabenpruefung aus turnState extrahieren` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2.vercel.app` bereitgestellt; Vercel-Alias zeigt auf das Production-Deployment `https://schlangentanz-v2-akh6kmlyl-alfreds-projects-7e9df1b4.vercel.app`.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors; `Schlangentanz` ist sichtbar.
- First-Turn-Smoke `/game`: empfohlene Aktion `Neue Schlange starten mit Karte rot-13` ausgeführt; DOM-Zustand geändert; plausibles Zug-/Feedbacksignal gefunden.

## Offene Hinweise

- R84 ist bewusst ein Refactor-Slice. Der nächste kleine Feature-Slice kann auf dem neuen Modul aufsetzen, z. B. R85 `Farbkombination`.
- `turnState.ts` bleibt insgesamt groß; R84 reduziert nur den Aufgabenprüfungsbereich und schafft eine saubere Erweiterungsstelle.
