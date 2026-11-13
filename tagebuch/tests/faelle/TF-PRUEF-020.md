---
id: TF-PRUEF-020
titel: Ein Vertrag aus tests/layout/geraeteklassen_ausnahmen.json gilt in seiner Klasse als erwartetes Scheitern, und ein gelisteter, aber grüner Vertrag macht den Lauf rot.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/geraeteklassen_ausnahmen.test.ts
aenderung: task/P0.3c-fuenf-geraeteklassen
---

## Worum es geht

In Handy quer liegen in drei Lobby-Zuständen Bedienelemente unter dem 390 px hohen Bild. Bis der Orchestrator über einen Umbau entscheidet, stehen diese drei Fälle mit Messwerten in einer Liste. Die Liste darf keinen echten Fehler verstecken und muss schrumpfen, sobald ein Befund behoben ist.

## Bestanden, wenn

`npx playwright test tests/layout/lobby.spec.ts --project=handy-quer` endet mit Exit 0, obwohl die drei gelisteten Verträge scheitern (Playwright zählt sie als erwartet). Mit einem zusätzlichen Eintrag für den grünen Vertrag „O2: Regelseite“ zur Lage ausserhalb des Bildes endet derselbe Lauf mit Exit 1 und „Expected to fail, but passed.“. Ohne die drei Einträge endet er mit Exit 1 und „2 Bedienelement(e) …“ für „Neue Partie“ und „Regeln“. `npx vitest run tests/geraeteklassen_ausnahmen.test.ts` ist grün; ein Eintrag mit `klasse: "desktop"` macht ihn rot.

## Fehlgeschlagen, wenn

Ein veralteter Eintrag bleibt grün, ein nicht gelisteter roter Vertrag bleibt grün, oder ein Eintrag für eine der drei alten Klassen wird angenommen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit nach `npm ci` |
| Ausgangslage prüfen | Ports 4173 und 4174 lauschen nicht |

## Testdaten

Zusätzlicher Eintrag: `{ "datei": "tests/layout/lobby.spec.ts", "vertrag": "O2: Regelseite › kein Bedienelement liegt …", "klasse": "handy-quer", "befund": "Gegenprobe" }`, der Vertragstext wörtlich aus `tests/layout/waechter.ts` übernommen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Lobby-Verträge in Handy quer | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer; echo $?` | Exit 0 |
| 2 | Editor | Gegenprobe-Eintrag oben in `ausnahmen` einfügen | Testdaten | |
| 3 | Git Bash | nur die Regelseite | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer -g "Regelseite"; echo $?` | Exit 1, „Expected to fail, but passed.“, 1 failed |
| 4 | Git Bash | Liste zurücksetzen | `git checkout -- tests/layout/geraeteklassen_ausnahmen.json` | `git status` leer |
| 5 | Git Bash | Listenprüfung | `npx vitest run tests/geraeteklassen_ausnahmen.test.ts; echo $?` | Exit 0, 3 Tests grün |

## Nicht abgedeckte Grenzfälle

Dass die Liste gegenüber `origin/neuaufbau` nicht wächst, lässt sich erst prüfen, wenn sie dort liegt; auf dem Branch, der sie anlegt, gibt es nichts zu vergleichen. Die Regel wiederholt den Mechanismus von `check:regeln` (`basisAusnahmen`, `abgleich`), der dort geprüft ist (TF-PRUEF-001).
