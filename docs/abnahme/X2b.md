# Prüfprotokoll X2b – Aufgaben: Folgen und Muster (X2, Paket B)

| Feld | Wert |
|---|---|
| Task | X2 Die 15 Aufgaben mit Jokern, Paket B: Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger, Symmetriemeister |
| Branch | `task/X2b-aufgaben-muster`, PR #106 gegen `neuaufbau` |
| Geprüfter Stand | `e028a82c` (Basis `589e2a72`, `origin/neuaufbau` steht auf `4b449966`; die Commits dazwischen betreffen nur P0.5f, Teil D und Plan) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 23.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: 409 Dateien mit `w/crlf` nach dem Auschecken, alle getrackten Dateien gelöscht und neu geholt, danach 0. `core.hooksPath` zeigt `scripts/githooks`. `npm ci` Exit 0.

## Urteil: ABGENOMMEN

Alle fünf Kriterien des Pakets sind mit Tests, Gegenproben, einer unabhängigen Vollbelegung der Joker und Klicks am Entwicklertisch belegt, alle Gates enden mit 0, der erste Commit enthält nur Tests und ist rot. Offen bleibt eine Auslegungsfrage an den Autor zu „Farbvielfalt“ (Abschnitt „Auslegung Farbvielfalt“); sie ist kein Mangel der Umsetzung, sondern eine Lücke in Teil A/D. Antwortet der Autor anders, ändern sich `hatKette` in `farbvielfalt.ts` und zwei bis drei Tabellenzeilen.

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Plan) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | A9: Joker zählen bei jeder Aufgabe als die Farbe, mit der sie erfüllt ist; derselbe Joker darf bei zwei Aufgaben verschiedene Farben haben. | ja | `A9_aufgaben_joker_folgen.test.ts` › „A9/A7.3: mit der Regenbogenschlange an dieser Stelle sind beide erfüllt …“ und „A9/X1: legt Spieler 1 die Regenbogenschlange dorthin, löst er beide offenen Aufgaben mit derselben Karte ein“; Vollbelegung ohne Abweichung (TF-ENGINE-062) |
| 2 | Je Aufgabe eine Entscheidungstabelle mit mindestens sechs Stellungen als Tests: erfüllt, knapp nicht, mit Regenbogenschlange, mit Farbenfusion, mit Blockade dazwischen, über zwei Schlangen. | ja | fünf Dateien `A9_aufgabe_<name>.test.ts` mit 11 bis 16 Zeilen, je ein Test „die Tabelle … hat jede Pflichtstellung“ |
| 3 | Jedes Beispiel aus A9 ist ein Test. | ja | Zeilen „A9 Beispiel“ in Farbvielfalt, Farbwechsler, Schlangenbändiger, Symmetriemeister; „A7.3 Beispiel“ in Farbvielfalt; Vielfaltskönig hat in A9 kein Beispiel |
| 4 | Eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt. | ja | `A9_aufgaben_joker_folgen.test.ts` › „A11/A7.3: in der Wertung zählt die Regenbogenschlange als Grün … Farbvielfalt zählt trotzdem 9 Punkte“ und „A9/A7.5: unterbricht KI-Gegner 1 die Kette danach mit einer Schlangenblockade, bleibt Farbvielfalt bei Spieler 1“ |
| 6 | Farbwechsler: Reihen gleicher Farbe gelten als eine Farbe in der Folge. | ja | Tabellenzeilen „X2 Kriterium 6“ (erfüllt und knapp nicht); Gegenprobe 1; Szenario `aufgabe-farbwechsler` per Klick |

Kriterien 5 (Lila Riese) und 7 (Schlangentanz) gehören zu den Paketen A und C und sind hier nicht geprüft.

### 1. Joker in zwei Aufgaben

Die Stellung Rot, Gelb, Braun, Violett, Blau, ?, Blau, Grün, Rot, Blau, Grün ist so gebaut, dass Farbvielfalt an der Stelle ? Grün braucht (Kette Rot … Blau, Grün) und Schlangenbändiger Rot (Muster Rot, Blau, Grün zweimal). Mit jeder der sechs Farbkarten ist höchstens eine Aufgabe erfüllt, mit der Regenbogenschlange beide. Über den Rahmen (X1) löst das Legen der Regenbogenschlange beide offenen Aufgaben in einer Aktion ein, Ereignisse in dieser Reihenfolge. Die Umsetzung legt keine Farbe am Joker fest: `aufgabenGlieder` macht aus Regenbogenschlange und Farbenfusion das Glied `'Joker'`, jede Aufgabe deutet es für sich. Dass diese Deutung bei allen fünf Aufgaben der Vollbelegung entspricht, zeigt die Gegenprobe mit dem Brute-Force-Prüfer (unten).

### 2. Entscheidungstabellen

Gelesen und gegen Teil A/D nachgerechnet; jede Zeile nennt ihre Art, die Stellung und die Erwartung, die Meldung nennt Aufgabe, Stellung und Schlangen. Zeilen: Farbvielfalt 15, Vielfaltskönig 11, Farbwechsler 15, Schlangenbändiger 16, Symmetriemeister 15. Jede Tabelle enthält alle sechs Pflichtstellungen, geprüft mit `fehlendeStellungen` (leer). Bei „Blockade dazwischen“ steht je eine Zeile, in der die Blockade unterbricht, und eine, in der sie am Rand nicht stört; beim Symmetriemeister verhindert sie die Aufgabe in beiden Lagen (D39), beim Vielfaltskönig ist sie weder Farbe noch Störung.

### 3. Beispiele aus A9

