# Prüfprotokoll X2c – Aufgaben: Sonderkarten und Häutung (X2 Paket C)

| Feld | Wert |
|---|---|
| Task | X2 Paket C: Fusionsexperte, Schlangenbeschwörer, Schlangenmeister, Schlangenrepertoire, Schlangentanz |
| Branch | `task/X2c-aufgaben-sonderkarten`, PR #109 gegen `neuaufbau` |
| Geprüfter Stand | `b4942251` (Basis `589e2a72`, `origin/neuaufbau` steht auf `4b449966`) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 23.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: 409 Dateien mit `w/crlf` nach dem Auschecken, alle getrackten Dateien gelöscht und neu geholt (`.gitattributes` mit `eol=lf`), danach 0. `core.hooksPath` zeigt `scripts/githooks` (gesetzt für alle Worktrees). `npm ci` Exit 0.

## Urteil: ABGENOMMEN

Alle Kriterien für die fünf Aufgaben sind mit Tests, drei Gegenproben, einer eigenen vollen Suche über alle Jokerfarben, einer eigenen Prüfsumme ohne Erweiterung und Klicks am Entwicklertisch belegt; alle Gates enden mit 0, der erste Commit enthält nur Tests und ist rot. Die Umsetzung stützt sich an vier Stellen auf Auslegungen, die Teil A und Teil D nicht wörtlich hergeben (Abschnitt „Auslegungsfragen“). Sie sind folgerichtig umgesetzt und hier mit Beispielen für die Rückfrage an den Autor aufbereitet; nach dem Auftrag des Orchestrators sind sie kein Ablehnungsgrund.

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Plan) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | A9: Joker zählen bei jeder Aufgabe als die Farbe, mit der sie erfüllt ist; derselbe Joker darf bei zwei Aufgaben verschiedene Farben haben. | ja (für Paket C) | „A9 Nr. 12/A7.3: mit Regenbogenschlange: sie zählt als Gelb … in der Wertung zählt sie als Braun“; der Zustand speichert keine Jokerfarbe |
| 2 | Je Aufgabe eine Entscheidungstabelle mit mindestens sechs Stellungen als Tests: erfüllt, knapp nicht, mit Regenbogenschlange, mit Farbenfusion, mit Blockade dazwischen, über zwei Schlangen. | ja | Tabellen mit 9, 8, 8, 8 Zeilen und 12 Schlangentanz-Tests; Begründung bei Schlangenrepertoire trägt |
| 3 | Jedes Beispiel aus A9 ist ein Test (zu diesen Aufgaben). | ja | „A9 Nr. 12/A7.9: Spieler 1 häutet die letzten 5 Karten …“ und Szenario `aufgabe-schlangentanz` |
| 4 | Eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt. | ja | „A9/A7.3: „Schlangentanz“ bleibt erfüllt und bringt 7 Punkte, obwohl die Regenbogenschlange in der Wertung als Braun zählt“ |
| 7 | Schlangentanz (aus E9 verschoben): Die Engine hält fest, wie viele neue Dreiergruppen eine Schlangenhäutung bildet, nach der Antwort auf G4. | ja | Zähler `schlangenhaeutungDreiergruppen`, Tests zu D37 (eigene Häutung, eigene Schlange, eine Häutung), Gegenprobe 1, volle Suche ohne Abweichung |
| – | Satz-für-Satz-Abdeckung der Kartentexte | ja | Tabelle unten; einzig der Schlangenkorb (D36) ist bis X6 nicht spielbar |
| – | je ein Szenario am Entwicklertisch, das mit echten Karten einlöst | ja | fünf Szenarien per Klick, Bilder `X2c-dev-*-desktop.png` |
| – | Speichern/Laden erhält die Zähler | ja | „A9: Speichern und Laden erhält, was jeder ausgespielt hat“, „A9 Nr. 12: Speichern und Laden erhält die Zahl neuer Dreiergruppen“; Invariante „übersteht Speichern und Laden“ in jedem Schritt der Zufallspartie |
| – | Partien ohne Erweiterung unverändert | ja | eigene Prüfsumme über 300 Partien (Saaten 5001–5300), Basis und Task-Stand gleich |

### 1. Jokerfarbe je Aufgabe

Von den fünf Aufgaben liest nur Schlangentanz Jokerfarben; Fusionsexperte, Schlangenbeschwörer und Schlangenmeister zählen Joker als Sonderkarten, Schlangenrepertoire liest gar keine Schlange. `neueDreiergruppen.ts` sucht die Belegung der Joker mit den meisten neuen Gruppen, unabhängig von jeder anderen Aufgabe und von der Wertung. Der Test „mit Regenbogenschlange“ zeigt dieselbe Regenbogenschlange für Schlangentanz als Gelb (2 neue Gruppen) und in `berechneEndwertung` als Braun. Der Spielzustand (`types.ts`: `Schlange` hat nur `karten` und `fusionen`) hält keine Jokerfarbe fest, deshalb kann keine Aufgabe die Farbe einer anderen festlegen. Den Vergleich zweier Aufgaben mit Jokerfarbe kann Paket C nicht zeigen, weil es keine zweite solche Aufgabe enthält; er gehört zu den Paketen A und B oder zu X7.

### 2. Entscheidungstabellen

