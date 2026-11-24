# Prüfprotokoll K2b – Vollenden bei Gleichstand

| Feld | Wert |
|---|---|
| Task | K2b Vollenden bei Gleichstand (KI, Folgeauftrag des Orchestrators zu K2.1) |
| Branch | `task/K2b-gleichstand`, PR #118 gegen `neuaufbau` |
| Geprüfter Stand | `97677e0c` (Basis `02038f4a`, `origin/neuaufbau` steht auf `99f8b96d`) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 24.11.2026 |
| Umgebung | Windows 11 Pro, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: 409 Dateien mit `w/crlf` nach dem Auschecken, alle getrackten Dateien gelöscht und neu geholt, danach 0. `core.hooksPath` war schon gesetzt (`…\scripts\githooks`), `npm ci` Exit 0. Logs und Proben unter `<scratchpad>/K2b-pruefer/`.

## Urteil: ABGENOMMEN

Die Gleichstandsregel greift nur, wenn zwei durchgerechnete Pläne höchstens 1e-9 auseinanderliegen. Ohne Erweiterung wählt die KI in meiner Probe (1'401 Wahlen auf eigenen Saaten) nie anders als vor K2b, mit Erweiterung zweimal, beide Male exakt gleich bewertet und mit mehr sicheren Punkten. Spiegelpartien zeigen keine Schwächung, Suchgrenzen und K2.7 halten. Beide Gegenproben machen den passenden Test rot, alle Gates enden mit 0. Die Erklärung der Fälle 3 und 4 rechnen die Tests selbst nach, und die neue Messung im K2.1-Test ist in meiner Probe nie nachsichtiger als die KI.

## Abnahmekriterien

K2b hat keinen eigenen Block im Plan. Die Kriterien stammen aus dem Auftrag des Orchestrators. Massgeblich sind dazu K2.1, K3.2 und K4.5 (`origin/neuaufbau` 99f8b96d nennt dort K2.1, K3.2 und K3.4).

| # | Kriterium (Auftrag des Orchestrators) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | Die vier Stellungen als Tests, zuerst rot; Erklärung der Fälle 3 und 4 richtig, `geplantesEnde` korrekt und nicht schwächer | ja | `ddf0a464`: 2 von 31 rot (651, X5-Schlussrunde); Fälle 3/4 rechnen 40.00/39.60/39.50 und 27.80/27.40/27.30 nach; TF-KI-027: 26 Züge mit Abwehr, nie nachsichtiger |
| 2 | Gleichstandsregel (`besser`, `GLEICH` 1e-9, Gruppen, dann `sichtbarePunkte`) richtig begründet, greift nur bei Gleichstand, nur zwischen durchgerechneten Plänen | ja | Code gelesen; Vorauswahl unverändert, Vertiefung sortiert nach `wert`; Gegenproben 1 und 2 rot |
| 3 | Wahl ohne Erweiterung ändert sich nur in Gleichstand-Fällen; `solideKi_basis.test.ts` grün | ja | TF-KI-024: 1'401 Wahlen, 0 Abweichungen; mit Erweiterung 2 von 548, beide `dw` 0 |
| 4 | Die KI wird nicht schwächer | ja | TF-KI-026: gegen Zufall 60/60 wie vorher; Spiegelpartien Mittel +0.21 (Basis) und +2.95 (Erweiterung) für neu |
| 5 | K3.2 nur ohne Erweiterung, ohne die in X4 gelockerte Ausnahme; Aussage im Basis-Spiel nicht schwächer | ja | Diff `solideKi_angriff_partien.test.ts`: 18 statt 9 Basis-Partien, strikte Ausnahme; grün |
| 6 | Suchgrenzen (≤ 64, < 500 ms), K2.7, Isolationstest, Importgrenze grün | ja | höchstens 41 Stellungen, längster Schritt 167 ms unter Last; Störprobe 685 Stellungen 0 Abweichungen; Tests grün |
| 7 | Alle Gates einzeln, Browser am Entwicklertisch und unter `/spiel` | ja | Gates unten; Bilder `K2b-*-desktop.png` |

### 1. Die vier Stellungen und die neue Messung

Der erste Commit `ddf0a464` enthält nur Testdateien (vier gespeicherte Stellungen, `solideKi_gleichstand.test.ts`, Änderungen an `solideKi.test.ts` und `solideKi_angriff_partien.test.ts`). Auf ihm (`npx vitest run` über die drei Dateien, Exit 1) sind genau die beiden Gleichstand-Tests rot, aus dem richtigen Grund:

```
× K2b, K2.1 (X5, Saat 7154, Schlussrunde mit Erweiterung) … AssertionError: K2b: Saat 1, gespielt [{"typ":"ZugBeenden",…}]
× K2b, K2.1 (Saat 651, ohne Erweiterung) … Bewertung 42.70, Gruppen 4 statt 4 … expected 4 to be greater than 4
Tests  2 failed | 29 passed (31)
```

Die Fälle 3 (X6, 39.50 gegen 39.60) und 4 (X5 nach dem Merge, 27.30 gegen 27.40) sind auf dem ersten Commit grün, und das ist richtig so: Sie belegen eine Erklärung und verlangen keine neue Wahl. Der Test spielt den ersten Teilzug der KI nach (Farbkarte, Blockade beim Gegner, Zug beenden) und rechnet drei Werte nach: geplant 40.00 bzw. 27.80, beste Vollendung samt zweiter Karte 39.60 bzw. 27.40, nach Abwehr mit Farbenschutz 39.50 bzw. 27.30. Die KI wählt also strikt mehr als jede Vollendung. Die 0.1 Rückstand entstehen erst durch die Abwehr des Gegners, und die kann sie nach K2.7 nicht sehen. Die Erklärung stimmt.

`geplantesEnde` im K2.1-Partietest spielt deshalb den ersten Teilzug mit durchlassenden Gegnern nach, genau wie die Vollendungen, mit denen er verglichen wird. Das misst die Entscheidung zum Zeitpunkt der Wahl und ist sachlich richtig. Den Haken (Codex-Befund 3) habe ich selbst geprüft: Nach einer Abwehr stammen die weiteren Karten aus der echten Partie. Probe TF-KI-027 auf den zehn Partien des Tests, Partie 7154 und 16 eigenen Partien (Saat 33'000 bis 33'015, alle Sitze solide): 654 Züge, 26 mit Abwehr im ersten Teilzug. In 24 davon ergibt das Nachspielen denselben Wert, wie wenn die KI ab der durchgelassenen Karte selbst weiterspielt (drei KI-Saaten). In 2 Fällen liegt es darunter (23.40 gegen 24.10, 3.39 gegen 3.82), weil die KI in der echten Partie nach der Abwehr weniger oder anderes spielte. Kein Fall liegt darüber, und das Nachspielen bricht nie ab. Die Näherung ist damit höchstens strenger als die KI, nie nachsichtiger. Gegenüber der alten Messung (Stand nach der Abwehr) ist sie nachsichtiger, aber nur um den Schaden, den der Gegner mit Farbenschutz anrichtet, und für den kann die KI nichts.

### 2. Die Gleichstandsregel

`besser` in `zugsuche.ts` vergleicht zuerst die Bewertung. Liegen zwei Werte mehr als `GLEICH` (1e-9) auseinander, entscheidet allein sie. Erst darunter kommen die Gruppen, dann `sichtbarePunkte`. Gegenüber `origin/neuaufbau` ändert sich nur die Reihenfolge der beiden Nachrangigen (vorher Punkte vor Gruppen) und dass die Punkte jetzt erfüllte Aufgaben mitzählen. Die Toleranz bestand schon vorher. Ich habe die Herleitung im Kommentar nachgerechnet: 0.1 × 1.3 × 0.3 × 1.5 × 0.5 = 0.02925, fünf Nachkommastellen. In meiner Probe liegen die beiden Abweichungen bei `dw` exakt 0.

Wo `besser` wirkt: in `beste` (Wahl unter den durchgerechneten ersten Aktionen und unter den zweiten Karten), beim Vertiefen (`besser(zweite, folge)`) und gegen „Zug beenden“ (`suche.ergebnis(sicht)`). `vorauswahl.ts` ist im Diff nicht enthalten, und die Liste der vertieften Züge sortiert nach `b.wert - a.wert`. Damit entscheidet die Regel nur zwischen durchgerechneten Plänen, wie verlangt. Die Abwehr (`reagiere`) benutzt `besser` nicht.

`sichtbarePunkte` liest `erfuellteAufgaben` des eigenen Spielers, die eigene geheime Aufgabe und `geheimeAufgabeErfuellt` aus der Sicht. Alles davon gehört der KI selbst. Ohne Erweiterung ist der Wert gleich `eigenePunkte`, in meiner Probe in allen 1'401 Stellungen.

Bewertung der Reihenfolge: In Partie 651 hat die Vollendung 39 statt 40 eigene Punkte bei gleicher Bewertung 42.70. Die KI gibt also einen sicheren Punkt für die Gruppe her. Das verlangt K2.1 wörtlich („tut sie es, es sei denn, ein anderer Zug ist nachweislich besser bewertet“), und nach ihrer Bewertung ist es gleich gut. Siehe Hinweis 1.

### 3. Wahl ohne Erweiterung, alt gegen neu

Probe TF-KI-024 (Beleg: Probedatei und Messkopie). Die alte `zugsuche.ts` aus `origin/neuaufbau` lag als Abschrift daneben. An jeder Entscheidung der soliden KI mit mehr als einer Aktion wählten alte und neue Zugsuche mit derselben KI-Saat. Eine Messkopie der neuen Suche protokollierte jeden Vergleich, bei dem alte und neue Ordnung verschieden antworten.

| Partien | Wahlen | anders | Art der Abweichung |
|---|---|---|---|
| 30 ohne Erweiterung (Saat 31'000 bis 31'029, 2 bis 4 Spieler) | 1'401 | 0 | – |
| 12 mit Erweiterung (Saat 31'000 bis 31'011) | 548 | 2 | Saat 31'003: Regenbogenschlange an Stelle 1 statt 0, Bewertung 15.36 = 15.36, 2 = 2 Gruppen, sichere Punkte 24 statt 19. Saat 31'006, Schlussrunde: Schlangenfrass auf die Fusion statt auf `gelb-09`, 66.80 = 66.80, 10 = 10 Gruppen, sichere Punkte 134 statt 122 |

Die Messkopie wählte in allen 1'949 Stellungen gleich wie die echte neue Suche. `solideKi_basis.test.ts` ist im Diff nur im Kommentar geändert (Prüfsumme gleich) und grün.

### 4. Spielstärke

Ein einfaches Turnier neu gegen alt täuscht. Zu zweit stand es 36 zu 44 Siege, zu viert (neu, alt, Zufall, Zufall) 7 zu 17. Weil die Sitzordnung die alte KI zu viert immer direkt hinter die neue setzt, habe ich jede Partie mit denselben Saaten ein zweites Mal mit „alt, alt“ gespielt (TF-KI-026):

| Lauf | Partien | gleiche Verläufe | Siege neu+alt / alt+alt | abweichende Vorsprünge von Teilnehmer 0 |
|---|---|---|---|---|
| 2er Basis, ab 56'000 | 80 | 79 | 36:44 / 35:45 | +17 |
| 4er Basis, ab 58'000 | 24 | 24 | 7:17 / 7:17 | keine |
| 2er Erweiterung, ab 57'000 | 40 | 35 | 21:19 / 20:20 | +49, +48, +7, +14 |

Gegen die Zufalls-KI (60 Partien ab 55'000) gewinnen neu und alt je 60, mit denselben mittleren Punkten (61.32). Die Unterschiede im Turnier kommen also von der Sitzordnung. Wo die neue KI anders spielt, liegt sie im Vorsprung jedes Mal vorn. Nicht schwächer.

### 5. K3.2 ohne Erweiterung

Vorher prüfte K3.2 alle 18 Partien (9 mit Erweiterung) mit einer in X4 gelockerten Ausnahme für Partien mit Erweiterung („nach der besten zweiten Karte“). Jetzt spielt der Test dieselben 18 Saaten alle ohne Erweiterung und verlangt die strikte Ausnahme (`gewaehlt.wert > kleinster.wert + 1e-9`). Für das Basis-Spiel ist das doppelt so viel Material bei gleicher Strenge. Schwächer ist die Aussage dort nicht. Die Partien mit Erweiterung deckt seit 99f8b96d K4.5 ab (Codex-Befund 2, vom Orchestrator erledigt). `geprueft > 30` bleibt. Test grün.

### 6. Suchgrenzen und K2.7

In meiner Probe rechnete die Suche je Schritt höchstens 40 (Basis) bzw. 41 (Erweiterung) Stellungen durch. `GRENZE_SUCHE` beträgt 16 + 8 + 3 × 8 + 1 = 49 und liegt unter 64. Die Vorauswahl bewertete nie mehr Aktionen als angeboten. Der längste Schritt dauerte 108 ms bzw. 167 ms, gemessen bei drei gleichzeitig laufenden Proben. `zugsuche.test.ts` (über tausend Aktionen, unter 500 ms) und `zugsuche_zaehler.test.ts` sind grün.

Störprobe (TF-KI-025) mit eigenem Verfahren statt `mischeVerborgenes`: Fremde Hände und Stapel wurden zusammen umgedreht und mit eigenem xorshift gemischt, fremde geheime Aufgaben neu verteilt und ihr Erfüllt-Status umgedreht. 489 Stellungen ohne und 196 mit Erweiterung: Die Sicht blieb jedes Mal gleich, abweichende Wahl 0. `tests/strategie_isolation.test.ts`, `tests/architektur_ki_importgrenze.test.ts` und `sicht_simulation.test.ts` sind grün (94 Tests in diesem Lauf).

## Gates

Jeder Befehl einzeln, Exit-Code einzeln gelesen (Git Bash `${PIPESTATUS[0]}` hinter `tee`), Logs unter `<scratchpad>/K2b-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 173 passed, Tests 3003 passed |
| `npm run typecheck` | 0 | `tsc -b` ohne Meldung |
| `npm run build` | 0 | built in 503ms |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | keine Verstösse, verglichen mit Merge-Basis 02038f4 |
| `npx eslint .` | 0 | keine Ausgabe |
| `npm run test:dauerlauf` | 0 | 4 Dateien, 4 Tests |
| `python scripts/regelcheck.py` | 0 | siehe Abschnitt Testregister |
| `npm run test:layout` | entfällt | Der Diff berührt nur `src/ki/**`, weder `src/ui`, `tests/layout` noch `playwright.config.ts` |

Ports: `test:layout` lief nicht. Für den Browser habe ich einen eigenen Server auf Port 4291 gestartet und danach beendet (siehe unten).

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
ddf0a464 test: K2b Vollenden bei Gleichstand (rot)
165f2467 feat: K2b bei Gleichstand vollendet die solide KI oder nimmt sichere Punkte
97677e0c fix: K2b Gleichstandsregel nur zwischen durchgerechneten Plänen (Codex-Befund 1)
```

`ddf0a464` enthält nur Tests und Testdaten (vier JSON-Stellungen und drei Testdateien), rot wie oben unter Abschnitt 1. Spätere Änderungen an den Tests: `165f2467` zog Hilfen nach `src/ki/__tests__/stellungen.ts` um (`ladeStellung`, `gruppenzahl`, `mitZweiterKarte`, `ersterTeilzug`). Im Gleichstand-Test (`git diff ddf0a464 HEAD`) bleiben alle Erwartungen und Zahlen gleich; nur die Vergleichsmenge der Fälle 3 und 4 kommt jetzt aus `mitZweiterKarte`, dieselbe Hilfe wie im K2.1-Partietest, und lässt `UeberhandAbwerfen` als erste Aktion weg. Die Vertiefungs-Tests rufen jetzt `STRATEGIEN.solideKi(...).waehle` statt `planeZug`, was dieselbe Funktion ist (`solideKi.ts` gibt `planeZug(...).aktion` zurück). Abgeschwächt wurde dabei nichts.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
 src/ki/__tests__/stellungen.ts                     |  40 ++++++-
 src/ki/__tests__/stellungen/saat-651-zug-17.json   |   1 +
 .../stellungen/saat-7154-basis-zug-23.json         |   1 +
 .../stellungen/saat-7154-x5-schlussrunde.json      |   1 +
 .../stellungen/x5-merge-k21-erweiterung.json       |   1 +
 src/ki/strategien/bewertung.ts                     |  19 ++-
 src/ki/strategien/solideKi.test.ts                 |  26 +++--
 src/ki/strategien/solideKi_angriff_partien.test.ts |  27 +++--
 src/ki/strategien/solideKi_basis.test.ts           |   6 +
 src/ki/strategien/solideKi_gleichstand.test.ts     | 127 +++++++++++++++++++++
 src/ki/strategien/zugsuche.ts                      |  33 ++++--
 src/ki/strategien/zugsuche_vertiefung.test.ts      |  36 +-----
 12 files changed, 250 insertions(+), 68 deletions(-)
```

| Datei | im Feld (K2) | Urteil |
|---|---|---|
| `src/ki/strategien/zugsuche.ts`, `bewertung.ts` | ja | Kern des Auftrags |
| `src/ki/__tests__/stellungen.ts`, `stellungen/*.json` | nein | Testhilfen und gespeicherte Stellungen, im PR begründet; trägt |
| `solideKi_gleichstand.test.ts` (neu), `solideKi.test.ts`, `solideKi_basis.test.ts`, `zugsuche_vertiefung.test.ts` | nein | Tests zum Auftrag, Messung K2.1, Prüfsumme, gemeinsame Hilfen; im PR begründet; trägt |
| `solideKi_angriff_partien.test.ts` | nein | Zusatzauftrag K3.2; trägt |

U10: `package.json` unverändert. U13: keine der genannten Dateien berührt. U9: keine Dateiköpfe, keine `ÄNDERUNG`-Kommentare. U11: nichts aus Altprojekten. U2: keine neue Spielregel, nur KI-Verhalten. U7: `zugsuche.ts` 290 Zeilen, `bewertung.ts` 279, neue Testdatei 127.

## Gegenprobe

1. `src/ki/strategien/zugsuche.ts`, `besser`: Reihenfolge zurück auf „Punkte vor Gruppen“ (`if (folge.punkte !== bisher.punkte) return folge.punkte > bisher.punkte; return folge.gruppen > bisher.gruppen;`). `npx vitest run src/ki/strategien/solideKi_gleichstand.test.ts`: Exit 1, rot „K2b, K2.1 (Saat 651, ohne Erweiterung) … Gruppen 4 statt 4 … expected 4 to be greater than 4“. Wiederhergestellt mit `git checkout`, `git status` leer.
2. `src/ki/strategien/bewertung.ts`, `sichtbarePunkte`: Aufgaben nicht mehr zählen (`eigenePunkte(...) + 0 * (offene + geheime)`). Derselbe Befehl: Exit 1, rot „K2b, K2.1 (X5, Saat 7154, Schlussrunde mit Erweiterung) … gespielt [{"typ":"ZugBeenden"…}]“. Wiederhergestellt, `git status` leer.

## Browserprüfung

Testhook-Build (`npm run build:testhooks`, Exit 0), eigener Server `npx vite preview --outDir dist-testhooks --port 4291 --strictPort`. Bedient im eingebauten Browser (1024×768), Fotos mit Playwright Chromium 1.60.0 in 1280×900. Eine Oberflächenänderung gibt es nicht, deshalb nur Desktop.

Am Entwicklertisch mit echten Klicks auf „KI-Schritt (solide)“:

- `ki-dreiergruppe`: Zwei Klicks, Verlauf „FarbkarteLegen: Mondranke (violett-09) → schlange-1 anfang“, dann „ZugBeenden“. Schlange von KI-Gegner 1 Violett ×3, Farbenschutz bleibt auf der Hand (Hand wieder 5 Karten).
- `ki-dreiergruppe-joker`: „RegenbogenschlangeLegen … schlange-1 · Stelle 0“, dann „Wurzelpfad (braun-01) → schlange-1 anfang“, dann „ZugBeenden“. Schlange Braun, Regenbogenschlange, Grün, Grün.
- `ki-dreiergruppe-ausnahme`: „Waldspross (gruen-09) → schlange-1 anfang“, dann „ZugBeenden“. Grün ×4, das Rot bleibt auf der Hand, wie das Szenario erwartet.
- `ki-blockade-fuehrender` (K3.2): „BlockadeLegen … schlange-2 · Stelle 1“. Nach dem Reagieren-Knopf „durchlassen“ fällt die Endwertung von Spieler 1 von 13 auf 4, vorn ist KI-Gegner 1 mit 10.

### Desktop 1280×900 – `bilder/K2b-ki-dreiergruppe-desktop.png`

Unterer Teil des Entwicklertischs nach den zwei Schritten. Tabelle „Zwischenstand“: Spieler 1 0, KI-Gegner 1 Gruppen 6, Summe 6. „Endwertung, wenn die Partie jetzt endete“: KI-Gegner 1 Gruppen 6, Kette 5, Summe 11, „Vorn: KI-Gegner 1 (11)“. Aufschlüsselung „schlange-1: Gruppen Violett×3 = 6“. Verlauf mit drei Zeilen: Start, Violett an schlange-1, ZugBeenden. Alles lesbar, nichts abgeschnitten, `scrollWidth` 1280 = `clientWidth` 1280.

### Desktop 1280×900 – `bilder/K2b-ki-blockade-fuehrender-desktop.png`

Wertung nach Blockade und Durchlassen. Zwischenstand Spieler 1 4, KI-Gegner 1 5, KI-Gegner 2 6. Endwertung Spieler 1 4, KI-Gegner 1 10 (Kette 5, Bonus 5), KI-Gegner 2 6. Aufschlüsselung Spieler 1: „schlange-2: Gruppen keine, zusammen 0“ (die grüne Gruppe ist durch die Blockade zerstört), „schlange-3: Blau×4 = 4“. Verlauf: Start, BlockadeLegen schlange-2 Stelle 1, Reagieren: durchlassen. Plausibel: Spieler 1 verliert die 9 Punkte der grünen Gruppe.

### Desktop 1280×900 – `bilder/K2b-spiel-start-desktop.png`

Partie unter `/spiel`, ein Gegner ohne Erweiterung, nach vier eigenen Zügen (je eine Farbkarte, dann „Zug beenden“). Kopf „Du bist dran“, Stapel 88. KI-Gegner 1 zeigt zwei Schlangen (Blau, Blau, Grün und Braun, Violett), 5 Handkarten, 0 Punkte, Ablage 1 (die Schlangengrube, die er auf mich gespielt hatte). Meine Schlangen Rot, Gelb, Rot und Rot, 0 Punkte. Hand mit Farbenschutz, Schlangenblockade, Regenbogenschlange, Violett, Blau. Rechts „Wähle eine Karte aus deiner Hand“ und ein deaktiviertes „Zug beenden“ mit Begründung (A5, D12). Nichts überlappt, kein waagrechtes Scrollen (1280 = 1280). Im eingebauten Browser lief vorher eine zweite Partie: KI-Gegner 1 spielte Grün als neue Schlange und eine Schlangengrube auf mich, ich liess durch und setzte aus („Du hast wegen der Schlangengrube einen Zug ausgesetzt“). Danach legte er Braun und die Regenbogenschlange an seine Schlange.

Konsolenfehler: In Playwright keine. Im eingebauten Browser genau eine Meldung, „Gespeicherte Partie beschädigt und verworfen … entscheidung fehlt, aufgedeckt fehlt“. Sie kam beim ersten Öffnen von `/spiel` aus einem alten Spielstand im localStorage des geteilten Browsers und hat mit K2b nichts zu tun (Hinweis 4).

Server danach beendet: PID 71304, Befehlszeile `node …\worktrees\agent-ae1f72b118cc95b38\node_modules\.bin\..\vite\bin\vite.js preview --outDir dist-testhooks --port 4291 --strictPort`, `Stop-Process`; danach lauscht auf 4291 nichts mehr. Browser-Tab geschlossen.

## Satz-für-Satz-Abdeckung

| Quelle | Aussage | Test (Datei › Name) |
|---|---|---|
| K2.1 | Kann die KI eine Dreiergruppe vollenden, tut sie es | `solideKi.test.ts` › K2.1: ki-dreiergruppe, ki-dreiergruppe-joker; Partietest K2.1 |
| K2.1 | … es sei denn, ein anderer Zug ist nachweislich besser bewertet; der Test belegt das mit Zahlen | `solideKi.test.ts` › K2.1, Ausnahme: ki-dreiergruppe-ausnahme; `solideKi_gleichstand.test.ts` › Fälle 3 und 4 (40.00 > 39.60, 27.80 > 27.40) |
| K2.1 / K2b | Bei gleicher Bewertung vollendet sie | `solideKi_gleichstand.test.ts` › Saat 651 |
| Entscheid 21.11. / K2b | Bei Gleichstand eine Karte mit sicheren Punkten statt „Zug beenden“ | `solideKi_gleichstand.test.ts` › X5, Saat 7154, Schlussrunde |
| K3.2 | Blockade und Farbendieb lassen dem stärksten Gegner den kleinsten Vorsprung, Basis-Spiel | `solideKi_angriff_partien.test.ts` › K3.2 (Basis-Spiel) |
| K2.7, K2.8, K2.9 | keine verdeckte Information, Grenzen, Isolation | `sicht_simulation.test.ts`, `zugsuche.test.ts`, `zugsuche_zaehler.test.ts`, `strategie_isolation.test.ts` |

## Eigene Grenzfälle

1. **Gleichstand mit Erweiterung, gleiche Gruppen, verschiedene sichere Punkte.** Die neue Regel zählt dort erfüllte Aufgaben, die Bewertung nicht. Geprüft in TF-KI-024 auf eigenen Saaten: zwei Abweichungen, beide `dw` 0, gleiche Gruppen, neu +5 bzw. +12 sichere Punkte (Endwertung nach der Karte 24 statt 19, 139 statt 122). Die Regel tut, was sie soll, und nur dort.
2. **Abwehr im ersten Teilzug (Näherung von `geplantesEnde`).** TF-KI-027: 26 Fälle, 0 Fehler, nie nachsichtiger als das eigene Weiterspielen der KI.
3. **Eigene geheime Aufgabe in der Störprobe.** `sichtbarePunkte` liest `geheimeAufgabeErfuellt`. Die Störprobe kehrt den Erfüllt-Status aller fremden Aufgaben um und verteilt sie neu: 196 Stellungen mit Erweiterung, Sicht gleich, Wahl gleich (TF-KI-025).
4. **Sitzordnung im Stärketurnier.** Ein Turnier neu gegen alt zeigt 7 zu 17. Erst der Spiegel mit „alt, alt“ zeigt, dass alle 24 Verläufe identisch sind und die Zahl von der Sitzordnung kommt (TF-KI-026).

## Testregister

Bereich `KI` (`src/ki/**`) deckt alle geänderten Dateien ab, kein neuer Bereich nötig. Einen Tagebucheintrag zu K2b gibt es nicht, deshalb ohne `--eintrag`.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-KI-024 | Wahl alt gegen neu, Suchgrenzen | `2026-11-24-2050-TF-KI-024` | bestanden |
| TF-KI-025 | Störprobe K2.7 nach K2b | `2026-11-24-2050-TF-KI-025` | bestanden |
| TF-KI-026 | Spielstärke in Spiegelpartien | `2026-11-24-2050-TF-KI-026` | bestanden |
| TF-KI-027 | Näherung von `geplantesEnde` nach einer Abwehr | `2026-11-24-2050-TF-KI-027` | bestanden |
| TF-KI-028 | Entwicklertisch und `/spiel` im Browser | `2026-11-24-2050-TF-KI-028` | bestanden |

## Hinweise (kein Mangel)

1. **Gruppen vor Punkten kostet im Einzelfall einen sicheren Punkt.** In Partie 651 vollendet die KI jetzt mit 39 statt 40 eigenen Punkten bei gleicher Bewertung. Das folgt dem Wortlaut von K2.1. Wer lieber den sicheren Punkt hätte, müsste K2.1 ändern und nicht die Umsetzung.
2. **Partie 7157 (aus dem PR, von mir nicht nachgeprüft).** Der Umsetzer meldet einen K2.1-Fall ohne Gleichstand: Ein Farbendieb allein bringt 62.40, blau-15 vor dem Farbendieb bringt 62.80 mit Vollendung. Die Ursache liegt in der Breite der Vertiefung (nur drei erste Züge bekommen eine zweite Karte). Das gehört nicht zu K2b, sollte aber als eigener Punkt für den Orchestrator stehen bleiben.
3. **Zusammenführen mit X6.** `solideKi.test.ts` ändert dieselbe Stelle wie X6 (K2.1 nur ohne Erweiterung). Beim Merge braucht es beides: die Partienliste aus X6 und `geplantesEnde` von hier. Die X5-Stellung `saat-7154-x5-schlussrunde.json` hat ein von Hand nachgetragenes Feld `zug.comebackBedingung: false`. Das ist im Testkopf begründet, und die Stellung erfüllt jede Invariante (geprüft im Test).
4. **Alter Spielstand im geteilten Browser.** Der eingebaute Browser hatte unter `localhost:4291` einen Spielstand in älterem Format gespeichert. `/spiel` verwirft ihn mit einer verständlichen Meldung und schreibt einen Konsolenfehler. Das Verhalten ist gewollt und gehört nicht zu K2b.
