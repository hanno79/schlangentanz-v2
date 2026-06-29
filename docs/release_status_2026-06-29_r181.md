# Release Status 2026-06-29 R181 — `geheimeAufgabe` Typ-Inkonsistenz

**Datum:** 29.06.2026
**Slice:** R181 — Engine-Korrektheit: `Spieler.geheimeAufgabe` non-nullable
**Klasse:** Engine-Spec-Korrektheits-Slice (P0-Blocker aus Hermes-Code-Review)
**Status:** Vollständig release-fertig (commit + push + deploy + smoke)

## Zusammenfassung

R181 räumt einen **echten P0-Engine-Inkonsistenz-Bug** aus dem Hermes-eigenen
Architektur-Review-Bericht ab. Vorher hatte `Spieler.geheimeAufgabe` drei
widersprüchliche Annahmen an fünf Stellen:

1. `types.ts` erlaubte `| null`
2. `state.ts` fing still mit `?? null` ab
3. `serialization.ts` Validation verwirft `null`
4. `serialization.ts:606` Cast `as AufgabenkarteInfo`
5. `useSpielLabels.ts` UI-Check `? ... : 'keine'`

Jetzt ist der Type **non-nullable**, die Factory wirft eine Exception bei
leerem Aufgabenstapel statt stille Inkonsistenz, die Validation ist vereinfacht,
der Type-Cast entfernt und der UI-Hook ohne defensive Null-Prüfung.

TypeScript garantiert die Spec-Korrektheit jetzt **compile-time** statt
**runtime**. Wenn jemand in Zukunft versucht, einen Spieler ohne geheime
Aufgabe anzulegen, schlägt der Typecheck fehl — kein Bug-Slip-through mehr.

## Warum dieser Engine-Slice (NICHT ein UI-Mikroslice)

Der `schlangentanz-workflow`-Skill definiert einen **Progress-Proxy-Failure-
Cron-Loop**-Guard. Die letzten 25+ Commits im Repo waren ausschließlich
CSS/UI-Mikroslices ohne Engine-Veränderung. Ein weiterer Stitch-Polish-Slice
hätte die Symptom-Bekämpfung verstärkt.

Stattdessen: **echte Engine-Arbeit** für einen echten P0-Blocker.

- **Spec-Treue**: `GAME_SPEC.md:434` ist Locked-Authority, "jeder Spieler hat
  genau eine geheime Aufgabenkarte"
- **Klein genug**: 8 Dateien, ~221 Zeilen Diff, 7 Tests
- **Reviewbar**: kein Engine-Split, keine neue Komponente, keine UI-Änderung
- **Playability-relevant**: schlägt ein Bug-Slip-through aus, der später beim
  Spielende zu Wertungs-Inkonsistenzen führen könnte

## RED → GREEN

1. `npx vitest run src/engine/__tests__/turn_state_r181_geheimeaufgabe_typecheck.test.ts`
   → TypeScript-Compile-Errors bei beiden Tests (2322, 18047) — RED bestätigt
2. Type + Factory + Validation + Cast + UI-Hook gefixt
3. Re-Run targeted: **7/7 Engine-Tests grün + 2/2 R50 UI-Tests grün**

## Gates

- `npm run typecheck` → grün
- `npm run lint` → grün
- `npm run check:test-lines` → grün (Test-Dateien < 500 Zeilen)
- `npm run build` → grün
- `git diff --check` → grün

## Full Suite

`npm test -- --run` → **33 failed | 344 passed (377 Testfiles)**,
**38 failed | 1343 passed (1381 Tests)**.

Pre-existing Failures via `git stash` + Re-Run verifiziert: **identisch 38
Failures / 33 Testfiles ohne R181-Patch**. Mein Slice fügt **+2 Testfiles** und
**+7 Tests grün** hinzu, ohne neue Failures zu erzeugen. **Net-Positive**.

Die 38 pre-existing Failures sind RED-Tests für neue UI-Slices (M1/M2/R180er/
R181-Schlangenfrass-Boardziel), die TDD-prozesskonform noch in Implementierung
sind — keine R181-Regression.

## Claude Code / `/simplify`

Claude Code bleibt durch den bekannten `401 Invalid authentication credentials`-
Auth-Blocker unbenutzbar. Der Slice wurde im manuellen Fallback umgesetzt
(RED-Tests → Spec-Recherche → GREEN → Gates), eine bewusste Abweichung vom
Standard-Workflow, die seit M6b-Finalisierung dokumentiert ist.

## Kimi-Code-CLI-Review

**REVIEWER=NONE** für diesen Slice. Watchdog-Output:

```json
{"reviewers":[
  {"name":"codex","status":"RATE_LIMITED","detail":"OAuth usage limit aktiv"},
  {"name":"kimi-cli","status":"RATE_LIMITED","detail":"403 permission_error: billing cycle quota"}
],"recommended":null,"all_blocked":true}
```

