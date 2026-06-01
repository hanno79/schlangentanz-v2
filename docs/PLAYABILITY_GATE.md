# Playability Gate

A route loading successfully is not enough. A green smoke test is not enough.

## Automated gates

- [ ] Unit tests pass
- [ ] Rule-contract tests pass
- [ ] Invalid-action tests pass
- [ ] State-machine tests pass
- [ ] Integration tests pass
- [ ] Playwright E2E gameplay scenarios pass
- [ ] Typecheck passes
- [ ] Production build passes

## Live production gates

- [ ] Production URL returns HTTP 200
- [ ] Game route loads without console errors
- [ ] New game can be started
- [ ] Legal actions are available only when legal
- [ ] Illegal actions are blocked with clear feedback
- [ ] A complete representative game can be played to end condition
- [ ] Scoring/end state matches spec

## Human gate

- [ ] User confirms the game is actually playable according to the locked spec

## Evidence — 01.06.2026 R20 Pflicht-Abwurf als Legal Action

- [x] Unit/Rule/State/UI tests: `npm test -- --run` → 13 Testfiles, 218 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Production build: `npm run build` bestanden.
- [x] Diff hygiene: `git diff --check` bestanden.
- [x] Codex Review: keine Blocker nach R19-Pflicht-Abwurf-Fix.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.
- [ ] Legal actions are available only when legal — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R21 Pflicht-Abwurf-UI-Binding

- [x] RED: `src/App.test.tsx -t 'R21 UI-Pflicht-Abwurf'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 219 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R22 UI-Handkartenanzeige

- [x] RED: `src/App.test.tsx -t 'R22 UI-Handkartenanzeige'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 220 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R23 UI-Zugpflichtenanzeige

- [x] RED: `src/App.test.tsx -t 'R23 UI-Zugpflichtenanzeige'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 221 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; Nachzug: `MAX_KARTEN_PRO_ZUG` ist noch nicht vollständig Engine-Single-Source-of-Truth.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R24 MAX_KARTEN_PRO_ZUG Single-Source-of-Truth

- [x] Guard-Test: Serialisierung akzeptiert `MAX_KARTEN_PRO_ZUG` und lehnt `MAX_KARTEN_PRO_ZUG + 1` ab.
- [x] Engine-Refactor: `turnState`, `legalActions` und `serialization` nutzen `MAX_KARTEN_PRO_ZUG` statt harter Maximalwert-Literale.
- [x] Targeted: `npm test -- --run src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/serialization_r19.test.ts src/App.test.tsx` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 223 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Literal-Scan: keine verbleibenden relevanten `gespielteKarten`/`ausgespielteKarten`-Maximalwert-Literale gefunden.
- [x] Codex Review: keine Blocker, keine Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R25 UI-Ausspielphase beenden

- [x] RED: `src/App.test.tsx -t 'R25 UI-Ausspielphase beenden'` schlug vor Implementierung fehl, weil Zugphase/Button noch fehlten.
- [x] Codex-Blocker reproduziert: zusätzlicher RED-Test belegt, dass `Ausspielphase beenden` auch bei weiterer legaler Aktion nach 1 gespielten Karte sichtbar sein muss.
- [x] GREEN: UI rendert `Zugphase`, zeigt `Ausspielphase beenden` ab `gespielteKarten > 0` und ruft `beendeAusspielphase(z)` auf.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 225 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review/Re-Review: initialer Button-Gating-Blocker behoben; final keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R26 UI-Aufgabenprüfung beenden

- [x] Baseline: `HEAD == origin/main` auf `29b3dcacdeb64943a857e538d6b77ee5d988b4bd`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R26 UI-Aufgabenprüfung beenden'` schlug erwartungsgemäß fehl, weil der Button `Aufgabenprüfung beenden` fehlte.
- [x] GREEN: UI rendert `Aufgabenprüfung beenden` nur bei `zugphase === 'Aufgabenpruefung'` und ruft `beendeAufgabenpruefung(z, { aufgabenGeprueft: true })` auf.
- [x] R25-Regression abgesichert: In `Aufgabenpruefung` ist `Ausspielphase beenden` nicht sichtbar, stattdessen der neue R26-Button.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 226 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; keine actionable Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R27 UI-Zug beenden

