# Prüfprotokoll X2a – Aufgaben: Farbmengen und Gruppen (X2 Paket A)

| Feld | Wert |
|---|---|
| Task | X2a, X2 Paket A „Aufgaben: Farbmengen und Gruppen“ (Farbenpracht, Farbharmonie, Farbkombination, Gelber Schatz, Lila Riese) |
| Branch | `task/X2a-aufgaben-farbmengen`, PR #107 gegen `neuaufbau` |
| Geprüfter Stand | `e0e8098` (Basis `589e2a7`, `origin/neuaufbau` steht auf `4b44996`; `git merge-tree` gegen `origin/neuaufbau` ohne Konflikt) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 23.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: 409 Dateien mit `w/crlf` nach dem Auschecken (globales `core.autocrlf=true`), alle getrackten Dateien gelöscht und neu geholt, danach 0. `core.hooksPath` zeigt `scripts/githooks`. `npm ci` Exit 0.

## Urteil: ABGENOMMEN

Alle fünf Kriterien sind für die fünf Aufgaben mit Regeltests, zwei Gegenproben, einer unabhängigen Gegenprobe mit vollständiger Jokersuche und Klicks am Entwicklertisch belegt. Alle Gates einschliesslich `test:layout` und Dauerlauf enden mit 0, der erste Commit enthält nur Tests und ist rot, Partien ohne Erweiterung bleiben unverändert. Drei Auslegungen sind von Teil A/D nicht wörtlich gedeckt; sie stehen unten mit Möglichkeiten und Beispielen als Fragen an den Autor, nicht als Mangel.

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Plan) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | A9: Joker zählen bei jeder Aufgabe als die Farbe, mit der sie erfüllt ist; derselbe Joker darf bei zwei Aufgaben verschiedene Farben haben. | ja | `A9_aufgaben_reihen.test.ts` „A9/A7.3/D8: … Regenbogenschlange für Gelber Schatz als Gelb und für Lila Riese als Violett“ und dasselbe mit Fusion; `A9_aufgaben_joker_farbmengen.test.ts` „… löst in einer Aktion Gelber Schatz (als Gelb) und Lila Riese (als Violett) ein“; Szenario `aufgabe-joker-zwei-farben` per Klick; Jokersuche ohne Abweichung |
| 2 | Je Aufgabe eine Entscheidungstabelle mit mindestens sechs Stellungen als Tests: erfüllt, knapp nicht, mit Regenbogenschlange, mit Farbenfusion, mit Blockade dazwischen, über zwei Schlangen. | ja | Tabellen mit 11 (Farbenpracht), 13 (Farbharmonie), 12 (Farbkombination), 12 (Gelber Schatz), 12 (Lila Riese) Zeilen, jede Pflichtspalte vorhanden, dazu je „Schlange des Gegners zählt nicht“ |
| 3 | Jedes Beispiel aus A9 ist ein Test. | ja | „A9 Beispiel Farbharmonie …“, „A9 Beispiel Farbkombination …“, „A9 Beispiel (Allgemein): eine Vierergruppe … die fünfte blaue Karte schon“ und im Zugablauf „A9 Beispiel: Spieler 1 hat eine Vierergruppe … obwohl KI-Gegner 1 mit vier roten Karten kurz davor war“ |
| 4 | Eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt. | ja | „A9/A7.3/A11: Gelber Schatz, erfüllt mit der Regenbogenschlange als Gelb, zählt in der Wertung, obwohl sie dort als Violett zählt“; „A9: legt KI-Gegner 1 danach eine Blockade …“; „A9/D35: die geheime Aufgabe Lila Riese …“; im Browser Aufschlüsselung „Regenbogenschlange als Violett … Aufgaben: Gelber Schatz 5“; Zufallspartie Saat 11 |
| 5 | Lila Riese: Reihe aus mindestens 5 violetten Karten (Tests mit 4 und 5). | ja | „A9/D3 (C14): vier violette Karten in einer Reihe erfüllen nicht, fünf erfüllen“; Gegenprobe 1 (Grenze 4) macht fünf Tests rot; Szenario `aufgabe-lila-riese` per Klick (Blau: nichts, Violett: Lila Riese) |

### 1. Joker zählen je Aufgabe als passende Farbe

Die Umsetzung zählt eine Regenbogenschlange und eine Farbenfusion als eine Karte (`istJoker`), die Karten unter einer Fusion stehen nicht in `schlange.karten` und zählen deshalb nicht. Jede Aufgabe entscheidet für sich: Farbenpracht und Farbkombination füllen mit den Jokern fehlende Karten auf (`farbbestand`), Gelber Schatz und Lila Riese zählen Joker in einer Reihe als ihre Farbe (`laengsteReihe`), Farbharmonie sucht über alle Belegungen eine, bei der jede Farbe eine Gruppe hat. Weil jede Aufgabe die Belegung neu wählt, darf derselbe Joker bei zwei Aufgaben verschiedene Farben haben. Im Ablauf belegt das der Test, in dem eine Regenbogenschlange zwischen fünf gelben und vier violetten Karten in einem Schritt beide Aufgaben einlöst; am Entwicklertisch zeigt `aufgabe-joker-zwei-farben` nach dem Klick fünf Ereignisse: KarteGespielt, AufgabeErfuellt Gelber Schatz, AufgabeAufgedeckt Farbenpracht, AufgabeErfuellt Lila Riese, AufgabeAufgedeckt Fusionsexperte.

