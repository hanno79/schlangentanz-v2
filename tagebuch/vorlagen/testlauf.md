---
testfall: <ID des Testfalls, etwa TF-MOD-012>
datum: <JJJJ-MM-TT der Durchführung>
zeit: <HH:MM der Durchführung>
wer: <Name des Menschen, Name des Agenten wie Claude Code, oder Skript>
ausfuehrung: <mensch, agent oder skript>
status: <bestanden, fehlgeschlagen, unklar, blockiert oder uebersprungen>
commit: <volle Commit-ID des geprüften Stands>
branch: <Name des Branches>
sauber: <nur wenn ausserhalb von tagebuch/ nicht committete Änderungen lagen: nein; sonst Zeile löschen>
datenstand: <optional: Datenstand, mit dem geprüft wurde; sonst Zeile löschen>
browser: <optional: Browser und Version; sonst Zeile löschen>
durchgang: <optional: ID des Durchgangs, etwa D-014; sonst Zeile löschen>
fehler: <optional: Kennung oder URL des Fehlers; sonst Zeile löschen>
belege: <bei fehlgeschlagen Pflicht, sonst optional: Dateinamen unter tests/belege/, durch Komma getrennt; sonst Zeile löschen>
eintrag: <optional: Dateiname des Tagebucheintrags des Arbeitsschritts, in dem getestet wurde; sonst Zeile löschen>
---

## Tatsächliches Ergebnis

<Was beobachtet wurde, mit Zahlen.>

## Unklar

<Nur bei unklar, sonst Abschnitt samt Unterabschnitten löschen.>

### Was ist unklar

<Was sich nicht eindeutig beurteilen liess.>

### Was fehlt

<Was zur Klärung fehlt und wer entscheiden kann.>

## Grund

<Nur bei blockiert oder uebersprungen, sonst Abschnitt löschen: warum der Test nicht lief.>
