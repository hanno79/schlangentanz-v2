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
- [x] Full tests: `npm

... [OUTPUT TRUNCATED - 9366 chars omitted out of 59366 total] ...

enes Engine-Enumerator-Ergebnis `legaleAktionen.length` sichtbar machen; keine neue Legalitätslogik, keine Aktionsfilterung und keine Engine-Änderung in React.
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
- [x] Production URL returns HTTP 200 — R45 Deploy `dpl_5xjPg1m4bgFGxXHsB9nPEo9ybPS8`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
- [x] Game route loads without console errors — R45 Playwright-Smoke: `Schlangen gesamt: 0` initial, nach Klick `Schlangen gesamt: 1`, keine Console/Page/Request-Fehler.

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
- [x] Production URL returns HTTP 200 — R46 Deploy `8vz7AvEYp2b2H1krpWywbHok5sDt`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
- [x] Game route loads without console errors — R46 Playwright-Smoke: `Handkarten gesamt: 10` initial, nach Klick `Handkarten gesamt: 9`, keine Console/Page/Request-Fehler.


## Evidence — 01.06.2026 R47 Ablagestapel-Details leer sichtbar

- [x] Scope: Vorhandene Engine-State-Collection `zustand.ablagestapel` immer als Detailzeile sichtbar machen; leer als `Ablagestapel: keine`, nicht leer weiterhin als Karten-IDs. Keine neue Ablage-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
- [x] RED: `npm test -- --run src/App.r47.test.tsx` schlug erwartungsgemäß fehl, weil `Ablagestapel: keine` bei leerem Stapel noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert `Ablagestapel: X` nun immer; `X` kommt direkt aus `zustand.ablagestapel` oder aus dem leeren Fallback `keine`.
- [x] Refresh: R47-Test klickt eine vorhandene Engine-Pflicht-Abwurf-Aktion und prüft, dass die Detailzeile nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
- [x] `/simplify`: Export-Kopplung aus `App.tsx` wurde wegen Lint (`react-refresh/only-export-components`) zurückgenommen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
- [x] Targeted: `npm test -- --run src/App.r47.test.tsx` → 1 R47-Test bestanden.
- [x] Related targeted: `npm test -- --run src/App.r38.test.tsx src/App.r47.test.tsx` → 3 Tests bestanden.
- [x] Full tests: `npm test -- --run` → 27 Testfiles, 261 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: initialer Blocker war nur `src/App.r47.test.tsx` untracked; wurde vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, R38-Textvertrag, Post-Action-Refresh, Header oder Dateigrößen.
- [x] Production URL returns HTTP 200 — R47 Deploy `dpl_2GqxjT8rvLpFz71o3LDoSxDtosRe`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
- [x] Game route loads without console errors — R47 Playwright-Smoke: `Ablagestapel: keine` initial und nach erstem Engine-Klick weiterhin sichtbar, keine Console/Page/Request-Fehler.


## Evidence — 01.06.2026 R48 UI-Übersichtsbereiche

- [x] Scope: Bestehende Debug-/Engine-State-Anzeigen bleiben erhalten und werden nur in sichtbare semantische Bereiche gegliedert.
- [x] RED: `npm test -- --run src/App.r48.test.tsx` schlug zuerst fehl, weil `Spielstatus`-Region fehlte; zweiter RED schlug fehl, weil sichtbare Headings fehlten.
- [x] GREEN: `src/App.tsx` enthält weiterhin die äußere Region `Legale Aktionen` und darunter sichtbare `<h2>`-/`section`-Bereiche `Spielstatus`, `Aktiver Spieler`, `Spielerübersicht`, `Material und Aufgaben`, `Wertung`, `Aktionen`.
- [x] Debug-Hilfen bleiben erhalten: vorhandene Textverträge für Zugphase, Spieler, Schlangen, Hände, Stapel, Aufgaben, Wertung, Aktionen und Quelle wurden nicht entfernt.
- [x] `/simplify`: Button-Wrapper entfernt und React-Key für legale Aktionen stabilisiert; keine Verhaltensänderung.
- [x] Full Gates vor Commit: `npm test -- --run` → 28 Testfiles / 262 Tests grün; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check`.
- [x] Codex Review: BLOCKERS None. Staged Scope `src/App.tsx`, `src/App.r48.test.tsx`; keine entfernten UI-Textverträge, keine Gameplay-Änderung, neue Testdatei staged.
- [x] Production URL returns HTTP 200 — R48 Deploy `schlangentanz-v2-6834593gw-alfreds-projects-7e9df1b4.vercel.app`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
- [x] Game route loads without console errors — R48 Playwright-Smoke: alle sechs sichtbaren Bereiche/Headings vorhanden, bisherige Aktionsbuttons sichtbar, keine Console/Page/Request-Fehler.


## Evidence — 01.06.2026 R49 Offene Aufgaben-Details

- [x] Scope: Vorhandene Engine-State-Felder `offeneAufgaben[*].name`, `punkte`, `bedingung` im Bereich `Material und Aufgaben` anzeigen; keine Engine-/Regellogik.
- [x] RED: `npm test -- --run src/App.r49.test.tsx` fehlte korrekt wegen fehlender Zeile `Offene Aufgaben-Details:`.
- [x] GREEN: `src/App.tsx` rendert `Offene Aufgaben-Details:` mit `Name (Punkte): Bedingung`; Leerfall bleibt `keine`.
- [x] Regression: R40-Test aktualisiert den neuen UI-Vertrag; Name/Punkte-Zeile bleibt unverändert.
- [x] Gates: R49/R40 targeted → 3 Tests; full → 29 Testfiles / 263 Tests; Typecheck, Lint, Build, `git diff --check` grün.
- [x] Review/Production: Codex BLOCKERS none; Deploy `schlangentanz-v2-4motjdic1-alfreds-projects-7e9df1b4.vercel.app`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200; Smoke: `Offene Aufgaben-Details` mit allen drei Bedingungen sichtbar, keine Console/Page/Request-Fehler.

## Evidence — 02.06.2026 R53 manueller KI-Aktionsbutton

- [x] Scope: Im KI-Zug wird ein manueller Button `KI-Aktion ausführen` an die erste vorhandene Engine-Aktion `legaleAktionen[0]` gebunden; keine KI-Strategie, kein Autoplay, keine Engine-Änderung.
- [x] RED: `npm test -- --run src/App.r53.test.tsx` fehlte korrekt wegen fehlendem KI-Aktionsbutton.
- [x] GREEN/Simplify: `src/App.tsx` nutzt weiter `ermittleLegaleAktionen` und `anwendeAktion`; `/simplify` meldete keine Änderungen.
- [x] Gates: targeted R53/App grün; full `npm test -- --run` → 33 Testfiles / 269 Tests; Typecheck, Lint, Build, `git diff --check` grün.
- [x] Codex Review: BLOCKERS none; Non-Blocker Mensch-Zug-Negativtest wurde ergänzt und erneut verifiziert.



## Evidence — 02.06.2026 R59 phasenabhängiges Zugpanel

- [x] Scope: Den UI-Zugbereich um einen klaren phasenabhängigen Pflichtschritt und eine mobilefreundliche Aktionsliste erweitern.
- [x] RED: `npm test -- --run src/App.r59.test.tsx` schlug initial fehl, weil der neue Pflichtschritt zunächst doppelt im DOM auftauchte und der Test nicht auf den aktiven Spielerbereich eingegrenzt war.
- [x] GREEN: `src/App.tsx` zeigt nun `Nächster Pflichtschritt` im aktiven Spielerbereich und gruppiert die Aktionsbuttons in einer responsiven `.aktions-liste`.
- [x] Test-Härtung: Der neue Test prüft den Pflichtschritt im aktiven Spielerbereich und die Aktualisierung nach einer Aktion.
- [x] Targeted: `npm test -- --run src/App.r59.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx` → 32 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R60 unmittelbares Aktionsfeedback

- [x] Scope: Nach jeder sichtbaren Aktion im UI ein unmittelbares Feedback `Zuletzt ausgeführt:` im Bereich **Aktiver Spieler** anzeigen.
- [x] RED: `npm test -- --run src/App.r60.test.tsx` schlug zunächst fehl, weil der Feedback-Text noch nicht gerendert wurde.
- [x] GREEN: `src/App.tsx` speichert das zuletzt ausgeführte Label und zeigt es im aktiven Spielerbereich an; auch die phasenbezogenen Steuerbuttons aktualisieren dieses Feedback.
- [x] Test-Härtung: Der neue Test prüft, dass das Feedback direkt nach einem Klick im aktiven Spielerbereich sichtbar wird.
- [x] Targeted: `npm test -- --run src/App.r60.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx` → 33 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R61 Überhand-Abwurf im Zugabschluss

- [x] Scope: Im Zugabschluss einen sichtbaren Überhand-Hinweis zeigen und einen direkten UI-Pfad zum Abwurf überzähliger Karten anbieten, bevor `Zug beenden` wieder aktiv wird.
- [x] RED: `npm test -- --run src/App.r61.test.tsx` schlug zunächst fehl, weil der neue Hinweis nur Text war und der Interaktionspfad zum Abwurf fehlte.
- [x] GREEN: `src/App.tsx` zeigt im Überhand-Fall `Überzählige Karten abwerfen`, ruft `werfeUeberzaehligeHandkartenAb(...)` auf und blendet `Zug beenden` erst nach dem Abwurf wieder ein.
- [x] Test-Härtung: Der neue Test prüft Hinweis, Button-Wechsel und den nächsten Pflichtschritt nach dem Abwurf.
- [x] Targeted: `npm test -- --run src/App.r61.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx` → 34 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R62 Phasenregeln im Aktionsbereich

- [x] Scope: Im Aktionsbereich einen kompakten Phasenregeln-Block anzeigen, der den aktuellen Zugkontext erklärt und im Spielende sichtbar bleibt.
- [x] GREEN: `src/App.tsx` rendert `Phasenregeln` als eigene Region unterhalb der Aktionsbuttons; die Texte decken Nachziehphase, Ausspielphase, Aufgabenprüfung, Zugabschluss und Spielende ab.
- [x] GREEN: Die Phasenregeln verwenden `MINDESTHANDKARTEN` und `MAX_KARTEN_PRO_ZUG` aus der Engine statt harter Zahlen.
- [x] Test-Härtung: `src/App.r62.test.tsx` prüft Zugabschluss mit Überhand sowie Spielende-Sichtbarkeit.
- [x] Targeted: `npm test -- --run src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx` → 36 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R63 Endrunde sichtbar im Spielstatus

- [x] Scope: Den Übergang in die Endrunde im Spielstatus sichtbar markieren, damit der leere Nachziehstapel und die Restzüge nachvollziehbar sind.
- [x] GREEN: `src/App.tsx` zeigt im Endspurt-Fall `Endrunde aktiv: ja` zusätzlich zu Auslöser und verbleibenden Endrunden-Spielern.
- [x] Test-Härtung: `src/App.r63.test.tsx` prüft Endrunde, Auslöser und verbleibende Spieler im Spielstatus.
- [x] Targeted: `npm test -- --run src/App.r63.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx` → 37 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.

## Evidence — 02.06.2026 R64 Legale Aktionen im Phasenregeln-Bereich

- [x] Scope: Die aktuellen legalen Aktionen im Phasenregeln-Bereich sichtbar machen, damit Spieler auf einen Blick sehen, welche Aktionen in der laufenden Phase noch möglich sind.
- [x] GREEN: `src/App.tsx` zeigt im Phasenregeln-Bereich eine eigene Liste `Legale Aktionen dieser Phase` und stellt den leeren Zustand klar dar.
- [x] Test-Härtung: `src/App.r64.test.tsx` prüft den leeren Aktionszustand im Phasenregeln-Bereich.
- [x] Targeted: `npm test -- --run src/App.r64.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx` → 39 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R65 Endspurt verdoppelte offene Aufgaben

- [x] Scope: Offene Aufgaben im Endspurt mit verdoppeltem Wert und klarer ×2-Anzeige sichtbar machen.
- [x] GREEN: `src/App.tsx` zeigt offene Aufgaben im Endspurt mit `×2 = ...` und verdoppeltem Punktwert an; die geheime Aufgabe bleibt unverändert.
- [x] Test-Härtung: `src/App.r65.test.tsx` prüft die Endspurt-Anzeige der offenen Aufgaben im Bereich `Material und Aufgaben` und sichert zusätzlich den unveränderten Normalzustand ohne `×2` ab.
- [x] Targeted: `npm test -- --run src/App.r65.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r49.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx` → 42 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R66 Wertungsdetails getrennt anzeigen

- [x] Scope: Die Wertung pro Spieler zusätzlich in Farbgruppen- und Aufgabenpunkte aufschlüsseln.
- [x] GREEN: `src/App.tsx` zeigt im Bereich `Wertung` neben der Gesamtsumme zusätzlich `Wertungsdetails ...` an.
- [x] Test-Härtung: `src/App.r66.test.tsx` prüft die Detailzeilen für beide Spieler und leitet Erwartungswerte aus der Engine-Wertung ab.
- [x] Targeted: `npm test -- --run src/App.r66.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r49.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx src/App.r66.test.tsx` → 43 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R67 Materialstapel gesamt anzeigen

- [x] Scope: Die zusammengefasste Materialmenge aus Nachzieh- und Ablagestapel sichtbar machen.
- [x] GREEN: `src/App.tsx` zeigt im Bereich `Material und Aufgaben` zusätzlich `Materialstapel gesamt: ... Karten` an.
- [x] Test-Härtung: `src/App.r67.test.tsx` prüft die berechnete Gesamtzahl aus Nachzieh- und Ablagestapel gegen den Engine-State.
- [x] Targeted: `npm test -- --run src/App.r67.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx src/App.r45.test.tsx src/App.r46.test.tsx src/App.r47.test.tsx src/App.r48.test.tsx src/App.r49.test.tsx src/App.r50.test.tsx src/App.r51.test.tsx src/App.r52.test.tsx src/App.r53.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx src/App.r66.test.tsx src/App.r67.test.tsx` → 69 UI-Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R68 Hervorhebung der empfohlenen legalen Aktion

- [x] Scope: Den ersten legalen Aktionsbutton im Bereich `Legale Aktionen` visuell hervorheben; keine neue Regel-, Phasen- oder Engine-Logik.
- [x] GREEN: `src/App.tsx` markiert den ersten legalen Aktionsbutton mit `aktions-button--empfohlen`.
- [x] Test-Härtung: `src/App.r68.test.tsx` prüft, dass der erste legale Aktionsbutton hervorgehoben ist und die zweite Aktion nicht dieselbe Markierung trägt.
- [x] Targeted: `npm test -- --run src/App.r68.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App*.test.tsx` → 35 Testfiles, 70 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R69 SchlangenSpass!-Hinweis für erfüllte Aufgaben

- [x] Scope: Erfüllte Aufgaben im Spielerbereich sichtbarer machen; keine Engine-/Regellogik, keine Änderung am Aufgaben-Scoring.
- [x] GREEN: `src/App.tsx` kennzeichnet erfüllte Aufgaben mit dem sichtbaren Prefix `SchlangenSpass!`; Spieler ohne erfüllte Aufgaben bleiben bei `keine`.
- [x] Test-Härtung: `src/App.r69.test.tsx` prüft den SchlangenSpass!-Hinweis für einen Spieler mit erfüllten Aufgaben und sichert den leeren Zustand eines weiteren Spielers ab.
- [x] Targeted: `npm test -- --run src/App.r69.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run src/App*.test.tsx` → 36 Testfiles, 71 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R71 Benannte Erweiterungssonderkarten im Materialstapel

- [x] Scope: Die vier Schlangenhäutung-Karten und die weiteren benannten Erweiterungssonderkarten als separat abrufbares Material sichtbar machen, ohne den bestehenden 32er-Basis-Sonderkartenstapel zu verändern.
- [x] GREEN: `src/engine/deck.ts` stellt zusätzlich zu `erstelleSonderkarten()` die neue `erstelleErweiterungsSonderkarten()`-Factory bereit und lässt den Basiskartenstapel unverändert bei 32 generischen Sonderkarten.
- [x] GREEN: `src/engine/__tests__/engine.test.ts` prüft die 17 benannten Erweiterungssonderkarten mit 4 Schlangenhäutung, 1 Schlangenkorb des Glücks, 4 Comeback und 8 Risiko-Belohnung.
- [x] Test-Härtung: `src/App.test.tsx` und `src/App.r51.test.tsx` wurden auf die jetzt wieder generischen Basis-Sonderkarten bzw. die unveränderte Zufallsverteilung gehärtet.
- [x] Targeted: `npm test -- --run src/engine/__tests__/engine.test.ts src/App.test.tsx src/App.r51.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run` → 49 Testfiles, 294 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R72 Erweiterungssonderkarten im Materialbereich sichtbar

- [x] Scope: Die benannten Erweiterungssonderkarten als sichtbaren Materialhinweis im UI-Materialbereich anzeigen, ohne die bestehende Kartenlogik oder den Basisspielstapel zu ändern.
- [x] GREEN: `src/App.tsx` rendert zusätzlich die Zeile `Erweiterungssonderkarten: 4 Schlangenhäutung, 1 Schlangenkorb des Glücks, 4 Comeback, 8 Risiko-Belohnung` im Bereich `Material und Aufgaben`.
- [x] GREEN: `src/App.r72.test.tsx` prüft die Materialanzeige auf den vollständigen benannten Erweiterungskarten-Hinweis.
- [x] GREEN: `src/engine/index.ts` exportiert die neue Factory `erstelleErweiterungsSonderkarten()` weiterhin über den Public Barrel.
- [x] Targeted: `npm test -- --run src/App.r72.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run` → 50 Testfiles, 295 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R73 Benannte normale Sonderkarten im Basisdeck

- [x] Scope: Die normalen 32 Sonderkarten des Basisdecks als benannte Karten statt als generische Platzhalter darstellen, z. B. Schlangengrube.
- [x] GREEN: `src/engine/deck.ts` erzeugt das Basisdeck als 8 benannte Sonderkartentypen mit je 4 Exemplaren: Farbenschutz, Regenbogenschlange, Schlangenfrass, Schlangenblockade, Farbendieb, Schlangengrube, Farbenfusion und Verdoppler.
- [x] GREEN: `src/App.tsx` zeigt im Bereich `Material und Aufgaben` zusätzlich die Zeile `Sonderkarten: 4 Farbenschutz, 4 Regenbogenschlange, 4 Schlangenfrass, 4 Schlangenblockade, 4 Farbendieb, 4 Schlangengrube, 4 Farbenfusion, 4 Verdoppler`.
- [x] GREEN: `src/engine/__tests__/engine.test.ts` prüft die 32 benannten Basis-Sonderkarten; `src/App.r51.test.tsx` akzeptiert nun benannte Sonderkarten im Startauszug.
- [x] Targeted: `npm test -- --run src/engine/__tests__/engine.test.ts src/App.r51.test.tsx` bestanden.
- [x] Targeted+Regression: `npm test -- --run` → 50 Testfiles, 295 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.

## Evidence — 02.06.2026 R74 Schlangengrube lässt einen gewählten Spieler aussetzen

- [x] Scope: Die Sonderkarte `Schlangengrube` soll einen anderen Spieler gezielt für seinen nächsten Zug aussetzen lassen; bei 2 Spielern ist automatisch der andere Spieler betroffen.
- [x] GREEN: `src/engine/turnState.ts` führt `aussetzenSpielerIndizes` ein und konsumiert den Marker beim Zugwechsel.
- [x] GREEN: `src/engine/legalActions.ts` bietet `SonderkarteSpielen` für `Schlangengrube` mit auswählbaren Zielspielern an.
- [x] GREEN: `src/App.tsx` zeigt die neue Sonderkartenaktion im UI mit Zielspieler an.
- [x] GREEN: `docs/GAME_SPEC.md` beschreibt die Schlangengrube-Regel und den neuen Sonderkartenaktionstyp.
- [x] Test-Härtung: `src/engine/__tests__/turn_state.test.ts` prüft das Aussetzen beim Zugwechsel; `src/engine/__tests__/legal_actions.test.ts` prüft die auswählbaren Zielspieler, Endrunden-Zielbarkeit und das Sonderkartenlimit.
- [x] Targeted: `npm test -- --run src/engine/__tests__/legal_actions.test.ts` → 23 Tests bestanden.
- [x] Targeted R74: `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts src/App.r53.test.tsx` bestanden.
- [x] Full tests: `npm test -- --run` → 50 Testfiles, 299 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Production URL returns HTTP 200 — `https://schlangentanz-v2.vercel.app` geladen.
- [x] Game route loads without console errors — Browser-Smoketest ohne Console-/Page-Errors.
- [x] Legal actions are available only when legal — `SonderkarteSpielen` wird im Endspurt nur für verbleibende Zielspieler angeboten und nach bereits gespielter Sonderkarte nicht mehr angeboten.

## Evidence — 02.06.2026 R75 Farbenschutz als Schutzmarker spielen

- [x] Scope: Die Sonderkarte `Farbenschutz` schützt in diesem kleinen Slice genau eine eigene aktive Schlange, indem deren Zustand auf `geschuetzt` gesetzt wird.
- [x] GREEN: `src/engine/legalActions.ts` bietet `FarbenschutzSpielen` nur für eigene aktive Schlangen und nur innerhalb des Sonderkartenlimits an.
- [x] GREEN: `src/engine/turnState.ts` entfernt die Farbenschutz-Karte von der Hand, legt sie auf den Ablagestapel und markiert die Zielschlange als geschützt.
- [x] GREEN: `src/App.tsx` zeigt die Farbenschutz-Aktion als eindeutigen Button; `src/App.r75.test.tsx` prüft Klick und sichtbaren Schlangenzustand.
- [x] GREEN: `docs/GAME_SPEC.md` beschreibt den R75-Scope und grenzt die spätere Schutzwirkung bewusst aus.
- [x] Targeted R75: `npm test -- --run src/App.r75.test.tsx src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts` → 3 Testfiles, 88 Tests bestanden.
- [x] Review-Fix: Pflicht-Abwurf ist laut Spec nur ohne spielbare Aktion erlaubt; `legal_actions.test.ts` prüft jetzt, dass spielbarer Farbenschutz Pflicht-Abwurf sperrt.
- [x] Review: Codex-Abschlussreview ohne blockierende Findings nach DRY-Fix der R75-Testfixture.
- [x] Full tests: `npm test -- --run` → 51 Testfiles, 313 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Commit/Push: `ad1b47a — R75: Farbenschutz spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading, Farbenschutz-Materialzeile und Ausspielphase ohne Console-/Page-Errors.

## Evidence — 02.06.2026 R76 Sonderkarten-Regelstatus ohne geratene Effekte

- [x] Scope: Kein neuer Karten-Effekt ohne bestätigte Regel; stattdessen klare Trennung zwischen implementierten Sonderkartenwirkungen und offenen normalen Sonderkartenwirkungen.
- [x] RED: `npm test -- --run tests/spec_documentation.test.ts` → 2 erwartete Fehlschläge wegen fehlendem R7.1/R7.2-Regelstatus.
- [x] GREEN: `docs/GAME_SPEC.md` dokumentiert `R7.1 Umgesetzte Sonderkartenwirkungen` für Schlangengrube, Schlangenblockade, Farbenschutz und Regenbogenschlange.
- [x] GREEN: `docs/GAME_SPEC.md` dokumentiert `R7.2 Offene normale Sonderkartenwirkungen` für Schlangenfrass, Farbendieb, Farbenfusion und Verdoppler.
- [x] GREEN: `tests/spec_documentation.test.ts` erzwingt, dass offene Sonderkartenwirkungen nicht aus dem Kartennamen geraten werden.
- [x] Targeted: `npm test -- --run tests/spec_documentation.test.ts` → 12 Tests bestanden.
- [x] `/simplify`: keine weiteren Dateiänderungen nötig.
- [x] Review: Codex-Re-Review ohne Blocker und ohne handlungsrelevante Non-Blocker.
- [x] Full tests: `npm test -- --run` → 51 Testfiles, 315 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Commit/Push: `46e15b1 — R76: Sonderkarten-Regelstatus absichern` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading und Sonderkarten-Materialzeile ohne Console-/Page-Errors und findet keine geratenen Effekttexte.

## Evidence — 02.06.2026 R77 Spec-Status bereinigt

- [x] Scope: Veralteten Draft-/Template-Status bereinigen, ohne Spielregeln oder Sonderkartenwirkungen zu ändern.
- [x] RED: `npm test -- --run tests/spec_documentation.test.ts` → 1 erwarteter Fehlschlag wegen altem Draft-/Template-Status.
- [x] GREEN: `docs/GAME_SPEC.md` beschreibt sich als aktive inkrementelle Projektspezifikation und ersetzt generische TODO-/Acceptance-Signoff-Blöcke.
- [x] GREEN: `tests/spec_documentation.test.ts` sichert ab, dass altes Template-Wording nicht zurückkehrt; nach Codex-Review zusätzlich gegen verbliebene `Draft — Signoff ausstehend`-Hinweise gehärtet.
- [x] Targeted: `npm test -- --run tests/spec_documentation.test.ts` → 13 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 51 Testfiles / 316 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `6e3ca5f — R77: Spec-Status bereinigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading und Sonderkarten-Materialzeile ohne Console-/Page-Errors und ohne altes Draft-/Template-Wording.

## Evidence — 02.06.2026 R78 Farbenschutz-Abwehr gegen Schlangengrube

- [x] Quelle: `https://schlangentanz.ch/rules` per Playwright geprüft; relevante Timing-/Sonderkartenregeln in `docs/rules_source_2026-06-02_r78.md` extrahiert.
- [x] Scope: Farbenschutz darf als einmalige Reaktion des Zielspielers gegnerische Angriffe abwehren; R78 setzt dies für die bereits implementierte `Schlangengrube` um.
- [x] RED: `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts` → 2 erwartete Fehlschläge vor Implementierung.
- [x] GREEN: `SonderkarteSpielen.abwehrHandkartenId` ist nur mit Farbenschutz des Zielspielers legal; bei Anwendung werden Schlangengrube und Farbenschutz abgelegt und kein Aussetzen gesetzt.
- [x] Targeted: `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts tests/spec_documentation.test.ts` → 3 Testfiles / 103 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] `/simplify`: Claude Code Opusplan prüfte den Slice; zwei kleine DRY-/Predicate-Vereinfachungen angewendet.
- [x] Full Gates: `npm run typecheck`, `npm test -- --run` → 51 Testfiles / 319 Tests bestanden, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.

## Evidence — 03.06.2026 R79 Schlangenfrass dokumentiert

- [x] Scope: Schlangenfrass ist als implementierte Sonderkarte dokumentiert; die alte offene Formulierung wurde aus der Spezifikation entfernt.
- [x] GREEN: `docs/GAME_SPEC.md` führt Schlangenfrass jetzt in `R7.1 Umgesetzte Sonderkartenwirkungen` und nicht mehr als offene Sonderkarte.
- [x] GREEN: `tests/spec_documentation.test.ts` prüft die neue Implementierungsschreibung und verhindert die alte offene Schlangenfrass-Formulierung.
- [x] Targeted: `npm test -- --run tests/spec_documentation.test.ts src/engine/__tests__/schlangenfrass.test.ts` → 2 Testfiles / 28 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 55 Testfiles / 370 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.

## Evidence — 03.06.2026 R80 Farbenfusion dokumentiert und testabgesichert

- [x] Scope: Farbenfusion ist als implementierte normale Sonderkarte dokumentiert; die offene Sonderkartenliste enthält dafür keinen offenen Rest mehr.
- [x] GREEN: `docs/GAME_SPEC.md` führt Farbenfusion in `R7.1 Umgesetzte Sonderkartenwirkungen` und nicht mehr als offene normale Sonderkartenwirkung.
- [x] GREEN: `src/engine/__tests__/farbenfusion.test.ts` prüft das Fusionieren zweier nebeneinanderliegender gleichfarbiger Karten sowie die Ablehnung ungültiger Kandidaten.
- [x] GREEN: `tests/spec_documentation.test.ts` prüft die neue Implementierungszuordnung und das Entfernen der alten offenen Farbenfusion-Formulierung.
- [x] Targeted: `npm test -- --run src/engine/__tests__/farbenfusion.test.ts tests/spec_documentation.test.ts` → 2 Testfiles / 15 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 56 Testfiles / 372 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.

## Evidence — 03.06.2026 R81 Serialization-Hardening und Reaktionsvalidierung

- [x] Scope: Farbenfusion-Metadaten und Pending-Reaktionen werden beim Deserialisieren kanonisch gegen echtes Kartenmaterial validiert.
- [x] GREEN: `src/engine/serialization.ts` prüft Farbenfusion-Einträge, reale Pending-Ziele, Blockadekarten im Ablagestapel, Farbendieb-Einfügepositionen und nicht-leere Verdoppler-Reaktionslisten.
- [x] GREEN: `src/engine/__tests__/serialization_r19.test.ts` enthält Regressionen für die neuen Serialisierungsinvarianten.
- [x] Codex: Re-Review nach Rest-Fix meldete `BLOCKERS: keine` und `NON-BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/engine/__tests__/serialization_r19.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/turn_state_r78_reactions.test.ts src/engine/__tests__/schlangenblockade.test.ts src/engine/__tests__/schlangenfrass.test.ts` → 5 Testfiles / 52 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 56 Testfiles / 393 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `0e323f4 — R81: Serialization und Reaktionsvalidierung härten` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading und Sonderkarten-Materialzeile ohne Console-/Page-/Request-Errors.

## Evidence — 03.06.2026 R82 Fusionsexperte-Aufgabenprüfung