A9-Beispiele sind Tabellenzeilen mit „A9 Beispiel“: Farbvielfalt (Blau, Rot, Gelb, Braun, Violett, Grün), Farbwechsler (Blau, Rot, Gelb, Grün, Blau), Schlangenbändiger (Rot, Blau, Grün, Rot, Blau, Grün), Symmetriemeister (Blau, Rot, Gelb, Grün, Grün, Gelb, Rot, Blau). Das Beispiel aus A7.3 (Blau, Rot, Gelb, Braun, Grün und die Regenbogenschlange als Violett) steht in der Farbvielfalt-Tabelle. Der Satz des A9-Beispiels „Eine Regenbogenschlange oder eine Farbenfusion in der Kette würde als die Farbe zählen, die dem Spieler noch fehlt“ ist mit je einer Zeile Regenbogenschlange und Farbenfusion belegt.

### 4. Erfüllt bleibt erfüllt

Farbvielfalt wird mit der Regenbogenschlange als Violett eingelöst; die Wertung zählt dieselbe Karte als Grün (Grün-Gruppe, 6 Punkte), die Aufgabe bringt trotzdem 9. Danach legt KI-Gegner 1 eine Blockade in die Kette: `istErfuellt` meldet `false`, die Aufgabe bleibt in `erfuellteAufgaben`, Endwertung `aufgabenPunkte` 9. Der Rahmen setzt eingelöste Aufgaben nie zurück (X1).

### 6. Farbwechsler und Reihen

`farbwechsler.ts` führt einen Zustandsautomaten: Ein Stand hält die Farben der letzten bis zu drei Reihen ohne Wiederholung. Zeilen „Blau-Blau, Rot, Gelb-Gelb-Gelb, Grün“ (erfüllt) und „Blau-Blau, Rot-Rot, Blau-Blau, Gelb“ (nicht erfüllt) belegen das Kriterium. Am Entwicklertisch ergab Blau, Blau, Rot, Gelb, Gelb plus Rot nichts, plus Grün am Anfang die Einlösung.

**Behauptung eines Review-Bots auf PR #106** („Blau, Rot, Gelb, Rot, Grün“ werde wegen `zuvor !== 0` in Zeile 38 fälschlich erfüllt): **trifft nicht zu.** Der Zweig `if (davor === farbe) return farbe + BASIS * laufend;` (Zeile 36) fängt das zweite Rot ab, bevor Zeile 38 erreicht wird; der Stand fällt auf (Gelb, Rot) zurück, und Grün ergibt nur drei verschiedene. Belege: (a) die Umsetzung und die Vollbelegung urteilen beide `false` (eigener Test „Farbwechsler: explizit Blau, Rot, Gelb, Rot, Grün“); (b) Vergleich auf **allen 6'725'600 Folgen der Längen 1 bis 8 über sechs Farben und die Regenbogenschlange**, also allen Folgen mit Wiederholungen: 0 Abweichungen, 18.7 s; (c) entfernt man genau diesen Zweig (Gegenprobe 1), wird die Tabellenzeile „vier Farben, aber Rot dazwischen wiederholt“ rot. Der Bot hat den Zweig übersehen.

## Auslegung Farbvielfalt

Kartentext: „Bilde eine Kette aus je einer Karte aller 6 Farben.“ Weder Teil A noch Teil D sagen, ob in der Kette eine Farbe doppelt liegen darf. D38 betrifft nur Vielfaltskönig und Farbenpracht. Hinweise im Wortlaut:

- A9-Beispiel: genau sechs Karten, jede Farbe einmal. Der Zusatz „Eine Regenbogenschlange … in der Kette würde als die Farbe zählen, die dem Spieler noch fehlt“ setzt voraus, dass die Kette ein Abschnitt der Schlange ist.
- A7.3-Beispiel: „hat bereits Blau, Rot, Gelb, Braun und Grün **in seiner Schlange**“, aufgezählt als Nachbarn.
- Farbwechsler sagt ausdrücklich „Es gelten auch Reihen“, Farbvielfalt sagt das nicht. Das spricht eher für (a), ist aber ein Schluss aus dem Schweigen.
- „je einer Karte“ lässt sich als „genau eine je Farbe“ (a) oder als „mindestens eine je Farbe“ (b) lesen.

Damit ist es eine Frage an den Autor (U2). Möglichkeiten mit Beispielen:

| Lesart | Regel | Blau, Rot, Gelb, Braun, Violett, Grün | Blau, Rot, **Rot**, Gelb, Braun, Violett, Grün | Blau, Rot, Gelb, **Rot**, Braun, Violett, Grün | Blau, Rot, Gelb, Blockade, Braun, Violett, Grün | Blau, Rot, Gelb in Schlange 1; Braun, Violett, Grün in Schlange 2 |
|---|---|---|---|---|---|---|
| (a) Umsetzung | sechs Karten direkt hintereinander, jede Farbe genau einmal | erfüllt | nicht erfüllt | nicht erfüllt | nicht erfüllt | nicht erfüllt |
| (b) | ununterbrochene Kette (ohne andere Sonderkarte), in der alle sechs Farben vorkommen; Wiederholungen erlaubt | erfüllt | erfüllt | erfüllt | nicht erfüllt | nicht erfüllt |
| (c) | wie Farbwechsler: Reihen zählen als eine Farbe, sechs aufeinanderfolgende Reihen paarweise verschieden | erfüllt | erfüllt | nicht erfüllt | nicht erfüllt | nicht erfüllt |
| (d) | alle sechs Farben irgendwo in einer Schlange, Blockaden egal | erfüllt | erfüllt | erfüllt | erfüllt | nicht erfüllt |

Vorschlag für die Frage an den Autor: „Farbvielfalt: Zählt Blau, Rot, Rot, Gelb, Braun, Violett, Grün (Rot doppelt in der Kette)? Und Blau, Rot, Gelb, Rot, Braun, Violett, Grün?“ Die beiden Antworten trennen (a), (b) und (c); (d) trennt die Blockade-Frage ab. Bis zur Antwort hält die Tabellenzeile „alle sechs Farben, aber Rot liegt doppelt mitten in der Kette“ Lesart (a) fest.

