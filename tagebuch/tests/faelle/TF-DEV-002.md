---
id: TF-DEV-002
titel: Jede Aktion, die die Engine aufzählt, ist am Entwicklertisch ein Knopf, und ein Klick ändert den Zustand.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/entwicklertisch.hooks.spec.ts
aenderung: task/P0.4-entwicklertisch (PR #27); auf den Stand nach E1 gebracht mit task/E1-struktur (PR #31)
---

## Worum es geht

Prüfer spielen Engine-Szenarien am Tisch mit echten Klicks nach. Das geht nur, wenn genau die Aktionen der Engine als Knöpfe dastehen und jeder Klick den Zustand sichtbar ändert (Plan P0.4, Kriterium 2). Seit E1 gibt es keine Phasenschritte mehr; alles läuft über Aktionen. Nach E1 zählt die Engine aber noch keine Aktion auf, weil alle Karten Platzhalter sind. Bis E2 prüft dieser Testfall deshalb, dass der Tisch das sagt und keinen Knopf selbst baut; E2 trägt die Klicks nach.

## Bestanden, wenn

In `/dev?seed=1&spieler=2`, `/dev?seed=7&spieler=4` und im Szenario `alle-orte` steht „Aktionen der Engine (0)“ mit dem kursiven Satz „Die Engine zählt hier keine Aktion auf. Nach E1 lässt sich eine Partie aufbauen, aber noch nicht spielen; die Aktionen kommen mit E2 und den Kartentasks.“ Es gibt keinen Knopf mit dem Attribut `data-aktion` und keinen Knopf „Ausspielphase starten“. „Schritt zurück“ und „Von vorn“ sind ausgegraut, der Zähler steht auf Schritt 0.

## Fehlgeschlagen, wenn

Ein Aktionsknopf erscheint, obwohl `ermittleAktionen` nichts liefert, ein alter Phasenknopf ist noch da, oder der Satz zur leeren Aufzählung fehlt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 (`npm run build:testhooks`, `npm run preview:testhooks`) |

## Testdaten

`/dev?seed=1&spieler=2`, `/dev?seed=7&spieler=4`, Szenario `alle-orte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev?seed=1&spieler=2` | „Aktionen der Engine (0)“ und der Satz zur leeren Aufzählung |
| 2 | Konsole | Aktionsknöpfe zählen | `document.querySelectorAll('button[data-aktion]').length` | `0` |
| 3 | Kopf | Knöpfe ansehen | | „Schritt zurück“ und „Von vorn“ ausgegraut, Schritt 0, kein „Ausspielphase starten“ |
| 4 | Browser | Adresse öffnen | `/dev?seed=7&spieler=4` | wie Schritt 1 bis 3 |
| 5 | `/dev/szenarien` | Link `alle-orte` | | wie Schritt 1 bis 3, obwohl eine Karte schwebt |

## Nicht abgedeckte Grenzfälle

Klicks auf Aktionsknöpfe, Ablehnungen und „Schritt zurück“ nach einem Klick lassen sich erst prüfen, wenn E2 Aktionen aufzählt; E2 trägt sie hier nach.
