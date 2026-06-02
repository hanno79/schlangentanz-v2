1|# Playability Gate
2|
3|A route loading successfully is not enough. A green smoke test is not enough.
4|
5|## Automated gates
6|
7|- [ ] Unit tests pass
8|- [ ] Rule-contract tests pass
9|- [ ] Invalid-action tests pass
10|- [ ] State-machine tests pass
11|- [ ] Integration tests pass
12|- [ ] Playwright E2E gameplay scenarios pass
13|- [ ] Typecheck passes
14|- [ ] Production build passes
15|
16|## Live production gates
17|
18|- [ ] Production URL returns HTTP 200
19|- [ ] Game route loads without console errors
20|- [ ] New game can be started
21|- [ ] Legal actions are available only when legal
22|- [ ] Illegal actions are blocked with clear feedback
23|- [ ] A complete representative game can be played to end condition
24|- [ ] Scoring/end state matches spec
25|
26|## Human gate
27|
28|- [ ] User confirms the game is actually playable according to the locked spec
29|
30|## Evidence — 01.06.2026 R20 Pflicht-Abwurf als Legal Action
31|
32|- [x] Unit/Rule/State/UI tests: `npm test -- --run` → 13 Testfiles, 218 Tests bestanden.
33|- [x] Typecheck: `npm run typecheck` bestanden.
34|- [x] Lint: `npm run lint` bestanden.
35|- [x] Production build: `npm run build` bestanden.
36|- [x] Diff hygiene: `git diff --check` bestanden.
37|- [x] Codex Review: keine Blocker nach R19-Pflicht-Abwurf-Fix.
38|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
39|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
40|- [ ] Legal actions are available only when legal — nach Deploy zu prüfen.
41|
42|## Evidence — 01.06.2026 R21 Pflicht-Abwurf-UI-Binding
43|
44|- [x] RED: `src/App.test.tsx -t 'R21 UI-Pflicht-Abwurf'` schlug vor Implementierung fehl.
45|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
46|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 219 Tests bestanden.
47|- [x] Typecheck: `npm run typecheck` bestanden.
48|- [x] Lint: `npm run lint` bestanden.
49|- [x] Build: `npm run build` bestanden.
50|- [x] Codex Review: keine Blocker.
51|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
52|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
53|
54|## Evidence — 01.06.2026 R22 UI-Handkartenanzeige
55|
56|- [x] RED: `src/App.test.tsx -t 'R22 UI-Handkartenanzeige'` schlug vor Implementierung fehl.
57|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
58|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 220 Tests bestanden.
59|- [x] Typecheck: `npm run typecheck` bestanden.
60|- [x] Lint: `npm run lint` bestanden.
61|- [x] Build: `npm run build` bestanden.
62|- [x] Codex Review: keine Blocker.
63|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
64|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
65|
66|## Evidence — 01.06.2026 R23 UI-Zugpflichtenanzeige
67|
68|- [x] RED: `src/App.test.tsx -t 'R23 UI-Zugpflichtenanzeige'` schlug vor Implementierung fehl.
69|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
70|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 221 Tests bestanden.
71|- [x] Typecheck: `npm run typecheck` bestanden.
72|- [x] Lint: `npm run lint` bestanden.
73|- [x] Build: `npm run build` bestanden.
74|- [x] Codex Review: keine Blocker; Nachzug: `MAX_KARTEN_PRO_ZUG` ist noch nicht vollständig Engine-Single-Source-of-Truth.
75|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
76|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
77|
78|## Evidence — 01.06.2026 R24 MAX_KARTEN_PRO_ZUG Single-Source-of-Truth
79|
80|- [x] Guard-Test: Serialisierung akzeptiert `MAX_KARTEN_PRO_ZUG` und lehnt `MAX_KARTEN_PRO_ZUG + 1` ab.
81|- [x] Engine-Refactor: `turnState`, `legalActions` und `serialization` nutzen `MAX_KARTEN_PRO_ZUG` statt harter Maximalwert-Literale.
82|- [x] Targeted: `npm test -- --run src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/serialization_r19.test.ts src/App.test.tsx` bestanden.
83|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 223 Tests bestanden.
84|- [x] Typecheck: `npm run typecheck` bestanden.
85|- [x] Lint: `npm run lint` bestanden.
86|- [x] Build: `npm run build` bestanden.
87|- [x] Literal-Scan: keine verbleibenden relevanten `gespielteKarten`/`ausgespielteKarten`-Maximalwert-Literale gefunden.
88|- [x] Codex Review: keine Blocker, keine Non-Blocker.
89|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
90|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
91|
92|## Evidence — 01.06.2026 R25 UI-Ausspielphase beenden
93|
94|- [x] RED: `src/App.test.tsx -t 'R25 UI-Ausspielphase beenden'` schlug vor Implementierung fehl, weil Zugphase/Button noch fehlten.
95|- [x] Codex-Blocker reproduziert: zusätzlicher RED-Test belegt, dass `Ausspielphase beenden` auch bei weiterer legaler Aktion nach 1 gespielten Karte sichtbar sein muss.
96|- [x] GREEN: UI rendert `Zugphase`, zeigt `Ausspielphase beenden` ab `gespielteKarten > 0` und ruft `beendeAusspielphase(z)` auf.
97|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
98|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 225 Tests bestanden.
99|- [x] Typecheck: `npm run typecheck` bestanden.
100|- [x] Lint: `npm run lint` bestanden.
101|- [x] Build: `npm run build` bestanden.
102|- [x] Codex Review/Re-Review: initialer Button-Gating-Blocker behoben; final keine Blocker.
103|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
104|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
105|
106|## Evidence — 01.06.2026 R26 UI-Aufgabenprüfung beenden
107|
108|- [x] Baseline: `HEAD == origin/main` auf `29b3dcacdeb64943a857e538d6b77ee5d988b4bd`; targeted Tests und Typecheck bestanden.
109|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R26 UI-Aufgabenprüfung beenden'` schlug erwartungsgemäß fehl, weil der Button `Aufgabenprüfung beenden` fehlte.
110|- [x] GREEN: UI rendert `Aufgabenprüfung beenden` nur bei `zugphase === 'Aufgabenpruefung'` und ruft `beendeAufgabenpruefung(z, { aufgabenGeprueft: true })` auf.
111|- [x] R25-Regression abgesichert: In `Aufgabenpruefung` ist `Ausspielphase beenden` nicht sichtbar, stattdessen der neue R26-Button.
112|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts` bestanden.
113|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 226 Tests bestanden.
114|- [x] Typecheck: `npm run typecheck` bestanden.
115|- [x] Lint: `npm run lint` bestanden.
116|- [x] Build: `npm run build` bestanden.
117|- [x] Codex Review: keine Blocker; keine actionable Non-Blocker.
118|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
119|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
120|
121|## Evidence — 01.06.2026 R27 UI-Zug beenden
122|
123|- [x] Baseline: `HEAD == origin/main` auf `4662e5489b321fb58438363b7606c6088281727d`; targeted Tests und Typecheck bestanden.
124|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R27 UI-Zug beenden'` schlug erwartungsgemäß fehl, weil der Button `Zug beenden` im `Zugabschluss` fehlte.
125|- [x] GREEN: UI rendert `Zug beenden` nur bei `zugphase === 'Zugabschluss'` und ruft `beendeZug(z, { pflichtenErfuellt: true })` auf.
126|- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Nachziehphase`, `Aktiver Spieler: spieler-2`, `Gespielte Karten: 0/2`.
127|- [x] R26-Regression abgesichert: In `Zugabschluss` ist `Aufgabenprüfung beenden` nicht sichtbar, stattdessen der neue R27-Button.
128|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
129|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 227 Tests bestanden.
130|- [x] Typecheck: `npm run typecheck` bestanden.
131|- [x] Lint: `npm run lint` bestanden.
132|- [x] Build: `npm run build` bestanden.
133|- [x] Codex Review: keine Blocker; keine Non-Blocker.
134|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
135|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
136|
137|## Evidence — 01.06.2026 R28 UI-Ausspielphase für nächsten Spieler starten
138|
139|- [x] Baseline: `HEAD == origin/main` auf `eeecfbfefdabde1679bb783a88da647ad94ed48e`; targeted Tests und Typecheck bestanden.
140|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R28 UI-Ausspielphase für nächsten Spieler starten'` schlug erwartungsgemäß fehl, weil `Ausspielphase starten` in der `Nachziehphase` fehlte.
141|- [x] GREEN: UI rendert `Ausspielphase starten` nur bei `zugphase === 'Nachziehphase'` und ruft `starteAusspielphase(z)` auf.
142|- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Ausspielphase`, `Aktiver Spieler: spieler-2`, 5 legale Aktionsbuttons, u.a. `Neue Schlange starten mit Karte blau-02`.
143|- [x] R27-Regression abgesichert: Nach `Zug beenden` ist Spieler 2 in `Nachziehphase` und der neue Startbutton sichtbar.
144|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
145|- [x] Full tests: `npm test -- --run` → 13 Testfiles, 228 Tests bestanden.
146|- [x] Typecheck: `npm run typecheck` bestanden.
147|- [x] Lint: `npm run lint` bestanden.
148|- [x] Build: `npm run build` bestanden.
149|- [x] Codex Review: keine Blocker; Non-Blockers nur Verifikationsnotizen.
150|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
151|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
152|
153|## Evidence — 01.06.2026 R29 Pflicht-Nachziehen beim Zugwechsel
154|
155|- [x] Nutzerfund reproduziert: Screenshot zeigte `spieler-1` in `Nachziehphase` mit nur `blau-03, blau-05, blau-07, blau-09`; die nachgezogene fünfte Karte fehlte sichtbar.
156|- [x] Root Cause: `beendeZug(...)` wechselte zum nächsten Spieler in `Nachziehphase`, zog aber noch nicht auf 5 Karten auf; Nachziehen passierte erst später in `starteAusspielphase(...)`.
157|- [x] RED Engine: `turn_state_r29.test.ts` erwartet, dass `beendeZug(...)` den nächsten aktiven Spieler beim Zugwechsel sichtbar auf 5 Karten auffüllt und den Nachziehstapel reduziert.
158|- [x] RED UI: `App.test.tsx` bildet zwei Züge nach und erwartet bei Spieler 1 zu Beginn des zweiten Zuges `Handkarten: blau-03, blau-05, blau-07, blau-09, blau-11`.
159|- [x] GREEN: `zieheAufMindesthand(...)` zentralisiert Pflicht-Nachziehen; `beendeZug(...)` nutzt es für den nächsten aktiven Spieler, `starteAusspielphase(...)` behält den Legacy-/Direktzustand-Sicherheitszug.
160|- [x] `/simplify`: Draw-Logik dedupliziert; keine zusätzliche Regel eingeführt.
161|- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_r29.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` → 69 Tests bestanden.
162|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 230 Tests bestanden.
163|- [x] Typecheck: `npm run typecheck` bestanden.
164|- [x] Lint: `npm run lint` bestanden.
165|- [x] Build: `npm run build` bestanden.
166|- [x] Codex Review: keine Blocker; geprüft wurden Mutation, Double-Draw, Endspurt-Auslöser, Endrundenverhalten und Dateigrößen.
167|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
168|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
169|
170|## Evidence — 01.06.2026 R30 UI-Wertungsanzeige
171|
172|- [x] Scope: Vorhandene Engine-Wertung (`berechneSpielzustandGesamtwertung`) in der UI sichtbar machen; keine neue Scoring-Regel in React.
173|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` schlug erwartungsgemäß fehl, weil Wertungszeilen fehlten.
174|- [x] GREEN: `src/App.tsx` importiert `berechneSpielzustandGesamtwertung`, berechnet die Wertung aus `zustand` und rendert `Wertung {spielerId}: {gesamtPunkte} Punkte` für alle Spieler.
175|- [x] Test-Härtung: Reihenfolge der Spielerwertung wird explizit geprüft; Wertung aktualisiert nach einer Engine-Aktion sichtbar von `0 Punkte` auf `3 Punkte`.
176|- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` → 2 R30-Tests bestanden.
177|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 232 Tests bestanden.
178|- [x] Typecheck: `npm run typecheck` bestanden.
179|- [x] Lint: `npm run lint` bestanden.
180|- [x] Build: `npm run build` bestanden.
181|- [x] Codex Review: keine Blocker; geprüft wurden Engine-only-Wertung, Aktualisierung nach UI-Aktion, stabile Reihenfolge, Hook-Dependency, Fixture-Eigentum und Dateigrößen.
182|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
183|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
184|
185|## Evidence — 01.06.2026 R31 UI-Gewinneranzeige
186|
187|- [x] Scope: Vorhandene Engine-Gewinnerermittlung (`berechneGewinner`) in der UI sichtbar machen; keine neue Gewinner- oder Scoring-Regel in React.
188|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R31 UI-Gewinneranzeige'` schlug erwartungsgemäß fehl, weil bei `Spielende` keine Gewinnerzeile gerendert wurde.
189|- [x] GREEN: `src/App.tsx` importiert `berechneGewinner`, berechnet Gewinner nur bei `zustand.zugphase === 'Spielende'` und rendert `Gewinner {spielerId}: {gesamtPunkte} Punkte` für die komplette Engine-Gewinnerliste.
190|- [x] Test-Härtung: Vor Spielende wird keine Gewinneranzeige gerendert; Gleichstand rendert alle Gewinner in stabiler Engine-Reihenfolge.
191|- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R31 UI-Gewinneranzeige'` → 3 R31-Tests bestanden.
192|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 235 Tests bestanden.
193|- [x] Typecheck: `npm run typecheck` bestanden.
194|- [x] Lint: `npm run lint` bestanden.
195|- [x] Build: `npm run build` bestanden.
196|- [x] Codex Review: keine Blocker; geprüft wurden Engine-only-Gewinnerermittlung, Spielende-Gating, Gleichstand, stabile Reihenfolge, Hook-Dependency, Fixture-Eigentum und Dateigrößen.
197|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
198|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
199|
200|## Evidence — 01.06.2026 R32 UI-Spielphase und Endrunde
201|
202|- [x] Scope: Vorhandene Engine-State-Felder `spielphase` und `endrunde` in der UI sichtbar machen; keine Endrunden- oder Spielende-Regel in React.
203|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R32 UI-Spielphase und Endrunde'` schlug erwartungsgemäß fehl, weil Spielphase und Endrundenstatus in der UI fehlten.
204|- [x] GREEN: `src/App.tsx` rendert `Spielphase`, Endrunden-Auslöser und verbleibende Endrunden-Spieler direkt aus `zustand`.
205|- [x] Test-Härtung: Normalzustand ohne Endrunden-Auslöser, Endspurt-Auslöser mit Reihenfolge, Aktualisierung nach `Zug beenden` und Spielende mit `Verbleibende Endrunde: keine` sind geprüft.
206|- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R32 UI-Spielphase und Endrunde'` → 4 R32-Tests bestanden.
207|- [x] UI + Endrunde targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state_endrunde.test.ts` → 27 Tests bestanden.
208|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 239 Tests bestanden.
209|- [x] Typecheck: `npm run typecheck` bestanden.
210|- [x] Lint: `npm run lint` bestanden.
211|- [x] Build: `npm run build` bestanden.
212|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, Index-zu-Spieler-ID-Mapping, stale Display nach Zugabschluss, Normal/Endspurt/Beendet-Pfade, Fixtures und Dateigrößen.
213|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
214|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
215|
216|## Evidence — 01.06.2026 R33 UI-Material- und Aufgabenübersicht
217|
218|- [x] Scope: Vorhandene Engine-State-Felder `nachziehstapel.length`, `aufgabenStapel.length` und `offeneAufgaben[].name` in der UI sichtbar machen; keine Deck-, Zieh- oder Aufgabenregel in React.
219|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R33 UI-Material- und Aufgabenübersicht'` schlug erwartungsgemäß fehl, weil Material-/Aufgabenübersicht in der UI fehlte.
220|- [x] GREEN: `src/App.tsx` rendert `Nachziehstapel: X Karten`, `Aufgabenstapel: X Karten` und `Offene Aufgaben: ...` direkt aus `zustand` mit Fallback `keine`.
221|- [x] Test-Härtung: Nachziehstapel-Aktualisierung nach Engine-`beendeZug(...)` mit realem Nachziehen geprüft; Codex-Blocker zu hardcodierten `100/99`-Zählern behoben, erwartete Werte werden aus Engine-State abgeleitet.
222|- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R33 UI-Material- und Aufgabenübersicht'` → 2 R33-Tests bestanden.
223|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 241 Tests bestanden.
224|- [x] Typecheck: `npm run typecheck` bestanden.
225|- [x] Lint: `npm run lint` bestanden.
226|- [x] Build: `npm run build` bestanden.
227|- [x] Codex Re-Review: keine Blocker; geprüft wurden reine State-Anzeige, stale Display nach `beendeZug`, keine hardcodierten Deck-Zähler, Default-UI, Imports/Typecheck und Dateigrößen.
228|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
229|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
230|
231|## Evidence — 01.06.2026 R34 UI-Spielerübersicht
232|
233|- [x] Scope: Vorhandene Engine-Spielerdaten (`id`, `name`, `steuerung`, `hand.length`, `schlangen.length`) für alle Spieler sichtbar machen; keine neue Spieler-, KI-, Zug- oder Scoring-Regel in React.
234|- [x] RED: `npm test -- --run src/App.test.tsx -t 'R34 UI-Spielerübersicht'` schlug erwartungsgemäß fehl, weil keine Spielerübersicht gerendert wurde.
235|- [x] GREEN: `src/App.tsx` rendert alle `zustand.spieler` als `Spielerübersicht ...` direkt aus dem Engine-State.
236|- [x] Test-Härtung: Vollständige Collection-Länge wird geprüft; Anzeige aktualisiert nach Engine-Aktion `NeueSchlangeStarten` von 5/0 auf 4/1 für Spieler 1.
237|- [x] `/simplify`: aggressiv entfernte Aktualisierungsprüfung wurde verworfen/restauriert, weil State-Display-Slices Refresh-Coverage benötigen.
238|- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R34 UI-Spielerübersicht'` → 2 R34-Tests bestanden.
239|- [x] Full tests: `npm test -- --run` → 14 Testfiles, 243 Tests bestanden.
240|- [x] Typecheck: `npm run typecheck` bestanden.
241|- [x] Lint: `npm run lint` bestanden.
242|- [x] Build: `npm run build` bestanden.
243|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-Collection, Refresh nach Engine-Aktion, Fixture-Eigentum, Default-UI, Imports/Typecheck und Dateigrößen.
244|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
245|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
246|
247|## Evidence — 01.06.2026 R35 UI-Spieler-Schlangenübersicht
248|
249|- [x] Scope: Vorhandene Engine-Schlangen je Spieler (`zustand.spieler[].schlangen`) für alle Spieler sichtbar machen; keine neue Schlangen-, Spieler-, Zug- oder Scoring-Regel in React.
250|- [x] RED: `npm test -- --run src/App.r35.test.tsx` schlug erwartungsgemäß fehl, weil keine Spieler-Schlangenübersicht gerendert wurde.
251|- [x] GREEN: `src/App.tsx` rendert für jeden Spieler `Schlangenübersicht ...` mit `keine` oder allen Schlangen in Engine-Reihenfolge.
252|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r35.test.tsx`, damit `src/App.test.tsx` unter 500 Zeilen bleibt; vollständige Spieler-Collection und Refresh nach `NeueSchlangeStarten` geprüft.
253|- [x] `/simplify`: Header wurde wegen Projektregel 8 wiederhergestellt; Post-Action-Refresh-Coverage blieb erhalten.
254|- [x] Targeted: `npm test -- --run src/App.r35.test.tsx` → 2 R35-Tests bestanden.
255|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx` → 28 UI-Tests bestanden.
256|- [x] Full tests: `npm test -- --run` → 15 Testfiles, 245 Tests bestanden.
257|- [x] Typecheck: `npm run typecheck` bestanden.
258|- [x] Lint: `npm run lint` bestanden.
259|- [x] Build: `npm run build` bestanden.
260|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-Collection, alle Schlangen je Spieler, Refresh nach Engine-Aktion, neue untracked Testdatei, Header-Konvention und Dateigrößen.
261|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
262|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
263|
264|## Evidence — 01.06.2026 R36 UI-Schlangenzustände
265|
266|- [x] Scope: Vorhandene Engine-Schlangenzustände (`zustand.spieler[].schlangen[].zustand`) sichtbar machen; keine neue Schlangen-, Blockier-, Schutz-, Zug- oder Scoring-Regel in React.
267|- [x] RED: `npm test -- --run src/App.r36.test.tsx` schlug erwartungsgemäß fehl, weil keine Schlangenzustand-Zeilen gerendert wurden.
268|- [x] GREEN: `src/App.tsx` rendert für jede vorhandene Schlange `Schlangenzustand {spieler.id}/{schlange.id}: {schlange.zustand}` direkt aus dem Engine-State.
269|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r36.test.tsx`; Fixture nutzt Karten von Spieler 1 und entfernt sie aus der Hand; alle drei Engine-Zustände (`aktiv`, `blockiert`, `geschuetzt`) werden geprüft.
270|- [x] `/simplify`: keine Änderungen; Header und Post-Action-Refresh-Coverage blieben erhalten.
271|- [x] Targeted: `npm test -- --run src/App.r36.test.tsx` → 2 R36-Tests bestanden.
272|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx` → 30 UI-Tests bestanden.
273|- [x] Full tests: `npm test -- --run` → 16 Testfiles, 247 Tests bestanden.
274|- [x] Typecheck: `npm run typecheck` bestanden.
275|- [x] Lint: `npm run lint` bestanden.
276|- [x] Build: `npm run build` bestanden.
277|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, vollständige Spieler-/Schlangen-Collection, keine Zeilen für Spieler ohne Schlangen, R35-Textvertrag, realistische Fixture-Ownership, Header-Konvention und Dateigrößen.
278|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
279|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
280|
281|## Evidence — 01.06.2026 R37 UI-Kartenarten-Zähler
282|
283|- [x] Scope: Vorhandene Engine-Zugpflichten-Zähler (`zustand.zugpflichten.gespielteFarbkarten` und `gespielteSonderkarten`) sichtbar machen; keine neue Kartenart-, Zuglimit-, Phasen-, Aktions-, Scoring- oder Validierungsregel in React.
284|- [x] RED: `npm test -- --run src/App.r37.test.tsx` schlug erwartungsgemäß fehl, weil keine Kartenarten-Zähler-Zeile gerendert wurde.
285|- [x] GREEN: `src/App.tsx` rendert `Gespielte Kartenarten: {gespielteFarbkarten} Farbkarten, {gespielteSonderkarten} Sonderkarten` direkt aus dem Engine-State.
286|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r37.test.tsx`; direkter Fixture-Zähler ist intern konsistent (`2 = 1 + 1`); Post-Action-Refresh über Engine-Aktion geprüft.
287|- [x] `/simplify`: Testfixture vereinfacht; Header und Post-Action-Refresh-Coverage blieben erhalten.
288|- [x] Targeted: `npm test -- --run src/App.r37.test.tsx` → 2 R37-Tests bestanden.
289|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx` → 32 UI-Tests bestanden.
290|- [x] Full tests: `npm test -- --run` → 17 Testfiles, 249 Tests bestanden.
291|- [x] Typecheck: `npm run typecheck` bestanden.
292|- [x] Lint: `npm run lint` bestanden.
293|- [x] Build: `npm run build` bestanden.
294|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine versteckte UI-Regellogik, Refresh nach Engine-Aktion, R34/R35/R36-Textverträge, Header-Konvention und Dateigrößen.
295|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
296|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
297|
298|## Evidence — 01.06.2026 R38 UI-Ablagestapelgröße
299|
300|- [x] Scope: Vorhandene Engine-Ablagestapelgröße (`zustand.ablagestapel.length`) immer sichtbar machen; keine neue Abwurf-, Material-, Phasen-, Aktions-, Scoring- oder Validierungsregel in React.
301|- [x] RED: `npm test -- --run src/App.r38.test.tsx` schlug erwartungsgemäß fehl, weil keine Ablagestapelgrößen-Zeile gerendert wurde.
302|- [x] GREEN: `src/App.tsx` rendert `Ablagestapelgröße: {zustand.ablagestapel.length} Karten` direkt aus dem Engine-State und behält die vorhandene Detailzeile `Ablagestapel: ...` für nicht-leere Stapel bei.
303|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r38.test.tsx`; Fixture entfernt die verwendete Sonderkarte aus dem Nachziehstapel; Post-Action-Refresh nach Engine-Pflicht-Abwurf geprüft.
304|- [x] `/simplify`: Vorschlag zur Singular-/Plural-Änderung verworfen, um den stabilen Textvertrag `N Karten` beizubehalten.
305|- [x] Targeted: `npm test -- --run src/App.r38.test.tsx` → 2 R38-Tests bestanden.
306|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx` → 34 UI-Tests bestanden.
307|- [x] Full tests: `npm test -- --run` → 18 Testfiles, 251 Tests bestanden.
308|- [x] Typecheck: `npm run typecheck` bestanden.
309|- [x] Lint: `npm run lint` bestanden.
310|- [x] Build: `npm run build` bestanden.
311|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, Erhalt der Ablagestapel-Detailzeile, Refresh nach Pflicht-Abwurf, Fixture-Eigentum, R34/R35/R36/R37-Textverträge, Header-Konvention und Dateigrößen.
312|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
313|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
314|
315|## Evidence — 01.06.2026 R39 UI-erfüllte Aufgaben
316|
317|- [x] Scope: Vorhandene Engine-Spieleraufgaben (`spieler.erfuellteAufgaben`) pro Spieler sichtbar machen; keine neue Aufgabenprüfung, Scoring-, Phasen-, Aktions- oder Validierungsregel in React.
318|- [x] RED: `npm test -- --run src/App.r39.test.tsx` schlug erwartungsgemäß fehl, weil keine Zeile `Erfüllte Aufgaben ...` gerendert wurde.
319|- [x] GREEN: `src/App.tsx` rendert pro Spieler `Erfüllte Aufgaben {spieler.id}: ...` direkt aus `spieler.erfuellteAufgaben`; leere Listen werden als `keine` angezeigt.
320|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r39.test.tsx`; Test prüft alle Spieler-Zeilen und dynamisch aus dem Engine-Fixture abgeleitete Aufgaben-Texte.
321|- [x] `/simplify`: Testfixture robuster gemacht; Header und stabiler Textvertrag blieben erhalten.
322|- [x] Targeted: `npm test -- --run src/App.r39.test.tsx` → 1 R39-Test bestanden.
323|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx` → 35 UI-Tests bestanden.
324|- [x] Full tests: `npm test -- --run` → 19 Testfiles, 252 Tests bestanden.
325|- [x] Typecheck: `npm run typecheck` bestanden.
326|- [x] Lint: `npm run lint` bestanden.
327|- [x] Build: `npm run build` bestanden.
328|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine versteckte Aufgaben-/Scoringlogik, kein `geheimeAufgabe`-Leak, vollständige Spieler-Collection, R34/R35/R36/R37/R38-Textverträge, Header-Konvention und Dateigrößen.
329|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
330|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
331|
332|## Evidence — 01.06.2026 R40 UI-offene Aufgabenpunkte
333|
334|- [x] Scope: Vorhandene Engine-Felder `zustand.offeneAufgaben[].name` und `.punkte` sichtbar machen; keine neue Aufgabenprüfung, Scoring-, Phasen-, Aktions- oder Validierungsregel in React.
335|- [x] RED: `npm test -- --run src/App.r40.test.tsx` schlug erwartungsgemäß fehl, weil offene Aufgaben noch ohne Punkte gerendert wurden.
336|- [x] GREEN: `src/App.tsx` rendert `Offene Aufgaben: {name} ({punkte} Punkte), ...`; leere Listen bleiben `Offene Aufgaben: keine`.
337|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r40.test.tsx`; Test prüft vollständige offene Aufgaben-Collection, leere Liste und dass `bedingung` nicht sichtbar wird.
338|- [x] R33-Testvertrag aktualisiert: `src/App.test.tsx` erwartet offene Aufgaben nun ebenfalls mit Punkten.
339|- [x] `/simplify`: Nur JSX-Zeilenumbruch; Header und stabiler Textvertrag blieben erhalten.
340|- [x] Targeted: `npm test -- --run src/App.r40.test.tsx` → 2 R40-Tests bestanden.
341|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx` → 37 UI-Tests bestanden.
342|- [x] Full tests: `npm test -- --run` → 20 Testfiles, 254 Tests bestanden.
343|- [x] Typecheck: `npm run typecheck` bestanden.
344|- [x] Lint: `npm run lint` bestanden.
345|- [x] Build: `npm run build` bestanden.
346|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, keine Aufgaben-/Scoringlogik, kein `bedingung`-/`geheimeAufgabe`-Leak, vollständige offene Aufgaben-Collection, R33-Update, R34/R35/R36/R37/R38/R39-Textverträge, Header-Konvention und Dateigrößen.
347|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
348|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
349|
350|## Evidence — 01.06.2026 R41 UI-Anzahl legaler Aktionen
351|
352|- [x] Scope: Vorhandenes Engine-Enumerator-Ergebnis `legaleAktionen.length` sichtbar machen; keine neue Legalitätslogik, keine Aktionsfilterung und keine Engine-Änderung in React.
353|- [x] RED: `npm test -- --run src/App.r41.test.tsx` schlug erwartungsgemäß fehl, weil `Legale Aktionen: 5` noch nicht gerendert wurde.
354|- [x] GREEN: `src/App.tsx` rendert `Legale Aktionen: {legaleAktionen.length}` direkt aus dem bereits memoisierten `ermittleLegaleAktionen(zustand)`-Ergebnis.
355|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r41.test.tsx`; Test prüft Startzählung, Button-Collection und Refresh auf `Legale Aktionen: 0` nach echter Engine-Aktion.
356|- [x] `/simplify`: Keine Änderungen; Zähler ist bereits minimal und nutzt vorhandenes `legaleAktionen`.
357|- [x] Targeted: `npm test -- --run src/App.r41.test.tsx` → 1 R41-Test bestanden.
358|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx` → 38 UI-Tests bestanden.
359|- [x] Full tests: `npm test -- --run` → 21 Testfiles, 255 Tests bestanden.
360|- [x] Typecheck: `npm run typecheck` bestanden.
361|- [x] Lint: `npm run lint` bestanden.
362|- [x] Build: `npm run build` bestanden.
363|- [x] Codex Review: keine Blocker; geprüft wurden reine Enumerator-Anzeige, kein UI-Legalitätsbranching, Refresh nach Klick, untracked Testdatei, R34/R35/R36/R37/R38/R39/R40-Textverträge, Header-Konvention und Dateigrößen.
364|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
365|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
366|
367|## Evidence — 01.06.2026 R42 UI-Handkarten-Details
368|
369|- [x] Scope: Vorhandene Engine-Handkartenfelder des aktiven Spielers sichtbar machen; keine neue Karten-, Legalitäts-, Scoring- oder Engine-Logik in React.
370|- [x] RED: `npm test -- --run src/App.r42.test.tsx` schlug erwartungsgemäß fehl, weil `Handkarten-Details:` noch nicht gerendert wurde.
371|- [x] GREEN: `src/App.tsx` rendert `Handkarten-Details:` aus `aktiverSpieler.hand`; Farbkarten zeigen `id`, `farbe`, `punkte`, Sonderkarten zeigen `id`, `name`, leere Hand zeigt `keine`.
372|- [x] Test-Härtung: Neue eigene Testdatei `src/App.r42.test.tsx`; Test leitet erwartete Punkte aus Engine-State ab statt Werte aus Karten-IDs zu erfinden.
373|- [x] Refresh: R42-Test klickt eine echte Engine-Aktion und prüft, dass die ausgespielte Karte aus den Handkarten-Details verschwindet.
374|- [x] `/simplify`: Keine Änderungen; Format bleibt bewusst eng am Engine-State und Testvertrag.
375|- [x] Targeted: `npm test -- --run src/App.r42.test.tsx` → 1 R42-Test bestanden.
376|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx` → 39 UI-Tests bestanden.
377|- [x] Full tests: `npm test -- --run` → 22 Testfiles, 256 Tests bestanden.
378|- [x] Typecheck: `npm run typecheck` bestanden.
379|- [x] Lint: `npm run lint` bestanden.
380|- [x] Build: `npm run build` bestanden.
381|- [x] Codex Review: initialer Blocker war nur `src/App.r42.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Engine-State-Bindung, Header oder Dateigrößen.
382|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
383|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
384|
385|## Evidence — 01.06.2026 R43 UI-Details aktiver Spieler
386|
387|- [x] Scope: Vorhandene Engine-Spielerdaten des aktiven Spielers sichtbar machen; keine neue Turn-, KI-, Legalitäts-, Scoring- oder Engine-Logik in React.
388|- [x] RED: `npm test -- --run src/App.r43.test.tsx` schlug erwartungsgemäß fehl, weil `Aktiver Spieler-Details:` noch nicht gerendert wurde.
389|- [x] GREEN: `src/App.tsx` rendert `Aktiver Spieler-Details: {id} — {name} ({steuerung})` direkt aus `aktiverSpieler`.
390|- [x] Refresh: R43-Test klickt die vorhandene sichtbare Engine-Kette bis `Zug beenden` und prüft, dass die Detailzeile auf den nächsten aktiven Spieler wechselt.
391|- [x] `/simplify`: Keine Änderungen; bestehende Zeile `Aktiver Spieler:` und R34-R42-Textverträge bleiben stabil.
392|- [x] Targeted: `npm test -- --run src/App.r43.test.tsx` → 1 R43-Test bestanden.
393|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx` → 40 UI-Tests bestanden.
394|- [x] Full tests: `npm test -- --run` → 23 Testfiles, 257 Tests bestanden.
395|- [x] Typecheck: `npm run typecheck` bestanden.
396|- [x] Lint: `npm run lint` bestanden.
397|- [x] Build: `npm run build` bestanden.
398|- [x] Codex Review: keine Blocker; geprüft wurden reine Engine-State-Anzeige, sichtbarer Zugwechsel-Refresh, untracked Testdatei im Review, R34-R42-Textverträge, Header-Konvention und Dateigrößen.
399|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
400|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
401|
402|## Evidence — 01.06.2026 R44 Spielerposition am Zug
403|
404|- [x] Scope: Vorhandene Engine-State-Werte `aktiverSpielerIndex` und `spieler.length` sichtbar machen; keine neue Turn-, KI-, Legalitäts-, Scoring- oder Engine-Logik in React.
405|- [x] RED: `npm test -- --run src/App.r44.test.tsx` schlug erwartungsgemäß fehl, weil `Spieler am Zug:` noch nicht gerendert wurde.
406|- [x] GREEN: `src/App.tsx` rendert `Spieler am Zug: {position}/{gesamt}` direkt aus `zustand.aktiverSpielerIndex + 1` und `zustand.spieler.length`.
407|- [x] Refresh: R44-Test klickt die vorhandene sichtbare Engine-Kette bis `Zug beenden` und prüft, dass die Position nach Engine-Folgezustand aktualisiert wird.
408|- [x] `/simplify`: Eine zu starke Test-Vereinfachung wurde zurückgenommen; erwarteter Post-State bleibt engine-derived statt UI-seitig inferiert.
409|- [x] Targeted: `npm test -- --run src/App.r44.test.tsx` → 1 R44-Test bestanden.
410|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx` → 41 UI-Tests bestanden.
411|- [x] Full tests: `npm test -- --run` → 24 Testfiles, 258 Tests bestanden.
412|- [x] Typecheck: `npm run typecheck` bestanden.
413|- [x] Lint: `npm run lint` bestanden.
414|- [x] Build: `npm run build` bestanden.
415|- [x] Codex Review: keine Blocker; geprüft wurden reine State-Anzeige, sichtbarer Zugwechsel-Refresh, engine-derived Test-Erwartung, untracked Testdatei im Review, R34-R43-Textverträge, Header-Konvention und Dateigrößen.
416|- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
417|- [ ] Game route loads without console errors — nach Deploy zu prüfen.
418|
419|## Evidence — 01.06.2026 R45 Schlangen-Gesamtzahl
420|
421|- [x] Scope: Vorhandene Engine-State-Collection `zustand.spieler[*].schlangen.length` als Gesamtzählung sichtbar machen; keine neue Schlangen-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
422|- [x] RED: `npm test -- --run src/App.r45.test.tsx` schlug erwartungsgemäß fehl, weil `Schlangen gesamt:` noch nicht gerendert wurde.
423|- [x] GREEN: `src/App.tsx` rendert `Schlangen gesamt: X` direkt aus `zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)`.
424|- [x] Refresh: R45-Test klickt eine vorhandene Engine-Aktion und prüft, dass die Gesamtzahl nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
425|- [x] `/simplify`: keine Änderungen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
426|- [x] Targeted: `npm test -- --run src/App.r45.test.tsx` → 1 R45-Test bestanden.
427|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx` → 41 UI-Tests bestanden.
428|- [x] Full tests: `npm test -- --run` → 25 Testfiles, 259 Tests bestanden.
429|- [x] Typecheck: `npm run typecheck` bestanden.
430|- [x] Lint: `npm run lint` bestanden.
431|- [x] Build: `npm run build` bestanden.
432|- [x] Codex Review: initialer Blocker war nur `src/App.r45.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Post-Action-Refresh, Header oder Dateigrößen.
433|- [x] Production URL returns HTTP 200 — R45 Deploy `dpl_5xjPg1m4bgFGxXHsB9nPEo9ybPS8`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
434|- [x] Game route loads without console errors — R45 Playwright-Smoke: `Schlangen gesamt: 0` initial, nach Klick `Schlangen gesamt: 1`, keine Console/Page/Request-Fehler.
435|
436|## Evidence — 01.06.2026 R46 Handkarten-Gesamtzahl
437|
438|- [x] Scope: Vorhandene Engine-State-Collection `zustand.spieler[*].hand.length` als Gesamtzählung sichtbar machen; keine neue Handkarten-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
439|- [x] RED: `npm test -- --run src/App.r46.test.tsx` schlug erwartungsgemäß fehl, weil `Handkarten gesamt:` noch nicht gerendert wurde.
440|- [x] GREEN: `src/App.tsx` rendert `Handkarten gesamt: X` direkt aus `zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)`.
441|- [x] Refresh: R46-Test klickt eine vorhandene Engine-Aktion und prüft, dass die Gesamtzahl nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
442|- [x] `/simplify`: keine Änderungen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
443|- [x] Targeted: `npm test -- --run src/App.r46.test.tsx` → 1 R46-Test bestanden.
444|- [x] UI targeted: `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx src/App.r45.test.tsx src/App.r46.test.tsx` → 43 UI-Tests bestanden.
445|- [x] Full tests: `npm test -- --run` → 26 Testfiles, 260 Tests bestanden.
446|- [x] Typecheck: `npm run typecheck` bestanden.
447|- [x] Lint: `npm run lint` bestanden.
448|- [x] Build: `npm run build` bestanden.
449|- [x] Codex Review: initialer Blocker war nur `src/App.r46.test.tsx` untracked; wird vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, Post-Action-Refresh, Header oder Dateigrößen.
450|- [x] Production URL returns HTTP 200 — R46 Deploy `8vz7AvEYp2b2H1krpWywbHok5sDt`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
451|- [x] Game route loads without console errors — R46 Playwright-Smoke: `Handkarten gesamt: 10` initial, nach Klick `Handkarten gesamt: 9`, keine Console/Page/Request-Fehler.
452|
453|
454|## Evidence — 01.06.2026 R47 Ablagestapel-Details leer sichtbar
455|
456|- [x] Scope: Vorhandene Engine-State-Collection `zustand.ablagestapel` immer als Detailzeile sichtbar machen; leer als `Ablagestapel: keine`, nicht leer weiterhin als Karten-IDs. Keine neue Ablage-, Turn-, Legalitäts-, Scoring- oder Engine-Logik in React.
457|- [x] RED: `npm test -- --run src/App.r47.test.tsx` schlug erwartungsgemäß fehl, weil `Ablagestapel: keine` bei leerem Stapel noch nicht gerendert wurde.
458|- [x] GREEN: `src/App.tsx` rendert `Ablagestapel: X` nun immer; `X` kommt direkt aus `zustand.ablagestapel` oder aus dem leeren Fallback `keine`.
459|- [x] Refresh: R47-Test klickt eine vorhandene Engine-Pflicht-Abwurf-Aktion und prüft, dass die Detailzeile nach dem aus `anwendeAktion(...)` abgeleiteten Engine-Folgezustand aktualisiert wird.
460|- [x] `/simplify`: Export-Kopplung aus `App.tsx` wurde wegen Lint (`react-refresh/only-export-components`) zurückgenommen; Header und engine-derived Post-Action-Erwartung blieben erhalten.
461|- [x] Targeted: `npm test -- --run src/App.r47.test.tsx` → 1 R47-Test bestanden.
462|- [x] Related targeted: `npm test -- --run src/App.r38.test.tsx src/App.r47.test.tsx` → 3 Tests bestanden.
463|- [x] Full tests: `npm test -- --run` → 27 Testfiles, 261 Tests bestanden.
464|- [x] Typecheck: `npm run typecheck` bestanden.
465|- [x] Lint: `npm run lint` bestanden.
466|- [x] Build: `npm run build` bestanden.
467|- [x] Codex Review: initialer Blocker war nur `src/App.r47.test.tsx` untracked; wurde vor Commit explizit gestaged und per Re-Review geprüft. Keine Blocker zu UI-Regellogik, R38-Textvertrag, Post-Action-Refresh, Header oder Dateigrößen.
468|- [x] Production URL returns HTTP 200 — R47 Deploy `dpl_2GqxjT8rvLpFz71o3LDoSxDtosRe`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
469|- [x] Game route loads without console errors — R47 Playwright-Smoke: `Ablagestapel: keine` initial und nach erstem Engine-Klick weiterhin sichtbar, keine Console/Page/Request-Fehler.
470|
471|
472|## Evidence — 01.06.2026 R48 UI-Übersichtsbereiche
473|
474|- [x] Scope: Bestehende Debug-/Engine-State-Anzeigen bleiben erhalten und werden nur in sichtbare semantische Bereiche gegliedert.
475|- [x] RED: `npm test -- --run src/App.r48.test.tsx` schlug zuerst fehl, weil `Spielstatus`-Region fehlte; zweiter RED schlug fehl, weil sichtbare Headings fehlten.
476|- [x] GREEN: `src/App.tsx` enthält weiterhin die äußere Region `Legale Aktionen` und darunter sichtbare `<h2>`-/`section`-Bereiche `Spielstatus`, `Aktiver Spieler`, `Spielerübersicht`, `Material und Aufgaben`, `Wertung`, `Aktionen`.
477|- [x] Debug-Hilfen bleiben erhalten: vorhandene Textverträge für Zugphase, Spieler, Schlangen, Hände, Stapel, Aufgaben, Wertung, Aktionen und Quelle wurden nicht entfernt.
478|- [x] `/simplify`: Button-Wrapper entfernt und React-Key für legale Aktionen stabilisiert; keine Verhaltensänderung.
479|- [x] Full Gates vor Commit: `npm test -- --run` → 28 Testfiles / 262 Tests grün; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check`.
480|- [x] Codex Review: BLOCKERS None. Staged Scope `src/App.tsx`, `src/App.r48.test.tsx`; keine entfernten UI-Textverträge, keine Gameplay-Änderung, neue Testdatei staged.
481|- [x] Production URL returns HTTP 200 — R48 Deploy `schlangentanz-v2-6834593gw-alfreds-projects-7e9df1b4.vercel.app`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200.
482|- [x] Game route loads without console errors — R48 Playwright-Smoke: alle sechs sichtbaren Bereiche/Headings vorhanden, bisherige Aktionsbuttons sichtbar, keine Console/Page/Request-Fehler.
483|
484|
485|## Evidence — 01.06.2026 R49 Offene Aufgaben-Details
486|
487|- [x] Scope: Vorhandene Engine-State-Felder `offeneAufgaben[*].name`, `punkte`, `bedingung` im Bereich `Material und Aufgaben` anzeigen; keine Engine-/Regellogik.
488|- [x] RED: `npm test -- --run src/App.r49.test.tsx` fehlte korrekt wegen fehlender Zeile `Offene Aufgaben-Details:`.
489|- [x] GREEN: `src/App.tsx` rendert `Offene Aufgaben-Details:` mit `Name (Punkte): Bedingung`; Leerfall bleibt `keine`.
490|- [x] Regression: R40-Test aktualisiert den neuen UI-Vertrag; Name/Punkte-Zeile bleibt unverändert.
491|- [x] Gates: R49/R40 targeted → 3 Tests; full → 29 Testfiles / 263 Tests; Typecheck, Lint, Build, `git diff --check` grün.
492|- [x] Review/Production: Codex BLOCKERS none; Deploy `schlangentanz-v2-4motjdic1-alfreds-projects-7e9df1b4.vercel.app`, Alias `https://schlangentanz-v2.vercel.app`, HTTP 200; Smoke: `Offene Aufgaben-Details` mit allen drei Bedingungen sichtbar, keine Console/Page/Request-Fehler.
493|
494|## Evidence — 02.06.2026 R53 manueller KI-Aktionsbutton
495|
496|- [x] Scope: Im KI-Zug wird ein manueller Button `KI-Aktion ausführen` an die erste vorhandene Engine-Aktion `legaleAktionen[0]` gebunden; keine KI-Strategie, kein Autoplay, keine Engine-Änderung.
497|- [x] RED: `npm test -- --run src/App.r53.test.tsx` fehlte korrekt wegen fehlendem KI-Aktionsbutton.
498|- [x] GREEN/Simplify: `src/App.tsx` nutzt weiter `ermittleLegaleAktionen` und `anwendeAktion`; `/simplify` meldete keine Änderungen.
499|- [x] Gates: targeted R53/App grün; full `npm test -- --run` → 33 Testfiles / 269 Tests; Typecheck, Lint, Build, `git diff --check` grün.
500|- [x] Codex Review: BLOCKERS none; Non-Blocker Mensch-Zug-Negativtest wurde ergänzt und erneut verifiziert.
501|


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
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