- Fusionsexperte (`A9_aufgaben_sonderkarten.test.ts`): 9 Zeilen, darunter erfüllt, knapp nicht (eine Fusion und zwei blaue Karten), Regenbogenschlange ist keine Fusion, zwei Fusionen direkt nebeneinander, Blockade zwischen den Fusionen, je eine Fusion in zwei Schlangen (nicht erfüllt), zweite Fusion beim Gegner; dazu ein Gegnerfall.
- Schlangenbeschwörer: 8 Zeilen, darunter 4 gegen 3 Sonderkarten, vier Regenbogenschlangen, Fusion als eine Karte (die zwei Karten darunter zählen nicht), Blockaden, zwei plus zwei über zwei Schlangen, Gegnerschlange.
- Schlangenmeister: 8 Zeilen, darunter 4 gegen 3 ausgespielt, zwei gleiche gegen zwei verschiedene Arten, Regenbogenschlange plus Fusion, Blockade als eine der zwei, je eine in zwei Schlangen, Gegnerschlange, vom Gegner ausgespielt.
- Schlangenrepertoire (`A9_aufgaben_ausgespielt.test.ts`): 8 Zeilen. „Blockade dazwischen“ und „über zwei Schlangen“ sind im Test als sinnlos begründet, weil die Aufgabe keine Reihe und keine Schlange liest. Die Begründung trägt: Der Kartentext („Spiele … aus“) nennt nur ausgespielte Karten. Die Ersatzzeilen prüfen etwas Sinnvolles, nämlich dass Sonderkarten, die in den Schlangen liegen, nicht als ausgespielt zählen (fünf Arten in der Schlange, vier ausgespielt: nicht erfüllt).
- Schlangentanz (`A9_aufgaben_schlangentanz.test.ts`): Beispiel, knapp nicht (nur Violett neu), Regenbogenschlange als Gelb, Gegenprobe mit Rot statt Joker, Fusion als Gelb, Blockade zwischen den Roten, zwei Häutungen in zwei Schlangen mit je einer Gruppe, Häutung in der Gegnerschlange, dazu vier Fälle zu „neu“ (Verlängerung, stehengebliebene Gruppe, Nachbar ausserhalb, abgegebene Karte) und ein Laufzeittest mit acht Jokern.

### 3. Beispiele aus A9

Zu den fünf Aufgaben hat A9 nur das Beispiel zu Schlangentanz. Der Test häutet die letzten fünf Karten zu Rot, Rot, Violett, Violett, Violett, prüft die Schlange danach wörtlich gegen A9, den Zähler 2 und das Ereignis `AufgabeErfuellt`. Am Entwicklertisch habe ich dasselbe geklickt (unten).

### 4. Erfüllt bleibt erfüllt

Der Rahmen aus X1 legt eingelöste Aufgaben in `erfuellteAufgaben` und prüft sie nie wieder. Der Test „„Schlangentanz“ bleibt erfüllt und bringt 7 Punkte …“ löst mit der Regenbogenschlange als Gelb ein und wertet danach mit ihr als Braun: `aufgaben` enthält Schlangentanz, `aufgabenPunkte` 7. Als geheime Aufgabe gilt dasselbe verdeckt (D35-Test). Mein Grenzfall 1 zeigt die Gegenrichtung für eine noch nicht eingelöste Aufgabe: Wird eine Fusion gefressen, gilt Fusionsexperte für ihn nicht mehr.

### 7. Neue Dreiergruppen einer Häutung

`schlangenhaeutung.ts` merkt sich die Schlange vor der Häutung und ruft `merkeHaeutung` mit vorher und nachher. Gezählt wird nur mit Erweiterung und nur, wenn der Spieler in seiner eigenen Schlange häutet (D37, Teil 1); festgehalten wird der Höchstwert einer einzelnen Häutung, nicht die Summe (D37, Teil 2). Tests: „über zwei Schlangen: zwei Häutungen … genügen nicht“ (Zähler 1), „eine Häutung in der Schlange des Gegners erfüllt die Aufgabe für niemanden“ (beide Zähler 0). Was „neu“ heisst, sagt D37 nicht; dazu Auslegungsfrage 2.

Eigene Gegenprobe der Suche (temporäre Testdatei, Beleg `…-TF-ENGINE-064-4.txt`): Für jeden Joker jede der sechs Farben oder keine, vorher und nachher gleich, mit derselben Regel für „neu“. 3'000 Zufallshäutungen mit bis zu fünf Jokern und Blockaden, 819 davon mit neuen Gruppen, 0 Abweichungen von `neueDreiergruppen`. Laufzeit mit acht Jokern in sechs ungünstigen Anordnungen (Joker abwechselnd mit gleichfarbigen Karten auf beiden Seiten des Abschnitts, Jokerblöcke von vier): höchstens 1.4 ms. Der Befund aus dem Codex-Review (23 s) ist damit behoben.

## Gates

