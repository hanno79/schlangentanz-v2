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
aenderung: task/P0.4-entwicklertisch (PR #27)
---

## Worum es geht

Engine-Tasks liefern Szenarien, die der Prüfer am Tisch lädt. Die Liste muss Beschreibung und erwartetes Verhalten nennen, und ein kaputter Zustand muss rot auffallen, statt den Tisch abstürzen zu lassen.

## Bestanden, wenn

`/dev/szenarien` zeigt „Szenarien (8)“ mit Name, Beschreibung und Erwartung je Zeile. Der Link `spielende` zeigt Zugphase Spielende, keine Knöpfe und „Gewonnen: Spieler 2 (17)“. Der Link `kaputt-doppelte-karte` zeigt „Invarianten (2 verletzt)“: „Jede Spielkarte liegt genau einmal im Spiel – Doppelt: blau-13 (2×)“ und „Der Spielstand übersteht Speichern und Laden unverändert – Die Engine wirft: Ungültiger Spielzustand: Doppelte ID blau-13“, beide in roter Schrift auf rosa Grund; die übrigen 4 grün.

## Fehlgeschlagen, wenn

Ein Szenario fehlt, ein Link zeigt eine Fehlermeldung, im kaputten Szenario ist keine oder eine andere Invariante rot, oder erfüllte Invarianten sind rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 |

## Testdaten

Szenarien `partiebeginn`, `ausspielphase`, `vier-spieler`, `reaktionsfenster`, `zugabschluss`, `endspurt`, `spielende`, `kaputt-doppelte-karte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4174/dev/szenarien` | Tabelle mit 8 Zeilen |
| 2 | Tabelle | Link `endspurt` | | Spielphase Endspurt, Nachziehstapel 0 Karten |
| 3 | Navigation | „Szenarien“, Link `spielende` | | „Gewonnen: Spieler 2 (17)“ |
| 4 | Navigation | „Szenarien“, Link `kaputt-doppelte-karte` | | zwei rote Invarianten wie oben |

## Nicht abgedeckte Grenzfälle

Unbekannter Szenarioname und leerer Name: TF-DEV-005.