**Unabhängige Gegenprobe mit vollständiger Jokersuche** (temporärer Test, nicht im Repo, `<scratchpad>/X2a-pruefer/tmp_x2a_bruteforce.test.ts`): Zufällige Stellungen mit ein oder zwei Schlangen bis 16 Karten aus echtem Material (Baukasten, Invarianten geprüft), mit Regenbogenschlangen, Fusionen und Blockaden. Für jede Stellung probiert der Prüfer alle 6^k Farbbelegungen der k Joker und prüft die fünf Kartentexte direkt (Zählen, Läufe, Schlangengrenzen, Blockade als Unterbrechung). Zwei Läufe: 3000 Stellungen mit bis zu 5 (die letzten 300 bis zu 6) Jokern, erfüllt waren Farbenpracht 84, Farbharmonie 0, Farbkombination 2126, Gelber Schatz 224, Lila Riese 489 von 3000; weil Farbharmonie dort nie erfüllt war, dazu 2000 Stellungen gezielt nahe an Farbharmonie (alle sechs Farben in Läufen von 2 bis 4 Karten, Joker und Blockaden eingestreut, zufällig auf zwei Schlangen geteilt): 215 erfüllt, 1785 nicht. In allen 17'000 Vergleichen stimmt `istErfuellt` mit der vollständigen Suche überein, 0 Abweichungen (`X2a-bruteforce-ergebnis.txt`, Exit 0). Laufzeit: Die Umsetzung braucht 20 ms für 15'000 Aufrufe, die vollständige Suche 219 ms.

### 2. Entscheidungstabellen

`A9_aufgaben_farbmengen.test.ts` (Farbenpracht, Farbharmonie, Farbkombination) und `A9_aufgaben_reihen.test.ts` (Gelber Schatz, Lila Riese) bauen jede Zeile mit dem Baukasten aus echten Karten und fragen `istErfuellt` für Spieler 1. Jede Tabelle hat alle sechs Pflichtstellungen, meist mit einem „knapp nicht“-Gegenstück: bei der Regenbogenschlange (ein Joker ersetzt nur eine fehlende Karte; zwischen Grün-Grün und Braun-Braun vervollständigt er nur eine Gruppe), bei der Fusion (Fusion aus zwei grünen Karten ist nur eine Karte), bei der Blockade (unterbricht Gruppen und Reihen; zählt bei Farbenpracht und Farbkombination nicht als Karte, unterbricht dort aber nichts, was gebraucht wird) und über zwei Schlangen (Gruppe reicht nicht über das Schlangenende, 3 + 2 Karten in zwei Schlangen sind keine Farbkombination). Alle Zeilen sind grün (Lauf der sechs Dateien: 123 Tests, Exit 0).

### 3. Beispiele aus A9

A9 enthält für dieses Paket drei Beispiele: das allgemeine Beispiel (Vierergruppe Blau, fünfte Karte, Farbkombination), „Farbharmonie“ (zwei Schlangen mit je drei Dreiergruppen) und „Farbkombination“ (fünf blaue Karten). Alle drei sind eigene Tests mit „A9 Beispiel“ im Namen, das allgemeine zusätzlich im Zugablauf mit einem Gegner, der vier rote Karten hat und leer ausgeht. Zu Farbenpracht, Gelber Schatz und Lila Riese hat A9 kein Beispiel.

### 4. Erfüllt bleibt erfüllt

Drei Ablauftests: Gelber Schatz wird mit der Regenbogenschlange als Gelb eingelöst; in `berechneEndwertung` zählt sie als Violett (5 + 2 × 2 statt 5) und die Aufgabe bringt trotzdem 5 Punkte. Danach legt KI-Gegner 1 eine Blockade in die gelbe Reihe: `gelberSchatz.istErfuellt` ist falsch, die Aufgabe bleibt bei Spieler 1. Ebenso bleibt die geheime Aufgabe Lila Riese erfüllt (D35). Am Entwicklertisch zeigt `aufgabe-gelber-schatz` nach dem Klick die Aufschlüsselung „Gruppen Gelb×5 = 5, Violett×3 = 4 … Joker: Regenbogenschlange (regenbogenschlange-01) als Violett … Aufgaben: Gelber Schatz 5; Summe 20“ (9 + Vielfalt 1 + Kette 5 + 5, plausibel). In der Zufallspartie mit Saat 11 hat KI-Gegner 1 Lila Riese in Schritt 113 eingelöst und am Ende nur noch Violett×4 samt Regenbogenschlange, Spieler 1 hat Farbenpracht und am Ende viel weniger als zwei Karten je Farbe; beide Aufgaben zählen in der Wertung (5 und 8 Punkte).

### 5. Lila Riese mit 4 und 5

Eigener Test mit genau 4 und genau 5 violetten Karten, dazu in der Tabelle eine violette Dreiergruppe (C14, vorher erfüllt), vier violette mit Regenbogenschlange (erfüllt) und drei violette mit Regenbogenschlange (nicht erfüllt). Gegenprobe 1 unten. C14 ist damit behoben.

## Gates

Jeder Befehl einzeln, Exit-Code einzeln gelesen (Git Bash `${PIPESTATUS[0]}` hinter `tee`), Logs unter `<scratchpad>/X2a-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 143 passed (143), Tests 2634 passed (2634) |
| `npm run typecheck` | 0 | `tsc -b` ohne Meldung |
| `npm run build` | 0 | `✓ built in 874ms` |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | 399 Dateien, U1 51 Regeltestdateien/629 Testnamen, Ausnahmen je 0, keine Verstösse |
| `npx eslint .` | 0 | keine Meldung |
| `python scripts/regelcheck.py` | 0 | 8 Warnungen, keine Fehler (BOM in alten Belegen, TF-KI-013 nie bestanden, Länge `tests/layout/messung.ts`; alle nicht aus diesem Task) |
| `npm run test:layout` | 0 | 2200 passed (5.8m) |
| `npm run test:dauerlauf` (DoD 7) | 0 | Test Files 4 passed (4), Tests 4 passed (4) |

Ports vor `test:layout`: Zuerst lauschten 4173 (PID 18424) und 4174 (PID 11404), fremde Server, nicht beendet. Später ergab `netstat -ano | grep -E ':417[34] ' | grep -E 'LISTENING|ABH'` keine Zeile; dann lief das Gate. Danach wieder keine Zeile.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
dcb1e0fc test: X2a Entscheidungstabellen und Szenarien für Farbmengen und Gruppen
e0e8098a feat: X2a Farbenpracht, Farbharmonie, Farbkombination, Gelber Schatz und Lila Riese
```

