---
id: TF-ENGINE-085
titel: Partien ohne Erweiterung verlaufen mit dem Schlangenkorb Zug für Zug wie vorher.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Der Korb gehört zur Erweiterung. Ohne Erweiterung darf sich an keinem Zug und keiner Wahl der KI etwas ändern.

## Bestanden, wenn

Die Prüfsumme über neun eigene Partien ohne Erweiterung ist auf `origin/neuaufbau` und auf X6 gleich, mit gleicher Zahl von Zeilen.

## Fehlgeschlagen, wenn

Prüfsumme oder Zeilenzahl unterscheiden sich.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 6f7ee643 (`origin/neuaufbau`) und auf 14eaa6cb |

## Testdaten

Saaten 88101 bis 88109, 2 bis 4 Spieler (`2 + saat % 3`), bei geraden Saaten die solide KI an Stelle 1, sonst nur Zufalls-KIs; protokolliert werden jede Aktion und der Endzustand (`serialisiere`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `src/ki/strategien/` | Probendatei anlegen | `zz_pruefer_x6_summe.test.ts` (siehe Beleg) | Datei vorhanden |
| 2 | Konsole | auf `origin/neuaufbau` ausführen | `npx vitest run src/ki/strategien/zz_pruefer_x6_summe.test.ts --reporter=verbose` | Zeile „PRUEFSUMME“ |
| 3 | Konsole | auf X6 ausführen | dasselbe | dieselbe Zeile |
| 4 | Konsole | Probendatei löschen | | `git status` leer |

## Nicht abgedeckte Grenzfälle

Golden Master und `solideKi_basis.test.ts` prüfen dasselbe mit anderen Saaten im normalen Testlauf.
