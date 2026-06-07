# Release-Status R97 – Schlangentanz-Aufgabe vorbereitet

Author: rahn
Datum: 07.06.2026
Version: R97
Beschreibung: Engine-Slice für die Aufgabenprüfung „Schlangentanz“ über Schlangenhäutung-Dreiergruppen-Historie.

## Umfang

- Aufgabe `aufgabe-11` („Schlangentanz“) ist in der Aufgabenprüfung registriert.
- Neuer Spieler-Historienwert `schlangenhaeutungDreiergruppen` zählt durch Schlangenhäutung neu gebildete Dreiergruppen.
- Neue Spielstände initialisieren die Historie mit `0`.
- Alte serialisierte Spielstände ohne Historienfeld werden auf `0` migriert.
- Ungültige Historienwerte werden bei der Deserialisierung verworfen.

## Bewusste Abgrenzung

- Die eigentliche Engine-Aktion `Schlangenhäutung` bleibt für einen späteren kleinen Slice offen.
- R97 speichert und prüft nur den für die Aufgabe benötigten Zähler.

## Verifikation

- `npm test -- --run src/engine/__tests__/turn_state_r97_schlangentanz.test.ts`
  - Ergebnis: 8 Tests bestanden.
- `npm run typecheck && npm test -- --run && npm run check:test-lines`
  - Ergebnis: Typecheck bestanden.
  - Ergebnis: 108 Testdateien / 573 Tests bestanden.
  - Ergebnis: Alle Testdateien bleiben unter 500 Zeilen.

## Geänderte Bereiche

- `src/engine/types.ts`
- `src/engine/state.ts`
- `src/engine/aufgabenPruefung.ts`
- `src/engine/serialization.ts`
- `src/engine/__tests__/testHelpers.ts`
- `src/engine/__tests__/turn_state_r97_schlangentanz.test.ts`