- [x] Baseline: `HEAD == origin/main` auf `4662e5489b321fb58438363b7606c6088281727d`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R27 UI-Zug beenden'` schlug erwartungsgemäß fehl, weil der Button `Zug beenden` im `Zugabschluss` fehlte.
- [x] GREEN: UI rendert `Zug beenden` nur bei `zugphase === 'Zugabschluss'` und ruft `beendeZug(z, { pflichtenErfuellt: true })` auf.
- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Nachziehphase`, `Aktiver Spieler: spieler-2`, `Gespielte Karten: 0/2`.
- [x] R26-Regression abgesichert: In `Zugabschluss` ist `Aufgabenprüfung beenden` nicht sichtbar, stattdessen der neue R27-Button.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 227 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; keine Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R28 UI-Ausspielphase für nächsten Spieler starten

- [x] Baseline: `HEAD == origin/main` auf `eeecfbfefdabde1679bb783a88da647ad94ed48e`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R28 UI-Ausspielphase für nächsten Spieler starten'` schlug erwartungsgemäß fehl, weil `Ausspielphase starten` in der `Nachziehphase` fehlte.
- [x] GREEN: UI rendert `Ausspielphase starten` nur bei `zugphase === 'Nachziehphase'` und ruft `starteAusspielphase(z)` auf.
- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Ausspielphase`, `Aktiver Spieler: spieler-2`, 5 legale Aktionsbuttons, u.a. `Neue Schlange starten mit Karte blau-02`.
- [x] R27-Regression abgesichert: Nach `Zug beenden` ist Spieler 2 in `Nachziehphase` und der neue Startbutton sichtbar.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 228 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; Non-Blockers nur Verifikationsnotizen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R29 Pflicht-Nachziehen beim Zugwechsel

- [x] Nutzerfund reproduziert: Screenshot zeigte `spieler-1` in `Nachziehphase` mit nur `blau-03, blau-05, blau-07, blau-09`; die nachgezogene fünfte Karte fehlte sichtbar.
- [x] Root Cause: `beendeZug(...)` wechselte zum nächsten Spieler in `Nachziehphase`, zog aber noch nicht auf 5 Karten auf; Nachziehen passierte erst später in `starteAusspielphase(...)`.
- [x] RED Engine: `turn_state_r29.test.ts` erwartet, dass `beendeZug(...)` den nächsten aktiven Spieler beim Zugwechsel sichtbar auf 5 Karten auffüllt und den Nachziehstapel reduziert.
- [x] RED UI: `App.test.tsx` bildet zwei Züge nach und erwartet bei Spieler 1 zu Beginn des zweiten Zuges `Handkarten: blau-03, blau-05, blau-07, blau-09, blau-11`.
- [x] GREEN: `zieheAufMindesthand(...)` zentralisiert Pflicht-Nachziehen; `beendeZug(...)` nutzt es für den nächsten aktiven Spieler, `starteAusspielphase(...)` behält den Legacy-/Direktzustand-Sicherheitszug.
- [x] `/simplify`: Draw-Logik dedupliziert; keine zusätzliche Regel eingeführt.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_r29.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` → 69 Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 230 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden Mutation, Double-Draw, Endspurt-Auslöser, Endrundenverhalten und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R30 UI-Wertungsanzeige

- [x] Scope: Vorhandene Engine-Wertung (`berechneSpielzustandGesamtwertung`) in der UI sichtbar machen; keine neue Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` schlug erwartungsgemäß fehl, weil Wertungszeilen fehlten.
- [x] GREEN: `src/App.tsx` importiert `berechneSpielzustandGesamtwertung`, berechnet die Wertung aus `zustand` und rendert `Wertung {spielerId}: {gesamtPunkte} Punkte` für alle Spieler.
- [x] Test-Härtung: Reihenfolge der Spielerwertung wird explizit geprüft; Wertung aktualisiert nach einer Engine-Aktion sichtbar von `0 Punkte` auf `3 Punkte`.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` → 2 R30-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 232 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden Engine-only-Wertung, Aktualisierung nach UI-Aktion, stabile Reihenfolge, Hook-Dependency, Fixture-Eigentum und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R31 UI-Gewinneranzeige