Jeder Befehl einzeln, Exit-Code mit `${PIPESTATUS[0]}` hinter `tee`, Logs unter `<scratchpad>/X2c-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 143 passed, Tests 2624 passed |
| `npm run typecheck` | 0 | `tsc -b` ohne Ausgabe |
| `npm run build` | 0 | built in 833ms |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | 401 Dateien, keine Verstösse, verglichen mit Merge-Basis 589e2a7 |
| `npx eslint .` | 0 | keine Ausgabe |
| `python scripts/regelcheck.py` | 0 | 8 Warnungen, keine Fehler (TF-KI-013 nie bestanden, BOM in drei Belegen, `tests/layout/messung.ts` 929 Zeilen; alle schon vorher da) |
| `npm run test:layout` | 0 | 2200 passed (5.1m) |

Ports vor `test:layout`: `netstat` ohne `LISTENING`/`ABHÖREN` auf 4173 und 4174; danach wieder frei.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
8b536f12 test: X2c Aufgaben Sonderkarten und Häutung zuerst als rote Tests
b8024850 feat: X2c Fusionsexperte, Schlangenbeschwörer, Schlangenmeister, Schlangenrepertoire und Schlangentanz
95f6000c test: X2c Codex-Befunde zu neuen Dreiergruppen als rote Tests
9899de5b fix: X2c neue Dreiergruppen zählen jede neue Gruppe und suchen schnell
b4942251 refactor: X2c neue Dreiergruppen in eine eigene Aufgabendatei
```

