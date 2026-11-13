---
id: TF-BUILD-004
titel: Zweimal hintereinander gebaut, räumt der Testhook-Build sein Verzeichnis und liefert dasselbe Bundle.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-12
veraendert_daten: nein
aenderung: task/P0.2-lokale-umgebung (PR #24)
grenzfall_von: TF-BUILD-002
---

## Worum es geht

Playwright baut den Testhook-Build vor jedem Lauf neu. Bleibt dabei Altes in `dist-testhooks/` liegen oder ändert sich das Bundle ohne Codeänderung, misst der Lauf womöglich einen alten Stand. Geprüft wird ein zweiter Build direkt nach dem ersten.

## Bestanden, wenn

Beide Läufe von `npm run build:testhooks` enden mit Exit-Code 0, die vorher abgelegte Datei `dist-testhooks/veraltet.txt` ist danach weg, und der Dateiname `dist-testhooks/assets/index-<hash>.js` ist nach beiden Läufen gleich.

## Fehlgeschlagen, wenn

Der zweite Lauf endet nicht mit 0, `veraltet.txt` liegt noch da, oder der Hash im Dateinamen unterscheidet sich zwischen den Läufen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Arbeitskopie auf dem zu prüfenden Commit, Windows 11, nach `npm ci` und einem ersten `npm run build:testhooks` |

## Testdaten

Datei `dist-testhooks/veraltet.txt` mit beliebigem Inhalt, etwa `stale`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Datei anlegen | `echo stale > dist-testhooks/veraltet.txt` | Datei existiert |
| 2 | dieselbe Konsole | Hash notieren | `ls dist-testhooks/assets` | Name `index-<hash>.js` |
| 3 | dieselbe Konsole | Befehl ausführen | `npm run build:testhooks` | Exit-Code 0 |
| 4 | dieselbe Konsole | Befehl erneut ausführen | `npm run build:testhooks` | Exit-Code 0 |
| 5 | dieselbe Konsole | Verzeichnis ansehen | `ls dist-testhooks dist-testhooks/assets` | keine `veraltet.txt`, `index-<hash>.js` mit demselben Hash wie in Schritt 2 |