Slice wurde **lokal verifiziert** über targeted Tests + Full-Suite + Gates
+ `git stash`-Cross-Validation. Optional Re-Review als Second-Opinion wenn
Codex/Kimi-Quota wiederhergestellt ist — kein Muss-Gate.

## Production Deploy

- Commit: `ebbec0a — R181: geheimeAufgabe Typ-Inkonsistenz beheben` auf `main`
- Push: erfolgreich (`0a27d76..ebbec0a main -> main`)
- Deploy: `https://schlangentanz-v2-cl60mtaju-alfreds-projects-7e9df1b4.vercel.app`
  → Alias auf `https://schlangentanz-v2.vercel.app`
- Build-Zeit: 20s
- HTTP-Smoke: `/` → 200, `/game` → 200
- Engine-Logik (kein UI-Surface-Change): keine sichtbare Verhaltensänderung im
  Production-Browser; das ist beabsichtigt — der Slice räumt Drift auf, ohne
  das Spiel-Verhalten zu ändern

## Spielerische Wirkung

Keine direkte sichtbare Veränderung. Indirekt:

- TypeScript verhindert jetzt, dass ein zukünftiger Slice versehentlich einen
  Zustand mit fehlender geheimer Aufgabenkarte erzeugt (Compile-Fehler statt
  Runtime-Crash)
- Wenn `aufgabenStapel` jemals leer wird (z.B. durch einen Bug in der Aufgaben-
  Pool-Erzeugung), wirft die Engine jetzt sofort eine deutsche Fehlermeldung
  statt eine schwer diagnostizierbare UI-Inkonsistenz zu produzieren
- Die Aufgabenprüfung (Lila Riese, Gelber Schatz etc.) kann sich jetzt darauf
  verlassen, dass jede Spielerin eine geheime Aufgabe hat — robuster gegen
  Test-Fixture-Bugs

## Naechste Luecke

Aus dem Hermes-Code-Review-Bericht verbleibende P0/P1-Blocker, sortiert nach
Spielwert:

**P0 (Blocker für Engine-Korrektheit):**
1. ~~`geheimeAufgabe` Typ-Inkonsistenz~~ ✅ R181 erledigt
2. `pruefeLilaRiese()` — Review-Bericht behauptet Bug, R87-Test-Suite
   bestätigt Spec-Konformität ("längste violette Kette in eigener Schlange
   >= 3"). Aktuelle Implementation passt zur Spec. **Kein Bug.**
3. `window.__schlangentanzFixture` aus Production-Code entfernen — Test-Hook
   in `App.tsx:187-201`, sollte hinter `import.meta.env.DEV` oder in
   `src/test/utils.ts` (Review-Bericht P0 #3)
4. `berechneEndrundenSpieler()` deduplizieren — `turnState.ts:355` und
   `serialization.ts:205` (Review-Bericht P0 #4)

**P1 (Engine-Refactor):**
5. `turnState.ts` 1.577 Zeilen splitten (Review-Bericht P1 #5)
6. `legalActions.ts` Type-Guards pro Aktion (P1 #6)
7. `App.tsx` zerlegen in `useGameState` Hook + `GameBoard` + `GameSidebar` (P1 #7)

**Empfehlung naechster Slice:** R182 — Engine-Helper `berechneEndrundenSpieler`
deduplizieren (klein, ~50 Zeilen Diff, 4-6 Tests). Setzt den
Engine-Korrektheits-Trend fort ohne UI-Aufwand.

Alternative: M8 — Stitch-Lobby-Finalisierung (Sonniges-Nest-Hero-Finalisierung
analog zu M7a/M6a-Familie). Großer visueller Spielwert, kein Engine-Touch.

Beide Richtungen passen zum Workflow; Engine-Korrektheits-Trend vermeidet den
Progress-Proxy-Failure-Loop.

## Implementation Notes

Der Slice wurde über den **CRON-AUTONOMEN-PFAD** umgesetzt:
1. Stand-Reconciliation: `git status`, HEAD, untracked Dateien
2. Review-Bericht gelesen, P0-Inkonsistenzen identifiziert
3. Spec (`GAME_SPEC.md:434`) und existierende R87-Test-Suite geprüft
4. RED-Tests geschrieben (TypeScript-Compile-Garantie-Test als sauberster RED)
5. GREEN: Type non-nullable + Factory-Exception + Validation vereinfacht +
   Cast entfernt + UI-Hook vereinfacht
6. Pre-existing-Test-Validierung via `git stash` + Re-Run
7. Gates + Build + Slice-Plan + Release-Status + Commit + Push + Deploy + Smoke

Cost of finishing: ~18 Tool-Calls (Stand-Reconciliation + RED + GREEN + Tests +
Gates + Doku + Commit + Push + Deploy + Smoke). Cost of restarting: 30+ Tool-Calls.
