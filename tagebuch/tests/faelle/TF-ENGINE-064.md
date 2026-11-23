---
id: TF-ENGINE-064
titel: War die aufgedeckte Karte die letzte des Stapels und wählt der Gegner danach „stapel“, zieht er nichts, die aufgedeckte Karte kommt auf den Ablagestapel des Auslösers, und keine Karte geht verloren.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Ein leerer Stapel mitten in einer Entscheidung ist ein Grenzfall für Kartenerhaltung, Speichern und den Auslöser der Schlussrunde (A10, D55).

## Bestanden, wenn

Nach dem Aufdecken der letzten Karte steht die Partiephase auf Schlussrunde mit Auslöser 0. Nach Gegnerwahl, Speichern und Laden und der Wahl „stapel“ hält KI-Gegner 1 weiter 5 Karten, `aufgedeckt` ist leer, der Ablagestapel von Spieler 1 ist um genau eine Karte länger, der Auslöser bleibt 0, und alle Invarianten halten.

## Fehlgeschlagen, wenn

Die Engine wirft einen Fehler, eine Karte fehlt oder ist doppelt, oder der Auslöser ändert sich.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 686159e |

## Testdaten

Drei Spieler mit Erweiterung, Spieler 1 hält Test-Karte und Blau, Gegner je fünf Farbkarten, Nachziehstapel eine Karte.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Grenzfalldatei aus dem Beleg als `src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts --reporter=verbose` | Fall „G2“ grün |
| 3 | Repo | Grenzfalldatei löschen |  | `git status` ist leer |

## Technische Prüfung

Vitest-Fall „G2“ mit `verlangeTestwahl`, `entscheidung` aus `rahmen_hilfen.ts` und `deserialisiere(serialisiere(…))` vor der letzten Wahl.

## Nicht abgedeckte Grenzfälle

Keine weiteren; der Fall mit einer Karte nach dem Aufdecken steht in TF-DEV-045.
