---
id: TF-KI-027
titel: Der K2.1-Partietest misst den ersten Teilzug nach einer Abwehr nie günstiger, als die KI selbst weitergespielt hätte.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/K2b-gleichstand (PR #118)
grenzfall_von: TF-KI-024
---

## Worum es geht

`geplantesEnde` im K2.1-Partietest spielt die Karten des ersten Teilzugs so nach, als liessen die Gegner alles durch. Nach einer Abwehr stammen die weiteren Karten aber aus der echten Partie. Die Probe prüft, ob diese Näherung den Test schwächer macht: Sie lässt die KI ab der durchgelassenen Karte selbst weiterspielen und vergleicht die Bewertung.

## Bestanden, wenn

Das Nachspielen wirft nie einen Fehler, und in keinem Zug mit Abwehr liegt die Bewertung aus dem Nachspielen über der Bewertung, die die KI beim eigenen Weiterspielen erreicht (drei KI-Saaten).

## Fehlgeschlagen, wenn

Das Nachspielen bricht ab, oder es ergibt in mindestens einem Zug eine höhere Bewertung als das eigene Weiterspielen; dann wäre der Test dort nachsichtiger als die KI.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem Stand des Task-Branches, Probe wie in TF-KI-024 abgelegt |

## Testdaten

Die zehn Partien des K2.1-Partietests (Saat 600 bis 609 mit dessen KI-Saaten), Partie 7154 mit Erweiterung und 16 eigene Partien (Saat 33000 bis 33015, alle Sitze solide KI, mit und ohne Erweiterung).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probe ablegen wie in TF-KI-024, Schritte 1 und 2 |  | drei neue Dateien |
| 2 | Konsole | Probe ausführen | `K2B_AUS=<ordner> npx vitest run src/ki/strategien/zz_pruefer_k2b.test.ts -t "Näherung"` | Exit 0 |
| 3 | Datei `naeherung.json` | Fälle lesen |  | `zuegeMitAbwehr` über 0, bei keinem Fall `replayFehler`, `replay` nie grösser als der grösste Wert unter `frisch` |
| 4 | Repo | die Dateien löschen |  | `git status` leer |

## Nicht abgedeckte Grenzfälle

Welche KI-Saat die KI in der echten Partie an dieser Stelle gehabt hätte, lässt sich im Test nicht nachbauen; deshalb drei Saaten statt der echten.
