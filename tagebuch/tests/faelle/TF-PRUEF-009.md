---
id: TF-PRUEF-009
titel: npm run check:regeln endet mit Exit 1, wenn die Ausnahmeliste gegenüber origin/neuaufbau wächst, auch nach einem Commit.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
---

## Worum es geht

`scripts/check_regeln_ausnahmen.json` duldet alte Regelverstösse und darf nur kürzer werden. Trägt jemand einen neuen Verstoss ein, statt ihn zu beheben, muss `check:regeln` das melden, auch wenn die Änderung schon committet ist.

## Bestanden, wenn

Jeder der vier Eingriffe aus „Testdaten“ endet mit Exit 1, und die Ausgabe enthält „Die Ausnahmeliste wächst gegenüber origin/neuaufbau“ mit Regel, Datei und dem neuen Merkmal. Der committete Fall a meldet dasselbe. Ohne Eingriff endet das Gate mit Exit 0.

## Fehlgeschlagen, wenn

Ein Eingriff endet mit Exit 0, oder die Ausgabe nennt das neue Merkmal nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | eigener Wegwerf-Branch auf dem zu prüfenden Commit, nach `git fetch origin` und `npm ci` |
| Ausgangslage prüfen | `npm run check:regeln` endet mit 0 |

## Testdaten

a) Neue Datei `src/engine/__tests__/probe_p03b.test.ts` mit `it('ohne Abschnitt', () => {})`, dazu unter `U1` der Eintrag `"src/engine/__tests__/probe_p03b.test.ts": ["ohne Abschnitt"]`.
b) In `src/engine/__tests__/color_groups.test.ts` innerhalb des ersten `describe` ein `it('neuer Test ohne Abschnitt', () => {})`, dazu in der Liste unter dieser Datei das Merkmal `Farbgruppen-Erkennung — R3.3 › neuer Test ohne Abschnitt`.
c) Neuer Schlüssel `"U9": { "src/engine/state.ts": ["irgendwas"] }`.
d) Unter `U4` für `src/engine/state.ts` ein drittes Merkmal `const z = Math.random()`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Wegwerf-Branch anlegen | `git switch -c wegwerf-pruefung` | |
| 2 | Editor | Eingriff a aus „Testdaten“ einbauen | | |
| 3 | Git Bash | Gate ausführen | `npm run check:regeln; echo $?` | Exit 1, „wächst gegenüber origin/neuaufbau“, Zeile `U1 src/engine/__tests__/probe_p03b.test.ts: „ohne Abschnitt“` |
| 4 | Git Bash | Eingriff committen und Gate erneut ausführen | `git add -A`, dann `git commit -m wegwerf`, dann `npm run check:regeln; echo $?` | wieder Exit 1 mit derselben Zeile |
| 5 | Git Bash | zurücksetzen | `git reset --hard <geprüfter Commit>` | `git status --short` leer |
| 6 | Editor und Git Bash | Eingriffe b, c und d einzeln einbauen, je Gate ausführen, je `git checkout -- .` | `npm run check:regeln; echo $?` | je Exit 1 mit dem neuen Merkmal |
| 7 | Git Bash | aufräumen | `git switch <Prüfbranch>`, dann `git branch -D wegwerf-pruefung` | |

## Nicht abgedeckte Grenzfälle

Getauschter Verstoss bei gleicher Anzahl: TF-PRUEF-010. Fehlender Vergleichsstand: TF-PRUEF-011. Steht auf der Merge-Basis noch das alte Format mit Zahlen (vor P0.3b), zählt der Vergleich nur die Anzahl; ein Tausch in Quelle und Liste zugleich fällt dann nur im Abgleich gegen eine Basis mit Merkmalen auf (TF-PRUEF-010, Schritt 4). Leere Liste und fehlende Datei: von `tests/check_regeln_ausnahmen.test.ts` abgedeckt, nicht von Hand.