- [x] Scope: Vorhandene Engine-Gewinnerermittlung (`berechneGewinner`) in der UI sichtbar machen; keine neue Gewinner- oder Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R31 UI-Gewinneranzeige'` schlug erwartungsgemäß fehl, weil bei `Spielende` keine Gewinnerzeile gerendert wurde.
- [x] GREEN: `src/App.tsx` importiert `berechneGewinner`, berechnet Gewinner nur bei `zustand.zugphase === 'Spielende'` und rendert `Gewinner {spielerId}: {gesamtPunkte} Punkte` für die komplette Engine-Gewinnerliste.
- [x] Test-Härtung: Vor Spielende wird keine Gewinneranzeige gerendert; Gleichstand rendert alle Gewinner in stabiler Engine-Reihenfolge.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R31 UI-Gewinneranzeige'` → 3 R31-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 235 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden Engine-only-Gewinnerermittlung, Spielende-Gating, Gleichstand, stabile Reihenfolge, Hook-Dependency, Fixture-Eigentum und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R32 UI-Spielphase und Endrunde

- [x] Scope: Vorhandene Engine-State-Felder `spielphase` und `endrunde` in der UI sichtbar machen; keine Endrunden- oder Spielende-Regel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R32 UI-Spielphase und Endrunde'` schlug erwartungsgemäß fehl, weil Spielphase und Endrundenstatus in der UI fehlten.
- [x] GREEN: `src/App.tsx` rendert `Spielphase`, Endrunden-Auslöser und verbleibende Endrunden-Spieler direkt aus `zustand`.
- [x] Test-Härtung: Normalzustand ohne Endrunden-Auslöser, Endspurt-Auslöser mit Reihenfolge, Aktualisierung nach `Zug beenden` und Spielende mit `Verbleibende Endrunde: keine` sind geprüft.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R32 UI-Spielphase und Endrunde'` → 4 R32-Tests bestanden.
- [x] UI + Endrunde targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state_endrunde.test.ts` → 27 Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 239 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, Index-zu-Spieler-ID-Mapping, stale Display nach Zugabschluss, Normal/Endspurt/Beendet-Pfade, Fixtures und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R33 UI-Material- und Aufgabenübersicht

- [x] Scope: Vorhandene Engine-State-Felder `nachziehstapel.length`, `aufgabenStapel.length` und `offeneAufgaben[].name` in der UI sichtbar machen; keine Deck-, Zieh- oder Aufgabenregel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R33 UI-Material- und Aufgabenübersicht'` schlug erwartungsgemäß fehl, weil Material-/Aufgabenübersicht in der UI fehlte.
- [x] GREEN: `src/App.tsx` rendert `Nachziehstapel: X Karten`, `Aufgabenstapel: X Karten` und `Offene Aufgaben: ...` direkt aus `zustand` mit Fallback `keine`.
- [x] Test-Härtung: Nachziehstapel-Aktualisierung nach Engine-`beendeZug(...)` mit realem Nachziehen geprüft; Codex-Blocker zu hardcodierten `100/99`-Zählern behoben, erwartete Werte werden aus Engine-State abgeleitet.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R33 UI-Material- und Aufgabenübersicht'` → 2 R33-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 241 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Re-Review: keine Blocker; geprüft wurden reine State-Anzeige, stale Display nach `beendeZug`, keine hardcodierten Deck-Zähler, Default-UI, Imports/Typecheck und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R34 UI-Spielerübersicht

- [x] Scope: Vorhandene Engine-Spielerdaten (`id`, `name`, `steuerung`, `hand.length`, `schlangen.length`) für alle Spieler sichtbar machen; keine neue Spieler-, KI-, Zug- oder Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R34 UI-Spielerübersicht'` schlug erwartungsgemäß fehl, weil keine Spielerübersicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert alle `zustand.spieler` als `Spielerübersicht ...` direkt aus dem Engine-State.
- [x] Test-Härtung: Vollständige Collection-Länge wird geprüft; Anzeige aktualisiert nach Engine-Aktion `NeueSchlangeStarten` von 5/0 auf 4/1 für Spieler 1.
- [x] `/simplify`: aggressiv entfernte Aktualisierungsprüfung wurde verworfen/restauriert, weil State-Display-Slices Refresh-Coverage benötigen.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R34 UI-Spielerübersicht'` → 2 R34-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 243 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-Collection, Refresh nach Engine-Aktion, Fixture-Eigentum, Default-UI, Imports/Typecheck und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R35 UI-Spieler-Schlangenübersicht

