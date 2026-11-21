# Prüfprotokoll E4b – Ereignis für versetzte Karten

| Feld | Wert |
|---|---|
| Task | E4b Ereignis für versetzte Karten (Vorbereitung für E5 bis E9) |
| Branch | `task/E4b-versetzt`, PR #63 gegen `neuaufbau` |
| Geprüfter Stand | `5914861` (Basis `fb04ba9`; `origin/neuaufbau` steht auf `fb04ba9`) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts; den PR nur für Dateibegründungen und den Codex-Abschnitt gelesen |
| Iteration | 1 |
| Datum | 21.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: eigener Branch `pruefung-E4b` auf `origin/task/E4b-versetzt`. Zeilenenden vorher 409 Dateien `w/crlf`, nach `git ls-files -z | xargs -0 rm -f` und `git checkout -- .` 0. `core.hooksPath` zeigt auf `E:\Work\Privat\Schlangentanz_v2\scripts\githooks` (gemeinsame Einstellung). `npm ci` Exit 0. Logs, Proben und Fotos unter `<scratchpad>/E4b-pruefer/`. Der Task-Block steht nicht in `docs/UMSETZUNGSPLAN.md`; massgebend sind die sieben Kriterien aus dem Auftrag des Orchestrators, unten wörtlich bis auf die Aufzählungszeichen.

## Urteil: ABGELEHNT

Die Engine-Arbeit selbst ist sauber: `KartenVersetzt` entsteht generisch in `kartenorte.ts`, lässt sich in allen Fällen des Umsetzers und in vier eigenen nachrechnen, verrät keine verdeckte Karte, und die 300 Dauerlauf-Partien verlaufen Schritt für Schritt wie auf der Basis. Abgelehnt wird wegen eines kleinen, aber echten Mangels an Kriterium 5. Dazu ist `test:layout` einmal rot gewesen (ein Desktop-Test zu Touch, ohne Bezug zu E4b; siehe Gates).