Die übrigen Auslegungen, die nicht wörtlich in Teil A/D stehen, sind gedeckt:

| Auslegung | Fundstelle |
|---|---|
| Farbenfusion zählt als eine Karte, auch bei „min. 8 Karten“ | A9 „Die Karten unter einer Farbenfusion zählen nicht einzeln“; A7.7 „zählt als eine einzelne Karte“; D41 für Gelber Schatz und Lila Riese |
| Blockade unterbricht Kette, Folge und Muster | A9 „Andere Sonderkarten, etwa die Schlangenblockade, unterbrechen Farbreihen“; D40 „direkt hintereinander“ |
| Blockade ist beim Vielfaltskönig keine Farbe, stört aber nicht | A9 „zählen nur, wenn eine Aufgabe ausdrücklich Sonderkarten verlangt“; der Kartentext verlangt keine Reihe |
| Symmetriemeister: ganze Schlange spiegelgleich, ungerade Länge mit Achse, Joker passend, andere Sonderkarte verhindert | Kartentext („eine Schlange …, bei der die erste Hälfte das Spiegelbild der zweiten ist“), D39 wörtlich |
| Muster: beliebige Folge mit mindestens drei Farben, zweimal direkt hintereinander | D40 wörtlich |
| Vielfaltskönig braucht zwei Schlangen | D38 wörtlich |
| Farbwechsler: Blau, Rot, Gelb, Rot, Grün nicht erfüllt | Kartentext „4 verschiedene Farben, die direkt aufeinander folgen“: keine vier aufeinanderfolgenden Reihen sind verschieden; „Es gelten auch Reihen“ erlaubt Reihen, keine Wiederholung. Ich halte das für wörtlich gedeckt; wer „vier verschiedene Farben in einem ununterbrochenen Abschnitt“ liest, käme zu „erfüllt“. Das ist eine schwächere Unklarheit als bei Farbvielfalt und kann in dieselbe Frage an den Autor |

## Gates

Jeder Befehl einzeln, Exit-Code mit `${PIPESTATUS[0]}` hinter `tee` in Git Bash, Logs unter `<scratchpad>/X2b-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 146 passed (146), Tests 2658 passed (2658) |
| `npm run typecheck` | 0 | `tsc -b` ohne Ausgabe |
| `npm run build` | 0 | built in 637ms |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | 402 Dateien geprüft; Ausnahmeliste verglichen mit Merge-Basis 589e2a7; keine Verstösse |
| `npx eslint .` | 0 | ohne Ausgabe |
| `python scripts/regelcheck.py` | 0 | 8 Warnungen, keine Fehler (BOM in alten Belegen, Länge `tests/layout/messung.ts`; alle vorbestehend) |
| `npm run test:layout` | 0 | 2200 passed (6.5m) |

Ports vor `test:layout`: `netstat -ano | grep -E ':417[34] ' | grep -E 'LISTENING|ABH'` ohne Ausgabe, beide frei; danach wieder frei.

Golden Master ohne Erweiterung: `src/engine/__tests__/golden/` ist im Diff nicht enthalten (`git diff --quiet origin/neuaufbau...HEAD -- src/engine/__tests__/golden` Exit 0), `golden_master.test.ts` 7 von 7 grün. SHA-256 der eingefrorenen Protokolle: `4d31b509…` (2 Spieler, Saat 5), `44b1cc48…` (3, Saat 3), `e32fbee6…` (4, Saat 2). Partien ohne Erweiterung verlaufen unverändert.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
50b65cf8 test: X2b Entscheidungstabellen für Folgen und Muster (rot)
e028a82c feat: X2b Aufgaben Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger, Symmetriemeister
```

`50b65cf8` enthält nur Testdateien: `aufgaben_folgen_hilfen.ts` (Testhilfe unter `__tests__`), die fünf Tabellen, `A9_aufgaben_joker_folgen.test.ts` und `szenarienAufgabenB.test.ts`. Ausgeführt auf diesem Stand: Exit 1, „Test Files 7 failed (7), Tests 53 failed | 50 passed (103)“. Rot sind alle Erwartungen „erfüllt“ (Platzhalter sind nie erfüllt, etwa „Vielfaltskönig.istErfuellt bei ‚vier Farben in jeder der beiden Schlangen‘“) und die Szenariotests („Unbekanntes Szenario ‚aufgabe-farbvielfalt‘“), also fehlendes Verhalten. Grün sind die Erwartungen „nicht erfüllt“, wie bei Platzhaltern zu erwarten.