- [x] Scope: Vorhandene Engine-Schlangen je Spieler (`zustand.spieler[].schlangen`) für alle Spieler sichtbar machen; keine neue Schlangen-, Spieler-, Zug- oder Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.r35.test.tsx` schlug erwartungsgemäß fehl, weil keine Spieler-Schlangenübersicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert für jeden Spieler `Schlangenübersicht ...` mit `keine` oder allen Schlangen in Engine-Reihenfolge.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r35.test.tsx`, damit `src/App.test.tsx` unter 500 Zeilen bleibt; vollständige Spieler-Collection und Refresh nach `NeueSchlangeStarten` geprüft.
- [x] `/simplify`: Header wurde wegen Projektregel 8 wiederhergestellt; Post-Action-Refresh-Coverage blieb erhalten.
- [x] Targeted: `npm test -- --run src/App.r35.test.tsx` → 2 R35-Tests bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx` → 28 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 15 Testfiles, 245 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-Collection, alle Schlangen je Spieler, Refresh nach Engine-Aktion, neue untracked Testdatei, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R36 UI-Schlangenzustände

- [x] Scope: Vorhandene Engine-Schlangenzustände (`zustand.spieler[].schlangen[].zustand`) sichtbar machen; keine neue Schlangen-, Blockier-, Schutz-, Zug- oder Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.r36.test.tsx` schlug erwartungsgemäß fehl, weil keine Schlangenzustand-Zeilen gerendert wurden.
- [x] GREEN: `src/App.tsx` rendert für jede vorhandene Schlange `Schlangenzustand {spieler.id}/{schlange.id}: {schlange.zustand}` direkt aus dem Engine-State.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r36.test.tsx`; Fixture nutzt Karten von Spieler 1 und entfernt sie aus der Hand; alle drei Engine-Zustände (`aktiv`, `blockiert`, `geschuetzt`) werden geprüft.
- [x] `/simplify`: keine Änderungen; Header und Post-Action-Refresh-Coverage blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r36.test.tsx` → 2 R36-Tests bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx` → 30 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 16 Testfiles, 247 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-/Schlangen-Collection, keine Zeilen für Spieler ohne Schlangen, R35-Textvertrag, realistische Fixture-Ownership, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R37 UI-Kartenarten-Zähler

- [x] Scope: Vorhandene Engine-Zugpflichten-Zähler (`zustand.zugpflichten.gespielteFarbkarten` und `gespielteSonderkarten`) sichtbar machen; keine neue Kartenart-, Zuglimit-, Phasen-, Aktions-, Scoring- oder Validierungsregel in React.
- [x] RED: `npm test -- --run src/App.r37.test.tsx` schlug erwartungsgemäß fehl, weil keine Kartenarten-Zähler-Zeile gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Gespielte Kartenarten: {gespielteFarbkarten} Farbkarten, {gespielteSonderkarten} Sonderkarten` direkt aus dem Engine-State.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r37.test.tsx`; direkter Fixture-Zähler ist intern konsistent (`2 = 1 + 1`); Post-Action-Refresh über Engine-Aktion geprüft.
- [x] `/simplify`: Testfixture vereinfacht; Header und Post-Action-Refresh-Coverage blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r37.test.tsx` → 2 R37-Tests bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx` → 32 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 17 Testfiles, 249 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine versteckte UI-Regellogik, Refresh nach Engine-Aktion, R34/R35/R36-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R38 UI-Ablagestapelgröße

- [x] Scope: Vorhandene Engine-Ablagestapelgröße (`zustand.ablagestapel.length`) immer sichtbar machen; keine neue Abwurf-, Material-, Phasen-, Aktions-, Scoring- oder Validierungsregel in React.
- [x] RED: `npm test -- --run src/App.r38.test.tsx` schlug erwartungsgemäß fehl, weil keine Ablagestapelgrößen-Zeile gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Ablagestapelgröße: {zustand.ablagestapel.length} Karten` direkt aus dem Engine-State und behält die vorhandene Detailzeile `Ablagestapel: ...` für nicht-leere Stapel bei.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r38.test.tsx`; Fixture entfernt die verwendete Sonderkarte aus dem Nachziehstapel; Post-Action-Refresh nach Engine-Pflicht-Abwurf geprüft.
- [x] `/simplify`: Vorschlag zur Singular-/Plural-Änderung verworfen, um den stabilen Textvertrag `N Karten` beizubehalten.
- [x] Targeted: `npm test -- --run src/App.r38.test.tsx` → 2 R38-Tests bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx` → 34 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 18 Testfiles, 251 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, Erhalt der Ablagestapel-Detailzeile, Refresh nach Pflicht-Abwurf, Fixture-Eigentum, R34/R35/R36/R37-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R39 UI-erfüllte Aufgaben

