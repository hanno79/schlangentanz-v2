---
id: TF-KI-025
titel: Nach K2b hängt die Wahl der soliden KI weiterhin nicht von fremden Händen, dem Stapel oder fremden geheimen Aufgaben ab.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/K2b-gleichstand (PR #118)
grenzfall_von: TF-KI-024
---

## Worum es geht

Die neue Regel liest `sichtbarePunkte`, darin die eigene geheime Aufgabe und ob sie erfüllt ist. Das darf nur die eigene sein. Die Probe mischt alles Verdeckte mit einem eigenen Verfahren neu und prüft, dass Sicht und Wahl gleich bleiben (K2.7).

## Bestanden, wenn

In jeder gestörten Stellung ist die Sicht der KI unverändert, und die neue KI wählt mit derselben KI-Saat dieselbe Aktion: 0 Abweichungen.

## Fehlgeschlagen, wenn

Die Sicht ändert sich durch das Mischen, oder die Wahl weicht in mindestens einer Stellung ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem Stand des Task-Branches, Probe wie in TF-KI-024 abgelegt |

## Testdaten

Jede dritte Entscheidung aus den Partien von TF-KI-024. Störung: fremde Hände und Stapel zusammen umgedreht und mit eigenem xorshift-Generator gemischt (Handgrössen bleiben), fremde geheime Aufgaben aus dem umgedrehten Aufgabenstapel neu verteilt, ihr Erfüllt-Status umgekehrt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probe ablegen wie in TF-KI-024, Schritte 1 und 2 |  | drei neue Dateien |
| 2 | Konsole | Probe ausführen | `K2B_AUS=<ordner> npx vitest run src/ki/strategien/zz_pruefer_k2b.test.ts -t "Wahl"` | Exit 0; dass die Sicht gleich bleibt, prüft die Probe selbst mit `expect` |
| 3 | Datei `wahl.json` | `gestoert` und `stoerAbweichung` lesen |  | `gestoert` über 100 je Teil, `stoerAbweichung` 0 |
| 4 | Repo | die Dateien löschen |  | `git status` leer |

## Nicht abgedeckte Grenzfälle

Reaktionen mit Farbenschutz sind nur so oft dabei, wie sie in den Partien vorkommen; eine eigene Auswahl von Abwehrstellungen hat die Prüfung von K3 gemacht.
