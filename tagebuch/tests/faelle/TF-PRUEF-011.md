---
id: TF-PRUEF-011
titel: Ohne Vergleichsstand (unbekannter Ref oder kein git-Repository) bricht npm run check:regeln mit Exit 2 und einer Abhilfe ab.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
grenzfall_von: TF-PRUEF-009
---

## Worum es geht

Findet `check:regeln` den Stand nicht, mit dem es die Ausnahmeliste vergleicht, darf es nicht still grün werden. Es muss abbrechen und sagen, was zu tun ist.

## Bestanden, wenn

Beide Aufrufe enden mit Exit 2. Die Meldung beginnt mit „Die Ausnahmeliste lässt sich nicht mit … vergleichen“ und nennt `git fetch origin`, `--vergleich <ref>` und `--ohne-vergleich`. Mit `--ohne-vergleich` läuft die Prüfung weiter und schreibt „Wachstumsprüfung übersprungen“ in die Ausgabe.

## Fehlgeschlagen, wenn

Ein Aufruf endet mit 0 oder 1, oder die Meldung nennt keine Abhilfe.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, nach `npm ci` |

## Testdaten

Unbekannter Ref `origin/gibt-es-nicht`. Ordner ohne git ausserhalb des Repos, darin nur `scripts/check_regeln_ausnahmen.json` (Kopie) und ein leerer Ordner `src/engine`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Gate mit unbekanntem Ref | `npm run check:regeln -- --vergleich origin/gibt-es-nicht; echo $?` | Exit 2, „keine Merge-Basis von HEAD und „origin/gibt-es-nicht““ |
| 2 | Git Bash | Ordner ohne git anlegen wie in „Testdaten“ | `mkdir -p <tmp>/scripts <tmp>/src/engine`, Liste hineinkopieren | |
| 3 | Git Bash im Repo | Gate gegen diesen Ordner | `node scripts/check_regeln.mjs --wurzel <tmp>; echo $?` | Exit 2, „kein git-Repository unter …“ |
| 4 | Git Bash im Repo | dasselbe mit `--ohne-vergleich` | `node scripts/check_regeln.mjs --wurzel <tmp> --ohne-vergleich; echo $?` | läuft durch; Exit 1 wegen veralteter Merkmale ist hier richtig, weil der Ordner keine Tests hat |
| 5 | Git Bash | Ordner löschen | `rm -rf <tmp>` | |