- [x] Scope: Vorhandene Engine-Spieleraufgaben (`spieler.erfuellteAufgaben`) pro Spieler sichtbar machen; keine neue Aufgabenprüfung, Scoring-, Phasen-, Aktions- oder Validierungsregel in React.
- [x] RED: `npm test -- --run src/App.r39.test.tsx` schlug erwartungsgemäß fehl, weil keine Zeile `Erfüllte Aufgaben ...` gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert pro Spieler `Erfüllte Aufgaben {spieler.id}: ...` direkt aus `spieler.erfuellteAufgaben`; leere Listen werden als `keine` angezeigt.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r39.test.tsx`; Test prüft alle Spieler-Zeilen und dynamisch aus dem Engine-Fixture abgeleitete Aufgaben-Texte.
- [x] `/simplify`: Testfixture robuster gemacht; Header und stabiler Textvertrag blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r39.test.tsx` → 1 R39-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx` → 35 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 19 Testfiles, 252 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine versteckte Aufgaben-/Scoringlogik, kein `geheimeAufgabe`-Leak, vollständige Spieler-Collection, R34/R35/R36/R37/R38-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R40 UI-offene Aufgabenpunkte

- [x] Scope: Vorhandene Engine-Felder `zustand.offeneAufgaben[].name` und `.punkte` sichtbar machen; keine neue Aufgabenprüfung, Scoring-, Phasen-, Aktions- oder Validierungsregel in React.
- [x] RED: `npm test -- --run src/App.r40.test.tsx` schlug erwartungsgemäß fehl, weil offene Aufgaben noch ohne Punkte gerendert wurden.
- [x] GREEN: `src/App.tsx` rendert `Offene Aufgaben: {name} ({punkte} Punkte), ...`; leere Listen bleiben `Offene Aufgaben: keine`.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r40.test.tsx`; Test prüft vollständige offene Aufgaben-Collection, leere Liste und dass `bedingung` nicht sichtbar wird.
- [x] R33-Testvertrag aktualisiert: `src/App.test.tsx` erwartet offene Aufgaben nun ebenfalls mit Punkten.
- [x] `/simplify`: Nur JSX-Zeilenumbruch; Header und stabiler Textvertrag blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r40.test.tsx` → 2 R40-Tests bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx` → 37 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 20 Testfiles, 254 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine Aufgaben-/Scoringlogik, kein `bedingung`-/`geheimeAufgabe`-Leak, vollständige offene Aufgaben-Collection, R33-Update, R34/R35/R36/R37/R38/R39-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R41 UI-Anzahl legaler Aktionen