- [x] Scope: Erster engine-seitiger Aufgabenprüfungs-Durchstich für `Fusionsexperte` umgesetzt.
- [x] GREEN: `beendeAufgabenpruefung` erfüllt `Fusionsexperte`, wenn der aktive Spieler eine eigene Schlange mit mindestens zwei echten `Farbenfusion`-Sonderkarten in `schlange.karten` besitzt.
- [x] GREEN: Verwaiste `farbenfusionen`-Metadaten ohne echte Karten erfüllen die Aufgabe nicht.
- [x] GREEN: Erfüllung verschiebt die offene Aufgabe zum aktiven Spieler, zieht bei vorhandenem Aufgabenstapel eine neue offene Aufgabe nach und erfindet bei leerem Stapel keine Aufgabe.
- [x] Codex: Finaler Re-Review meldete `BLOCKERS: keine` und `NON-BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/turn_state.test.ts` → 3 Testfiles / 74 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 57 Testfiles / 401 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `77e2478 — R82: Fusionsexperte-Aufgabenprüfung umsetzen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading, Engine-/Karten-Copy und meldet keine Console-/Page-/Request-Errors.

## Evidence — 03.06.2026 R83 Schlangenbeschwörer-Aufgabenprüfung

- [x] Scope: Engine-seitige Aufgabenprüfung für `Schlangenbeschwörer` umgesetzt.
- [x] GREEN: `beendeAufgabenpruefung` erfüllt `Schlangenbeschwörer`, wenn der aktive Spieler insgesamt mindestens 4 echte Sonderkarten in eigenen Schlangen besitzt.
- [x] GREEN: Nur 3 Sonderkarten erfüllen die Aufgabe nicht; gegnerische Sonderkarten zählen nicht; aktiver Spielerindex 1 ist abgesichert.
- [x] GREEN: Über zwei eigene Schlangen verteilte Sonderkarten zählen gemeinsam.
- [x] Codex-Blocker behoben: Mehrere gleichzeitig erfüllte offene Aufgaben werden in derselben Aufgabenprüfung gemeinsam erfüllt und entsprechend viele Ersatzaufgaben nachgezogen.
- [x] Codex: Finaler Re-Review meldete `BLOCKERS: keine` und `NON-BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts` → 1 Testfile / 14 Tests bestanden.
- [x] Targeted angrenzend: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/serialization_r19.test.ts` → 3 Testfiles / 41 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 57 Testfiles / 407 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Code-Commit/Push: `44b39eb — R83: Schlangenbeschwörer-Aufgabenprüfung umsetzen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- [x] Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading, Engine-/Karten-Copy und meldet keine Console-/Page-/Request-Errors.

## Evidence — 11.06.2026 R129 Gewinner-Copy spielerfreundlicher

- [x] Scope: Gewinner-/Ergebnis-Copy im Spielende zeigt Spielernamen statt roher `spieler-*`-IDs; Engine/Scoring/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r129_gewinner_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch `Sieg für spieler-1` / `Gewinner spieler-1` gerendert wurde.
- [x] GREEN: `src/App.tsx` mappt Gewinner-IDs über `zustand.spieler[].name` mit ID-Fallback; R31/R56-Gewinnerregressionen wurden auf Spielernamen aktualisiert.
- [x] Codex Review: `BLOCKERS: Keine gefunden`; Non-Blockers nur Verifikationsnotizen.
- [x] Targeted: `npm test -- --run src/App.r129_gewinner_copy.test.tsx src/App.r56.test.tsx src/App.test.tsx` → 3 Testdateien / 28 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 136 Testdateien / 617 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `96ce7c2 — R129: Gewinner-Copy spielerfreundlicher machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; zusätzlicher Playwright-Flow auf `/game` ohne Console-/Page-Errors. Die Spielende-Gewinner-Copy wurde lokal per DOM-Regression abgesichert; ein vollständiger Live-Endzustand wurde in diesem Lauf nicht erzwungen.

## Evidence — 11.06.2026 R130 Punkteübersicht-Copy spielerfreundlicher

- [x] Scope: Entwicklungsdaten-Punkteübersicht zeigt Spielernamen statt roher `spieler-*`-IDs; Engine/Scoring/Scoreboard/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r130_punkteuebersicht_spielernamen.test.tsx` schlug erwartungsgemäß fehl, weil noch `Punktestand/Punktequellen von spieler-*` gerendert wurde.
- [x] GREEN: `src/App.tsx` nutzt den bestehenden `spielerNameFuerId(...)`-Mapper für `Punktestand von …` und `Punktequellen von …`; bestehende UI-Regressionen wurden auf Spielernamen nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initialer stale-Test-Copy-Blocker behoben; final `BLOCKERS: Keine`.
- [x] Targeted: 9 betroffene App-Testdateien / 35 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 137 Testdateien / 618 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `af6d38a — R130: Punkteübersicht-Copy spielerfreundlicher machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R130-Browser-Smoke bestätigt `Punktestand von Spieler 1` / `Punktequellen von Spieler 1` und keine stale `Punktestand/Punktequellen von spieler-*`-Copy im erreichten Live-DOM.

## Evidence — 11.06.2026 R131 Endrunden-Copy spielerfreundlicher

- [x] Scope: Endrunden-Auslöser und verbleibende Endrunden-Spieler im `Spielstatus` zeigen Spielernamen statt roher `spieler-*`-IDs; Engine/No-Draw/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r131_endrunde_spielernamen.test.tsx` schlug erwartungsgemäß fehl, weil noch `Endrunde ausgelöst durch: spieler-2` gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert Endrunden-Indizes über `zustand.spieler[index].name`; `src/App.f21_endspurt_status.test.tsx`, `src/App.r63.test.tsx` und `src/App.test.tsx` wurden auf die neue Copy nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initiale Testhärtungs-Non-Blocker und ein späterer Full-Gate-Fund in `App.r63.test.tsx` behoben; final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r63.test.tsx src/App.r131_endrunde_spielernamen.test.tsx src/App.f21_endspurt_status.test.tsx src/App.test.tsx` → 4 Testdateien / 31 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 138 Testdateien / 619 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `1dea7eb — R131: Endrunden-Copy spielerfreundlicher machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; keine Console-/Page-Errors. Die R131-Endrunden-Copy wurde lokal per DOM-Regression gegen gezielte Endspurt-Zustände abgesichert; ein vollständiger Live-Endrunden-Zustand wurde in diesem Lauf nicht erzwungen.

## Evidence — 11.06.2026 R132 Aktiven Spieler spielerfreundlich benennen

- [x] Scope: Entwicklungsdatenbereich `Aktiver Spieler` zeigt Namen und verständlichen Zughinweis statt roher `spieler-*`-IDs oder technischer Steuerungswerte; Engine/Zugwechsel/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r132_aktiver_spieler_profil_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch `Aktiver Spieler: spieler-1` und `Spielerprofil: spieler-1 — Spieler 1 (Mensch)` gerendert wurden.
- [x] GREEN: `src/App.tsx` nutzt `aktiverSpieler.name` und `zugfuehrungLabel(...)`; `src/App.r132_aktiver_spieler_profil_copy.test.tsx` prüft Mensch- und KI-Zug im konkreten `complementary`-Bereich mit negativen raw-ID-/Steuerungswert-Assertions.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initiale Testhärtungs-Non-Blocker und stale `App.test.tsx`-Assertions behoben; final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine review-relevanten Hinweise im Scope`.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/App.r132_aktiver_spieler_profil_copy.test.tsx src/App.r43.test.tsx` → 3 Testdateien / 29 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 139 Testdateien / 621 Tests bestanden; `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün.
- [x] Commit/Push: `255615d — R132: Aktiven Spieler spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R132-Browser-Smoke bestätigt `Aktiver Spieler: Spieler 1` / `Spielerprofil: Spieler 1 — Du bist am Zug.` und keine rohe `spieler-*`-/`(Mensch|KI)`-Copy im erreichten Aktiver-Spieler-Entwicklungsdatenbereich.

## Evidence — 11.06.2026 R135 Aktionenquelle spielerfreundlich benennen

- [x] Scope: Aktionenbereich `Weitere Aktionen` zeigt einen spielerfreundlichen Regelprüfhinweis statt sichtbarer interner Implementierungsquelle; Engine/Regeln/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r135_aktionenquelle_copy.test.tsx` schlug erwartungsgemäß fehl, weil `Spielregeln prüfen jede Aktion vor dem Ausführen.` noch fehlte und `Quelle: engine.ermittleLegaleAktionen` sichtbar war.
- [x] GREEN: `src/components/AktionenPanel.tsx` ersetzt die Quelle-Zeile durch die Spieler-Copy; `src/App.f6_aktionenbereich.test.tsx`, `src/App.test.tsx` und `src/App.r135_aktionenquelle_copy.test.tsx` sichern Copy, negative stale Quelle und erhaltene Button-Coverage ab.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initial `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`; nach Full-Suite-Fund und `App.test.tsx`-Nachzug Re-Review ebenfalls `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/App.r135_aktionenquelle_copy.test.tsx src/App.f6_aktionenbereich.test.tsx` → 3 Testdateien / 29 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 141 Testdateien / 623 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün.
- [x] Commit/Push: `4f0cd8f — R135: Aktionenquelle spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R135-Browser-Smoke bestätigt die neue Regelprüf-Copy, keine sichtbare `Quelle:`-/`engine.ermittleLegaleAktionen`-Copy im erreichten `Weitere Aktionen`-Bereich und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R136 Schlangenstatus am Spieltisch spielerfreundlich benennen

- [x] Scope: Schlangenkarten im `Spieltisch` zeigen ihren Zustand als spielerfreundlichen Status; Engine, Regeln, Layout und Interaktionen unverändert.
- [x] RED: `npm test -- --run src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch keine `Status: spielbereit`-Copy im Spieltisch sichtbar war.
- [x] GREEN: `src/components/Schlangenbereich.tsx` mappt eigene und gegnerische Schlangenstatuswerte über einen exhaustiven `switch` auf `spielbereit`, `gerade blockiert`, `geschützt`; `src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` prüft eigene und gegnerische Schlangen sowie negative stale `Zustand:`-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initiale Non-Blocker (gegnerische Schlangen direkt testen, exhaustives Mapping) behoben; Re-Review final `BLOCKERS: keine`, `NON-BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/App.r136_spieltisch_schlangenstatus_copy.test.tsx src/App.r126_schlangenstatus_copy.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 3 Testdateien / 3 Tests bestanden; zusätzlich `npm run typecheck` grün.
- [x] Full Gates: `npm test -- --run` → 142 Testdateien / 624 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün.
- [x] Commit/Push: `c308608 — R136: Schlangenstatus am Spieltisch spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R136-Browser-Smoke führt eine `Neue Schlange starten`-Aktion aus, bestätigt `Status: spielbereit` im `Spieltisch`, keine sichtbare stale `Zustand: aktiv|blockiert|geschuetzt`-Copy und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R137 Partiestatus spielerfreundlich benennen

- [x] Scope: Entwicklungsdaten-Zeile `Partiestatus` zeigt spielerfreundliche Copy (`Laufende Partie`, `Endrunde läuft`, `Partie beendet`) statt roher interner `spielphase`-Werte; Engine, Regeln, Layout und Interaktionen unverändert.
- [x] RED: `npm test -- --run src/App.r137_partiestatus_copy.test.tsx` schlug erwartungsgemäß mit 3 Fehlschlägen fehl, weil noch `Partiestatus: Normal/Endspurt/Beendet` sichtbar war.
- [x] GREEN: `src/App.tsx` mappt `Normal`, `Endspurt`, `Beendet` über `spielphaseLabel(...)`; `src/App.r123_spielphase_copy.test.tsx`, `src/App.f22_spielende_status.test.tsx` und stale R32-Erwartungen in `src/App.test.tsx` wurden nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: redundante Teststil-Non-Blocker und späterer Full-Suite-Fund in `App.test.tsx` behoben; finales Re-Review `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r137_partiestatus_copy.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.f22_spielende_status.test.tsx src/App.f21_endspurt_status.test.tsx src/App.test.tsx` → 5 Testdateien / 34 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 143 Testdateien / 627 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün.
- [x] Commit/Push: `b871c91 — R137: Partiestatus spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R137-Browser-Smoke bestätigt `Partiestatus: Laufende Partie`, keine sichtbare stale `Partiestatus: Normal`-Copy im erreichten Startzustand und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R138 Zugdiagnose spielerfreundlich benennen

- [x] Scope: Entwicklungsdaten-Zeile `Spielschritt im Zug` zeigt spielerfreundliche `zugphaseLabel(...)`-Copy statt roher interner Zugphasenwerte; Engine/Regeln/Layout unverändert.
- [x] RED: `npm test -- --run src/App.r138_zugdiagnose_copy.test.tsx` schlug erwartungsgemäß mit 5 Fehlschlägen fehl, weil noch `Spielschritt im Zug: Nachziehphase/Ausspielphase/Aufgabenpruefung/Zugabschluss/Spielende` sichtbar war.
- [x] GREEN: `src/App.tsx` nutzt `zugphaseLabel(zustand.zugphase)` für `Spielschritt im Zug`; stale positive Erwartungen in `src/App.f9_zugfortschritt.test.tsx`, `src/App.r123_spielphase_copy.test.tsx`, `src/App.r134_aktueller_spielschritt_copy.test.tsx` und `src/App.test.tsx` wurden nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initial `BLOCKERS: Keine`; nach Full-Suite-Fund und `App.test.tsx`-Nachzug Re-Review ebenfalls `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/App.r138_zugdiagnose_copy.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.r123_spielphase_copy.test.tsx` → 5 Testdateien / 38 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 144 Testdateien / 632 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `ee478c2 — R138: Zugdiagnose spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R138-Browser-Smoke bestätigt `Spielschritt im Zug: Karten ausspielen`, keine sichtbare stale `Spielschritt im Zug: Ausspielphase`-Copy im erreichten Startzustand und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R139 Gegnerische Schlangen mit Spielernamen benennen

- [x] Scope: Gegnerische Schlangenkarten im `Spieltisch` zeigen Besitzer-Copy über Spielernamen statt roher `spieler-*`-IDs; Engine, Regeln, Drag&Drop, Schlangen-/Karten-IDs und Layout unverändert.
- [x] RED: `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch `Spieler: spieler-2` statt `Gehört zu: Spieler 2` sichtbar war.
- [x] GREEN: `src/components/Schlangenbereich.tsx` rendert für gegnerische Schlangenkarten `Gehört zu: {spieler.name}`; `src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` prüft die neue Copy und negativ die stale ID-Copy im Bereich `Gegnerische Schlangen`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`; Codex verifizierte den neuen R139-Test direkt erfolgreich.
- [x] Targeted: `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx src/App.f13_spielbrett_layout.test.tsx src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 145 Testdateien / 633 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Dateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `c1d32a5 — R139: Gegnerische Schlangen mit Spielernamen benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R139-Browser-Smoke spielt bis Spieler 2 aktiv ist und bestätigt `Gehört zu: Spieler 1`, keine sichtbare stale `Spieler: spieler-1`-Copy im Bereich `Gegnerische Schlangen` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R140 Empfohlene Aktion spielerfreundlich benennen

- [x] Scope: Aktiver-Spieler-Entwicklungsdaten zeigen die nächste spielbare Aktion als `Empfohlene Aktion` statt als technische Legalitätsdiagnose `Nächste legale Aktion`; Engine, Regeln, Aktionslabels, Aktionenpanel, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r140_empfohlene_aktion_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch die alte `Nächste legale Aktion`-Copy gerendert wurde.
- [x] GREEN: `src/App.tsx` rendert die Zeile als `Empfohlene Aktion: ...`; `src/App.r52.test.tsx`, `src/App.r54.test.tsx` und `src/App.f14_spielerfuehrung.test.tsx` wurden auf neue positive Copy plus negative stale-Copy-Assertions nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initialer stale-Test-Blocker in `src/App.f14_spielerfuehrung.test.tsx` behoben; final `BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r140_empfohlene_aktion_copy.test.tsx src/App.r52.test.tsx src/App.r54.test.tsx src/App.f14_spielerfuehrung.test.tsx` → 4 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 146 Testdateien / 634 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Dateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `629b2f2 — R140: Empfohlene Aktion spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R140-Browser-Smoke bestätigt `Empfohlene Aktion: Neue Schlange starten mit Karte ...`, keine sichtbare stale `Nächste legale Aktion:`-Copy im Bereich `Aktiver Spieler` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R141 Aktionen spielerfreundlich benennen

- [x] Scope: Sichtbare UI-Copy im `Aktionen`-Panel und in der Spielerführung nutzt `spielbar` statt technischem Legalitätsjargon; Engine, Regeln, Aktionslabels, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r141_aktionen_copy.test.tsx` schlug erwartungsgemäß fehl, weil noch `Legale Aktionen: 5`, `Weitere legale Aktionen` und `Legale Aktionen dieser Phase` sichtbar waren.
- [x] GREEN: `src/components/AktionenPanel.tsx` rendert `Spielbare Aktionen`, `Weitere Aktionen`, `Spielbare Aktionen in dieser Phase`; `src/App.tsx` liefert `Eine spielbare Aktion auswählen.` / `Derzeit keine spielbare Aktion verfügbar...`; stale breite Tests wurden nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initiale Blocker in `src/App.tsx`/`src/App.test.tsx` und später `src/App.r59.test.tsx` behoben; finaler Re-Review `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: final `npm test -- --run src/App.r141_aktionen_copy.test.tsx src/App.r59.test.tsx src/App.test.tsx src/App.f14_spielerfuehrung.test.tsx src/App.f28_no_action_hinweis.test.tsx src/App.r41.test.tsx src/App.r64.test.tsx` → 7 Testdateien / 34 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 147 Testdateien / 635 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `b0cd08b — R141: Aktionen spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R141-Browser-Smoke bestätigt `Spielbare Aktionen: <Zahl>`, `Eine spielbare Aktion auswählen`, `Weitere Aktionen`, `Spielbare Aktionen in dieser Phase`, keine sichtbare stale Legalitäts-Copy im Bereich `Aktionen` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R142 Spielbereich-Landmark spielerfreundlich benennen

- [x] Scope: Der äußere Kompositions-Landmark heißt `Spielbereich` statt technisch/falsch `Legale Aktionen`; das innere Aktionen-Panel bleibt `Aktionen`; Engine, Regeln, Layout, Drag&Drop und Interaktionen unverändert.
- [x] RED: `npm test -- --run src/App.r142_spielbereich_landmark_copy.test.tsx` schlug vor der Produktionsänderung erwartungsgemäß fehl, weil der äußere Bereich noch als `Legale Aktionen` benannt war.
- [x] GREEN: `src/App.tsx` rendert den äußeren Bereich als `aria-label="Spielbereich"`; der R142-Test prüft die enthaltenen Kernregionen und negativ den alten Landmark; breite Tests wurden auf `Spielbereich` bzw. für Buttons auf das innere `Aktionen`-Panel nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initiale Scoping-Blocker in breiten Tests und ein Re-Review-Blocker zu Action-Button-Queries behoben; finaler Re-Review `BLOCKERS: Keine`.
- [x] Targeted: final `npm test -- --run src/App.test.tsx src/App.r142_spielbereich_landmark_copy.test.tsx` → 2 Testdateien / 27 Tests bestanden; Codex-Review-Testlauf → 24 betroffene Testdateien / 57 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 148 Testdateien / 636 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `8d6205e — R142: Spielbereich-Landmark spielerfreundlich benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R142-Browser-Smoke bestätigt den Landmark `Spielbereich` mit `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Spielerübersicht`, keinen Landmark `Legale Aktionen` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R143 Punktetafel deutsch benennen

- [x] Scope: Die sichtbare und semantische Wertungs-Kartenliste im Bereich `Wertung` heißt `Punktetafel` statt englisch `Scoreboard`; CSS-Klassen `scoreboard-*` bleiben technische Styling-Hooks; Engine, Wertungslogik, Layout und Interaktionen unverändert.
- [x] RED: `npm test -- --run src/App.r143_punktetafel_label.test.tsx` schlug erwartungsgemäß fehl, weil noch `Scoreboard` als Region/Heading sichtbar war.
- [x] GREEN: `src/App.tsx` rendert die Wertungs-Kartenliste als `aria-label="Punktetafel"` mit Heading `Punktetafel`; `src/App.r143_punktetafel_label.test.tsx` prüft neue Semantik und negativ alte `Scoreboard`-Copy; F8/F10/R128-Tests wurden nachgezogen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initial `BLOCKERS: Keine` plus Non-Blocker für stärkere negative Textprüfung; Nachzug ergänzt `not.toHaveTextContent(/scoreboard/i)`; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r143_punktetafel_label.test.tsx src/App.f8_scoreboard.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r128_scoreboard_copy.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 149 Testdateien / 637 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `3cd1288 — R143: Punktetafel deutsch benennen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R143-Browser-Smoke bestätigt Region/Heading `Punktetafel`, keine `Scoreboard`-Region, keinen `Scoreboard`-Heading, keine sichtbare `Scoreboard`-Copy im `Wertung`-Bereich und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R144 Punktetafel per Überschrift labeln

- [x] Scope: Die `Punktetafel`-Region im Bereich `Wertung` wird über ihre sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, CSS-Klassen `scoreboard-*`, Wertungslogik, Listeninhalt, Reihenfolge und Layout unverändert.
- [x] RED: `npm test -- --run src/App.r144_punktetafel_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Punktetafel"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `punktetafelTitelId` und labelt die Region per `aria-labelledby`; `src/App.r144_punktetafel_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region, Heading `Punktetafel` und Listeneinträge.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R144-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r144_punktetafel_idref.test.tsx src/App.r143_punktetafel_label.test.tsx src/App.f8_scoreboard.test.tsx src/App.r128_scoreboard_copy.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 150 Testdateien / 638 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `5573dac — R144: Punktetafel per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R144-Browser-Smoke bestätigt `Punktetafel`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label`, keine sichtbare `Scoreboard`-Copy im `Wertung`-Bereich und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R145 Aktionenbereich per Überschrift labeln

- [x] Scope: Der äußere `Aktionen`-Bereich wird über seine sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, CSS-Klassen, Props, innere Regionen, Buttons, Aktionsfluss, Engine-/Regelverhalten und Layout unverändert.
- [x] RED: `npm test -- --run src/App.r145_aktionen_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Aktionen"` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `aktionenTitelId` und labelt die äußere Region per `aria-labelledby`; `src/App.r145_aktionen_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Aktionen`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initialer Header-Version-Non-Blocker behoben; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r145_aktionen_idref.test.tsx src/App.r141_aktionen_copy.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.r142_spielbereich_landmark_copy.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx` → 5 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 151 Testdateien / 639 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `75ac353 — R145: Aktionenbereich per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R145-Browser-Smoke bestätigt `Aktionen`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R146 Spielstatus per Überschrift labeln

- [x] Scope: Der `Spielstatus`-Bereich wird über seine sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, Debuggruppen, `Zugfortschritt`, Engine-/Regelverhalten, Layout und Interaktionen unverändert.
- [x] RED: `npm test -- --run src/App.r146_spielstatus_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Spielstatus"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `spielstatusTitelId` und labelt die Region per `aria-labelledby`; `src/App.r146_spielstatus_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Spielstatus`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R146-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine fachlichen Einwände`.
- [x] Targeted: `npm test -- --run src/App.r146_spielstatus_idref.test.tsx src/App.f3_status_panels.test.tsx src/App.f22_spielende_status.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.r137_partiestatus_copy.test.tsx src/App.r138_zugdiagnose_copy.test.tsx` → 6 Testdateien / 13 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 152 Testdateien / 640 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `eecb8cf — R146: Spielstatus per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R146-Browser-Smoke bestätigt `Spielstatus`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R147 Aktiven Spieler per Überschrift labeln

- [x] Scope: Der `Aktiver Spieler`-Bereich wird über seine sichtbare Überschrift per `aria-labelledby` gelabelt; `aria-live="polite"`, sichtbare Copy, Spieltisch, Aktionenpanel, Spielerführung, Debuggruppen, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r147_aktiver_spieler_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Aktiver Spieler"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `aktiverSpielerTitelId` und labelt die Region per `aria-labelledby`; `src/App.r147_aktiver_spieler_idref.test.tsx` prüft kein `aria-label`, erhaltenes `aria-live="polite"`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Aktiver Spieler`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: initialer Non-Blocker zur `aria-live`-Testhärtung behoben; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r147_aktiver_spieler_idref.test.tsx src/App.r132_aktiver_spieler_profil_copy.test.tsx src/App.r140_empfohlene_aktion_copy.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 153 Testdateien / 641 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `d950a90 — R147: Aktiven Spieler per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R147-Browser-Smoke bestätigt `Aktiver Spieler`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, `aria-live="polite"`, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R148 Spielerübersicht per Überschrift labeln

- [x] Scope: Die `Spielerübersicht`-Region im `Spielbereich` wird über ihre sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, DebugGruppe `Spielerstatus`, `aria-current`, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r148_spieleruebersicht_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Spielerübersicht"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `spieleruebersichtTitelId` und labelt die Region per `aria-labelledby`; `src/App.r148_spieleruebersicht_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Spielerübersicht`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R148-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r148_spieleruebersicht_idref.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r144_punktetafel_idref.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 154 Testdateien / 642 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `90b92aa — R148: Spielerübersicht per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R148-Browser-Smoke bestätigt `Spielerübersicht`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R149 Material und Aufgaben per Überschrift labeln

- [x] Scope: Die `Material und Aufgaben`-Region im `Spielbereich` wird über ihre sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, DebugGruppe `Karten und Aufgaben`, `Aufgabenkarten`-Unterregion, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r149_material_aufgaben_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Material und Aufgaben"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `materialUndAufgabenTitelId` und labelt die Region per `aria-labelledby`; `src/App.r149_material_aufgaben_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Material und Aufgaben`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R149-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine review-relevanten Non-Blocker gefunden`.
- [x] Targeted: `npm test -- --run src/App.r149_material_aufgaben_idref.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx` → 2 Testdateien / 2 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 155 Testdateien / 643 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `c447da9 — R149: Material und Aufgaben per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R149-Browser-Smoke bestätigt `Material und Aufgaben`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R150 Wertung per Überschrift labeln

- [x] Scope: Die `Wertung`-Region im `Spielbereich` wird über ihre sichtbare Überschrift per `aria-labelledby` gelabelt; sichtbare Copy, Ergebnis-/Spielende-Hinweis, `Punkteübersicht`, `Punktetafel`, Wertungslogik, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r150_wertung_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Wertung"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `wertungTitelId` und labelt die Region per `aria-labelledby`; `src/App.r150_wertung_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Wertung`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R150-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r150_wertung_idref.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx src/App.r149_material_aufgaben_idref.test.tsx` → 5 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 156 Testdateien / 644 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen; unveränderte Legacy-Engine-Dateien über 500 Zeilen bleiben als bestehende Debt außerhalb dieses UI-Slices dokumentiert.
- [x] Commit/Push: `a968e87 — R150: Wertung per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R150-Browser-Smoke bestätigt `Wertung`-Region mit `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R151 Aufgabenkarten per Überschrift labeln

- [x] Scope: Die `Aufgabenkarten`-Unterregion im Bereich `Material und Aufgaben` wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; sichtbare Copy, Karten-/Aufgabenanzeige, Material-Region, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r151_aufgabenkarten_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Aufgabenkarten"` gesetzt war.
- [x] GREEN: `src/App.tsx` nutzt `useId()` für `aufgabenkartenTitelId` und labelt die Unterregion per `aria-labelledby`; `src/App.r151_aufgabenkarten_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Aufgabenkarten`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R151-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r151_aufgabenkarten_idref.test.tsx src/App.f7_aufgabenkarten.test.tsx src/App.r149_material_aufgaben_idref.test.tsx src/App.r150_wertung_idref.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 157 Testdateien / 645 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `78573a4 — R151: Aufgabenkarten per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R151-Browser-Smoke bestätigt `Aufgabenkarten`-Region mit `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R152 Empfohlene Aktion per Überschrift labeln

- [x] Scope: Die `Empfohlene Aktion`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; bestehende Sprungziel-ID `empfohleneAktionId`, `tabIndex`, Highlight-Klasse, Button-Labels, sichtbare Copy, weitere Aktionsgruppen, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r152_empfohlene_aktion_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Empfohlene Aktion"` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `empfohleneAktionTitelId` und labelt die Unterregion per `aria-labelledby`; `src/App.r152_empfohlene_aktion_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Empfohlene Aktion`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R152-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r152_empfohlene_aktion_idref.test.tsx src/App.f12_spielbare_aktionen.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx src/App.r145_aktionen_idref.test.tsx` → 8 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 158 Testdateien / 646 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `3bd12e6 — R152: Empfohlene Aktion per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R152-Browser-Smoke bestätigt `Empfohlene Aktion`-Region mit `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R153 Weitere Aktionen per Überschrift labeln

- [x] Scope: Die `Weitere Aktionen`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; Button-Labels, Reihenfolge, Reaktionsaktionen, Aktionshandler, sichtbare Copy, `Empfohlene Aktion`, `Phasenaktion`, Spielerführung/Sprungziele, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r153_weitere_aktionen_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Weitere Aktionen"` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `weitereAktionenTitelId` und labelt die Unterregion per `aria-labelledby`; `src/App.r153_weitere_aktionen_idref.test.tsx` prüft kein `aria-label`, Single-Token-IDREF, genau ein Ziel, Ziel innerhalb der Region und Heading `Weitere Aktionen`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R153-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r153_weitere_aktionen_idref.test.tsx src/App.r152_empfohlene_aktion_idref.test.tsx src/App.f12_spielbare_aktionen.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx src/App.r145_aktionen_idref.test.tsx` → 9 Testdateien / 13 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 159 Testdateien / 647 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `48eda42 — R153: Weitere Aktionen per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R153-Browser-Smoke bestätigt `Weitere Aktionen`-Region mit `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R154 Phasenaktion per Überschrift labeln

- [x] Scope: Die `Phasenaktion`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; bestehende Sprungziel-ID `phasenaktionId`, `tabIndex`, Highlight-/Fokus-Verhalten, CSS-Klasse, Button-Labels/-Handler, sichtbare Copy, `Empfohlene Aktion`, `Weitere Aktionen`, Spielerführung/Sprungziele, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r154_phasenaktion_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Phasenaktion"` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `phasenaktionTitelId` und labelt die Unterregion per `aria-labelledby`; `src/App.r154_phasenaktion_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, Single-Token-IDREF, documentweit eindeutige Label-IDs, genau ein Ziel, Ziel innerhalb der Region, Heading `Phasenaktion` mit Level 3 sowie erhaltene Klasse, ID und `tabIndex`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: initiale Testhärtungs-Non-Blocker behoben; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r154_phasenaktion_idref.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx` → 7 Testdateien / 11 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 160 Testdateien / 648 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `35acb8b — R154: Phasenaktion per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar; R154-Browser-Smoke bestätigt `Phasenaktion`-Region mit `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label`, erhaltene ID und `tabIndex=-1` sowie keine Console-/Page-Errors.

## Evidence — 11.06.2026 R155 Weitere verfügbare Aktionen per Überschrift labeln