Spätere Änderung an Tests (`git diff 50b65cf8 HEAD`): Der Laufzeittest misst statt der langsamsten von 50 den Median von 51 Prüfungen und nennt die langsamste in der Meldung. Das ist schwächer, aber begründet (eine einzelne Messung lag unter Parallellast bei 13.9 ms); meine eigene Messung bestätigt Mittelwerte von 0.002 bis 0.014 ms. Sonst nur Umbenennung `langsamstePruefung` → `messePruefung`, `FARBEN` statt Liste, `'weitere'` aus dem Typ entfernt. Keine Tabellenzeile wurde geändert.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
 src/engine/__tests__/aufgaben_folgen_hilfen.ts     |  71 ++++
 .../regeln/A9_aufgabe_farbvielfalt.test.ts         |  38 +++
 .../regeln/A9_aufgabe_farbwechsler.test.ts         |  38 +++
 .../regeln/A9_aufgabe_schlangenbaendiger.test.ts   |  39 +++
 .../regeln/A9_aufgabe_symmetriemeister.test.ts     |  39 +++
 .../regeln/A9_aufgabe_vielfaltskoenig.test.ts      |  34 ++
 .../regeln/A9_aufgaben_joker_folgen.test.ts        | 122 ++++++
 src/engine/aufgaben/farbvielfalt.ts                |  32 +-
 src/engine/aufgaben/farbwechsler.ts                |  66 +++-
 src/engine/aufgaben/schlangenbaendiger.ts          |  52 ++-
 src/engine/aufgaben/symmetriemeister.ts            |  34 +-
 src/engine/aufgaben/vielfaltskoenig.ts             |  34 +-
 src/engine/jokerGruppen.ts                         |  34 ++
 src/entwicklung/szenarien.ts                       |   2 +
 src/entwicklung/szenarienAufgabenB.test.ts         | 100 +++++
 src/entwicklung/szenarienAufgabenB.ts              |  76 ++++
 src/ki/strategien/solideKi_zugende.test.ts         |   7 +-
 17 files changed, 802 insertions(+), 16 deletions(-)
```

| Datei | im Feld | Urteil |
|---|---|---|
| `src/engine/aufgaben/{farbvielfalt,vielfaltskoenig,farbwechsler,schlangenbaendiger,symmetriemeister}.ts` | ja | die fünf Aufgaben des Pakets |
| `src/engine/jokerGruppen.ts` | ja (gemeinsame Helfer) | nur am Ende angefügt: ein Hunk `@@ -290,3 +290,37 @@`, 34 Zeilen nur `+`, keine bestehende Zeile geändert. Neu: `AufgabenGlied`, `ReihenGlied`, `aufgabenGlieder`, `aufgabenStrecken`, `irgendeineStrecke`; `istJoker` wird nur benutzt |
| sieben Testdateien unter `src/engine/__tests__/` | Tests | gehören zum Task |
| `src/entwicklung/szenarienAufgabenB.ts`, `.test.ts`, `szenarien.ts` (2 Zeilen) | nein | Szenarien verlangt der Auftrag („je ein Szenario am Entwicklertisch“); PR begründet, trägt |
| `src/ki/strategien/solideKi_zugende.test.ts` | nein | siehe unten; Begründung im PR trägt |

**K2-Test.** Der Test „K2.1, Prüfprotokoll Iteration 2, Saat 7154“ baut eine Stellung mit `erweiterung: true`, in der Schlange 2 von Spieler 1 (Violett, Violett, Violett, Regenbogenschlange, Gelb, Gelb, Grün, Grün) schon die offene Aufgabe Farbwechsler erfüllt (Reihen Violett, Joker, Gelb, Grün), aber noch nicht eingelöst ist, weil der Baukasten keinen Zugbeginn durchläuft. Seit X2b löst die nächste aufgelöste Aktion sie ein, deshalb wäre die Differenz der Endsummen 1 + 6 = 7 statt 1. Der Test vergleicht jetzt `summe - aufgabenPunkte`. Die Aussage des Tests bleibt erhalten: Seine Meldung lautet „A11: Gelb×4 statt Gelb×3, ein Punkt“, gemeint ist der Gruppenpunkt; die Prüfung „Halten und Spielen sind gleich bewertet“ und die KI-Wahl (Schlangenfrass auf die Blockade) sind unverändert und grün. Der breite Test K2.1 über 26 Partien rechnet weiter mit `endpunkte` samt Aufgaben und ist grün. Geschwächt ist nur, dass dieser eine Test eine Verschiebung von Aufgabenpunkten durch den Schlangenfrass nicht mehr sehen würde; das war nie seine Aussage.

U10: `package.json` unverändert. U13: keine der geschützten Dateien im Diff. U9: keine Dateiköpfe mit Autor oder Datum, keine `// ÄNDERUNG`-Kommentare; Kommentare zitieren die Regel und nennen die Fundstelle. U11: nichts aus Altprojekten erkennbar (die alte `aufgabenPruefung.ts` arbeitete mit Fenstern über Einzelkarten, die neue Umsetzung nicht). U2: siehe „Auslegung Farbvielfalt“.

## Gegenprobe

1. `src/engine/aufgaben/farbwechsler.ts`, Zeile 36: `if (davor === farbe) return farbe + BASIS * laufend;` entfernt. `npx vitest run src/engine/__tests__/regeln/A9_aufgabe_farbwechsler.test.ts`: Exit 1, 3 rot („vier Farben, aber Rot dazwischen wiederholt“, „X2 Kriterium 6: zwei blaue Reihen sind keine zwei Farben“, „eine Regenbogenschlange zwischen zwei blauen Karten“).
2. `symmetriemeister.ts`, Zeile 20: `|| glieder.includes('Sonderkarte')` entfernt; `vielfaltskoenig.ts`, Zeile 30: `schlangen.length >= MAX_SCHLANGEN_PRO_SPIELER` → `>= 1`. Beide Tabellen ausgeführt: Exit 1, rot „D39: eine Schlangenblockade als Achse verhindert die Aufgabe“ und „D38: eine Schlange mit sechs Farben genügt nicht“.

Danach `git checkout --` auf die drei Dateien, `git status` leer.

**Unabhängige Vollbelegung (Brute Force).** Ein temporäres Prüfskript (nicht committet, als Beleg bei TF-ENGINE-062) belegt jeden Joker der Reihe nach mit allen sechs Farben und prüft die Aufgabe mit einer eigenen, einfachen Definition: Farbwechsler über Reihen, Farbvielfalt über Sechserfenster ohne Wiederholung (Lesart a), Schlangenbändiger über alle Musterlängen ab 3, Symmetriemeister als Palindrom ohne andere Sonderkarte, Vielfaltskönig mit zwei Schlangen. Die Umsetzung wird über das Register mit einem minimalen Zustand gerufen.

