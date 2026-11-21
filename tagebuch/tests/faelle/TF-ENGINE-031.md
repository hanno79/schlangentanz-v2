---
id: TF-ENGINE-031
titel: Die 300 Partien des Dauerlaufs verlaufen auf dem Stand von E4b Schritt für Schritt genau wie auf der Basis fb04ba9.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
---

## Worum es geht

E4b soll nur ein Ereignis hinzufügen und nichts am Spiel ändern. Bei gleicher Saat müssen deshalb dieselben Aktionen zu denselben Zuständen führen wie vorher. Eine Prüfsumme über jede gewählte Aktion und jeden gespeicherten Zustand der 300 Dauerlauf-Partien macht das vergleichbar.

## Bestanden, wenn

Die Prüfsumme ist auf beiden Ständen gleich, alle 300 Partien enden („beendet“: 300), und die Zahl der Schritte ist gleich.

## Fehlgeschlagen, wenn

Prüfsumme, Ausgänge oder Schrittzahl sich zwischen den Ständen unterscheiden.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`, geprüfter Stand von `task/E4b-versetzt` und Basis `fb04ba9` auschecken lassen |

## Testdaten

Die Partien des Dauerlaufs: `dauerlaufPartien(150, false)` und `dauerlaufPartien(150, true, 151)`, Saaten 1 bis 300, Motor der Engine. Je Schritt fliessen `JSON.stringify(aktion)` und `JSON.stringify(serialisiere(zustand))` in eine SHA-256-Prüfsumme. Die Prüfdatei liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_determinismus.test.ts` anlegen | Inhalt des Belegs | Datei ist nicht versioniert |
| 2 | Konsole im Repo | auf dem Stand des Branches ausführen | `PRUEF_AUS=<ordner>/branch.txt npx vitest run src/engine/__tests__/zz_pruefer_determinismus.test.ts` | Exit 0, Datei enthält PRUEFSUMME, AUSGAENGE und SCHRITTE |
| 3 | Konsole im Repo | Basis auschecken und wiederholen | `git switch --detach fb04ba9`, dann wie Schritt 2 mit `basis.txt` | Exit 0 |
| 4 | Konsole im Repo | beide Dateien vergleichen, zurück auf den Branch, Prüfdatei löschen | `git switch <branch>` | beide Zeilen gleich |

## Nicht abgedeckte Grenzfälle

Partien mit Karten, die andere Karten versetzen, kommen im Dauerlauf noch nicht vor, weil E5 bis E9 fehlen; bis dahin meldet keine echte Partie ein KartenVersetzt. Andere Saaten als 1 bis 300 sind nicht verglichen.