- [x] Scope: Die bedingt gerenderte `Weitere verfügbare Aktionen`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; Schlangenhäutung-Hinweis, Reihenfolge-Auswahl, sichtbare Copy, Button-Labels/-Handler, Engine-/Regelverhalten, Layout und andere Regionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch kein eindeutiges `aria-labelledby` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `weitereVerfuegbareAktionenTitelId` und labelt die Hinweise-Unterregion per `aria-labelledby`; `src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, Single-Token-IDREF, documentweit eindeutige Label-IDs, genau ein Ziel, Ziel innerhalb der Region, Heading `Weitere verfügbare Aktionen` mit Level 3 sowie erhaltene Schlangenhäutung-Inhalte.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R155-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.r154_phasenaktion_idref.test.tsx` → 11 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 161 Testdateien / 649 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `15c0e97 — R155: Weitere verfügbare Aktionen per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar und keine Console-/Page-Errors. Die R155-Zielregion ist in der aktuellen Produktionsdeck-Konfiguration ohne injizierten Fixture-Zustand nicht zuverlässig live erreichbar; der exakte IDREF-Vertrag ist lokal per DOM-Regression gegen den betroffenen Spielzustand abgesichert.

## Evidence — 11.06.2026 R156 Endphase per Überschrift labeln

- [x] Scope: Die bedingt gerenderte `Endphase`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; Endphase-Copy, No-Draw-Hinweis, Endspurt-Gating, Aktions-/Phasenlogik, Engine-/Regelverhalten, Layout und andere Regionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r156_endphase_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Endphase"` gesetzt war.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `endphaseTitelId` und labelt die Endphase-Unterregion per `aria-labelledby`; `src/App.r156_endphase_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, Single-Token-IDREF, dokumentweit eindeutige Label-IDs, genau ein Ziel, Ziel innerhalb der Region, Heading `Endphase` mit Level 3 sowie erhaltene CSS-Klasse.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: initialer Testhärtungs-Non-Blocker behoben; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r156_endphase_idref.test.tsx src/App.f20_endphase_hinweis.test.tsx src/App.r154_phasenaktion_idref.test.tsx src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 162 Testdateien / 650 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen; unveränderte Legacy-Engine-Dateien über 500 Zeilen bleiben als bestehende Debt außerhalb dieses UI-Slices dokumentiert.
- [x] Commit/Push: `dabb562 — R156: Endphase per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar und keine Console-/Page-Errors. Die R156-Zielregion ist ein bedingt gerenderter Endspurt-/Endphase-Zustand und ohne injizierten Fixture-Zustand nicht zuverlässig live erreichbar; der exakte IDREF-Vertrag ist lokal per DOM-Regression gegen den betroffenen Endspurt-Spielzustand abgesichert.

## Evidence — 11.06.2026 R157 Phasenregeln per Überschrift labeln

- [x] Scope: Die dauerhaft sichtbare `Phasenregeln`-Unterregion im `Aktionen`-Bereich wird über ihre sichtbare `h3` per `aria-labelledby` gelabelt; Phasenregeln-Copy, Liste `Spielbare Aktionen in dieser Phase`, andere Aktionsgruppen, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r157_phasenregeln_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Phasenregeln"` gesetzt war und kein komponentenlokales `aria-labelledby`.
- [x] GREEN: `src/components/AktionenPanel.tsx` nutzt `useId()` für `phasenregelnTitelId` und labelt die Region per `aria-labelledby`; `src/App.r157_phasenregeln_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, Single-Token-IDREF, dokumentweit eindeutige Label-IDs, genau ein Ziel, Ziel innerhalb der Region, Heading `Phasenregeln` mit Level 3 sowie die erhaltene `h4` `Spielbare Aktionen in dieser Phase`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R157-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r157_phasenregeln_idref.test.tsx` → 1 Testdatei / 1 Test bestanden; angrenzende IDREF-Suite R145/R153/R154/R155/R156 → 5 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 163 Testdateien / 651 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `8d42300 — R157: Phasenregeln per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R157-Browser-Smoke bestätigt `Phasenregeln`-Region mit `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label`, sichtbare `h4` `Spielbare Aktionen in dieser Phase` sowie keine Console-/Page-Errors.

## Evidence — 11.06.2026 R158 Startzone per sichtbarem Text labeln

- [x] Scope: Die `role="button"`-Startzone im `Schlangenbereich` wird über ihren sichtbaren Text `Neue Schlange starten` per `aria-labelledby` gelabelt; `aria-describedby`, Startzonen-Hinweistext, Klick-, Tastatur-, Drag-and-drop-Verhalten, Startaktions-Buttons, Engine-/Regelverhalten und Layout bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r158_startzone_idref.test.tsx` schlug erwartungsgemäß fehl, weil noch ein separates `aria-label="Neue Schlange starten"` gesetzt war und kein eindeutiges `aria-labelledby`.
- [x] GREEN: `src/components/Schlangenbereich.tsx` nutzt das bestehende komponentenlokale `useId()`-Präfix für `startzoneTitelId`; die Startzone nutzt `aria-labelledby`, und der sichtbare `<strong>`-Text `Neue Schlange starten` ist das Labelziel innerhalb der Startzone.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R158-Test; `BLOCKERS: Keine`, `NON-BLOCKERS` nur bestätigende Verifikationsnotizen.
- [x] Targeted: `npm test -- --run src/App.r158_startzone_idref.test.tsx` → 1 Testdatei / 1 Test bestanden; angrenzende IDREF-/DragDrop-Suite R109/R111/F36 → 5 Testdateien / 24 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 164 Testdateien / 652 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `a334f8b — R158: Startzone per Überschrift labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R158-Browser-Smoke bestätigt die Startzone mit `aria-labelledby` auf genau einen sichtbaren Text innerhalb der Startzone, kein separates `aria-label`, erhaltenes `aria-describedby` und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R159 Handkarten per sichtbarem Text labeln

- [x] Scope: Das `Handkarten`-Panel im `Spieltisch` wird über sichtbaren Text `Handkarten` innerhalb der bestehenden Überschrift per `aria-labelledby` gelabelt; sichtbare Überschrift `Handkarten als Kartenleiste`, Landmark-Name `Handkarten`, Kartenliste, Auswahlstatus, Drag-and-drop-Handler, Layout/CSS, Engine-/Regelverhalten und Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r159_handkarten_idref.test.tsx` schlug erwartungsgemäß fehl, weil beide Handkarten-Panels noch kein eigenes `aria-labelledby` hatten und die Label-ID-Liste zu `null` kollabierte.
- [x] GREEN: `src/components/HandkartenPanel.tsx` nutzt `useId()` für `handkartenTitelId`, labelt die äußere Handkarten-`section` per `aria-labelledby`, und der sichtbare Text `Handkarten` innerhalb der bestehenden Überschrift ist das Labelziel; `src/App.r159_handkarten_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, Single-Token-IDREF, dokumentweit eindeutige Label-IDs, genau ein Ziel, Ziel innerhalb des Panels, Zieltext `Handkarten` und sichtbare Überschrift `Handkarten als Kartenleiste`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R159-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r159_handkarten_idref.test.tsx` → 1 Testdatei / 1 Test bestanden; angrenzende Handkarten-/Layout-/DragDrop-Suite R77/R78/F10/F31/F36 → 7 Testdateien / 22 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 165 Testdateien / 653 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `706ca8a — R159: Handkarten per sichtbarem Text labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R159-Browser-Smoke bestätigt das `Handkarten`-Panel mit `aria-labelledby` auf genau einen sichtbaren Text innerhalb des Panels, kein separates `aria-label`, sichtbare Überschrift `Handkarten als Kartenleiste` sowie keine Console-/Page-Errors.

## Evidence — 11.06.2026 R160 Zugfortschritt als Live-Region kennzeichnen

- [x] Scope: Der sichtbare `Zugfortschritt` im `Spielstatus` bleibt über die sichtbare lokale Überschrift `Zugfortschritt` per Single-Token-`aria-labelledby` gelabelt und erhält zusätzlich `aria-live="polite"`; sichtbare Copy, Zugphasenlabels, Engine-/Regelverhalten, Aktionen und Layout bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r160_zugfortschritt_live_region.test.tsx` fiel erwartungsgemäß fehl, weil die `Zugfortschritt`-Region noch kein `aria-live="polite"` hatte.
- [x] GREEN: `src/components/Zugfortschritt.tsx` setzt `aria-live="polite"`; `src/App.r160_zugfortschritt_live_region.test.tsx` prüft kein separates `aria-label`, Single-Token-IDREF, dokumentweit eindeutiges Labelziel, Ziel innerhalb der Region, sichtbare Überschrift und aktuellen sichtbaren Phasentext.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R160-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r160_zugfortschritt_live_region.test.tsx src/App.r115_zugfortschritt_label_idrefs.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.f10_debuggruppen.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 166 Testdateien / 654 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `fd56b24 — R160: Zugfortschritt als Live-Region kennzeichnen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R160-Browser-Smoke bestätigt den `Zugfortschritt` mit `aria-live="polite"`, Single-Token-`aria-labelledby` auf genau ein sichtbares Labelziel innerhalb der Region, kein separates `aria-label`, aktuellen Phasentext sowie keine Console-/Page-Errors.

## Evidence — 11.06.2026 R161 Debuggruppen per sichtbaren lokalen Labels benennen

- [x] Scope: `DebugGruppe` benennt `aside.debug-gruppe-entwicklungsdaten` nicht mehr per separatem `aria-label`, sondern per `aria-labelledby` auf sichtbaren Badge-Span `Entwicklungsdaten:` und einen sichtbaren Text-Span innerhalb des `summary`; bestehende zugängliche Namen `Entwicklungsdaten: <Titel>`, Details/Summary-Verhalten, CSS-Klassen und Inhalte bleiben erhalten.
- [x] RED: `npm test -- --run src/App.r161_debuggruppen_idref.test.tsx` fiel erwartungsgemäß fehl, weil das `aside` noch `aria-label="Entwicklungsdaten: Spielphase"` hatte.
- [x] GREEN: `src/components/DebugGruppe.tsx` nutzt `useId()` für Badge- und Summary-Textziel; `src/App.r161_debuggruppen_idref.test.tsx` prüft kein `aria-label` am `aside`, zwei lokale eindeutige IDREF-Ziele, sichtbaren Badge `Entwicklungsdaten:`, kein Badge-`aria-label`, Summary-Textspan und erhaltenen accessible name.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only inklusive untracked R161-Test und browser-smoke-getriebener Korrekturen; finales Ergebnis `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r161_debuggruppen_idref.test.tsx src/App.r118_entwicklungsdaten_copy.test.tsx src/App.f16_entwicklungsdaten_debug.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f11_debuggruppen_polish.test.tsx src/App.r120_entwicklungsdaten_summary_titel.test.tsx` → 6 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 167 Testdateien / 655 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `a00cfe7`, `5db6e9f`, `a9052b1` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R161-Browser-Smoke bestätigt 5 Debuggruppen ohne `aria-label` am `aside`, lokale `aria-labelledby`-Ziele, sichtbaren Badge `Entwicklungsdaten:`, Summary-Textziel ohne CSS-Pfeil im Labelziel und keine Console-/Page-Errors.

## Evidence — 11.06.2026 R162 Eigene Schlangen sichtbar labeln

- [x] Scope: Eigene Schlangen-Buttons im `Schlangenbereich` werden nicht mehr per separatem `aria-label`, sondern per `aria-labelledby` auf sichtbare lokale Ziele `Schlange` + `<id>` innerhalb des Buttons benannt; `aria-describedby`, Klick-, Tastatur-, Drag-and-drop-Verhalten, Startzone, Gegner-Schlangen, Kartenreihen, Engine-/Regelverhalten und Layout bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r162_eigene_schlange_idref.test.tsx` fiel erwartungsgemäß fehl, weil die eigenen Schlangen-Buttons noch kein `aria-labelledby` hatten.
- [x] GREEN: `src/components/Schlangenbereich.tsx` nutzt das vorhandene komponentenlokale `useId()`-Präfix plus Schlangen-Index für zwei DOM-sichere Labelziele; `src/App.r162_eigene_schlange_idref.test.tsx` prüft zwei App-Instanzen, kein `aria-label`, zwei eindeutige IDREF-Tokens, dokumentweit eindeutige Ziele, Region- und Button-Containment, sichtbare Zieltexte und erhaltenen Accessible Name `Schlange <id>`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: initialer Testhärtungs-Non-Blocker behoben; Re-Review final `BLOCKERS: Keine`, `NON-BLOCKERS: Keine offenen Non-Blocker`.
- [x] Targeted: `npm test -- --run src/App.r162_eigene_schlange_idref.test.tsx src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx src/App.r158_startzone_idref.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 4 Testdateien / 14 Tests bestanden; Codex-Re-Review-Verifikation mit R111/F35 zusätzlich → 5 Testdateien / 15 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 168 Testdateien / 656 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `d353e76 — R162: Eigene Schlangen sichtbar labeln` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R162-Browser-Smoke klickt eine neue Schlange in Produktion an und bestätigt den eigenen Schlangen-Button ohne `aria-label`, mit zwei lokalen `aria-labelledby`-Zielen, Name `Schlange schlange-spieler-1-1` und keine Console-/Page-Errors.

## Evidence — 12.06.2026 R163 Schlangen-Dragstatus als Live-Region kennzeichnen

- [x] Scope: Der permanente Dragstatus im `Schlangenbereich` bleibt `role="status"` und erhält explizit `aria-live="polite"` sowie `aria-atomic="true"`; sichtbare Copy, leerer Initialstatus, Drag-and-drop-Statusmeldungen, Interaktionen, Engine-/Regelverhalten und Layout bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r163_schlangen_dragstatus_live_region.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/components/Schlangenbereich.tsx` ergänzt die beiden Live-Region-Attribute am bestehenden Status; `src/App.r163_schlangen_dragstatus_live_region.test.tsx` prüft zwei App-Instanzen, Region-Scoping, Klasse, `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label` und den leeren Initialstatus.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R163-Test; `BLOCKERS: keine`, `NON-BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/App.r163_schlangen_dragstatus_live_region.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 2 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 169 Testdateien / 657 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `e19f091 — R163: Schlangen-Dragstatus live ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R163-Browser-Smoke bestätigt den Schlangen-Dragstatus mit `class="schlangen-dragstatus"`, `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R164 Schlangenhäutung-Vorschauen als Live-Regionen kennzeichnen

- [x] Scope: Die beiden bestehenden Schlangenhäutung-Vorschauen `Neue Reihenfolge nach Karte ans Ende` und `Neue Reihenfolge nach Umkehr` bleiben `role="status"` und erhalten explizit `aria-live="polite"` sowie `aria-atomic="true"`; sichtbare Vorschau-Copy, `aria-label`s, `aria-describedby`, Kartenauswahl-Verhalten, Button-/Select-Handling, Engine-/Regelverhalten und Layout bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx` fiel erwartungsgemäß fehl, weil die Vorschau-Statuszeilen noch kein `aria-live="polite"` hatten.
- [x] GREEN: `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx` ergänzt die beiden Live-Region-Attribute an beiden bestehenden Vorschau-Statuszeilen; `src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx` prüft die bedingte Schlangenhäutung-Region mit sichtbarer Copy, bestehenden Accessible Names, erhaltenen `aria-describedby`-Verknüpfungen, Auswahlwechsel-Verhalten und beiden Live-Region-Attributen.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: initialer Testabdeckungs-Blocker behoben; Re-Review final `BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx` → 3 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 170 Testdateien / 658 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen.
- [x] Commit/Push: `a750893 — R164: Schlangenhäutung-Vorschauen live ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar und keine Console-/Page-Errors. Die R164-Zielregion ist ein bedingt gerenderter Schlangenhäutung-Zustand und ohne injizierten Fixture-Zustand nicht zuverlässig live erreichbar; der exakte Live-Region-Vertrag ist lokal per DOM-Regression gegen den betroffenen Spielzustand abgesichert.

## Evidence — 12.06.2026 R165 Aktiven Spieler atomar als Live-Region ankündigen

- [x] Scope: Die bestehende Region `Aktiver Spieler` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und `aria-live="polite"`; ergänzt wird nur `aria-atomic="true"`. Sichtbare Copy, `aria-label`-Abwesenheit, innere Regionen `Spieltisch` und `Aktionen`, Handler, Layout und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-atomic="true"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt `aria-atomic="true"` an der bestehenden `Aktiver Spieler`-Region; `src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel und die weiterhin sichtbaren inneren Regionen `Spieltisch` und `Aktionen`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: initialer Review-only fand keine Blocker und einen günstigen Test-Non-Blocker; nach Entfernung der slice-fremden Assertion bestätigte das Re-Review `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r165_aktiver_spieler_live_region_atomic.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.f10_debuggruppen.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 171 Testdateien / 659 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 40).
- [x] Commit/Push: `94943c8 — R165: Aktiven Spieler atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R165-Browser-Smoke bestätigt `Aktiver Spieler` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Aktiver Spieler`, sichtbaren inneren Regionen `Spieltisch`/`Aktionen` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R166 Spielstatus atomar als Live-Region ankündigen

- [x] Scope: Die bestehende Region `Spielstatus` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Copy, `aria-label`-Abwesenheit, innerer `Zugfortschritt`, Handler, Layout und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r166_spielstatus_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Spielstatus`-Region; `src/App.r166_spielstatus_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel, sichtbare Überschrift, spielerfreundliche Phasen-Copy und sichtbaren `Zugfortschritt`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R166-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r166_spielstatus_live_region_atomic.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 172 Testdateien / 660 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 41).
- [x] Commit/Push: `e6715cd — R166: Spielstatus atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R166-Browser-Smoke bestätigt `Spielstatus` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Spielstatus`, sichtbarem `Zugfortschritt`, erwarteter Copy `Aktueller Spielschritt: Karten ausspielen` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R167 Spielerübersicht atomar als Live-Region ankündigen

- [x] Scope: Die bestehende Region `Spielerübersicht` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Spielerstatus-Copy, `aria-label`-Abwesenheit, Summenzeilen, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Spielerübersicht`-Region; `src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel, sichtbare Überschrift und bestehende Spielerstatus-/Summen-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R167-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine Findings`.
- [x] Targeted: `npm test -- --run src/App.r167_spieleruebersicht_live_region_atomic.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 173 Testdateien / 661 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 42).
- [x] Commit/Push: `a07cf83 — R167: Spielerübersicht atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R167-Browser-Smoke bestätigt `Spielerübersicht` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Spielerübersicht`, vorhandener Spielerstatus-Copy, `Schlangen insgesamt: 0` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R168 Material und Aufgaben atomar als Live-Region ankündigen

- [x] Scope: Die bestehende Region `Material und Aufgaben` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Material-/Aufgaben-Copy, `aria-label`-Abwesenheit, innere `Aufgabenkarten`-Region, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r168_material_aufgaben_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Material und Aufgaben`-Region; `src/App.r168_material_aufgaben_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel, sichtbare Überschrift, sichtbare `Aufgabenkarten`-Region und bestehende Material-/Aufgaben-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R168-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine wesentlichen`.
- [x] Targeted: `npm test -- --run src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.r149_material_aufgaben_idref.test.tsx src/App.r166_spielstatus_live_region_atomic.test.tsx src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 174 Testdateien / 662 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 42).
- [x] Commit/Push: `c5a1fb7 — R168: Material und Aufgaben atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R168-Browser-Smoke bestätigt `Material und Aufgaben` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Material und Aufgaben`, vorhandener `Aufgabenkarten`-Unterregion, Material-/Aufgaben-Copy und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R169 Wertung atomar als Live-Region ankündigen

- [x] Scope: Die bestehende Region `Wertung` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Wertungs-/Punktetafel-Copy, `aria-label`-Abwesenheit, innere `Punktetafel`-Region, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r169_wertung_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Wertung`-Region; `src/App.r169_wertung_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel, sichtbare Überschrift, sichtbare `Punktetafel`-Region und bestehende Punktestand-/Gesamt-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R169-Test; `BLOCKERS: Keine`, `NON-BLOCKERS`: bestätigende Hinweise ohne Handlungsbedarf.
- [x] Targeted: `npm test -- --run src/App.r169_wertung_live_region_atomic.test.tsx src/App.r150_wertung_idref.test.tsx src/App.r143_punktetafel_label.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 175 Testdateien / 663 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 37).
- [x] Commit/Push: `cb44356 — R169: Wertung atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R169-Browser-Smoke bestätigt `Wertung` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Wertung`, vorhandener `Punktetafel`-Unterregion, Punktestand-/Gesamt-Copy und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R170 Punktetafel atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Punktetafel`-Unterregion innerhalb `Wertung` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Score-Copy, `aria-label`-Abwesenheit, Listenstruktur, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r170_punktetafel_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Punktetafel`-Region; `src/App.r170_punktetafel_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, eindeutiges lokales Label-Ziel, sichtbare Überschrift, 2 Listeneinträge und bestehende Score-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R170-Test; `BLOCKERS: Keine`, `NON-BLOCKERS`: bestätigende Hinweise ohne Handlungsbedarf.
- [x] Targeted: `npm test -- --run src/App.r170_punktetafel_live_region_atomic.test.tsx src/App.r143_punktetafel_label.test.tsx src/App.r144_punktetafel_idref.test.tsx src/App.r169_wertung_live_region_atomic.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 176 Testdateien / 664 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 39).
- [x] Commit/Push: `218ca46 — R170: Punktetafel atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R170-Browser-Smoke bestätigt `Punktetafel` innerhalb `Wertung` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Punktetafel`, 2 Listeneinträgen, Score-Copy und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R171 Aufgabenkarten atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Aufgabenkarten`-Unterregion innerhalb `Material und Aufgaben` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Aufgabenkarten-Copy, `aria-label`-Abwesenheit, Listenstruktur, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Aufgabenkarten`-Region; `src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift, 3 Listeneinträge und bestehende Aufgabenkarten-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R171-Test; erster Review fand eine Testlücke (Labelziel nur containerweit). Nach Testhärtung auf `document.querySelectorAll` bestätigte der Re-Review: `BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.r171_aufgabenkarten_live_region_atomic.test.tsx src/App.r151_aufgabenkarten_idref.test.tsx src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.f7_aufgabenkarten.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 177 Testdateien / 665 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 43).
- [x] Commit/Push: `e740188 — R171: Aufgabenkarten atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R171-Browser-Smoke bestätigt `Aufgabenkarten` innerhalb `Material und Aufgaben` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Aufgabenkarten`, 3 Listeneinträgen, Aufgabenkarten-Copy und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R172 Spieltisch atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Spieltisch`-Region innerhalb `Aktiver Spieler` behält das sichtbare lokale Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Spieltisch-Copy, `aria-label`-Abwesenheit, `Handkarten`-/`Schlangenbereich`-Unterregionen, Layout, Handler und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r172_spieltisch_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/App.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Spieltisch`-Region; `src/App.r172_spieltisch_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift sowie sichtbare Unterregionen `Handkarten` und `Schlangenbereich`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R172-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`. Codex bestätigte den engen Scope, fehlendes `aria-label` und `src/App.tsx` exakt 500 Zeilen.
- [x] Targeted: `npm test -- --run src/App.r172_spieltisch_live_region_atomic.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 178 Testdateien / 666 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, neuer Test 41).
- [x] Commit/Push: `46cca3f — R172: Spieltisch atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R172-Browser-Smoke bestätigt `Spieltisch` innerhalb `Aktiver Spieler` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Spieltisch`, vorhandenen Unterregionen `Handkarten`/`Schlangenbereich` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R173 Aktionen atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Aktionen`-Region innerhalb `Aktiver Spieler` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Copy, Button-Reihenfolge, Handler, Sprungziel-/Fokusverhalten, Unterregionen und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r173_aktionen_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/components/AktionenPanel.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Aktionen`-Region; `src/App.r173_aktionen_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift sowie sichtbare Unterregionen `Empfohlene Aktion` und `Weitere Aktionen`.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R173-Test; `BLOCKERS: Keine`. Ein Doku-Konsistenz-Non-Blocker (`Version: 1.12`) wurde behoben; Codex bestätigte den engen Scope und die dokumentweite Labelziel-Prüfung.
- [x] Targeted: `npm test -- --run src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r172_spieltisch_live_region_atomic.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 179 Testdateien / 667 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` exakt 500, `src/components/AktionenPanel.tsx` 278, neuer Test 42).
- [x] Commit/Push: `82783d1 — R173: Aktionen atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R173-Browser-Smoke bestätigt `Aktionen` innerhalb `Aktiver Spieler` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Aktionen`, vorhandenen Unterregionen `Empfohlene Aktion`/`Weitere Aktionen` und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R174 Empfohlene Aktion atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Empfohlene Aktion`-Unterregion innerhalb `Aktionen` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Copy, Button-Reihenfolge, Handler, IDs, `tabIndex`, Sprungziel-/Fokusverhalten, benachbarte Unterregionen und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/components/AktionenPanel.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Empfohlene Aktion`-Region; `src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift und den weiterhin vorhandenen empfohlenen Aktionsbutton.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R174-Test; `BLOCKERS: Keine`. Codex bestätigte den engen Scope, fehlendes `aria-label`, unveränderte Handler/IDs/`tabIndex`/Fokus-Sprungziel-Mechanik und den grünen gezielten Test. Hinweis zu `tsconfig.test.json`/`src/**/*.test.tsx` als bestehendes Projektmuster ohne Slice-Blocker.
- [x] Targeted: `npm test -- --run src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx src/App.r152_empfohlene_aktion_idref.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 180 Testdateien / 668 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/components/AktionenPanel.tsx` 279, neuer Test 40).
- [x] Commit/Push: `0c53ab4 — R174: Empfohlene Aktion atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R174-Browser-Smoke bestätigt `Empfohlene Aktion` innerhalb `Aktionen` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Empfohlene Aktion`, vorhandenem empfohlenem Aktionsbutton und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R175 Weitere Aktionen atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Weitere Aktionen`-Unterregion innerhalb `Aktionen` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`. Sichtbare Copy, Button-Reihenfolge, Handler, IDs, Sprungziel-/Fokusverhalten, benachbarte Unterregionen und Engine-/Regelverhalten bleiben unverändert.
- [x] RED: `npm test -- --run src/App.r175_weitere_aktionen_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/components/AktionenPanel.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Weitere Aktionen`-Region; `src/App.r175_weitere_aktionen_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift und die bestehende Regelprüfungs-Copy.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R175-Test; `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`. Codex bestätigte den engen Scope, fehlendes `aria-label`, unveränderte Copy/Button-/Handler-Struktur und grünen gezielten Test.
- [x] Targeted: `npm test -- --run src/App.r175_weitere_aktionen_live_region_atomic.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 181 Testdateien / 669 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/components/AktionenPanel.tsx` 280, neuer Test 40).
- [x] Commit/Push: `1053d7b — R175: Weitere Aktionen atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R175-Browser-Smoke bestätigt `Weitere Aktionen` innerhalb `Aktionen` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Weitere Aktionen`, vorhandener Regelprüfungs-Copy und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R176 Phasenaktion atomar als Live-Region ankündigen