| Vergleich | Stellungen | Abweichungen |
|---|---|---|
| Farbwechsler, alle Folgen Länge 1 bis 8 aus sechs Farben und Regenbogenschlange | 6'725'600 | 0 |
| Farbvielfalt, alle Folgen Länge 1 bis 7 | 960'799 | 0 |
| Schlangenbändiger, alle Folgen Länge 1 bis 7 | 960'799 | 0 |
| Symmetriemeister, alle Folgen Länge 7 bis 9 aus vier Farben, Regenbogenschlange und Blockade | 12'037'248 | 0 |
| je Aufgabe 20'000 Zufallsstellungen, 1 oder 2 Schlangen bis 20 Karten, bis 4 Joker (Regenbogenschlange und Farbenfusion), Blockaden | 5 × 20'000 | 0 |

Laufzeit bei 20 Karten mit 4 Jokern (500 Zufallsschlangen je Aufgabe, eigene Messung): Umsetzung im Mittel 0.002 ms (Symmetriemeister) bis 0.014 ms (Farbvielfalt), langsamste Einzelmessung 3.1 ms beim ersten Aufruf von Farbvielfalt (Aufwärmen); die Vollbelegung braucht im Mittel bis 0.97 ms. Die Laufzeit ist unkritisch.

## Browserprüfung

Testhook-Build (`npm run build:testhooks`) mit `vite preview --outDir dist-testhooks --port 4297 --strictPort` aus meinem Worktree (kein `launch.json`). Klicks im eingebauten Browser der Desktop-App (1024×768), Fotos mit Playwright Chromium 1.60.0 bei 1280×900 und denselben Klicks.

**Die fünf Szenarien, je erst die falsche, dann nach „Schritt zurück“ die richtige Karte** (abgelesen mit `get_page_text`):

| Szenario | falsche Karte → Ergebnis | richtige Karte → Ergebnis |
|---|---|---|
| `aufgabe-farbvielfalt` (Blau, Rot, Gelb, Braun, Grün) | Blau ans Ende → nur KarteGespielt, Erfüllte Aufgaben: keine | Regenbogenschlange an Stelle 2 (zwischen Rot und Gelb, nicht ans Ende wie im Text) → AufgabeErfuellt Farbvielfalt (aufgabe-04), AufgabeAufgedeckt Gelber Schatz; Erfüllte Aufgaben: Farbvielfalt (9); Stapel 10 → 9; Endwertung Aufg. 9 |
| `aufgabe-vielfaltskoenig` | Violett ans Ende von schlange-2 → nichts; Endwertung Gruppen 6 (Violett, Fusion aus Rot, Rot als Violett, Violett: 2 + 2 + 2 nach D30) | Gelb an den Anfang von schlange-2 → AufgabeErfuellt Vielfaltskönig (9) |
| `aufgabe-farbwechsler` (Blau, Blau, Rot, Gelb, Gelb) | Rot ans Ende → nichts (Reihen Blau, Rot, Gelb, Rot) | Grün an den Anfang → AufgabeErfuellt Farbwechsler (6) |
| `aufgabe-schlangenbaendiger` (Rot, Blau, Grün, Rot, Blau) | Rot ans Ende → nichts | Grün an den Anfang (Grün, Rot, Blau zweimal) → AufgabeErfuellt Schlangenbändiger (7) |
| `aufgabe-symmetriemeister` (7 Karten) | Blau an den Anfang → nichts | Blau ans Ende → AufgabeErfuellt Symmetriemeister (10); Endwertung Aufg. 10 |

Invarianten jedes Mal „alle erfüllt“, `read_console_messages` ohne Fehler, `scrollWidth` 1009 = `clientWidth` 1009.

### Desktop 1280×900 – `bilder/X2b-aufgabe-farbvielfalt-desktop.png`

Oben „Ereignisse des letzten Schritts (3)“: KarteGespielt regenbogenschlange-01 → schlange-1, Stelle 2; „AufgabeErfuellt: Spieler 1 (spieler-1) nimmt Farbvielfalt (aufgabe-04)“; „AufgabeAufgedeckt: Gelber Schatz (aufgabe-14) an Stelle von Farbvielfalt“. Darunter „Invarianten (alle erfüllt)“ mit elf grünen Zeilen, „Lage“ (mit Erweiterung, Laufend, gespielt 0 Farbkarten, 1 Sonderkarte), unten Spieler 1 mit Hand (4) und Schlange 1: Wasserwirbel (Blau), Feuerkeim (Rot), kursiv „Regenbogenschlange“, Sonnenblatt (Gelb) … Die Werte passen zur Erwartung. Nichts abgeschnitten oder überdeckt.

### Desktop 1280×900 – `bilder/X2b-aufgabe-vielfaltskoenig-desktop.png`, `-farbwechsler-`, `-schlangenbaendiger-`, `-symmetriemeister-`

Gleicher Aufbau. Vielfaltskönig: KarteGespielt gelb-02 → schlange-2, Stelle 0; AufgabeErfuellt Vielfaltskönig (aufgabe-05); Schlange 1 Blau, Rot, Gelb, Grün sichtbar. Farbwechsler: gruen-01 → schlange-1, Stelle 0; AufgabeErfuellt Farbwechsler (aufgabe-06); Schlange 1 beginnt mit Waldspross (Grün), dann Blau, Blau, Rot, Gelb. Schlangenbändiger: gruen-02, Stelle 0; AufgabeErfuellt Schlangenbändiger (aufgabe-11); Schlange Grün, Rot, Blau, Grün, Rot, Blau in zwei Zeilen zu je drei Karten, was das Muster gut sichtbar macht. Symmetriemeister: blau-02, Stelle 7; AufgabeErfuellt Symmetriemeister (aufgabe-13); die Schlange beginnt mit Blau, Rot, Gelb, Grün, Grün. In allen vier: Invarianten alle erfüllt, die Gelber-Schatz-Zeile ersetzt die eingelöste Aufgabe, keine Überdeckung, kein abgeschnittener Text.

