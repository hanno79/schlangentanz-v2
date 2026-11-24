---
id: TF-KI-030
titel: Die KI-Ausnahmen wegen des Schlangenkorbs nehmen nur den Korb oder nur Partien mit Erweiterung heraus, und die Zahlen vorher und nachher sind belegt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Seit der Korb wirkt, werden vier KI-Tests in ihrer alten Fassung rot. X6 nimmt in `solideKi_zugende.test.ts` und `solideKi_gleichstand.test.ts` den Korb aus und prüft K2.1 und die Mindestzahl von K3.4 nur noch ohne Erweiterung. Gemessen wird, was jede Ausnahme verdeckt.

## Bestanden, wenn

Die Zahlen auf `origin/neuaufbau`, auf X6 mit den alten Tests und auf X6 mit den Ausnahmen liegen vor, und jede Ausnahme verdeckt nur einen Fall, der zum Korb gehört, oder nimmt nur Partien mit Erweiterung heraus.

## Fehlgeschlagen, wenn

Eine Ausnahme verdeckt einen Fall ohne Korb oder in einer Partie ohne Erweiterung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 6f7ee643 und auf 14eaa6cb |

## Testdaten

Die Partien der vier Testdateien mit ihren Saaten.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Testdateien | Messzeilen `console.log('MESSUNG …')` einfügen | geprüfte Züge, Stellungen, Zugenden | Dateien geändert |
| 2 | Konsole | auf beiden Ständen ausführen | `npx vitest run src/ki/strategien/solideKi.test.ts src/ki/strategien/abwehr.test.ts src/ki/strategien/solideKi_zugende.test.ts --reporter=verbose` | Zeilen „MESSUNG“ |
| 3 | Konsole | auf X6 die alten Testdateien einsetzen und ausführen | `git checkout origin/neuaufbau -- <die vier Dateien>` | welche Tests rot werden und warum |
| 4 | Konsole | zurücksetzen | `git checkout HEAD -- <die vier Dateien>` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Ob die KI den Korb klug nutzt, prüft K4 Kriterium 2.