- [x] Scope: Die bestehende `Phasenaktion`-Unterregion innerhalb `Aktionen` behält sichtbares lokales Label, `aria-labelledby`, `id`, `tabIndex`, Highlight-Klasse, Buttons und Handler unverändert und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`.
- [x] RED: `npm test -- --run src/App.r176_phasenaktion_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- [x] GREEN: `src/components/AktionenPanel.tsx` ergänzt die Live-Region-Attribute an der bestehenden `Phasenaktion`-Region; `src/App.r176_phasenaktion_live_region_atomic.test.tsx` prüft Live-/Atomic-Vertrag, fehlendes separates `aria-label`, single-token `aria-labelledby`, dokumentweit genau ein Labelziel, Ziel innerhalb der Region, sichtbare Überschrift und eine sichtbare Phasenaktion im Nachziehphasen-Fixture.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger mechanischer Slice wurde gemäß Fallback manuell umgesetzt und objektiv getestet. Separate Claude-`/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf Worktree inklusive untracked R176-Test; `BLOCKERS: Keine`. Codex bestätigte den engen Scope, unverändertes sichtbares Label/`aria-labelledby`/`id`/`tabIndex`/Buttons/Handler/Highlight und grünen gezielten Test.
- [x] Targeted: `npm test -- --run src/App.r176_phasenaktion_live_region_atomic.test.tsx src/App.r154_phasenaktion_idref.test.tsx` → 2 Testdateien / 2 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 182 Testdateien / 670 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/components/AktionenPanel.tsx` 283, neuer Test 40); unveränderte legacy Engine-Dateien über 500 Zeilen wurden nicht berührt.
- [x] Commit/Push: `ba58092 — R176: Phasenaktion atomar ankündigen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Kernregionen sichtbar. R176-Browser-Smoke bestätigt `Phasenaktion` innerhalb `Aktionen` mit `aria-live="polite"`, `aria-atomic="true"`, ohne `aria-label`, eindeutigem lokalem `aria-labelledby`-Ziel `Phasenaktion`, sichtbarer Überschrift und ohne Console-/Page-Errors.

## Evidence — 12.06.2026 R180 Farbenfusion boardnah spielbar machen

- [x] Scope: Bereits enumerierte `FarbenfusionSpielen`-Aktionen werden nach Auswahl der Farbenfusion-Handkarte direkt im `Schlangenbereich` am passenden eigenen Kartenpaar sichtbar und ausführbar; Engine-Regel, Aktionenliste, Farbkarten-Start-/Anlegepfade, Drag-and-drop und bestehende Labels bleiben erhalten.
- [x] Normquelle: `docs/GAME_SPEC.md` R7.1 geprüft; externer Fetch von `https://schlangentanz.ch/rules` war wegen HTTP 403 blockiert, daher keine neue Regelableitung.
- [x] RED: `npm test -- --run src/App.r180_farbenfusion_boardziel.test.tsx` fiel erwartungsgemäß fehl, weil Zielklasse und board-lokaler Farbenfusion-Button fehlten.
- [x] GREEN: `src/App.tsx` reicht `FarbenfusionSpielen`-Aktionen an `Schlangenbereich`; `src/components/Schlangenbereich.tsx` matcht ausgewählte Handkarte + eigene Zielschlange + Zielkarte, rendert `Farbenfusion hier spielen`, und `src/App.css` markiert das Ziel sichtbar.
- [x] Review-Fix: Codex fand einen Keyboard-Blocker durch den Eltern-`li role="button"`; ein zusätzlicher RED-Nachweis (`fireEvent.keyDown(...)` durfte nicht `defaultPrevented` werden) wurde ergänzt und mit frühem Return für verschachtelte Buttons behoben.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert.
- [x] Codex Review/Re-Review: initialer Keyboard-Blocker behoben; final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.r180_farbenfusion_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 6 Testdateien / 26 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 186 Testdateien / 676 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 463, `src/components/Schlangenbereich.tsx` 429, neuer Test 68).
- [x] Commit/Push: `9a7f46e — R180: Farbenfusion boardnah spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; deterministischer Playwright-Smoke spielt in Produktion bis zur Farbenfusion, bestätigt den board-lokalen Zielbutton mit `schlangekarte__karte--farbenfusion-ziel`, führt ihn aus, sieht `farbenfusion-02` in der Schlange und meldet keine Console-/Page-Errors.

## Evidence — 12.06.2026 R181 Schlangenfrass boardnah spielbar machen

- [x] Scope: Bereits enumerierte `SchlangenfrassSpielen`-Aktionen werden nach Auswahl der Schlangenfrass-Handkarte direkt im `Schlangenbereich` auf eigenen Zielkarten sichtbar und ausführbar. Die Zwei-Gegner-Zielauswahl bleibt bewusst ausgeschlossen, weil sie eine eigene Mehrfachziel-Interaktion braucht.
- [x] RED: `npm test -- --run src/App.r181_schlangenfrass_boardziel.test.tsx` fiel erwartungsgemäß fehl, weil Zielklasse und board-lokaler Schlangenfrass-Button fehlten.
- [x] GREEN: `src/App.tsx` reicht `SchlangenfrassSpielen`-Aktionen an `Schlangenbereich`; `src/components/Schlangenbereich.tsx` matcht ausgewählte Handkarte + eigene Zielschlange + Zielkarte exakt gegen die Engine-Aktion, rendert `Schlangenfrass hier spielen`, und `src/App.css` markiert das Ziel sichtbar.
- [x] Test-Härtung: Der R181-Test prüft zusätzlich, dass die spätere Zwei-Gegner-Zielauswahl nicht als falscher Einzelkarten-Boardbutton erscheint.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert.
- [x] Codex Review/Re-Review: final `BLOCKERS: none`; Codex bestätigte keine Exposition des Zwei-Gegner-Flows und keine R180-Regression.
- [x] Targeted: `npm test -- --run src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 6 Testdateien / 27 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 187 Testdateien / 678 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 470, `src/components/Schlangenbereich.tsx` 456, neuer Test 81).
- [x] Commit/Push: `3aa62e5 — R181: Schlangenfrass boardnah spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; deterministischer Playwright-Smoke mit `Math.random = 0.1` startet eine eigene Schlange mit `rot-15`, wählt `schlangenfrass-04`, bestätigt den board-lokalen Zielbutton mit `schlangekarte__karte--schlangenfrass-ziel`, führt ihn aus, sieht `rot-15` entfernt und meldet keine Console-/Page-Errors.

## Evidence — 12.06.2026 M1a Waldtanz-Arena-Spielbrett

- [x] Scope: Erster mittlerer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: zentrale Waldarena, Handkarten im Spieltisch board-nah unten, Schlangenbereich als primäre Spielfläche, Status/Spieler/Material/Wertung als Grid-führbare Nebenbereiche. Engine-Regeln, Aktionshandler, Debugdetails und bestehende Board-Interaktionen bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m1a_waldtanz_arena_layout.test.tsx` fiel zunächst fehl, weil Waldtanz-Klassen/Layoutvertrag und board-nahe Handstruktur fehlten.
- [x] GREEN: `src/App.tsx` ergänzt die Waldtanz-/Arena-Klassen und ordnet `Schlangenbereich` vor `Handkarten`; `src/App.css` zentriert Shell/Spielbereich, ergänzt dotted forest background, Grid-Areas, Arena-Gradient, großen Pill-Radius und board-nahe Handposition; `src/App.m1a_waldtanz_arena_layout.test.tsx` prüft DOM- und CSS-Vertrag.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert.
- [x] Codex Review/Re-Review: initiale CSS-/Regression-Blocker behoben (`justify-items: center`, Selector-Reihenfolge für `.schlangenbereich`, direkter Token-Background-Vertrag); final `BLOCKERS: None`, `NON-BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1a_waldtanz_arena_layout.test.tsx src/App.f31_spieltisch_layout.test.tsx src/App.f13_spielbrett_layout.test.tsx src/App.r172_spieltisch_live_region_atomic.test.tsx src/App.r159_handkarten_idref.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx` → 10 Testdateien / 34 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 188 Testdateien / 679 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `2236659 — M1a: Waldtanz-Arena-Spielbrett anlegen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Browser-Smoke bestätigt `Spielbereich`, `Aktiver Spieler`, `Spieltisch`, `Schlangenbereich`, `Handkarten`, `Aktionen`, die Klassen `spielbereich--waldtanz`/`info-panel--waldtanz-arena`/`spielbrett--waldtanz`, Arena-Gradient, Schlangenbereich vor Handkarten, Handkarten visuell unter der Schlangenfläche, Aktionen direkt nach dem Spieltisch und keine Console-/Page-Errors.

## Evidence — 12.06.2026 M1b Waldtanz-Aktionsdock

- [x] Scope: Zweiter mittlerer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: schnelle Kontextaktionen als board-naher Dock (`Empfohlene Aktion` + `Phasenaktion`), lange Fallback-Liste `Weitere Aktionen` sichtbar erhalten, aber nachgeordnet und scroll-contained. Engine-Regeln, Handler, Sonderkarten-Ziele und bestehende Board-Interaktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1b_aktionsdock_layout.test.tsx` fiel erwartungsgemäß fehl, weil Dock-Klasse, Schnellzug-Container und Reihenfolge `Empfohlen → Phasenaktion → Weitere Aktionen` fehlten.
- [x] GREEN: `src/components/AktionenPanel.tsx` gruppiert `Empfohlene Aktion` und `Phasenaktion` in `.aktionen-dock__schnellzug`, setzt `aktionen-panel--waldtanz-dock` am Aktionenbereich und lässt `Weitere Aktionen` danach als Fallback-Region stehen. `src/App.css` ergänzt sticky Dock, kompakte Schnellzug-/Aktionslisten-Spalten und begrenzt die Fallback-Liste.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert.
- [x] Codex Review: `BLOCKERS: None`; Codex bestätigte erhaltene Labels, Handler, IDREF-/Fokus-Ziele, Live-Region-Attribute, mittleren sichtbaren Scope und gezielte Regressionen.
- [x] Targeted: `npm test -- --run src/App.m1b_aktionsdock_layout.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx src/App.r175_weitere_aktionen_live_region_atomic.test.tsx src/App.r176_phasenaktion_live_region_atomic.test.tsx src/App.f27_sprungziel_fokus.test.tsx` → 6 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 189 Testdateien / 680 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `92c380c — M1b: Waldtanz-Aktionsdock verdichten` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Browser-Smoke bestätigt `aktionen-panel--waldtanz-dock`, `position: sticky`, `Aktionen` direkt nach `Spieltisch`, Schnellzug mit `Empfohlene Aktion`/`Phasenaktion`, Reihenfolge vor `Weitere Aktionen`, Fallback-Copy, scroll-contained `Weitere Aktionen` und keine Console-/Page-Errors.

## Evidence — 12.06.2026 M1c Stitch-Sidebar-HUD

- [x] Scope: Dritter mittlerer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: `Spielstatus`, `Spielerübersicht`, `Material und Aufgaben` und `Wertung` rahmen die zentrale Arena als kompakte Wald-HUD-Plaketten. Engine-Regeln, Handler, Aktionsdock, Board-Ziele und Debug-Inhalte bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m1c_stitch_sidebars.test.tsx` fiel erwartungsgemäß fehl, weil `waldtanz-hud`-Klassen, kompakte HUD-CSS-Verträge und stärkere Arena-Gewichtung fehlten.
- [x] GREEN: `src/App.tsx` ergänzt die HUD-Klassen und ordnet `Aufgabenkarten`/`Punktetafel` vor die jeweiligen Entwicklungsdaten; `src/App.css` macht die Sidebars scroll-contained, rund/chunky, mit Icon-Plaketten und gewichtet die Arena stärker.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert.
- [x] Codex Review/Re-Review: initialer Blocker zur Debug-Dominanz in Material-/Wertungs-HUDs wurde test-first reproduziert und behoben; final `BLOCKERS: None`, `NON-BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1c_stitch_sidebars.test.tsx src/App.f10_debuggruppen.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.r169_wertung_live_region_atomic.test.tsx src/App.r170_punktetafel_live_region_atomic.test.tsx src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` → 8 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 190 Testdateien / 681 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `fa2a33b — M1c: Waldtanz-Sidebars als HUD verdichten` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Browser-Smoke bestätigt Desktop-Grid `"status arena spieler" / "material arena wertung"`, `spielbrett--waldtanz`, vier `waldtanz-hud`-Sidebars mit `overflow: auto`, Icon-Plaketten (`🌿`, `🐍`, `🎒`, `⭐`), Entwicklungsdaten-Opacity `0.72`, `Aufgabenkarten` vor Material-Entwicklungsdaten, `Punktetafel` vor Wertungs-Entwicklungsdaten und keine Console-/Page-Errors.

## Evidence — 12.06.2026 R182 Farbenschutz boardnah spielbar machen

- [x] Scope: Bereits enumerierte `FarbenschutzSpielen`-Aktionen werden nach Auswahl der Farbenschutz-Handkarte direkt auf eigenen Schlangen im `Schlangenbereich` sichtbar und ausführbar. Der Slice komplettiert die board-nahe Sonderkarten-Zielauswahl für eigene Schlangen nach R180/R181, ohne Engine-Regeln, Drag-and-drop, Anlegepfade oder die Fallback-Aktionsliste zu ersetzen.
- [x] RED: `npm test -- --run src/App.r182_farbenschutz_boardziel.test.tsx` fiel erwartungsgemäß fehl, weil Zielklasse und board-lokaler Farbenschutz-Button fehlten; ein späterer Live-Smoke-Blocker wurde mit CSS-Vertrag gegen Aktionsdock-Pointer-Interception ergänzt.
- [x] GREEN: `src/App.tsx` reicht `FarbenschutzSpielen`-Aktionen an `Schlangenbereich`; `src/components/Schlangenbereich.tsx` matcht ausgewählte Handkarte + eigene Zielschlange exakt gegen die Engine-Aktion und rendert `Farbenschutz hier spielen`; `src/App.css` markiert die geschützte Waldlichtung sichtbar und hält Handkarten trotz sticky Aktionsdock klickbar.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert. Separate `/simplify`-Vorprüfung war nicht verfügbar.
- [x] Codex Review/Re-Review: initial keine Blocker; Live-Smoke-Follow-up zur Aktionsdock-Überlagerung wurde erneut reviewt. Final `BLOCKERS: None`; Testhärtung für scoped CSS-Vertrag wurde übernommen.
- [x] Targeted: `npm test -- --run src/App.r182_farbenschutz_boardziel.test.tsx src/App.m1b_aktionsdock_layout.test.tsx` → 2 Testdateien / 3 Tests bestanden; zuvor auch R180/R181-Regressionssatz grün.
- [x] Full Gates: `npm test -- --run` → 191 Testdateien / 683 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push: `b55a9c2 — R182: Farbenschutz boardnah spielbar machen`, `048ebeb — R182: Handkarten vor Aktionsdock klickbar halten`, `51e15f6 — R182: Aktionsdock blockiert Handkarten nicht` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`; Feature-Code bis `51e15f6`, Doku-HEAD danach erneut bereitgestellt und gesmoked).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; deterministischer Playwright-Smoke mit `Math.random = 0.65` startet eine eigene Schlange mit `blau-01`, klickt `farbenschutz-04` trotz sticky Aktionsdock, bestätigt `.schlangekarte--farbenschutz-ziel` mit grünem Waldlichtungs-Gradient und `borderColor rgb(75, 103, 0)`, führt den board-lokalen Button aus, sieht `Status: geschützt`, bestätigt `pointer-events: none` am Dock plus `pointer-events: auto` an Dock-Buttons und meldet keine Console-/Page-Errors.

## Evidence — 13.06.2026 R183 Farbendieb boardnah spielbar machen

- [x] Scope: Bereits enumerierte `FarbendiebSpielen`-Aktionen werden nach Auswahl der Farbendieb-Handkarte direkt auf gegnerischen Karten im `Schlangenbereich` sichtbar und ausführbar. Der Slice erweitert M2/Sonderkarten-Boardziele, ohne Engine-Regeln, Reaktionslogik, Drag-and-drop, Anlegepfade oder die Fallback-Aktionsliste zu ersetzen.
- [x] RED: `npm test -- --run src/App.r183_farbendieb_boardziel.test.tsx` fiel erwartungsgemäß fehl, weil Zielklasse, CSS-Zielstil und board-lokale Farbendieb-Buttons fehlten. Ein Codex-Hinweis zu mehrfachen Einfügepositionen wurde test-first gehärtet: Der R183-Test erwartet exakt zwei board-nahe Buttons und sichtbare Labels `Farbendieb auf Position 1/2`.
- [x] GREEN: `src/App.tsx` reicht `FarbendiebSpielen`-Aktionen an `Schlangenbereich`; `src/components/Schlangenbereich.tsx` matcht ausgewählte Handkarte + gegnerische Zielkarte exakt gegen Engine-Aktionen, rendert je legaler Einfügeposition einen eindeutigen board-lokalen Button und führt `onAktion(aktion)` aus; `src/App.css` markiert Beutekarten sichtbar im Waldtanz-Stil.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; der enge manuelle Fallback wurde offen dokumentiert. Separate `/simplify`-Vorprüfung war nicht verfügbar.
- [x] Codex Review/Re-Review: initial `BLOCKERS: None`; Non-Blocker zu mehrdeutigen sichtbaren Labels und fehlender Positionsanzahl-Assertion wurden behoben. Final `BLOCKERS: None`; Codex bestätigte eindeutige Positionslabels und den gehärteten Test.
- [x] Targeted: `npm test -- --run src/App.r183_farbendieb_boardziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 8 Testdateien / 31 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 192 Testdateien / 685 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 484, `src/components/Schlangenbereich.tsx` 499, neuer Test 88).
- [x] Commit/Push: R183-Release-Commit auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; deterministischer Playwright-Smoke erzeugt eine eigene und eine gegnerische Schlange, wählt `farbendieb-01`, bestätigt `.schlangekarte__karte--farbendieb-ziel`, genau zwei board-lokale Positionsbuttons, führt `Farbendieb auf Position 2` aus, sieht die gestohlene Karte in der eigenen Schlange und nicht mehr bei der gegnerischen Schlange und meldet keine Console-/Page-Errors.

## Evidence — 13.06.2026 M2c Schlangenblockade boardnah spielbar machen

- [x] Scope: Bereits enumerierte `SchlangenblockadeSpielen`-Aktionen werden nach Auswahl der Schlangenblockade-Handkarte direkt auf gegnerischen Schlangen im `Schlangenbereich` sichtbar und ausführbar. Der Slice erweitert die M2-Boardziel-Interaktionen, ohne Engine-Regeln, Reaktionslogik, Drag-and-drop, Aktionsdock, Handkarten oder bestehende R180–R183-Sonderkarten-Ziele zu ersetzen.
- [x] RED: `npm test -- --run src/App.m2c_schlangenblockade_boardziel.test.tsx` fiel initial mit 2 erwarteten Fehlern fehl, weil `schlangekarte--blockade-ziel`, der board-lokale Button und der CSS-Zielstil fehlten.
- [x] GREEN: `src/App.tsx` filtert vorhandene `SchlangenblockadeSpielen`-Aktionen; `src/components/Schlangenbereich.tsx` reicht die Gegnerdarstellung in `src/components/GegnerSchlangenListe.tsx` aus und bleibt unter 500 Zeilen; `GegnerSchlangenListe` erhält Farbendieb-Ziele und ergänzt `Schlangenblockade hier spielen`; `src/App.css` markiert blockierbare Gegnerschlangen sichtbar im Waldtanz-Stil.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: `BLOCKERS: None`; Codex bestätigte Testintegrität, Engine-Autorität, Datei-Limits, erhaltene R180–R183-Regressionen, eindeutige Labels, keine nested-button-Probleme und mittleren Slice-Scope.
- [x] Targeted: `npm test -- --run src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 10 Testdateien / 34 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 193 Testdateien / 687 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 491, `src/components/Schlangenbereich.tsx` 464, `src/components/GegnerSchlangenListe.tsx` 120, neuer Test 81).
- [x] Commit/Push: `32bff47 — M2c: Schlangenblockade boardnah spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; deterministischer Playwright-Smoke mit `Math.random = 0.6` spielt bis zu einer gegnerischen Schlange, wählt `schlangenblockade-04`, bestätigt `.schlangekarte--blockade-ziel` auf `schlange-spieler-2-1`, `backgroundHasGradient: true`, board-lokalen Button `Schlangenblockade hier spielen`, führt ihn aus, sieht `schlangenblockade-04` auf der Zielschlange und meldet keine Console-/Page-Errors.

## Evidence — 13.06.2026 M3 Sonniges Nest Lobby

- [x] Scope: Mittlerer Google-Stitch-Vertical für `M3 Lobby/Spielstart`: Ein sichtbares `Das sonnige Nest` mit Holzschild/Lobby-Code, Baumhöhlen-Slots, 1–3-KI-Gegnerwahl und Startbuttons ergänzt den bestehenden Waldtanz-Game-Board-Screen. Engine-Regeln, Waldtanz-Spielbrett, Aktionsdock, Drag-and-drop und vorhandene Hero-/IDREF-Verträge bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m3_sonniges_nest_lobby.test.tsx` fiel erwartungsgemäß fehl, weil Lobby-Region, Startbuttons und CSS-Vertrag fehlten.
- [x] GREEN: `src/components/SonnigesNestLobby.tsx` rendert Lobby-Code `XK9-B4Z`, `Slippy Host`, `Orange Crush`, zwei wartende KI-Baumhöhlen und Buttons `Duell/Waldparty/Große Runde`; `src/App.tsx` startet neue Partien über `starteAusspielphase(erstelleSpielzustand(ki + 1))`; `src/App.css` ergänzt Stitch-Holzschild, Baumhöhlen, 3px Dark-Forest-Borders, 3rem-Radien und Block-Schatten.
- [x] Test-Härtung: Nach Codex-Hinweis prüft der M3-Test nicht nur 3 KI, sondern klickt 2 KI, 3 KI und zurück auf 1 KI; `Spielerübersicht` beweist dabei 3/4/2 Engine-Spieler und das bestehende `Spieltisch`-Waldtanz-Brett bleibt sichtbar.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- [x] Codex Review/Re-Review: initialer Non-Blocker zur 1–3-KI-Testabdeckung behoben; nach Hero-Restore final `BLOCKERS: None`. Codex bestätigte 1/2/3-KI-Abdeckung, erhaltene Hero-/IDREF-Verträge und `src/App.tsx` unter 500 Zeilen.
- [x] Targeted: `npm test -- --run src/App.m3_sonniges_nest_lobby.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.m1c_stitch_sidebars.test.tsx src/App.f31_spieltisch_layout.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 7 Testdateien / 27 Tests bestanden; Hero-/IDREF-Regressionssatz `src/App.test.tsx src/App.r117_player_hero.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.m3_sonniges_nest_lobby.test.tsx` → 4 Testdateien / 30 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 194 Testdateien / 689 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 497, `src/components/SonnigesNestLobby.tsx` 62, neuer Test 64).
- [x] Commit/Push: `179c36f — M3: Sonniges Nest Lobby spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`; stabile Production-Alias statt ephemeral URL dokumentiert).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Playwright-Smoke bestätigt `Das sonnige Nest`, Lobby-Code `XK9-B4Z`, vier Baumhöhlen, `Große Runde starten (3 KI)`, danach `Aktive Partie: Du + 3 KI`, `Spieler 4` in der Spielerübersicht, weiterhin `spielbrett--waldtanz`, erhaltene Hero-IDREF und keine Console-/Page-Errors.

## Evidence — 13.06.2026 M4 Schlangenbuch Regeln

- [x] Scope: Mittlerer Google-Stitch-Vertical für `M4 Regeln/Spielbuch`: Ein sichtbares `Das Schlangenbuch` wird als Wald-Pop-up-Buch in der Lobby ergänzt. Es erklärt Vorbereitung, Zugablauf und Wertung spielnah als Doppelseite mit Regelkarten, ohne Engine-Regeln, Waldtanz-Brett, Lobby-Startbuttons, Aktionsdock oder Board-Interaktionen zu verändern.
- [x] RED: `npm test -- --run src/App.m4_schlangenbuch_regeln.test.tsx` fiel erwartungsgemäß fehl, weil Regelbuch-Region, Tabs, Doppelseite, Regelkarten und CSS-Pop-up-Buch-Vertrag fehlten.
- [x] GREEN: `src/components/Schlangenbuch.tsx` rendert `Das Schlangenbuch` mit Tabs `Vorbereitung`/`Zugablauf`/`Wertung`, zwei Buchseiten, Regelkarten `1. Karte wählen`, `2. Schlange bauen`, `3. Aufgabe erfüllen` und spielnahen Tipps; `src/components/SonnigesNestLobby.tsx` hängt es in `Das sonnige Nest` ein; `src/App.css` ergänzt 3px Dark-Forest-Borders, 3rem-Radien, Block-Schatten, Doppelseiten-Grid und Page-Curl.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- [x] Codex Review: `BLOCKERS: None`; Codex bestätigte Testintegrität, statische Kapitel-Tabs ohne ARIA-Overreach, 3px-Dark-Forest-Border-Vertrag, Zeilenbudgets und M3/M1-Regressionen.
- [x] Targeted: `npm test -- --run src/App.m4_schlangenbuch_regeln.test.tsx src/App.m3_sonniges_nest_lobby.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.m1c_stitch_sidebars.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 6 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 195 Testdateien / 691 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 497, `src/components/SonnigesNestLobby.tsx` 64, `src/components/Schlangenbuch.tsx` 51, neuer Test 50).
- [x] Commit/Push: `3154617 — M4: Schlangenbuch-Regeln spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`; stabile Production-Alias dokumentiert).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Playwright-Smoke bestätigt `Das Schlangenbuch` in `Das sonnige Nest`, Tabs `Vorbereitung`/`Zugablauf`/`Wertung`, zwei `.schlangenbuch__seite`-Buchseiten, Regelkarten `1. Karte wählen`/`2. Schlange bauen`/`3. Aufgabe erfüllen`, erhaltene Lobby-Startbuttons, weiterhin `spielbrett--waldtanz`, 3px `rgb(6, 57, 7)`-Border, Block-Schatten, zweispaltiges Buchlayout und keine Console-/Page-Errors.

## Evidence — 13.06.2026 M4b Sieger-Party Ergebnisse

- [x] Scope: Mittlerer Google-Stitch-Vertical für die Ergebnis-/Sieg-Ansicht: Bei `Spielende` erscheint im `Spielbereich` eine sichtbare `Sieger-Party` mit Waldlichtung, Konfetti, gekrönter Schlange, Final-Punktetafel und `Noch einmal spielen`-Button. Engine-Regeln, Scoring, Waldtanz-Brett, Lobby, Schlangenbuch und bestehende Ergebnis-/Debugtexte bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m4b_sieger_party_results.test.tsx` fiel zunächst erwartungsgemäß, weil `Sieger-Party`, Ergebnis-Plakette, Neustart und CSS-Vertrag fehlten; nach Codex-Blocker wurde ein RED-Vertrag ergänzt, dass das `party`-Grid nur über `spielbereich--mit-sieger-party` bei Spielende aktiv ist.
- [x] GREEN: `src/components/SiegerParty.tsx` rendert die Party engine-abgeleitet über `berechneGewinner`/`berechneSpielzustandGesamtwertung`; `src/App.tsx` hängt sie bedingt in den `Spielbereich` ein; `src/App.css` ergänzt Stitch-Party-Styles mit 3px Dark-Forest-Borders, 3rem-Radien, hard shadows, radialer Waldlichtung, Konfetti, Krone und Score-Pills.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- [x] Codex Review/Re-Review: initialer Blocker zur permanenten `party`-Gridrow wurde test-first behoben; final `BLOCKERS: None`. Codex bestätigte bedingten Grid-Vertrag, 3-KI-Neustartabdeckung, Engine-Autorität, Lint/Typecheck und `src/App.tsx` bei 499 Zeilen.
- [x] Targeted: `npm test -- --run src/App.m4b_sieger_party_results.test.tsx src/App.m1c_stitch_sidebars.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx` → 3 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 196 Testdateien / 695 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 499, `src/components/SiegerParty.tsx` 84, neuer Test 92).
- [x] Commit/Push: `551e7fe — M4b: Sieger-Party Ergebnisansicht spielbar machen` auf `origin/main`.
- [x] Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`; stabile Production-Alias dokumentiert).
- [x] Smoke: Production-Alias `/` und `/game` liefern HTTP 200; Playwright-Smoke bestätigt `Spielbereich`, `Spieltisch`, `Das sonnige Nest`, `Große Runde starten (3 KI)` → `Spieler 4: 5 Handkarten`, keine Console-/Page-Errors; Bundle-/Asset-Nachweis der finalen Produktion enthält `.sieger-party`, `spielbereich--mit-sieger-party`, `Sieger-Party` und `Noch einmal spielen`. Die exakte `Spielende`-Party bleibt lokal deterministisch per `initialZustand` regressionsgetestet, weil eine komplette Endgame-Durchspiel-Automation nicht bounded/reliabel war.

## Evidence — 13.06.2026 M5a Boardziele vor Aktionsdock schützen

- [x] Scope: Mittlerer Playability-Vertical: Ein echter Browser-Probe fand, dass sichtbare `Schlangenbereich`-Startziele vom sticky `Aktionen`-Dock abgefangen werden konnten (`subtree intercepts pointer events`). Der Slice schützt board-nahe Ziele, ohne Engine, Aktionsfluss, Drag-and-drop oder Dock-Struktur umzubauen.
- [x] RED: `npm test -- --run src/App.m5a_board_targets_dock_clearance.test.tsx` fiel initial wegen fehlendem Board-Ziel-Scroll-/Stacking-Vertrag.
- [x] GREEN: `src/App.css` hebt `spielbrett--waldtanz` als eigene Stacking-Ebene über Dock-Overlap und ergänzt `scroll-margin-bottom: 18rem` für `.schlangekarte__anlegebutton`; `scripts/live_smoke.mjs` reconciliert die gesunde Production-DOM-Form über exakte Region/Heading/Text-Sichtbarkeit.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und dokumentiert.
- [x] Codex Review: M5a-Diff `BLOCKERS: None`; Smoke-Skript-Reconciliation Re-Review `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m5a_board_targets_dock_clearance.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.m1b_aktionsdock_layout.test.tsx` → 3 Testdateien / 4 Tests bestanden; Smoke-Skript-targeted `tests/r107_live_smoke_script.test.ts` ebenfalls grün.
- [x] Full Gates: `npm test -- --run` → 197 Testdateien / 696 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- [x] Deploy/Smoke: Feature-Commit und finaler Doku-/Smoke-Skript-HEAD auf Production-Alias bereitgestellt und erneut gesmoked. Production-Smoke: `/` und `/game` HTTP 200, `npm run smoke:production` grün, Playwright klickt ein sichtbares `Schlangenbereich-Start`-Boardziel, sieht `Zuletzt ausgeführt: Neue Schlange starten`, eine neue eigene Schlange, `dockPointerEvents: none`, `dockButtonPointerEvents: auto`, `boardPosition: relative`, `boardZIndex: 3`, `startScrollMarginBottom: 324px`, keine Console-/Page-Errors.

## Evidence — 13.06.2026 M5b Gegnerzüge vorspulen

- [x] Scope: Mittlerer Playability-Vertical nach Google-Stitch-M1/M5: KI-Gegner werden nicht mehr wie manuelle Button-Listen gespielt, sondern über `Gegnerzüge bis zu deinem Zug abspielen` als sichtbarer Waldtanz-Gegnerzug bis zum nächsten menschlichen Zug vorgespult. Engine-Autorität, Reaktionsregeln, Lobby/Board/HUD und menschliche Board-Interaktionen bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m5b_ki_zug_vorspulen.test.tsx` fiel initial erwartungsgemäß fehl, weil Vorspulbutton, Gegnerzug-Bühne und Protokoll fehlten; Review-Funde wurden test-first gehärtet (`src/kiZug.test.ts`, R53 global ohne board-lokale KI-Einzelbuttons).
- [x] GREEN: `src/kiZug.ts` spielt KI-Phasen über Engine-Funktionen bis Mensch/Spielende/menschliche Reaktion und stoppt mit 80-Schritt-Sicherung; `src/components/KiZugBuehne.tsx` protokolliert Gegneraktionen sichtbar; `AktionenPanel` zeigt für KI nur den Vorspulbutton plus Hinweis; `App.tsx` blendet KI-Einzelaktionen auch im Board aus und extrahiert den Status-HUD in `SpielstatusPanel`.
- [x] Claude Code / `/simplify`: `claude --model opusplan` und `/simplify` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu menschlichen Reaktionen, stale R53 und board-lokalen KI-Einzelbuttons wurden behoben; final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/kiZug.test.ts src/App.m5b_ki_zug_vorspulen.test.tsx src/App.r53.test.tsx src/App.test.tsx src/App.f14_spielerfuehrung.test.tsx src/App.r52.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 7 Testdateien / 35 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 199 Testdateien / 698 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 473, `src/components/AktionenPanel.tsx` 299, `src/kiZug.ts` 121, neue Tests 51/32).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `a4f7cee` und Smoke-Blocker-Fix `013e641` wurden nach `origin/main` gepusht und per Vercel Production auf `https://schlangentanz-v2.vercel.app` bereitgestellt. Erster Alias-Smoke fand den echten Browser-Blocker `spielbrett--waldtanz` intercepts action-dock click; der test-first Fix hebt nur den sticky Aktionsdock auf `z-index: 4` über das Brett `z-index: 3`, während `pointer-events: none` am Dock und `pointer-events: auto` an Controls erhalten bleiben. Finaler Smoke: `/` und `/game` HTTP 200, `npm run smoke:production` grün, 3-KI-Lobby → erster Menschenzug → `Gegnerzüge bis zu deinem Zug abspielen` → Rückkehr zu Spieler 1, Gegnerzug-Protokoll für Spieler 2/3/4 sichtbar, keine Console-/Page-Errors.

## Evidence — 14.06.2026 M5c Waldpfad-Zugleiste

