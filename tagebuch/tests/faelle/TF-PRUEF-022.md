---
id: TF-PRUEF-022
titel: Nach der Umbenennung der Geräteklassen nennt kein gültiger Testfall mehr die Klassen `tablet` oder `handy`.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3c-fuenf-geraeteklassen (PR #32)
grenzfall_von: TF-PRUEF-019
---

## Worum es geht

Seit P0.3c heissen die Klassen `tablet-quer` und `handy-hochkant`. Nennt ein Testfall noch `handy` oder `tablet` als Klasse oder Projekt, muss der Tester den Namen selbst übersetzen. Wörtlich ausgeführt findet `GERAETEKLASSEN.find(k => k.name === 'handy')` nichts, und `--project=handy` bricht ab.

## Bestanden, wenn

Der Suchbefehl aus Schritt 1 findet nur Zeilen in Testfällen mit `status: stillgelegt` (Schritt 2), oder gar keine.

## Fehlgeschlagen, wenn

Der Suchbefehl findet eine Zeile in einem Testfall ohne `status: stillgelegt`.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit |

## Testdaten

Keine.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | alte Klassennamen suchen | ``git grep -nE '`(tablet\|handy)`\|Klasse (tablet\|handy)\b\|, tablet [0-9]\|, handy [0-9]' -- tagebuch/tests/faelle`` | Liste der Treffer |
| 2 | Git Bash im Repo | stillgelegte Testfälle suchen | `git grep -l "status: stillgelegt" -- tagebuch/tests/faelle` | jeder Treffer aus Schritt 1 steht in einer dieser Dateien |
