---
id: TF-KI-026
titel: Die solide KI nach K2b spielt nicht schwächer als vor K2b, gemessen in Spiegelpartien gegen die alte KI.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/K2b-gleichstand (PR #118)
---

## Worum es geht

Ein Turnier „neu gegen alt“ allein sagt wenig, weil die Sitzordnung die Plätze ungleich verteilt: Zu viert sitzt die alte KI immer direkt hinter der neuen. Deshalb läuft jede Partie zweimal mit denselben Saaten, einmal mit neu und alt, einmal mit alt und alt. Weicht der Verlauf ab, zählt der Unterschied im Vorsprung von Teilnehmer 0.

## Bestanden, wenn

Der mittlere Unterschied im Vorsprung ist ohne und mit Erweiterung nicht negativ, und gegen die Zufalls-KI gewinnen neu und alt gleich oft.

## Fehlgeschlagen, wenn

Der mittlere Unterschied im Vorsprung ist negativ, oder die neue KI gewinnt gegen die Zufalls-KI seltener als die alte.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem Stand des Task-Branches, Probe wie in TF-KI-024 abgelegt |

## Testdaten

Turniere mit `kiSaat` 424242: 2 Spieler ohne Erweiterung 80 Partien ab Saat 56000; 4 Spieler ohne Erweiterung (neu, alt, Zufall, Zufall gegen alt, alt, Zufall, Zufall) 24 Partien ab 58000; 2 Spieler mit Erweiterung 40 Partien ab 57000; gegen die Zufalls-KI je 60 Partien ab 55000.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probe ablegen wie in TF-KI-024, Schritte 1 und 2 |  | drei neue Dateien |
| 2 | Konsole | Stärke gegen die Zufalls-KI | `K2B_AUS=<ordner> npx vitest run src/ki/strategien/zz_pruefer_k2b.test.ts -t "Spielst"` | in `staerke.json` neu und alt je 60 von 60, mittlere Punkte gleich |
| 3 | Konsole | Spiegelpartien | `K2B_AUS=<ordner> npx vitest run src/ki/strategien/zz_pruefer_k2b.test.ts -t "Kontrolle"` | in `kontrolle.json` je Zeile `gleicheVerlaeufe`, `abweichendeVorspruenge` und die mittlere Differenz |
| 4 | Repo | die Dateien löschen |  | `git status` leer |

## Nicht abgedeckte Grenzfälle

Die Stichprobe ist klein (144 Spiegelpartien). Ein Unterschied von weniger als etwa einem Punkt im Mittel liesse sich damit nicht nachweisen; dafür ist K5 da.