`dcb1e0fc` enthält nur Testdateien: `farbmengen_hilfen.ts` (Testhilfe unter `__tests__`), `A9_aufgaben_farbmengen.test.ts`, `A9_aufgaben_joker_farbmengen.test.ts`, `A9_aufgaben_reihen.test.ts`, `A9_aufgaben_register.test.ts`, `szenarienAufgabenA.test.ts`. Auf diesem Commit (`git switch --detach dcb1e0fc`) endet `npx vitest run` über diese fünf Dateien mit Exit 1: `Test Files 4 failed | 1 passed (5)`, 48 Tests rot, und zwar am Verhalten: „Lila Riese.istErfuellt für Spieler 1: erwartet true: expected false to be true“, „farbkombination.istErfuellt, Beispiel A9: expected false …“, „AufgabeErfuellt für Spieler 1: expected undefined …“, „Testaufbau: Szenario aufgabe-lila-riese fehlt“. Grün bleibt nur `A9_aufgaben_register.test.ts`, dessen Änderung die Wiederherstellung nach `entferneTestbedingungen` prüft (unten). Die späteren Änderungen an den Tests (`git diff dcb1e0fc HEAD`) sind Umbauten aus `/simplify` (gemeinsame Hilfe `gegnerBlockiert`, `ereignisseVom`, `tisch` aus `wertung_hilfe`, Typ statt `as const`); keine Erwartung wurde geschwächt.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
 src/engine/__tests__/farbmengen_hilfen.ts          |  44 ++++++++
 .../regeln/A9_aufgaben_farbmengen.test.ts          | 115 ++++++++++++++++++++
 .../regeln/A9_aufgaben_joker_farbmengen.test.ts    | 120 +++++++++++++++++++++
 .../__tests__/regeln/A9_aufgaben_register.test.ts  |   5 +-
 .../__tests__/regeln/A9_aufgaben_reihen.test.ts    |  69 ++++++++++++
 src/engine/aufgaben/farbenpracht.ts                |  21 +++-
 src/engine/aufgaben/farbharmonie.ts                |  81 +++++++++++++-
 src/engine/aufgaben/farbkombination.ts             |  21 +++-
 src/engine/aufgaben/gelberSchatz.ts                |  21 +++-
 src/engine/aufgaben/lilaRiese.ts                   |   6 +-
 src/engine/jokerGruppen.ts                         |  41 +++++++
 src/entwicklung/szenarien.ts                       |   2 +
 src/entwicklung/szenarienAufgabenA.test.ts         |  84 +++++++++++++++
 src/entwicklung/szenarienAufgabenA.ts              | 104 ++++++++++++++++++
 src/ki/strategien/solideKi_zugende.test.ts         |   7 +-
 15 files changed, 723 insertions(+), 18 deletions(-)
