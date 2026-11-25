---
id: TF-KI-031
titel: Die solide KI entscheidet eine Abwehrfrage mit und ohne Farbenschutz in weniger als 100 ms, der Mindestpause bei „weniger Bewegung“.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

Bei „weniger Bewegung“ wartet der Tisch vor jedem KI-Schritt nur 100 ms. Rechnet eine KI mit Farbenschutz länger als ohne und länger als diese Pause, sieht man an der Dauer, ob sie einen Farbenschutz hält. Gemessen wird deshalb die Rechenzeit der soliden KI bei Abwehrfragen über viele Fälle.

## Bestanden, wenn

Über alle gemessenen Abwehrfragen bleibt die längste Rechenzeit mit Farbenschutz und die längste ohne Farbenschutz unter 100 ms.

## Fehlgeschlagen, wenn

Mindestens eine Abwehrfrage braucht 100 ms oder länger.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quelltext, Stand ab Commit 5634c28, Node mit Vitest |

## Testdaten

150 ganze Partien (Saaten 9100 bis 9249, 2 bis 4 Spieler, mit und ohne Erweiterung, alle Sitze solide KI aus der Registry, je eigene Saat) und 4'000 Zufallszustände (Saaten 1 bis 4'000), davon jede Stellung, in der jemand über eine angesagte Karte entscheidet.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo, `src/ki/__tests__/` | Messdatei anlegen, wie unter „Technische Prüfung“ beschrieben | | |
| 2 | Konsole | `npx vitest run` über diese Datei | | Test endet mit 0 |
| 3 | Ausgabedatei | Maximum mit und ohne Farbenschutz ablesen | | beide unter 100 ms |
| 4 | Repo | Messdatei wieder löschen | | `git status` sauber |

## Technische Prüfung

Eine nicht eingecheckte Vitest-Datei misst mit `performance.now()` den Aufruf `waehleFuer(zustand, entscheider, ki)`, genau den Aufruf aus `useSpiel`. Mit Farbenschutz heisst: Die Engine bietet mehr als eine Reaktion an. Ausgegeben werden Anzahl, Median, p95, p99 und Maximum je Gruppe.

## Nicht abgedeckte Grenzfälle

Gemessen auf einem Desktop-Rechner in Node; ein langsames Handy rechnet mehrfach länger. Die Zeit für das Zeichnen nach der Wahl gehört nicht zur Rechenzeit der KI.