- [x] Scope: Mittlerer sichtbarer Playability-Vertical nach M5b: Der `Spieltisch` erhält eine board-nahe Waldpfad-Zugleiste mit Zugreihenfolge, aktiver Spielfigur, Mensch/KI-Badges, aktueller Phase und Gegnerzug-Abschlussstatus. Engine-Regeln, Aktionsdock, Boardziele, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m5c_waldpfad_zugleiste.test.tsx` fiel zunächst erwartungsgemäß fehl, weil die Region `Zugpfad` im `Spieltisch` fehlte.
- [x] GREEN: `src/components/Zugpfad.tsx` rendert den Waldpfad als geordnete Stationen vor dem `Schlangenbereich`; `src/App.tsx` hängt ihn board-nah im `spielbrett--waldtanz` ein; `src/App.css` ergänzt chunky Google-Stitch-Styling mit 3px Dark-Forest-Border, 2rem-Radius, hard shadow und responsiver Strecke.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initial `BLOCKERS: None`; Non-Blocker zur potenziell stale DOM-Referenz im Test wurde durch Re-Query nach dem KI-Vorspulen behoben. Final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.r53.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 5 Testdateien / 6 Tests bestanden; `npm run check:test-lines` grün.
- [x] Full Gates: `npm test -- --run` → 200 Testdateien / 699 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 475, `src/components/Zugpfad.tsx` 58, neuer Test 73).
- [x] Commit/Push: Feature-Release-Commit und diese Doku-Synchronisation wurden nach `origin/main` gepusht; der finale HEAD wurde erneut auf Production bereitgestellt.
- [x] Deploy/Smoke: Production-Alias `https://schlangentanz-v2.vercel.app` wurde bereitgestellt. Smoke: `/` und `/game` HTTP 200, `npm run smoke:production` grün, Playwright startet 3-KI-Lobby, bestätigt 4 Zugpfad-Stationen, 3 KI-Badges, aktive erste Station, `Nächster Halt: Spieler 2`, führt den ersten Menschenzug aus, sieht Spieler 2 als aktive KI-Station und `Nächster Halt: Spieler 3`, spult Gegnerzüge zurück zu Spieler 1, sieht `Gegnerzug abgeschlossen. Du bist wieder dran.`, bestätigt 36px Radius / Dark-Forest-Border / Hard Shadow und meldet keine Console-/Page-Errors.

## Evidence — 14.06.2026 M5d Zugkompass

- [x] Scope: Mittlerer sichtbarer Playability-Vertical nach M5c: Der `Spieltisch` erhält einen board-nahen `Zugkompass` zwischen `Zugpfad` und `Schlangenbereich`, der Phasenfluss und Gegnerzug-Vorspulen als Spielablauf führt. Engine-Regeln, Boardziele, Drag-and-drop, Aktionsdock-Fallback, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m5d_zugkompass.test.tsx` fiel initial erwartungsgemäß fehl, weil `Zugkompass` fehlte; Review-Funde zu Pending-Reaktionen, AktionenPanel und Spielerführung wurden test-first ergänzt.
- [x] GREEN: `src/components/ZugKompass.tsx` zeigt Status, Phase, Handlungsanweisung und die jeweils passende Primäraktion; `src/App.tsx` hängt ihn board-nah ein; `src/components/AktionenPanel.tsx` blendet normale Phasenbuttons/KI-Vorspulen während ausstehender Reaktionen aus; `src/App.css` ergänzt Stitch-Waldtanz-Styling.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu Pending-Reaktion, normaler Phasenweiterführung und stale Spielerführung wurden behoben; final `BLOCKERS: Keine`.
- [x] Targeted: `npm test -- --run src/App.m5d_zugkompass.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.r53.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r176_phasenaktion_live_region_atomic.test.tsx` → 6 Testdateien / 8 Tests bestanden; Spielerführung-Regressionssatz → 5 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 201 Testdateien / 702 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 488, `src/components/AktionenPanel.tsx` 300, `src/components/ZugKompass.tsx` 87, neuer Test 125).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `670811e` und finaler Dokumentations-HEAD wurden nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke: `npm run smoke:production` grün mit `/game` und `/` HTTP 200; M5d-Browser-Smoke startet 3-KI-Lobby, bestätigt `Zugkompass` zwischen `Zugpfad` und `Schlangenbereich`, 3px Dark-Forest-Border / hard shadow / radiale Waldlichtung, spielt board-nah eine Startkarte, führt per Zugkompass zur Aufgabenprüfung und zum Zugabschluss, übergibt an KI, spult Gegnerzüge zurück zum Menschen und meldet keine Console-/Page-Errors.

## Evidence — 14.06.2026 M5e Partiefortschritt

- [x] Scope: Mittlerer sichtbarer Playability-Vertical nach M5d: Der `Spieltisch` erhält `Partiefortschritt` zwischen `Zugkompass` und `Schlangenbereich`, damit Endspurt-Distanz, aktuelle Führung, eigener Punktestand und Sieger-Party-Ausblick board-nah sichtbar werden. Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Aktionsdock bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m5e_partiefortschritt.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Partiefortschritt` fehlte; Codex-Blocker zur starren 3-Spalten-Spur wurde test-first als responsive CSS-Erwartung gehärtet.
- [x] GREEN: `src/components/Partiefortschritt.tsx` rendert Fortschrittsstatus, Countdown/Führung/Ich-Punktestand und Endrundenhinweis aus bestehendem `Spielzustand` und Engine-Wertung; `src/App.tsx` hängt ihn board-nah ein; `src/App.css` ergänzt chunky Waldtanz-Styling mit responsiver Spur.
- [x] Claude Code / `/simplify`: Beide Läufe mit `--model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initialer 320px-Layout-Blocker behoben; final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m5e_partiefortschritt.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx` → 5 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 202 Testdateien / 704 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 490, `src/components/Partiefortschritt.tsx` 80, neuer Test 92).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `35cdb43` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M5e-Browser-Smoke bestätigt `Partiefortschritt` im `Spieltisch`, DOM-Reihenfolge `Zugkompass < Partiefortschritt < Schlangenbereich`, 3px Border, hard shadow, responsive Spur (Desktop 2 Spalten im Live-Viewport, Mobile 1 Spalte bei 320px) und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1d Waldtanz-Steinplatte

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Schlangenbereich` wird zur zentralen runden Waldlichtungs-/Steinplatten-Arena mit echter Magic-Circle-Startzone und gefächerter Handkartenleiste. Engine-Regeln, Aktionsdock, Drag-and-drop-Handler, Sonderkarten-Boardziele, HUDs und M5-Orientierung bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m1d_waldtanz_steinplatte.test.tsx` fiel initial erwartungsgemäß fehl, weil `schlangenbereich--waldlichtung`, Magic-Circle-Startzonen-CSS und Kartenfächer-Styles fehlten. Ein Codex-Blocker wurde test-first gehärtet: Die gestrichelte Magic-Circle-Zone muss jetzt die echte `role="button"`-Startzone sein, nicht nur ein dekoratives Pseudo-Element.
- [x] GREEN: `src/components/Schlangenbereich.tsx` ergänzt den Waldlichtungs-Modifikator am bestehenden Schlangenbereich; `src/App.css` ergänzt runde Steinplatten-/Waldlichtungsfläche, ambiente nicht-interaktive Lichtkreise, eine echte kreisrunde/dashed Startzone als Hit Target und alternierend rotierte Handkarten. `src/App.m1d_waldtanz_steinplatte.test.tsx` prüft Region-Reihenfolge, echte Startzone, vorhandene eigene/gegnerische Schlangen und CSS-Vertrag.
- [x] Claude Code / `/simplify`: Claude Code war weiterhin durch `401 Invalid authentication credentials` blockiert (`claude -p ... --output-format json` meldete `api_error_status: 401`); der enge manuelle Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu dekorativen statt echten Drop-Zonen und zu schwacher Testintegrität wurden behoben. Final `BLOCKERS: None`; Codex bestätigte, dass die Magic-Circle-Optik am echten click-/keyboard-/drag-/drop-fähigen Startziel hängt und Pseudo-Elemente `pointer-events: none` behalten.
- [x] Targeted: `npm test -- --run src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 5 Testdateien / 24 Tests bestanden; erweiterter M1/F36-Satz → 8 Testdateien / 31 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 203 Testdateien / 705 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 490, `src/components/Schlangenbereich.tsx` 464, neuer Test 59).
- [x] Commit/Push/Deploy/Smoke: Feature- und Doku-HEAD wurden nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke-Vertrag: `/` und `/game` HTTP 200; Browser-Smoke bestätigt `schlangenbereich--waldlichtung`, echte kreisrunde `.schlangen-startzone` mit `role="button"`, nicht-interaktive ambient Pseudo-Kreise, gefächerte Handkartenrotationen, erhaltene Schlangenbereich-/Handkarten-Reihenfolge und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1e Waldtanz-Spielerrahmen

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` erhält einen board-nahen `Waldtanz-Spielerrahmen` mit Gegnerhand-Rückseiten, Punkteplaketten und aktiver Spieleridentität. Engine-Regeln, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Zugpfad/-kompass, Partiefortschritt und Aktionsdock bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m1e_waldtanz_spielerrahmen.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Spielerrahmen` fehlte.
- [x] GREEN: `src/components/WaldtanzSpielerrahmen.tsx` rendert nächste Gegnerplakette, verdeckte Gegnerhand und aktive Spielerplakette aus bestehendem `Spielzustand`/Engine-Wertung; `src/App.tsx` hängt den Rahmen im `Spieltisch` vor `Zugpfad` ein; `src/App.css` ergänzt 3px-Border, pill Plaketten, hard shadows, Kartenrücken und Rotationen.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initial `BLOCKERS: None`; Copy-Non-Blocker `Gegner-Spieler 2` wurde zu `Gegner: Spieler 2` korrigiert. Final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 204 Testdateien / 706 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 492, `src/components/WaldtanzSpielerrahmen.tsx` 64, neuer Test 50).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `274aadf — M1e: Waldtanz-Spielerrahmen anlegen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1e-Browser-Smoke bestätigt `Waldtanz-Spielerrahmen`, `Gegner: Spieler 2`, `5 verdeckte Karten`, `Du — Spieler 1`, `5 Handkarten bereit`, genau 5 Kartenrücken, 3px Plakettenborder, Hard Shadow, rotierte Du-Plakette, DOM-Reihenfolge `Spielerrahmen < Schlangenbereich < Handkarten` und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1f Waldtanz-Seitenmenü

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spielbereich` erhält einen board-nahen `Waldtanz-Spielrahmen` als seitliches Menü/HUD mit Marke, Profil, Quest-/Inventar-/Zauber-Punkten und Hilfen. Das Menü rahmt die Waldtanz-Arena, ohne Engine-Regeln, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Zugpfad/-kompass, Partiefortschritt oder Aktionsdock zu verändern.
- [x] RED: `npm test -- --run src/App.m1f_waldtanz_seitenmenue.test.tsx` fiel initial erwartungsgemäß fehl, weil das Seitenmenü, die `nav`-Grid-Area und der neue Layoutvertrag fehlten.
- [x] GREEN: `src/components/WaldtanzSeitenmenue.tsx` rendert ein nicht-interaktives `<aside aria-label="Waldtanz-Spielrahmen">`; `src/App.tsx` hängt es direkt im `Spielbereich` vor Status/Arena ein; `src/App.css` ergänzt `nav`-Grid-Areas, sticky Seitenrahmen, 3px Dark-Forest-Borders, harte Schatten, Root-Fullwidth-Override, 980px-/1360px-Grid-Verträge und `overflow-x: clip` gegen dekorativen Shadow-Overflow.
- [x] Claude Code / `/simplify`: Claude Code war weiterhin durch `401 Invalid authentication credentials` blockiert; der enge manuelle Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu Fake-Navigation/Fake-Buttons, 1280px-/`#root`-Overflow und späterem 980px-Overflow wurden test-first behoben. Final `BLOCKERS: None`; Codex bestätigte statisches Aside, wirksamen Root-Override, 980px-/1360px-Grid-Math, App-Line-Budget und den Smoke-Blocker-Fix `overflow-x: clip` als rein dekorative Overflow-Begrenzung.
- [x] Targeted: `npm test -- --run src/App.m1f_waldtanz_seitenmenue.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.m1c_stitch_sidebars.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx` → 6 Testdateien / 6 Tests bestanden; Smoke-Blocker-Fix gezielt mit M1a/M1b/M1c erneut grün.
- [x] Full Gates: `npm test -- --run` → 205 Testdateien / 707 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 494, `src/components/WaldtanzSeitenmenue.tsx` 47, neuer Test 50).
- [x] Commit/Push: `d1e89d4 — M1f: Waldtanz-Seitenmenue anlegen` und Smoke-Blocker-Fix `24657b7 — M1f: Seitenmenue-Overflow begrenzen` wurden nach `origin/main` gepusht.
- [x] Deploy/Smoke: Feature-HEAD wurde per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1f-Browser-Smoke bestätigt bei 980px und 1360px `Waldtanz-Spielrahmen`, 4 statische Menüpunkte, `Quest` mit `aria-current="true"`, keine Links/Buttons im Menü, `grid-area: nav`, `position: sticky`, `#root max-width: none`, `overflow-x: clip`, korrekte DOM-Reihenfolge Menü → Status → Spieltisch, passende 3- bzw. 4-Spalten-Grid-Areas, keine horizontale Overflow und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M5f Waldtanz-Tischrunde

- [x] Scope: Mittlerer sichtbarer Playability-Vertical nach M1e/M5e: Der `Waldtanz-Spielerrahmen` zeigt die komplette Tischrunde mit allen Gegnerplaketten, verdeckten Händen, nächstem Zug und KI-Rückkehrstatus direkt im `Spieltisch`. Engine-Regeln, Aktionen, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Zugpfad/-kompass, Partiefortschritt und Aktionsdock bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m5f_waldtanz_tischrunde.test.tsx` fiel initial erwartungsgemäß fehl, weil Gegnerliste, Tischrundenstatus und KI-Rückkehrstatus im Spielerrahmen fehlten.
- [x] GREEN: `src/components/WaldtanzSpielerrahmen.tsx` leitet aktive/nächste Spieler aus `Spielzustand` ab, rendert eine benannte Gegnerliste mit allen nicht aktiven Spielern, markiert die nächste Spielerplakette und zeigt nach KI-Vorspulen `Gegnerzug zurück bei dir`; `src/App.css` ergänzt Statusband, responsive Gegnerliste und CSS-Fallback für die nächste Plakette.
- [x] Claude Code / `/simplify`: Wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review/Re-Review: Initial `BLOCKERS: None`; nach CSS-Fix fand Codex einen Blocker zu undefiniertem `--st-color-tertiary-container`, der mit Fallback und Testassertion behoben wurde. Finales Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: No new issues`.
- [x] Targeted: `npm test -- --run src/App.m5f_waldtanz_tischrunde.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m5e_partiefortschritt.test.tsx` → 5 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 206 Testdateien / 708 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 494, `src/components/WaldtanzSpielerrahmen.tsx` 83, neuer Test 75).
- [x] Commit/Push: `9b2ec96 — M5f: Waldtanz-Tischrunde sichtbar machen` auf `origin/main`.
- [x] Deploy/Smoke: Feature-HEAD wurde per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M5f-Browser-Smoke bestätigt 3-KI-Lobby, `Tischrunde: 4 Spieler`, 3 Gegnerplätze, 15 Kartenrücken, nächster-Zug-Plakette, aktive Plaketten-Outline, Menschenzug → KI-Spielerrahmenwechsel, KI-Vorspulen zurück zu `Gegnerzug zurück bei dir`/`Du — Spieler 1`, keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1g Waldtanz-Handkartenfächer

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Die `Handkarten` werden zu einem bodennahen, zentrierten Kartenfächer mit greifbaren Kartenflächen, Waldtanzkarten-Gesicht, Punkt-/Sonderaktions-Chips und Auswahl-Hub. Engine-Regeln, Aktionsdock, Schlangenbereich, Boardziele, Drag-and-drop und bestehende Handkarten-Handler bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1g_handkartenfaecher.test.tsx` fiel initial erwartungsgemäß fehl, weil Fächerklasse, Spielkarten-Gesicht, Kartenflächen-CSS und Auswahl-Hub fehlten.
- [x] GREEN: `src/components/HandkartenPanel.tsx` ergänzt Kartenface-Elemente (`Waldtanzkarte`, Typ/Farbe, Punkte/Sonderaktion, Spielhinweis), bewahrt explizite Button-Namen mit Karten-ID/Typ/Wert, `aria-pressed`, Klick- und Drag-Handler; `src/App.css` verschiebt Rahmen/Hard-Shadow auf die echte Buttonfläche, zentriert den Fächer und hebt ausgewählte Karten sichtbar an. Broad-Test-Fund zu sichtbarer `Farbkarte …`-/`Sonderkarte …`-Copy wurde im selben Slice durch einen sichtbaren `handkarte__typ`-Chip behoben.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initial `BLOCKERS: None`; nach Broad-Test-Fix erneutes Review `BLOCKERS: None`. Codex bestätigte erhaltene Button-Namen, Klick-/Drag-Handler, keine Pointer-/Visibility-Blocker; Non-Blocker nur die bewusste sichtbare Typ/Farbe-Dopplung zur Regressionserhaltung.
- [x] Targeted: `npm test -- --run src/App.m1g_handkartenfaecher.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.r177_farbige_kartenflaechen.test.tsx` → 4 Testdateien / 5 Tests bestanden; Broad-Fix gezielt mit `src/App.r51.test.tsx src/App.r77.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.r177_farbige_kartenflaechen.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 207 Testdateien / 709 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/components/HandkartenPanel.tsx` 104, neuer Test 53).
- [x] Commit/Push: `c255f08 — M1g: Handkartenfaecher spielbarer machen` wurde nach `origin/main` gepusht.
- [x] Deploy/Smoke: Feature-HEAD wurde per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1g-Browser-Smoke bestätigt auf Production `/` und `/game` HTTP 200, `handkartenleiste--waldtanz-faecher`, echte `.handkarte__button--karte` mit `aspect-ratio: 2 / 3`, 3px Dark-Forest-Border, Hard Shadow, sichtbarer `Waldtanzkarte`-/`Auswählen oder ziehen`-Copy, erhaltenen expliziten Karten-Buttonnamen, Auswahlklasse/`aria-pressed="true"`, sichtbare Lift-Transform und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1h Waldtanz-Zielkompass

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Nach der Handkarten-Auswahl zeigt der `Schlangenbereich` einen board-nahen `Waldtanz-Zielkompass`, der aktuell leuchtende Brettziele zusammenfasst. Engine-Regeln, Aktionsausführung, Drag-and-drop, Aktionsdock, Lobby, Schlangenbuch, Sieger-Party und bestehende Boardziel-Buttons bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1h_waldtanz_zielkompass.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Zielkompass` fehlte. Ein Production-Smoke-Fund wurde test-first als weiterer RED-Vertrag gehärtet: Das statische `Waldtanz-Seitenmenü` darf Handkarten-/Board-Klicks nicht abfangen.
- [x] GREEN: `src/components/WaldtanzZielkompass.tsx` zählt bereits gerenderte Brettzielarten und rendert eine chunky/pill Zielplakette direkt im Schlangenbereich; `src/components/Schlangenbereich.tsx` hängt sie board-nah ein; `src/App.css` ergänzt Zielkompass-Styling und setzt das statische Seitenmenü auf `pointer-events: none`, damit das Board in Production anklickbar bleibt.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu Schlangenfrass-Zwei-Gegner-Zielzählung und überbreiter `klick- oder ziehbar`-Copy wurden behoben; finales M1h-Re-Review `BLOCKERS: None`. Nach dem Production-Smoke-Blocker bestätigte Codex erneut `BLOCKERS: None` für `pointer-events: none` am statischen Seitenmenü und die Zielkompass-Zählung.
- [x] Targeted: M1h/Boardziel-Regressionssatz → 7 Testdateien / 12 Tests bestanden; Smoke-Blocker-Satz `src/App.m1f_waldtanz_seitenmenue.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 3 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 208 Testdateien / 711 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 494, `src/components/Schlangenbereich.tsx` 475, `src/components/WaldtanzZielkompass.tsx` 77, neuer M1h-Test 94, M1f-Test 53).
- [x] Commit/Push: `d0055f9 — M1h: Waldtanz-Zielkompass sichtbar machen` und `9e65ff6 — M1h: Seitenmenue Klickblocker entfernen` wurden nach `origin/main` gepusht.
- [x] Deploy/Smoke: Feature-HEAD wurde per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1h-Browser-Smoke bestätigt `/` und `/game` HTTP 200, deterministische Farbkarte `blau-01`, sichtbaren `Waldtanz-Zielkompass`, `Ausgewählt: blau-01`, `1 Brettziel bereit`, Chip `Neue Schlange`, `Leuchtende Ziele sind direkt auf dem Brett spielbar.`, `schlangen-startzone--zielbereit`, `border-radius: 999px`, Hard Shadow und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1i Waldtanz-Ablage

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` zeigt den `Ablagestapel` jetzt als board-nahe `Waldtanz-Ablage` zwischen `Partiefortschritt` und `Schlangenbereich`. Engine-Regeln, Aktionen, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Aktionsdock bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1i_waldtanz_ablage.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Ablage` fehlte. Codex-Blocker zum undefinierten Sonderkarten-Farbtoken wurde test-first mit einem CSS-Fallback-Vertrag gehärtet.
- [x] GREEN: `src/components/WaldtanzAblage.tsx` rendert leeren Ablageplatz oder letzte Ablagekarte aus `zustand.ablagestapel`; `src/App.tsx` hängt die Komponente board-nah nach `Partiefortschritt` und vor `Schlangenbereich` ein; `src/App.css` ergänzt 3px-Border, 2rem-Radius, Hard Shadow, Kartenfläche und Sonderkarten-Fallbackfarbe.
- [x] Claude Code / `/simplify`: `claude --model opusplan` war wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review/Re-Review: initialer Blocker zum undefinierten `--st-color-tertiary-container` wurde behoben; final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1i_waldtanz_ablage.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 4 Testdateien / 7 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 209 Testdateien / 713 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 496, `src/components/WaldtanzAblage.tsx` 55, neuer Test 70).
- [x] Commit/Push: `f56f73a — M1i: Waldtanz-Ablage sichtbar machen` wurde nach `origin/main` gepusht.
- [x] Deploy/Smoke: Feature- und finaler Dokumentations-HEAD wurden per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1i-Browser-Smoke bestätigt `Waldtanz-Ablage`, DOM-Reihenfolge `Partiefortschritt < Waldtanz-Ablage < Schlangenbereich`, `Ablage: 0 Karten`, leeren Ablagehinweis, 3px Dark-Forest-Border, Hard Shadow, ≥32px Radius und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1j Waldtanz-Zugspur

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Spieltisch` zeigt eine board-nahe `Waldtanz-Zugspur` zwischen `Waldtanz-Ablage` und `Schlangenbereich`, damit der letzte Spielzug, der nächste Pflichtschritt und der Ablagestatus nicht nur im Debugbereich sichtbar sind. Engine-Regeln, Aktionen, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und Aktionsdock bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1j_waldtanz_zugspur.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Zugspur` fehlte.
- [x] GREEN: `src/components/WaldtanzZugspur.tsx` rendert letzten Spielzug, nächsten Pflichtschritt und Ablagestatus aus bestehendem UI-/Engine-State; `src/App.tsx` hängt die Zugspur nach `Waldtanz-Ablage` und vor `Schlangenbereich` ein; `src/App.css` ergänzt 3px-Border, 2rem-Radius, Hard Shadow und sunny Waldlichtung.
- [x] Claude Code / `/simplify`: `claude --model opusplan` war wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review/Re-Review: initial `BLOCKERS: None`; nach Full-Gate-Fund wurde die stale broad `App.test.tsx`-Assertion im selben Slice auf den echten Schlangenbereich-Button gescopt. Finales Re-Review: `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 5 Testdateien / 34 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 210 Testdateien / 714 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 498, `src/components/WaldtanzZugspur.tsx` 43, neuer Test 54).
- [x] Commit/Push: `0392364 — M1j: Waldtanz-Zugspur sichtbar machen` wurde nach `origin/main` gepusht.
- [x] Deploy/Smoke: Feature- und finaler Dokumentations-HEAD wurden per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1j-Browser-Smoke bestätigt initiale Zugspur-Copy, DOM-Reihenfolge `Waldtanz-Ablage < Waldtanz-Zugspur < Schlangenbereich`, randomized echte Startkarte über Handkarte → Startzone, `Letzter Spielzug`, `Neue Schlange starten mit Karte …`, `Nächster Schritt: Ausspielphase beenden.`, 3px Dark-Forest-Border, Hard Shadow und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1k Waldtanz-Aufgabentafel

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Offene Aufgaben werden als board-nahe `Waldtanz-Aufgabentafel` mit Questkarten zwischen `Waldtanz-Zugspur` und `Schlangenbereich` sichtbar. Engine-Regeln, Aufgabenprüfung, Aktionshandler, Boardziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party, Aktionsdock und die bestehende Material-Seitenleiste bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1k_waldtanz_aufgabentafel.test.tsx` fiel initial erwartungsgemäß, weil die Region `Waldtanz-Aufgabentafel` fehlte. Codex-Blocker zu undefinierten CSS-Tokens wurde test-first gehärtet (`not.toMatch` für die eingeführten undefinierten Tokens), und die Aufgaben-Fixture wurde auf realistische offene-/Stapel-IDs ohne Überlappung korrigiert.
- [x] GREEN: `src/components/WaldtanzAufgabentafel.tsx` rendert offene Aufgaben als `Questkarte`-Liste mit Punkteplaketten, Aufgabenstapel-Zähler und Spielhinweis; `src/App.tsx` hängt sie board-nah nach `Waldtanz-Zugspur` und vor `Schlangenbereich` ein; `src/App.css` ergänzt chunky 3px-Dark-Forest-Border, 2rem-Radius, Hard Shadow, responsive Questkarten und definierte/fallbackfreie Waldlichtungs-Farben.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initialer Blocker zu undefinierten CSS-Tokens sowie Fixture-Non-Blocker wurden behoben; final `BLOCKERS: None`, `NON-BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1k_waldtanz_aufgabentafel.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m1d_waldtanz_steinplatte.test.tsx src/App.m1c_stitch_sidebars.test.tsx` → 5 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 211 Testdateien / 715 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 500, `src/components/WaldtanzAufgabentafel.tsx` 47, neuer Test 64).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `3b98f90 — M1k: Waldtanz-Aufgabentafel sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt. Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1k-Browser-Smoke bestätigt 3 Questkarten in `Waldtanz-Aufgabentafel`, DOM-Reihenfolge `Waldtanz-Zugspur < Waldtanz-Aufgabentafel < Schlangenbereich`, erhaltene `Material und Aufgaben`/`Aufgabenkarten`-Region, 3px Border, 36px Radius, Hard Shadow, gefüllte Questkarten-Gradienten und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M2d Schlangenhäutung-Brettziel

- [x] Scope: Mittlerer board-naher Interaktions-Vertical nach M1k/M2c: Eine ausgewählte `Schlangenhäutung` wird direkt an der eigenen Schlange im `Schlangenbereich` als Brettziel sichtbar und ausführbar. Engine-Regeln, Aktionsdock-Fallback, bestehende Schlangenhäutung-Auswahl, Farbenschutz/Farbenfusion/Schlangenfrass/Farbendieb, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m2d_schlangenhaeutung_brettziel.test.tsx` fiel initial erwartungsgemäß fehl, weil Zielklasse und Brettziel-Gruppe fehlten; der Codex-Blocker zur KI-Zug-Sichtbarkeit wurde test-first als Regression ergänzt.
- [x] GREEN: `src/components/SchlangenhaeutungBrettziel.tsx` rendert board-nahe Umkehr-/Erste-Karte-ans-Ende-Aktionen über bestehende Engine-Prüfung; `src/components/schlangenhaeutungBrettzielLogik.ts` kapselt die Nicht-Komponenten-Logik; `src/components/Schlangenbereich.tsx` markiert nur erlaubte Ziele und blendet sie im KI-Zug wie andere Einzelaktionen aus; `src/App.css` ergänzt 3px-Border, sunny Waldtanz-Fläche und Hard Shadow.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initialer Blocker zur KI-Zug-Ausführung wurde behoben; finales Re-Review `BLOCKERS: keine`.
- [x] Targeted: `npm test -- --run src/App.m2d_schlangenhaeutung_brettziel.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 212 Testdateien / 717 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 500, `src/components/Schlangenbereich.tsx` 490, `src/components/SchlangenhaeutungBrettziel.tsx` 77, `src/components/schlangenhaeutungBrettzielLogik.ts` 53, neuer Test 92).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `0664889 — M2d: Schlangenhaeutung am Brett spielbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M2d-Browser-Smoke bestätigt sichtbare `Spielbereich`/`Spieltisch`/`Schlangenbereich`/`Handkarten`, ausgelieferte `.schlangenhaeutung-brettziel`- und `.schlangekarte--haeutung-ziel`-CSS-Verträge mit 3px-Border/Hard Shadow und keine Console-/Page-Errors. Hinweis: Der deterministische M2d-DOM-Vertrag bleibt lokal-fixtured, weil `Schlangenhäutung` im aktuellen Production-Startdeck nicht zuverlässig in einer bounded Live-Session erscheint.

## Evidence — 14.06.2026 M2e Schlangengrube-Spielerziel

- [x] Scope: Mittlerer board-naher Interaktions-Vertical nach M2d/M5f: Eine ausgewählte `Schlangengrube` wird direkt an den Gegnerplaketten im `Waldtanz-Spielerrahmen` sichtbar und ausführbar. Engine-Regeln, Aktionsdock-Fallback, bestehende Schlangenbereich-Ziele, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und KI-Vorspulen bleiben erhalten.
- [x] RED: Die uncommitted Slice-Arbeit war bereits vorhanden; `src/App.m2e_schlangengrube_spielerziel.test.tsx` beweist den fehlenden Spielerrahmen-Zielpfad Auswahl → Gegnerplakette → Engine-Ausführung sowie KI-Gating und CSS-Vertrag.
- [x] GREEN: `src/App.tsx` reicht Engine-`SonderkarteSpielen`-Aktionen im menschlichen Zug an `WaldtanzSpielerrahmen`; `src/components/WaldtanzSpielerrahmen.tsx` markiert passende Gegnerplätze und führt den bestehenden Aktionspfad aus; `src/App.css` ergänzt sunny/chunky Zielmarkierung und Hard-Shadow-Button.
- [x] Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked Testdatei; `BLOCKERS: None`. Geprüft wurden Engine-Autorität, falsche Action-Filter, KI-Gating, Handkarten-Auswahlbindung, eindeutige Buttonnamen, Pointer-Interception und Zeilenbudget.
- [x] Targeted: `npm test -- --run src/App.m2e_schlangengrube_spielerziel.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 5 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 213 Testdateien / 720 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 500, `src/components/WaldtanzSpielerrahmen.tsx` 101, neuer Test 88).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `7ae86eb — M2e: Schlangengrube am Spielerrahmen spielbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M2e-Browser-Smoke mit deterministischer Start-RNG bestätigt auswählbare `schlangengrube-02`, `Schlangengrube hier spielen` direkt am Gegnerplatz `Spieler 2`, Klasse `waldtanz-spielerrahmen__gegnerplatz--grubenziel`, 3px Border, Hard Shadow, Ausführungsfeedback `Zuletzt ausgeführt: Schlangengrube mit Karte schlangengrube-02 auf Spieler 2 spielen` und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M2f Schlangenfrass-Zweiziel-Boardziel

- [x] Scope: Mittlerer board-naher Interaktions-Vertical nach M2e/M1k: Ein ausgewählter `Schlangenfrass` mit zwei gegnerischen Zielkarten wird direkt an den gegnerischen Brettkarten im `Schlangenbereich` gewählt und ausgeführt. Engine-Regeln, Aktionsdock-Fallback, eigene Ein-Ziel-Schlangenfrass-Aktion, Farbendieb, Schlangenblockade, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- [x] RED/GREEN: `src/App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx` beweist Auswahl der ersten gegnerischen Karte, sichtbaren Zwei-Ziel-Kompass, zweiten Ausführungsbutton, Engine-Ausführungsfeedback und Entfernen beider gegnerischer Zielkarten. `src/App.r181_schlangenfrass_boardziel.test.tsx` wurde auf den neuen vorbereitenden Zwei-Ziel-Pfad aktualisiert.
- [x] Umsetzung: `src/components/GegnerSchlangenListe.tsx` rendert `Ziel 1 wählen` und danach `Schlangenfrass mit 2 Zielen ausführen` nur aus vorhandenen `SchlangenfrassSpielen`-Aktionen; `src/components/Schlangenbereich.tsx` reicht die Aktionen weiter; `src/App.css` ergänzt ausgewählte Zielkarte und Kompass mit bestehenden Stitch-Tokens.
- [x] Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review/Re-Review: Initiale Blocker zu `react-hooks/set-state-in-effect` und undefinierten CSS-Tokens wurden behoben; final `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx` → 5 Testdateien / 10 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 214 Testdateien / 722 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `ede0ba6 — M2f: Schlangenfrass-Zweiziel am Brett spielbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M2f-Browser-Smoke mit deterministischer 3-KI-Partie bestätigt 3 erste Schlangenfrass-Brettziele, ersten Zielpick, Zwei-Ziel-Kompass, 2 Ausführungsbuttons, Ausführung auf zwei gegnerische Karten, 4px Outline / 3px Kompass-Border / Hard Shadow und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M2g Farbenfusion-Paarziel

