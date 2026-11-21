---
id: TF-ENGINE-056
titel: Nach dem Zusammenführen der Kartenhilfen (R1) ergeben 400 Partien, 1'500 Zufallszustände und alle Szenarien dieselbe Prüfsumme und dieselben Fehlermeldungen wie auf der Basis cf0b3f1.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/R1-kartenhilfen (PR #74)
---

## Worum es geht

R1 baut nur um: Hilfen, die mehrere Kartendateien kopiert hatten, liegen jetzt an einer Stelle. Am Spiel darf sich dabei nichts ändern, auch keine Fehlermeldung. Das zeigt sich, wenn dieselben Partien und Zustände auf beiden Ständen Schritt für Schritt dasselbe ergeben.

## Bestanden, wenn

Die Prüfsummen `gesamt` und `partienSumme` sind auf beiden Ständen gleich, ebenso alle Zähler. Alle 400 Partien enden mit „Beendet“, keine stösst an die Grenze von 5'000 Schritten, kein Schritt wirft. In den Zufallszuständen wirft keine aufgezählte Aktion und keine Reaktion. Die Meldungslisten `meldungen-*.txt` und `meldungen-woertlich-*.txt` sind auf beiden Ständen Byte für Byte gleich.

## Fehlgeschlagen, wenn

Eine der Prüfsummen oder ein Zähler sich unterscheidet, eine Partie nicht endet, eine Ausnahme gemeldet wird oder `cmp` zwischen den Meldungslisten einen Unterschied findet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`; Basis `cf0b3f1` und Stand `35c1af7` lassen sich nacheinander auschecken |

## Testdaten

Partien: Saaten 1 bis 400, die ersten 200 ohne, die übrigen mit Erweiterung, reihum 2, 3 und 4 Spieler. Gewählt wird mit einem eigenen Zufall aus `saat * 7919 + 13`. Je Schritt gehen in eine SHA-256-Summe ein: die Liste der aufgezählten Aktionen, das Prüfergebnis jeder Aktion, zweimal acht abgewandelte, meist ungültige Aktionen mit ihrem Prüfergebnis, die gewählte Aktion, der gespeicherte Zustand und die Ereignisse. Dazu `zufallszustand` mit Saaten 1 bis 1'500, je Zustand jede aufgezählte Aktion und danach jede Reaktion. Dazu jedes Szenario des Entwicklertischs mit allen Abwandlungen jeder aufgezählten Aktion. Das Prüfskript liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg als `src/entwicklung/zz_r1_pruefer.test.ts` anlegen | Inhalt des Belegs | Datei ist nicht versioniert |
| 2 | Konsole im Repo | auf dem Stand des Branches ausführen | `R1_AUS=<ordner> R1_STAND=35c1af7 npx vitest run src/entwicklung/zz_r1_pruefer.test.ts` | Exit 0, `pruefsumme-35c1af7.json` entsteht |
| 3 | Konsole im Repo | Basis auschecken und wiederholen | `git switch --detach cf0b3f1`, dann wie Schritt 2 mit `R1_STAND=cf0b3f1` | Exit 0 |
| 4 | Konsole im Repo | JSON-Dateien und Meldungslisten vergleichen, zurück auf den Branch, Skript löschen | `diff`, `cmp` | kein Unterschied ausser im Feld `stand` |

## Nicht abgedeckte Grenzfälle

Andere Saaten sind nicht verglichen. Die Abwandlungen in den Partien sind eine Stichprobe, vollständig sind sie nur bei den Szenarien. Dass `nimmAusSchlange` bei einer fremden Karte wirft, prüft TF-ENGINE-057, die Ränder von Baukasten, Schlangenfrass und Farbendieb TF-ENGINE-058.