### Zufallspartie mit Erweiterung bis zum Ende – `bilder/X2b-zufallspartie-4714-einloesen-desktop.png`, `bilder/X2b-zufallspartie-4714-ende-desktop.png`

Playwright klickt `/dev?seed=<saat>&spieler=<n>&erweiterung=1` bis Partiephase „Beendet“: entscheidet eine KI, „KI-Schritt (solide)“; entscheidet Spieler 1, ein Aktionsknopf nach einem Zufallszähler (85 % ohne „ZugBeenden“). Nach jedem Klick geprüft: keine Invariante mit `data-verletzt="ja"`.

| Saat, Spieler | Schritte | eingelöst (offen) | Ende |
|---|---|---|---|
| 4711, 2 | 189 | keine; Farbwechsler geheim bei Spieler 1 (6) | Beendet, 0 verletzt, 0 Konsolenfehler |
| 4712, 3 | 186 | keine | Beendet, 0, 0 |
| 4713, 4 | 180 | keine (KI-Gegner 2 hat 6 Aufgabenpunkte geheim) | Beendet, 0, 0 |
| 4714, 2 | 194 | Vielfaltskönig (Schritt 46) und Schlangenbändiger (87), KI-Gegner 1 | Beendet, 0, 0 |
| 4715, 2 | 185 | Farbwechsler (30), Spieler 1 | Beendet, 0, 0 |
| 4716, 2 | 193 | Farbwechsler (50), KI-Gegner 1; dazu Farbvielfalt geheim | Beendet, 0, 0 |
| 4717, 2 | 191 | Vielfaltskönig (67), KI-Gegner 1 | Beendet, 0, 0 |
| 4718, 2 | 186 | Farbwechsler (52), Spieler 1; Vielfaltskönig geheim | Beendet, 0, 0 |

Aufgaben aus Paket B werden in echten Partien eingelöst, offen und geheim, ohne Invariantenverletzung. Erstes Foto (Schritt 46, Saat 4714): Kopf „Partie aus Saat 4714, 2 Spieler, mit Erweiterung“, „KI-Gegner 1 entscheidet; das ist eine KI.“, 14 Aktionen, Ereignisse KartenGezogen (Spieler 1 zieht 2), ZugBegonnen KI-Gegner 1, „AufgabeErfuellt: KI-Gegner 1 (spieler-2) nimmt Vielfaltskönig (aufgabe-05)“, „AufgabeAufgedeckt: Schlangenbändiger (aufgabe-11) an Stelle von Vielfaltskönig“. Die Einlösung am Zugbeginn ist richtig (X1). Zweites Foto (Ende): offene Aufgaben Farbkombination, Farbharmonie, Gelber Schatz; Endwertung KI-Gegner 1 Gruppen 74, Vielfalt 4, Kette 5, Aufg. 16, Summe 99, nachgerechnet 74 + 4 + 5 + 16 = 99 und 16 = 9 + 7; Aufschlüsselung „Aufgaben: Vielfaltskönig 9, Schlangenbändiger 7“. Spieler 1 hat 0 Punkte (der Zufallsklicker baut keine Gruppen), plausibel. Tabellen und Texte vollständig lesbar, `scrollWidth` 1280 = `clientWidth` 1280.

Waagrechtes Scrollen: keines (1009/1009 im eingebauten Browser, 1280/1280 in Playwright). Andere Geräteklassen entfallen, weil X2b keine Oberfläche ändert; `test:layout` lief in allen fünf Klassen grün.

Server danach beendet: PID 60856, Befehlszeile `node node_modules/vite/bin/vite.js preview --outDir dist-testhooks --port 4297 --strictPort` (aus meinem Worktree gestartet), über die Hintergrundaufgabe beendet, danach lauscht nichts mehr auf 4297; 4173/4174 frei. Mein Browser-Tab ist geschlossen.

## Satz-für-Satz-Abdeckung