`8b536f12` enthält nur `aufgaben_c_hilfen.ts` (Testhilfe) und vier Testdateien. Auf diesem Commit: `npx vitest run` der vier Dateien endet mit 1, „Tests 63 failed | 4 passed (67)“. Rot wegen fehlenden Verhaltens: „Die Aufgabe Fusionsexperte ist noch ein Platzhalter“, „expected [] to deeply equal [ 'Regenbogenschlange' ]“, „Das Szenario aufgabe-fusionsexperte fehlt“. Die vier grünen sind Schutztests, die schon vorher galten (Überhand ist kein Ausspielen, ohne Erweiterung nichts gezählt, Verlängerung nicht neu, Häutung beim Gegner zählt nicht). `git diff 8b536f12 HEAD` über die Testdateien zeigt nur Umbau der Hilfen und zwei neue Tests; keine Erwartung wurde schwächer.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`: 19 Dateien, 1004 Einfügungen, 25 Löschungen. Feld „Dateien“ von X2: `src/engine/aufgaben/<name>.ts` je Aufgabe, gemeinsame Helfer in `jokerGruppen.ts`.

| Datei | im Feld | Urteil |
|---|---|---|
| `src/engine/aufgaben/fusionsexperte.ts`, `schlangenbeschwoerer.ts`, `schlangenmeister.ts`, `schlangenrepertoire.ts`, `schlangentanz.ts` | ja | |
| `src/engine/aufgaben/neueDreiergruppen.ts` (neu) | nein, Helfer | trägt: Aufgabenregel statt Wertung, `jokerGruppen.ts` bliebe sonst über 400 Zeilen und kollidierte mit Paket A und B; `jokerGruppen.ts` ist unverändert |
| `src/engine/aufgaben/sonderkartenZaehler.ts` (neu) | nein, Helfer | trägt: führt beide Zähler und `sonderkartenInSchlangen` für zwei Aufgaben |
| `src/engine/zugablauf.ts` | nein | trägt: `zaehleGespielteKarte` ist die eine Stelle, durch die jede Handkarte im eigenen Zug geht (auch angesagte und wirkungslos abgelegte); `reaktion.ts` und `legeWirkungslosAb` rufen sie. Eine Zeile Aufruf, dazu die Spielersuche |
| `src/engine/reaktion.ts` | nein | trägt: Farbenschutz zur Abwehr läuft nicht über `zaehleGespielteKarte`; ein Aufruf |
| `src/engine/karten/schlangenhaeutung.ts` | nein | trägt: nur die Wirkung kennt die Reihenfolge vorher und nachher; nicht aufgerufen, wenn abgewehrt |
| `src/engine/types.ts` | nein | trägt: nur die zwei Kommentare der Zähler |
| `src/entwicklung/szenarienAufgabenC.ts` (neu), `szenarien.ts`, `szenarienAufgabenC.test.ts` | nein | trägt: Szenarien verlangt der Auftrag |
| `src/engine/__tests__/…` (vier Dateien, eine Hilfe) | Tests | |
| `src/ki/sicht_simulation.test.ts` | nein | trägt, siehe unten |

`sicht_simulation.test.ts`: Der K2-Test vergleicht nach einer eigenen Aktion die Sicht aus der Simulation mit der echten. Er lässt schon vorher alle Aktionen weg, die verdeckte Karten ziehen. Löst eine Aktion jetzt eine Aufgabe ein, deckt die Engine die nächste vom verdeckten Aufgabenstapel auf; die Simulation kann sie nur erraten. Nur in diesem Fall nimmt der Test `offeneAufgaben` aus dem Vergleich. Ich habe gezählt: 4 von 569 Proben betroffen (temporär instrumentierte Kopie). Alles Übrige, auch erfüllte Aufgaben, Zähler und Schlangen, wird weiter verglichen. Die Aussage „keine verdeckte Information“ prüfen andere Tests (`mischeVerborgenes`, `verborgeneIds`); sie sind unverändert. Die Aussage wird also nicht geschwächt, nur in 4 Proben etwas weiter gefasst als nötig (Hinweis 3).

U10: `package.json` unverändert. U13: `GAME_SPEC.md`, `tests/spec_documentation*.ts`, `aktionen/typen.ts`, `karten/register.ts` unverändert. U9: neue Dateien ohne Kopf und ohne `ÄNDERUNG`-Kommentar. U11: nichts aus Altprojekten. U2: siehe Auslegungsfragen.

## Gegenprobe

1. `src/engine/aufgaben/schlangentanz.ts`: `MINDEST_NEUE_GRUPPEN = 2` → `1`, und `src/engine/aufgaben/sonderkartenZaehler.ts`: `if (!zustand.erweiterung || spielerIndex !== besitzer) return;` → `if (!zustand.erweiterung) return;`. `npx vitest run src/engine/__tests__/regeln/A9_aufgaben_schlangentanz.test.ts`: Exit 1, 4 rot: „knapp nicht …“, „Gegenprobe ohne Joker …“, „mit Blockade dazwischen …“ (je „expected true to be false“), „eine Häutung in der Schlange des Gegners …“ („D37: Spieler 1 hat nicht in einer eigenen Schlange gehäutet: expected 2 to be +0“).
2. `src/engine/reaktion.ts`: Aufruf `merkeAusgespielteSonderkarte(…, 'Farbenschutz')` entfernt. `A9_aufgaben_ausgespielt.test.ts`: Exit 1, 3 rot, darunter „D36: KI-Gegner 1, Farbenschutz zur Abwehr ausserhalb seines Zuges: expected [] to deeply equal [ 'Farbenschutz' ]“.

Danach `git checkout --` beider Dateien, `git status` ohne Änderung im Code.

## Browserprüfung

Testhook-Build mit `vite build --mode testhooks` in den Scratchpad, `vite preview` auf Port 4197 (eigener Port, weil 4173/4174 zu der Zeit von `test:layout` belegt waren). Eingebauter Browser, 1280×900, echte Klicks auf die Aktionsknöpfe; Zustand mit `get_page_text` und den `data-testid`-Feldern abgelesen. Danach dieselben Klicks mit Playwright (Desktop 1280×900) für die Bilder.

- `aufgabe-fusionsexperte`: Es gibt nur einen Knopf „FusionLegen“ (auf rot-02, rot-03). Klick: KartenVersetzt, KarteGespielt, AufgabeErfuellt „Spieler 1 nimmt Fusionsexperte (aufgabe-07)“, AufgabeAufgedeckt Farbkombination. Schlange Gelb, Farbenfusion, Gelb, Farbenfusion; „Ausgespielte Sonderkarten: Farbenfusion“. Wertung Gelb×4 = 6 (zwei Gelb zu 1 und zwei Fusionen zu je 2, D30), Aufgaben 6, Summe 12: plausibel.
- `aufgabe-schlangenbeschwoerer`: Klick „RegenbogenschlangeLegen“ an schlange-2 Stelle 0. AufgabeErfuellt Schlangenbeschwörer (aufgabe-08). Sonderkarten danach: Regenbogenschlange in schlange-1, Regenbogenschlange, Schlangenblockade, Farbenfusion in schlange-2, also vier.
- `aufgabe-schlangenmeister`: Klick „SchlangengrubeSpielen“: KarteAngesagt, AbwehrGefragt, kein AufgabeErfuellt; ausgespielt bei Spieler 1 schon „Regenbogenschlange, Farbenschutz, Verdoppler, Schlangengrube“. Klick „Reagieren“ mit farbenschutz-01 (KI-Gegner 1): Abgewehrt, AnsageEntschieden ohne Wirkung, AufgabeErfuellt Schlangenmeister (aufgabe-09). KI-Gegner 1: „Schlangenblockade, Farbenschutz“. In der Schlange liegen die Blockade des Gegners und eine Regenbogenschlange.
- `aufgabe-schlangenrepertoire`: Klick „SonderkarteWirkungslosAblegen“ (farbenschutz-01): AufgabeErfuellt Schlangenrepertoire (aufgabe-10), fünf Arten, Ablagestapel 4 Karten.
- `aufgabe-schlangentanz`: vorher „Dreiergruppen durch Häutung: 0“, 238 Häutungsknöpfe. Klick auf den Knopf „… Feuerkeim (rot-04), Feuerkeim (rot-05), Mondranke (violett-02), Mondranke (violett-03), Mondranke (violett-04)“: KartenVersetzt (rot-05 von Stelle 9 nach 7, violett-02 nach 8, violett-03 nach 9), KarteGespielt, AufgabeErfuellt Schlangentanz (aufgabe-12), AufgabeAufgedeckt. Schlange Blau, Grün, Grün, Blau, Grün, Rot, Rot, Rot, Violett, Violett, Violett wie A9; „Dreiergruppen durch Häutung: 2“; Wertung Rot×3 = 3, Violett×3 = 6.
- Zufallspartie `/dev?seed=11&spieler=3&erweiterung=1`: im eingebauten Browser Rot als neue Schlange, ZugBeenden, vier Mal „KI-Schritt (solide)“; KI-Gegner 2 spielt einen Verdoppler, „Ausgespielte Sonderkarten: Verdoppler“ erscheint bei ihm. Playwright spielte dieselbe Partie bis „Partiephase Beendet“ nach 174 Schritten weiter (Mensch: Häutung, wenn angeboten, sonst erste oder letzte Aktion; KI solide): 0 Schritte mit verletzter Invariante, eine Häutung, KI-Gegner 1 nimmt in Schritt 62 Schlangenmeister, 0 Konsolenfehler.

In allen Läufen „Invarianten (alle erfüllt)“, 0 Konsolenfehler, `scrollWidth` = `clientWidth` (1265/1265 im eingebauten Browser, 1280/1280 in Playwright).

### Entwicklertisch Desktop 1280×900 – `bilder/X2c-dev-fusionsexperte-desktop.png`, `-schlangenbeschwoerer-`, `-schlangenmeister-`, `-schlangenrepertoire-`, `-schlangentanz-`

Jedes Bild zeigt oben den gelben Kasten mit Beschreibung und „Erwartet“ des Szenarios, darunter „Schritt 1“ (bei Schlangenmeister „Schritt 2“) mit „Schritt zurück“ und „Von vorn“, die ausgegrauten KI-Knöpfe mit „Spieler 1 entscheidet; das ist ein Mensch.“, die verbleibenden Aktionen (FarbkarteLegen und ZugBeenden) und den Kasten „Ereignisse des letzten Schritts“ mit den Zeilen wie oben, jeweils mit AufgabeErfuellt für Spieler 1 und AufgabeAufgedeckt Farbkombination. Beim Schlangentanz-Bild ist unten noch „Invarianten (alle erfüllt)“ angeschnitten zu sehen, weil das Bild auf die Ereignisse gescrollt ist. Texte sind vollständig lesbar, nichts überlappt.

### Zufallspartie Desktop 1280×900 – `bilder/X2c-dev-zufallspartie-desktop.png`

„Partie aus Saat 11, 3 Spieler, mit Erweiterung“, „Schritt 174“, KI-Knöpfe ausgegraut mit „Die Partie ist beendet.“, „Aktionen der Engine (0)“ mit „Die Partie ist beendet (A10); die Wertung steht unten.“, Ereignisse „Ausgesetzt: KI-Gegner 1 setzt aus; schlangengrube-02 auf den Ablagestapel von KI-Gegner 2“ und „PartieBeendet“, alle elf Invarianten grün, Lage „Partiephase Beendet“, Schlussrunde ausgelöst von KI-Gegner 2.

Weitere Geräteklassen entfallen, weil X2c keine Oberfläche ändert; `test:layout` lief in allen fünf Klassen grün.

Server danach beendet: PID 60644 (`…\worktrees\agent-a020369e020d13520\node_modules\.bin\..\vite\bin\vite.js preview --outDir …/X2c-pruefer/dist-testhooks --port 4197 --strictPort`) mit `Stop-Process`; danach lauscht nichts auf 4197, 4173, 4174. Der Tab im eingebauten Browser ist geschlossen.

## Satz-für-Satz-Abdeckung

| Spec-Abschnitt | Regelaussage | Test (Datei › Name) |
|---|---|---|
| A9 Nr. 7 | „Habe eine Schlange …“: beide Fusionen in derselben eigenen Schlange | sonderkarten › „über zwei Schlangen: je eine Fusion … genügt nicht“, „die zweite Fusion liegt in der Schlange des Gegners“ |
| A9 Nr. 7 | „… mit mindestens 2 Farbfusionen“ | „erfüllt: zwei Farbfusionen“, „drei Fusionen“, „knapp nicht: eine Farbfusion und zwei blaue Karten“, „mit Regenbogenschlange: sie ist keine Farbenfusion“, „ohne Schlange“ |
| A9 Nr. 7 | eingelöst mit echtem Zug | „Spieler 1 legt die zweite Farbenfusion … und nimmt „Fusionsexperte““; Szenario |
| A9 Nr. 8 | „Habe min. 4 Sonderkarten …“ | „erfüllt: vier Sonderkarten“, „knapp nicht: drei Sonderkarten“ |
| A9 Nr. 8 | „… in deinen Schlangen“ (über beide, nicht beim Gegner) | „über zwei Schlangen: zwei und zwei“, „die Sonderkarten liegen in der Schlange des Gegners“ |
| A9 Nr. 8, A9 „Wichtig“ | Fusion zählt als eine Sonderkarte, die Karten darunter nicht einzeln | „mit Farbenfusion: die Fusion zählt als eine Sonderkarte“, „… die zwei Karten darunter zählen nicht“ |
| A9 Nr. 8, A9 „Wichtig“ | Blockade zählt, weil die Aufgabe ausdrücklich Sonderkarten verlangt | „mit Blockade dazwischen: Schlangenblockaden zählen“; „legt der Gegner eine Blockade in die Schlange von Spieler 1 …“ |
| A9 Nr. 9 | „Habe min. 2 versch. Sonderkarten in deinen Schlangen“ | „knapp nicht: … nur zwei gleiche Sonderkarten“, „mit Regenbogenschlange und Farbenfusion“, „mit Blockade dazwischen“, „über zwei Schlangen“, „die zweite Sonderkarte liegt beim Gegner“ |
| A9 Nr. 9, D36 | „… und spiele min. 4 aus“ | „knapp nicht: … erst drei ausgespielt“, „erfüllt …“, „ausgespielt hat der Gegner, nicht der Spieler“, „die vierte ausgespielte Karte ist eine abgewehrte Schlangengrube …“ |
| A9 Nr. 10, D36 | „Spiele min. 5 versch. Arten von Sonderkarten aus“ | „erfüllt: fünf verschiedene Arten“, „knapp nicht: sechs Karten, aber nur vier Arten“, „mit Farbenfusion und Schlangenhäutung“, „die fünfte Art hat der Gegner ausgespielt“, „nichts ausgespielt“ |
| D36 | Sonderkarte mit Wirkung zählt, Farbkarte nicht | „D36: eine Sonderkarte mit Wirkung im eigenen Zug zählt, eine Farbkarte nicht“ |
| D36 | Farbenschutz zur Abwehr zählt | „D36/A6: eine abgewehrte Schlangengrube zählt für den Angreifer, der Farbenschutz zur Abwehr für den Verteidiger“, „die fünfte Art ist ein Farbenschutz zur Abwehr …“ |
| D36 | wirkungslos abgelegte zählt | „D36/D25: ein wirkungslos abgelegter Farbenschutz zählt“; Szenario `aufgabe-schlangenrepertoire` |
| D36 | abgewehrte zählt | „D36/A6: eine abgewehrte Schlangengrube …“; Szenario `aufgabe-schlangenmeister` |
| D36 | Schlangenkorb zählt | nicht prüfbar: die Karte ist bis X6 nicht spielbar; sie liefe über `zaehleGespielteKarte` (Hinweis 1) |
| D36 (Grenzen) | Durchlassen ist kein Ausspielen, Überhand-Abwerfen auch nicht, Verdoppler und Zweitzug zählen | „eine durchgelassene Sonderkarte zählt genau einmal …“, „überzählige Karten am Zugende abwerfen ist kein Ausspielen“, „der Verdoppler zählt …“ |
| D34 | ohne Erweiterung wird nichts gezählt | „D34: ohne Erweiterung wird nichts gezählt“; eigene Prüfsumme |
| A9 Nr. 12 | „Bilde durch Schlangenhäutung 2 neue Dreiergruppen“ | Beispiel-Test; „knapp nicht“ (1 neue); „bleibt die alte Gruppe stehen, zählen nur die zwei neuen daneben“ |
| A9 Nr. 12, A11 | Dreiergruppe = Farbgruppe ab 3; verlängerte Gruppe ist nicht neu | „eine bestehende Gruppe zu verlängern bildet keine neue“, „gibt eine alte Gruppe eine Karte an eine neue ab …“ |
| A9 Nr. 12, A7.9 | neue Gruppe mit Nachbar ausserhalb des Abschnitts | „eine neue Gruppe mit einem Nachbarn ausserhalb des Abschnitts zählt“ |
| D37 | nur eigene Häutung in eigener Schlange | „eine Häutung in der Schlange des Gegners erfüllt die Aufgabe für niemanden“; Gegenprobe 1 |
| D37 | beide Gruppen aus derselben Häutung | „über zwei Schlangen: zwei Häutungen … genügen nicht“ |
| A9 „Wichtig“, A7.3, A7.7 | Joker zählen als die Farbe, mit der die Aufgabe erfüllt ist; Karten unter der Fusion zählen nicht einzeln | „mit Regenbogenschlange: sie zählt als Gelb …“, „mit Farbenfusion: die Fusion aus zwei roten Karten zählt als Gelb; ihre roten Karten zählen nicht“, „acht Joker …“ |
| A9 „Wichtig“, A7.5 | andere Sonderkarten unterbrechen Farbreihen | „mit Blockade dazwischen: Rot, Blockade, Rot, Rot ist keine Gruppe“ |
| A7.3, A9 | erfüllt bleibt erfüllt, Jokerfarbe frei je Aufgabe und Wertung | „„Schlangentanz“ bleibt erfüllt und bringt 7 Punkte …“ |
| A9, D35 | geheime Aufgabe zählt verdeckt | „als geheime Aufgabe zählt Schlangentanz nach der Häutung verdeckt“ |
| A9 „sobald … am Zug“ | Bedingung durch Gegnerzug geschaffen, eingelöst zu Beginn des eigenen Zuges | „legt der Gegner eine Blockade in die Schlange von Spieler 1 … nimmt die Aufgabe zu Beginn seines Zuges“; „die fünfte Art ist ein Farbenschutz zur Abwehr; eingelöst wird zu Beginn des eigenen Zuges“ |

## Eigene Grenzfälle

1. **Gefressene Fusion.** Fusionsexperte liest `schlange.fusionen.length`, nicht die Karten. Wenn der Schlangenfrass die Liste nicht nachführte, bliebe die Aufgabe erfüllt. Temporärer Test: KI-Gegner 1 hat Fusion (Rot, Rot), Gelb, Fusion (Blau, Blau); Spieler 1 frisst Fusion und Gelb (Option c), Gegner lässt durch. Ergebnis: Schlange „Rot Rot Farbenfusion“, `fusionen` 1, Fusionsexperte für ihn `false`. Bestanden. Nebenbei: Einen Diebstahl einer Fusion zählt die Engine nicht auf (0 Aktionen), das gehört zu E8.
2. **Schlangentanz erst nach der Häutung aufgedeckt.** Spieler 1 häutet im ersten Zug das A9-Beispiel (Zähler 2, kein Ereignis, Schlangentanz liegt oben auf dem Stapel). Im nächsten eigenen Zug legt er eine Regenbogenschlange als vierte Sonderkarte: AufgabeErfuellt Schlangenbeschwörer, AufgabeAufgedeckt Schlangentanz, AufgabeErfuellt Schlangentanz, AufgabeAufgedeckt Farbenpracht. Die Engine verhält sich wie im PR beschrieben; ob das die Regel ist, ist Auslegungsfrage 3.
3. **Partien ohne Erweiterung.** Eigene Prüfsumme (SHA-256 über `serialisiere` nach jedem Schritt und alle Ereignisse) über 300 Zufallspartien mit 2, 3 und 4 Spielern, Saaten 5001–5300, andere Wahlsaat als der Umsetzer. Ohne Erweiterung auf Basis `589e2a72` und auf `b4942251` gleich: `f8bd5fb6d5b5c3df…a02f983e` (53'919 Schritte). Mit Erweiterung verschieden (`9b210e46…` gegen `ec0a590a…`), gleiche Schrittzahl 55'834. Der Golden Master läuft in `npm test` grün.
4. **`zufallszustand.ts` ohne Erweiterung.** `git blame -L 93,96 src/engine/testing/zufallszustand.ts`: Die zufälligen Zähler stammen aus `a06be63b` (E1, 13.11.2026), X2c ändert die Datei nicht. Vorbestehend, kein Mangel von X2c (Hinweis 2).

## Auslegungsfragen

Geprüft gegen Teil A und Teil D, mit Zitat. Wo eine Auslegung nicht eindeutig gedeckt ist, stehen die Möglichkeiten mit Beispiel und Punktfolge für die Rückfrage an den Autor.

**1. „Ausgespielt“ (Schlangenmeister, Schlangenrepertoire): gedeckt.** D36: „zählt als ausgespielt jede Sonderkarte, die der Spieler aus der Hand gespielt hat: auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte, eine abgewehrte und der Schlangenkorb.“ Die Umsetzung zählt genau an den zwei Stellen, an denen eine Handkarte gespielt wird; Durchlassen und Überhand-Abwerfen zählen nicht, was D36 („aus der Hand gespielt“) und A5 (Abwerfen ist kein Spielen) entspricht. Nicht ausdrücklich gesagt ist der Zeitraum: Die Umsetzung zählt über die ganze Partie, auch Karten von bevor die Aufgabe offen lag. Möglichkeiten: (a) ganze Partie (umgesetzt); (b) erst ab dem Aufdecken der Aufgabe. Beispiel: Ein Spieler hat bis Runde 8 Regenbogenschlange, Schlangenfrass, Farbendieb, Verdoppler und Farbenschutz gespielt, dann wird Schlangenrepertoire aufgedeckt. Bei (a) nimmt er sie zu Beginn seines nächsten Zuges (+4 Punkte), bei (b) muss er fünf Arten neu spielen. D36 nennt „jede Sonderkarte“ ohne Einschränkung; ich halte (a) für gedeckt, der Orchestrator kann es zur Sicherheit mitfragen.

**2. „Neue Dreiergruppe“ (Schlangentanz): nicht eindeutig gedeckt.** D37 regelt, wessen Häutung zählt und dass beide Gruppen aus einer Häutung stammen, nicht, was „neu“ ist. A9 sagt nur „Durch geschicktes Umordnen bildet er zwei neue Dreiergruppen“. Möglichkeiten:

- (L1, umgesetzt) Jede Gruppe von vorher lebt nachher höchstens in einer Gruppe derselben Farbe fort, in der mit den meisten ihrer Karten; neu ist jede Gruppe, in der keine alte fortlebt. Joker haben vorher und nachher dieselbe Farbe.
- (L2) Zahl der Gruppen nachher minus Zahl vorher.
- (L3) Jede Gruppe nachher, die es vorher in dieser Zusammensetzung nicht gab; damit wäre auch eine verlängerte Gruppe neu.

Stellungen, in denen sie verschieden zählen (geprüft mit `neueDreiergruppen` und eigenen Zählungen, Beleg `…-TF-ENGINE-064-3.txt`):

- Rot, Rot, **Rot, Blau, Gelb, Blau, Blau**, Gelb, Gelb, gehäutet (fett) zu Blau, Blau, Blau, Rot, Gelb → Rot, Rot, Blau, Blau, Blau, Rot, Gelb, Gelb, Gelb. Die rote Dreiergruppe zerfällt, Blau×3 und Gelb×3 entstehen. L1: 2, Schlangentanz erfüllt, +7 Punkte. L2: 2 − 1 = 1, nicht erfüllt. L3: 2, erfüllt. Gruppenpunkte vorher 3, nachher 6.
- Rot, Rot, Rot, **Blau, Rot, Gelb, Blau**, Gelb, Gelb zu Rot, Blau, Blau, Gelb → Rot×4, Blau, Blau, Gelb×3. L1: 1 (Rot verlängert, Gelb neu), nicht erfüllt. L2: 2 − 1 = 1, nicht erfüllt. L3: 2 (Rot×4 gab es vorher nicht), erfüllt, +7.
- Mit Joker: Gelb, Gelb, Regenbogenschlange, **Gelb, Rot, Rot, Blau, Rot** zu Rot, Rot, Rot, Gelb, Blau. L1 mit gleicher Jokerfarbe: 1 (die gelbe Gruppe mit dem Joker bestand schon als Gelb×4 und lebt fort, Rot×3 neu). Darf der Joker vorher anders zählen als nachher, ist Gelb×3 neu: 2, erfüllt.
- Das A9-Beispiel und der Codex-Fall (Rot×6 zu Rot×5, Blau×3, Rot×3) zählen in L1 und L2 gleich (2).

Wie selten der Unterschied ist: Über alle 1'063'776 Häutungen in Schlangen bis 8 Karten aus drei Farben und in 281'992 Zufallshäutungen bis 14 Karten entscheiden L1 und L2 gleich, ob die Aufgabe erfüllt ist; das erste Beispiel mit 9 Karten habe ich von Hand gebaut. L1 ist folgerichtig umgesetzt und durch eine volle Suche bestätigt. Die Frage an den Autor lautet, ob eine Häutung, die eine Gruppe auflöst und zwei neue bildet, Schlangentanz erfüllt (L1) oder nicht (L2), und ob eine verlängerte Gruppe neu ist (L3).

**3. Zähler bleibt die ganze Partie stehen: nicht eindeutig gedeckt.** A9: „Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist. Die Bedingungen dürfen im selben Zug geschaffen …“. D37: „Beide Dreiergruppen müssen aus derselben Häutung entstehen“. Beides sagt nicht, ob die Häutung im Zug des Einlösens liegen oder die Gruppen dann noch bestehen müssen. Möglichkeiten mit meinem Grenzfall 2 (Häutung in Zug 1 mit 2 neuen Gruppen, Schlangentanz wird in Zug 3 aufgedeckt):

- (a, umgesetzt) Die Häutung bleibt für die Partie gültig, wie „spiele … aus“. Zug 3: Schlangentanz eingelöst, +7.
- (b) Nur eine Häutung im selben Zug zählt („Bilde“ als Handlung im Zug). Zug 3: nicht eingelöst; der Spieler braucht eine neue Häutung.
- (c) Die Häutung bleibt gültig, aber beide Gruppen müssen beim Einlösen noch liegen. Hat ein Gegner dazwischen eine der Gruppen mit Schlangenfrass zerstört, nicht eingelöst.

Liegt Schlangentanz schon offen, fallen (a) bis (c) zusammen, weil das Einlösen sofort nach der Häutung geschieht. Für die geheime Aufgabe gilt D35 (einmal im eigenen Zug erfüllt), dort fallen (a) und (b) zusammen.

**4. Schlangenmeister: teils gedeckt.** Dass auch eine vom Gegner gelegte Blockade in der eigenen Schlange zählt, ist gedeckt: Der Kartentext fragt nach dem Besitz („Habe … in deinen Schlangen“), A9 „Wichtig für Sonderkarten“ lässt Sonderkarten zählen, „wenn eine Aufgabe ausdrücklich Sonderkarten verlangt“, und D9 sagt für denselben Fall „Eine Regenbogenschlange beim Gegner ist erlaubt, nützt aber ihm.“ Nicht eindeutig ist „2 versch. Sonderkarten“. Möglichkeiten: (a) zwei verschiedene Arten (umgesetzt); (b) zwei Sonderkarten, also zwei verschiedene Karten. Beispiel: Schlange Rot, Regenbogenschlange, Rot, Regenbogenschlange, vier ausgespielt. (a) nicht erfüllt, (b) erfüllt, +4. Für (a) spricht, dass „versch.“ sonst überflüssig wäre; Schlangenrepertoire schreibt dafür aber ausdrücklich „versch. Arten“. Ebenfalls nicht ausdrücklich, aber naheliegend: Die vier ausgespielten dürfen gleich sein, denn „versch.“ steht nur beim ersten Teil.

## Testregister

Geänderte Dateien fallen in ENGINE, DEV und KI, keine Datei ohne Bereich. Neue Nummern nach `git fetch` gegen `origin/neuaufbau` und 46 offene Task-Branches (höchste: ENGINE 060, DEV 042). Die Prüfer von X2a, X2b und X3 arbeiten gleichzeitig; eine Kollision der Nummern ordnet der Orchestrator beim Merge.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-ENGINE-064 | Paket C: Regeltests, Gegenproben, volle Jokersuche, Prüfsumme ohne Erweiterung | `2026-11-23-0922-TF-ENGINE-064` | bestanden |
| TF-ENGINE-065 | Grenzfall: gefressene Fusion; Schlangentanz nach der Häutung aufgedeckt | `2026-11-23-0923-TF-ENGINE-065` | bestanden |
| TF-DEV-045 | Fünf Szenarien per Klick und Zufallspartie mit Erweiterung bis zum Ende | `2026-11-23-0923-TF-DEV-045` | bestanden |

## Hinweise (kein Mangel)

1. Der Schlangenkorb zählt nach D36 als ausgespielt. Er ist bis X6 nicht spielbar; X6 sollte ihn über `zaehleGespielteKarte` spielen und einen Test für D36 mitbringen.
2. `src/engine/testing/zufallszustand.ts` setzt `ausgespielteSonderkarten` und `schlangenhaeutungDreiergruppen` auch ohne Erweiterung zufällig, seit E1 (`a06be63b`). Mit X2c bedeutet ein Zähler ab 2, dass Schlangentanz erfüllt ist; ohne Erweiterung gibt es keine Aufgaben (D34), es entsteht also nur ein Zustand, den keine Partie erreicht. Das wäre in einem eigenen kleinen Task zu bereinigen (Zähler nur mit Erweiterung setzen).
3. `sicht_simulation.test.ts` blendet bei aufgedeckter Aufgabe alle drei offenen Aufgaben aus; genauer wäre, nur den ersetzten Platz auszublenden. Betroffen sind 4 von 569 Proben.
4. Die Texte „Erwartet“ der Szenarien nennen nicht jedes Ereignis: Bei `aufgabe-fusionsexperte` kommt vor KarteGespielt noch KartenVersetzt (die zwei roten Karten unter die Fusion). Die Zeilen, die die Aufgabe betreffen, stimmen.
5. Für Teil C: Für Schlangentanz zählen Joker jetzt als die Farbe der Aufgabe (C10 teilweise); streichen kann der Orchestrator C10 erst nach den Paketen A und B (U13).