1. **Kriterium 5, `istPlatzhalter` ungetestet.** Gibt `istPlatzhalter` in `src/engine/karten/platzhalter.ts` immer `false` zurück (`return false && PLATZHALTER.has(definition);`), bleibt die ganze Suite grün: `npx vitest run src/ tests/` Exit 0, 68 Dateien, 1'616 Tests. Die sieben Tests „D13: … ist noch ein Platzhalter“ fallen dabei still weg, weil `it.each([])` nichts erzeugt, und der Test „die umgesetzten Karten von E2 bis E4 sind keine Platzhalter mehr“ prüft nur die negative Seite (`arrayContaining`). Damit greift der Platzhaltertest heute zwar, eine kaputte Markierung fiele aber niemandem auf. Der Umsetzer hatte im ersten Commit eine Zusicherung `PLATZHALTER.length + umgesetzt.length === ARTEN.length`, die immer wahr war und in `3e2eaac` zu Recht entfernt wurde; ein wirksamer Ersatz fehlt. Behebung etwa: ein Test `expect(istPlatzhalter(platzhalter('Farbendieb', 'FarbendiebSpielen', 'E9'))).toBe(true)` in `aktionen.test.ts`, der ohne Hand-Liste auskommt. Beleg: TF-ENGINE-030, Lauf `2026-11-21-1045-TF-ENGINE-030` (fehlgeschlagen), `platzhalter-immer-falsch-gesamt.txt`.

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Auftrag) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | Jede Wirkung erfasst: Nach jeder Kartenwirkung meldet die Engine ein Ereignis, das alle Karten mit geändertem Ort oder geänderter Reihenfolge nennt. Das gilt für die sofortige Wirkung ohne Ansage und für die Auflösung nach einer Ansage, auch wenn nur ein Teil abgewehrt wurde. Der Vergleich ist generisch in der Engine, die Kartendateien enthalten keine Ereignislogik. | ja | einziger Aufruf `definitionFuer(karte).wirke` in `reaktion.ts:46` über `wirkeUndMeldeVersetzte`; `kartenversetzt.test.ts` (11 grün); eigene Probe P1 (teilweise Abwehr); Gegenprobe G1 rot |
| 2 | Vollständig nachrechenbar: Aus den Ereignissen allein lässt sich die sichtbare Lage exakt nachrechnen: Positionen in Schlangen, Reihenfolge auf Ablagestapeln, Karten unter Fusionen, neue Schlangen mit Id und verschwundene Schlangen. Prüfe das an Test-Karten für jeden der vier Fälle und an mindestens einem eigenen Fall, den der Umsetzer nicht getestet hat. | ja | Tests des Umsetzers zu allen vier Fällen; eigene Proben P1 bis P4 grün (P2: zwei Schlangen zweier Spieler, Fusion samt Unterkarten wechselt den Besitzer, Ablagekarte in fremde Schlange) |
| 3 | Nachrechentest ohne Kartenwissen: `spieleNach` enthält keine kartenspezifische Logik. Gegenprobe: Lässt du das Ereignis weg oder verfälschst du eine Position, wird der Test rot. | ja | `nachrechnen.ts` ohne Kartennamen (nur Kommentare, Ortsnamen); G1 (Ereignis unterdrückt) 10 von 11 rot; P5 (Position +1) Lage weicht ab |
| 4 | Geheimnis (B2): Kein Ereignis verrät die Id einer Karte, die auf eine Hand oder in den Nachziehstapel geht. Kein Ereignis verrät über die Reihenfolge der Einträge die verdeckte Reihenfolge im Nachziehstapel. Prüfe das mit einer eigenen Probe. Beurteile die Befunde 1 und 2 von Codex. | ja | Test „B2: die Reihenfolge …“ (auf `570cfe1` rot, danach grün); eigene Probe P4: zwei verschiedene verdeckte Anordnungen, gleiches Ereignis, 5 Einträge mit `karteId: null`; Urteil zu Codex unten |
| 5 | `UMGESETZT` aus dem Register: Die Liste wird aus dem Register abgeleitet (`istPlatzhalter`). Der Platzhaltertest greift für echte Platzhalter weiter. Gegenprobe: Ersetzt du einen Platzhalter durch eine Test-Definition, ändert sich die Liste von selbst, ohne Änderung an `aktionen.test.ts`. | **nein** | Ableitung und Gegenprobe ja (7 → 6 D13-Tests); aber `istPlatzhalter` immer `false` lässt die Suite grün, Mangel 1 |
| 6 | Verhalten unverändert: Bestehende Tests sind nur dort angepasst, wo sich die Form der Ereignisse ändert (`position` am Ablagestapel). Der Dauerlauf mit 300 Partien und seinen Schwellen ist grün. Die Partien verlaufen bei gleicher Saat wie vorher. | ja | Diff der fünf Tests: je eine Zeile `position: 0`; Dauerlauf in `npm test` grün; Prüfsumme über 300 Partien auf `5914861` und `fb04ba9` gleich (`a3339271…bd885`, je 51'063 Schritte) |
| 7 | Gates und Entwicklertisch: Alle Gates laufen einzeln mit Exit-Code, dazu `test:layout`. Am Entwicklertisch im Testhook-Build prüfst du die Szenarien `verdoppler` und `schlangengrube`. Die Texte der Ereignisse sind lesbar und die Orte plausibel, es gibt keine Konsolenfehler. Mach ein Bildschirmfoto, sieh es dir an und beschreibe es. | ja, mit Vorbehalt | alle Gates 0 ausser `test:layout` (Exit 1, ein Desktop-Touch-Test, siehe Gates); Entwicklertisch: „Ablagestapel von Spieler 1 (spieler-1), Stelle 0“ bzw. „Stelle 1“, 0 Konsolenfehler, zwei Fotos beschrieben |

### 1. Jede Wirkung erfasst

`git grep "\.wirke("` ausserhalb der Tests findet genau eine Stelle, `reaktion.ts:46` in der neuen Funktion `wirke`. Sie wird aus `spieleKarte` (sofortige Wirkung, Zeile 60) und aus `loeseAuf` (nach der Ansage, Zeile 121) gerufen und umschliesst die Registerwirkung mit `wirkeUndMeldeVersetzte` (`kartenorte.ts`). Der Vergleich kennt keine Kartenart: `alleKartenorte` zählt jede Karte an jedem Ort des Zustands auf, `versetzungen` vergleicht die Behälter und die Folge der dort gebliebenen Karten. Unter `src/engine/karten/` steht kein `KartenVersetzt` und kein `ereignisse`; geändert ist dort nur `platzhalter.ts` (Markierung, keine Ereignislogik).

Abgedeckt in `kartenversetzt.test.ts`: nach Ansage (Farbendieb-, Schlangenfrass-Test-Karten, Ereignis direkt vor `AnsageEntschieden`) und ohne Ansage (Fusion, Häutung, Ereignis vor `KarteGespielt`). Den Fall „nur ein Teil abgewehrt“ testet der Umsetzer nicht; meine Probe P1 (drei Spieler, Spieler 2 wehrt mit Farbenschutz ab, Spieler 3 lässt durch) zeigt: ein `Abgewehrt`, genau ein `KartenVersetzt` direkt vor `AnsageEntschieden`, das nur die Karte von Spieler 3 nennt (`schlange-2`, Stelle 1 → Ablagestapel von Spieler 1, Stelle 0); Nachrechnen, B2 und Invarianten in jedem Schritt grün.

Eine Kleinigkeit zum Wortlaut „alle Karten mit geänderter Reihenfolge“: Der Vergleich arbeitet stellenweise, nicht mit der längsten gemeinsamen Folge. Bei der Drehung A, B, C, D → B, C, D, A (P3) nennt das Ereignis alle vier Karten, obwohl B, C, D zueinander gleich bleiben. Das Nachrechnen stimmt, es wird nur mehr genannt als nötig (Hinweis H2).

### 2. Vollständig nachrechenbar

Die vier Fälle aus dem Auftrag sind beim Umsetzer je mit einer Test-Karte belegt und laufen grün (`E4b-kartenversetzt.txt`, „Tests 11 passed (11)“): Ablagestapel des Angreifers über und unter der gespielten Karte (`[gelb, gespielt, blau]`), Fusion legt zwei Karten unter sich (Positionen 0 und 1), leer gefressene Schlange in `aufgeloest: ['schlange-1']`, neue Schlange `schlange-3` in `nach`. Jeder Schritt wird in `spiele()` mit `spieleNach(lageVon(vorher), ereignisse)` gegen `lageVon(nachher)` verglichen; `Lage` enthält Schlangen mit Besitzer, `fusionen` je Fusions-Id, Ablagestapel in Reihenfolge und `ausDemSpiel`.

Eigene Fälle (Prüfdatei als Beleg `E4b-prueferprobe.test.ts.txt`, Ausgabe `eigene-proben.txt`, Exit 0, 6 bestanden):

- **P2:** In einer Wirkung wandert eine Fusion samt ihren zwei Unterkarten aus der Schlange von Spieler 2 an Stelle 1 der Schlange von Spieler 1, diese wird zuvor zu Gelb, Blau, Rot umgeordnet, und die unterste Karte des Ablagestapels von Spieler 1 geht ans Ende der Schlange von Spieler 2. Ergebnis Gelb, Fusion, Blau, Rot; nachrechenbar.
- **P3:** Drehung in einer Schlange, nachrechenbar.
- **P4:** fünf Karten verdeckt auf Hand und Stapel, nachrechenbar (siehe Kriterium 4).

### 3. Nachrechentest ohne Kartenwissen

`grep -nE "Farb|Verdoppler|Schlangen(frass|grube|…)|Fusion|aktion\.typ|definitionFuer|KARTENREGISTER" src/engine/__tests__/nachrechnen.ts` trifft nur zwei Kommentare und die Ortsnamen `UnterFusion`. `spieleNach` behandelt `KartenVersetzt` für jede Karte gleich: Ids vor dem Nehmen bestimmen (verdeckte über `karteAn(von)`), alle nehmen, in Listenreihenfolge legen, `aufgeloest` löschen.

Gegenproben:

- **G1** `kartenorte.ts:112` `if (karten.length > 0 || aufgeloest.length > 0) ereignisse.push(…)` → `if (false) ereignisse.push(…)`. `npx vitest run src/engine/__tests__/kartenversetzt.test.ts src/engine/__tests__/zugablauf_ereignisse.test.ts`: Exit 1, 10 von 23 rot, alle 10 in `kartenversetzt.test.ts`, etwa „E4b: Reagieren lässt sich nicht nachrechnen“. Die Tests in `zugablauf_ereignisse.test.ts` bleiben grün, weil noch keine echte Karte andere Karten bewegt. `git checkout -- src/engine/kartenorte.ts`.
- **G2** `kartenorte.ts:77` Reihenfolgeerkennung abgeschaltet (`if (false && folge.vorher[stelle] !== karteId)`): Exit 1, rot „A7.9: beim Umordnen …“ sowie meine P2, P3, P5. Zurückgesetzt.
- **P5** In einem echten `KartenVersetzt` (Häutung) `karten[0].nach.position += 1`: `spieleNach` ergibt eine andere Lage als der Zustand (Probe grün, weil sie genau das erwartet).
- Der Test „E4b Gegenprobe: ohne KartenVersetzt …“ des Umsetzers filtert das Ereignis heraus und erwartet eine abweichende Lage; er läuft grün.

`git status` war nach jeder Gegenprobe leer.

### 4. Geheimnis (B2)

Regel im Code: Liegt eine Karte nach der Wirkung auf einer Hand oder im Nachziehstapel (`istVerdeckt`), steht sie mit `karteId: null`, und alle solchen Einträge stehen am Ende in der Reihenfolge **vor** der Wirkung. Hand und Nachziehstapel haben als Ort keine Position.

Eigene Probe P4: Spieler 1 hat die Schlange Blau, Rot, Gelb, Grün, Spieler 2 die Schlange Violett, Gelb. Eine Test-Karte legt Blau und Rot auf die Hand von Spieler 2, Gelb aus der eigenen Schlange, Violett aus der fremden Schlange und eine Handkarte von Spieler 2 in den Nachziehstapel. Lauf 1 hängt Blau, Rot an die Hand und legt Violett, Gelb, Handkarte oben auf den Stapel; Lauf 2 legt Rot, Blau an den Anfang der Hand, Gelb an Stelle 7 und Handkarte, Violett oben auf. Beide Läufe ergeben genau dasselbe Ereignis mit fünf Einträgen, jeder `"karteId":null`; die Id der Handkarte steht nirgends darin. Der Test „B2: die Reihenfolge verdeckt abgelegter Karten …“ war auf `570cfe1` rot (`zweiter-testcommit-rot.txt`) und ist nach dem Fix grün.

**Codex-Befunde 1 und 2** (eine offene Karte bzw. eine Fusion geht auf eine Hand; über `von` bzw. `von.fusionId` ist erkennbar, welche Karte es war). Mein Urteil: **kein Leck im Sinn von B2.** B2 schützt, was der Mensch nicht sieht: „Handkarten … der KI-Gegner sind für den Menschen nie sichtbar, auch nicht mittelbar“. Eine Karte, die offen in einer Schlange lag, kennt jeder am Tisch, und dass sie die Schlange verlässt, zeigt schon die Lage danach ohne jedes Ereignis: An ihrer Stelle fehlt sie, und eine Hand wird um eins grösser. `von` fügt dem nichts hinzu, was nicht offen am Tisch geschah; am echten Tisch sieht jeder, wer welche Karte aufnimmt. Ohne `von` liesse sich die Lage nicht nachrechnen. Die einzige echte Regel dieser Art ist A7.10 („Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand“, Erweiterung, X6); ob eine offen aufgenommene Karte danach als geheim gelten soll, ist eine Regelfrage an den Autor, keine Frage an E4b. Wichtig ist, was danach mit der Karte geschieht: Spielt der KI-Gegner sie später wieder aus, ist sie ohnehin offen; bleibt sie auf der Hand, weiss der Mensch, dass sie dort ist, wie am echten Tisch. Für den Hilfstest `verrateneHandkarten` gilt: Er würde Befund 2 als Treffer melden, weil die Fusions-Id als Text im Ereignis steht. Kommt eine solche Regel mit X6, muss der Test diese Ausnahme ausdrücklich kennen (Hinweis H3).

Codex-Befund 3 ist behoben (Test `570cfe1` rot, Fix `5914861`); Befund 4 (Auslagekarten werfen) ist Fail-Fast und betrifft erst X1/X2.

### 5. `UMGESETZT` aus dem Register

- Ableitung: `aktionen.test.ts` hat keine Hand-Liste mehr; `PLATZHALTER = ARTEN.filter(([art]) => istPlatzhalter(KARTENREGISTER[art]))`. `istPlatzhalter` prüft eine `WeakSet`, die `platzhalter()` füllt.
- Heute: `npx vitest run src/engine/__tests__/aktionen.test.ts -t Platzhalter --reporter=verbose` zeigt sieben D13-Tests (Regenbogenschlange, Schlangenfrass, Schlangenblockade, Farbendieb, Farbenfusion, Schlangenhäutung, Schlangenkorb des Glücks), Exit 0.
- Gegenprobe aus dem Auftrag: `src/engine/karten/schlangenblockade.ts` durch eine `KartenDefinition` ohne `platzhalter()` ersetzt, `aktionen.test.ts` unverändert. Danach sechs D13-Tests, Schlangenblockade fehlt, Exit 0. Datei zurückgesetzt.
- Eigene Gegenprobe: `istPlatzhalter` gibt immer `false` zurück. `npx vitest run src/engine/__tests__/aktionen.test.ts` Exit 0, 26 Tests, kein D13-Test mehr; die ganze Suite Exit 0. Das ist Mangel 1. Datei zurückgesetzt, `git status` leer.

### 6. Verhalten unverändert

`git diff origin/neuaufbau...HEAD` der Tests `reaktion.test.ts`, `schlangengrube.test.ts`, `verdoppler.test.ts`, `zugablauf_ausspielen.test.ts`, `zugablauf_nachziehen.test.ts`: je genau eine Zeile, in der `nach: { ort: 'Ablagestapel', spielerIndex: n }` um `position: 0` ergänzt ist. `zugablauf_ereignisse.test.ts` verliert seine eigene Nachrechenlogik an `nachrechnen.ts`; die Tests selbst bleiben. `aktionen.test.ts` siehe Kriterium 5. Der Dauerlauf (`dauerlauf.test.ts`, 300 Partien, Schwellen für Ansagen, Fragen, zweite Züge) läuft in `npm test` grün.

Gleicher Verlauf: Prüfdatei `E4b-determinismus.test.ts.txt` spielt die 300 Partien des Dauerlaufs (`dauerlaufPartien(150, false)` und `dauerlaufPartien(150, true, 151)`) mit dem Motor der Engine und hasht je Schritt Aktion und gespeicherten Zustand. Ergebnis auf `5914861` und auf `fb04ba9` (`git switch --detach fb04ba9`):

```
PRUEFSUMME a3339271b741763962a18f16df8db5b11e6b51716c999ee3830b6b8ec3abd885 AUSGAENGE {"beendet":300} SCHRITTE 51063
PRUEFSUMME a3339271b741763962a18f16df8db5b11e6b51716c999ee3830b6b8ec3abd885 AUSGAENGE {"beendet":300} SCHRITTE 51063
```

Identisch. Erwartbar, weil `wirke` den Zustand nur durchreicht und `findeKartenort` dieselben Orte liefert.

### 7. Gates und Entwicklertisch

Gates siehe unten. Entwicklertisch: siehe „Browserprüfung“.

## Gates

Jeder Befehl einzeln, Exit-Code in Git Bash mit `${PIPESTATUS[0]}` hinter `tee`, Logs unter `<scratchpad>/E4b-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 67 passed (67), Tests 1617 passed (1617) |
| `npm run typecheck` | 0 | `tsc -b` ohne Meldung |
| `npm run build` | 0 | built in 7.06s |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | keine Verstösse, verglichen mit Merge-Basis fb04ba9 |
| `npx eslint .` | 0 | ohne Meldung |
| `python scripts/regelcheck.py` | 0 | 9 Warnungen, keine Fehler |
| `npm run test:layout` | 1 | 1939 passed, 1 failed: `[desktop] geraeteklasse.spec.ts:14` „P0.3c: Fenster, Ausrichtung, Zeiger und Touch …“, gemessen `touch: true` statt `false` (`navigator.maxTouchPoints > 0`) |

Ports vor `test:layout`: um 10:38 ohne `ABHÖREN` auf 4173/4174 (vorher fremde Server aus `agent-afea44f8654d97b42`, gewartet). Der rote Test misst nur, ob das Desktop-Projekt Touch meldet; E4b ändert weder `tests/layout/`, `scripts/` noch `playwright.config.ts` (`git diff --stat fb04ba9 HEAD -- tests scripts playwright.config.ts` leer) und keine Oberfläche ausserhalb des Entwicklertischs.

Weil 4173/4174 danach wieder von fremden Servern belegt waren, habe ich den einen Vertrag mit einer eigenen Konfiguration (`pw-einzeln.config.mjs`, nur Projekt `desktop`, eigener `vite preview` auf 4181) dreimal wiederholt: 3 von 3 rot, jedes Mal `touch: true`. Ursache ist die Umgebung, nicht der Code: Ein leerer Chromium-Kontext (Playwright-eigenes Chromium 148.0.7778.96) meldet auf einer `data:`-Seite `navigator.maxTouchPoints` 10, mit und ohne `hasTouch: false` (`touch-umgebung.txt`). Der Rechner meldet Chromium also gerade Touch-Punkte; das trifft jeden Branch gleich. Als Mangel von E4b werte ich das nicht, das Gate ist aber nicht grün, und der Orchestrator sollte es vor dem Merge auf einer Umgebung ohne gemeldete Touch-Punkte wiederholen (H5). Eigener Server auf 4181 danach beendet (PID 49476, Befehlszeile aus diesem Worktree).

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
6f47154 test: E4b Ereignis KartenVersetzt und generischer Nachrechentest (rot)
16ca3f3 feat: E4b KartenVersetzt meldet, was eine Kartenwirkung bewegt
3e2eaac refactor: E4b Vergleich der Kartenorte vereinfacht (/simplify)
570cfe1 test: E4b verdeckt abgelegte Karten verraten die Stapelreihenfolge nicht (rot)
5914861 fix: E4b KartenVersetzt verrät die verdeckte Reihenfolge nicht mehr
```

`6f47154` enthält nur `aktionen.test.ts`, `kartenversetzt.test.ts`, `nachrechnen.ts` (Testhilfe unter `__tests__`) und `zugablauf_ereignisse.test.ts`. Auf diesem Stand: `npx vitest run` der drei Testdateien Exit 1, 17 rot plus `aktionen.test.ts` als Ganzes („TypeError: istPlatzhalter is not a function“); die übrigen rot wegen fehlendem Ereignis („E4b: Reagieren lässt sich nicht nachrechnen“) bzw. fehlender `position` („Saat 1, Schritt 14: SonderkarteWirkungslosAblegen …“). Rot, weil das Verhalten fehlt. `570cfe1` enthält nur `kartenversetzt.test.ts`, dort 1 von 11 rot („B2: die Reihenfolge verdeckt abgelegter Karten …“).

Spätere Änderungen an den Tests (`git diff 6f47154 HEAD -- src/engine/__tests__/`): Hilfen `ablage`/`hand` statt Inline-Code, Gegenprobe in zwei ausdrücklichen Schritten, ein neuer B2-Test, und in `aktionen.test.ts` die immer wahre Zusicherung `PLATZHALTER.length + umgesetzt.length === ARTEN.length` entfernt. Schwächer wurde dadurch nichts, was vorher wirkte; die fehlende wirksame Zusicherung ist Mangel 1.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
 src/engine/__tests__/aktionen.test.ts             |  13 +-
 src/engine/__tests__/kartenversetzt.test.ts       | 283 ++++++++++++++++++++++
 src/engine/__tests__/nachrechnen.ts               | 234 ++++++++++++++++++
 src/engine/__tests__/reaktion.test.ts             |   2 +-
 src/engine/__tests__/schlangengrube.test.ts       |   2 +-
 src/engine/__tests__/verdoppler.test.ts           |   2 +-
 src/engine/__tests__/zugablauf_ausspielen.test.ts |   2 +-
 src/engine/__tests__/zugablauf_ereignisse.test.ts | 147 +----------
 src/engine/__tests__/zugablauf_nachziehen.test.ts |   2 +-
 src/engine/aktionen/typen.ts                      |  35 ++-
 src/engine/index.ts                               |   1 +
 src/engine/karten/platzhalter.ts                  |  11 +-
 src/engine/kartenorte.ts                          | 114 +++++++++
 src/engine/reaktion.ts                            |  13 +-
 src/engine/zugablauf.ts                           |  18 +-
 src/entwicklung/Tisch.tsx                         |  15 +-
 16 files changed, 729 insertions(+), 165 deletions(-)
```

| Datei | im Feld | Urteil |
|---|---|---|
| `src/engine/aktionen/typen.ts` | ja | `Kartenort` erweitert (`position` am Ablagestapel, `UnterFusion`, `Hand`, `Nachziehstapel`), `Versetzung`, Ereignis `KartenVersetzt` |
| `src/engine/reaktion.ts` | ja | ein Haken `wirke` für beide Pfade |
| `src/engine/__tests__/zugablauf_ereignisse.test.ts` | ja | Nachrechenlogik nach `nachrechnen.ts` verschoben |
| `src/engine/__tests__/aktionen.test.ts` | ja | Liste aus dem Register |
| `src/engine/index.ts` | ja | Export `Versetzung` |
| `src/engine/kartenorte.ts` (neu) | nein | trägt: eigene Verantwortung (Orte aufzählen, vergleichen), hält `reaktion.ts` klein; 114 Zeilen |
| `src/engine/zugablauf.ts` | nein | trägt: `findeKartenort` nutzt `alleKartenorte`, sonst gäbe es zwei Aufzählungen der Orte; Verhalten gleich (wirft weiter für Hand und Stapel), Ablagestapel jetzt mit `position` |
| `src/engine/karten/platzhalter.ts` | nein | trägt: die Markierung ist für Kriterium 5 nötig; keine Kartendatei sonst berührt |
| `src/engine/__tests__/nachrechnen.ts` (neu) | nein | trägt: `zugablauf_ereignisse.test.ts` hätte sonst 499 Zeilen überschritten, und Kartentasks sollen die Hilfe importieren |
| `src/engine/__tests__/kartenversetzt.test.ts` (neu) | nein | trägt: die Tests des Tasks, gleicher Grund |
| `reaktion.test.ts`, `schlangengrube.test.ts`, `verdoppler.test.ts`, `zugablauf_ausspielen.test.ts`, `zugablauf_nachziehen.test.ts` | nein | trägt: je genau eine Zeile `position: 0`, Folge der Schnittstelle |
| `src/entwicklung/Tisch.tsx` | nein | trägt: erschöpfender `switch` über `Kartenort`, ohne die neuen Fälle bricht `typecheck`; Ereignistext für `KartenVersetzt` |

U10: `package.json` unverändert. U13: `typen.ts` steht im Feld; `register.ts` und `GAME_SPEC.md` sind nicht berührt. U9: die neuen Dateien haben keinen Kopf mit Autor oder Datum und keine `// ÄNDERUNG`-Kommentare. U11: kein Code aus Altprojekten erkennbar. U2: keine neue Spielregel; die Ordnung der verdeckten Einträge ist eine Festlegung zum Geheimnis nach B2, keine Regel.

## Gegenprobe

Siehe Kriterium 3 (G1, G2, P5) und Kriterium 5. Zusammengefasst: Ereignis unterdrückt → 10 Tests rot; Reihenfolgeerkennung abgeschaltet → „A7.9 …“ rot; Platzhalter durch Test-Definition ersetzt → Liste ändert sich von selbst; `istPlatzhalter` immer falsch → **alles grün** (Mangel 1). Nach jeder Gegenprobe `git checkout -- <datei>`, `git status` leer.

## Browserprüfung

Testhook-Build (`npm run build:testhooks`, Exit 0), eigener Server `npx vite preview --outDir dist-testhooks --port 4180 --strictPort`, weil 4173/4174 von fremden Servern belegt waren. Mit Maus im eingebauten Browser (1280×900) und mit Playwright Chromium 1.60.0 (Desktop-Klasse aus `scripts/pruefung/geraeteklassen.mjs`, Skript `tisch.mjs`).

- `verdoppler`: Klick „VerdopplerSpielen: Verdoppler (verdoppler-03)“ → „KarteGespielt: Spieler 1 (spieler-1), verdoppler-03 (VerdopplerSpielen) → Ablagestapel von Spieler 1 (spieler-1), Stelle 0“; unten „Ablagestapel: 1 Karten“. Weiter Rot, „ZugBeenden“ (Teilzug 2), dann „SonderkarteWirkungslosAblegen“ mit verdoppler-02 → „… → Ablagestapel von Spieler 1 (spieler-1), Stelle 1“. Plausibel: die zweite Karte auf dem Stapel hat Stelle 1.
- `schlangengrube`: „SchlangengrubeSpielen“ auf KI-Gegner 1, „Reagieren“ → „AnsageEntschieden: schlangengrube-03 von Spieler 1 (spieler-1) wirkt, niemand hat abgewehrt → vor KI-Gegner 1 (spieler-2)“; kein `KartenVersetzt`, richtig, weil die Grube nichts anderes bewegt. Danach Farbkarte und „ZugBeenden“ → „KartenGezogen: Spieler 1 (spieler-1) zieht 2“, „Ausgesetzt: KI-Gegner 1 (spieler-2) setzt aus; schlangengrube-03 auf den Ablagestapel von Spieler 1 (spieler-1)“, „ZugBegonnen: KI-Gegner 2 (spieler-3), Teilzug 1“.
- Zufallspartie `start-erweiterung`, 16 Schritte mit „KI-Schritt“ oder Aktionen von Spieler 1: unter anderem Verdoppler „→ Ablagestapel … Stelle 0“, Farbkarten „→ schlange-2 von Spieler 1 (spieler-1), Stelle 1“, KI-Gegner legen „farbendieb-04 (SonderkarteWirkungslosAblegen) → Ablagestapel von KI-Gegner 1 (spieler-2), Stelle 0“. Alle Orte lesbar, Stellen ab 0.
- Konsolenfehler: 0 (Playwright `console`/`pageerror`, eingebauter Browser `read_console_messages`). `scrollWidth` = `clientWidth` = 1280 in allen drei Szenarien.

Den Text von `KartenVersetzt` und die Orte „unter … in …“, „Hand von …“ und „Nachziehstapel“ konnte ich im Browser nicht auslösen, weil noch keine echte Karte andere Karten bewegt; im Code (`Tisch.tsx`) lautet er „KartenVersetzt durch <karteId> von <Spieler>: <karteId oder ‚verdeckte Karte‘>: <von> → <nach>; aufgelöst: …“, abgesichert nur durch `typecheck`.

### Desktop 1280×900 – `bilder/E4b-verdoppler-desktop.png`

Oben die Leiste „Entwicklertisch Start Szenarien Entwürfe“, darunter der Kasten „Szenario verdoppler“ mit der gelb hinterlegten Beschreibung und Erwartung, vollständig lesbar umbrochen. „Schritt 1“ mit „Schritt zurück“ und „Von vorn“, „KI-Schritt“ ausgegraut mit „Spieler 1 entscheidet; das ist ein Mensch.“ Unter „Aktionen der Engine (3)“ zwei Knöpfe „FarbkarteLegen: Feuerkeim (rot-05) → neue Schlange“ und „… Wasserwirbel (blau-01) → neue Schlange“, darunter „ZugBeenden“. „Ereignisse des letzten Schritts (1)“: „1. KarteGespielt: Spieler 1 (spieler-1), verdoppler-03 (VerdopplerSpielen) → Ablagestapel von Spieler 1 (spieler-1), Stelle 0“. Darunter „Invarianten (alle erfüllt)“ mit elf grünen Zeilen. Nichts abgeschnitten oder überlappend, keine waagrechte Bildlaufleiste.

### Desktop 1280×900 – `bilder/E4b-schlangengrube-desktop.png`

Gleicher Aufbau für „Szenario schlangengrube“, „Schritt 2“. Vier Knöpfe „FarbkarteLegen“ (Wasserwirbel blau-15, Feuerkeim rot-06, Sonnenblatt gelb-06, Waldspross gruen-08, je „→ neue Schlange“) in zwei Reihen, „ZugBeenden“. Ereignis: „1. AnsageEntschieden: schlangengrube-03 von Spieler 1 (spieler-1) wirkt, niemand hat abgewehrt → vor KI-Gegner 1 (spieler-2)“. Invarianten erfüllt. Text vollständig, nichts verdeckt.

Andere Geräteklassen entfallen: E4b ändert ausser dem Entwicklertisch keine Oberfläche, und der Auftrag verlangt nur Desktop.

Server danach beendet: Hintergrundaufgabe gestoppt, PID 69636 lauschte danach noch auf 4180; Befehlszeile `…\worktrees\agent-a93a951f76d2e5c63\node_modules\…\vite.js preview --outDir dist-testhooks --port 4180 --strictPort` (eigener Worktree), `Stop-Process -Id 69636`, danach kein `ABHÖREN` auf 4180. Den Browser-Tab habe ich geschlossen.

## Satz-für-Satz-Abdeckung

E4b setzt keine Regel aus Teil A um; die genannten Grundlagen sind B2 und Plan E2, Kriterium 11.

| Spec-Abschnitt | Regelaussage | Test (Datei › Name) |
|---|---|---|
| B2 | Handkarten der KI-Gegner sind für den Menschen nie sichtbar, auch nicht mittelbar. | `kartenversetzt.test.ts` › „B2: eine Karte aus der Schlange und eine vom Stapel gehen auf Hände; das Ereignis nennt Ort, aber keine Id“; `verrateneHandkarten` in jedem Schritt von `spiele()`; eigene Probe P4 |
| B2 (Nachziehstapel) | Die Reihenfolge im Nachziehstapel bleibt verdeckt. | `kartenversetzt.test.ts` › „B2: die Reihenfolge verdeckt abgelegter Karten verrät nicht, wie sie im Nachziehstapel liegen“; P4 |
| E2 Krit. 11 | Ereignisse zu jeder Aktion, damit die Oberfläche keine Zustände vergleichen muss. | `zugablauf_ereignisse.test.ts` (Zufallspartien mit `spieleNach`), `kartenversetzt.test.ts` (alle 11), Gegenprobe „E4b Gegenprobe: ohne KartenVersetzt …“ |
| A7.4 (Fall) | gefressene Karten auf den Ablagestapel des Angreifers, leere Schlange verschwindet, Fusion durch ihre Karten ersetzt | „A7.4: die Karten kommen in fester Reihenfolge …“, „A7.4: eine leer gefressene Schlange …“, „A7.4/A7.7: eine gefressene Fusion …“ (Test-Karten, nicht die Regel selbst) |
| A7.7 (Fall) | Fusion legt zwei Karten unter sich | „A7.7: eine Fusion in der eigenen Schlange …“ (Test-Karte) |
| A7.1 (Fall) | Karte in eine (neue) eigene Schlange | „E4b/A6: nach der Ansage …“, „E4b/A7.1: die neue Schlange …“ (Test-Karte) |
| A7.9 (Fall) | Umordnen | „A7.9: beim Umordnen …“ (Test-Karte) |

Die Regeln von A7.1, A7.4, A7.7 und A7.9 selbst gehören zu E5 bis E9; hier sind nur ihre Bewegungen als Test-Karten abgebildet.

## Eigene Grenzfälle

1. **Teilweise Abwehr (P1, TF-ENGINE-027).** Weil das Kriterium es nennt und der Umsetzer es nicht testet. Ergebnis: nur die Karte des Nicht-Abwehrenden genannt, Ereignis direkt vor `AnsageEntschieden`, nachrechenbar.
2. **Zwei Schlangen zweier Spieler, Fusion wechselt den Besitzer, Ablagekarte in eine Schlange (P2, TF-ENGINE-028).** Viele Orte in einer Wirkung, Unterkarten wechseln Behälter. Nachrechenbar.
3. **Drehung A, B, C, D → B, C, D, A (P3, TF-ENGINE-028).** Grenzfall des stellenweisen Vergleichs. Nachrechenbar, aber alle vier Karten genannt (H2).
4. **Verdeckte Ziele in verschiedener Anordnung, Handkarte in den Stapel (P4, TF-ENGINE-029).** Gleiches Ereignis, keine Id.
5. **Eine ganze Schlange wechselt den Besitzer (P6).** Keine Regel tut das; ich wollte wissen, ob der generische Weg trägt. Das Ereignis nennt beide Karten mit `nach.spielerIndex: 0`, aber `spieleNach` behält wegen `??=` den alten Besitzer: nachgerechnet `{"schlange-1":{"besitzer":1,…}}`, Zustand `besitzer: 0`. Kein Mangel von E4b (keine Regel, die Information steht im Ereignis), aber eine Lücke in der Testhilfe (H1).
6. **Gleiche Saat, gleicher Verlauf über 300 Partien (TF-ENGINE-031).** Siehe Kriterium 6.

## Testregister

Alle geänderten Dateien fallen in bestehende Bereiche: `src/engine/**` → ENGINE, `src/entwicklung/**` → DEV. Neue Testfälle, weil keiner der vorhandenen `KartenVersetzt` oder die Platzhalterliste abdeckt:

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-ENGINE-026 | KartenVersetzt nachrechenbar (automatisch, `kartenversetzt.test.ts`) | `2026-11-21-1045-TF-ENGINE-026` | bestanden |
| TF-ENGINE-027 | Grenzfall: teilweise Abwehr | `2026-11-21-1045-TF-ENGINE-027` | bestanden |
| TF-ENGINE-028 | Grenzfall: zwei Schlangen zweier Spieler, Fusion, Drehung | `2026-11-21-1045-TF-ENGINE-028` | bestanden |
| TF-ENGINE-029 | Grenzfall: B2 bei mehreren verdeckten Zielen | `2026-11-21-1045-TF-ENGINE-029` | bestanden |
| TF-ENGINE-030 | Platzhalterliste aus dem Register, kaputte Ableitung fällt auf | `2026-11-21-1045-TF-ENGINE-030` | fehlgeschlagen |
| TF-ENGINE-031 | 300 Partien wie auf der Basis | `2026-11-21-1045-TF-ENGINE-031` | bestanden |
| TF-DEV-025 | Ortstexte am Entwicklertisch | `2026-11-21-1045-TF-DEV-025` | bestanden |

Die Abschnitte „Worum es geht“, „Bestanden, wenn“ und „Fehlgeschlagen, wenn“ gingen vor den Läufen durch `/baseline:humanizer` und `pruefe_muster.py` (Exit 0, ein Hinweis „absolutheit“ in TF-ENGINE-030, umformuliert). Einen Tagebucheintrag zu E4b gibt es nicht, deshalb ohne `--eintrag`.

## Hinweise (kein Mangel)

- **H1** `spieleNach` (`nachrechnen.ts`, `lege`, Fall `Schlange`) legt eine bestehende Schlange mit `??=` nicht neu an und übernimmt deshalb keinen Besitzerwechsel (P6). Keine Regel tut das heute; kommt eine, braucht die Testhilfe eine Zeile.
- **H2** Der Reihenfolgevergleich in `versetzungen` arbeitet stellenweise. Bei einer Drehung nennt er alle Karten statt nur der einen, die wandert. Korrekt für das Nachrechnen, für eine Animation aber mehr Bewegung als nötig. Der Kommentar in `typen.ts` („wer nur nachrückt, fehlt“) gilt nur für Nachrücken durch Entfernen oder Einfügen von aussen.
- **H3** Codex-Befunde 1 und 2: kein Leck (siehe Kriterium 4). Mit X6 (A7.10, Tausch Schlange ↔ Hand) muss `verrateneHandkarten` offen aufgenommene Karten ausdrücklich zulassen, sonst meldet der Hilfstest einen Treffer, und der Autor sollte gefragt werden, ob eine offen aufgenommene Karte als geheim gilt.
- **H4** Der Task-Block E4b fehlt in `docs/UMSETZUNGSPLAN.md`; Kriterien und Feld „Dateien“ standen nur im Auftrag an den Prüfer.
- **H5** `test:layout` ist auf diesem Rechner zurzeit für `[desktop] geraeteklasse.spec.ts` rot, weil Chromium auch ohne `hasTouch` 10 Touch-Punkte meldet. Das betrifft alle Branches und jede parallele Prüfung; Gate auf einer Umgebung ohne gemeldete Touch-Punkte wiederholen oder den Vertrag die Touch-Emulation ausdrücklich abschalten lassen (Entscheidung des Orchestrators).