| Spec-Abschnitt | Regelaussage | Test (Datei › Name) |
|---|---|---|
| A9 Nr. 4 | „Bilde eine Kette aus je einer Karte aller 6 Farben.“ | `A9_aufgabe_farbvielfalt.test.ts` › erfüllt: A9 Beispiel; mitten in einer längeren Schlange; knapp nicht: sechste Karte wiederholt Blau; Rot doppelt; nur fünf Karten (Auslegung siehe oben) |
| A9 Bsp. Farbvielfalt | Blau, Rot, Gelb, Braun, Violett, Grün erfüllt | › „A9 Beispiel: Blau, Rot, Gelb, Braun, Violett, Grün“ |
| A9 Bsp. Farbvielfalt | Regenbogenschlange oder Farbenfusion in der Kette zählt als die fehlende Farbe | › „zwei Regenbogenschlangen füllen zwei fehlende Farben“; „die Farbenfusion aus zwei gelben Karten zählt als das fehlende Gelb“ |
| A7.3 Bsp. 2 | Blau, Rot, Gelb, Braun, Grün und Regenbogenschlange als Violett erfüllt Farbvielfalt | › „A7.3 Beispiel: … die Regenbogenschlange als Violett“; Szenario `aufgabe-farbvielfalt` |
| A9 Nr. 5 | „Habe in jeder deiner Schlangen min. 4 versch. Farben.“ | `A9_aufgabe_vielfaltskoenig.test.ts` › „vier Farben in jeder der beiden Schlangen“; „die zweite Schlange hat nur drei Farben“; „Farben dürfen sich wiederholen …“ |
| D38 | Vielfaltskönig braucht zwei Schlangen mit je mindestens vier Farben | › „D38: eine Schlange mit sechs Farben genügt nicht“; „sechs Farben über beide Schlangen verteilt, aber die erste hat nur zwei“ |
| A9 Nr. 6 | „mindestens 4 verschiedene Farben, die direkt aufeinander folgen“ | `A9_aufgabe_farbwechsler.test.ts` › „nur drei Farben nacheinander“; „sechs Farben nacheinander“; „vier Farben, aber Rot dazwischen wiederholt“ |
| A9 Nr. 6 | „Es müssen nicht einzelne Farben aufeinander folgen. Es gelten auch Reihen.“ | › „X2 Kriterium 6: Reihen gelten als eine Farbe …“; „X2 Kriterium 6: zwei blaue Reihen sind keine zwei Farben …“ |
| A9 Bsp. Farbwechsler | Blau, Rot, Gelb, Grün, Blau erfüllt | › „A9 Beispiel: Blau, Rot, Gelb, Grün, Blau“ |
| A9 Nr. 11 | „ein sich wiederholendes Muster aus min. 3 versch. Farben“ | `A9_aufgabe_schlangenbaendiger.test.ts` › „ein Muster aus nur zwei Farben, Rot, Blau, dreimal“; „ein Muster aus vier Farben mitten in der Schlange“; „die Wiederholung bricht nach zwei Karten ab“ |
| D40 | mindestens zweimal direkt hintereinander, beliebige Folge, auch AABCAABC | › „D40: AABCAABC …“; „D40: die Wiederholung ist durch Gelb getrennt“ |
| A9 Bsp. Schlangenbändiger | Rot, Blau, Grün, Rot, Blau, Grün erfüllt | › „A9 Beispiel: Rot, Blau, Grün, Rot, Blau, Grün“ |
| A9 Nr. 13 | „eine Schlange mit min. 8 Karten“ | `A9_aufgabe_symmetriemeister.test.ts` › „sieben Karten, spiegelgleich, aber weniger als 8“; A9 Beispiel mit 8 |
| A9 Nr. 13 | „die erste Hälfte das Spiegelbild der zweiten“ | › „die letzten beiden Karten sind vertauscht“; „die zweite Hälfte wiederholt die erste, statt sie zu spiegeln“; „zehn Karten mit Reihen“ |
| D39 | ungerade Kartenzahl erlaubt, Mitte ist Achse | › „D39: neun Karten, Violett ist die Achse“; „D39: die Regenbogenschlange als Achse“ |
| D39 | Joker zählen als die passende Farbe | › „die Regenbogenschlange zählt als das gespiegelte Grün“; „die Farbenfusion … zählt als das gespiegelte Gelb“; „die Regenbogenschlange hilft nicht, wenn zwei Farbkarten nicht passen“ |
| D39 | eine andere Sonderkarte in der Schlange verhindert die Aufgabe | › „D39: eine Schlangenblockade als Achse …“; „D39: auch eine Schlangenblockade am Anfang …“; Gegenprobe 2 |
| A9 Bsp. Symmetriemeister | Blau, Rot, Gelb, Grün, Grün, Gelb, Rot, Blau erfüllt | › „A9 Beispiel: …“ |
| A9 „Wichtig für Sonderkarten“, Satz 1 | Regenbogenschlange und Farbenfusion zählen als Karte der Farbe, mit der die Aufgabe erfüllt ist | Zeilen „Regenbogenschlange“ und „Farbenfusion“ aller fünf Tabellen; Vollbelegung TF-ENGINE-062 |
| A9, Satz 2 | Die Farbe ist nicht festgelegt; bei anderer Aufgabe und bei der Wertung darf sie anders zählen | `A9_aufgaben_joker_folgen.test.ts` › „… beide erfüllt: für Farbvielfalt als Grün, für Schlangenbändiger als Rot“; „A11/A7.3: in der Wertung zählt die Regenbogenschlange als Grün …“ |
| A9, Satz 3 | Die Karten unter einer Farbenfusion zählen nicht einzeln | „die Farbenfusion ist eine Karte …“ in Farbvielfalt, Farbwechsler, Schlangenbändiger, Symmetriemeister; Vielfaltskönig „die gelben Karten unter der Farbenfusion zählen nicht“ |
| A9, Satz 4 | Andere Sonderkarten unterbrechen Farbreihen und zählen nur, wenn verlangt | Zeilen „Blockade dazwischen“ aller fünf Tabellen; Vielfaltskönig „eine Schlangenblockade ist keine vierte Farbe“ |
| A7.3 | „Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist. Eine erfüllte Aufgabe bleibt erfüllt, auch wenn die Karte später anders zählt“ | `A9_aufgaben_joker_folgen.test.ts` › Kriterium-4-Tests |
| A7.3 | „Unterbricht keine Farbreihen, wenn sie als passende Farbe genutzt wird“ | Farbwechsler › „die Regenbogenschlange in einer Reihe verlängert sie“ |
| A7.7 | Farbenfusion zählt als eine Karte beliebiger Farbe; ursprüngliche Farben spielen für Aufgaben keine Rolle | Farbvielfalt › „die Farbenfusion aus zwei blauen Karten zählt als Grün; die Farbe darunter spielt keine Rolle“; Farbwechsler › „Fusion aus zwei blauen Karten zählt als Gelb“ |
| A7.7 | Die Farbe der Fusion ist nie festgelegt; bei jeder Aufgabe die Farbe, mit der sie erfüllt ist | Fusionszeilen mit jeweils anderer Farbe in verschiedenen Tabellen; dieselbe Fusion in zwei Aufgaben gleichzeitig nur in der Vollbelegung (Hinweis 2) |
| A7.5 | Die Blockade bleibt, bis sie entfernt wird; sie unterbricht | Kriterium-4-Test mit KI-Gegner 1, der eine Blockade in die Kette legt |
| A11 Nr. 4 | Punkte erfüllter Aufgaben zählen in der Endwertung | Kriterium-4-Test (`aufgabenPunkte` 9); Szenarien (Endwertung Aufg. 9, 9, 6, 7, 10 per Klick) |