- [x] Scope: Vorhandenes Engine-Enumerator-Ergebnis `legaleAktionen.length` sichtbar machen; keine neue Legalitätslogik, keine Aktionsfilterung und keine Engine-Änderung in React.
- [x] RED: `npm test -- --run src/App.r41.test.tsx` schlug erwartungsgemäß fehl, weil `Legale Aktionen: 5` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Legale Aktionen: {legaleAktionen.length}` direkt aus dem bereits memoisierten `ermittleLegaleAktionen(zustand)`-Ergebnis.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r41.test.tsx`; Test prüft Startzählung, Button-Collection und Refresh auf `Legale Aktionen: 0` nach echter Engine-Aktion.
- [x] `/simplify`: Keine Änderungen; Zähler ist bereits minimal und nutzt vorhandenes `legaleAktionen`.
- [x] Targeted: `npm test -- --run src/App.r41.test.tsx` → 1 R41-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx` → 38 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 21 Testfiles, 255 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine Enumerator-Anzeige, kein UI-Legalitätsbranching, Refresh nach Klick, untracked Testdatei, R34/R35/R36/R37/R38/R39/R40-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R42 UI-Handkarten-Details

- [x] Scope: Vorhandene Engine-Handkartenfelder des aktiven Spielers sichtbar machen; keine neue Karten-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r42.test.tsx` schlug erwartungsgemäß fehl, weil `Handkarten-Details:` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Handkarten-Details:` aus `aktiverSpieler.hand`; Farbkarten zeigen `id`, `farbe`, `punkte`, Sonderkarten zeigen `id`, `name`, leere Hand zeigt `keine`.
- [x] Test-Härtung: Neue eigene Testdatei `src/App.r42.test.tsx`; Test leitet erwartete Punkte aus Engine-State ab statt Werte aus Karten-IDs zu erfinden.
- [x] Refresh: R42-Test klickt eine echte Engine-Aktion und prüft, dass die ausgespielte Karte aus den Handkarten-Details verschwindet.
- [x] `/simplify`: Keine Änderungen; Format bleibt bewusst eng am Engine-State und Testvertrag.
- [x] Targeted: `npm test -- --run src/App.r42.test.tsx` → 1 R42-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx` → 39 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 22 Testfiles, 256 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: initialer Blocker war nur `src/App.r42.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Engine-State-Bindung, Header oder Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R43 UI-Details aktiver Spieler

- [x] Scope: Vorhandene Engine-Spielerdaten des aktiven Spielers sichtbar machen; keine neue Turn-, KI-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r43.test.tsx` schlug erwartungsgemäß fehl, weil `Aktiver Spieler-Details:` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Aktiver Spieler-Details: {id} — {name} ({steuerung})` direkt aus `aktiverSpieler`.
- [x] Refresh: R43-Test klickt die vorhandene sichtbare Engine-Kette bis `Zug beenden` und prüft, dass die Detailzeile auf den nächsten aktiven Spieler wechselt.
- [x] `/simplify`: Keine Änderungen; bestehende Zeile `Aktiver Spieler:` und R34-R42-Textverträge bleiben stabil.
- [x] Targeted: `npm test -- --run src/App.r43.test.tsx` → 1 R43-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx` → 40 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 23 Testfiles, 257 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine Engine-State-Anzeige, sichtbarer Zugwechsel-Refresh, untracked Testdatei im Review, R34-R42-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R44 Spielerposition am Zug

- [x] Scope: Vorhandene Engine-State-Werte `aktiverSpielerIndex` und `spieler.length` sichtbar machen; keine neue Turn-, KI-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r44.test.tsx` schlug erwartungsgemäß fehl, weil `Spieler am Zug:` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Spieler am Zug: {position}/{gesamt}` direkt aus `zustand.aktiverSpielerIndex + 1` und `zustand.spieler.length`.
- [x] Refresh: R44-Test klickt die vorhandene sichtbare Engine-Kette bis `Zug beenden` und prüft, dass die Position nach Engine-Folgezustand aktualisiert wird.
- [x] `/simplify`: Eine zu starke Test-Vereinfachung wurde zurückgenommen; erwarteter Post-State bleibt engine-derived statt UI-seitig inferiert.
- [x] Targeted: `npm test -- --run src/App.r44.test.tsx` → 1 R44-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx` → 41 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 24 Testfiles, 258 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, sichtbarer Zugwechsel-Refresh, engine-derived Test-Erwartung, untracked Testdatei im Review, R34-R43-Textverträge, Header-Konvention und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R45 Schlangen-Gesamtzahl

- [x] Scope: Vorhandene Engine-State-Collection `zustand.spieler[*].schlangen.length` als Gesamtzählung sichtbar machen; keine neue Schlangen-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r45.test.tsx` schlug erwartungsgemäß fehl, weil `Schlangen gesamt:` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Schlangen gesamt: X` direkt aus `zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)`.
- [x] Refresh: R45-Test klickt eine vorhandene Engine-Aktion und prüft, dass die Gesamtzahl nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
- [x] `/simplify`: keine Änderungen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r45.test.tsx` → 1 R45-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx` → 41 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 25 Testfiles, 259 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: initialer Blocker war nur `src/App.r45.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Post-Action-Refresh, Header oder Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R46 Handkarten-Gesamtzahl

- [x] Scope: Vorhandene Engine-State-Collection `zustand.spieler[*].hand.length` als Gesamtzählung sichtbar machen; keine neue Handkarten-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r46.test.tsx` schlug erwartungsgemäß fehl, weil `Handkarten gesamt:` noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Handkarten gesamt: X` direkt aus `zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)`.
- [x] Refresh: R46-Test klickt eine vorhandene Engine-Aktion und prüft, dass die Gesamtzahl nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
- [x] `/simplify`: keine Änderungen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r46.test.tsx` → 1 R46-Test bestanden.
- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx src/App.r45.test.tsx src/App.r46.test.tsx` → 43 UI-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 26 Testfiles, 260 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: initialer Blocker war nur `src/App.r46.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Post-Action-Refresh, Header oder Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.
