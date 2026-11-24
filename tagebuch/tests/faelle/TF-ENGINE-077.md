---
id: TF-ENGINE-077
titel: Partien ohne Erweiterung verlaufen nach X4 Schritt für Schritt wie vorher, mit Zufallsaktionen, Zufalls-KI und solider KI.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

X4 fügt dem Zug das Feld `comebackBedingung` und zwei Aktionen hinzu. Ohne Erweiterung darf sich am Spiel nichts ändern. Die Probe spielt Partien mit eigenen Saaten vor und nach X4 und vergleicht je Partie eine Prüfsumme.

## Bestanden, wenn

Alle 13 Prüfsummen (6 Partien mit Zufallsaktionen, 4 mit der Zufalls-KI, 3 mit der soliden KI) sind auf `origin/neuaufbau` (6c4638c9) und auf 9e253382 gleich, und jede Partie endet.

## Fehlgeschlagen, wenn

Eine Prüfsumme weicht ab oder eine Partie endet nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo, einmal auf 6c4638c9 und einmal auf 9e253382 ausgecheckt |

## Testdaten

Zufallsaktionen Saaten 7301 bis 7306, Zufalls-KI 7401 bis 7404, solide KI 7501 bis 7503, Spielerzahl je `2 + saat % 3`, alle ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probedatei aus dem Beleg als `src/engine/__tests__/x4_pruefer_probe.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | auf 6c4638c9 wechseln und ausführen | `git switch --detach 6c4638c9`, dann `X4_PROBE_ZIEL=<ordner>/basis.txt npx vitest run src/engine/__tests__/x4_pruefer_probe.test.ts` | Exit-Code 0, 13 Zeilen mit Prüfsummen |
| 3 | Konsole | auf 9e253382 wechseln und dasselbe nach `<ordner>/x4.txt` | `git switch pruefung-X4` | Exit-Code 0 |
| 4 | Konsole | beide Dateien vergleichen | `diff basis.txt x4.txt` | keine Ausgabe |
| 5 | Repo | Probedatei löschen |  | `git status` ist leer |

## Technische Prüfung

Bei den Zufallsaktionen fliessen je Schritt die Aktion und der serialisierte Zustand ohne `comebackBedingung` in einen SHA-256, bei den KI-Partien der Verlauf und die Endpunkte aus `spielePartie`.

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung ändern sich mit X4 gewollt; sie prüfen der Dauerlauf und TF-ENGINE-076.
