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
aenderung: task/P0.4-entwicklertisch (PR #27)
---

## Worum es geht

Prüfer spielen Engine-Szenarien am Tisch mit echten Klicks nach. Das geht nur, wenn genau die Aktionen der Engine als Knöpfe dastehen und jeder Klick den Zustand sichtbar ändert (Plan P0.4, Kriterium 2). Phasenwechsel sind in der heutigen Engine keine Aktionen und stehen als eigene „Phasenschritte“ da.

## Bestanden, wenn

In `/dev?seed=1&spieler=2` erscheinen nach „Ausspielphase starten“ 3 Knöpfe „Neue Schlange starten mit …“; ein Klick auf den ersten senkt die Hand von Spieler 1 von 5 auf 4 und legt Schlange 1 an. „Ausspielphase beenden“ vor der ersten Karte zeigt rot „Abgelehnt: … erst nach mindestens einer gespielten Karte …“ und lässt den Zustand gleich; nach einer gespielten Karte wechselt die Zugphase auf Aufgabenpruefung. Im Szenario `reaktionsfenster` gibt es genau den Knopf „Verdoppler durchlassen“ für spieler-3; ein Klick verkürzt `verbleibendeSpielerIndizes` von [2,0] auf [0].

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder ist zu viel gegenüber `ermittleLegaleAktionen`/`ermittleReaktionsAktionen`, ein Klick ändert nichts ohne Fehlermeldung, oder eine Ablehnung der Engine verändert den Zustand.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 (`npm run build:testhooks`, `npm run preview:testhooks`) |

## Testdaten

`/dev?seed=1&spieler=2`, `/dev?seed=7&spieler=4`, Szenarien `reaktionsfenster`, `zugabschluss`, `vier-spieler`, `endspurt`, `spielende`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=1&spieler=2` | Knopf „Ausspielphase starten“ | | Zugphase Ausspielphase, „Aktionen der Engine (3)“ |
| 2 | Phasenschritte | „Ausspielphase beenden“ | | rote Meldung „Abgelehnt: …“, Schritt bleibt 1 |
| 3 | Aktionen | ersten Knopf „Neue Schlange starten mit Wasserwirbel“ | | Hand (4), Schlange 1 mit Wasserwirbel |
| 4 | Phasenschritte | „Ausspielphase beenden“ | | Zugphase Aufgabenpruefung, keine rote Meldung |
| 5 | Kopf | „Schritt zurück“, dann „Von vorn“ | | Schritt sinkt, danach Schritt 0 mit Startzustand |
| 6 | `/dev?seed=7&spieler=4` | „Ausspielphase starten“, zweiten Aktionsknopf | | 4 Spieler, Hand von Spieler 1 von 5 auf 4 |
| 7 | `/dev/szenarien` | Link `reaktionsfenster`, Knopf „Verdoppler durchlassen“ | | Reaktionsfenster `VerdopplerAbwehr`, danach verbleibt nur Index 0, Knopf jetzt für spieler-1 |
| 8 | `/dev/szenarien` | Link `zugabschluss`, „Überzählige Handkarten abwerfen“, dann „Zug beenden“ | | erst rote Ablehnung (Hand nicht über Limit), dann Nachziehphase, Spieler 2 am Zug |

## Nicht abgedeckte Grenzfälle

Die Schlangenhäutung zählt die heutige Engine nicht auf; der Tisch zeigt sie nur als Hinweis (TF-DEV-008).
