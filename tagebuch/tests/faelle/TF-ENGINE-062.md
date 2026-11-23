---
id: TF-ENGINE-062
titel: Die fünf Aufgaben aus Paket B urteilen auf allen kurzen Schlangen und auf 20'000 Zufallsstellungen genau wie eine unabhängige Prüfung, die jede Jokerbelegung durchprobiert, und werden in Zufallspartien eingelöst.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2b-aufgaben-muster (PR #106)
---

## Worum es geht

Die Umsetzung probiert keine Jokerbelegungen durch; der Farbwechsler etwa führt einen Zustandsautomaten. Ein unabhängiges Prüfskript belegt jeden Joker der Reihe nach mit allen sechs Farben und vergleicht sein Urteil mit dem der Engine. Dazu laufen 300 Zufallspartien mit Erweiterung, in denen jede Einlösung nachgeprüft wird.

## Bestanden, wenn

Das Prüfskript meldet bei jedem Vergleich 0 Abweichungen. Verglichen werden beim Farbwechsler alle 6'725'600 Folgen bis Länge 8 aus sechs Farben und der Regenbogenschlange, bei Farbvielfalt und Schlangenbändiger je 960'799 Folgen bis Länge 7, beim Symmetriemeister 12'037'248 Folgen der Länge 7 bis 9 und bei allen fünf je 20'000 Zufallsstellungen mit Blockaden und bis 4 Jokern. Blau, Rot, Gelb, Rot, Grün ist nicht erfüllt. Alle 300 Partien enden mit „beendet“, jede der fünf Aufgaben wird mindestens einmal eingelöst, und nach keiner aufgelösten Aktion bleibt eine erfüllte offene Aufgabe für den Spieler am Zug liegen.

## Fehlgeschlagen, wenn

Das Skript nennt eine Stellung, bei der Umsetzung und Vollbelegung verschieden urteilen. Ebenso, wenn eine Partie nicht beendet wird oder eine Aufgabe eingelöst wird, deren Bedingung danach nicht gilt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`, Stand e028a82c ausgecheckt |

## Testdaten

Die Prüfskripte `zz_pruefer_x2b_bruteforce.test.ts` und `zz_pruefer_x2b_partien.test.ts` liegen den Läufen als Beleg bei. Zufallsstellungen mit der Saat aus Namenslänge mal 7919 plus 13, Partien mit den Saaten 7001 bis 7300, reihum 2, 3 und 4 Spieler.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | beide Prüfskripte aus dem Beleg unter `src/engine/__tests__/` anlegen | Inhalt der Belege | Dateien sind nicht versioniert |
| 2 | Konsole im Repo | Vollbelegung ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_x2b_bruteforce.test.ts --reporter=verbose` | Exit 0, jede Zeile meldet „Abweichungen 0“ |
| 3 | Konsole im Repo | Zufallspartien ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_x2b_partien.test.ts --reporter=verbose` | Exit 0, „Ausgänge {"beendet":300}“, „liegen geblieben []“, jede der fünf Aufgaben mit einer Zahl über 0 |
| 4 | Konsole im Repo | beide Skripte löschen | | `git status` zeigt nichts |

## Nicht abgedeckte Grenzfälle

Die Folgen über alle Längen bis 8 sind nur beim Farbwechsler vollständig durchgezählt, bei den übrigen bis 7 oder 9 Karten und beim Symmetriemeister nur mit vier Farben. Längere Schlangen und die Farbenfusion als Joker deckt nur die Zufallsauswahl ab. Die Prüfung misst gegen die Auslegung der Umsetzung, auch bei Farbvielfalt; ob der Autor sie teilt, ist offen.
