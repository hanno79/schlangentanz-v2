---
id: TF-DEV-004
titel: /dev/szenarien listet alle Szenarien, jedes lädt per Link, und verletzte Invarianten stehen rot da.
art: beides
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/entwicklertisch.hooks.spec.ts
aenderung: task/P0.4-entwicklertisch (PR #27); auf den Stand nach E1 gebracht mit task/E1-struktur (PR #31)
---

## Worum es geht

Engine-Tasks liefern Szenarien, die der Prüfer am Tisch lädt. Die Liste muss Beschreibung und erwartetes Verhalten nennen, und ein kaputter Zustand muss rot auffallen, statt den Tisch abstürzen zu lassen.

## Bestanden, wenn

`/dev/szenarien` zeigt „Szenarien (5)“ mit Name, Beschreibung und Erwartung je Zeile. Der Link `start-erweiterung` zeigt Erweiterung mit, 3 Spieler, 97 Karten im Nachziehstapel und alle 11 Invarianten grün. Der Link `alle-orte` zeigt unter Spieler 1 „Unter farbenfusion-01:“ mit zwei Sonnenblatt-Karten, unter Tischmitte eine Schlangengrube vor KI-Gegner 2 und den Schlangenkorb unter „Aus dem Spiel“, alle 11 Invarianten grün. Der Link `kaputt-doppelte-karte` zeigt „Invarianten (3 verletzt)“: „Jede Spielkarte liegt genau einmal an genau einem Ort – Doppelt: blau-12 (2×).“, „Alle Ids sind eindeutig – Mehrfach vergeben: blau-12.“ und „Der Spielstand übersteht Speichern und Laden unverändert – Die Engine wirft: Ungültiger Spielstand: …“, alle drei in roter Schrift auf rosa Grund; die übrigen 8 grün.

## Fehlgeschlagen, wenn

Eines der Szenarien `start-2`, `start-4`, `start-erweiterung`, `alle-orte`, `kaputt-doppelte-karte` fehlt, ein Link zeigt eine Fehlermeldung, im kaputten Szenario sind andere als die drei genannten Invarianten rot, oder in einem anderen Szenario ist eine Invariante rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 |

## Testdaten

Szenarien `start-2`, `start-4`, `start-erweiterung`, `alle-orte`, `kaputt-doppelte-karte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4174/dev/szenarien` | Tabelle mit 5 Zeilen |
| 2 | Tabelle | Link `start-erweiterung` | | Erweiterung mit, 97 Karten im Nachziehstapel, „Invarianten (alle erfüllt)“ |
| 3 | Navigation | „Szenarien“, Link `alle-orte` | | Fusion, Grube, schwebende Schlangengrube, Schlangenkorb aus dem Spiel, „Invarianten (alle erfüllt)“ |
| 4 | Navigation | „Szenarien“, Link `kaputt-doppelte-karte` | | drei rote Invarianten wie oben |

## Nicht abgedeckte Grenzfälle

Unbekannter Szenarioname und leerer Name: TF-DEV-005.