- [x] Scope: Mittlerer board-naher Interaktions-Vertical nach M2f/R180: Eine ausgewählte `Farbenfusion` zeigt jetzt das komplette benachbarte gleichfarbige Kartenpaar als Brettobjekt statt nur einen Einzelbutton auf der ersten Karte. Engine-Regeln, Legal-Action-Enumeration, Aktionsdock-Fallback, Drag-and-drop, KI-Vorspulen, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m2g_farbenfusion_paarziel.test.tsx` fiel initial erwartungsgemäß fehl, weil `schlangekarte__karte--farbenfusion-paar`, Paarplakette, Partnerhinweis und Paar-Button fehlten.
- [x] GREEN: `src/components/farbenfusionPaarInfo.ts` leitet Start-/Partnerkarte ausschließlich aus vorhandenen `FarbenfusionSpielen`-Aktionen ab; `src/components/FarbenfusionPaarziel.tsx` rendert `Fusion: <erste> + <zweite> · <punkte> Punkte`, `Paarpartner für Farbenfusion` und den Paar-Button; `src/components/Schlangenbereich.tsx` markiert beide Paar-Karten und führt weiter über `onAktion`; `src/App.css` ergänzt Stitch/Waldtanz-Paarstyling.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M2g-Dateien; `BLOCKERS: None`, `NON-BLOCKERS: None`. Codex bestätigte Engine-Autorität, korrekt gescopte Paarmarkierung, eindeutige Accessible Names, definierte CSS-Tokens und Zeilenbudgets (`src/App.tsx` 500, `src/components/Schlangenbereich.tsx` 475).
- [x] Targeted: `npm test -- --run src/App.m2g_farbenfusion_paarziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx` → 2 Testdateien / 2 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 215 Testdateien / 723 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `9b8e8b3 — M2g: Farbenfusion als Kartenpaar spielbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M2g-Browser-Smoke bestätigt sichtbare `Spielbereich`/`Spieltisch`/`Schlangenbereich`/`Handkarten`/`Waldtanz-Zielkompass`, 5 Handkarten-Buttons, ausgelieferte Bundle-Beweise für `.schlangekarte__karte--farbenfusion-paar` und `Farbenfusion-Paar im Schlangenbereich`, keine Console-/Page-Errors. Hinweis: Der exakte Farbenfusion-Paar-DOM-Vertrag bleibt lokal-fixtured, weil passende Farbenfusion-Hand plus eigene gleichfarbige Paar-Schlange in einer bounded Production-Session nicht zuverlässig erzwingbar ist.

## Evidence — 14.06.2026 M1l Waldtanz-Schlangenpfad

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Eigene und gegnerische Schlangenreihen werden als zusammenhängender Waldtanz-Pfad mit Kopf-/Körper-/Schwanz-Logik und organischer Verbindungslinie lesbar. Engine-Regeln, Aktionshandler, Drag-and-drop, Aktionsdock, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1l_waldtanz_schlangenpfad.test.tsx` fiel initial erwartungsgemäß, weil Pfadklasse, Kopf-/Schwanzklassen, Ein-Karten-Kompaktmarke und CSS-Vertrag fehlten.
- [x] GREEN: `src/components/Schlangenbereich.tsx` und `src/components/GegnerSchlangenListe.tsx` markieren Kartenreihen und Kartenrollen; Ein-Karten-Schlangen zeigen eine einzige `Kopf & Schwanz`-Marke; `src/App.css` ergänzt Pfadlinie, Pfadmarken und spezifische Transform-Selektoren gegen alte nth-child-Versätze; `src/App.m1l_waldtanz_schlangenpfad.test.tsx` beweist den sichtbaren Vertrag.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initiale Blocker zu CSS-Transform-Spezifität und noisy Ein-Karten-Schlangen wurden test-first gehärtet und behoben; finales Re-Review `BLOCKERS: None`.
- [x] Targeted: M1l + Boardinteraktions-Regressionssatz → 6 Testdateien / 20 Tests bestanden. Codex-Re-Review-Regressionssatz → 11 Testdateien / 40 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 216 Testdateien / 726 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/components/Schlangenbereich.tsx` 481, `src/components/GegnerSchlangenListe.tsx` 189, neuer Test 84).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `eebb2eb — M1l: Waldtanz-Schlangenpfad sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1l-Browser-Smoke bestätigt nach echter board-naher Startaktion `schlangekarte__kartenreihe--pfad`, eine Ein-Karten-Schlange mit `schlangekarte__karte--kopf schlangekarte__karte--schwanz`, sichtbarer Marke `Kopf & Schwanz`, keine separaten `Kopf`-/`Schwanz`-Duplikate, `::before`-Gradient-Verbindungslinie, sichtbare Karten-Transform und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1m Waldtanz-Anlegeplätze

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Links-/Rechts-Anlegen an eigenen Schlangen wird als zwei board-nahe, greifbare Waldtanz-Endplätze direkt am Schlangenpfad sichtbar. Engine-Regeln, Aktionshandler, Drag-and-drop, Aktionsdock, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1m_waldtanz_anlegeplaetze.test.tsx` fiel initial erwartungsgemäß, weil `Waldtanz-Anlegeplätze`, Endplatzklassen und Stitch-CSS-Vertrag fehlten.
- [x] GREEN: `src/components/Schlangenbereich.tsx` rendert die bestehenden `KarteAnlegen`-Aktionen weiterhin über denselben `onAktion`-/Drag-Drop-Pfad, aber als `schlangekarte__anlegeplaetze` mit sichtbarer Copy `Linkes Ende`/`Rechtes Ende`, Karten-ID und `Karte dort anlegen`; Legacy-Klassen/ARIA-Namen bleiben für bestehende Interaktionsregressionen erhalten. `src/App.css` ergänzt 2-Spalten-Zielrinne, 3px dashed Dark-Forest-Border, 1.5rem-Radius, Hard Shadow und leichte Links/Rechts-Rotation.
- [x] Claude Code / `/simplify`: Beide Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1m-Test; `BLOCKERS: None`, `NON-BLOCKERS: None`. Codex bestätigte erhaltene Engine-Autorität, Drag/drop-Klickpfade, Legacy-Hooks, CSS-Cascade und Zeilenbudget.
- [x] Targeted: `npm test -- --run src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m1l_waldtanz_schlangenpfad.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 5 Testdateien / 18 Tests bestanden; Codex-naher Drag/drop-Satz → 5 Testdateien / 29 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 217 Testdateien / 728 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Geänderte Skriptdateien bleiben unter 500 Zeilen (`src/App.tsx` 500, `src/components/Schlangenbereich.tsx` 485, neuer Test 63).
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `9baa7de — M1m: Waldtanz-Anlegeplaetze greifbarer machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1m-Browser-Smoke mit deterministischer 3-KI-Partie startet eine eigene Schlange, spult KI-Gegner zurück zum Menschen, bestätigt sichtbare `Waldtanz-Anlegeplätze`, `Linkes Ende`/`Rechtes Ende`, 3px dashed Border, Hard Shadow, rechte Endplatz-Ausführung `Karte … an Schlange … rechts anlegen` und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1n Waldtanz-Drag-Vorschau

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Drag-Start fühlt sich jetzt wie echtes Karten-Ziehen an. Eine gezogene Handkarte hebt sich als Wackelkarte aus dem Kartenfächer und die passenden Brettziele im `Schlangenbereich` leuchten schon vor dem Drop als pulsierende Magic-Circle-Ziele. Engine-Regeln, Legal-Action-Enumeration, Drop-Ausführung, Aktionsdock, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m1n_drag_vorschau.test.tsx` fiel initial erwartungsgemäß fehl, weil Drag-Start keine `aria-pressed`-/Auswahlbindung auslöste und die CSS-Keyframes `handkarte-wackelt`/`zielkreis-pulsiert` fehlten. Codex-Blocker wurden test-first ergänzt: abgebrochene Drags räumen die Vorschau wieder ab und `prefers-reduced-motion: reduce` deaktiviert die Endlosanimationen.
- [x] GREEN: `src/App.tsx` setzt bei `onKarteDragStart` die bestehende Handkarten-Auswahl auf die gezogene Karte und räumt sie bei `onKarteDragEnd` wieder ab; `src/App.css` ergänzt Wackelkarte, pulsierende Zielkreise, 6px sunny-gold Glow und Reduced-Motion-Override. `src/App.m1n_drag_vorschau.test.tsx` beweist sichtbare Vorschau, Drop-Ausführung, Cancel-Cleanup und CSS-Vertrag.
- [x] Claude Code / `/simplify`: Coding- und Simplify-Läufe mit `claude --model opusplan` waren wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: initiale Blocker zu stale DragEnd-Vorschau und fehlendem Reduced-Motion-Override wurden behoben; finales Re-Review `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.r178_board_zielmarkierungen.test.tsx` → 6 Testdateien / 30 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 218 Testdateien / 731 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 496 Zeilen, neuer Test 70 Zeilen.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `752ae28 — M1n Drag-Vorschau am Waldtanz-Brett` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1n-Browser-Smoke bestätigt auf Production `/` und `/game` HTTP 200, `aria-pressed` wechselt beim Drag-Start auf `true`, `.handkarte--ausgewaehlt`, `.schlangen-startzone--zielbereit`, ausgelieferte Animationen `handkarte-wackelt` und `zielkreis-pulsiert`, DragEnd-Cleanup zurück auf `aria-pressed="false"` ohne Zielklasse und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1o Waldtanz-Kartenpop

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Erfolgreiche board-nahe Kartenaktionen zeigen jetzt direkt im `Spieltisch` ein chunky `Waldtanz-Kartenpop` mit `Pop!`, Karten-ID-Chip und drei Sternen. Engine-Regeln, Aktionshandler, Drag-and-drop, Aktionsdock, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1o_waldtanz_kartenpop.test.tsx` fiel initial erwartungsgemäß fehl, weil das board-nahe `role="status"`-Pop-Feedback und die CSS-Keyframes fehlten. Ein Codex-Review-Fund zum alten undefinierten CSS-Token `--st-font-heading` wurde test-first mit einer negativen Token-Regression gehärtet.
- [x] GREEN: `src/components/WaldtanzKartenpop.tsx` rendert bei Kartenaktions-Labels ein polite/atomic Status-Feedback mit `Pop!`, `Karte geschnappt`, Karten-ID und Aktionslabel; `src/App.tsx` hängt es zwischen `Waldtanz-Zugspur` und `Waldtanz-Aufgabentafel` ein; `src/App.css` ergänzt 3px Dark-Forest-Border, 999px Pill-Radius, Hard Shadow, Pop-/Sternenanimation, Reduced-Motion-Fallback und ersetzt das alte `--st-font-heading` durch `--st-font-headline`.
- [x] Claude Code / `/simplify`: Coding- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initial `BLOCKERS: None`; der Non-Blocker zum undefinierten `--st-font-heading` wurde test-first behoben. Finales Re-Review: `BLOCKERS: None`, keine neuen Non-Blocker.
- [x] Targeted: `npm test -- --run src/App.m1o_waldtanz_kartenpop.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx` → 3 Testdateien / 7 Tests bestanden; `npm run typecheck` und `npm run lint` danach grün.
- [x] Full Gates: `npm test -- --run` → 219 Testdateien / 733 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 498 Zeilen, `src/components/WaldtanzKartenpop.tsx` 33 Zeilen, neuer Test 51 Zeilen.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `e717563 — M1o: Waldtanz-Kartenpop sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1o-Browser-Smoke bestätigt echte board-nahe Kartenaktion auf Production, `Waldtanz-Kartenpop` mit `Pop!`, `Karte geschnappt`, Karten-ID `violett-12`, 3 Sternen, 3px Border, Hard Shadow, 999px Pill-Radius, ausgelieferte Keyframes `waldtanz-kartenpop-springt`/`waldtanz-stern-funkelt`, keinen `--st-font-heading`-Token im Bundle und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1p Waldtanz-Kartenvorschau

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Eine ausgewählte Handkarte wird im board-nahen Handbereich als große, farbige `Waldtanz-Kartenvorschau` mit Kartengesicht, Werteplakette und Zielhinweis gezeigt. Engine-Regeln, Drag-and-drop, Aktionsdock, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1p_waldtanz_kartenvorschau.test.tsx` fiel initial erwartungsgemäß fehl, weil die neue Vorschau-Region, der `Zugkarte bereit`-Kartenkopf, der Zielhinweis und CSS-Vertrag fehlten.
- [x] GREEN: `src/components/HandkartenPanel.tsx` rendert die bestehende Auswahl jetzt als `handkarten-preview` mit sichtbarer Karte und bewahrt zugleich den alten Detail-Region-Namen `Ausgewählte Handkarte: <id>`; `src/App.css` ergänzt 3px-Forest-Border, Hard Shadow, 2:3-Kartenfläche, farbige Symbolgradienten und 520px-Mobilumbruch.
- [x] Claude Code / `/simplify`: Coding- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Blocker zur umbenannten Auswahl-Region wurde mit bestehender R78/F36-Regression reproduziert und behoben; finale Re-Review `BLOCKERS: None`, keine neuen Non-Blocker.
- [x] Targeted: `npm test -- --run src/App.m1p_waldtanz_kartenvorschau.test.tsx src/App.r78_handkarten_auswahl.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.m1n_drag_vorschau.test.tsx` → 5 Testdateien / 18 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 220 Testdateien / 734 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 498, `src/components/Schlangenbereich.tsx` 485, `src/components/HandkartenPanel.tsx` 124, neuer Test 49.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `c6f559e — M1p: Waldtanz-Kartenvorschau greifbarer machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1p-Browser-Smoke bestätigt `/` und `/game` HTTP 200, echte Handkartenauswahl `schlangengrube-01`, Region `Ausgewählte Handkarte: schlangengrube-01`, sichtbare `Aktuelle Karte am Waldtanz-Tisch`/`Zugkarte bereit`/Zielhinweis-Copy, Klasse `handkarten-preview`, 3px Border, Hard Shadow, 2:3-Karte, Symbol-Gradient und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1q Waldtanz-Zugknopf

- [x] Scope: Mittlerer sichtbarer Google-Stitch-Vertical innerhalb `M1 Waldtanz Game Board`: Der board-nahe `Zugkompass` zeigt den nächsten Phasenschritt jetzt als großen goldenen `Waldtanz-Zugknopf` mit `Zugknopf`-Badge und Pfeil, ähnlich dem Stitch-`End Turn`-Button. Engine-Regeln, Phasenhandler, Aktionsdock-Fallback, Drag-and-drop, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1q_waldtanz_zugknopf.test.tsx` fiel initial erwartungsgemäß, weil die Phasenbuttons noch keine `zugkompass__hauptaktion`-Klasse, kein `Zugknopf`-Badge, keinen Pfeil und keinen Goldbutton-CSS-Vertrag hatten.
- [x] GREEN: `src/components/ZugKompass.tsx` rendert alle sichtbaren Phasen-/KI-Fortschrittsaktionen über den gemeinsamen `zugknopf(...)`-Helper mit unverändertem `aria-label`; `src/App.css` ergänzt 3px Dark-Forest-Border, sunny-gold Pill, Hard Shadow, Press-State und responsive Wrapping gegen lange Labels.
- [x] Claude Code / `/simplify`: Coding- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Blocker zur Narrow-Screen-Überbreite langer Labels wurde test-first mit `max-width: 100%`, `min-width: 0`, shrinkbarem Grid-Track und `overflow-wrap: anywhere` behoben. Finales Re-Review: `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1q_waldtanz_zugknopf.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx` → 3 Testdateien / 5 Tests bestanden; `npm run typecheck` und `npm run lint` danach grün.
- [x] Full Gates: `npm test -- --run` → 221 Testdateien / 735 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 498, `src/components/ZugKompass.tsx` 97, neuer Test 56.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `cbc2d28 — M1q: Waldtanz-Zugknopf hervorheben` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1q-Browser-Smoke bestätigt `/` und `/game` HTTP 200, echte erste Kartenaktion, sichtbaren `Zugkompass`-Button `Weiter zur Aufgabenprüfung` mit Klasse `zugkompass__hauptaktion`, sichtbarem Text `Zugknopf`, `→`, 3px Border, 999px Radius, Hard Shadow, `justify-self: end`, `max-width: 100%`, `min-width: 0`, `overflow-wrap: anywhere`, Folgezustand `Weiter zum Zugabschluss` und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M2h Aktionsdock gegen Brettziele begrenzen

- [x] Scope: Release-Blocker-Follow-up für die mittleren Google-Stitch/Waldtanz-Board-Interaktionen: Das sticky `Aktionen`-Dock bleibt board-nah, darf aber auf kleinen Viewports nicht mehr so hoch werden, dass Spielerrahmen-/Brettziele und das `Waldtanz-Reaktionsschild` verdeckt werden. Engine-Regeln, Aktionslabels, Sonderkarten-Ziele, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED/GREEN: Bestehender uncommitted Zustand wurde objektiv übernommen und abgesichert: `src/App.m1b_aktionsdock_layout.test.tsx` erweitert den M1b-Dock-Vertrag um `max-height: clamp(18rem, 46vh, 30rem)` und `overflow: auto`; `src/App.css` begrenzt genau `.aktionen-panel--waldtanz-dock`, ohne die bestehende `pointer-events: none`/interaktive-Kinder-Regel zu ändern.
- [x] Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert. Separate `/simplify`-Vorprüfung war wegen desselben Auth-Blockers nicht verfügbar.
- [x] Codex Review: Review-only auf dem uncommitted Diff; `BLOCKERS: none`. Non-Blocker zu CSS-Literal-Test und möglicher Scroll-Awkwardness wurde durch zusätzlichen Production-Browser-Smoke mit realer Hit-Test-/Klickprüfung adressiert.
- [x] Targeted: `npm test -- --run src/App.m1b_aktionsdock_layout.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx src/App.m2h_reaktionsschild.test.tsx` → 3 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 222 Testdateien / 738 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Commit `c5f2323 — M2h: Aktionsdock gegen Brettziele begrenzen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, `Spielbereich`/`Spieltisch` sichtbar, Dock-Style `overflow: auto`, `maxHeight: 331.2px`, reale Ziel-Hit-Prüfung auf `Schlangengrube im Spielerrahmen ... Spieler 2` ohne Dock-Interception (`topIsTarget: true`), sichtbares `Waldtanz-Reaktionsschild`, erfolgreiche Farbenschutz-Abwehr und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M2i Verdoppler-Bonuszauber

- [x] Scope: Mittlerer sichtbarer Board-Interaktions-Slice innerhalb des Google-Stitch/Waldtanz-Spielbretts: Eine ausgewählte globale `Verdoppler`-Sonderkarte erscheint jetzt als board-naher `Waldtanz-Bonuszauber` direkt im `Spieltisch` statt nur als abstrakter Aktionslisten-Button. Engine-Regeln, Reaktionsschild, KI-Gating, Aktionsdock, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m2i_verdoppler_bonuszauber.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Bonuszauber`, der Aktivierungsbutton und der Stitch-CSS-Vertrag fehlten. Ein Codex-Review-Fund zum undefinierten `--st-radius-lg` wurde test-first mit einer Token-Definition-Regression reproduziert und behoben.
- [x] GREEN: `src/components/WaldtanzBonuszauber.tsx` rendert nur die bereits legal enumerierte `VerdopplerSpielen`-Aktion der aktuell ausgewählten Handkarte, `src/App.tsx` filtert diese Engine-Aktion und blendet sie bei KI-Einzelaktionen aus, `src/App.css` ergänzt ein chunky gold-grünes Spielobjekt mit 3px Dark-Forest-Border, `--st-radius-lg: 2rem`, Hard Shadow und Goldbutton.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Review-Blocker zu undefiniertem `--st-radius-lg` wurde test-first behoben. Finales Codex-Re-Review: `BLOCKERS: None`; bestätigt Engine-Autorität, Selected-Card-Matching, KI-Gating, CSS-Token, Testintegrität und `App.tsx`-Budget.
- [x] Targeted: `npm test -- --run src/App.m2i_verdoppler_bonuszauber.test.tsx src/App.r76.test.tsx src/App.m2h_reaktionsschild.test.tsx src/App.m1q_waldtanz_zugknopf.test.tsx` → 4 Testdateien / 7 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines` danach grün.
- [x] Full Gates: `npm test -- --run` → 223 Testdateien / 740 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 497, `src/components/WaldtanzBonuszauber.tsx` 40, neuer Test 69.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `aff5bf6 — M2i: Verdoppler boardnah zaubern` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M2i-Browser-Smoke bestätigt deterministisch die Live-Handkarte `verdoppler-03 Sonderkarte Verdoppler`, sichtbare Region `Waldtanz-Bonuszauber`, Copy `Verdoppler-Zauber bereit`/`Eine Extra-Karte für diesen Zug freischalten.`, 3px Border, Radius `36px`, Hard Shadow, Goldbutton, anschließendes `Waldtanz-Reaktionsschild`, Verschwinden des Bonuszaubers nach Aktivierung und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1r /game Waldtanz-Fokus

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical, kein Mikro-A11y-Slice und kein Big-Bang: Die Produktionsroute `/game` startet jetzt direkt mit dem Waldtanz-Spielbereich statt zuerst Hero, Lobby und Schlangenbuch über fast zwei Bildschirmhöhen zu zeigen. Die Startseite `/` bleibt weiterhin Lobby-/Regelbuch-Erlebnis; Engine-Regeln, Board-Interaktionen, Sonderkarten-Ziele und bestehende Debug-/Statusbereiche bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1r_game_route_focus.test.tsx` fiel initial erwartungsgemäß fehl, weil `/game` noch `Das sonnige Nest` und `Das Schlangenbuch` renderte. Ein Codex-Review-Fund zum zu breiten Prefix-Match wurde test-first ergänzt: `/games` darf nicht als fokussierte Spielroute gelten.
- [x] GREEN: `src/App.tsx` erkennt nur `/game` und `/game/...`, blendet dort Hero/Lobby/Schlangenbuch aus, setzt `app-shell--game`/`spielbereich--game-route` und macht `#spielbereich` zum ersten `main`-Kind. `src/App.css` verdichtet nur den Game-Route-Start (`align-content: start`, kleinerer Gap/Top-Padding), ohne die bestehende Waldtanz-Grid-Architektur umzubauen.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Blocker zu `/game*`-Prefix-Matching wurde test-first behoben. Finales Re-Review: `BLOCKERS: None`; bestätigte behobene Hero-Assertion, Route-Testintegrität, Linienbudget, Typecheck und Lint.
- [x] Targeted: `npm test -- --run src/App.m1r_game_route_focus.test.tsx src/App.m3_sonniges_nest_lobby.test.tsx src/App.m4_schlangenbuch_regeln.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 224 Testdateien / 743 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 499, neuer Test 61.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `33ab5c9 — M1r: Spielroute auf Waldtanz-Brett fokussieren` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, keine Console-/Page-Errors, `/` behält Lobby und Schlangenbuch (`spielbereichTop: 1881.875`), `/game` rendert `main.app-shell--game`, erstes `main`-Kind `#spielbereich`, keine Lobby/kein Schlangenbuch, sichtbare `Spieltisch`-/`Handkarten`-/`Schlangenbereich`-/`Zugkompass`-Flächen und `spielbereichTop: 21.84375`.

## Evidence — 14.06.2026 M5g KI-Zugbühne brettnah

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical, kein Mikro-A11y-Slice und kein Big-Bang: Der KI-`Gegnerzug` wandert aus dem debugnahen Bereich direkt in den `Spieltisch`, zwischen `Waldtanz-Spielerrahmen` und `Zugkompass`. Engine-Regeln, KI-Vorspulen-Logik, Zugkompass-/Aktionsdock-Fallbacks, Drag-and-drop, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben erhalten.
- [x] RED: `npm test -- --run src/App.m5g_ki_zugbuehne_brettnah.test.tsx` fiel initial erwartungsgemäß fehl, weil im `Spieltisch` keine Region `Gegnerzug` existierte. Der Codex-Blocker zum undefinierten CSS-Token wurde test-first ergänzt und reproduziert.
- [x] GREEN: `src/App.tsx` rendert `KiZugBuehne` board-nah direkt nach dem Spielerrahmen und übergibt den bestehenden `handleKiZugVorspulen`; `src/components/KiZugBuehne.tsx` zeigt bei aktivem KI-Zug den neuen Button `Gegnerzug am Brett abspielen`; `src/App.css` ergänzt `ki-zug-buehne--brettnah` als responsive Grid-Spielobjekt mit 3px Dark-Forest-Border und Hard Shadow, ohne undefinierte Tokens.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Review-Blocker zu `--st-color-on-secondary-container` wurde test-first behoben. Finales Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`; geprüft wurden Board-Platzierung, bestehender KI-Vorspulen-Pfad, Fallback-Erhalt, CSS-Tokens, Pointer-Interception, Typecheck/Lint und `App.tsx`-Budget.
- [x] Targeted: `npm test -- --run src/App.m5g_ki_zugbuehne_brettnah.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx src/App.m1q_waldtanz_zugknopf.test.tsx` → 4 Testdateien / 4 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 225 Testdateien / 744 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 499, neuer Test 61.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `ac73534 — M5g Gegnerzug ans Spielbrett holen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M5g-Browser-Smoke bestätigt `/` und `/game` HTTP 200, `Gegnerzug` board-nah im `Spieltisch` zwischen Spielerrahmen und Zugkompass (`orderOk: true`), Klasse `ki-zug-buehne--brettnah`, Grid-Layout, 3px Border, Hard Shadow, Button `Gegnerzug am Brett abspielen`, erfolgreiche Rückkehr zu `Du — Spieler 1`, sichtbares KI-Protokoll und keine Console-/Page-Errors.

## Evidence — 14.06.2026 M1s Questfortschritt auf der Waldtanz-Aufgabentafel

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical, kein A11y-Mikroslice und kein Big-Bang: Die board-nahe `Waldtanz-Aufgabentafel` zeigt jetzt sofort, welche offenen Questkarten der aktive Spieler laut Engine bereits erfüllt hat. Engine-Regeln, Aufgabenprüfung, Aktionshandler, Drag-and-drop, Lobby, Schlangenbuch, Sieger-Party und bestehende Material-Seitenleiste bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1s_questfortschritt.test.tsx` fiel initial erwartungsgemäß fehl, weil `1 Quest bereit`, `Bereit zum Einsammeln`, `Noch offen` und die erfüllbare Questkartenklasse fehlten.
- [x] GREEN: `src/components/WaldtanzAufgabentafel.tsx` nutzt `ermittleErfuellteOffeneAufgaben` als Engine-Autorität, zählt bereite Quests im Tafelkopf und markiert erfüllbare Questkarten mit Sammelhinweis für die nächste Aufgabenprüfung; `src/engine/index.ts` exportiert den bestehenden Engine-Helfer; `src/App.css` ergänzt Stitch/Waldtanz-Statuschips, sunny-gold Hervorhebung, 3px Dark-Forest-Border und Hard Shadow.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1s-Test; `BLOCKERS: None`. Non-Blocker war nur die akzeptierte CSS-Regex-Brittleness im Test; Codex bestätigte Engine-Autorität, CSS-Tokens, Zeilenbudget und mittleren sichtbaren Spielwert.
- [x] Targeted: `npm test -- --run src/App.m1s_questfortschritt.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx` → 2 Testdateien / 2 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 226 Testdateien / 745 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 499, `src/components/WaldtanzAufgabentafel.tsx` 63, neuer Test 61.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `44d4a34 — M1s: Questfortschritt auf Aufgabentafel zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1s-Browser-Smoke bestätigt sichtbare `Waldtanz-Aufgabentafel`, 3 Questkarten mit `Noch offen`-Status, ausgelieferte `.waldtanz-questkarte--erfuellbar`-/`.waldtanz-questkarte__status--bereit`-CSS-Verträge inklusive 3px/Hard-Shadow-Goldmarkierung und keine Console-/Page-Errors. Der erfüllbare-Quest-Zustand bleibt lokal-fixtured, weil er in einer bounded Production-Session nicht zuverlässig erreichbar ist.