C10 (für diese fünf Aufgaben), C21 und C23 sind damit belegt behoben; streichen darf sie nach U13 der Orchestrator, C10 erst nach allen drei Paketen.

## Eigene Grenzfälle

1. **Spieler ohne Schlange (leere Menge).** Warum: Die Tabellen haben immer mindestens eine Schlange. Temporärer Test G1: `tisch(true, [[]])`, alle fünf `istErfuellt` → `[false, false, false, false, false]`. Bestanden.
2. **Vielfaltskönig mit genau drei Farbkarten, Blockade und Regenbogenschlange.** Warum: Joker zählt als vierte Farbe, Blockade darf weder zählen noch stören. Blau, Rot, Blockade, Gelb, Regenbogenschlange mit Braun, Violett, Grün, Grün, Braun → false; mit Braun, Violett, Grün, Blau → true. Bestanden.
3. **Erfüllt, aber nicht eingelöst (Invariante des Rahmens mit echten Bedingungen).** 300 Zufallspartien mit Erweiterung (Saaten 7001 bis 7300, 2 bis 4 Spieler): Bei jedem `AufgabeErfuellt` ist die Bedingung im Zustand danach wahr; nach jeder aufgelösten Aktion liegt keine der fünf Aufgaben offen, die für den Spieler am Zug erfüllt ist. Alle 300 beendet; eingelöst Farbvielfalt 78, Farbwechsler 75, Vielfaltskönig 66, Schlangenbändiger 47, Symmetriemeister 3, liegen geblieben keine.
4. **Alle Folgen mit Wiederholungen beim Farbwechsler** (Auftrag des Orchestrators zur Bot-Behauptung): siehe Abschnitt 6, 0 Abweichungen auf 6'725'600 Folgen.

## Testregister

Bereiche bestehend: ENGINE (`src/engine/**`), DEV (`src/entwicklung/**`), KI (`src/ki/**`); jede geänderte Datei fällt in einen davon, kein neues Muster nötig. Kein Tagebucheintrag zu X2b vorhanden, deshalb ohne `--eintrag`.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-ENGINE-061 | Entscheidungstabellen, Joker in zwei Aufgaben, erfüllt bleibt erfüllt, Gegenproben (automatisch, Regression) | `2026-11-23-0858-TF-ENGINE-061` | bestanden |
| TF-ENGINE-062 | Vollbelegung aller Jokerbelegungen und 300 Zufallspartien | `2026-11-23-0858-TF-ENGINE-062` | bestanden |
| TF-ENGINE-063 | Grenzfall: ohne Schlange; Vielfaltskönig mit Blockade und Joker | `2026-11-23-0858-TF-ENGINE-063` | bestanden |
| TF-DEV-043 | fünf Szenarien am Entwicklertisch, falsche und richtige Karte | `2026-11-23-0858-TF-DEV-043` | bestanden |
| TF-DEV-044 | Zufallspartien mit Erweiterung bis zum Ende am Entwicklertisch | `2026-11-23-0858-TF-DEV-044` | bestanden |

Die neuen Testfälle liefen vor dem ersten Lauf durch `pruefe_muster.py` (Exit 0, keine Befunde) und den Humanizer; `python scripts/tagebuch_bauen.py` Exit 0.

## Hinweise (kein Mangel)

1. **Frage an den Autor zu Farbvielfalt** (Abschnitt „Auslegung Farbvielfalt“), am besten zusammen mit der schwächeren Frage zu Farbwechsler (Blau, Rot, Gelb, Rot, Grün). Bis zur Antwort gilt Lesart (a).
2. Der Test zu Kriterium 1 („derselbe Joker in zwei Aufgaben“) nutzt nur die Regenbogenschlange. Für die Farbenfusion steht dasselbe nur über die Vollbelegung (Zufallsstellungen mit Fusion) und Fusionszeilen mit jeweils anderer Farbe in verschiedenen Tabellen fest. Die Umsetzung behandelt beide gleich (`istJoker`), eine Lücke ist also nicht zu erwarten.
3. Formatierung in `src/engine/aufgaben/vielfaltskoenig.ts`, Zeile 30: `&&schlangen` ohne Leerzeichen. ESLint meldet nichts; rein kosmetisch.
4. Die Pakete A und C hängen ihre Helfer voraussichtlich ebenfalls ans Ende von `jokerGruppen.ts`; beim Merge entsteht dort ein Textkonflikt am Dateiende, der sich durch Hintereinanderstellen lösen lässt.
5. Teil B von `docs/GAME_SPEC.md` (auf `neuaufbau`) sagt „die 15 Bedingungen sind noch Platzhalter“. Nach den drei Paketen muss der Orchestrator den Satz nachziehen (U13).
6. Der Laufzeittest misst seit dem zweiten Commit den Median statt des Maximums; das ist begründet und bleibt mit 5 ms Grenze weit über den gemessenen 0.002 bis 0.014 ms.
7. In den acht Zufallspartien am Entwicklertisch wurden Farbvielfalt und Symmetriemeister nicht als offene Aufgabe eingelöst (Farbvielfalt einmal geheim). Dass beide in Partien vorkommen, zeigen die 300 Partien des Grenzfalls 3 (78 und 3 Mal).
