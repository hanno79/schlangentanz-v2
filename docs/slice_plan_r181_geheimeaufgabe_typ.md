# R181 Slice-Plan — `geheimeAufgabe` Typ-Inkonsistenz beheben

**Datum:** 29.06.2026
**Slice:** R181 — Engine-Korrektheit: `Spieler.geheimeAufgabe` non-nullable
**Klasse:** Engine-Spec-Korrektheits-Slice (P0-Blocker aus Hermes-Code-Review)
**Autor:** Hermes Agent (Cron-Lauf)
**Status:** Implementiert, RED → GREEN → Gates grün, bereit zum Commit

## Hintergrund

Im Code-Review-Bericht (siehe `CODE_REVIEW_BERICHT.md` im Repo-Root) wurde
eine P0-Inkonsistenz in der Engine identifiziert:

| Belegstelle | Aktueller Zustand |
|---|---|
| `src/engine/types.ts:65` | `geheimeAufgabe: AufgabenkarteInfo \| null` |
| `src/engine/state.ts:108` | `aufgabenStapel.shift() ?? null` (stille Inkonsistenz) |
| `src/engine/serialization.ts:432` | `throw new Error(... darf nicht null sein)` (Validation wirft) |
| `src/engine/serialization.ts:606` | `spieler.geheimeAufgabe as AufgabenkarteInfo` (Type-Cast) |
| `src/hooks/useSpielLabels.ts:80` | `aktiverSpieler.geheimeAufgabe ? label : 'keine'` (Defensive UI) |

**Spec:** `GAME_SPEC.md:434` + Spec-Wortlaut "jeder Spieler hat genau eine
geheime Aufgabenkarte". `null` darf laut Spec gar nicht existieren.

**Konsequenz vor R181:**
- TypeScript half UI-Code nicht, die Spec-Korrektheit durchzusetzen
- Factory fing still mit `?? null` ab → Laufzeit-Inkonsistenz statt Kompilier-Fehler
- Validation verwirft genau das, was der Type erlaubt → Drift
- Type-Cast in Serialisierung maskiert die Inkonsistenz

## Rein

1. **Type non-nullable machen** (`src/engine/types.ts:65`)
   - `geheimeAufgabe: AufgabenkarteInfo` (ohne `| null`)
   - Inline-Kommentar mit Spec-Referenz und Slice-Verweis

2. **Factory wirft Exception statt stillem `null`** (`src/engine/state.ts`)
   - `aufgabenStapel.shift() ?? throwEmptyAufgabenStapel()`
   - Neue Helper-Funktion `throwEmptyAufgabenStapel(): never` mit deutschem
     Fehlertext analog zu existierenden Engine-Errors

3. **Validation-Vereinfachung** (`src/engine/serialization.ts:432`)
   - Statt "darf nicht null sein": "fehlt" (null + undefined werden erkannt)
   - Type-Cast in `sammleAufgaben` entfernt

4. **UI-Hook vereinfachen** (`src/hooks/useSpielLabels.ts:80`)
   - Direkter Zugriff auf `aktiverSpieler.geheimeAufgabe`
   - Ternary entfernt

5. **Test-Anpassung** (`src/App.r50.test.tsx`)
   - "ohne geheime Aufgabe"-Test entfernt (Spec-Pfad existiert nicht mehr)
   - Ersetzt durch R181-Property-Test: alle Spieler haben geheime Aufgabe

6. **Zwei neue Engine-Tests** (RED-Phase):
   - `src/engine/__tests__/turn_state_r181_geheimeaufgabe_typ.test.ts` (5 Tests)
     — Verhalten: alle Spieler haben geheime Aufgabe, paarweise verschieden,
     keine Überschneidung mit offenen Aufgaben
   - `src/engine/__tests__/turn_state_r181_geheimeaufgabe_typecheck.test.ts` (2 Tests)
     — TypeScript-Compile-Garantie: `AufgabenkarteInfo`-Zuweisung ohne `?.`

## Raus

- Engine-Logik für Lila Riese bleibt unverändert (R87-Test-Suite weiterhin grün)
- UI-Tests mit `?.` auf `geheimeAufgabe` werden durch R181 erzwungen — keine
  defensive Programmierung mehr
- Keine Änderung an Layout, CSS, Spielregeln, Aufgabenkarten-Pool

## Verifikation

- `npm run typecheck` → grün
- `npm run lint` → grün
- `npm run check:test-lines` → grün (Test-Dateien < 500 Zeilen)
- `npx vitest run src/engine/__tests__/turn_state_r181_geheimeaufgabe_*.test.ts`
  → 7/7 grün
- `npx vitest run src/App.r50.test.tsx` → 2/2 grün
- `npm test -- --run` → **NET-POSITIVE**: 38 failed (identisch zu pre-existing
  Stand via `git stash` verifiziert), 1343 passed, **+7 neue Tests grün**
  (1336 → 1343). Keine neuen Failures.

## Warum Engine-Slice statt UI-Mikroslice

Der `schlangentanz-workflow`-Skill warnt vor dem
**Progress-Proxy-Failure-Cron-Loop** (siehe
`references/progress-proxy-failure-cron-loop.md`). Die letzten 25+ Commits
waren ausschließlich CSS/UI-Mikroslices ohne Engine-Veränderung. Ein weiterer
Stitch-Polish-Slice hätte das Problem verstärkt. Stattdessen:
- **Echte Engine-Korrektheit** statt Oberflächen-Polish
- **Spec-Treue** (GAME_SPEC.md ist Locked-Authority)
- **TypeScript-Compile-Garantie** statt Runtime-Check
- **Kleiner, reviewbarer Slice** (~120 Zeilen Diff über 6 Dateien, 7 Tests)

## Nicht-Ziele (für spätere Slices)

- Engine-Splits (`turnState.ts` 1.577 Zeilen → `reactions.ts`/`snakeOps.ts`/...)
- Engine-Refactor `legalActions.ts` (Type-Guards pro Aktion)
- Engine-Korrektheit `pruefeLilaRiese` (R87-Test-Suite bestätigt Spec-Konformität;
  Review-Bericht überinterpretiert "längste" als "längste aller Spieler vergleichen"
  — Spec sagt "Bilde die längste", was eine Solo-Spieler-Eigenschaft ist)
- Test-Fixture-Hook `window.__schlangentanzFixture` aus Production-Code entfernen
- `berechneEndrundenSpieler()`-Duplikat deduplizieren