## Evidence — 14.06.2026 M1t Questkarte auf der Waldtanz-Aufgabentafel einsammeln

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical nach M1s: Eine erfüllte Questkarte wird in der board-nahen `Waldtanz-Aufgabentafel` während der menschlichen Aufgabenprüfung direkt einsammelbar. Engine-Regeln, Aufgabenwertung, KI-Zugfluss, Aktionsdock, Drag-and-drop, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert; der Button delegiert nur an den bestehenden `beendeAufgabenpruefung`-Pfad.
- [x] RED: `npm test -- --run src/App.m1t_questkarte_einsammeln.test.tsx` fiel initial erwartungsgemäß fehl, weil die erfüllte `Farbkombination`-Questkarte keinen board-nahen Button `Questkarte Farbkombination einsammeln` hatte.
- [x] GREEN: `src/components/WaldtanzAufgabentafel.tsx` erhält den bestehenden Aufgabenprüfungs-Handler und rendert den Sammelbutton nur für erfüllte Questkarten in `Aufgabenpruefung`, bei aktivem Mensch-Spieler und ohne Pending-Reaktion; `src/App.tsx` reicht den Handler weiter; `src/App.css` ergänzt den chunky 3px/999px/Hard-Shadow-Sammelbutton mit definierten Stitch-Tokens.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initialer Blocker zum versehentlich sichtbaren KI-Aufgabenprüfungsbutton und Non-Blocker zum undefinierten CSS-Token wurden test-first behoben. Finales Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1t_questkarte_einsammeln.test.tsx src/App.m1s_questfortschritt.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx src/App.m1q_waldtanz_zugknopf.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx src/App.test.tsx` → 6 Testdateien / 32 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines` danach grün.
- [x] Full Gates: `npm test -- --run` → 227 Testdateien / 747 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 499, `src/components/WaldtanzAufgabentafel.tsx` 70, neuer Test 84.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `c8f30c3 — M1t: Questkarten am Brett einsammeln` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1t-Browser-Smoke mit deterministischem `Math.random = 0.5` spielt fünf blaue Karten über mehrere echte Mensch-/KI-Züge, sieht `1 Quest bereit`, bestätigt `Questkarte Farbkombination einsammeln` mit 3px Border, 999px Radius und Hard Shadow, klickt den board-nahen Questbutton, sieht `Farbkombination (5 Punkte)` in der Spielerübersicht, die Quest verschwindet von der Aufgabentafel, und es treten keine Console-/Page-Errors auf.

## Evidence — 15.06.2026 M1u Waldtanz-Startkreis

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die generische neue-Schlange-Startzone wird als board-naher Magic-Circle-`Startkreis` mit leuchtendem Startplatz, Kartenplakette und chunky Startkreis-Button greifbar. Engine-Regeln, Drag-and-drop-Auflösung, Sonderkarten-Ziele, Aktionsdock, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1u_waldtanz_startkreis.test.tsx` fiel initial erwartungsgemäß fehl, weil Startkreis-Markup/CSS fehlten; ein Review-Fund zur Zielbereit-CSS-Kaskade wurde als erneut roter Testvertrag reproduziert und behoben.
- [x] GREEN: `src/components/Schlangenbereich.tsx` ergänzt `Startkreis`, `Leuchtender Startplatz`, `Bereit: <karte>`, neue Drop/Klick-Copy und zugängliche Buttons `Startkreis mit Karte <id>`; `src/App.css` ergänzt radialen Magic-Circle, 3px Dark-Forest-Border, Hard Shadow, Badge-/Kartenchips und eine spezifische `.schlangen-startzone--magiekreis.schlangen-startzone--zielbereit`-Kaskade.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch Claude-Auth-Fehler blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: final `BLOCKERS: Keine`; Codex bestätigte gelöste CSS-Kaskade und keine stale Test-Assertions auf `Schlangenbereich-Start mit Karte`, `Startaktionen für ...` oder den alten Startzonen-Hint.
- [x] Targeted: `npm test -- --run src/App.m1u_waldtanz_startkreis.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx src/App.r53.test.tsx` → 9 Testdateien / 38 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 228 Testdateien / 749 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `251cf88 — M1u: Waldtanz-Startkreis sichtbar machen` und Fix-Commit `1385ac4 — M1u: Startkreis-Button-Kaskade absichern` wurden nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1u-Browser-Smoke bestätigt `schlangen-startzone--magiekreis`, `schlangen-startzone--leer`, `schlangen-startzone--zielbereit`, sichtbare Startkreis-Copy, `schlangen-startkreis-button`, computed `buttonBorderTopWidth: 3px`, Hard Shadow, erfolgreiche `Neue Schlange starten`-Aktion und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1v Waldtanz-Gegnerfächer

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Gegnerische Hände werden im `Waldtanz-Spielerrahmen` als verdeckte, peeking Kartenfächer mit Score-Plakette und sichtbarem Fächerlabel direkt am Spieltisch gezeigt. Engine-Regeln, KI-Zugfluss, Sonderkarten-Ziele, Aktionsdock, Handkarten, Schlangenbereich, Lobby, Regeln und Ergebnisansicht bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1v_waldtanz_gegnerfaecher.test.tsx` fiel initial erwartungsgemäß fehl, weil Kartenfächer-Markup/CSS fehlten.
- [x] GREEN: `src/components/WaldtanzSpielerrahmen.tsx` ergänzt Kartenfächer-Klassen, verschachtelte spielerbezogene `ol`-Fächer, verdeckte Stitch-Kartenrücken und sichtbares `verdeckter Kartenfächer`-Label; `src/App.css` ergänzt Peeking-Layout, 3px Dark-Forest-Border, Hard Shadow, Kartenrücken-Gradienten und rotationsversetzte `nth-child`-Transforms. `src/App.m5f_waldtanz_tischrunde.test.tsx` prüft direkte Gegnerplätze weiter stabil über `children`, damit neue Kartenlisten nicht als zusätzliche Gegner zählen.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1v-Test; `BLOCKERS: None`. Codex bestätigte verschachtelte Listen-Semantik, erhaltene Schlangengrube-Buttons, Testintegrität, CSS-Kaskade, Linienbudget und sichtbaren mittleren Slice-Zuschnitt.
- [x] Targeted: `npm test -- --run src/App.m1v_waldtanz_gegnerfaecher.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx` → 2 Testdateien / 3 Tests bestanden; Codex ergänzend: `src/App.m2e_schlangengrube_spielerziel.test.tsx` grün.
- [x] Full Gates: `npm test -- --run` → 229 Testdateien / 751 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Commit `c264a6c — M1v: Gegnerfächer am Waldtanz-Tisch` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1v-Browser-Smoke bestätigt `.waldtanz-spielerrahmen__gegnerliste--kartenfaecher`, `.waldtanz-spielerrahmen__gegnerplatz--kartenfaecher`, `Verdeckter Kartenfächer von Spieler 2`, 5 Stitch-Kartenrücken, sichtbare Fächer-/Kartenzahl-Copy, computed `borderTopWidth: 3px`, Hard Shadow und unterschiedliche Peeking-Transforms ohne Console-/Page-Errors.

## Evidence — 15.06.2026 M1w Waldtanz-Spielrahmen-HUD

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Das bisher statische Seitenmenü wird zum live gespeisten Spielrahmen-HUD mit Profil, Punkten, Phase, Handkarten, eigenen Schlangen, Nachziehstapel, offenen Quests und nächstem Pflichtschritt direkt neben dem Brett. Engine-Regeln, Aktionsausführung, Brettinteraktionen, Lobby, Regeln, Sieger-Party, Aktionsdock und KI-Fluss bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1w_waldtanz_spielrahmen_hud.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Kompass` und CSS-Vertrag fehlten.
- [x] GREEN: `src/components/WaldtanzSeitenmenue.tsx` rendert `Spielprofil` plus `Waldtanz-Kompass`; `src/App.tsx` speist das HUD aus aktuellem Zustand/Wertung/Pflichtschritt; `src/App.css` ergänzt 3px Dark-Forest-Border, `var(--st-radius-lg)`, Hard Shadow und pillige Statkarten.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1w-Test; `BLOCKERS: None`. Codex bestätigte Testintegrität, Typecheck/Lint/Build, App-Zeilenbudget, definierte CSS-Tokens, statischen Seitenrahmen ohne Links/Buttons, erhaltenes M1f/M1v-Verhalten und mittleren sichtbaren Slice-Zuschnitt.
- [x] Targeted: `npm test -- --run src/App.m1w_waldtanz_spielrahmen_hud.test.tsx src/App.m1f_waldtanz_seitenmenue.test.tsx src/App.m1v_waldtanz_gegnerfaecher.test.tsx` → 3 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 230 Testdateien / 753 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 499, `src/components/WaldtanzSeitenmenue.tsx` 79, neuer Test 61.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `ec361dc — M1w: Waldtanz-Spielrahmen live speisen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1w-Browser-Smoke bestätigt `Waldtanz-Spielrahmen`/`Waldtanz-Kompass`, Live-Profil `Spieler 1 · 0 Punkte`, Statkarten `Phase: Ausspielphase`, `Handkarten: 5`, `Eigene Schlangen: 0`, `Nachziehstapel: 100`, `Offene Quests: 3`, `Nächster Schritt: Eine spielbare Aktion auswählen.`, computed `borderTopWidth: 3px`, Radius `36px`, Hard Shadow und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1x Aktionsdock als Brett-Fallback

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf der fokussierten `/game`-Route liegt die lange Aktions-/Buttonliste nicht mehr sticky über Spieltisch, Spielerrahmen, Schlangenbereich und Handkarten, sondern als Fallback unter dem kompletten Brett. Engine-Regeln, Aktionsausführung, direkte Board-Ziele, Lobby, Regeln, Sieger-Party und der allgemeine M1b-Dock-Vertrag bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1x_aktionsdock_fallback_unter_brett.test.tsx` fiel initial erwartungsgemäß fehl, weil der route-spezifische CSS-Override für `.spielbereich--game-route .aktionen-panel--waldtanz-dock` fehlte.
- [x] GREEN: `src/App.css` ergänzt nur den `/game`-Override (`position: static`, `max-height: none`, `overflow: visible`, `pointer-events: auto`, `margin-top: 1rem`); `src/App.m1x_aktionsdock_fallback_unter_brett.test.tsx` beweist, dass `Spieltisch` mit `Schlangenbereich` und `Handkarten` vor `Aktionen` bleibt und der Basis-Dock weiterhin sticky ist.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf dem uncommitted Diff inklusive untracked M1x-Test; `BLOCKERS: None`. Codex bestätigte route-spezifische CSS-Kaskade, erhaltenen M1b-Sticky-Basisvertrag, Pointer-Events, Testintegrität und fokussierten Slice-Zuschnitt.
- [x] Targeted: `npm test -- --run src/App.m1x_aktionsdock_fallback_unter_brett.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.m2h_reaktionsschild.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx` → 4 Testdateien / 6 Tests bestanden; Codex ergänzend: M1x + M1b + M5a + M1r → 4 Testdateien / 6 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 231 Testdateien / 754 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `656c982 — M1x: Aktionsdock unter das Waldtanz-Brett legen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1x-Browser-Smoke bestätigt `/game` mit `spielbereich--game-route`, `aktionen-panel--waldtanz-dock`, computed `position: static`, `maxHeight: none`, `overflowY: visible`, `pointerEvents: auto`, `Aktionen` direkt nach `Spieltisch`, `Schlangenbereich` und `Handkarten` im `Spieltisch`, Aktionsdock-Top unter Handkarten-Unterkante und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1y Handkarten-Spielbarkeit

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die board-nahe Handkartenleiste zeigt direkt auf jeder Handkarte, ob sie sofort am Brett spielbar ist, wie viele Brettziele sie hat, wartet oder nur per Pflicht-Abwurf abgelegt werden muss. Engine-Regeln, Aktionsausführung, Drag-and-drop, Sonderkarten-Zielkomponenten, Lobby, Schlangenbuch, Sieger-Party und Fallback-Aktionsliste bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1y_handkarten_spielbarkeit.test.tsx` fiel initial wegen fehlender `handkarte--spielbar`-/CSS-Verträge; Review-Fix-REDs deckten anschließend fehlende Status-A11y-Namen und falsche `PflichtAbwurf`-Brettziel-Klassifizierung auf.
- [x] GREEN: `src/components/HandkartenPanel.tsx` erhält die bereits enumerierten Engine-Aktionen, zählt boardspielbare Handkarten eindeutig, unterscheidet `Spielbar jetzt`, `Wartet auf nächsten Schritt` und `Muss abgeworfen werden`, und schreibt diesen Status auch in den Button-Namen. `src/App.css` ergänzt Stitch-Spielbarkeitsplaketten mit 3px/Hard-Shadow; `PflichtAbwurf` bekommt kein `Brettziel`.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initiale Blocker zu `PflichtAbwurf` als falschem `Brettziel` und fehlendem Status im `aria-label` wurden test-first behoben. Finales Re-Review: `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1y_handkarten_spielbarkeit.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.m1p_waldtanz_kartenvorschau.test.tsx src/App.r78_handkarten_auswahl.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 6 Testdateien / 22 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 232 Testdateien / 758 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 500, `src/components/HandkartenPanel.tsx` 149, neuer Test 93.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `38117cc — M1y: Handkarten-Spielbarkeit sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1y-Browser-Smoke bestätigt deterministisch `5 Karten sofort spielbar`, `blau-01 ... Spielbar jetzt 1 Brettziel`, `handkarte--spielbar`, 3px Border, Hard Shadow, nach Startkreis-Aktion `blau-03 ... Wartet auf nächsten Schritt`, `handkarte--wartet`, Opacity `0.72`, kein `Brettziel` im wartenden `aria-label` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1z Waldtanz-Zielspur

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Nach Auswahl einer Handkarte wird der Schlangenbereich selbst zur sonnigen Zielspur mit aktivem Leuchtbrett, Zielkarte und Brettziel-Zähler; nicht passende eigene Schlangen werden abgedimmt, gültige Startkreise, Schlangenenden und Sonderkarten-Ziele bleiben sichtbar/spielbar. Engine-Regeln, Drag-and-drop, Aktionsausführung, Handkarten-Spielbarkeit, Gegnerziele, Lobby, Regeln, Sieger-Party und Fallback-Aktionsliste bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1z_waldtanz_zielspur.test.tsx` fiel initial erwartungsgemäß, weil `Waldtanz-Zielspur`, aktive Schlangenbereich-Klasse, Nichtziel-Dimmung und Stitch-CSS-Vertrag fehlten; Review-/Full-Suite-Fix ergänzte die Regression, dass die Zielspur nicht als zweites `role="status"` mit dem Dragstatus kollidieren darf.
- [x] GREEN: `src/components/WaldtanzZielspur.tsx` rendert die board-nahe Zielspur als `role="note"`; `src/components/waldtanzZielspurLogik.ts` zählt eindeutige sichtbare Brettziel-Keys statt roher Aktionskombinationen und schützt eigene sichtbare Farbenfusion-/Schlangenfrass-Ziele vor Nichtziel-Dimmung; `src/components/Schlangenbereich.tsx` bindet Zielspur, aktive Arena-Klasse und `schlangekarte--nichtziel` ein; `src/App.css` ergänzt sonnigen Arena-Glow, Pill-Zielspur, 3px Dark-Forest-Border, Hard Shadow und gedimmte Nichtziele.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initiale Blocker zu gültigen eigenen Sonderkarten-Zielen und unsicherer Roh-Aktionszählung wurden test-first behoben. Full-Suite-Fund zur `role="status"`-Kollision wurde durch `role="note"` behoben und final re-reviewed: `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1z_waldtanz_zielspur.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx` → 4 Testdateien / 30 Tests bestanden; Codex ergänzend `src/App.m1z_waldtanz_zielspur.test.tsx src/App.r163_schlangen_dragstatus_live_region.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 3 Testdateien / 16 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 233 Testdateien / 762 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/components/Schlangenbereich.tsx` 498, `src/components/WaldtanzZielspur.tsx` 26, `src/components/waldtanzZielspurLogik.ts` 75, neuer Test 93.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `dea8c18 — M1z: Waldtanz-Zielspur sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1z-Browser-Smoke bestätigt nach Klick auf eine spielbare Handkarte `schlangenbereich--karte-ausgewaehlt`, `Waldtanz-Zielspur` als `role="note"`, `Zielspur aktiv`, `Zielkarte: braun-05`, `1 Brettziel leuchtet`, genau einen Drag-`status` im Schlangenbereich, computed `borderTopWidth: 3px`, Dark-Forest-Hard-Shadow, Pill-Radius `999px` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1aa Waldtanz-Zielkarte-Vorschau

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die ausgewählte Handkarte zeigt jetzt direkt in der großen Karten-Vorschau eine `Brettzielkarte` mit Zielanzahl und Zielart-Chips. Das verbindet Handkartenfächer und Zielspur, ohne Engine-Regeln, Aktionsausführung, Schlangenbereich, Gegnerziele, Lobby, Regeln, Sieger-Party oder Fallback-Aktionsliste zu ändern.
- [x] RED: `npm test -- --run src/App.m1aa_zielkarte_vorschau.test.tsx` fiel initial erwartungsgemäß fehl, weil die `role="note"`-Zielkarte und der CSS-Vertrag fehlten.
- [x] GREEN: `src/components/HandkartenPanel.tsx` leitet die Vorschau aus dem vorhandenen `legaleAktionen`-Prop ab, ignoriert `PflichtAbwurf` als Brettziel, dedupliziert sichtbare Zielarten wie `Startkreis`, `Schlangenende` oder `Bonuszauber` und rendert sie als Chips; `src/App.css` ergänzt die Stitch-Zielkarte mit 3px Dark-Forest-Border, Gold-/Wald-Gradient, Pill-Chips und Hard Shadow.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1aa-Test; `BLOCKERS: None`. Non-Blocker zu Sonderkarten-/Singular-Copy-Coverage wurde als nicht blockierend für diesen Zielkarten-Vertical klassifiziert; Codex bestätigte Scope, Typecheck, Lint und CSS-Kaskade.
- [x] Targeted: `npm test -- --run src/App.m1aa_zielkarte_vorschau.test.tsx src/App.m1y_handkarten_spielbarkeit.test.tsx src/App.m1p_waldtanz_kartenvorschau.test.tsx src/App.m1z_waldtanz_zielspur.test.tsx src/App.m1g_handkartenfaecher.test.tsx` → 5 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 234 Testdateien / 764 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `2df36a1 — M1aa: Zielkarte in Handvorschau zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1aa-Browser-Smoke bestätigt nach Klick auf eine spielbare Handkarte die sichtbare `Brettzielkarte`, `1 Brettziel bereit`, Zielart-Chip, Hinweis `Folge den leuchtenden Zielen im Spielbrett.`, computed `borderTopWidth: 3px`, Radius `27px`, Dark-Forest-Hard-Shadow, Stitch-Gradient und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ab Waldtanz-Rangtafel

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im M1-Board-Erlebnis: Der Wertungsbereich wird zusätzlich zur bestehenden Punktetafel als chunky Waldtanz-Rangtafel mit Führung, aktivem Spieler, Hand-/Schlangen-/Farbgruppen-/Questwerten spielnah lesbar. Engine-Regeln, Aktionsausführung, Schlangenbereich, Handkarten, Lobby, Schlangenbuch, Sieger-Party und die bestehende `Punktetafel` bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ab_waldtanz_rangtafel.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Rangtafel`-Region und CSS-Vertrag fehlten. Ein Produktions-Smoke-Fund zur aktiven führenden Karte (`führt` ohne `am Zug`) wurde als zusätzlicher RED-Regressionsfall reproduziert.
- [x] GREEN: `src/components/WertungPanel.tsx` extrahiert den Wertungsbereich aus `src/App.tsx`, bewahrt die alte `Punktetafel` und Entwicklungsdaten, ergänzt die sortierte Rangtafel und kennzeichnet aktive führende Spieler als `führt · am Zug`; `src/App.css` ergänzt 3px Dark-Forest-Border, `var(--st-radius-lg)`, Hard Shadow, Rangchip und Führungsplakette.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; der enge manuelle Fallback wurde genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initiales Review auf uncommitted Diff inklusive untracked Komponente/Test: `BLOCKERS: None`; Non-Blocker nur Safari/VoiceOver-List-Style-Risiko, nicht blockierend. Re-Review nach Smoke-Regressionsfix: `BLOCKERS: None`, bestätigte aktiver-Führender-Status und unveränderte Punktetafel-Verträge.
- [x] Targeted: `npm test -- --run src/App.m1ab_waldtanz_rangtafel.test.tsx src/App.f8_scoreboard.test.tsx src/App.r170_punktetafel_live_region_atomic.test.tsx src/App.r169_wertung_live_region_atomic.test.tsx` → 4 Testdateien / 6 Tests bestanden; nach Regressionserweiterung M1ab-Test → 3 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 235 Testdateien / 767 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 463, `src/components/WertungPanel.tsx` 116, M1ab-Test 87.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `20a6516 — M1ab: Waldtanz-Rangtafel zeigen` und Fix-Commit `b663921 — M1ab: aktiven Ranglistenführer kennzeichnen` wurden nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1ab-Browser-Smoke bestätigt `Wertung`, `Waldtanz-Rangtafel`, bestehende `Punktetafel`, 2 Rangkarten, aktive Karte `führt · am Zug`, computed `borderTopWidth: 3px`, Radius `36px`, Hard Shadow, Rangtafel vor Punktetafel und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ac Waldtanz-Arenastein

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Ablage, Zugspur, Kartenpop, Aufgabentafel und Schlangenbereich liegen jetzt gemeinsam auf einem `Waldtanz-Arenastein` mit sichtbarer Waldstein-Copy, Magiekreis-Hinweis, 4px Dark-Forest-Border und Hard Shadow. Engine-Regeln, Aktionsausführung, Bonuszauber, Handkartenfächer, Fallback-Aktionsdock, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ac_waldtanz_arenastein.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Arenastein`, die sichtbare Copy und der CSS-Vertrag fehlten.
- [x] GREEN: `src/App.tsx` bündelt die vorhandenen Brettobjekte in der neuen Arenastein-Region und hält die Handkartenleiste danach board-nah; `src/App.css` ergänzt radialen Waldlichtungs-/Stein-Hintergrund, dekorative Zielkreise, `border: 4px solid var(--st-color-border-strong)`, `box-shadow: 0 8px 0 var(--st-color-border-strong)` und `border-radius: min(4rem, 12vw)`.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initial `BLOCKERS: None`; der Non-Blocker zum ungenutzten Test-Helper wurde bereinigt. Finales Re-Review: `BLOCKERS: None`, bestätigt Test-Cleanup und gezielten Test.
- [x] Targeted: `npm test -- --run src/App.m1ac_waldtanz_arenastein.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1x_aktionsdock_fallback_unter_brett.test.tsx src/App.m1z_waldtanz_zielspur.test.tsx src/App.m1aa_zielkarte_vorschau.test.tsx src/App.m2h_reaktionsschild.test.tsx` → 6 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 236 Testdateien / 768 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 469, M1ac-Test 48.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `a3d4882 — M1ac: Waldtanz-Arenastein bündeln` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1ac-Browser-Smoke bestätigt `/` und `/game` HTTP 200, sichtbare `Waldtanz-Arenastein`-Copy, enthaltene `Waldtanz-Ablage`/`Waldtanz-Zugspur`/`Waldtanz-Aufgabentafel`/`Schlangenbereich`, Handkarten nach dem Arenastein, computed `borderTopWidth: 4px`, Radius `72px`, radial-gradient-Hintergrund, Hard Shadow und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ad Waldtanz-Spielbahnen

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Waldtanz-Arenastein` wird zweispaltig spielbarer — `Schlangenbereich` als primäre `Schlangenlichtung`, Ablage/Zugspur/Kartenpop/Aufgabentafel als kompakte `Waldobjekte`; Engine-Regeln, Drag-and-drop und Aktionen bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ad_waldtanz_spielbahnen.test.tsx` fiel initial erwartungsgemäß wegen fehlender `Schlangenlichtung`, `Waldobjekte` und CSS-Vertrag fehl.
- [x] GREEN: `src/App.tsx` gruppiert die vorhandenen Brettobjekte in `Schlangenlichtung` und `Waldobjekte`; `src/App.css` ergänzt zweispaltiges Spielfeld, breite radial beleuchtete Lichtung, kompakte scrollbare Nebenobjekte und mobilen Einspalten-Fallback.
- [x] Claude Code / `/simplify`: Durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initialer Blocker zu stale M1i/M1j/M1k DOM-Order-Tests wurde test-first behoben; finales Re-Review `BLOCKERS: None`. Erster Production-Smoke deckte eine zu schmale live berechnete Lichtung auf; Fix-Commit verbreitert den Grid-Vertrag.
- [x] Targeted: `npm test -- --run src/App.m1ad_waldtanz_spielbahnen.test.tsx src/App.m1ac_waldtanz_arenastein.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx` → 5 Testdateien / 7 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 237 Testdateien / 770 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Commits `e3cc333 — M1ad: Waldtanz-Spielbahnen formen` und `9cdd747 — M1ad: Schlangenlichtung im Live-Layout verbreitern` wurden nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke: `/` und `/game` HTTP 200. M1ad-Browser-Smoke bestätigt `Schlangenlichtung` vor `Waldobjekte`, korrekte Containments, Handkarten nach Arenastein, `Aktionen` direkt nach `Spieltisch`, computed `gridTemplateColumns: 323.656px 216px`, Lichtung breiter als Nebenobjekte, radial-gradient-Hintergrund, `overflowY: auto` für Waldobjekte und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ae Waldtanz-Erstbild

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf `/game` wird das erste Desktop-Browserbild kompakter und spielbrettnäher. `Waldtanz-Spielerrahmen`, `Waldtanz-Arenastein`, `Zugpfad`, `Zugkompass`, `Partiefortschritt`, `Waldtanz-Bonuszauber` und die Handkarten werden per Route-CSS in eine zusammenhängende Waldtanz-Bühne gesetzt; Engine-Regeln, DOM-Reihenfolge, Board-Ziele, Drag-and-drop, Lobby, Regeln und Ergebnisansicht bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ae_waldtanz_erstbild.test.tsx` fiel initial erwartungsgemäß fehl, weil die `/game`-Route noch keinen spezifischen Erstbild-CSS-Vertrag für kompakten Spielrahmen, Arenastein, Zugrail und Handkarten hatte. Ein angrenzender CSS-Source-Test-Fund zu überschatteten Basis-Selektoren wurde durch route-spezifische Attributselektoren abgesichert.
- [x] GREEN: `src/App.css` ergänzt ein desktopweites `@media (min-width: 1100px)` nur für `.spielbereich--game-route`: schmälere Seitenleiste, breiteres Arena-Feld, Arenastein links und Zug-/Statusrail rechts, Handkarten als Brettabschluss, Aktionen weiterhin erst darunter als Fallback. Startkreis-Buttons und Hinweise werden kompakter, damit die Lichtung mehr wie Spielfläche und weniger wie lange Buttonliste wirkt. `src/App.m1ae_waldtanz_erstbild.test.tsx` schützt DOM-Order und CSS-Vertrag.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt. Die manuelle Simplify-Vorprüfung hat eine doppelte Spielerrahmen-Regel zusammengeführt, bevor Codex reviewte.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1ae-Test; `BLOCKERS: None`. Codex bestätigte gültige CSS-Attributselektoren, route-spezifischen Scope, unveränderte DOM-/Engine-Pfade, keine neue Pointer-Interception und einen Slice, der weder A11y-Mikroarbeit noch Big-Bang ist.
- [x] Targeted: `npm test -- --run src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m1ad_waldtanz_spielbahnen.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1e_waldtanz_spielerrahmen.test.tsx src/App.m1u_waldtanz_startkreis.test.tsx src/App.m1v_waldtanz_gegnerfaecher.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx` → 11 Testdateien / 17 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 238 Testdateien / 771 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: neuer Test 56 Zeilen.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `e01975a — M1ae: verdichte Waldtanz-Erstbild` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). M1ae-Browser-Smoke bestätigt `/` und `/game` HTTP 200, `Waldtanz-Spielerrahmen` vor Arenastein, Arenastein und `Zugpfad` gemeinsam bei `top: 576`, `Zugpfad` rechts der Arena, `Handkarten` nach der Arena, `Aktionen` nach den Handkarten, erfolgreiche Handkarten-Auswahl und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1af Waldtanz-Schlangenkarten-Gesichter

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Karten in eigenen und gegnerischen Schlangenpfaden werden als greifbare Mini-Spielkarten mit Eyebrow, Symbolfläche, Typzeile und Wertplakette dargestellt. Engine-Regeln, Aktionsausführung, Drag-and-drop, Sonderkarten-Ziele, Spielerrahmen, Lobby, Regeln und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx` fiel initial erwartungsgemäß fehl, weil Mini-Karten-Klasse, Spielkarten-Gesicht und CSS-Vertrag fehlten. Ein Codex-Review-Blocker zur späteren generischen `.schlangekarte__karte span`-Regel wurde test-first ergänzt und behoben.
- [x] GREEN: `src/components/SchlangenPfadKarte.tsx` zentralisiert eigene/gegnerische Schlangenpfad-Karten als `role="listitem"` mit erhaltenem Karten-`aria-label`; `Schlangenbereich` und `GegnerSchlangenListe` reichen board-nahe Sonderkartenbuttons als Kinder weiter; `src/App.css` ergänzt 2:3-Mini-Kartenfläche, 3px Dark-Forest-Border, Hard Shadow, farbige Symbolgradienten, pillige Wertplakette und spezifische späte Typografie-Regeln gegen die generische Span-Kaskade.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- [x] Codex Review/Re-Review: Initialer Blocker zur CSS-Kaskade wurde test-first behoben; finales Re-Review `BLOCKERS: None`. Codex bestätigte erhaltene Action-Buttons/ARIA-Labels, Target-Highlight-Klassen, Typecheck/Lint/Build und Zeilenbudget.
- [x] Targeted: `npm test -- --run src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx src/App.m1l_waldtanz_schlangenpfad.test.tsx src/App.f35_schlangen_kartenreihe.test.tsx src/App.r177_farbige_kartenflaechen.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m2g_farbenfusion_paarziel.test.tsx src/App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r183_farbendieb_boardziel.test.tsx` → 9 Testdateien / 18 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 239 Testdateien / 774 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/components/Schlangenbereich.tsx` 481, `src/components/GegnerSchlangenListe.tsx` 174, `src/components/SchlangenPfadKarte.tsx` 68, M1af-Test 70.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `99d0565 — M1af: Schlangenkarten als Mini-Spielkarten zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1af-Browser-Smoke bestätigt nach echter Startkreis-Aktion eine Schlangenpfad-Mini-Karte mit `Schlangenkarte`, Symbol `🌙`, `Farbkarte Violett`, `2 Punkte`, Klasse `schlangekarte__karte--spielkarte`, 3px Border, 2:3 Aspect-Ratio, Hard Shadow, Symbolgradient, pilliger Wertplakette, geschützter Typografie-Kaskade und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ag Waldtanz-Tischkarte

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der zentrale Arenastein bekommt in der `Schlangenlichtung` eine `Waldtanz-Tischkarte` als leuchtenden Waldkreis für die zuletzt ausgespielte/abgeworfene Ablagekarte. Engine-Regeln, Aktionsausführung, `Waldtanz-Ablage` in den Waldobjekten, Schlangenpfade, Handkarten, Lobby, Regeln und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ag_waldtanz_tischkarte.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Tischkarte`, leerer zentraler Ausspielplatz und CSS-Vertrag fehlten. Der Codex-Review-Blocker zum alten `min-height: 100%` der Lichtungs-Schlangenbereichszeile wurde test-first reproduziert und behoben.
- [x] GREEN: `src/components/WaldtanzTischkarte.tsx` rendert die letzte `zustand.ablagestapel`-Karte als 2:3-Spielkarte mit Symbol, Typ, Wertplakette und darunterliegender Karte; leer bleibt ein sichtbarer zentraler Ausspielplatz. `src/App.tsx` platziert die Tischkarte vor `Schlangenbereich`; `src/App.css` ergänzt 3px Dark-Forest-Border, radialen Waldkreis-Glow, Hard Shadow, 2:3-Karte und den Lichtungs-Zeilenvertrag mit `min-height: 0`, damit M1ae-Erstbild nicht wieder nach unten wächst. M1ah erweitert diese Lichtung später um eine eigene Magiekreis-Zeile.
- [x] Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initialer Blocker zur Layout-Höhe der Lichtung wurde test-first behoben. Finales Re-Review: `BLOCKERS: None`; Codex bestätigte den gelösten `grid-template-rows`-/`min-height: 0`-Vertrag, untracked Test/Komponente und fokussierten Slice-Zuschnitt.
- [x] Targeted: `npm test -- --run src/App.m1ag_waldtanz_tischkarte.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m1ad_waldtanz_spielbahnen.test.tsx src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m1af_waldtanz_schlangenkarten_faces.test.tsx` → 5 Testdateien / 11 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 240 Testdateien / 777 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 477, `src/components/WaldtanzTischkarte.tsx` 69, M1ag-Test 74.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `1d69b4c — M1ag: Tischkarte in die Waldtanz-Lichtung legen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1ag-Browser-Smoke bestätigt `Waldtanz-Tischkarte` in der `Schlangenlichtung` vor `Schlangenbereich`, sichtbaren leeren Ausspielplatz, computed `gridTemplateRows`, `schlangenMinHeight: 0px`, 3px Border, Dark-Forest-Hard-Shadow, radial-gradient-Waldkreis, erfolgreiche Startkreis-Aktion ohne Interception und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ah Waldtanz-Magiekreise

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Zwischen `Waldtanz-Tischkarte` und `Schlangenbereich` liegt jetzt eine eigene `Waldtanz-Magiekreise`-Zieloberfläche mit Startkreis- und Schlangenende-Kreisen. Sie zeigt nach Handkartenauswahl Zielkarte und Brettwege direkt im Arenastein, ohne Engine-Regeln, Drag-and-drop, direkte Boardbuttons, Fallback-Aktionsdock, Lobby, Regeln oder Sieger-Party zu ersetzen.
- [x] RED: `npm test -- --run src/App.m1ah_waldtanz_magiekreise.test.tsx` fiel initial erwartungsgemäß fehl, weil die Region `Waldtanz-Magiekreise` und der pulsierende Zielkreis-CSS-Vertrag fehlten.
- [x] GREEN: `src/components/WaldtanzMagiekreise.tsx` zählt bereits enumerierte `NeueSchlangeStarten`- und `KarteAnlegen`-Aktionen für die ausgewählte Handkarte, rendert `Magiekreise aktiv`, `Zielkarte: <id>`, Brettwege-Zähler sowie benannte Start-/Schlangenende-Kreise. `src/App.tsx` platziert die Anzeige in Normal-Flow zwischen Tischkarte und Schlangenbereich; `src/App.css` ergänzt 3px dashed Dark-Forest-Border, Hard Shadow, Gold-/Lime-Radialflächen, Kreis-Aspect-Ratio und `waldtanz-zielkreis-puls`.
- [x] Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und durch Codex überprüft.
- [x] Codex Review: Review-only auf uncommitted Diff inklusive untracked M1ah-Test/Komponente; `BLOCKERS: None`. Codex bestätigte Testintegrität, Typecheck/Lint, App-Zeilenbudget, display-only Engine-Erhalt, benannte Region/Listitems, niedrige Pointer-Risiken und sichtbare Stitch-Ausrichtung.
- [x] Targeted: `npm test -- --run src/App.m1ah_waldtanz_magiekreise.test.tsx src/App.m1ag_waldtanz_tischkarte.test.tsx` → 2 Testdateien / 5 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 241 Testdateien / 779 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 483, `src/components/WaldtanzMagiekreise.tsx` 70, M1ah-Test 55.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `ed07a30 — M1ah: Magiekreise in die Waldtanz-Lichtung legen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1ah-Browser-Smoke bestätigt nach Klick auf eine spielbare Handkarte `Magiekreise aktiv`, sichtbare Zielkarte, Brettwege-Zähler, Startkreis-/Schlangenende-Listitems, DOM-Reihenfolge `Tischkarte < Magiekreise < Schlangenbereich`, computed 3px dashed Border, Dark-Forest-Hard-Shadow, 1:1-Kreis, Radius `999px`, Animation `waldtanz-zielkreis-puls` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ai Magiekreis-Brettwege

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die `Waldtanz-Magiekreise` werden vom Anzeige-/Aggregatobjekt zu direkt klickbaren Brettwegen für bereits enumerierte Startkreis- und Schlangenende-Aktionen. Engine-Regeln, Aktionsenumeration, Schlangenbereich-Direktziele, Drag-and-drop, Sonderkarten-Ziele, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ai_magiekreis_brettwege.test.tsx` fiel initial erwartungsgemäß fehl, weil Magiekreis-Buttons und drückbarer CSS-Vertrag fehlten.
- [x] GREEN: `src/components/WaldtanzMagiekreise.tsx` rendert nach Handkartenauswahl Buttons `Magiekreis: Karte <id> als neue Schlange starten` und `Magiekreis: Karte <id> an Schlange <id> <position> anlegen`; `src/App.tsx` reicht den bestehenden `fuhreAktionAus`-Handler weiter; `src/App.css` ergänzt pillige 3px/Hard-Shadow/Press-State-Buttons inklusive `box-sizing: border-box`.
- [x] Claude Code / `/simplify`: `claude --model opusplan` und der separate `/simplify`-Lauf waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- [x] Codex Review/Re-Review: Initial `BLOCKERS: None`; Non-Blocker zum möglichen Button-Overflow wurde mit `box-sizing: border-box` test-abgesichert. Finales Re-Review: `BLOCKERS: None`.
- [x] Targeted: `npm test -- --run src/App.m1ai_magiekreis_brettwege.test.tsx src/App.m1ah_waldtanz_magiekreise.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 3 Testdateien / 15 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 242 Testdateien / 782 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 484, `src/components/WaldtanzMagiekreise.tsx` 88, M1ai-Test 74.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `f4f4585 — M1ai: Magiekreis-Brettwege klickbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1ai-Browser-Smoke bestätigt deterministisch `Magiekreise aktiv`, klickbaren Startkreis-Button, computed `box-sizing: border-box`, 3px solid Border, Pill-Radius `999px`, Dark-Forest-Hard-Shadow, `cursor: pointer`, erfolgreiche Startkreis-Aktion und keine Console-/Page-Errors. Schlangenende ist lokal-fixtured mit echter Engine-Ausführung getestet; in der bounded Production-Erstzug-Session führt die erste Karte erwartungsgemäß zum nächsten Pflichtschritt.