```

| Datei | im Feld | Urteil |
|---|---|---|
| `src/engine/aufgaben/{farbenpracht,farbharmonie,farbkombination,gelberSchatz,lilaRiese}.ts` | ja | die fünf Aufgaben des Pakets; `reihenaufgabe` liegt in `gelberSchatz.ts` und wird von `lilaRiese.ts` genutzt |
| `src/engine/jokerGruppen.ts` | ja | eine einzige Änderungsstelle ab Zeile 290: Kommentar, `export { farbIndex }`, `Farbbestand`, `farbbestand`, `laengsteReihe` angefügt; keine bestehende Zeile geändert (Hunk `@@ -290,3 +290,44 @@` nur mit `+`) |
| neue Testdateien und `farbmengen_hilfen.ts` | Tests | Tests des Pakets |
| `src/entwicklung/szenarienAufgabenA.ts`, `szenarien.ts` (2 Zeilen) | nein | Szenarien verlangt der Plan („je ein Szenario am Entwicklertisch“, Regeln Engine); trägt |
| `A9_aufgaben_register.test.ts` | nein | PR: Der X1-Test verlangte, dass Lila Riese nach `entferneTestbedingungen` ein Platzhalter ist, das gilt mit echter Bedingung nicht mehr. Jetzt prüft er, dass genau die Funktion von vorher zurückkommt, und weiter, dass Lila Riese auf dem Grundtisch nicht erfüllt ist. Die Aussage von X1 (Wiederherstellung) bleibt erhalten; trägt |
| `src/ki/strategien/solideKi_zugende.test.ts` | nein | PR: Auf dem Tisch mit Saat 7154 hat Spieler 1 schon je zwei Karten jeder Farbe; der Schlangenfrass als erste Aktion löst deshalb jetzt Farbenpracht ein (8 Punkte). Der Test misst seither Summe minus Aufgabenpunkte. Die Aussage „Gelb×4 statt Gelb×3, ein Punkt“ und die KI-Wahl (Frass auf die Blockade) sind unverändert geprüft; die Gleichbewertung von Halten und Spielen ebenso. Trägt |

U10: `package.json` unverändert. U11: kein Altcode erkennbar. U13: `GAME_SPEC.md`, `tests/spec_documentation*`, `aktionen/typen.ts`, `karten/register.ts` unverändert. U9: keine Dateiköpfe, keine `ÄNDERUNG`-Kommentare. U4: keine neuen Importe ausser Engine-intern (Architekturtest grün). Codex-Review im PR: keine Befunde, Codex' eigener Vitest-Lauf scheiterte an seiner Sandbox; das ist stichhaltig eingeordnet, die Suite ist hier selbst gelaufen.

## Gegenprobe

1. `src/engine/aufgaben/lilaRiese.ts`: `reihenaufgabe('Lila Riese', 'Violett', 5)` → `4`. `npx vitest run` über `A9_aufgaben_reihen`, `A9_aufgaben_joker_farbmengen`, `szenarienAufgabenA` → Exit 1, 5 Tests rot, darunter „A9/D3 (C14): vier violette Karten in einer Reihe erfüllen nicht, fünf erfüllen“, „Lila Riese: mit Regenbogenschlange, knapp nicht“, „aufgabe-lila-riese: bei vier violetten Karten geschieht nichts …“. Zurück mit `git checkout -- src/engine/aufgaben/lilaRiese.ts`.
2. `src/engine/aufgaben/farbharmonie.ts`, Funktion `nach`: Joker unterbricht (`ziel.add(unterbreche(lage))`) statt jede Farbe fortzusetzen. `npx vitest run` über `A9_aufgaben_farbmengen`, `szenarienAufgabenA` → Exit 1, 5 Tests rot: „mit Regenbogenschlange: sie vervollständigt …“, „mit Farbenfusion: sie zählt als dritte grüne Karte …“, beide D31-Zeilen und das Szenario `aufgabe-farbharmonie`. Zurück mit `git checkout -- src/engine/aufgaben/farbharmonie.ts`.

`git status` danach ohne Änderung an getrackten Dateien. Logs: `X2a-gegenprobe-1.txt`, `X2a-gegenprobe-2.txt`.

## Browserprüfung

Testhook-Build (`npm run build:testhooks`), eigener Server `npx vite preview --outDir dist-testhooks --port 4291 --strictPort` aus diesem Worktree, weil 4173/4174 anfangs fremd belegt waren und keine `launch.json` besteht. Erst im eingebauten Browser (1280×900) mit Klicks auf die Aktionsknöpfe, dann dieselben Klicks mit Playwright Chromium (Desktop 1280×900) für die Fotos. Entwicklertisch ist ein Prüfwerkzeug, die Szenarien ändern keine Spieloberfläche; deshalb nur Desktop.

| Szenario | Gegenklick | Ergebnis | Klick | Ergebnis |
|---|---|---|---|---|
| `aufgabe-farbenpracht` | Feuerkeim (rot-03) → schlange-2 ende | nur KarteGespielt, Erfüllte Aufgaben: keine | Von vorn, Waldspross (gruen-02) → schlange-2 ende | KarteGespielt, AufgabeErfuellt Farbenpracht (aufgabe-01), AufgabeAufgedeckt Gelber Schatz; offen Gelber Schatz, Farbkombination, Lila Riese; Endwertung Aufg. 8, Summe 8 |
| `aufgabe-farbharmonie` | Regenbogenschlange → schlange-2 Stelle 0 | nur KarteGespielt | Von vorn, → schlange-2 Stelle 8 | AufgabeErfuellt Farbharmonie, AufgabeAufgedeckt Gelber Schatz; schlange-2 endet Violett, Violett, Regenbogenschlange |
| `aufgabe-farbkombination` | – | – | Wasserwirbel (blau-05) → schlange-1 ende, dann ZugBeenden | AufgabeErfuellt Farbkombination, AufgabeAufgedeckt Farbenpracht; nach ZugBeenden KartenGezogen, ZugBegonnen KI-Gegner 1, dessen Erfüllte Aufgaben: keine |
| `aufgabe-gelber-schatz` | – | – | Regenbogenschlange → schlange-1 Stelle 5 | AufgabeErfuellt Gelber Schatz; Aufschlüsselung Regenbogenschlange als Violett, Aufgaben Gelber Schatz 5, Summe 20 |
| `aufgabe-lila-riese` | Wasserwirbel (blau-01) → schlange-1 anfang | nur KarteGespielt | Von vorn, Mondranke (violett-05) → schlange-1 ende | AufgabeErfuellt Lila Riese, AufgabeAufgedeckt Farbenpracht |
| `aufgabe-joker-zwei-farben` | – | – | Regenbogenschlange → schlange-1 Stelle 5 | AufgabeErfuellt Gelber Schatz, AufgabeAufgedeckt Farbenpracht, AufgabeErfuellt Lila Riese, AufgabeAufgedeckt Fusionsexperte; offen Farbenpracht, Fusionsexperte, Farbharmonie |

Jedes Mal „Invarianten (alle erfüllt)“, keine Konsolenfehler, `scrollWidth` = `clientWidth` = 1280 (Playwright) bzw. 1265 (eingebauter Browser).

**Zufallspartie mit Erweiterung bis zum Ende** (Playwright, echte Klicks): Spieler 1 klickt je eine Aktion (bevorzugt eine Farbkarte ans Ende der eigenen Schlange), die KI-Gegner über „KI-Schritt (solide)“. Fünf Partien zu dritt mit Saat 4711, 11, 12, 13, 14 enden nach 175 bis 182 Schritten mit „Partiephase Beendet“, alle Invarianten erfüllt, keine Konsolenfehler. Eingelöst wurden: Saat 11 in Schritt 113 Lila Riese und Farbkombination zugleich durch KI-Gegner 1, in Schritt 126 Farbenpracht durch Spieler 1; Saat 13 in Schritt 76 Farbkombination durch KI-Gegner 2; in den anderen drei Partien keine Aufgabe. Die Wertung von Saat 11 ist plausibel (unten).

### Desktop 1280×900 – `bilder/X2a-aufgabe-farbenpracht-desktop.png`

Kopf „Szenario aufgabe-farbenpracht“, gelber Kasten mit Beschreibung und Erwartung, „Schritt 1“. Unter „Aktionen der Engine (1)“ nur noch ZugBeenden, weil die Farbkarte des Zuges gelegt ist. „Ereignisse des letzten Schritts (3)“: KarteGespielt gruen-02 → schlange-2, Stelle 5; AufgabeErfuellt Farbenpracht (aufgabe-01); AufgabeAufgedeckt Gelber Schatz (aufgabe-14). Darunter „Invarianten (alle erfüllt)“, elf grüne Zeilen. Nichts abgeschnitten oder überdeckt.

### Desktop 1280×900 – `bilder/X2a-aufgabe-farbharmonie-desktop.png`

Beschreibung im gelben Kasten vollständig lesbar. 17 Aktionen (16 Farbkarten in beide Schlangen und ZugBeenden), dann „Ereignisse des letzten Schritts (3)“: Regenbogenschlange → schlange-2, Stelle 8; AufgabeErfuellt Farbharmonie (aufgabe-02); AufgabeAufgedeckt Gelber Schatz (aufgabe-14). Keine Überlappung.

### Desktop 1280×900 – `bilder/X2a-aufgabe-farbkombination-desktop.png`

Ereignisse: blau-05 → schlange-1, Stelle 4; AufgabeErfuellt Farbkombination (aufgabe-03); AufgabeAufgedeckt Farbenpracht (aufgabe-01). Nur ZugBeenden bleibt als Aktion. Invarianten alle erfüllt.

### Desktop 1280×900 – `bilder/X2a-aufgabe-gelber-schatz-desktop.png`

Zwölf Farbkartenknöpfe (neue Schlange, Anfang, Ende), ZugBeenden, Ereignisse: Regenbogenschlange → schlange-1, Stelle 5; AufgabeErfuellt Gelber Schatz (aufgabe-14); AufgabeAufgedeckt Farbenpracht (aufgabe-01). Die Wertung liegt unter dem Bildrand; ihr Text ist oben unter Kriterium 4 abgelesen.

### Desktop 1280×900 – `bilder/X2a-aufgabe-lila-riese-desktop.png`

Ereignisse: violett-05 → schlange-1, Stelle 4; AufgabeErfuellt Lila Riese (aufgabe-15); AufgabeAufgedeckt Farbenpracht (aufgabe-01). Invarianten alle erfüllt, darunter beginnt „Lage“.

### Desktop 1280×900 – `bilder/X2a-aufgabe-joker-zwei-farben-desktop.png`

„Ereignisse des letzten Schritts (5)“ mit beiden AufgabeErfuellt (Gelber Schatz, Lila Riese) und beiden AufgabeAufgedeckt (Farbenpracht, Fusionsexperte) in genau der Reihenfolge der Erwartung. Die Knöpfe stehen zweispaltig, keiner abgeschnitten.

### Desktop 1280×900 – `bilder/X2a-zufallspartie-11-ende-desktop.png`

„Partie aus Saat 11, 3 Spieler, mit Erweiterung“, „Schritt 175“, beide KI-Knöpfe grau mit „Die Partie ist beendet.“, „Aktionen der Engine (0)“ mit dem Satz „Die Partie ist beendet (A10); die Wertung steht unten.“, letztes Ereignis PartieBeendet, Invarianten alle erfüllt, unter „Lage“: Partiephase Beendet, Schlussrunde ausgelöst von KI-Gegner 2.

### Desktop 1280×900 – `bilder/X2a-zufallspartie-11-wertung-desktop.png`

Oben „Offene Aufgaben (3): Schlangenmeister, Farbharmonie, Farbwechsler“. Tabelle „Endwertung“: Spieler 1 Gruppen 3, Vielfalt 0, Kette 0, Aufg. 8, Summe 11; KI-Gegner 1 14, 1, 0, 10, 25; KI-Gegner 2 20, 1, 5, 0, 26; „Gewonnen: KI-Gegner 2 (26)“. Aufschlüsselung: Spieler 1 „Aufgaben: Farbenpracht 8“; KI-Gegner 1 schlange-2 „Violett×4 = 6 … Regenbogenschlange als Violett“, „Aufgaben: Lila Riese 5, Farbkombination 5“; KI-Gegner 2 „Blau×7 = 7“, Kette 7, Bonus 5. Die Summen stimmen (3 + 8; 14 + 1 + 10; 20 + 1 + 5). Lila Riese zählt, obwohl die violette Reihe am Ende nur noch vier Karten lang ist, Farbenpracht, obwohl Spieler 1 am Ende Gelb×3 und wenige Einzelkarten hat: erfüllt bleibt erfüllt.

Server danach beendet: eigener Server auf Port 4291, PID 36116, Befehlszeile `"node" "E:\Work\Privat\Schlangentanz_v2\.claude\worktrees\agent-a811891994bcc6ed4\node_modules\.bin\..\vite\bin\vite.js" preview --outDir dist-testhooks --port 4291 --strictPort`, mit `Stop-Process` beendet; danach lauscht auf 4291 nichts mehr, 4173/4174 ohne `LISTENING`/`ABHÖREN`. Den eigenen Tab im eingebauten Browser geschlossen.

## Satz-für-Satz-Abdeckung

| Spec-Abschnitt | Regelaussage | Test (Datei › Name) |
|---|---|---|
| A9 Sonderkarten | Regenbogenschlange und Farbenfusion zählen für Aufgaben als Karte einer Farbe, und zwar als die Farbe, mit der die Aufgabe erfüllt ist. | Tabellenzeilen „mit Regenbogenschlange“ und „mit Farbenfusion“ aller fünf Aufgaben (`A9_aufgaben_farbmengen`, `A9_aufgaben_reihen`) |
| A9 Sonderkarten | Diese Farbe ist nicht festgelegt: Bei einer anderen Aufgabe … darf die Karte als andere Farbe zählen. | `A9_aufgaben_reihen` › „A9/A7.3/D8: … als Gelb und … als Violett“ (Regenbogenschlange und Fusion); `A9_aufgaben_joker_farbmengen` › „A9/A7.3: … löst in einer Aktion Gelber Schatz … und Lila Riese … ein“ |
| A9 Sonderkarten | … und bei der Punktewertung darf die Karte als andere Farbe zählen. | `A9_aufgaben_joker_farbmengen` › „A9/A7.3/A11: Gelber Schatz … zählt in der Wertung, obwohl sie dort als Violett zählt“ |
| A9 Sonderkarten | Die Karten unter einer Farbenfusion zählen nicht einzeln. | Zeilen „mit Farbenfusion, knapp nicht“ aller fünf Aufgaben; `A9_aufgaben_joker_farbmengen` › „A9/A7.7: eine Farbenfusion … auf zwei rote Karten … die roten Karten darunter zählen nicht“ |
| A9 Sonderkarten | Andere Sonderkarten, etwa die Schlangenblockade, unterbrechen Farbreihen | Zeilen „mit Blockade dazwischen“ bei Farbharmonie, Gelber Schatz, Lila Riese; Ablauftests mit Gegnerblockade |
| A9 Sonderkarten | … und zählen nur, wenn eine Aufgabe ausdrücklich Sonderkarten verlangt. | Farbenpracht „mit Blockade statt der zweiten grünen Karte“, Farbkombination „mit Blockade statt der fünften Karte“ |
| A7.3 | Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist. Eine erfüllte Aufgabe bleibt erfüllt, auch wenn die Karte später anders zählt. | wie oben; Kriterium 4 (drei Ablauftests) |
| A7.3 | Unterbricht keine Farbreihen, wenn sie als passende Farbe genutzt wird | Gelber Schatz/Lila Riese „Regenbogenschlange in der Mitte … verbindet zwei Reihen“ |
| A7.7 | Die Farbe der Fusion ist nie festgelegt. Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist | `A9_aufgaben_reihen` › „ebenso eine Farbenfusion aus zwei blauen Karten zwischen gelben und violetten Karten“ |
| A7.7 | Die ursprünglichen Farben der fusionierten Karten spielen für Aufgaben keine Rolle mehr | Fusion aus Gelb zählt als dritte grüne (Farbharmonie) bzw. fünfte blaue (Farbkombination), Fusion aus Rot als fünfte violette |
| A7.5 | Fügt der Schlange eine neutrale, nicht farbige Karte hinzu | Blockade-Zeilen aller Tabellen |
| A9 Nr. 1 | Habe … von jeder Farbe mindestens zwei Karten | Farbenpracht „erfüllt“, „knapp nicht: nur eine grüne Karte“ |
| A9 Nr. 1 | … in deinen beiden Schlangen (D38: über alle vorhandenen, eine genügt) | „erfüllt: eine Schlange …“, „über zwei Schlangen“, „über zwei Schlangen, knapp nicht“, „… in der Schlange des Gegners zählt nicht“ |
| A9 Nr. 1 | am Ende des Spiels oder Zugs | Zeitpunkt regelt der X1-Rahmen; offene Auslegung, siehe unten (Frage 1) |
| A9 Nr. 2 | Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe. | Farbharmonie „erfüllt“, „knapp nicht: Violett hat nur zwei Karten“, „Vierergruppe …“, „Gruppe reicht nicht über das Ende einer Schlange“, Gegnerzeile, Beispiel A9 |
| D31 | Drei Joker nebeneinander sind eine Gruppe frei wählbarer Farbe, auch für Farbharmonie | „D31: drei Regenbogenschlangen …“, „D31: Regenbogenschlange, Farbenfusion, Regenbogenschlange …“ |
| A9 Nr. 3 | Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange. | Farbkombination „sechs gelbe“, „vier blaue und eine rote“, „über zwei Schlangen: drei und zwei … erfüllen nicht“, „… eine der beiden Schlangen fünf“, Beispiele A9 |
| D41 | Fünf Karten gleicher Farbe irgendwo in derselben Schlange genügen; getrennte Gruppen zählen zusammen | „mit Blockade dazwischen: fünf blaue Karten irgendwo …“, „D41: auch getrennte Gruppen …“ |
| A9 Nr. 14 | Bilde eine Gruppe aus min. 6 gelben Karten. | Gelber Schatz „sechs gelbe nebeneinander“, „fünf gelbe“, „sechs gelbe, durch eine rote getrennt“ |
| A9 Nr. 15, D3 | Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten. | „A9/D3 (C14): vier … nicht, fünf …“, „fünf violette, durch eine braune unterbrochen“, Blockadezeile |
| D41 | Bei Gelber Schatz und Lila Riese zählen Joker mit, als Gelb bzw. Violett; eine Fusion zählt als eine Karte | Zeilen „mit Regenbogenschlange“, „mit zwei Regenbogenschlangen“, „Fusion aus zwei gelben/violetten Karten zählt als eine Karte“ |
| A9 Allgemein | Die Bedingungen dürfen im selben Zug geschaffen und die Aufgabe direkt erfüllt werden. Die Punkte bekommt, wer die Bedingungen zuerst erfüllt und am Zug ist. | `A9_aufgaben_joker_farbmengen` › „A9 Beispiel: … er bekommt Farbkombination, obwohl KI-Gegner 1 … kurz davor war“; X1-Rahmentests |

Keine Regelaussage der fünf Kartentexte und der Joker-Regel ist ohne Test.

## Auslegungsfragen des Orchestrators

**Frage 1: Farbenpracht „am Ende des Spiels oder Zugs“.** A9 sagt: „Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist.“, „Alle Aufgaben funktionieren nach dem gleichen Prinzip“ und „Die Bedingungen dürfen im selben Zug geschaffen und die Aufgabe direkt erfüllt werden.“ D35 sagt für die geheime Aufgabe, sie zähle, „sobald sie einmal in einem eigenen Zug erfüllt war“. D34 regelt nur den Schalter der Erweiterung und sagt zum Zeitpunkt nichts. Der Kartentext nennt dagegen ausdrücklich das Ende des Zugs oder des Spiels. Teil A/D deckt die Umsetzung damit nicht eindeutig; der allgemeine Teil spricht für sie, der Kartentext dagegen. Möglichkeiten:

- (a) Wie umgesetzt: geprüft wie jede Aufgabe nach jeder aufgelösten Aktion. Beispiel (eigener Grenzfall G3): Spieler 1 hat je zwei Karten von Blau bis Braun und ein Grün, legt das zweite Grün an (Farbenpracht eingelöst) und fusioniert danach die beiden grünen Karten. Danach fehlen zwei grüne Karten, ein Joker ersetzt nur eine; Farbenpracht bleibt trotzdem bei ihm.
- (b) Nur am Ende des eigenen Zugs geprüft (bei Farbenpracht als Ausnahme vom „gleichen Prinzip“): Im Beispiel bekäme er Farbenpracht nicht.
- (c) Zusätzlich am Ende des Spiels für jeden Spieler, auch wer nicht am Zug ist: Legt ein Gegner in der Schlussrunde nach meinem letzten Zug die fehlende Karte in meine Schlange (D9), bekäme ich Farbenpracht nach (c), nach (a) und (b) nicht.

Hält die Bedingung am Zugende, war sie nach der letzten Aktion schon wahr; (a) löst also jeden Fall von (b) ein, nur eben früher und auch die Fälle, die im Zug wieder verloren gehen.

**Frage 2: Farbharmonie, Vierergruppe als „Dreiergruppe“.** Gedeckt, aber nicht wörtlich. A11 definiert: „Eine Farbgruppe besteht aus mindestens drei nebeneinanderliegenden Karten derselben Farbe“; A7.7 nennt eine Fusion „Teil einer Dreiergruppe“, und eine Fusion in einer Vierergruppe bringt Punkte, „Dreiergruppe“ steht dort also für „Gruppe ab drei“. Gegen die Lesart lässt sich nur A11 anführen: „Eine Vierergruppe zählt also nicht zusätzlich als Dreiergruppe“. Der Satz regelt aber die Punkte einer Gruppe, nicht, ob sie eine Gruppe ist. Möglichkeiten: (a) wie umgesetzt, Gruppe ab drei Karten: Blau×4 erfüllt den blauen Teil; (b) genau drei Karten: Blau×4 erfüllt ihn nicht, und eine vierte blaue Karte würde eine schon vorhandene blaue Dreiergruppe zerstören. Ich halte (a) für gedeckt; eine Bestätigung des Autors schadet nicht.

**Frage 3: reine Jokerreihen.** D41 sagt nur „Bei ‚Gelber Schatz‘ und ‚Lila Riese‘ zählen Joker mit, als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte.“ Ob eine Reihe ganz ohne echte Karte der Farbe genügt, sagt weder D41 noch A9. A9 („zählen … als die Farbe, mit der die Aufgabe erfüllt ist“) spricht wörtlich dafür; D31 bejaht reine Jokergruppen ausdrücklich, aber nur für Gruppenpunkte, Vielfaltbonus und Farbharmonie („Drei Regenbogenschlangen nebeneinander: eine Gruppe mit 0 Punkten“); D32 verneint eine Gruppe nur aus Regenbogenschlangen für den Vielfaltbonus („Eine Regenbogenschlange zählt nicht beim Vielfalt Bonus“), eine Gruppe aus Regenbogenschlangen und Fusion zählt dort aber („Zählt als grün.“). Die Umsetzung zählt reine Jokerreihen bei allen fünf Aufgaben mit (eigener Grenzfall G2 belegt das). Möglichkeiten mit Beispiel:

- (a) Wie umgesetzt: Joker zählen immer. Regenbogenschlange, Regenbogenschlange, Fusion (Blau), Regenbogenschlange, Regenbogenschlange erfüllt Lila Riese und Farbkombination; sechs Joker erfüllen Gelber Schatz; Farbenpracht ist mit zwei Regenbogenschlangen statt beider grünen Karten erfüllt.
- (b) Wie D32: Es braucht mindestens eine echte Farbkarte der Farbe (bei Farbenpracht: von jeder Farbe mindestens eine echte Karte). Dann erfüllt keines der Beispiele von (a).
- (c) Wie D32 samt Rückfrage: Eine Reihe nur aus Regenbogenschlangen zählt nicht, mit einer Fusion darin schon. Dann erfüllt das Beispiel aus (a) Lila Riese weiter (Fusion darin), fünf Regenbogenschlangen allein gäbe es nicht, weil das Spiel nur vier hat.

Praktisch selten: Das Spiel hat 4 Regenbogenschlangen und 4 Fusionen; fünf oder sechs Joker in einer Reihe kommen kaum vor. Häufiger ist Farbenpracht mit ein oder zwei Jokern statt der einzigen oder beiden Karten einer Farbe. Für Farbharmonie gilt D31 eindeutig, dort ist die Umsetzung gedeckt.

**Weitere Hinweise des Orchestrators:**

- `jokerGruppen.ts`: nur am Ende angefügt plus `export { farbIndex }`, bestehende Funktionen unverändert (ein einziger Hunk ab Zeile 290, nur `+`). Bestätigt.
- Partien ohne Erweiterung unverändert: Golden Master (`golden_master.test.ts`, drei Partien ohne Erweiterung) grün, `golden/` unverändert. Eigene Prüfsumme über die Partieprotokolle ohne Erweiterung für Saat 1 bis 30 mit 2, 3 und 4 Spielern (90 Partien): SHA-256 über die 90 Protokolltexte auf der Basis `589e2a7` und auf `e0e8098` gleich, `8c27f6b8753e912c2e6857b8f76c22e101295b3728a659241e5a51b4058765ef` (temporärer Test, `X2a-pruefsumme-basis.txt`, `X2a-pruefsumme-head.txt`).
- Die geänderten Tests ausserhalb erhalten ihre Aussage (Tabelle „Diff“ oben).

## Eigene Grenzfälle

Temporärer Test `<scratchpad>/X2a-pruefer/tmp_x2a_grenzfaelle.test.ts`, 4 Tests, Exit 0 (`X2a-grenzfaelle.txt`):

1. **G1: Joker über das Schlangenende.** Fünf Dreiergruppen in Schlange 1, an ihrem Ende eine Regenbogenschlange, Schlange 2 beginnt mit Violett, Violett. Farbharmonie: nicht erfüllt. Dieselbe Regenbogenschlange am Anfang von Schlange 2: erfüllt. Die Suche setzt die laufende Gruppe am Schlangenende richtig zurück.
2. **G2: reine Jokerreihen.** Fünf Joker ohne violette Karte erfüllen Lila Riese und Farbkombination, sechs Joker ohne gelbe Karte Gelber Schatz, zwei Regenbogenschlangen statt beider grünen Karten Farbenpracht. Hält das heutige Verhalten zu Frage 3 fest.
3. **G3: Farbenpracht im Zug erfüllt und im selben Zug selbst zerstört.** Zweites Grün angelegt: Farbenpracht eingelöst. Danach Fusion über die beiden grünen Karten: Bedingung falsch, Aufgabe bleibt bei Spieler 1, die Fusion meldet kein Aufgabenereignis. Beleg zu Frage 1 (a).
4. **G4: ohne Erweiterung.** Vierergruppe Blau, fünfte blaue Karte: kein Aufgabenereignis, keine offenen Aufgaben (D34).
5. **G5: ungünstigste Laufzeit von Farbharmonie.** Zwei Schlangen mit 24 Karten und 8 Jokern (alle Regenbogenschlangen und Fusionen des Spiels): 0,23 ms je Aufruf (Mittel über 1000 Aufrufe), Ergebnis gleich der vollständigen Suche. Kein Laufzeitproblem.
6. **G6: 3 Spieler, Aufgabe beim Gegner.** In der Zufallspartie mit Saat 11 löst KI-Gegner 1 zwei Aufgaben dieses Pakets in einem Schritt ein, in Saat 13 KI-Gegner 2 Farbkombination; Aufgaben gehen also auch an KI-Sitze 2 und 3.

## Testregister

Bereiche bestehen: `ENGINE` (`src/engine/**`), `DEV` (`src/entwicklung/**`), `KI` (`src/ki/**`); jede geänderte Datei fällt in einen davon.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-ENGINE-072 | Bedingungen der fünf Aufgaben: Regeltests, Gegenproben, vollständige Jokersuche, Prüfsumme ohne Erweiterung | `2026-11-23-0925-TF-ENGINE-072` | bestanden |
| TF-ENGINE-073 | Grenzfälle G1 bis G4 (Grenzfall von 072) | `2026-11-23-0925-TF-ENGINE-073` | bestanden |
| TF-DEV-051 | sechs Szenarien am Entwicklertisch und Zufallspartien mit Erweiterung | `2026-11-23-0925-TF-DEV-051` | bestanden |

Alle drei Läufe auf `e0e8098`, sauber (ohne nicht committete Änderung ausserhalb von `tagebuch/`). Die Nummern sind gegen `origin/neuaufbau` und die offenen Branches X2b, X2c, X3 frei; laufen andere Prüfer parallel, nummeriert der Orchestrator beim Merge um.

## Hinweise (kein Mangel)

1. `mal` steht zweimal (`farbmengen_hilfen.ts` und `szenarienAufgabenA.ts`), dazu ähnliche Helfer anderer Szenariodateien. Der PR begründet das Aufschieben mit den gleichzeitigen Paketen B und C; nach dem Zusammenführen lohnt eine gemeinsame Hilfe.
2. `reihenaufgabe` liegt in `gelberSchatz.ts`, `lilaRiese.ts` importiert eine andere Aufgabendatei. Funktioniert; eine gemeinsame Stelle (etwa in `jokerGruppen.ts` oder `definition.ts`) wäre beim Lesen naheliegender.
3. `origin/neuaufbau` ist seit der Basis um P0.5f (D56, D57) und Abnahmekriterien für X4–X6 weiter; `git merge-tree` zeigt keinen Konflikt, D56/D57 betreffen dieses Paket nicht.
4. Bei jeder Prüfung ruft der Rahmen für jede offene Aufgabe `istErfuellt` auf; Farbharmonie ist die teuerste. Gemessene Laufzeit oben (G5); im Dauerlauf (`test:dauerlauf`, 79 s) ist kein Ausreisser zu sehen.