## Evidence — 15.06.2026 M1aj Magiekreis-Sonderzauber

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der bestehende `Waldtanz-Magiekreise`-Bereich bekommt einen eigenen `Sonderzauber`-Kreis, der bereits legal enumerierte Sonderkarten-Aktionen wie Farbenfusion, Farbendieb, Schlangenfrass, Farbenschutz, Blockade und Schlangengrube direkt in der Arena anbietet. Engine-Regeln, Enumerierung, bestehende Boardziele, Verdoppler-Bonuszauber, Drag-and-drop, Lobby, Regeln und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1aj_magiekreis_sonderzauber.test.tsx` fiel initial erwartungsgemäß fehl, weil der Sonderzauber-Kreis, direkte Magiekreis-Sonderzauber-Buttons und der eigene Stitch-CSS-Vertrag fehlten. Ein Full-Suite-Fund zur alten `--st-color-tertiary-container`-Negativassertion wurde als stale Broad-Test im M2i-Test aktualisiert.
- [x] GREEN: `src/components/WaldtanzMagiekreise.tsx` filtert die übergebenen legalen Sonderzauber-Aktionen auf die ausgewählte Handkarte, rendert einen eigenen `Sonderzauber`-Kreis mit sprechendem Zaubernamen/Ziel und löst weiter den bestehenden `onAktion`-Engine-Pfad aus. `src/App.tsx` speist den Kreis aus vorhandenen legalen Sonderkarten-Aktionslisten; `src/App.css` definiert `--st-color-tertiary-container: #ffbcaa`, Sonderzauber-Button und radialen Sonderzauber-Kreis.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initiale Review-Blocker zu undefiniertem `--st-color-tertiary-container` und CSS-Kaskade des aktiven Sonderzauber-Kreises wurden test-first behoben. Finales Re-Review: `BLOCKERS: None`; Codex bestätigte die stale M2i-Testkorrektur, CSS-Token/Kaskade und `App.tsx`-Budget.
- [x] Targeted: `npm test -- --run src/App.m1aj_magiekreis_sonderzauber.test.tsx src/App.m2i_verdoppler_bonuszauber.test.tsx` → 2 Testdateien / 5 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run check:test-lines` danach grün.
- [x] Full Gates: `npm test -- --run` → 243 Testdateien / 785 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Build-Artefakte: `dist/assets/index-CHtU8E9p.css` und `dist/assets/index-DHhIA-Ug.js`.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `7a10996 — Implementiere M1aj Magiekreis-Sonderzauber` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production` grün mit `/` und `/game` HTTP 200; M1aj-Browser-Smoke bestätigt `/` und `/game` HTTP 200, sichtbaren `Sonderzauber`-Kreis in `Waldtanz-Magiekreise`, computed `borderTopWidth: 3px`, `borderStyle: dashed`, radial-gradient-Hintergrund, keine Console-/Page-Errors und damit einen dauerhaften Arena-Spielobjekt-Nachweis. Konkrete Farbenfusion/Farbendieb-Ausführung bleibt lokal-fixtured mit echten Engine-Aktionen getestet, weil die Produktions-Ersthand zufallsabhängig ist.

## Evidence — 15.06.2026 M1ak Waldtanz-Kartenpop in der Lichtung

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Das bestehende `Pop!`-/Sternenfeedback nach einer erfolgreichen Kartenaktion wandert aus den kompakten `Waldobjekte`-Nebenflächen direkt in die `Schlangenlichtung`, strukturell nach der `Waldtanz-Tischkarte` und vor den `Waldtanz-Magiekreise`-Zielen. Engine-Regeln, Aktionsausführung, Drag-and-drop, Handkarten, Sonderzauber, Fallback-Aktionsliste, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ak_waldtanz_kartenpop_lichtung.test.tsx` fiel initial erwartungsgemäß, weil `Waldtanz-Kartenpop` noch nicht in der `Schlangenlichtung` stand und der Lichtungs-CSS-Vertrag fehlte. Der Codex-Review-Blocker zur idle/no-pop Rasterhöhe wurde test-first ergänzt: Basislayout bleibt `auto auto minmax(0, 1fr)`, die vierte Zeile entsteht nur per `:has(.waldtanz-kartenpop)`.
- [x] GREEN: `src/App.tsx` rendert `WaldtanzKartenpop` jetzt in der Schlangenlichtung direkt nach `WaldtanzTischkarte` und entfernt ihn aus `Waldobjekte`; `src/App.css` ergänzt die conditional `:has(.waldtanz-kartenpop)`-Rasterzeile plus einen engeren 24rem-Lichtungs-Pill mit 3px-Border, 6px-Hard-Shadow, bestehender Sternanimation und bestehendem Reduced-Motion-Schutz.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback und manuelle Simplify-Prüfung wurden genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initialer Blocker zur idle/no-pop Rasterhöhe wurde test-first behoben. Finales Re-Review: `BLOCKERS: None`; Codex bestätigte Basisraster, conditional `:has`-Regel, Platzierung zwischen Tischkarte und Magiekreisen, unveränderte Engine-Pfade und `App.tsx`-Budget.
- [x] Targeted: `npm test -- --run src/App.m1ak_waldtanz_kartenpop_lichtung.test.tsx` → 1 Testdatei / 2 Tests bestanden; adjacent `npm test -- --run src/App.m1ak_waldtanz_kartenpop_lichtung.test.tsx src/App.m1o_waldtanz_kartenpop.test.tsx src/App.m1ah_waldtanz_magiekreise.test.tsx src/App.m1ad_waldtanz_spielbahnen.test.tsx src/App.m1ag_waldtanz_tischkarte.test.tsx` → 5 Testdateien / 11 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 244 Testdateien / 787 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Build-Artefakte: `dist/assets/index-DOnRBN78.css` und `dist/assets/index-KQl2eeb3.js`.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `360f1c4 — M1ak: Kartenpop in die Lichtung legen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200; M1ak-Browser-Smoke bestätigt auf `/game` nach echter Magiekreis-Startaktion mit `violett-02`: `Waldtanz-Kartenpop` in der `Schlangenlichtung`, nicht in `Waldobjekte`, DOM-Reihenfolge `Tischkarte < Kartenpop < Magiekreise`, Copy `Pop!` / `Karte geschnappt`, computed `borderTopWidth: 3px`, Pill-Radius `999px`, Hard Shadow `0px 6px`, Animation `waldtanz-kartenpop-springt`, `:has`-Raster im Live-Browser und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1al Waldtanz-Farbgruppenband

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Farbgruppen und Nähe zur Quest `Farbkombination` erscheinen direkt in der `Schlangenlichtung` an den eigenen Schlangen. Engine-Regeln, Drag-and-drop, direkte Brettziele, Aktionen, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` fiel initial erwartungsgemäß fehl, weil das board-nahe Farbgruppenband, der Questnähe-Hinweis und der CSS-Vertrag fehlten.
- [x] GREEN: `src/components/WaldtanzFarbgruppenband.tsx` rendert Farbgruppen-Chips, Leerzustand und Farbkombination-Fortschritt; `src/components/Schlangenbereich.tsx` platziert das Band nach der eigenen Schlangenliste und außerhalb klickbarer Schlangenbuttons; `src/engine/aufgabenPruefung.ts` teilt `ermittleFarbkombinationFortschritt` zwischen Regelprüfung und UI; `src/App.css` ergänzt 3px Dark-Forest-Border, Hard Shadow und pillige Waldtanz-Chips.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- [x] Codex Review/Re-Review: Review-only auf uncommitted Worktree inklusive untracked Test/Komponente; finales Re-Review `BLOCKERS: None`. Codex bestätigte reale `aufgabenPool`-Quest, Split-Farbkarten-Regressionsfall, Engine-Quelle für Farbkombination und keine verschachtelte `role="group"` innerhalb `role="button"`.
- [x] Targeted: `npm test -- --run src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` → 1 Testdatei / 3 Tests bestanden; adjacent `npm test -- --run src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx` → 2 Testdateien / 14 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 245 Testdateien / 790 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `WaldtanzFarbgruppenband.tsx` 50, `Schlangenbereich.tsx` 489, M1al-Test 80, `aufgabenPruefung.ts` 232.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `b3ed0e3 — M1al: Farbgruppenband in der Schlangenlichtung zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1al-Browser-Smoke erreichte in 2 Versuchen eine offene `Farbkombination`-Quest, startete eine echte Schlange über den Startkreis und bestätigte `Farbgruppenband`, `Farbkombination: noch 4 Karten`, 3px Border, Hard Shadow, Wald-Gradient, kein verschachteltes `role=button` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1am Waldtanz-Questfährten

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Offene Questkarten zeigen jetzt direkt auf der `Waldtanz-Aufgabentafel` spielnahe `Quest-Fährten` mit Fortschrittswerten und Chips. Engine-Regeln, Aufgabenerfüllung, Aktionsausführung, Schlangenbereich, Lobby, Schlangenbuch und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1am_questfaehrten_aufgabentafel.test.tsx` fiel initial erwartungsgemäß fehl, weil Quest-Fährten und CSS-Vertrag fehlten.
- [x] GREEN: `src/components/questFaehrte.ts` berechnet Präsentations-Fährten für Farbenpracht, Farbharmonie, Farbkombination und Farbwechsler plus generischen Fallback; `src/components/WaldtanzAufgabentafel.tsx` rendert sie pro Questkarte; `src/App.css` ergänzt die chunky Stitch-Plakette mit 2px dashed Dark-Forest-Border, Pill-Chips und hellem Waldhintergrund.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und von Codex überprüft.
- [x] Codex Review: Review-only auf uncommitted Worktree inklusive untracked Test/Helper; `BLOCKERS: None`. Non-Blocker: zukünftiges Drift-Risiko, falls Quest-Fortschritte später nicht aus einer gemeinsamen Engine-Quelle geteilt werden.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1am_questfaehrten_aufgabentafel.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx src/App.m1t_questkarte_einsammeln.test.tsx src/App.m1s_questfortschritt.test.tsx src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx` → 5 Testdateien / 9 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 246 Testdateien / 792 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `c6b6a03 — M1am: Questfaehrten auf Aufgabentafel zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1am-Browser-Smoke bestätigt 3 Questkarten mit 3 `Quest-Fährten`, sichtbare Fährten-Hauptwerte/Chips, computed `borderTopWidth: 2px`, `borderTopStyle: dashed`, Hintergrund `rgba(236, 255, 227, 0.72)` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1an Quest-Zugkarten in der Hand

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Handkarten zeigen jetzt direkt, wenn ein legaler Schlangenbau-Zug eine offene Quest-Fährte voranbringt. Die `Quest-Zug`-Badges und die ausgewählte `Questzielkarte` verbinden Handfächer, Brettziele und Aufgabentafel, ohne Engine-Regeln, Aktionsausführung, Drag-and-drop, Lobby, Schlangenbuch oder Sieger-Party umzubauen.
- [x] RED: `npm test -- --run src/App.m1an_questzug_handkarten.test.tsx` fiel initial erwartungsgemäß fehl, weil Handkarten keine `Quest-Zug`-Badges, keine `Questzielkarte` und keinen CSS-Vertrag hatten. Codex-Blocker wurden test-first ergänzt: legale `NeueSchlangeStarten`-Questfortschritte und keine Farbharmonie-Falschpositive für bereits gezählte Farben.
- [x] GREEN: `src/engine/questZugHinweise.ts` berechnet Quest-Zughinweise engine-nah aus bereits legal enumerierten `NeueSchlangeStarten`-/`KarteAnlegen`-Aktionen und simuliert sie über `anwendeAktion`; `HandkartenPanel` rendert `Quest-Zug`-Pill-Badges und eine `Questzielkarte` in der Auswahlvorschau; `App.css` ergänzt Stitch-Pill-/Hard-Shadow-Styling und bewahrt ältere CSS-Source-Verträge.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und von Codex reviewt.
- [x] Codex Review/Re-Review: Initiale Blocker zu fehlenden Startkreis-Zügen, Farbharmonie-Falschpositiven und Engine/UI-Boundary wurden behoben. Finales Re-Review: `BLOCKERS: None`; Codex bestätigte `anwendeAktion`-Delegation, Startkreis-Abdeckung, Farbharmonie-Setvergleich, A11y-Namen, CSS-Kompatibilität und Zeilenbudget.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1an_questzug_handkarten.test.tsx src/App.m1am_questfaehrten_aufgabentafel.test.tsx src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx src/App.m1aa_zielkarte_vorschau.test.tsx` → 4 Testdateien / 11 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 247 Testdateien / 796 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 489, `src/components/HandkartenPanel.tsx` 217, `src/engine/questZugHinweise.ts` 84, M1an-Test 128.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `8a6a0a6 — M1an: Questzug-Hinweise auf Handkarten zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1an-Browser-Smoke bestätigt mit deterministischem Produktions-RNG `Quest-Zug` im Handfächer, `Farbkombination +1`, 4 Quest-Badges, computed Badge-`borderRadius: 999px`, `borderTopWidth: 2px`, Sunny-Gold-Hintergrund `rgb(254, 203, 0)` und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ao Waldtanz-Fokusbrett

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die `/game`-Bühne wird wieder zum kompakten Spielbrett statt zu einer langen Scrollseite. `Zugpfad`, `Gegnerzug`, `Zugkompass`, `Partiefortschritt` und `Waldtanz-Bonuszauber` liegen gemeinsam in einer board-nahen `Zugleiste`; Spielerrahmen, Arenastein, Zugleiste und Waldobjekte sind route-spezifisch scroll-gebunden; die Handkarten bleiben direkt nach Arena/Zugleiste am unteren ersten Spielbild.
- [x] RED/GREEN: `src/App.m1ao_waldtanz_fokusbrett.test.tsx` fiel initial wegen fehlender Arena-/Zugleisten-Caps und fehlendem Handkarten-Fokusvertrag; die Umsetzung ergänzt die `Zugleiste`, route-spezifische `max-height`-/`overflow:auto`-Verträge und bewahrt `Waldtanz-Arenastein → Handkarten` in DOM-Reihenfolge. Der angrenzende M1ae-Erstbild-Test wurde auf die neue Zugleisten-Struktur aktualisiert.
- [x] Claude Code / `/simplify`: Implementierungs- und Simplify-Läufe mit `claude --model opusplan` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offen dokumentiert.
- [x] Codex Review/Re-Review: Initiale Blocker zu `Zugleiste`-Source-Order (`Gegnerzug` vor `Zugpfad`) und geerbten Kind-Grid-Regeln wurden behoben. Re-Review: `BLOCKERS: None`; Codex bestätigte DOM-/visuelle Reihenfolge, CSS-Reset für Zugleisten-Kinder, unveränderte Aktionen und Dateibudget.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx src/App.m2i_verdoppler_bonuszauber.test.tsx` → 7 Testdateien / 11 Tests bestanden; zusätzlich M1ao/M1ae-Re-Review-Fokus → 2 Testdateien / 2 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 248 Testdateien / 797 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 491, M1ao-Test 73.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `b782910 — M1ao: Waldtanz-Fokusbrett kompakter machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, keine Console-/Page-Errors; bei 1280×900 sind Spielerrahmen (`height 227`, `overflowY auto`), Arenastein (`height 489`, `overflowY auto`), Zugleiste (`height 432`, `overflowY auto`) und Handkarten (`y 891`, also am unteren Viewport-Rand sichtbar) nachgewiesen; `Zugpfad → Gegnerzug → Zugkompass → Partiefortschritt` hat `gridRow: auto` und passende Reihenfolge; erster Handkarten-Klick selektiert eine Karte ohne Browserfehler.

## Evidence — 15.06.2026 M1ap Aktionsfallback unter dem Brett

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf `/game` bleibt der Spieltisch primär; `Empfohlene Aktion` und `Phasenaktion` bleiben als Schnellzug sichtbar, während `Weitere Aktionen` + `Phasenregeln` in ein geschlossenes `Brett-Fallback: weitere Aktionen und Regeln` unter dem Brett wandern. `/` behält die offene Aktionsliste.
- [x] RED/GREEN: `src/App.m1ap_aktionsfallback_untergeordnet.test.tsx` fiel initial wegen fehlender `/game`-Fallback-Klasse und fehlendem Details-Fallback fehl; die Umsetzung ergänzt `kompakterBrettFallback={istGameRoute}`, route-spezifische Fallback-Struktur und CSS für den untergeordneten Brett-Fallback.
- [x] Claude Code / `/simplify`: `claude --model opusplan` und `/simplify` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- [x] Codex Review/Re-Review: Initiale Blocker zu KI-no-reaction-Status/Phasenregeln und CSS-Source-Kollision mit M1b wurden behoben. Re-Review: `BLOCKERS: None`.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1ap_aktionsfallback_untergeordnet.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.test.tsx -t 'R27 UI-Zug beenden|M1ap|M1b'` → 3 Testdateien / 4 relevante Tests bestanden; Codex-Re-Review-Fokus → 10 Testdateien / 14 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 249 Testdateien / 799 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `8649160 — M1ap: Aktionsfallback unterordnen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200; M1ap-Browser-Smoke bestätigt auf `/game` `aktionen-panel--brettfallback`, sichtbare Schnellzug-Regionen, geschlossenes Fallback-Details mit `Weitere Aktionen` + `Phasenregeln`, Handkarten nach Arena (`arenaBottom 875.234375`, `handTop 890.59375`), auf `/` keine Fallback-Details und offene `Weitere Aktionen`, keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1aq Waldtanz-Handbühne

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die aktive Hand wird zum unteren Brettabschluss als `Waldtanz-Handbühne` mit Spielerplakette, Punktestand, Zugphase, Handkarten- und Spielbar-Chips. Arena, Handkartenfächer, Auswahl/Drag, Engine-Regeln, Aktionsdock, Lobby, Regeln und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1aq_waldtanz_handbuehne.test.tsx` fiel initial erwartungsgemäß, weil die benannte Handbühne, Spieler-/Statuschips und der 3px/Hard-Shadow-CSS-Vertrag fehlten. Codex-Review fand einen Random-Fixture-Blocker; der Test nutzt jetzt `initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))}`.
- [x] GREEN: `src/components/HandkartenPanel.tsx` rendert die neue `Waldtanz-Handbühne` vor der Kartenleiste und erhält die bestehende `Handkarten`-Region, Detailvorschau, Kartenbuttons und die alte `Karten sofort spielbar`-Statuszeile für Nachbarregressionen. `src/App.tsx` reicht Spielername, Punktestand und Zugphase aus Engine-/Wertungszustand durch. `src/App.css` ergänzt Stitch-Palette, 3px Dark-Forest-Border, 2.5rem-Radius, 7px-Hard-Shadow, Spielerplakette und pillige Statuschips.
- [x] Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und durch Codex reviewt.
- [x] Codex Review/Re-Review: Initialer Blocker zur zufallsabhängigen Testhand wurde deterministisch behoben. Full-Suite-Fund zu Textkollisionen wurde in-slice durch eindeutige Handbühnen-Copy (`Deine Hand — …`, `Spielbar: …`) behoben. Finaler Quick-Review: `BLOCKERS: No blockers remain`.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1aq_waldtanz_handbuehne.test.tsx src/App.m1y_handkarten_spielbarkeit.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx src/App.r78_handkarten_auswahl.test.tsx src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1ap_aktionsfallback_untergeordnet.test.tsx` → 6 Testdateien / 12 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 250 Testdateien / 800 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Zeilenbudget: `src/App.tsx` 495, `src/components/HandkartenPanel.tsx` 237, M1aq-Test 50.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `9d3b66d — M1aq: Waldtanz-Handbuehne zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Generic Smoke bestätigt `/` und `/game` HTTP 200 und Kernregionen ohne Console-/Page-Errors; M1aq-Browser-Smoke bestätigt `Waldtanz-Handbühne`, `Deine Hand`, Handkarten-/Spielbar-Chips, Handbühne unter Arenastein (`arenaBottom 875.234375`, `handTop 890.59375`), computed `borderTopWidth: 3px`, `borderTopStyle: solid`, Radius `45px`, Hard Shadow `0px 7px`, `stageDisplay: flex`, Chip-Radius `999px`, Spielerplakette `rgb(164, 222, 2)`, erfolgreiche Handkarten-Auswahl und keine Console-/Page-Errors.

## Evidence — 15.06.2026 M1ar Waldtanz-Tiefenfächer

- [x] Scope: Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die board-nahe Hand wird zum tieferen, überlappenden Kartenfächer mit dynamischer Rotation/Tiefenstaffel, Hover-Lift und ausgewählter Karte oberhalb des Fächers. Engine-Regeln, Kartenbuttons, Auswahl, Drag-Vorschau, Waldtanz-Handbühne, Zielspur, Lobby, Regeln und Sieger-Party bleiben unverändert.
- [x] RED: `npm test -- --run src/App.m1ar_waldtanz_tiefenfaecher.test.tsx` fiel initial erwartungsgemäß fehl, weil `handkartenleiste--tiefenfaecher`, Fächer-Geometrie und Tieflift-Vertrag fehlten. Codex-Review-Blocker wurden test-first/vertragsnah ergänzt: dynamische Staffelung für sechs Handkarten, ausgewählte Randkarte mit `--hand-faecher-z: 99` und eigene `handkarte-tiefenfaecher-wackelt`-Animation statt maskierter Basisanimation.
- [x] GREEN: `src/components/HandkartenPanel.tsx` ergänzt die Tiefenfächer-Klasse und berechnet pro Handkarte CSS-Variablen für Rotation, Y-Versatz und Stack-Z-index aus `handkarten.length`; ausgewählte Karten bekommen `--hand-faecher-z: 99`. `src/App.css` ergänzt Flex-Fächer, kontrollierte Überlappung, 900px-Perspektive, Hover-Lift, mobile Wrap-Fallbacks und die tiefere Auswahlanimation.
- [x] Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt und durch Codex überprüft.
- [x] Codex Review/Re-Review: Initiale Blocker zu maskierter Auswahlanimation, hardcodierter Fünf-Karten-Geometrie und zu schwacher CSS-Source-Testintegrität wurden behoben. Zweites Review fand das inline-Variable-/Z-index-Problem; finaler Quick-Re-Review: `BLOCKERS: None`.
- [x] Targeted/Adjacent: `npm test -- --run src/App.m1ar_waldtanz_tiefenfaecher.test.tsx src/App.m1aq_waldtanz_handbuehne.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.r78_handkarten_auswahl.test.tsx` → 5 Testdateien / 10 Tests bestanden.
- [x] Full Gates: `npm test -- --run` → 251 Testdateien / 802 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- [x] Commit/Push/Deploy/Smoke: Feature-Commit `3d84a23 — M1ar: Handkarten als Tiefenfächer staffeln` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). M1ar-Browser-Smoke bestätigt `/` und `/game` HTTP 200, `handkartenleiste--tiefenfaecher`, 5 Live-Handkarten, erste Karte mit `--hand-faecher-rotation: -8deg`, mittlere Karte mit `--hand-faecher-y: -0.64rem`, ausgewählte Randkarte mit `aria-pressed=true`, `handkarte--ausgewaehlt`, `--hand-faecher-z: 99`, computed `display: flex`, Animation `handkarte-tiefenfaecher-wackelt` und keine Console-/Page-Errors.
